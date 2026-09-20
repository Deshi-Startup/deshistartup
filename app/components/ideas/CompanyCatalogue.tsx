'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Locale } from './types'
import { companyPath, organizationRoles } from '../../lib/ecosystem-model'
import type { OrganizationRole } from '../../lib/ecosystem-types'
import { companyFilterQuery, emptyCompanyFilters, matchesCompany, readCompanyFilters, type CompanyFilters } from '../../lib/company-filters'
import { number } from './model'
import IdeaShell from './IdeaShell'
import IdeaIcon from './IdeaIcon'
import './companies.css'

type CompanySummary = { id:string; slug:string; name:string; description:string; roles:OrganizationRole[]; website:string; logo:string|null; search:string; sector:string; sectorLabel:string; startup50:boolean; caseStudy:string|null }
export default function CompanyCatalogue({locale, companies, sectors}: {locale:Locale; companies:CompanySummary[]; sectors:{id:string;label:string}[]}) {
  const en = locale === 'en', searchRef = useRef<HTMLInputElement>(null)
  const [filters,setFilters] = useState(emptyCompanyFilters)
  useEffect(() => { const restore = () => setFilters(readCompanyFilters(window.location.search)); restore(); window.addEventListener('popstate',restore); return () => window.removeEventListener('popstate',restore) }, [])
  function update(next:CompanyFilters) { setFilters(next); window.history.replaceState(window.history.state,'',`${window.location.pathname}${companyFilterQuery(next)}${window.location.hash}`) }
  function clear() { update(emptyCompanyFilters); searchRef.current?.focus() }
  const results = useMemo(() => companies.filter(c => matchesCompany(c, filters)), [companies,filters])
  const query = companyFilterQuery(filters)
  const profilePath = (slug:string) => `${companyPath(locale,slug)}${query ? `?return=${encodeURIComponent(query)}` : ''}`
  return <IdeaShell locale={locale}><div className="companies-directory">
    <div className="companies-intro"><h1>{en?'Companies':'কোম্পানি'}</h1><p>{en?'Explore Bangladesh’s companies, their products, people and stories.':'বাংলাদেশের কোম্পানি, তাদের প্রোডাক্ট, মানুষ ও কাজের গল্প জানুন।'}</p></div>
    <div className="companies-filters" role="search" aria-label={en?'Find companies':'কোম্পানি খুঁজুন'}>
      <label className="companies-search"><span className="ideas-sr-only">{en?'Search companies':'কোম্পানি খুঁজুন'}</span><IdeaIcon name="search"/><input ref={searchRef} type="search" maxLength={120} value={filters.q} onChange={e=>update({...filters,q:e.target.value})} placeholder={en?'Search by name, sector or what they do':'নাম, খাত বা কাজ দিয়ে খুঁজুন'}/></label>
      <label><span>{en?'Organization':'প্রতিষ্ঠানের ধরন'}</span><select value={filters.type} onChange={e=>update({...filters,type:e.target.value})}><option value="">{en?'All types':'সব ধরন'}</option>{Object.entries(organizationRoles).filter(([id])=>companies.some(c=>c.roles.includes(id as OrganizationRole))).map(([id,label])=><option key={id} value={id}>{label[locale]}</option>)}</select></label>
      <label><span>{en?'Sector':'খাত'}</span><select value={filters.sector} onChange={e=>update({...filters,sector:e.target.value})}><option value="">{en?'All sectors':'সব খাত'}</option>{sectors.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
    </div>
    <div className="companies-toolbar"><p role="status">{number(results.length,locale)}{en?(results.length===1?' organization':' organizations'):'টি প্রতিষ্ঠান'}</p><label><input type="checkbox" checked={filters.ds50} onChange={e=>update({...filters,ds50:e.target.checked})}/>{en?'Startup 50':'স্টার্টআপ ৫০'}</label><label><input type="checkbox" checked={filters.caseStudy} onChange={e=>update({...filters,caseStudy:e.target.checked})}/>{en?'Has a case study':'কেস স্টাডি আছে'}</label>{query&&<button className="ideas-text-button" onClick={clear}>{en?'Clear filters':'ফিল্টার সরান'}</button>}<span className="companies-sort">{en?'A–Z':'নাম অনুযায়ী'}</span></div>
    {results.length?<div className="companies-gallery">{results.map(c=><article className="companies-card" key={c.id}><div className="companies-card-identity"><span className="company-mark" aria-hidden="true">{c.logo?<img src={c.logo} alt="" role="presentation" width={64} height={64} loading="lazy"/>:c.name.slice(0,1)}</span><div><h2><a href={profilePath(c.slug)}>{c.name}</a></h2><p>{c.sectorLabel||c.roles.map(r=>organizationRoles[r][locale]).join(' · ')}</p></div></div><p className="companies-card-description">{c.description}</p><div className="companies-card-bottom"><span>{c.caseStudy?(en?'Case study available':'কেস স্টাডি আছে'):c.startup50?(en?'Startup 50 · 2026':'স্টার্টআপ ৫০ · ২০২৬'):c.roles.includes('investor')?(en?'Investor profile':'বিনিয়োগকারীর প্রোফাইল'):(en?'Company profile':'কোম্পানির প্রোফাইল')}</span><a href={profilePath(c.slug)} aria-label={en?`Explore ${c.name}`:`${c.name} সম্পর্কে জানুন`}><IdeaIcon name="arrow"/></a></div></article>)}</div>:<div className="ideas-empty"><h2>{en?'No matching organizations':'মিলে যায় এমন প্রতিষ্ঠান পাওয়া যায়নি'}</h2><p>{en?'Try a shorter search or remove a filter.':'কম শব্দ দিয়ে খুঁজে দেখুন বা ফিল্টার সরিয়ে নিন।'}</p><button className="ideas-button ideas-button-secondary" onClick={clear}>{en?'Clear filters':'ফিল্টার সরান'}</button></div>}
    <p className="companies-note">{en?'An evolving directory of companies and investors. Inclusion is not an endorsement. Research dates and sources are available on each profile.':'কোম্পানি ও বিনিয়োগকারীদের এই তালিকা নিয়মিত বড় হচ্ছে। তালিকায় থাকা মানে সুপারিশ নয়। প্রতিটি প্রোফাইলে গবেষণার তারিখ ও সোর্স দেখে নিতে পারেন।'}</p>
  </div></IdeaShell>
}
