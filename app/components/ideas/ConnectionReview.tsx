'use client'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import type { ConnectionProposal, IdeaProposal, IdeaDecision, Locale, ReviewDecision } from '../../lib/ecosystem-types'
import { parseDecision } from '../../lib/ecosystem-input'
import { workStages, domain } from '../../lib/ecosystem-model'
import { ecosystemError, useEcosystemSession } from './useEcosystemSession'
import { relatedIdeasPath } from '../../lib/idea-routes.mjs'
import IdeaReviewItem from './IdeaReviewItem'
import IdeaShell from './IdeaShell'
interface Pending { id: string; revision: number; payload: ConnectionProposal | IdeaProposal }
interface PendingConnection extends Pending { payload: ConnectionProposal }
interface Company { id: string; slug: string; name: string; website: string }
export default function ConnectionReview({ locale }: { locale: Locale }) {
  const t = (a: string, b: string) => locale === 'en' ? a : b
  const session = useEcosystemSession(locale)
  const [queue, setQueue] = useState<Pending[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [organizationVersion, setOrganizationVersion] = useState(0)
  const [authorizedToken, setAuthorizedToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const load = useCallback(async () => {
    if (!session.auth) return
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/ecosystem/review', { headers: { Authorization: `Bearer ${session.auth.token}` }, signal: AbortSignal.timeout(15_000) })
      if (!response.ok) { if (response.status === 401) session.expire(); throw new Error(ecosystemError(response.status, locale)) }
      const data = await response.json(); setQueue(data.submissions); setCompanies(data.organizations); setOrganizationVersion(data.organizationVersion); setAuthorizedToken(session.auth.token); setLoaded(true)
    } catch (cause) { setError(cause instanceof Error && cause.name === 'Error' ? cause.message : ecosystemError(503, locale)) }
    finally { setBusy(false) }
  }, [session.auth, locale])
  useEffect(() => { void load() }, [load])
  const decide = async (item: Pending, decision: ReviewDecision | IdeaDecision) => {
    if (!session.auth) return
    setBusy(true); setError(''); setMessage('')
    try {
      const response = await fetch(`/api/ecosystem/review/${item.id}`, { method: 'POST', headers: { Authorization: `Bearer ${session.auth.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(decision), signal: AbortSignal.timeout(15_000) })
      if (!response.ok) { if (response.status === 401) session.expire(); throw new Error(ecosystemError(response.status, locale)) }
      setMessage(decision.decision === 'approved' && 'kind' in item.payload ? t('Accepted for editorial preparation.', 'সম্পাদনার জন্য গ্রহণ করা হয়েছে।') : decision.decision === 'approved' ? t('Approved. It will appear after the next publication.', 'অনুমোদিত হয়েছে। পরেরবার প্রকাশের সময় সাইটে দেখা যাবে।') : t('Decision saved.', 'সিদ্ধান্ত সেভ হয়েছে।'))
      await load()
    } catch (cause) { setError(cause instanceof Error && cause.name === 'Error' ? cause.message : ecosystemError(503, locale)) }
    finally { setBusy(false) }
  }
  const authorized = !!session.auth && authorizedToken === session.auth.token
  return <IdeaShell locale={locale}><a className="ideas-back" href={relatedIdeasPath(locale)}>{t('Back to ideas', 'আইডিয়ার তালিকায় ফিরুন')}</a><header className="ideas-draft-intro"><h1>{t('Review submissions', 'জমা দেওয়া তথ্য দেখুন।')}</h1><p>{t('Review ideas and company submissions before they join the collection.', 'প্রকাশের আগে জমা দেওয়া আইডিয়া ও কোম্পানির তথ্য দেখুন।')}</p></header>
    {!session.auth ? <button className="ideas-button" onClick={session.signIn}>{t('Sign in as a reviewer', 'পর্যালোচক হিসেবে সাইন ইন করুন')}</button> : <button className="ideas-text-button" disabled={busy} onClick={load}>{busy ? t('Loading…', 'লোড হচ্ছে…') : t('Refresh list', 'তালিকা রিফ্রেশ করুন')}</button>}<div hidden={!authorized}>{loaded && !queue.length && !error && <p className="review-empty">{t('Nothing is waiting for review.', 'পর্যালোচনার জন্য কোনো তথ্য বাকি নেই।')}</p>}{queue[0] && ('kind' in queue[0].payload ? <IdeaReviewItem key={queue[0].id} locale={locale} item={{ ...queue[0], payload: queue[0].payload }} busy={busy || !authorized} onDecision={decision => decide(queue[0], decision)} /> : <ReviewItem key={queue[0].id} locale={locale} item={queue[0] as PendingConnection} companies={companies} organizationVersion={organizationVersion} busy={busy || !authorized} onDecision={decision => decide(queue[0], decision)} />)}</div>
    {error && <p className="ideas-error" role="alert">{error}</p>}<p className="ideas-action-status" role="status">{message}</p>{session.dialog}
  </IdeaShell>
}
function ReviewItem({ locale, item, companies, organizationVersion, busy, onDecision }: { locale: Locale; item: PendingConnection; companies: Company[]; organizationVersion: number; busy: boolean; onDecision: (decision: ReviewDecision) => void }) {
  const t = (a: string, b: string) => locale === 'en' ? a : b
  const p = item.payload
  const [companyId, setCompanyId] = useState(p.organizationId)
  const [search, setSearch] = useState(p.organization?.name || '')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [work, setWork] = useState({ en: p.locale === 'en' ? p.work : '', bn: p.locale === 'bn' ? p.work : '' })
  const [org, setOrg] = useState({ slug: '', en: { name: p.locale === 'en' ? p.organization?.name || '' : '', description: p.locale === 'en' ? p.organization?.description || '' : '' }, bn: { name: p.locale === 'bn' ? p.organization?.name || '' : '', description: p.locale === 'bn' ? p.organization?.description || '' : '' } })
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value')
    const decision = parseDecision({ revision: item.revision, decision: action, note, organizationId: companyId, organizationVersion, organization: companyId ? null : org, work })
    if (!decision) { setError(t('Add a review note. Approvals also need a company and complete English and Bangla descriptions.', 'পর্যালোচনার মন্তব্য লিখুন। অনুমোদন দিতে কোম্পানির তথ্য ও বাংলা-ইংরেজি বিবরণ পূর্ণ করতে হবে।')); return }
    setError(''); onDecision(decision)
  }
  const matches = companies.filter(c => !search.trim() || `${c.name} ${c.website}`.toLocaleLowerCase().includes(search.toLocaleLowerCase().trim())).slice(0, 8)
  return (<form className="ideas-draft-form review-form" onSubmit={submit}><fieldset disabled={busy}><legend className="sr-only">{t('Review submission', 'জমা দেওয়া তথ্য পর্যালোচনা')}</legend>
    <div className="review-submitted"><h2>{p.organization?.name || companies.find(c => c.id === p.organizationId)?.name || p.organizationId}</h2><p><a href={`${relatedIdeasPath(locale, p.problemId)}`}>{t('Related ideas', 'সংশ্লিষ্ট আইডিয়া')}</a> · {workStages[p.stage][locale]}</p><p>{p.work}</p><a href={p.evidenceUrl} target="_blank" rel="noopener noreferrer">{t('Open submitted source', 'জমা দেওয়া সোর্স খুলুন')} ({domain(p.evidenceUrl)})</a>{p.organization && <><p>{p.organization.description}</p><a href={p.organization.website} target="_blank" rel="noopener noreferrer">{domain(p.organization.website)}</a></>}</div>
    <label htmlFor="review-company">{t('Link to this company', 'যে কোম্পানির সঙ্গে যুক্ত হবে')}</label><select id="review-company" value={companyId} onChange={e => setCompanyId(e.target.value)}>{p.organization && <option value="">{t('Create the proposed company', 'প্রস্তাবিত কোম্পানির প্রোফাইল তৈরি করুন')}</option>}{companies.map(c => <option key={c.id} value={c.id}>{c.name} · {domain(c.website)}</option>)}</select>
    {p.organization && <details className="review-duplicates"><summary>{t('Check for an existing profile', 'আগে থেকে প্রোফাইল আছে কি না দেখুন')}</summary><label htmlFor="review-company-search">{t('Name or website', 'নাম বা ওয়েবসাইট')}</label><input id="review-company-search" value={search} maxLength={120} onChange={e => setSearch(e.target.value)} /><ul className="company-matches">{matches.map(c => <li key={c.id}><button type="button" onClick={() => setCompanyId(c.id)}><strong>{c.name}</strong><span>{domain(c.website)}</span></button></li>)}</ul></details>}
    {!companyId && p.organization && <><label htmlFor="review-slug">{t('Company page address', 'কোম্পানির পাতার ঠিকানা')}</label><p className="ideas-field-help">{t('The last part of /companies/company-name. Use lowercase letters, numbers and hyphens.', '/companies/company-name ঠিকানার শেষ অংশ। ইংরেজি ছোট হাতের অক্ষর, সংখ্যা ও হাইফেন ব্যবহার করুন।')}</p><input id="review-slug" maxLength={80} value={org.slug} placeholder="company-name" onChange={e => setOrg({ ...org, slug: e.target.value })} />{(['en', 'bn'] as const).map(l => <div key={l}><h3>{l === 'en' ? 'English profile' : 'বাংলা প্রোফাইল'}</h3><label htmlFor={`review-name-${l}`}>{t('Name', 'নাম')} ({l === 'en' ? 'English' : 'বাংলা'})</label><input id={`review-name-${l}`} lang={l} maxLength={100} value={org[l].name} onChange={e => setOrg({ ...org, [l]: { ...org[l], name: e.target.value } })} /><label htmlFor={`review-description-${l}`}>{t('Description', 'বিবরণ')} ({l === 'en' ? 'English' : 'বাংলা'})</label><textarea id={`review-description-${l}`} lang={l} rows={3} maxLength={500} value={org[l].description} onChange={e => setOrg({ ...org, [l]: { ...org[l], description: e.target.value } })} /></div>)}</>}
    {(['en', 'bn'] as const).map(l => <div key={l}><label htmlFor={`review-work-${l}`}>{t('How they work on this problem', 'এই সমস্যা নিয়ে কোম্পানির কাজ')} ({l === 'en' ? 'English' : 'বাংলা'})</label><textarea id={`review-work-${l}`} lang={l} rows={4} maxLength={2000} value={work[l]} onChange={e => setWork({ ...work, [l]: e.target.value })} /></div>)}
    <label htmlFor="review-note">{t('Note to the contributor', 'যিনি জমা দিয়েছেন, তাঁর জন্য মন্তব্য')}</label><textarea id="review-note" rows={3} minLength={5} maxLength={1000} required value={note} onChange={e => setNote(e.target.value)} /><p className="ideas-field-help">{t('Visible to the contributor and reviewers. Explain what you checked or what needs changing.', 'যিনি জমা দিয়েছেন ও পর্যালোচকেরা এটি দেখতে পাবেন। কী দেখেছেন বা কী বদলাতে হবে, লিখুন।')}</p><div className="ideas-draft-bottom"><button className="ideas-button" type="submit" name="decision" value="approved">{t('Approve for publication', 'প্রকাশের জন্য অনুমোদন দিন')}</button><button className="ideas-text-button" type="submit" name="decision" value="rejected">{t('Decline with note', 'মন্তব্যসহ ফেরত দিন')}</button></div></fieldset>{error && <p role="alert" className="ideas-error">{error}</p>}</form>
  )
}
