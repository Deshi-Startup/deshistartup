'use client'
import { useState, type FormEvent } from 'react'
import type { IdeaDecision, IdeaProposal, IdeaEditProposal, Locale } from '../../lib/ecosystem-types'
import { parseIdeaDecision } from '../../lib/ecosystem-input'
import { ideaEditLabels } from '../../lib/idea-edit'
import { ideaPath, ideaSlug } from './model'

export default function IdeaReviewItem({ locale, item, note, onNote, busy, onDecision }: {
  locale: Locale; item: { id: string; revision: number; payload: IdeaProposal | IdeaEditProposal };
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
    <legend className="sr-only">{idea.kind === 'idea-edit' ? t('Review an idea edit', 'আইডিয়ার বদল পর্যালোচনা') : t('Review an idea', 'আইডিয়া পর্যালোচনা')}</legend>
    <IdeaSubmissionContent idea={idea} locale={locale} showTitle={false} />
    <label htmlFor="idea-review-note">{t('Message to the submitter', 'যিনি জমা দিয়েছেন, তাঁর জন্য মন্তব্য')}</label>
    <textarea id="idea-review-note" rows={3} required minLength={5} maxLength={1000} value={note} onChange={event => onNote(event.target.value)} />
    <p className="ideas-field-help">{idea.kind === 'idea-edit'
      ? t('The submitter can read this message. Acceptance queues the update for editorial work; it does not change the live page.', 'যিনি জমা দিয়েছেন, তিনি এই মন্তব্য দেখতে পাবেন। গ্রহণ করলে সম্পাদকীয় কাজের তালিকায় যাবে; প্রকাশিত পাতা বদলাবে না।')
      : t('The submitter can read this message. Acceptance starts editing; it does not publish the idea.', 'যিনি জমা দিয়েছেন, তিনি এই মন্তব্য দেখতে পাবেন। গ্রহণ করলে সম্পাদনার কাজ শুরু হবে, আইডিয়া প্রকাশ হবে না।')}</p>
    <div className="ideas-draft-bottom"><button className="ideas-button" name="decision" value="approved" type="submit">{idea.kind === 'idea-edit' ? t('Accept update', 'বদল গ্রহণ করুন') : t('Accept for editing', 'সম্পাদনার জন্য গ্রহণ করুন')}</button><button className="ideas-text-button" name="decision" value="rejected" type="submit">{t('Decline with note', 'মন্তব্যসহ ফেরত দিন')}</button></div>
    {error && <p role="alert" className="ideas-error">{error}</p>}
  </fieldset></form>
}

export function IdeaSubmissionContent({ idea, locale, showTitle = true }: { idea: IdeaProposal | IdeaEditProposal; locale: Locale; showTitle?: boolean }) {
  const t = (en: string, bn: string) => locale === 'en' ? en : bn
  if (idea.kind === 'idea-edit') return <div className="review-submitted idea-edit-comparison" lang={idea.locale}>
    {showTitle && <h2>{idea.title}</h2>}
    <p><a href={ideaPath(locale, ideaSlug(idea.ideaId))}>{t('View idea page', 'আইডিয়ার পাতা দেখুন')}</a></p>
    {idea.changes.map(change => <section key={change.field}>
      <h3>{ideaEditLabels[change.field][idea.locale]}{['customer', 'context', 'unknown'].includes(change.field) && <small className="ideas-field-help"> · {t('Shared with related ideas', 'সম্পর্কিত আইডিয়াতেও দেখাবে')}</small>}</h3>
      <div className="idea-edit-diff"><div><small lang={locale}>{t('Before', 'আগে')}</small><p>{change.before}</p></div><div><small lang={locale}>{t('Proposed', 'প্রস্তাবিত')}</small><p>{change.after}</p></div></div>
    </section>)}
    {idea.note && <><h3 lang={locale}>{t('More context', 'আরও তথ্য')}</h3><p>{idea.note}</p></>}
    {idea.sourceUrl && <p><a href={idea.sourceUrl} target="_blank" rel="noopener noreferrer">{t('Submitted source', 'জমা দেওয়া সোর্স')}</a></p>}
  </div>
  return (
    <div className="review-submitted" lang={idea.locale}>{showTitle && <h2>{idea.title}</h2>}<p>{idea.solution}</p><h3 lang={locale}>{t('Who it helps', 'কাদের কাজে লাগবে')}</h3><p>{idea.customer}</p>
      {idea.problem && <><h3 lang={locale}>{t('The problem', 'সমস্যা')}</h3><p>{idea.problem}</p></>}
      {idea.place && <><h3 lang={locale}>{t('Location', 'জায়গা')}</h3><p>{idea.place}</p></>}
      {idea.evidence && <><h3 lang={locale}>{t('Research or links', 'গবেষণা বা লিংক')}</h3><p>{idea.evidence}</p></>}
      {idea.test && <><h3 lang={locale}>{t('First test', 'প্রথম পরীক্ষা')}</h3><p>{idea.test}</p></>}
    </div>
  )
}
