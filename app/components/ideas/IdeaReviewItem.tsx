'use client'
import { useState, type FormEvent } from 'react'
import type { IdeaDecision, IdeaProposal, Locale } from '../../lib/ecosystem-types'
import { parseIdeaDecision } from '../../lib/ecosystem-input'

export default function IdeaReviewItem({ locale, item, note, onNote, busy, onDecision }: {
  locale: Locale; item: { id: string; revision: number; payload: IdeaProposal };
  busy: boolean; onDecision: (decision: IdeaDecision) => void
  note: string; onNote: (note: string) => void
}) {
  const t = (en: string, bn: string) => locale === 'en' ? en : bn
  const [error, setError] = useState('')
  const idea = item.payload
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const decision = parseIdeaDecision({ revision: item.revision, note, decision: (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') })
    if (!decision) { setError(t('Add a short review note.', 'পর্যালোচনার ছোট একটি মন্তব্য লিখুন।')); return }
    setError(''); onDecision(decision)
  }
  return <form className="ideas-draft-form review-form" onSubmit={submit}><fieldset disabled={busy}>
    <legend className="sr-only">{t('Review an idea', 'আইডিয়া পর্যালোচনা')}</legend>
    <IdeaSubmissionContent idea={idea} locale={locale} showTitle={false} />
    <label htmlFor="idea-review-note">{t('Message to the submitter', 'যিনি জমা দিয়েছেন, তাঁর জন্য মন্তব্য')}</label>
    <textarea id="idea-review-note" rows={3} required minLength={5} maxLength={1000} value={note} onChange={event => onNote(event.target.value)} />
    <p className="ideas-field-help">{t('The submitter can read this message. Acceptance starts editing; it does not publish the idea.', 'যিনি জমা দিয়েছেন, তিনি এই মন্তব্য দেখতে পাবেন। গ্রহণ করলে সম্পাদনার কাজ শুরু হবে, আইডিয়া প্রকাশ হবে না।')}</p>
    <div className="ideas-draft-bottom"><button className="ideas-button" name="decision" value="approved" type="submit">{t('Accept for editing', 'সম্পাদনার জন্য গ্রহণ করুন')}</button><button className="ideas-text-button" name="decision" value="rejected" type="submit">{t('Decline with note', 'মন্তব্যসহ ফেরত দিন')}</button></div>
    {error && <p role="alert" className="ideas-error">{error}</p>}
  </fieldset></form>
}

export function IdeaSubmissionContent({ idea, locale, showTitle = true }: { idea: IdeaProposal; locale: Locale; showTitle?: boolean }) {
  const t = (en: string, bn: string) => locale === 'en' ? en : bn
  return (
    <div className="review-submitted" lang={idea.locale}>{showTitle && <h2>{idea.title}</h2>}<p>{idea.solution}</p><h3 lang={locale}>{t('Who it helps', 'কাদের কাজে লাগবে')}</h3><p>{idea.customer}</p>
      {idea.problem && <><h3 lang={locale}>{t('The problem', 'সমস্যা')}</h3><p>{idea.problem}</p></>}
      {idea.place && <><h3 lang={locale}>{t('Location', 'জায়গা')}</h3><p>{idea.place}</p></>}
      {idea.evidence && <><h3 lang={locale}>{t('Research or links', 'গবেষণা বা লিংক')}</h3><p>{idea.evidence}</p></>}
      {idea.test && <><h3 lang={locale}>{t('First test', 'প্রথম পরীক্ষা')}</h3><p>{idea.test}</p></>}
    </div>
  )
}
