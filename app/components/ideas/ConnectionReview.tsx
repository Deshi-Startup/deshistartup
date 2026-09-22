'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { ConnectionProposal, IdeaDecision, Locale, ReviewDecision } from '../../lib/ecosystem-types'
import { parseDecision } from '../../lib/ecosystem-input'
import { workStages, domain } from '../../lib/ecosystem-model'
import { ecosystemError, useEcosystemSession } from './useEcosystemSession'
import { relatedIdeasPath, ideaSlug } from '../../lib/idea-routes.mjs'
import { submissionStatus, submissionDate, type Submission } from '../../lib/submission-status'
import { ideaPath } from './model'
import IdeaReviewItem, { IdeaSubmissionContent } from './IdeaReviewItem'
import SubmissionAccount from './SubmissionAccount'
import IdeaIcon from './IdeaIcon'
import IdeaShell from './IdeaShell'
type PendingConnection = Submission & { payload: ConnectionProposal }
interface Company { id: string; slug: string; name: string; website: string }
type Status = Submission['status']
type View = { status: Status; id: string }
const readView = (): View => {
  const params = new URLSearchParams(location.search), status = params.get('status')
  return { status: status === 'approved' || status === 'rejected' ? status : 'pending', id: params.get('submission') || '' }
}
export default function ConnectionReview({ locale }: { locale: Locale }) {
  const t = (en: string, bn: string) => locale === 'en' ? en : bn
  const session = useEcosystemSession(locale, { purpose: 'review' })
  const [view, setView] = useState<View>({ status: 'pending', id: '' })
  const [queue, setQueue] = useState<Submission[]>([])
  const [selected, setSelected] = useState<Submission | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [ideas, setIdeas] = useState<{ id: string; title: string }[]>([])
  const [organizationVersion, setOrganizationVersion] = useState(0)
  const [authorizedToken, setAuthorizedToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [notes, setNotes] = useState<Record<string, string>>({})
  const draftOwner = useRef('')
  const companyDrafts = useRef(new Map<string, CompanyReviewDraft>())
  const sequence = useRef(0)
  const scope = useRef('')
  const heading = useRef<HTMLHeadingElement>(null)
  const list = useRef<HTMLElement>(null)
  const previousId = useRef('')
  const currentView = useRef(view)
  currentView.current = view

  const load = async (mode: 'reset' | 'more' | 'record' = 'reset', target = currentView.current) => {
    if (!session.auth) return false
    const request = ++sequence.current, token = session.auth.token
    setBusy(true); setError('')
    try {
      const params = new URLSearchParams({ status: target.status, locale })
      if (target.id) params.set('submission', target.id)
      if (mode === 'more' && cursor) params.set('before', cursor)
      const response = await fetch(`/api/ecosystem/review?${params}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15_000) })
      if (request !== sequence.current) return false
      if (!response.ok) {
        if (response.status === 401) session.expire()
        if (response.status === 403) { setAuthorizedToken(''); setQueue([]); setSelected(null) }
        throw new Error(ecosystemError(response.status, locale))
      }
      const data = await response.json()
      if (request !== sequence.current) return false
      setSelected(data.selected)
      setQueue(previous => mode === 'record'
        ? previous.map(row => row.id === data.selected?.id ? data.selected : row)
        : mode === 'more' ? [...previous, ...data.submissions.filter((row: Submission) => !previous.some(p => p.id === row.id))] : data.submissions)
      if (mode !== 'record') { setCursor(data.nextCursor); scope.current = `${token}:${locale}:${target.status}` }
      setCompanies(data.organizations); setIdeas(data.publishedIdeas); setOrganizationVersion(data.organizationVersion)
      setAuthorizedToken(token)
      if (target.id && !data.selected) setError(t('Submission not found.', 'জমা দেওয়া তথ্য খুঁজে পাওয়া যায়নি।'))
      if (data.selected && data.selected.status !== target.status) setView({ status: data.selected.status, id: target.id })
      return true
    } catch (cause) {
      if (request === sequence.current) setError(cause instanceof Error && cause.name === 'Error' ? cause.message : ecosystemError(503, locale))
      return false
    } finally { if (request === sequence.current) setBusy(false) }
  }
  useEffect(() => { setView(readView()) }, [])
  useEffect(() => {
    if (session.auth && draftOwner.current !== session.auth.user.email) {
      setNotes({}); companyDrafts.current.clear(); draftOwner.current = session.auth.user.email
    }
    return () => { sequence.current++; scope.current = '' }
  }, [session.auth?.token])
  useEffect(() => {
    if (scope.current !== `${session.auth?.token}:${locale}:${view.status}`) void load('reset', view)
  }, [session.auth?.token, locale, view.status])
  useEffect(() => {
    const back = () => {
      const next = readView(); setView(next); setMessage('')
      if (next.status === currentView.current.status && next.id && !queue.some(row => row.id === next.id)) void load('record', next)
    }
    window.addEventListener('popstate', back)
    return () => window.removeEventListener('popstate', back)
  }, [queue, session.auth?.token, locale])
  const choose = (id: string, status = view.status) => {
    const next = { id, status }
    setView(next); setMessage(''); setError('')
    const params = new URLSearchParams({ status })
    if (id) params.set('submission', id)
    history.pushState(null, '', `?${params}`)
  }
  const item = selected?.id === view.id ? selected : queue.find(row => row.id === view.id)
  const visibleQueue = selected && selected.status === view.status && !queue.some(row => row.id === selected.id) ? [selected, ...queue] : queue
  const authorized = !!session.auth && authorizedToken === session.auth.token
  useEffect(() => {
    if (!authorized) return
    if (item && heading.current) {
      heading.current.focus({ preventScroll: true })
      heading.current.scrollIntoView({ block: 'start' })
      const chosen = list.current?.querySelector<HTMLButtonElement>(`[data-submission="${item.id}"]`)
      if (chosen && list.current && list.current.scrollHeight > list.current.clientHeight) chosen.scrollIntoView({ block: 'nearest' })
    }
    else if (previousId.current && !view.id) list.current?.querySelector<HTMLButtonElement>(`[data-submission="${previousId.current}"]`)?.focus()
    previousId.current = view.id
  }, [authorized, item?.id, item?.status, item?.published, view.id])

  const mutate = async (path: string, body: unknown, status = view.status) => {
    if (!session.auth || !item || busy) return
    const request = ++sequence.current, token = session.auth.token, id = item.id
    setBusy(true); setError(''); setMessage('')
    try {
      const response = await fetch(`/api/ecosystem/review/${id}${path}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(15_000) })
      if (request !== sequence.current) return
      if (!response.ok) {
        if (response.status === 401) session.expire()
        if (response.status === 403) { setAuthorizedToken(''); setQueue([]); setSelected(null) }
        throw new Error(ecosystemError(response.status, locale))
      }
      const next = { id, status }
      const refreshed = await load(status === view.status ? 'record' : 'reset', next)
      if (!refreshed) return
      if (status !== view.status) choose(id, status)
      if (!path) { setNotes(previous => { const next = { ...previous }; delete next[id]; return next }); companyDrafts.current.delete(id) }
      setMessage(path === '/publication' ? t('Published idea linked.', 'প্রকাশিত আইডিয়ার লিংক যোগ হয়েছে।') : path === '/retry-email' ? t('Email retry requested.', 'ইমেইল আবার পাঠানোর অনুরোধ করা হয়েছে।') : t('Decision saved.', 'সিদ্ধান্ত সেভ হয়েছে।'))
    } catch (cause) { if (request === sequence.current) setError(cause instanceof Error && cause.name === 'Error' ? cause.message : ecosystemError(503, locale)) }
    finally { if (request === sequence.current) setBusy(false) }
  }
  const title = (row: Submission) => 'kind' in row.payload ? row.payload.title : row.payload.organization?.name || companies.find(c => c.id === (row.payload as ConnectionProposal).organizationId)?.name || t('Company submission', 'কোম্পানির তথ্য')
  return <IdeaShell locale={locale}><div className="submission-workspace submission-workspace-review">
    <div className="submission-topline"><a className="ideas-back" href={relatedIdeasPath(locale)}><IdeaIcon name="back" />{t('All ideas', 'সব আইডিয়া')}</a></div>
    <header className="submission-heading"><h1>{t('Review submissions', 'জমা দেওয়া তথ্য দেখুন')}</h1><p>{t('Read, leave feedback, and follow accepted ideas to publication.', 'জমা দেওয়া তথ্য পড়ুন, মন্তব্য দিন। গৃহীত আইডিয়া প্রকাশের খোঁজও রাখুন।')}</p><SubmissionAccount auth={session.auth} locale={locale} disabled={busy} onSwitch={session.switchAccount} /></header>
    {!session.auth && <button className="ideas-button" onClick={session.signIn}>{t('Sign in as a reviewer', 'পর্যালোচক হিসেবে সাইন ইন করুন')}</button>}
    {session.auth && <div className="submission-toolbar"><div className="submission-filters" role="group" aria-label={t('Review status', 'পর্যালোচনার অবস্থা')}>
      {(['pending','approved','rejected'] as const).map(status => <button className="ideas-text-button" aria-pressed={view.status === status} disabled={busy} key={status} onClick={() => choose('', status)}>{status === 'pending' ? t('Awaiting review', 'অপেক্ষায়') : status === 'approved' ? t('Accepted', 'গৃহীত') : t('Declined', 'ফেরত দেওয়া')}</button>)}
    </div><button className="ideas-text-button" disabled={busy} onClick={() => load()}>{busy ? t('Loading…', 'লোড হচ্ছে…') : t('Refresh', 'রিফ্রেশ করুন')}</button></div>}
    {error && <p className="ideas-error submission-notice" role="alert">{error}</p>}
    <p className="ideas-action-status" role="status">{message}</p>
    <div hidden={!authorized} aria-busy={busy} className={`review-layout${item ? ' has-selection' : ''}`}>
      <nav ref={list} className="review-list" aria-label={t('Submissions', 'জমা দেওয়া তথ্য')}>
        {!queue.length && !busy && !error && <p className="submission-empty">{view.status === 'pending' ? t('You’re all caught up. New submissions will appear here.', 'সব তথ্য দেখা হয়েছে। নতুন কিছু জমা পড়লে এখানে দেখাবে।') : t('No submissions here yet.', 'এখানে এখনো কিছু নেই।')}</p>}
        {visibleQueue.map(row => <button key={row.id} data-submission={row.id} className="review-list-item" aria-current={row.id === item?.id ? 'true' : undefined} onClick={() => choose(row.id)} disabled={busy}><span lang={row.payload.locale}>{title(row)}</span><small>{submissionDate(row.created_at, locale)}{row.published ? t(' · Published', ' · প্রকাশিত') : ''}</small><IdeaIcon name="arrow" /></button>)}
        {cursor && <button className="ideas-text-button" disabled={busy} onClick={() => load('more')}>{t('Load earlier submissions', 'আগের তথ্য দেখুন')}</button>}
      </nav>
      {item && <section className="review-record" aria-labelledby="review-record-title">
        <button className="ideas-text-button review-back" disabled={busy} onClick={() => choose('')}><IdeaIcon name="back" />{t('Back to list', 'তালিকায় ফিরুন')}</button>
        <h2 id="review-record-title" ref={heading} tabIndex={-1} className="review-record-title" lang={item.payload.locale}>{title(item)}</h2>
        <p className="submission-status">{submissionStatus(item, locale)}<span aria-hidden="true"> · </span><time dateTime={item.created_at}>{submissionDate(item.created_at, locale)}</time></p>
        {item.status === 'pending' ? 'kind' in item.payload
          ? <IdeaReviewItem key={item.id} locale={locale} item={{ ...item, payload: item.payload }} note={notes[item.id] || ''} onNote={note => setNotes(previous => ({ ...previous, [item.id]: note }))} busy={busy} onDecision={decision => void mutate('', decision, decision.decision)} />
          : <ReviewItem key={item.id} locale={locale} item={item as PendingConnection} drafts={companyDrafts.current} companies={companies} organizationVersion={organizationVersion} busy={busy} onDecision={decision => void mutate('', decision, decision.decision)} />
          : <>
            <div className="submission-note"><h3>{t('Reviewer’s note', 'পর্যালোচকের মন্তব্য')}</h3><p>{item.decision_note}</p></div>
            {item.published && item.idea_id ? <a className="ideas-inline-link" href={ideaPath(locale, ideaSlug(item.idea_id))}>{t('View published idea', 'প্রকাশিত আইডিয়া দেখুন')}<IdeaIcon name="arrow" /></a>
              : item.idea_id ? <p className="ideas-field-help">{t('The linked idea is currently unpublished.', 'লিংক করা আইডিয়াটি এখন প্রকাশিত নেই।')}</p>
              : item.status === 'approved' && 'kind' in item.payload && <PublicationLink key={item.id} locale={locale} ideas={ideas} busy={busy} onLink={ideaId => mutate('/publication', { ideaId, revision: item.revision })} />}
            <details className="submission-original"><summary>{t('Original submission', 'জমা দেওয়া মূল তথ্য')}<IdeaIcon name="chevron" /></summary>
              {'kind' in item.payload ? <IdeaSubmissionContent idea={item.payload} locale={locale} showTitle={false} /> : <div className="review-submitted"><p>{item.payload.work}</p><a href={item.payload.evidenceUrl}>{t('Submitted source', 'জমা দেওয়া সোর্স')}</a></div>}
            </details>
          </>}
        {item.notifications?.some(n => n.state === 'failed') && <p className="ideas-error">{t('An email could not be sent.', 'একটি ইমেইল পাঠানো যায়নি।')} <button className="ideas-text-button" disabled={busy} onClick={() => mutate('/retry-email', {})}>{t('Retry email', 'ইমেইল আবার পাঠান')}</button></p>}
      </section>}
    </div>
    {session.dialog}
  </div></IdeaShell>
}
function PublicationLink({ locale, ideas, busy, onLink }: { locale: Locale; ideas: { id: string; title: string }[]; busy: boolean; onLink: (id: string) => void }) {
  const [id, setId] = useState('')
  const en = locale === 'en'
  return <details className="submission-publication"><summary>{en ? 'Link published idea' : 'প্রকাশিত আইডিয়ার লিংক যোগ করুন'}<IdeaIcon name="plus" /></summary>
    <p className="ideas-field-help">{en ? 'Once the idea is live, choose its page.' : 'আইডিয়াটি প্রকাশ হলে তার পাতা বেছে নিন।'}</p>
    <form className="ideas-draft-form" onSubmit={e => { e.preventDefault(); if (id) onLink(id) }}><label htmlFor="published-idea">{en ? 'Published idea' : 'প্রকাশিত আইডিয়া'}</label><select id="published-idea" required value={id} onChange={e => setId(e.target.value)} disabled={busy}><option value="">{en ? 'Choose an idea' : 'আইডিয়া বেছে নিন'}</option>{ideas.map(idea => <option key={idea.id} value={idea.id}>{idea.title}</option>)}</select><button className="ideas-button" disabled={busy || !id}>{en ? 'Link idea' : 'লিংক যোগ করুন'}</button></form>
  </details>
}
interface CompanyReviewDraft {
  companyId: string; search: string; note: string; work: { en: string; bn: string };
  org: { slug: string; en: { name: string; description: string }; bn: { name: string; description: string } }
}
function ReviewItem({ locale, item, drafts, companies, organizationVersion, busy, onDecision }: { locale: Locale; item: PendingConnection; drafts: Map<string, CompanyReviewDraft>; companies: Company[]; organizationVersion: number; busy: boolean; onDecision: (decision: ReviewDecision) => void }) {
  const t = (a: string, b: string) => locale === 'en' ? a : b
  const p = item.payload
  const savedDraft = drafts.get(item.id)
  const [companyId, setCompanyId] = useState(savedDraft?.companyId ?? p.organizationId)
  const [search, setSearch] = useState(savedDraft?.search ?? p.organization?.name ?? '')
  const [note, setNote] = useState(savedDraft?.note || '')
  const [error, setError] = useState('')
  const [work, setWork] = useState(savedDraft?.work || { en: p.locale === 'en' ? p.work : '', bn: p.locale === 'bn' ? p.work : '' })
  const [org, setOrg] = useState(savedDraft?.org || { slug: '', en: { name: p.locale === 'en' ? p.organization?.name || '' : '', description: p.locale === 'en' ? p.organization?.description || '' : '' }, bn: { name: p.locale === 'bn' ? p.organization?.name || '' : '', description: p.locale === 'bn' ? p.organization?.description || '' : '' } })
  useEffect(() => { drafts.set(item.id, { companyId, search, note, work, org }) }, [companyId, search, note, work, org, drafts, item.id])
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value')
    const decision = parseDecision({ revision: item.revision, decision: action, note, organizationId: companyId, organizationVersion, organization: companyId ? null : org, work })
    if (!decision) { setError(t('Add a review note. Approvals also need a company and complete English and Bangla descriptions.', 'পর্যালোচনার মন্তব্য লিখুন। অনুমোদন দিতে কোম্পানির তথ্য ও বাংলা-ইংরেজি বিবরণ পূর্ণ করতে হবে।')); return }
    setError(''); onDecision(decision)
  }
  const matches = companies.filter(c => !search.trim() || `${c.name} ${c.website}`.toLocaleLowerCase().includes(search.toLocaleLowerCase().trim())).slice(0, 8)
  return (<form className="ideas-draft-form review-form" onSubmit={submit}><fieldset disabled={busy}><legend className="sr-only">{t('Review submission', 'জমা দেওয়া তথ্য পর্যালোচনা')}</legend>
    <div className="review-submitted"><p><a href={`${relatedIdeasPath(locale, p.problemId)}`}>{t('Related ideas', 'সংশ্লিষ্ট আইডিয়া')}</a> · {workStages[p.stage][locale]}</p><p>{p.work}</p><a href={p.evidenceUrl} target="_blank" rel="noopener noreferrer">{t('Open submitted source', 'জমা দেওয়া সোর্স খুলুন')} ({domain(p.evidenceUrl)})</a>{p.organization && <><p>{p.organization.description}</p><a href={p.organization.website} target="_blank" rel="noopener noreferrer">{domain(p.organization.website)}</a></>}</div>
    <label htmlFor="review-company">{t('Link to this company', 'যে কোম্পানির সঙ্গে যুক্ত হবে')}</label><select id="review-company" value={companyId} onChange={e => setCompanyId(e.target.value)}>{p.organization && <option value="">{t('Create the proposed company', 'প্রস্তাবিত কোম্পানির প্রোফাইল তৈরি করুন')}</option>}{companies.map(c => <option key={c.id} value={c.id}>{c.name} · {domain(c.website)}</option>)}</select>
    {p.organization && <details className="review-duplicates"><summary>{t('Check for an existing profile', 'আগে থেকে প্রোফাইল আছে কি না দেখুন')}</summary><label htmlFor="review-company-search">{t('Name or website', 'নাম বা ওয়েবসাইট')}</label><input id="review-company-search" value={search} maxLength={120} onChange={e => setSearch(e.target.value)} /><ul className="company-matches">{matches.map(c => <li key={c.id}><button type="button" onClick={() => setCompanyId(c.id)}><strong>{c.name}</strong><span>{domain(c.website)}</span></button></li>)}</ul></details>}
    {!companyId && p.organization && <><label htmlFor="review-slug">{t('Company page address', 'কোম্পানির পাতার ঠিকানা')}</label><p className="ideas-field-help">{t('The last part of /companies/company-name. Use lowercase letters, numbers and hyphens.', '/companies/company-name ঠিকানার শেষ অংশ। ইংরেজি ছোট হাতের অক্ষর, সংখ্যা ও হাইফেন ব্যবহার করুন।')}</p><input id="review-slug" maxLength={80} value={org.slug} placeholder="company-name" onChange={e => setOrg({ ...org, slug: e.target.value })} />{(['en', 'bn'] as const).map(l => <div key={l}><h3>{l === 'en' ? 'English profile' : 'বাংলা প্রোফাইল'}</h3><label htmlFor={`review-name-${l}`}>{t('Name', 'নাম')} ({l === 'en' ? 'English' : 'বাংলা'})</label><input id={`review-name-${l}`} lang={l} maxLength={100} value={org[l].name} onChange={e => setOrg({ ...org, [l]: { ...org[l], name: e.target.value } })} /><label htmlFor={`review-description-${l}`}>{t('Description', 'বিবরণ')} ({l === 'en' ? 'English' : 'বাংলা'})</label><textarea id={`review-description-${l}`} lang={l} rows={3} maxLength={500} value={org[l].description} onChange={e => setOrg({ ...org, [l]: { ...org[l], description: e.target.value } })} /></div>)}</>}
    {(['en', 'bn'] as const).map(l => <div key={l}><label htmlFor={`review-work-${l}`}>{t('How they work on this problem', 'এই সমস্যা নিয়ে কোম্পানির কাজ')} ({l === 'en' ? 'English' : 'বাংলা'})</label><textarea id={`review-work-${l}`} lang={l} rows={4} maxLength={2000} value={work[l]} onChange={e => setWork({ ...work, [l]: e.target.value })} /></div>)}
    <label htmlFor="review-note">{t('Note to the contributor', 'যিনি জমা দিয়েছেন, তাঁর জন্য মন্তব্য')}</label><textarea id="review-note" rows={3} minLength={5} maxLength={1000} required value={note} onChange={e => setNote(e.target.value)} /><p className="ideas-field-help">{t('Visible to the contributor and reviewers. Explain what you checked or what needs changing.', 'যিনি জমা দিয়েছেন ও পর্যালোচকেরা এটি দেখতে পাবেন। কী দেখেছেন বা কী বদলাতে হবে, লিখুন।')}</p><div className="ideas-draft-bottom"><button className="ideas-button" type="submit" name="decision" value="approved">{t('Approve for publication', 'প্রকাশের জন্য অনুমোদন দিন')}</button><button className="ideas-text-button" type="submit" name="decision" value="rejected">{t('Decline with note', 'মন্তব্যসহ ফেরত দিন')}</button></div></fieldset>{error && <p role="alert" className="ideas-error">{error}</p>}</form>
  )
}
