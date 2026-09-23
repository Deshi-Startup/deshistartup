'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ideaEditFields, ideaEditLabels, ideaEditLimits, validIdeaEditValue, type IdeaEditField } from '../../lib/idea-edit'
import { publicUrl } from '../../lib/ecosystem-input'
import { submissionPath } from '../../lib/submission-status'
import type { AuthState } from '../../lib/client-auth'
import { ecosystemError, useEcosystemSession } from './useEcosystemSession'
import SubmissionAccount from './SubmissionAccount'
import type { IdeaEditEntryProps } from './IdeaEditEntry'

type Entry = { field: IdeaEditField; value: string }
type Draft = { entries: Entry[]; values: Partial<Record<IdeaEditField, string>>; note: string; sourceUrl: string }
export default function IdeaEditForm({ locale, ideaId, title, releaseId, initial, onClose }: IdeaEditEntryProps & { onClose: () => void }) {
  const t = (en: string, bn: string) => locale === 'en' ? en : bn
  const draftKey = `deshi-startup:idea-edit:v1:${ideaId}:${locale}`
  const retryKey = `${draftKey}:retry`
  const [draft, setDraft] = useState<Draft>({ entries: [{ field: 'summary', value: initial.summary }], values: {}, note: '', sourceUrl: '' })
  const [ready, setReady] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [storageError, setStorageError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState('')
  const resumeSubmit = useRef(false)
  const sending = useRef(false)
  const retry = useRef<{ json: string; key: string } | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const session = useEcosystemSession(locale, {
    onAuthenticated: auth => { if (resumeSubmit.current) { resumeSubmit.current = false; void send(auth) } },
    onDismiss: () => { resumeSubmit.current = false }
  })
  useEffect(() => {
    heading.current?.focus()
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey) || 'null')
      if (saved && Array.isArray(saved.entries)) {
        const entries = saved.entries.filter((entry: Entry) => ideaEditFields.includes(entry?.field) && typeof entry.value === 'string').slice(0, ideaEditFields.length)
        if (entries.length && new Set(entries.map((entry: Entry) => entry.field)).size === entries.length) {
          const values = Object.fromEntries(ideaEditFields.filter(field => typeof saved.values?.[field] === 'string').map(field => [field, saved.values[field]])) as Draft['values']
          setDraft({ entries, values, note: typeof saved.note === 'string' ? saved.note : '', sourceUrl: typeof saved.sourceUrl === 'string' ? saved.sourceUrl : '' })
        }
      }
    } catch { setStorageError(true) }
    setReady(true)
    fetch('/api/ecosystem/status', { signal: AbortSignal.timeout(12_000) }).then(response => response.json()).then(data => setAvailable(data.available === true)).catch(() => setAvailable(false))
  }, [draftKey])
  useEffect(() => { if (submitted) heading.current?.focus() }, [submitted])
  const update = (next: Draft) => {
    setDraft(next); setError('')
    try { localStorage.setItem(draftKey, JSON.stringify(next)); setStorageError(false) }
    catch { setStorageError(true) }
  }
  const payload = () => ({ version: 1, kind: 'idea-edit', locale, ideaId, baseReleaseId: releaseId,
    edits: Object.fromEntries(draft.entries.filter(entry => entry.value.trim() !== initial[entry.field].trim()).map(entry => [entry.field, entry.value])),
    note: draft.note.trim(), sourceUrl: draft.sourceUrl.trim() })
  const validate = () => {
    const changes = draft.entries.filter(entry => entry.value.trim() !== initial[entry.field].trim())
    if (changes.some(entry => !validIdeaEditValue(entry.field, entry.value))) return t('Complete each changed section. For steps, use one step per line.', 'বদলানো অংশগুলো পূর্ণ করুন। ধাপ লিখলে প্রতি লাইনে একটি করে লিখুন।')
    if (!changes.length && !draft.note.trim() && !draft.sourceUrl.trim()) return t('Change a section or add information before submitting.', 'জমা দেওয়ার আগে কোনো অংশ বদলান বা নতুন তথ্য দিন।')
    if (draft.sourceUrl.trim() && !publicUrl(draft.sourceUrl.trim())) return t('Add a public source link, or leave it blank.', 'সবার জন্য খোলা সোর্সের লিংক দিন, না হলে ঘরটি ফাঁকা রাখুন।')
    return ''
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const invalid = validate()
    if (invalid) { setError(invalid); return }
    if (!session.auth) { resumeSubmit.current = true; session.signIn(); return }
    void send(session.auth)
  }
  async function send(auth: AuthState) {
    if (sending.current) return
    const invalid = validate()
    if (invalid) { setError(invalid); return }
    sending.current = true
    const json = JSON.stringify(payload())
    if (retry.current?.json !== json) {
      try {
        const stored = JSON.parse(localStorage.getItem(retryKey) || 'null')
        retry.current = stored?.json === json && typeof stored.key === 'string' ? stored : { json, key: crypto.randomUUID() }
        localStorage.setItem(retryKey, JSON.stringify(retry.current))
      } catch { retry.current = { json, key: crypto.randomUUID() } }
    }
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/ecosystem/submissions', { method: 'POST', headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', 'Idempotency-Key': retry.current!.key }, body: json, signal: AbortSignal.timeout(15_000) })
      if (!response.ok) {
        if (response.status === 401) session.expire()
        const data = await response.json().catch(() => null)
        throw new Error(data?.error === 'stale_idea' ? t('This idea changed while you were editing. Copy your draft, then refresh the page.', 'এডিট করার সময় আইডিয়াটি বদলেছে। খসড়া কপি করে পাতা রিফ্রেশ করুন।') : ecosystemError(response.status, locale))
      }
      const result = await response.json()
      setSubmitted(result.id)
      try {
        if (localStorage.getItem(draftKey) === JSON.stringify(draft)) localStorage.removeItem(draftKey)
        if (JSON.parse(localStorage.getItem(retryKey) || 'null')?.key === retry.current?.key) localStorage.removeItem(retryKey)
      } catch {}
    } catch (cause) { setError(cause instanceof Error && cause.name === 'Error' ? cause.message : ecosystemError(503, locale)) }
    finally { sending.current = false; setBusy(false) }
  }
  const setEntry = (index: number, entry: Entry) => update({ ...draft, values: { ...draft.values, [entry.field]: entry.value }, entries: draft.entries.map((current, i) => i === index ? entry : current) })
  const changeField = (index: number, field: IdeaEditField) => {
    const current = draft.entries[index]
    update({ ...draft, values: { ...draft.values, [current.field]: current.value }, entries: draft.entries.map((entry, i) => i === index ? { field, value: draft.values[field] ?? initial[field] } : entry) })
  }
  const removeEntry = (index: number) => {
    update({ ...draft, entries: draft.entries.filter((_, i) => i !== index) })
    requestAnimationFrame(() => document.getElementById(`idea-edit-field-${Math.max(0, index - 1)}`)?.focus())
  }
  const addEntry = () => {
    const field = ideaEditFields.find(candidate => !draft.entries.some(entry => entry.field === candidate))
    if (field) update({ ...draft, entries: [...draft.entries, { field, value: draft.values[field] ?? initial[field] }] })
  }
  return <div className="idea-edit-form" id="edit-idea">
    {submitted ? <div className="submission-confirmation"><h2 ref={heading} tabIndex={-1}>{t('Changes submitted.', 'বদলগুলো জমা হয়েছে।')}</h2><p>{t('Our editors will review them. You can follow the decision in Your submissions.', 'সম্পাদকীয় দল বদলগুলো দেখে নেবে। সিদ্ধান্ত জানতে জমা দেওয়া আইডিয়ার পাতায় যান।')}</p><a className="ideas-button" href={submissionPath(locale, submitted)}>{t('View submission', 'জমা দেওয়া তথ্য দেখুন')}</a></div> : <>
      <div className="idea-edit-heading"><div><h2 ref={heading} tabIndex={-1}>{t('Edit this idea', 'আইডিয়াটি এডিট করুন')}</h2><p>{t('Suggest a correction or add information.', 'ভুল ঠিক করুন বা নতুন তথ্য যোগ করুন।')}</p></div><button type="button" className="ideas-text-button" onClick={onClose}>{t('Close', 'বন্ধ করুন')}</button></div>
      <form className="ideas-draft-form" onSubmit={submit}><fieldset disabled={!ready || busy}><legend className="sr-only">{title}</legend>
        {draft.entries.map((entry, index) => <div className="idea-edit-part" key={index}>
          <div className="idea-edit-part-head"><label htmlFor={`idea-edit-field-${index}`}>{t('Part to edit', 'যে অংশ এডিট করবেন')}</label>{draft.entries.length > 1 && <button type="button" className="ideas-text-button" onClick={() => removeEntry(index)}>{t('Remove', 'বাদ দিন')}</button>}</div>
          <select id={`idea-edit-field-${index}`} value={entry.field} onChange={event => changeField(index, event.target.value as IdeaEditField)}>
            {ideaEditFields.filter(field => field === entry.field || !draft.entries.some(other => other.field === field)).map(field => <option key={field} value={field}>{ideaEditLabels[field][locale]}</option>)}
          </select>
          <label htmlFor={`idea-edit-value-${index}`}>{t('Your version', 'আপনার লেখা')}</label>
          <textarea id={`idea-edit-value-${index}`} lang={locale} rows={entry.field === 'steps' ? 7 : 5} maxLength={ideaEditLimits[entry.field]} value={entry.value} onChange={event => setEntry(index, { ...entry, value: event.target.value })} />
          {entry.field === 'steps' && <p className="ideas-field-help">{t('One step per line.', 'প্রতি লাইনে একটি করে ধাপ লিখুন।')}</p>}
        </div>)}
        {draft.entries.length < ideaEditFields.length && <button type="button" className="ideas-text-button idea-edit-add" onClick={addEntry}>{t('Edit another part', 'আরেকটি অংশ এডিট করুন')}</button>}
        <label htmlFor="idea-edit-note">{t('More context (optional)', 'আরও কিছু তথ্য (ইচ্ছা হলে)')}</label><textarea id="idea-edit-note" rows={3} maxLength={1000} value={draft.note} onChange={event => update({ ...draft, note: event.target.value })} />
        <label htmlFor="idea-edit-source">{t('Source link (optional)', 'সোর্সের লিংক (ইচ্ছা হলে)')}</label><input id="idea-edit-source" type="url" maxLength={500} value={draft.sourceUrl} onChange={event => update({ ...draft, sourceUrl: event.target.value })} />
        <div className="ideas-draft-bottom"><button type="submit" className="ideas-button" disabled={available !== true}>{busy ? t('Submitting…', 'জমা হচ্ছে…') : session.auth ? t('Submit changes', 'বদলগুলো জমা দিন') : t('Sign in to submit', 'জমা দিতে সাইন ইন করুন')}</button><button type="button" className="ideas-text-button" onClick={onClose}>{t('Keep draft and close', 'খসড়া রেখে বন্ধ করুন')}</button></div>
      </fieldset>
      <p className="ideas-action-status">{t('Changes are reviewed before they appear on the site.', 'পর্যালোচনার পরই বদলগুলো সাইটে দেখা যাবে।')}</p>
      {storageError && <p role="alert" className="ideas-error">{t('Your browser could not save this draft. Copy your changes before leaving.', 'ব্রাউজারে খসড়া সেভ হয়নি। পাতা ছাড়ার আগে বদলগুলো কপি করুন।')}</p>}
      {available === false && <p role="status" className="ideas-error">{t('Submissions are unavailable right now. Your draft stays here.', 'এখন জমা নেওয়া যাচ্ছে না। খসড়া এখানেই থাকবে।')}</p>}
      {error && <p role="alert" className="ideas-error">{error}</p>}</form>
      <SubmissionAccount auth={session.auth} locale={locale} disabled={busy} onSwitch={() => { resumeSubmit.current = false; session.switchAccount() }} />
      {session.dialog}
    </>}
  </div>
}
