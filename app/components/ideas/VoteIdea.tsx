'use client'
import IdeaIcon from './IdeaIcon'
import { number } from './model'
import type { Locale } from './types'
import { useIdeaVotes } from './useIdeaVotes'

export function VoteButton({ id, title, locale, votes, compact = false }: {
  id: string; title: string; locale: Locale; votes: ReturnType<typeof useIdeaVotes>; compact?: boolean
}) {
  const en = locale === 'en', active = votes.voted.includes(id)
  const label = active ? (en ? 'Remove vote' : 'ভোট সরান') : (en ? 'Upvote' : 'ভোট দিন')
  const count = votes.counts[id]
  return <button className={compact ? 'ideas-vote' : 'ideas-vote ideas-vote-detail'} type="button"
    aria-label={`${label}: ${title}${count === undefined ? '' : ` (${number(count, locale)})`}`} title={label}
    aria-pressed={active} aria-busy={votes.pending === id} disabled={votes.loading || votes.pending !== null}
    onClick={() => void votes.toggle(id)}>
    <IdeaIcon name="upvote" />{!compact && <span>{active ? (en ? 'Upvoted' : 'ভোট দিয়েছেন') : label}</span>}
    <span className="ideas-vote-count">{count === undefined ? '—' : number(count, locale)}</span>
  </button>
}

export default function VoteIdea({ id, title, locale }: { id: string; title: string; locale: Locale }) {
  const votes = useIdeaVotes(locale)
  return <div className="ideas-vote-control">
    <VoteButton id={id} title={title} locale={locale} votes={votes} />
    {votes.error && <p className="ideas-error" role="alert">{votes.error.message}</p>}
    <span className="ideas-sr-only" role="status">{votes.announcement}</span>{votes.dialog}
  </div>
}
