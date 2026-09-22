import { notFound } from 'next/navigation'
import { ecosystem, companyPath } from '../../lib/ecosystem'
import { domain } from '../../lib/ecosystem-model'
import type { Approach, Problem } from '../../lib/ecosystem-types'
import type { Locale, Place, Sector } from './types'
import { forLabel, ideaPath, ideaSlug, kindLabel, places, sectors } from './model'
import { guidePage } from '../../lib/guide-index.mjs'
import contentIndex from '../../generated/content-index.json'
import IdeaShell from './IdeaShell'
import IdeaIcon from './IdeaIcon'
import CompanyMark from './CompanyMark'
import SaveIdea from './SaveIdea'
import VoteIdea from './VoteIdea'
import ShareIdea from './ShareIdea'
import IdeaActions from './IdeaActions'

function materials(problem: Problem, idea: Approach, locale: Locale) {
  const en = locale === 'en'
  const p = problem[locale], a = idea[locale]
  const sources = problem.sources.map(source => `- [${source.title}](${source.url}) · ${source.date}\n  ${source[locale]}`).join('\n')
  const brief = [
    `# ${a.title}`, a.summary,
    `## ${en ? 'Who it helps' : 'কাদের কাজে লাগবে'}`, p.customer,
    `## ${en ? 'How it works' : 'যেভাবে কাজ করবে'}`, a.description,
    `## ${en ? 'Ways to earn' : 'আয়ের উপায়'}`, a.businessModel,
    `## ${en ? 'Try this first' : 'আগে এভাবে পরীক্ষা করুন'}`,
    a.steps.map((step, index) => `${index + 1}. ${step}`).join('\n'),
    `${en ? 'Look for: ' : 'যে ফল খুঁজবেন: '}${a.signal}`,
    `## ${en ? 'The problem' : 'সমস্যাটি'}`, p.context,
    `## ${en ? 'What to find out' : 'যা জেনে নেওয়া দরকার'}`, p.unknown,
    ...(sources ? [`## ${en ? 'Sources' : 'সোর্স'}`, sources] : [])
  ].join('\n\n') + '\n'
  const prompt = `${en ? 'Help me build a small prototype to test this startup idea in Bangladesh.' : 'বাংলাদেশে এই স্টার্টআপ আইডিয়া পরীক্ষা করতে ছোট একটি প্রোটোটাইপ বানাতে সাহায্য করুন।'}\n\n${brief}\n${a.prototype}\n\n${en ? 'Use clearly labelled synthetic data. Do not invent demand, market size, partnerships, integrations or results. Include mobile, keyboard, empty and error states. State which assumption this prototype can test.' : 'নমুনা ডেটা স্পষ্ট করে চিহ্নিত করুন। চাহিদা, বাজারের আকার, পার্টনারশিপ, বাইরের সিস্টেমের সংযোগ বা ফলাফল বানিয়ে লিখবেন না। মোবাইল ও কিবোর্ডে ব্যবহার, খালি অবস্থা ও ভুলের বার্তা রাখুন। কোন ধারণাটি পরীক্ষা করা যাবে, বুঝিয়ে দিন।'}\n`

  return { brief, prompt }
}

