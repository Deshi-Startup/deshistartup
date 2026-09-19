'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { ConnectionProposal, Locale, OrganizationRole, WorkStage } from '../../lib/ecosystem-types'
import { parseProposal } from '../../lib/ecosystem-input'
import { domain, organizationRoles, workStages } from '../../lib/ecosystem-model'
import { ecosystemError, useEcosystemSession } from './useEcosystemSession'
import { relatedIdeasPath } from '../../lib/idea-routes.mjs'
import IdeaIcon from './IdeaIcon'
interface Company { id: string; name: string; website: string; description: string; search: string }
interface Submission { id: string; status: string; published: number; decision_note: string | null; payload: ConnectionProposal }
const storageKey = 'deshi-startup:connection-draft:v1'
const empty = { problemId: '', organizationId: '', name: '', website: '', description: '', role: 'startup', work: '', stage: 'research', evidenceUrl: '' }
type Draft = typeof empty
export default function ConnectionForm({ locale, companies, problems }: { locale: Locale; companies: Company[]; problems: { id: string; slug: string; title: string }[] }) {
  const t = (a: string, b: string) => locale === 'en' ? a : b
  const session = useEcosystemSession(locale)
  const [draft, setDraft] = useState<Draft>(empty)
  const [ready, setReady] = useState(false)
  const [newCompany, setNewCompany] = useState(false)
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [storageError, setStorageError] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [historyError, setHistoryError] = useState('')
  const searchInput = useRef<HTMLInputElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const workInput = useRef<HTMLTextAreaElement>(null)
  const focusAfterChange = (field: 'search' | 'name' | 'work') => window.requestAnimationFrame(() => ({ search: searchInput, name: nameInput, work: workInput })[field].current?.focus())
  const retry = useRef<{ json: string; key: string } | null>(null)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const saved = { ...empty }
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) || '{}')
      for (const key of Object.keys(empty) as (keyof Draft)[]) if (typeof raw?.[key] === 'string') saved[key] = raw[key].slice(0, key === 'work' ? 2000 : 500)
      // Preserve an existing prototype draft; the old key is never removed.
      if (!raw?.work && (saved.problemId || params.get('problem'))) {
        const legacy = JSON.parse(localStorage.getItem(`deshi-startup:ideas:startup-draft:v1:${params.get('problem') || saved.problemId}`) || '{}')
        for (const key of ['name', 'website', 'work'] as const) if (typeof legacy[key] === 'string') saved[key] = legacy[key].slice(0, key === 'work' ? 2000 : 500)
        if (typeof legacy.evidence === 'string' && /^https?:\/\/\S+$/.test(legacy.evidence)) saved.evidenceUrl = legacy.evidence.slice(0, 500)
      }
    } catch { setStorageError(true) }
    const requested = params.get('problem') || ''
    if (problems.some(p => p.id === requested)) saved.problemId = requested
    if (!problems.some(p => p.id === saved.problemId)) saved.problemId = ''
    const requestedCompany = params.get('company') || ''
    if (companies.some(c => c.id === requestedCompany)) saved.organizationId = requestedCompany
    if (!companies.some(c => c.id === saved.organizationId)) saved.organizationId = ''
    if (!Object.hasOwn(workStages, saved.stage)) saved.stage = 'research'
    if (!Object.hasOwn(organizationRoles, saved.role)) saved.role = 'startup'
    setDraft(saved); setNewCompany(!saved.organizationId && !!saved.name); setReady(true)
    fetch('/api/ecosystem/status').then(r => r.json()).then(data => setAvailable(data.available === true)).catch(() => setAvailable(false))
  }, [companies, problems])
  useEffect(() => {
    if (!session.auth) { setSubmissions([]); return }
    let active = true
    fetch('/api/ecosystem/submissions', { headers: { Authorization: `Bearer ${session.auth.token}` } }).then(async response => {
      if (!response.ok) { if (active && response.status === 401) session.expire(); throw new Error(ecosystemError(response.status, locale)) }
      const data = await response.json(); if (active) { setSubmissions(data.submissions); setHistoryError('') }
    }).catch(error => { if (active) setHistoryError(error.message) })
    return () => { active = false }
  }, [session.auth, locale, notice])
  const edit = (change: Partial<Draft>) => {
    const next = { ...draft, ...change }; setDraft(next); setError(''); setNotice('')
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setStorageError(false) } catch { setStorageError(true) }
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setNotice('')
    const payload = parseProposal({ version: 1, locale, problemId: draft.problemId, organizationId: draft.organizationId,
      organization: draft.organizationId ? null : { name: draft.name, website: draft.website, description: draft.description, role: draft.role as OrganizationRole },
      work: draft.work, stage: draft.stage as WorkStage, evidenceUrl: draft.evidenceUrl })
    if (!payload) { setError(ecosystemError(400, locale)); return }
    if (!session.auth) { session.signIn(); return }
    setBusy(true)
    const json = JSON.stringify(payload)
    if (retry.current?.json !== json) {
      try {
        const previous = JSON.parse(localStorage.getItem(`${storageKey}:retry`) || 'null')
        retry.current = previous?.json === json && typeof previous.key === 'string' ? previous : { json, key: crypto.randomUUID() }
        localStorage.setItem(`${storageKey}:retry`, JSON.stringify(retry.current))
      } catch { retry.current = { json, key: crypto.randomUUID() } }
    }
    try {
      const response = await fetch('/api/ecosystem/submissions', { method: 'POST', headers: { Authorization: `Bearer ${session.auth.token}`, 'Content-Type': 'application/json', 'Idempotency-Key': retry.current!.key }, body: json })
      if (!response.ok) { if (response.status === 401) session.expire(); throw new Error(ecosystemError(response.status, locale)) }
      const result = await response.json()
      setNotice(result.status === 'pending' ? t('Submitted for review. It is not public yet.', 'পর্যালোচনার জন্য জমা হয়েছে। এখনো প্রকাশ করা হয়নি।') : t('This submission has already been reviewed. See its status below.', 'এই তথ্য আগেই পর্যালোচনা করা হয়েছে। নিচে অবস্থা দেখুন।'))
    } catch (cause) { setError(cause instanceof Error ? cause.message : ecosystemError(503, locale)) }
    finally { setBusy(false) }
  }
  const selected = companies.find(c => c.id === draft.organizationId)
  const matches = companies.filter(c => search.trim() && search.toLocaleLowerCase().trim().split(/\s+/).every(word => c.search.includes(word))).slice(0, 5)
  return <>
    <a className="ideas-back" href={relatedIdeasPath(locale, draft.problemId)}><IdeaIcon name="back" />{t('Back to ideas', 'আইডিয়ার তালিকায় ফিরুন')}</a>
    <header className="ideas-draft-intro"><h1>{t('Who is working on this?', 'কোন কোম্পানি কাজ করছে, জানান।')}</h1><p>{t('Find the company or add a new one. Tell us how it is working on the problem and add a link that shows its work.', 'আগের তালিকা থেকে কোম্পানি বেছে নিন বা নতুন কোম্পানির তথ্য দিন। কাজের বিবরণের সঙ্গে প্রকাশ্য একটি সোর্স দিন।')}</p></header>
    <form className="ideas-draft-form connection-form" onSubmit={submit}><fieldset disabled={!ready || busy}><legend className="sr-only">{t('Company connection', 'কোম্পানির কাজের তথ্য')}</legend>
      <label htmlFor="connection-problem">{t('Problem', 'সমস্যা')}</label><select id="connection-problem" required value={draft.problemId} onChange={e => edit({ problemId: e.target.value })}><option value="">{t('Choose a problem', 'সমস্যা বেছে নিন')}</option>{problems.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select>
      <div className="connection-company"><h2>{t('Company', 'কোম্পানি')}</h2>{selected ? <div className="company-selected"><div><strong>{selected.name}</strong><p>{domain(selected.website)}</p></div><button className="ideas-text-button" type="button" onClick={() => { edit({ organizationId: '' }); setNewCompany(false); focusAfterChange('search') }}>{t('Change', 'বদলান')}</button></div> : <>
        {!newCompany && <><label className="sr-only" htmlFor="connection-company-search">{t('Find an existing company', 'আগের তালিকায় কোম্পানি খুঁজুন')}</label><input ref={searchInput} id="connection-company-search" type="search" value={search} maxLength={120} onChange={e => setSearch(e.target.value)} placeholder={t('Search by name or website…', 'নাম বা ওয়েবসাইট লিখে খুঁজুন…')} /><ul className="company-matches">{matches.map(c => <li key={c.id}><button type="button" onClick={() => { edit({ organizationId: c.id }); setSearch(''); focusAfterChange('work') }}><strong>{c.name}</strong><span>{domain(c.website)}</span><small>{c.description}</small></button></li>)}</ul>{search.trim() && !matches.length && <p className="ideas-field-help">{t('No matching company. You can add it below.', 'প্রকাশিত প্রোফাইলে মিল পাওয়া যায়নি।')}</p>}<button type="button" className="ideas-text-button" onClick={() => { setNewCompany(true); focusAfterChange('name') }}><IdeaIcon name="plus" />{t('Add a new company', 'নতুন কোম্পানির তথ্য দিন')}</button></>}
        {newCompany && <div className="connection-new"><button type="button" className="ideas-text-button" onClick={() => { setNewCompany(false); focusAfterChange('search') }}>{t('Search existing companies instead', 'আগের তালিকায় খুঁজুন')}</button><label htmlFor="connection-name">{t('Company name', 'কোম্পানির নাম')}</label><input ref={nameInput} id="connection-name" required maxLength={100} value={draft.name} onChange={e => edit({ name: e.target.value })} /><label htmlFor="connection-website">{t('Website or public product page', 'ওয়েবসাইট বা পণ্যের প্রকাশ্য পাতা')}</label><input id="connection-website" type="url" required maxLength={500} placeholder="https://" value={draft.website} onChange={e => edit({ website: e.target.value })} /><label htmlFor="connection-description">{t('What does the company do?', 'কোম্পানি কী করে?')}</label><textarea id="connection-description" required minLength={20} maxLength={500} rows={3} value={draft.description} onChange={e => edit({ description: e.target.value })} /><label htmlFor="connection-role">{t('Type', 'ধরন')}</label><select id="connection-role" value={draft.role} onChange={e => edit({ role: e.target.value })}>{Object.entries(organizationRoles).map(([id, label]) => <option key={id} value={id}>{label[locale]}</option>)}</select></div>}
      </>}</div>
      <label htmlFor="connection-work">{t('How is it working on this problem?', 'এই সমস্যা নিয়ে কী কাজ করছে?')}</label><textarea ref={workInput} id="connection-work" required minLength={20} maxLength={2000} rows={4} value={draft.work} onChange={e => edit({ work: e.target.value })} />
      <label htmlFor="connection-stage">{t('Stage of this work', 'কাজের পর্যায়')}</label><select id="connection-stage" value={draft.stage} onChange={e => edit({ stage: e.target.value })}>{Object.entries(workStages).map(([id, label]) => <option key={id} value={id}>{label[locale]}</option>)}</select>
      <label htmlFor="connection-evidence">{t('Link to their work', 'প্রকাশ্য সোর্স')}</label><p className="ideas-field-help" id="connection-evidence-help">{t('Link to a product, demo or published account of this work. Keep private information out.', 'পণ্য, ডেমো বা কাজের প্রকাশিত বিবরণের লিংক দিন। ব্যক্তিগত তথ্য দেবেন না।')}</p><input id="connection-evidence" type="url" required maxLength={500} aria-describedby="connection-evidence-help" placeholder="https://" value={draft.evidenceUrl} onChange={e => edit({ evidenceUrl: e.target.value })} />
      <p className="connection-review-note">{t('We check every submission before it appears on the site. Submitting information does not give you control of the company profile.', 'প্রকাশের আগে পর্যালোচনা করা হবে। তথ্য দিলেই কোম্পানির প্রতিনিধি হিসেবে স্বীকৃতি বা প্রোফাইল বদলানোর অধিকার পাবেন না।')}</p>
      <div className="ideas-draft-bottom"><button className="ideas-button" type="submit" disabled={available !== true || (!selected && !newCompany)}>{busy ? t('Submitting…', 'জমা হচ্ছে…') : session.auth ? t('Submit for review', 'পর্যালোচনার জন্য জমা দিন') : t('Sign in to submit', 'জমা দিতে সাইন ইন করুন')}</button><span>{storageError ? t('Draft could not be saved', 'খসড়া সেভ হয়নি') : t('Draft kept in this browser', 'খসড়া এই ব্রাউজারেই থাকবে')}</span></div>
    </fieldset>{available === false && <p className="ideas-error" role="status">{t('Submissions are unavailable right now. You can keep writing your draft here.', 'এখন তথ্য জমা নেওয়া যাচ্ছে না। এখানে খসড়া লিখে রাখতে পারেন।')}</p>}{error && <p className="ideas-error" role="alert">{error}</p>}<p className="ideas-action-status" role="status">{notice}</p></form>
    <details className="connection-history"><summary>{t('Your submissions', 'আপনার জমা দেওয়া তথ্য')}</summary>{!session.auth ? <button className="ideas-text-button" onClick={session.signIn}>{t('Sign in to view', 'দেখতে সাইন ইন করুন')}</button> : <>{historyError && <p role="alert">{historyError}</p>}{!historyError && !submissions.length && <p>{t('You have not submitted any companies yet.', 'এখনো কোনো তথ্য জমা দেননি।')}</p>}<ul>{submissions.map(s => <li key={s.id}><strong>{s.payload.organization?.name || companies.find(c => c.id === s.payload.organizationId)?.name || t('Company', 'কোম্পানি')}</strong><p>{problems.find(p => p.id === s.payload.problemId)?.title}</p><span>{s.published ? t('Published', 'প্রকাশিত') : s.status === 'approved' ? t('Approved, awaiting publication', 'অনুমোদিত, প্রকাশের অপেক্ষায়') : s.status === 'rejected' ? t('Not approved', 'অনুমোদন পায়নি') : t('Awaiting review', 'পর্যালোচনার অপেক্ষায়')}</span>{s.decision_note && <p>{s.decision_note}</p>}</li>)}</ul></>}</details>{session.dialog}
  </>
}
