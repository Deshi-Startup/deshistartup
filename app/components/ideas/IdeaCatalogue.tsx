'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { IdeaSummary, Locale, Place, Sector } from './types'
import { defaultFilters, filterQuery, ideaPath, kindFilters, kindLabel, matchingIdeas, number, parseFilters, places, sectors, type Filters } from './model'
import { useShortlist } from './useShortlist'
import IdeaShell from './IdeaShell'
import IdeaIcon from './IdeaIcon'

export default function IdeaCatalogue({ locale, ideas }: { locale: Locale; ideas: IdeaSummary[] }) {
  const en = locale === 'en'
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [urlReady, setUrlReady] = useState(false)
  const [message, setMessage] = useState('')
  const { saved, ready, error, toggle } = useShortlist(ideas)
  const resultHeading = useRef<HTMLHeadingElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const saveButtons = useRef(new Map<string, HTMLButtonElement>())
  useEffect(() => {
    const read = () => { setFilters(parseFilters(window.location.search)); setUrlReady(true) }
    read(); window.addEventListener('popstate', read)
    return () => window.removeEventListener('popstate', read)
  }, [])
  useEffect(() => {
    if (!urlReady) return
    const timer = window.setTimeout(() => {
      const query = filterQuery(filters)
      if (window.location.search !== query) window.history.replaceState(window.history.state, '', `${window.location.pathname}${query}${window.location.hash}`)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [filters, urlReady])
  const results = useMemo(() => matchingIdeas(ideas, filters, saved), [ideas, filters, saved])
  const savedCount = ideas.filter(idea => saved.includes(idea.id)).length
  const sectorOptions = Object.entries(sectors).filter(([value]) => value === filters.sector || ideas.some(idea => idea.sector === value))
  const placeOptions = Object.entries(places).filter(([value]) => value === filters.place || ideas.some(idea => idea.places.includes(value as Place)))
  const typeOptions = kindFilters.filter(option => !option.value || option.value === filters.kind || ideas.some(idea => idea.kind === option.value))
  const hasFilters = Boolean(filters.q || filters.sector || filters.place || filters.kind || filters.problem)
  function update(next: Filters) {
    setFilters(next)
    const target = `${window.location.pathname}${filterQuery(next)}${window.location.hash}`
    if (target !== `${window.location.pathname}${window.location.search}${window.location.hash}`) window.history.pushState(window.history.state, '', target)
  }
  function clear() { update({ ...defaultFilters, saved: filters.saved }); searchRef.current?.focus() }
  function browseAll() { update({ ...defaultFilters }); searchRef.current?.focus() }
  function save(id: string) {
    const index = results.findIndex(idea => idea.id === id)
    const isRemoving = filters.saved && saved.includes(id)
    if (!toggle(id)) return
    setMessage(en ? 'Saved list updated.' : 'সেভ করা তালিকা বদলানো হয়েছে।')
    if (isRemoving) {
      const focusId = results[index + 1]?.id || results[index - 1]?.id
      window.requestAnimationFrame(() => { const button = focusId && saveButtons.current.get(focusId); if (button) button.focus(); else resultHeading.current?.focus() })
    }
  }
  return <IdeaShell locale={locale}>
    <header className="ideas-catalogue-intro ideas-catalogue-hero">
      <h1>{en ? <>Problems worth <span>solving.</span></> : <>কোন সমস্যা নিয়ে <span>কাজ করবেন?</span></>}</h1>
      <div className="ideas-catalogue-invitation">
        <p className="ideas-lead">{en ? 'Explore practical startup ideas for Bangladesh. Find who they could help, ways to earn, and a small first test.' : 'বাংলাদেশের জন্য স্টার্টআপ আইডিয়া খুঁজে নিন। কাদের কাজে লাগবে, আয়ের উপায় কী আর ছোট করে কীভাবে পরীক্ষা করবেন, জেনে নিন।'}</p>
        <a className="ideas-button" href={ideaPath(locale, 'add')}><IdeaIcon name="plus" />{en ? 'Suggest an idea' : 'আইডিয়া দিন'}</a>
      </div>
    </header>
    <div className="ideas-filters ideas-catalogue-filters" role="search" aria-label={en ? 'Filter ideas' : 'আইডিয়া বাছাই করুন'}>
      <label className="ideas-search"><span className="ideas-sr-only">{en ? 'Search ideas' : 'আইডিয়া খুঁজুন'}</span><IdeaIcon name="search" /><input ref={searchRef} type="search" maxLength={120} value={filters.q} placeholder={en ? 'Search ideas…' : 'আইডিয়া খুঁজুন…'} onChange={event => setFilters(current => ({ ...current, q: event.target.value }))} /></label>
      <label className="ideas-select"><span className="ideas-sr-only">{en ? 'Sector' : 'খাত'}</span><select value={filters.sector} onChange={event => update({ ...filters, sector: event.target.value })}><option value="">{en ? 'All sectors' : 'সব খাত'}</option>{sectorOptions.map(([value, label]) => <option key={value} value={value}>{label[locale]}</option>)}</select></label>
      <label className="ideas-select"><span className="ideas-sr-only">{en ? 'Location' : 'জায়গা'}</span><select value={filters.place} onChange={event => update({ ...filters, place: event.target.value })}><option value="">{en ? 'All locations' : 'সব জায়গা'}</option>{placeOptions.map(([value, label]) => <option key={value} value={value}>{label[locale]}</option>)}</select></label>
    </div>
    <div className="ideas-kinds" role="group" aria-label={en ? 'Idea type' : 'আইডিয়ার ধরন'}>
      {typeOptions.map(option => <button key={option.value} type="button" aria-pressed={filters.kind === option.value} onClick={() => update({ ...filters, kind: option.value })}>{option.label[locale]}</button>)}
    </div>
    <div className="ideas-results-toolbar"><h2 ref={resultHeading} tabIndex={-1} className="ideas-result-count" aria-live="polite">{en ? `${number(results.length, locale)} ${results.length === 1 ? 'idea' : 'ideas'}` : `${number(results.length, locale)}টি আইডিয়া`}</h2>{hasFilters && <button className="ideas-text-button ideas-clear" type="button" onClick={clear}>{en ? 'Clear filters' : 'ফিল্টার সরান'}</button>}<button className="ideas-saved-filter" type="button" aria-pressed={filters.saved} disabled={!ready} onClick={() => update({ ...filters, saved: !filters.saved })}><IdeaIcon name="bookmark" filled={filters.saved} />{en ? 'Saved' : 'সেভ করা'}{ready && savedCount > 0 && <span>{number(savedCount, locale)}</span>}</button></div>
    {filters.saved && <p className="ideas-browser-note">{en ? 'Saved on this browser only.' : 'সেভ করা তালিকা এই ব্রাউজারেই থাকে।'}</p>}
    {error && <p className="ideas-error" role="alert">{en ? 'Your saved list could not be updated. Allow site storage and try again.' : 'ব্রাউজারে তালিকাটি সেভ করা যায়নি। সাইটের স্টোরেজ চালু করে আবার চেষ্টা করুন।'}</p>}
    <p className="ideas-sr-only" role="status">{message}</p>
    {results.length ? <div className="ideas-list">{results.map(idea => {
      const active = saved.includes(idea.id)
      const label = active ? (en ? 'Remove from saved' : 'সেভ করা থেকে সরান') : (en ? 'Save idea' : 'আইডিয়া সেভ করুন')
      return <article className="ideas-row" key={idea.id}>
        <p className="ideas-row-sector">{sectors[idea.sector as Sector]?.[locale] || idea.sector}</p>
        <div className="ideas-row-copy">
          <h3><a href={ideaPath(locale, idea.slug)}>{idea.title}</a></h3>
          <p className="ideas-row-summary">{idea.summary}</p>
          <p className="ideas-row-meta">{kindLabel(idea.kind, locale)}<span aria-hidden="true"> · </span>{idea.places.map(place => places[place as Place]?.[locale] || place).join(' · ')}</p>
        </div>
        <button ref={element => { if (element) saveButtons.current.set(idea.id, element); else saveButtons.current.delete(idea.id) }} className="ideas-bookmark" type="button" aria-label={`${label}: ${idea.title}`} title={label} aria-pressed={active} disabled={!ready} onClick={() => save(idea.id)}><IdeaIcon name="bookmark" filled={active} /></button>
      </article>
    })}</div> : <div className="ideas-empty"><IdeaIcon name={filters.saved && !savedCount ? 'bookmark' : 'search'} /><h3>{filters.saved && !savedCount ? (en ? 'No saved ideas yet.' : 'এখনো কোনো আইডিয়া সেভ করেননি।') : (en ? 'No matching ideas.' : 'মিলে যায় এমন কোনো আইডিয়া পাওয়া যায়নি।')}</h3><p>{filters.saved && !savedCount ? (en ? 'Use the bookmark beside an idea to save it.' : 'আইডিয়ার পাশের বুকমার্কে চাপ দিয়ে নিজের তালিকায় রেখে দিতে পারেন।') : (en ? 'Try a broader search or clear your filters.' : 'অন্য শব্দ দিয়ে খুঁজুন বা ফিল্টার সরিয়ে দেখুন।')}</p><button className="ideas-button ideas-button-secondary" type="button" onClick={browseAll}>{en ? 'Browse all ideas' : 'সব আইডিয়া দেখুন'}</button></div>}
  </IdeaShell>
}