export default function IdeaDetail({ locale, id }: { locale: Locale; id: string }) {
  const idea = ecosystem.approaches.find(item => item.id === id)
  if (!idea) notFound()
  const problem = ecosystem.problems.find(item => item.id === idea.problemId)
  if (!problem) notFound()
  const en = locale === 'en', a = idea[locale], p = problem[locale]
  const { brief, prompt } = materials(problem, idea, locale)
  const companies = ecosystem.connections.filter(item => item.problemId === problem.id).flatMap(connection => {
    const company = ecosystem.organizations.find(item => item.id === connection.organizationId)
    return company ? [{ company, connection }] : []
  })
  const savedIdeas = ecosystem.approaches.map(({ id, problemId }) => ({ id, problemId }))
  const placeNames = problem.places.map(place => places[place as Place]?.[locale] || place).join(' · ')
  const guides = idea.guides.map(slug => guidePage(contentIndex, locale, slug)).filter(guide => guide !== null).slice(0, 3)
  const siblings = ecosystem.approaches.filter(other => other.problemId === problem.id && other.id !== idea.id)
  return <IdeaShell locale={locale}>
    <article className="ideas-detail">
      <a className="ideas-back" href={ideaPath(locale)}><IdeaIcon name="back" />{en ? 'All ideas' : 'সব আইডিয়া'}</a>
      <header className="ideas-detail-heading">
        <h1>{a.title}</h1><p className="ideas-lead">{a.summary}</p>
        <div className="ideas-detail-actions"><VoteIdea id={idea.id} title={a.title} locale={locale} /><SaveIdea id={idea.id} locale={locale} ideas={savedIdeas} /><ShareIdea locale={locale} title={a.title} customer={p.customer} /></div>
        <dl className="ideas-detail-meta">
          <div><dt>{en ? 'Sector' : 'খাত'}</dt><dd>{sectors[problem.sector as Sector]?.[locale] || problem.sector}</dd></div>
          <div><dt>{en ? 'Model' : 'ধরন'}</dt><dd>{kindLabel(idea.kind, locale)}</dd></div>
          <div><dt>{en ? 'Location' : 'জায়গা'}</dt><dd>{placeNames}</dd></div>
          <div className="ideas-detail-customer"><dt>{forLabel(locale).replace(/[:：]$/, '')}</dt><dd>{p.customer}</dd></div>
        </dl>
      </header>
      <div className="ideas-detail-grid">
        <section className="ideas-explanation" id="how-it-works"><h2>{en ? 'How it works' : 'যেভাবে কাজ করবে'}</h2><p>{a.description}</p></section>
        <section className="ideas-earn" id="business-model"><h2>{en ? 'Ways to earn' : 'আয়ের উপায়'}</h2><p>{a.businessModel}</p></section>
        <section className="ideas-first-step" id="first-test"><h2>{en ? 'Try this first' : 'আগে এভাবে পরীক্ষা করুন'}</h2>
            <ol>{a.steps.map((step, index) => <li key={index}>{step}</li>)}</ol>
            <p className="ideas-signal"><strong>{en ? 'Look for: ' : 'যে ফল খুঁজবেন: '}</strong>{a.signal}</p>
            <IdeaActions id={idea.id} locale={locale} brief={brief} prompt={prompt} />
        </section>
        {guides.length > 0 && <section className="ideas-guides">
            <h2>{en ? 'Guides for this idea' : 'এই আইডিয়ার জন্য গাইড'}</h2>
            <ul>{guides.map(guide => <li key={guide.route}><a href={guide.route}>{guide.title}<IdeaIcon name="arrow" /></a></li>)}</ul>
        </section>}

        <section className="ideas-companies-small">
            {companies.length > 0 && <><h2>{en ? 'Related companies' : 'একই সমস্যা নিয়ে কাজ করা কোম্পানি'}</h2><div className="ideas-company-links">{companies.map(({ company, connection }) => <a href={companyPath(locale, company.slug)} key={connection.id}><CompanyMark company={company} locale={locale} /><span>{company[locale].name}</span></a>)}</div></>}
            <a className="ideas-inline-link" href={`${ideaPath(locale, 'add-company')}?problem=${encodeURIComponent(problem.id)}`}>{en ? 'Working on this?' : 'এ নিয়ে কাজ করছেন?'}<IdeaIcon name="plus" /></a>
        </section>
      </div>
      {siblings.length > 0 && <section className="ideas-related">
        <h2>{en ? 'Another way to solve this' : 'একই সমস্যার আরেক সমাধান'}</h2>
        {siblings.map(other => <a className="ideas-related-link" href={ideaPath(locale, ideaSlug(other.id))} key={other.id}>{other[locale].title}<IdeaIcon name="arrow" /></a>)}
      </section>}
      <details className="ideas-research" id="sources"><summary>{en ? 'Research & sources' : 'গবেষণা ও সোর্স'}<span className="ideas-disclosure-icon" aria-hidden="true" /></summary>
        <div className="ideas-research-body">{a.editorialNote && <><h2>{en ? 'Why we picked it' : 'কেন বেছে নিয়েছি'}</h2><p>{a.editorialNote}</p></>}<h2>{en ? 'The problem' : 'সমস্যাটি'}</h2><p>{p.context}</p>
          <h2>{en ? 'What to find out' : 'যা জেনে নেওয়া দরকার'}</h2><p>{p.unknown}</p>
          {problem.sources.length > 0 && <ol className="ideas-sources">{problem.sources.map(source => <li key={source.url}><div><a href={source.url}>{source.title}<IdeaIcon name="external" /></a><span className="ideas-source-date">{source.date} · {domain(source.url)}</span><p>{source[locale]}</p></div></li>)}</ol>}
        </div>
      </details>

    </article>
  </IdeaShell>
}
