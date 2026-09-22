'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { DRAFT_KEY, draftLimits, draftMarkdown, emptyDraft, ideaPath, parseDraft, type IdeaDraft as Draft } from './model'
import { parseIdeaProposal } from '../../lib/ecosystem-input'
import { ecosystemError, useEcosystemSession } from './useEcosystemSession'
import { downloadText } from './download'
import type { Locale } from './types'
import IdeaIcon from './IdeaIcon'
import { submissionPath } from '../../lib/submission-status'
import type { AuthState } from '../../lib/client-auth'
import SubmissionAccount from './SubmissionAccount'

export default function IdeaDraft({ locale }: { locale: Locale }) {
  const t = (en: string, bn: string) => locale === 'en' ? en : bn
  const resumeSubmit = useRef(false)
  const sending = useRef(false)
  const session = useEcosystemSession(locale, {
    onAuthenticated: auth => { if (resumeSubmit.current) { resumeSubmit.current = false; void send(auth) } },
    onDismiss: () => { resumeSubmit.current = false }
  })
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [ready, setReady] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [storageError, setStorageError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [decisionEmails, setDecisionEmails] = useState(false)
  const confirmation = useRef<HTMLHeadingElement>(null)
  const titleInput = useRef<HTMLInputElement>(null)
  useEffect(() => { if (submitted) confirmation.current?.focus() }, [submitted])
  const retry = useRef<{ json: string; key: string } | null>(null)
  useEffect(() => {
    try { setDraft(parseDraft(localStorage.getItem(DRAFT_KEY))) }
    catch { setStorageError(true) }
    setReady(true)
    fetch('/api/ecosystem/status', { signal: AbortSignal.timeout(12_000) }).then(r => r.json()).then(data => { setAvailable(data.available === true); setDecisionEmails(data.decisionEmails === true) }).catch(() => setAvailable(false))
  }, [])
  const edit = (key: keyof Draft, value: string) => {
    const next = { ...draft, [key]: value }
    setDraft(next); setMessage(''); setError('')
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(next)); setStorageError(false) }
    catch { setStorageError(true) }
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setMessage('')
    const payload = parseIdeaProposal({ version: 1, kind: 'idea', locale, ...draft })
    if (!payload) { setError(t('Add a title, who it helps and a short description of your idea.', 'আইডিয়ার নাম, কাদের কাজে লাগবে ও ছোট একটি বিবরণ লিখুন।')); return }
    if (!session.auth) { resumeSubmit.current = true; session.signIn(); return }
    void send(session.auth)
  }
  async function send(auth: AuthState) {
    const payload = parseIdeaProposal({ version: 1, kind: 'idea', locale, ...draft })
    if (!payload || sending.current) return
    sending.current = true
    const json = JSON.stringify(payload)
    if (retry.current?.json !== json) {
      try {
        const previous = JSON.parse(localStorage.getItem(`${DRAFT_KEY}:retry`) || 'null')
        retry.current = previous?.json === json && typeof previous.key === 'string' ? previous : { json, key: crypto.randomUUID() }
        localStorage.setItem(`${DRAFT_KEY}:retry`, JSON.stringify(retry.current))
      } catch { retry.current = { json, key: crypto.randomUUID() } }
    }
    setBusy(true)
    try {
      const response = await fetch('/api/ecosystem/submissions', { method: 'POST', headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', 'Idempotency-Key': retry.current!.key }, body: json, signal: AbortSignal.timeout(15_000) })
      if (!response.ok) { if (response.status === 401) session.expire(); throw new Error(ecosystemError(response.status, locale)) }
      const result = await response.json()
      setSubmitted(result.id)
      try {
        // A second tab may already hold a newer draft. Only clear this submission's copy.
        if (JSON.stringify(parseDraft(localStorage.getItem(DRAFT_KEY))) === JSON.stringify(draft)) localStorage.removeItem(DRAFT_KEY)
        const storedRetry = JSON.parse(localStorage.getItem(`${DRAFT_KEY}:retry`) || 'null')
        if (storedRetry?.key === retry.current?.key) localStorage.removeItem(`${DRAFT_KEY}:retry`)
      } catch {}
    } catch (cause) { setError(cause instanceof Error && cause.name === 'Error' ? cause.message : ecosystemError(503, locale)) }
    finally { sending.current = false; setBusy(false) }
  }
  const download = () => {
    try { downloadText(`deshi-startup-idea-${locale}.md`, draftMarkdown(draft, locale)); setMessage(t('Draft downloaded.', 'খসড়া ডাউনলোড হয়েছে।')) }
    catch { setError(t('Download could not start. Try again.', 'ডাউনলোড শুরু হয়নি। আবার চেষ্টা করুন।')) }
  }
  return <div className="ideas-draft-page">
    <div className="submission-topline"><a className="ideas-back" href={ideaPath(locale)}><IdeaIcon name="back" />{t('All ideas', 'সব আইডিয়া')}</a><a className="ideas-inline-link" href={submissionPath(locale)}>{t('Your submissions', 'আপনার জমা দেওয়া আইডিয়া')}</a></div>
    {submitted ? <section className="submission-confirmation" aria-labelledby="submission-confirmed"><h1 ref={confirmation} tabIndex={-1} id="submission-confirmed">{t('Idea submitted.', 'আইডিয়া জমা হয়েছে।')}</h1><p>{t('Our editors will review it. You can follow its status and read their feedback.', 'সম্পাদকীয় দল আইডিয়াটি দেখে নেবে। কী সিদ্ধান্ত হলো আর কী মন্তব্য এল, জমা দেওয়া আইডিয়ার পাতায় দেখতে পারবেন।')}</p><div className="ideas-draft-bottom"><a className="ideas-button" href={submissionPath(locale, submitted)}>{t('View submission', 'জমা দেওয়া আইডিয়া দেখুন')}</a><button className="ideas-text-button" type="button" onClick={() => { setSubmitted(''); setDraft(emptyDraft); setMessage(''); retry.current = null; requestAnimationFrame(() => titleInput.current?.focus()) }}>{t('Add another idea', 'আরেকটি আইডিয়া দিন')}</button></div></section> : <>
    <header className="ideas-draft-intro"><h1>{t('Add an idea.', 'নতুন আইডিয়া দিন।')}</h1><p>{t('What would you build, and who would it help?', 'কী বানাতে চান, আর কাদের কাজে লাগবে?')}</p></header>
    <form onSubmit={submit} className="ideas-draft-form ideas-draft-column">
      <fieldset disabled={!ready || busy}>
        <legend className="sr-only">{t('Your idea', 'আপনার আইডিয়া')}</legend>
        <label htmlFor="draft-title">{t('Give it a name', 'একটি নাম দিন')}</label>
        <input ref={titleInput} id="draft-title" value={draft.title} required pattern=".*\S.*" maxLength={draftLimits.title} onChange={event => edit('title', event.target.value)} placeholder={t('e.g. Cold storage by the crate', 'যেমন: ক্রেট হিসেবে ফসল রাখার হিমাগার')} />
        <label htmlFor="draft-solution">{t('Describe your idea', 'আইডিয়াটি বুঝিয়ে বলুন')}</label>
        <textarea id="draft-solution" required minLength={20} maxLength={draftLimits.solution} rows={4} value={draft.solution} onChange={event => edit('solution', event.target.value)} />
        <label htmlFor="draft-customer">{t('Who would use it?', 'কারা ব্যবহার করবেন?')}</label>
        <input id="draft-customer" value={draft.customer} required pattern=".*\S.*" maxLength={draftLimits.customer} onChange={event => edit('customer', event.target.value)} />
        <details className="ideas-draft-more"><summary>{t('Add more detail', 'আরও কিছু তথ্য দিন')} <span>{t('optional', 'ইচ্ছা হলে')}</span></summary>
          <label htmlFor="draft-problem">{t('What problem would it solve?', 'কোন সমস্যার সমাধান করবে?')}</label>
          <textarea id="draft-problem" value={draft.problem} rows={3} maxLength={draftLimits.problem} onChange={event => edit('problem', event.target.value)} />
          <label htmlFor="draft-place">{t('Where would you start?', 'কোথা থেকে শুরু করবেন?')}</label>
          <input id="draft-place" value={draft.place} maxLength={draftLimits.place} onChange={event => edit('place', event.target.value)} />
          <label htmlFor="draft-evidence">{t('Research or links', 'গবেষণা বা লিংক')}</label>
          <textarea id="draft-evidence" value={draft.evidence} rows={3} maxLength={draftLimits.evidence} onChange={event => edit('evidence', event.target.value)} />
          <label htmlFor="draft-test">{t('What could you try first?', 'আগে কী পরীক্ষা করতে পারেন?')}</label>
          <textarea id="draft-test" value={draft.test} rows={3} maxLength={draftLimits.test} onChange={event => edit('test', event.target.value)} />
        </details>
        <div className="ideas-draft-bottom"><button type="submit" className="ideas-button" disabled={available !== true}>{busy ? t('Submitting…', 'জমা হচ্ছে…') : session.auth ? t('Submit idea', 'আইডিয়া জমা দিন') : t('Sign in to submit', 'জমা দিতে সাইন ইন করুন')}</button><button type="button" className="ideas-text-button" onClick={download}>{t('Download draft', 'খসড়া ডাউনলোড করুন')}</button></div>
      </fieldset>
      <p className="ideas-action-status">{decisionEmails ? t('We’ll email you the review decision. Your idea stays private until publication.', 'পর্যালোচনার সিদ্ধান্ত ইমেইলে জানাব। প্রকাশের আগে আইডিয়াটি অন্যরা দেখতে পাবেন না।') : t('Track the review and read feedback in Your submissions.', 'আপনার জমা দেওয়া আইডিয়ার পাতায় পর্যালোচনার অবস্থা ও মন্তব্য দেখতে পারবেন।')}</p>
      {storageError && <p role="alert" className="ideas-error">{t('Your browser could not save this draft. Download a copy before leaving.', 'ব্রাউজারে খসড়া সেভ হয়নি। পাতা ছাড়ার আগে কপি ডাউনলোড করুন।')}</p>}
      {available === false && <p className="ideas-error" role="status">{t('Submissions are unavailable right now. Your draft stays here.', 'এখন আইডিয়া জমা নেওয়া যাচ্ছে না। খসড়া এখানেই থাকবে।')}</p>}
      {error && <p role="alert" className="ideas-error">{error}</p>}
      <p role="status" className="ideas-feedback">{message}</p>
    </form><SubmissionAccount auth={session.auth} locale={locale} disabled={busy} onSwitch={() => { resumeSubmit.current = false; session.switchAccount() }} /></>}{session.dialog}
  </div>
}
