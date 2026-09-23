'use client'
import { useEffect, useRef, useState } from 'react'
import type { Locale } from './types'
import { submissionStatus, submissionDate, type Submission } from '../../lib/submission-status'
import { ideaPath, ideaSlug } from './model'
import { useEcosystemSession, ecosystemError } from './useEcosystemSession'
import { IdeaSubmissionContent } from './IdeaReviewItem'
import IdeaShell from './IdeaShell'
import IdeaIcon from './IdeaIcon'
import SubmissionAccount from './SubmissionAccount'

export default function IdeaSubmissions({ locale }: { locale: Locale }) {
  const t = (en: string, bn: string) => locale === 'en' ? en : bn
  const session = useEcosystemSession(locale)
  const [items, setItems] = useState<Submission[]>([])
  const [selected, setSelected] = useState<Submission | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [canReview, setCanReview] = useState(false)
  const [loadedToken, setLoadedToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const request = useRef(0)
  const selectedRecord = useRef<HTMLDetailsElement>(null)
  const load = async (more = false) => {
    if (!session.auth) return
    const token = session.auth.token, sequence = ++request.current
    setBusy(true); setError('')
    try {
      const query = new URLSearchParams({ kind: 'idea' })
      const id = new URLSearchParams(location.search).get('submission')
      if (id) query.set('submission', id)
      if (more && cursor) query.set('before', cursor)
      const response = await fetch(`/api/ecosystem/submissions?${query}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15_000) })
      if (sequence !== request.current) return
      if (!response.ok) { if (response.status === 401) session.expire(); throw new Error(ecosystemError(response.status, locale)) }
      const data = await response.json()
      if (sequence !== request.current) return
      setItems(previous => more ? [...previous, ...data.submissions.filter((row: Submission) => !previous.some(p => p.id === row.id))] : data.submissions)
      setCanReview(data.canReview === true); setSelected(data.selected); setCursor(data.nextCursor); setLoadedToken(token)
      if (id && !data.selected) setError(t('This submission was not found in your account.', 'এই অ্যাকাউন্টে আইডিয়াটি খুঁজে পাওয়া যায়নি।'))
    } catch (cause) { if (sequence === request.current) setError(cause instanceof Error && cause.name === 'Error' ? cause.message : ecosystemError(503, locale)) }
    finally { if (sequence === request.current) setBusy(false) }
  }
  useEffect(() => { if (session.auth) void load(); return () => { request.current++ } }, [session.auth?.token, locale])
  const authorized = !!session.auth && loadedToken === session.auth.token
  const rows = selected && !items.some(item => item.id === selected.id) ? [selected, ...items] : items
  useEffect(() => {
    if (authorized && selected && selectedRecord.current) {
      selectedRecord.current.querySelector('summary')?.focus({ preventScroll: true })
      selectedRecord.current.scrollIntoView({ block: 'start' })
    }
  }, [authorized, selected?.id])
  return <IdeaShell locale={locale}><div className="submission-workspace">
    <div className="submission-topline"><a className="ideas-back" href={ideaPath(locale)}><IdeaIcon name="back" />{t('All ideas', 'সব আইডিয়া')}</a></div>
    <header className="submission-heading"><h1>{t('Your submissions', 'জমা দেওয়া আইডিয়া')}</h1><p>{t('Track your ideas and read reviewer feedback.', 'আইডিয়ার পর্যালোচনা কত দূর এগোল আর কী মন্তব্য এল, দেখে নিন।')}</p><SubmissionAccount auth={session.auth} locale={locale} disabled={busy} onSwitch={session.switchAccount} /></header>
    <div className="submission-toolbar">
      <a className="ideas-button" href={ideaPath(locale, 'add')}><IdeaIcon name="plus" />{t('Add an idea', 'আইডিয়া দিন')}</a>
      {session.auth && <button className="ideas-text-button" disabled={busy} onClick={() => load()}>{busy ? t('Loading…', 'লোড হচ্ছে…') : t('Refresh', 'রিফ্রেশ করুন')}</button>}
    </div>
    {!session.auth && <div className="submission-signin"><p>{t('Sign in with the account you used to submit your idea.', 'যে অ্যাকাউন্ট থেকে আইডিয়া জমা দিয়েছিলেন, সেটি দিয়ে সাইন ইন করুন।')}</p><button className="ideas-button ideas-button-secondary" onClick={session.signIn}>{t('Sign in to view', 'দেখতে সাইন ইন করুন')}</button></div>}
    {error && <p role="alert" className="ideas-error">{error}</p>}
    <div hidden={!authorized} className="submission-history">
      {canReview && <a className="ideas-inline-link" href={ideaPath(locale, 'review')}>{t('Review submissions', 'জমা দেওয়া তথ্য পর্যালোচনা করুন')}</a>}
      {!rows.length && !busy && !error && <p>{t('You haven’t submitted an idea yet.', 'এখনো কোনো আইডিয়া জমা দেননি।')}</p>}
      {rows.map(item => 'kind' in item.payload && <details key={item.id} ref={selected?.id === item.id ? selectedRecord : undefined} open={selected?.id === item.id ? true : undefined} className="submission-record">
        <summary><span className="submission-record-label"><span lang={item.payload.locale}>{item.payload.title}</span><span className="submission-status">{submissionStatus(item, locale)}<span aria-hidden="true"> · </span><time dateTime={item.created_at}>{submissionDate(item.created_at, locale)}</time></span></span><IdeaIcon name="chevron" /></summary>
        <div className="submission-record-body">
          {(item.decision_note || item.editorial_close_note) && <div className="submission-note">
            {item.editorial_close_note && <><h3>{t('Editorial update', 'সম্পাদনা দলের বার্তা')}</h3><p>{item.editorial_close_note}</p></>}
            {item.decision_note && <><h3>{t('Reviewer’s note', 'পর্যালোচকের মন্তব্য')}</h3><p>{item.decision_note}</p></>}
          </div>}
          {item.published && item.idea_id ? <a className="ideas-inline-link" href={ideaPath(locale, ideaSlug(item.idea_id))}>{item.payload.kind === 'idea-edit' ? t('View updated idea', 'বদলানো আইডিয়া দেখুন') : t('View published idea', 'প্রকাশিত আইডিয়া দেখুন')}</a> : item.idea_id ? <p className="ideas-field-help">{item.payload.kind === 'idea-edit' ? t('This update is not in the current release.', 'এই বদল এখনকার প্রকাশিত সংস্করণে নেই।') : t('The linked idea is currently unpublished.', 'লিংক করা আইডিয়াটি এখন প্রকাশিত নেই।')}</p> : item.status === 'approved' && !item.editorial_closed_at && <p>{item.payload.kind === 'idea-edit' ? t('We’ll check the change and prepare both languages before publication.', 'বদলটি যাচাই করে বাংলা ও ইংরেজিতে গুছিয়ে নেব।') : t('We’ll prepare the idea in English and Bangla before publication.', 'প্রকাশের আগে আইডিয়াটি বাংলা ও ইংরেজিতে গুছিয়ে নেব।')}</p>}
          <IdeaSubmissionContent idea={item.payload} locale={locale} showTitle={false} />
        </div>
      </details>)}
      {cursor && <button className="ideas-text-button" disabled={busy} onClick={() => load(true)}>{t('Load earlier submissions', 'আগের আইডিয়াগুলো দেখুন')}</button>}
    </div>{session.dialog}
  </div></IdeaShell>
}
