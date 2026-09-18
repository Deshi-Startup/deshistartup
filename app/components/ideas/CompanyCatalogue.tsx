'use client'
import { useMemo, useRef, useState } from 'react'
import type { Locale } from './types'
import type { OrganizationRole } from '../../lib/ecosystem-types'
import { companyPath, organizationRoles } from '../../lib/ecosystem-model'
import { domain } from '../../lib/ecosystem-model'
import { number } from './model'
import IdeaShell from './IdeaShell'
import IdeaIcon from './IdeaIcon'

type CompanySummary = { id: string; slug: string; name: string; description: string; roles: OrganizationRole[]; website: string; logo: string | null; search: string }
export default function CompanyCatalogue({ locale, companies }: { locale: Locale; companies: CompanySummary[] }) {
  const en = locale === 'en', searchRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState(''), [role, setRole] = useState('')
  const results = useMemo(() => { const words = query.toLocaleLowerCase().normalize('NFC').trim().split(/\s+/).filter(Boolean); return companies.filter(company => (!role || company.roles.includes(role as OrganizationRole)) && words.every(word => `${company.name} ${domain(company.website)} ${company.search}`.toLocaleLowerCase().normalize('NFC').includes(word))) }, [companies, query, role])
  function clear() { setQuery(''); setRole(''); searchRef.current?.focus() }
  return <IdeaShell locale={locale}>
    <div className="ideas-catalogue-intro"><div><h1>{en ? 'Companies' : 'কোম্পানি'}</h1><p className="ideas-lead">{en ? 'Find startups and investors in Bangladesh. See what they do and read their stories.' : 'বাংলাদেশের স্টার্টআপ ও বিনিয়োগকারীদের খুঁজুন। তাদের কাজ ও গল্প জানুন।'}</p></div></div>
    <div className="ideas-filters ideas-company-filters" role="search" aria-label={en ? 'Search companies' : 'কোম্পানি খুঁজুন'}><label className="ideas-search"><span className="ideas-sr-only">{en ? 'Search companies' : 'কোম্পানি খুঁজুন'}</span><IdeaIcon name="search" /><input ref={searchRef} type="search" maxLength={120} value={query} onChange={event => setQuery(event.target.value)} placeholder={en ? 'Search companies…' : 'কোম্পানি খুঁজুন…'} /></label><label className="ideas-select"><span>{en ? 'Company type' : 'কোম্পানির ধরন'}</span><select value={role} onChange={event => setRole(event.target.value)}><option value="">{en ? 'All types' : 'সব ধরন'}</option>{Object.entries(organizationRoles).filter(([value]) => companies.some(company => company.roles.includes(value as OrganizationRole))).map(([value, label]) => <option key={value} value={value}>{label[locale]}</option>)}</select></label></div>
    <div className="ideas-results-toolbar"><h2 className="ideas-result-count" aria-live="polite">{number(results.length, locale)} {en ? (results.length === 1 ? 'profile' : 'profiles') : 'টি প্রোফাইল'}</h2>{(query || role) && <button className="ideas-text-button ideas-clear" type="button" onClick={clear}>{en ? 'Clear filters' : 'ফিল্টার সরান'}</button>}</div>
    {results.length ? <div className="ideas-company-list">{results.map(company => <article className="ideas-company-row" key={company.id}><span className="company-mark" aria-hidden="true">{company.logo ? <img src={company.logo} alt="" role="presentation" width={64} height={64} loading="lazy" /> : company.name.slice(0, 1)}</span><div className="ideas-company-row-copy"><p className="ideas-eyebrow">{company.roles.map(value => organizationRoles[value][locale]).join(' · ')}</p><h3><a href={companyPath(locale, company.slug)}>{company.name}<IdeaIcon name="arrow" /></a></h3><p>{company.description}</p><a className="ideas-company-domain" href={company.website}>{domain(company.website)}<IdeaIcon name="external" /></a></div></article>)}</div> : <div className="ideas-empty"><IdeaIcon name="search" /><h3>{en ? 'No matching companies.' : 'মিলে যায় এমন কোম্পানি পাওয়া যায়নি।'}</h3><button className="ideas-button ideas-button-secondary" type="button" onClick={clear}>{en ? 'Clear filters' : 'ফিল্টার সরান'}</button></div>}
    <p className="ideas-catalogue-note">{en ? 'This list is growing. Being listed does not mean we recommend a company.' : 'শুরুর তালিকাটি ছোট। প্রোফাইল কোম্পানির তথ্য দেয়; এটি কোনো সুপারিশ নয়।'}</p>
  </IdeaShell>
}
