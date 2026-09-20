import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { ecosystem, identities, companyPath, organizationRoles } from '../../lib/ecosystem'
import { companyContext, companySummary, companyResearchDate, companyEdition, companySourceTitle } from '../../lib/company-directory'
import { toBengaliDigits } from '../../lib/media'
import { domain, sourceDate, workStages } from '../../lib/ecosystem-model'
import type { OrganizationRelationship } from '../../lib/shared-identity'
import type { Locale } from './types'
import { localPath, number } from './model'
import { ideaPath, relatedIdeasPath } from '../../lib/idea-routes.mjs'
import IdeaShell from './IdeaShell'
import IdeaIcon from './IdeaIcon'
import CompanyMark from './CompanyMark'
import CompanyBack from './CompanyBack'
import './companies.css'

export default function CompanyProfile({ locale, id }: { locale: Locale; id: string }) {
  const company = ecosystem.organizations.find(item => item.id === id || item.slug === id)
  if (!company) notFound()
  const digits = (value: string | number) => locale === 'en' ? String(value) : toBengaliDigits(String(value))
  const en = locale === 'en', c = company[locale], profile = company.profile
  const { startup, investor, caseStudy } = companyContext(company, locale)
  const affiliations = identities.peopleAt(company.id)
  const relationships = identities.relationships(company.id)
  const connections = ecosystem.connections.filter(item => item.organizationId === company.id).flatMap(connection => { const problem = ecosystem.problems.find(item => item.id === connection.problemId); return problem ? [{ problem, connection }] : [] })
  type Source = { title:string; url:string; publishedOn?:string|null; checkedAt?:string; researchDate?:string }
  const sources: Source[] = []
  function register(s: Source) { const key = sources.findIndex(x=>x.url===s.url&&x.publishedOn===s.publishedOn&&x.checkedAt===s.checkedAt&&x.researchDate===s.researchDate); if(key>=0)return key+1; sources.push(s);return sources.length }
  function citations(rows:Source[]) { return <span className="companies-citations">{rows.map(s=>{const n=register(s);return <a key={`${s.url}-${n}`} href={`#company-source-${n}`} aria-label={`${en?'Source':'সোর্স'} ${number(n,locale)}`}>[{number(n,locale)}]</a>})}</span> }
  const editorialSources=(urls:string[])=>urls.map(url=>({title:companySourceTitle(url),url,researchDate:companyResearchDate}))
  const sections: {id:string;title:string;body:ReactNode}[]=[]
  const add=(sectionId:string,title:string,body:ReactNode)=>sections.push({id:sectionId,title,body})
  if(profile) for(const s of profile.sections) add(s.id,s.title[locale],<><p>{s.body[locale]} {citations(s.sources)}</p>{s.links.length>0&&<div className="companies-actions">{s.links.map(l=><a key={l.url} href={l.url}>{l.label[locale]}<IdeaIcon name="external"/></a>)}</div>}</>)
  if(startup) add('background',en?'Company background':'কোম্পানির পেছনের গল্প',<p>{startup.background[locale]} {citations(editorialSources(startup.background.sources))}</p>)
  if(investor) add('investment-focus',en?'Investment focus':'বিনিয়োগের ধরন',<><dl className="companies-facts-inline"><div><dt>{en?'Stages':'পর্যায়'}</dt><dd>{investor[locale].stage.join(' · ')}</dd></div><div><dt>{en?'Sectors':'খাত'}</dt><dd>{investor[locale].sectors.join(' · ')}</dd></div><div><dt>{en?'Published cheque size':'প্রকাশিত বিনিয়োগের পরিমাণ'}</dt><dd>{investor[locale].chequeSize}</dd></div></dl><p>{investor[locale].applicationPath} {citations(investor.sourceUrls.map(url=>({url,title:`${investor[locale].name} - ${en?'investor information':'বিনিয়োগের তথ্য'}`,checkedAt:investor.lastVerified})))}</p></>)
  if(startup||caseStudy||investor) add('learn',en?'Explore on Deshi Startup':'Deshi Startup-এ আরও জানুন',<div className="companies-learning">{caseStudy&&<a className="companies-learning-title" href={caseStudy}>{en?`Read the ${c.name} case study`:`${c.name}-এর কেস স্টাডি পড়ুন`}<IdeaIcon name="arrow"/></a>}{startup&&<><p>{startup.lesson[locale]}</p><a href={localPath(locale,`/startup-50#${startup.slug}`)}>{en?`Why it is in Startup 50, ${companyEdition}`:`স্টার্টআপ ৫০, ${digits(companyEdition)}-এ কেন আছে`}<IdeaIcon name="arrow"/></a></>}{investor&&<a href={localPath(locale,'/directory/investors')}>{en?'Compare investors in the directory':'ডিরেক্টরিতে বিনিয়োগকারীদের তুলনা করুন'}<IdeaIcon name="arrow"/></a>}</div>)
  if(affiliations.length) add('people',en?'Founders & people':'ফাউন্ডার ও দায়িত্বে থাকা মানুষ',<><p className="companies-section-note">{en?'Roles are shown as described by the dated sources.':'নিচের দায়িত্বগুলো সংশ্লিষ্ট তারিখের সোর্স অনুযায়ী দেওয়া হয়েছে।'}</p><dl className="companies-people">{affiliations.map(a=>{const person=ecosystem.identities?.people.find(p=>p.id===a.personId);return person&&<div key={a.id}><dt>{locale==='bn'&&person.nameBn?person.nameBn:person.displayName}</dt><dd>{a.title[locale]||a.title.en||a.role}<span>{en?'As of ':'তথ্যের তারিখ: '}{sourceDate(a.asOf,locale)}{a.endedOn&&` · ${en?'Ended':'শেষ'} ${sourceDate(a.endedOn,locale)}`} {citations(a.sources)}</span></dd></div>})}</dl></>)
  const relationshipLabel=(r:OrganizationRelationship)=>{
    const outgoing=r.subjectId===company.id
    const labels:Record<OrganizationRelationship['kind'],[string,string,string,string]>={
      'parent-of':['Parent of','Part of','মূল প্রতিষ্ঠান','যে গ্রুপের অংশ'],
      'invested-in':['Invested in','Investment from','বিনিয়োগ করেছে','বিনিয়োগ পেয়েছে'],
      'portfolio-mention':['Listed in its portfolio','Listed in the portfolio of','পোর্টফোলিওতে আছে','যাদের পোর্টফোলিওতে আছে'],
      accelerated:['Accelerated','Accelerated by','অ্যাক্সেলারেটর সহায়তা দিয়েছে','অ্যাক্সেলারেটর সহায়তা পেয়েছে'],
      'grant-funded':['Grant support to','Grant support from','অনুদান দিয়েছে','অনুদান পেয়েছে'],
      sponsored:['Sponsored','Sponsored by','স্পনসর করেছে','স্পনসর'],
      'partnered-with':['Partnered with','Partnered with','সংশ্লিষ্ট পার্টনার','সংশ্লিষ্ট পার্টনার']}
    return labels[r.kind][(en?0:2)+(outgoing?0:1)]
  }
  if(relationships.length) add('relationships',en?'Organization connections':'প্রতিষ্ঠানের সঙ্গে সম্পর্ক',<><div className="companies-connections">{relationships.map(r=>{const other=ecosystem.organizations.find(o=>o.id===(r.subjectId===company.id?r.objectId:r.subjectId));return other&&<div key={r.id}><CompanyMark company={other} locale={locale}/><div><p>{relationshipLabel(r)}</p><h3><a href={companyPath(locale,other.slug)}>{other[locale].name}<IdeaIcon name="arrow"/></a></h3><small>{en?'As of ':'তথ্যের তারিখ: '}{sourceDate(r.asOf,locale)} {citations(r.sources)}</small></div></div>})}</div>{relationships.some(r=>r.kind==='portfolio-mention')&&<p className="companies-section-note">{en?'A portfolio listing alone does not establish a direct investment, its amount or current ownership.':'শুধু পোর্টফোলিওতে নাম থাকা থেকে সরাসরি বিনিয়োগ, তার পরিমাণ বা বর্তমান মালিকানা নিশ্চিত হওয়া যায় না।'}</p>}</>)
  if(startup) add('funding',en?'Reported financing':'অর্থায়নের প্রকাশিত তথ্য',<><p>{startup.financing[locale]} {startup.financing.url&&citations(editorialSources([startup.financing.url]))}</p><p className="companies-section-note">{en?'Dated editorial research; this is not a complete funding ledger or a current valuation.':'এটি নির্দিষ্ট সময়ের গবেষণা। সব বিনিয়োগের পূর্ণ হিসাব বা বর্তমান ভ্যালুয়েশন এখানে দেওয়া হয়নি।'}</p></>)
  if(connections.length) add('related-work',en?'Related ideas & work':'সংশ্লিষ্ট আইডিয়া ও কাজ',<>{connections.map(({problem,connection})=><article className="ideas-connected-problem" key={connection.id}><span className="ideas-stage">{workStages[connection.stage][locale]}</span><h3><a href={relatedIdeasPath(locale,problem.id)}>{problem[locale].title}<IdeaIcon name="arrow"/></a></h3><p>{connection[locale]} {citations([{url:connection.evidenceUrl,title:en?'Published work and context':'প্রকাশিত কাজের তথ্য',checkedAt:connection.reviewedAt.slice(0,10)}])}</p></article>)}</>)
  if(profile?.contact) { const contact=profile.contact; add('contact',en?'Office & contact':'অফিস ও যোগাযোগ',<>{contact.address&&<p>{contact.address[locale]}</p>}<div className="companies-actions">{contact.email&&<a href={`mailto:${contact.email}`}>{contact.email}<IdeaIcon name="arrow"/></a>}{contact.phone&&<a href={`tel:${contact.phone.replace(/[^+0-9]/g,'')}`}>{en?'Support: ':'সহায়তা: '}{digits(contact.phone)}</a>}</div>{citations(contact.sources)}</>) }
  for(const url of company.sourceUrls) if(!sources.some(s=>s.url===url))register({url,title:url===company.website?`${c.name} - ${en?'official website':'নিজস্ব ওয়েবসাইট'}`:companySourceTitle(url),...(company.sourceDate?{researchDate:company.sourceDate}:{})})
  return <IdeaShell locale={locale}><article className="companies-profile">
    <CompanyBack locale={locale}/><header className="companies-profile-heading"><div className="companies-profile-identity"><CompanyMark company={company} locale={locale}/><div><h1>{c.name}</h1><p>{startup?.sector[locale]||investor?.[locale].type||company.roles.map(r=>organizationRoles[r][locale]).join(' · ')}</p></div></div><p className="companies-profile-intro">{companySummary(company,locale).description}</p><a className="ideas-inline-link" href={company.website}>{en?'Official website':'নিজস্ব ওয়েবসাইট'}<IdeaIcon name="external"/></a></header>
    <div className="companies-profile-grid"><div className="companies-profile-body">{sections.map(s=><section key={s.id} id={s.id} className="companies-section"><h2>{s.title}</h2>{s.body}</section>)}<section id="sources" className="companies-section"><h2>{en?'Sources & dates':'সোর্স ও তারিখ'}</h2><p className="companies-section-note">{en?'Publication, source checks and editorial research dates are listed separately.':'প্রকাশের তারিখ, সোর্স যাচাইয়ের তারিখ ও গবেষণার তারিখ আলাদা করে দেওয়া আছে।'}</p><ol className="companies-sources">{sources.map((s,i)=><li id={`company-source-${i+1}`} key={`${s.url}-${i}`}><a href={s.url}>{s.title}<IdeaIcon name="external"/></a><span>{s.publishedOn&&`${en?'Published':'প্রকাশ'}: ${sourceDate(s.publishedOn,locale)} · `}{s.checkedAt?`${en?'Source checked':'সোর্স দেখা হয়েছে'}: ${sourceDate(s.checkedAt,locale)}`:s.researchDate?`${en?'Editorial research':'গবেষণা'}: ${sourceDate(s.researchDate,locale)}`:en?'Linked source':'সংশ্লিষ্ট সোর্স'}</span></li>)}</ol></section></div>
    <aside className="companies-profile-aside"><section><h2>{en?'At a glance':'এক নজরে'}</h2><dl><div><dt>{en?'Organization':'প্রতিষ্ঠানের ধরন'}</dt><dd>{company.roles.map(r=>organizationRoles[r][locale]).join(' · ')}</dd></div>{startup&&<div><dt>{en?'Collection':'সংকলন'}</dt><dd>{en?'Startup 50':'স্টার্টআপ ৫০'} · {digits(companyEdition)}</dd></div>}<div><dt>{en?'Website':'ওয়েবসাইট'}</dt><dd><a href={company.website}>{domain(company.website)}</a></dd></div></dl></section><nav aria-label={en?'On this page':'এই পাতায়'}><h2>{en?'On this page':'এই পাতায়'}</h2>{sections.map(s=><a key={s.id} href={`#${s.id}`}>{s.title}</a>)}<a href="#sources">{en?'Sources & dates':'সোর্স ও তারিখ'}</a></nav><div className="companies-profile-contribute"><a href={`${ideaPath(locale,'add-company')}?company=${encodeURIComponent(company.id)}`}>{en?'Add their work':'কাজের তথ্য যোগ করুন'}<IdeaIcon name="plus"/></a><a href={localPath(locale,'/contact')}>{en?'Suggest a correction':'ভুল থাকলে জানান'}<IdeaIcon name="arrow"/></a></div></aside>
    </div></article></IdeaShell>
}
