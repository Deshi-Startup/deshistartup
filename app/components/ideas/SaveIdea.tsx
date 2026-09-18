'use client'
import type { Locale } from './types'
import { useShortlist } from './useShortlist'
import IdeaIcon from './IdeaIcon'
import type { SavedIdea } from './model'

export default function SaveIdea({ id, locale, ideas }: { id: string; locale: Locale; ideas: SavedIdea[] }) {
  const { saved, ready, error, toggle } = useShortlist(ideas)
  const active = saved.includes(id)
  return <div className="ideas-save-control">
    <button className="ideas-button ideas-button-secondary" type="button" disabled={!ready} aria-pressed={active} onClick={() => toggle(id)}>
      <IdeaIcon name="bookmark" filled={active} />
      {active ? (locale === 'en' ? 'Saved' : 'সেভ করা আছে') : (locale === 'en' ? 'Save idea' : 'সেভ করুন')}
    </button>
    {error && <p className="ideas-error" role="alert">{locale === 'en' ? 'Could not save. Allow site storage and try again.' : 'সেভ করা যায়নি। সাইটের স্টোরেজ চালু করে আবার চেষ্টা করুন।'}</p>}
  </div>
}
