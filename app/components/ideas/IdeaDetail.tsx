import { notFound } from 'next/navigation'
import { ecosystem, companyPath } from '../../lib/ecosystem'
import { domain, sourceDate } from '../../lib/ecosystem-model'
import type { Approach, Problem } from '../../lib/ecosystem-types'
import type { Locale, Place, Sector } from './types'
import { forLabel, ideaPath, kindLabel, localPath, number, places, sectors } from './model'
import IdeaShell from './IdeaShell'
import IdeaIcon from './IdeaIcon'
import CompanyMark from './CompanyMark'
import SaveIdea from './SaveIdea'
import IdeaActions from './IdeaActions'

function materials(problem: Problem, idea: Approach, locale: Locale) {
  const en = locale === 'en'
  const p = problem[locale], a = idea[locale]
  const sources = problem.sources.map(source => `- [${source.title}](${source.url}) · ${source.date}\n  ${source[locale]}`).join('\n')
  const brief = [
    `# ${a.title}`, a.summary,
    `## ${en ? 'Who it helps' : 'কাদের কাজে লাগবে'}`, p.customer,
    `## ${en ? 'How it works' : 'যেভাবে কাজ করবে'}`, a.description,
    `## ${en ? 'How it could earn' : 'আয় হতে পারে যেভাবে'}`, a.businessModel,
    `## ${en ? 'Try this first' : 'আগে এভাবে পরীক্ষা করুন'}`,
    a.steps.map((step, index) => `${index + 1}. ${step}`).join('\n'),
    `${en ? 'You’ll know it’s working when: ' : 'কাজ হচ্ছে বুঝবেন যেভাবে: '}${a.signal}`,
    `## ${en ? 'The problem' : 'সমস্যাটি'}`, p.context,
    `## ${en ? 'What to find out' : 'যা জেনে নেওয়া দরকার'}`, p.unknown,
    ...(sources ? [`## ${en ? 'Sources' : 'সোর্স'}`, sources] : [])
  ].join('\n\n') + '\n'
  const prompt = `${en ? 'Help me build a small prototype to test this startup idea in Bangladesh.' : 'বাংলাদেশে এই স্টার্টআপ আইডিয়া পরীক্ষা করতে ছোট একটি প্রোটোটাইপ বানাতে সাহায্য করুন।'}\n\n${brief}\n${a.prototype}\n\n${en ? 'Use clearly labelled synthetic data. Do not invent demand, market size, partnerships, integrations or results. Include mobile, keyboard, empty and error states. State which assumption this prototype can test.' : 'নমুনা ডেটা স্পষ্ট করে চিহ্নিত করুন। চাহিদা, বাজারের আকার, পার্টনারশিপ, বাইরের সিস্টেমের সংযোগ বা ফলাফল বানিয়ে লিখবেন না। মোবাইল ও কিবোর্ডে ব্যবহার, খালি অবস্থা ও ভুলের বার্তা রাখুন। কোন ধারণাটি পরীক্ষা করা যাবে, বুঝিয়ে দিন।'}\n`

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
  // The most recent access date is the honest age of the research behind this idea.
  const latest = problem.sources.map(source => source.date).sort((x, y) => Date.parse(y.replace(/^Accessed /, '')) - Date.parse(x.replace(/^Accessed /, '')))[0]
  const checked = latest ? sourceDate(latest, locale) : ''
  return <IdeaShell locale={locale}>
    <article className="ideas-detail">
      <div className="ideas-detail-toolbar"><a className="ideas-back" href={ideaPath(locale)}><IdeaIcon name="back" />{en ? 'All ideas' : 'সব আইডিয়া'}</a><SaveIdea id={idea.id} locale={locale} ideas={savedIdeas} /></div>
      <header className="ideas-detail-heading">
        <p className="ideas-eyebrow"><IdeaIcon name={problem.sector as Sector} />{sectors[problem.sector as Sector]?.[locale] || problem.sector}<span aria-hidden="true"> · </span>{kindLabel(idea.kind, locale)}<span aria-hidden="true"> · </span>{placeNames}</p>
        <h1>{a.title}</h1><p className="ideas-lead">{a.summary}</p>
        <p className="ideas-detail-for"><span>{forLabel(locale)}</span>{p.customer}</p>
        <p className="ideas-trust">{problem.sources.length > 0
          ? <>{en ? `${problem.sources.length} source${problem.sources.length === 1 ? '' : 's'} · Accessed ${checked}` : `${number(problem.sources.length, locale)}টি সোর্স · ${checked}-এ দেখা হয়েছে`}<span aria-hidden="true"> · </span><a href="#sources">{en ? 'Research & sources' : 'গবেষণা ও সোর্স'}</a></>
          : <><span className="ideas-wanted">{en ? 'Sources wanted' : 'সোর্স দরকার'}</span><a href={localPath(locale, '/contact')}>{en ? 'Know one? Tell us' : 'জানা থাকলে জানান'}</a></>}</p>
      </header>
      <div className="ideas-detail-grid">
        <div className="ideas-detail-body">
          <section><h2>{en ? 'How it works' : 'যেভাবে কাজ করবে'}</h2><p>{a.description}</p></section>
          <div className="ideas-open-question">
            <p className="ideas-open-label">{en ? 'The open question' : 'আসল প্রশ্নটা'}</p>
            <p>{p.unknown}</p>
          </div>
          <section className="ideas-first-step"><h2>{en ? 'Try this first' : 'আগে এভাবে পরীক্ষা করুন'}</h2>
            <ol>{a.steps.map((step, index) => <li key={index}>{step}</li>)}</ol>
            <p className="ideas-signal"><strong>{en ? 'You’ll know it’s working when: ' : 'কাজ হচ্ছে বুঝবেন যেভাবে: '}</strong>{a.signal}</p>
            <IdeaActions id={idea.id} locale={locale} brief={brief} prompt={prompt} />
          </section>
        </div>
        <aside className="ideas-facts">
          <section><h2>{en ? 'How it could earn' : 'আয় হতে পারে যেভাবে'}</h2><p>{a.businessModel}</p></section>
          <section><h2>{en ? 'Where to explore' : 'যেখানে খোঁজ নিতে পারেন'}</h2><p>{placeNames}</p></section>
          <section className="ideas-companies-small">
            {companies.length > 0 && <><h2>{en ? 'Related companies' : 'সংশ্লিষ্ট কোম্পানি'}</h2><div className="ideas-company-links">{companies.map(({ company, connection }) => <a href={companyPath(locale, company.slug)} key={connection.id}><CompanyMark company={company} locale={locale} /><span>{company[locale].name}</span></a>)}</div></>}
            <a className="ideas-inline-link" href={`${ideaPath(locale, 'add-company')}?problem=${encodeURIComponent(problem.id)}`}>{en ? 'Working on this?' : 'এ নিয়ে কাজ করছেন?'}<IdeaIcon name="plus" /></a>
          </section>
        </aside>
      </div>
      <details className="ideas-research" id="sources"><summary>{en ? 'Research & sources' : 'গবেষণা ও সোর্স'}<span className="ideas-disclosure-icon" aria-hidden="true" /></summary>
        <div className="ideas-research-body"><h2>{en ? 'The problem' : 'সমস্যাটি'}</h2><p>{p.context}</p>
          <h2>{en ? 'What to find out' : 'যা জেনে নেওয়া দরকার'}</h2><p>{p.unknown}</p>
          {problem.sources.length > 0 && <ol className="ideas-sources">{problem.sources.map(source => <li key={source.url}><div><a href={source.url}>{source.title}<IdeaIcon name="external" /></a><span className="ideas-source-date">{source.date} · {domain(source.url)}</span><p>{source[locale]}</p></div></li>)}</ol>}
        </div>
      </details>

    </article>
  </IdeaShell>
}
