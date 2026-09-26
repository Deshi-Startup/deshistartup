import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {publicCompanyProfile,validateCompanyProfile} from './lib/company-profile.mjs'
const source={title:'Official site',url:'https://example.com/',checkedAt:'2026-09-20',publishedOn:null}
const text={en:'Example',bn:'উদাহরণ'}
const profile={sections:[{id:'products',title:text,body:text,sources:[source],links:[]}],contact:{address:null,email:'hello@example.com',phone:null,sources:[source]}}
test('profile export strips private nested fields',()=>{
 const p=structuredClone(profile);p.note='private';p.sections[0].sources[0].privateNote='secret';p.contact.owner='private'
 assert.deepEqual(publicCompanyProfile(p),profile)
})
test('profile requires bilingual evidence and safe links',()=>{
 const p=structuredClone(profile);p.sections[0].body.bn='';assert.throws(()=>validateCompanyProfile(p))
 const x=structuredClone(profile);x.sections[0].links=[{label:text,url:'javascript:alert(1)'}];assert.throws(()=>validateCompanyProfile(x))
 const y=structuredClone(profile);y.sections[0].id='sources';assert.throws(()=>validateCompanyProfile(y))
})
test('every Startup 50 and investor record has a unique shared company identity',()=>{
 const snapshot=JSON.parse(fs.readFileSync('data/ecosystem/public.json'))
 const entries=JSON.parse(fs.readFileSync('data/startup-50.json')).entries
 const investors=JSON.parse(fs.readFileSync('data/directory/investors.json'))
 for(const [namespace,ids] of [['startup-50',entries.map(e=>e.slug)],['directory',investors.map(e=>'investors/'+e.id)]])for(const id of ids){const refs=snapshot.identities.references.filter(r=>r.namespace===namespace&&r.externalId===id);assert.equal(refs.length,1,id);assert.ok(snapshot.organizations.some(o=>o.id===refs[0].organizationId))}
 for(const organization of snapshot.organizations.filter(o=>o.profile)) validateCompanyProfile(organization.profile)
 assert.notEqual(snapshot.identities.references.find(r=>r.externalId==='investors/bangladesh-angels-network').organizationId,snapshot.identities.references.find(r=>r.externalId==='investors/bangladesh-women-investors-network').organizationId)
})

test('catalogue review covers every existing organization with evidenced bilingual profiles and explicit gaps',()=>{
 const snapshot=JSON.parse(fs.readFileSync('data/ecosystem/public.json'))
 const review=JSON.parse(fs.readFileSync('data/research/company-coverage.json'))
 const rows=review.organizations
 assert.equal(new Set(rows.map(r=>r.organizationId)).size,rows.length)
 assert.deepEqual(rows.map(r=>r.organizationId).sort(),snapshot.organizations.map(o=>o.id).sort())
 for(const row of rows){
  const company=snapshot.organizations.find(o=>o.id===row.organizationId)
  assert.equal(company.slug,row.slug)
  validateCompanyProfile(company.profile)
  assert.ok(['enriched','source-limited','previously-enriched'].includes(row.status),row.slug)
  assert.ok(row.sourceUrls.length && row.evidenceNotes,row.slug)
  assert.ok(Array.isArray(row.remainingGaps),row.slug)
  for(const section of company.profile.sections){
   for(const source of section.sources) assert.ok(row.sourceUrls.includes(source.url),`${row.slug}: missing section evidence`)
  }
  for(const personId of row.addedPeople){
   const person=snapshot.identities.people.find(p=>p.id===personId)
   const affiliation=snapshot.identities.affiliations.find(a=>a.personId===personId&&a.organizationId===company.id)
   assert.ok(person && affiliation,`${row.slug}: missing professional role`)
   assert.ok(affiliation.sources.length && affiliation.title.en && affiliation.title.bn)
   assert.equal(affiliation.startedOn,null,'Source check date must not become an employment start date')
   assert.ok(affiliation.sources.every(s=>row.sourceUrls.includes(s.url)))
  }
 }
 const portfolios=snapshot.identities.organizationRelationships.filter(r=>r.id.startsWith('catalogue-portfolio_'))
 assert.ok(portfolios.length)
 assert.ok(portfolios.every(r=>r.kind==='portfolio-mention' && r.startedOn===null && r.endedOn===null))
})
