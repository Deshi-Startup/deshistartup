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
 assert.equal(snapshot.organizations.filter(o=>o.profile).length,3)
 assert.notEqual(snapshot.identities.references.find(r=>r.externalId==='investors/bangladesh-angels-network').organizationId,snapshot.identities.references.find(r=>r.externalId==='investors/bangladesh-women-investors-network').organizationId)
})
