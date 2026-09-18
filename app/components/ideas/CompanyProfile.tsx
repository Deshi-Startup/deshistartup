import { notFound } from 'next/navigation'
import { ecosystem, companyPath, organizationRoles } from '../../lib/ecosystem'
import { domain, sourceDate, workStages } from '../../lib/ecosystem-model'
import type { Locale } from './types'
import { localPath, number } from './model'
import { ideaPath, relatedIdeasPath } from '../../lib/idea-routes.mjs'
import IdeaShell from './IdeaShell'
import IdeaIcon from './IdeaIcon'
import CompanyMark from './CompanyMark'

export default function CompanyProfile({ locale, id }: { locale: Locale; id: string }) {
  const company = ecosystem.organizations.find(item => item.id === id || item.slug === id)
  if (!company) notFound()
  const en = locale === 'en', c = company[locale]
  const connections = ecosystem.connections.filter(item => item.organizationId === company.id).flatMap(connection => { const problem = ecosystem.problems.find(item => item.id === connection.problemId); return problem ? [{ problem, connection }] : [] })
  return <IdeaShell locale={locale}>
    <a className="ideas-back" href={companyPath(locale)}><IdeaIcon name="back" />{en ? 'All companies' : 'সব কোম্পানি'}</a>
    <div className="ideas-company-profile-heading"><CompanyMark company={company} locale={locale} /><div><p className="ideas-eyebrow">{company.roles.map(role => organizationRoles[role][locale]).join(' · ')}</p><h1>{c.name}</h1><a className="ideas-inline-link" href={company.website}>{domain(company.website)}<IdeaIcon name="external" /></a></div></div>
    <p className="ideas-company-description">{c.description}</p>
    <div className="ideas-profile-grid"><div className="ideas-profile-main">
      {connections.length > 0 && <section className="ideas-detail-section" aria-labelledby="related-problems"><div className="ideas-section-heading"><h2 id="related-problems">{en ? 'Related work' : 'সংশ্লিষ্ট কাজ'} <span className="ideas-count">{number(connections.length, locale)}</span></h2></div><div>{connections.map(({ problem, connection }) => <article className="ideas-connected-problem" key={connection.id}><span className="ideas-stage">{workStages[connection.stage][locale]}</span><h3><a href={relatedIdeasPath(locale, problem.id)}>{problem[locale].title}<IdeaIcon name="arrow" /></a></h3><p>{connection[locale]}</p><div className="ideas-source-meta"><a href={connection.evidenceUrl}>{en ? 'See the source' : 'সোর্স দেখুন'}<IdeaIcon name="external" /></a><span>{connection.reviewScope === 'public-source-context' ? (en ? 'Based on published information' : 'প্রকাশিত তথ্য থেকে') : (en ? 'Company and work checked' : 'কোম্পানি ও কাজের তথ্য দেখা হয়েছে')} · {sourceDate(connection.reviewedAt, locale)}</span></div></article>)}</div></section>}
      <section className="ideas-detail-section ideas-profile-evidence" aria-labelledby="about-information"><div className="ideas-section-heading"><h2 id="about-information">{en ? 'About this information' : 'এই তথ্য সম্পর্কে'}</h2><p>{company.origin === 'editorial-import' ? (en ? 'From earlier Deshi Startup research. This information has not been checked again since the date below.' : 'Deshi Startup-এর আগের গবেষণার তথ্য। নিচের তারিখের পর নতুন করে যাচাই করা হয়নি।') : (en ? 'We checked the submitted company details and its work on the linked problem. This is not an investment recommendation.' : 'পর্যালোচিত তথ্য থেকে প্রোফাইল তৈরি হয়েছে। পরিচয় ও কাজের যোগসূত্র দেখা হয়েছে; বিনিয়োগের মান বা ফলাফল যাচাই করা হয়নি।')}</p></div>{company.sourceDate && <p className="ideas-source-date">{en ? 'Source date: ' : 'সোর্সের তারিখ: '}{sourceDate(company.sourceDate, locale)}</p>}<ul className="ideas-profile-sources">{company.sourceUrls.map(url => <li key={url}><a href={url}>{domain(url)}<IdeaIcon name="external" /></a><span>{new URL(url).pathname === '/' ? '' : new URL(url).pathname}</span></li>)}</ul></section>
    </div><aside className="ideas-profile-aside">
      {company.references.length > 0 && <section aria-labelledby="company-read-more"><h2 id="company-read-more">{en ? 'Read more' : 'Deshi Startup-এ আরও পড়ুন'}</h2><div className="ideas-reading-links">{company.references.map(reference => <a key={`${reference.kind}-${reference.target}`} href={localPath(locale, reference.kind === 'case-study' ? `/case-studies/${reference.target}` : `/startup-50#${reference.target}`)}>{reference.kind === 'case-study' ? (en ? 'Read the case study' : 'কেস স্টাডি পড়ুন') : (en ? 'In Deshi Startup 50' : 'Deshi Startup 50-এ দেখুন')}<IdeaIcon name="arrow" /></a>)}</div></section>}
      <div className="ideas-profile-contribute"><a className="ideas-inline-link" href={`${ideaPath(locale, 'add-company')}?company=${encodeURIComponent(company.id)}`}>{en ? 'Add their work' : 'আর কী কাজ করছে, জানান'}<IdeaIcon name="plus" /></a><a className="ideas-inline-link ideas-muted-link" href={localPath(locale, '/contact')}>{en ? 'Suggest a correction' : 'ভুল থাকলে জানান'}<IdeaIcon name="arrow" /></a></div>
    </aside></div>
  </IdeaShell>
}
