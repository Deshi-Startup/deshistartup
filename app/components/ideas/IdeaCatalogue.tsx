'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Heartbeat, IdeaSummary, Locale, Place, Sector } from './types'
import { defaultFilters, filterQuery, forLabel, ideaPath, kindFilters, kindLabel, matchingIdeas, number, parseFilters, places, sectors, stepProgressLabel, stepsDone, type Filters } from './model'
import { useShortlist } from './useShortlist'
import { useSteps } from './useSteps'
import IdeaShell from './IdeaShell'
import IdeaIcon from './IdeaIcon'

export default function IdeaCatalogue({ locale, ideas, heartbeat }: { locale: Locale; ideas: IdeaSummary[]; heartbeat: Heartbeat }) {
  const en = locale === 'en'
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [urlReady, setUrlReady] = useState(false)
  const [message, setMessage] = useState('')
  const { saved, ready, error, toggle } = useShortlist(ideas)
  const { progress } = useSteps()
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
    setMessage(en ? 'Saved list updated.' : 'তালিকা বদলানো হয়েছে।')
    if (isRemoving) {
      const focusId = results[index + 1]?.id || results[index - 1]?.id
      window.requestAnimationFrame(() => { const button = focusId && saveButtons.current.get(focusId); if (button) button.focus(); else resultHeading.current?.focus() })
    }
  }
  return <IdeaShell locale={locale}>
    <header className="ideas-catalogue-intro ideas-catalogue-hero">
      <h1>{en ? <>Problems worth{' '}<br /><span>solving.</span></> : <>কোন সমস্যা নিয়ে{' '}<br /><span>কাজ করবেন?</span></>}</h1>
      <div className="ideas-catalogue-invitation">
        <p className="ideas-lead">{en ? 'Startup ideas drawn from real problems in Bangladesh. Each one names who it helps, how it could earn, and the first three things to do, so you can start testing this week.' : 'বাংলাদেশের সত্যিকারের সমস্যা থেকে বাছাই করা স্টার্টআপ আইডিয়া। কাদের কাজে লাগবে, আয় কোথা থেকে আসতে পারে আর প্রথম তিনটা কাজ কী, সব এক পাতায়। এই সপ্তাহেই পরীক্ষা শুরু করা যায়।'}</p>
        <p className="ideas-heartbeat"><span className="ideas-heartbeat-dot" aria-hidden="true" /><strong>{en ? `${number(ideas.length, locale)} ideas` : `${number(ideas.length, locale)}টি আইডিয়া`}</strong><span aria-hidden="true"> · </span>{en ? `${number(heartbeat.sectors, locale)} sectors` : `${number(heartbeat.sectors, locale)}টি খাত`}<span aria-hidden="true"> · </span>{en ? `Newest added ${heartbeat.newest}` : `সর্বশেষ যোগ হয়েছে ${heartbeat.newest}`}</p>
        <a className="ideas-button" href={ideaPath(locale, 'add')}><IdeaIcon name="plus" />{en ? 'Suggest an idea' : 'আইডিয়া দিন'}</a>
      </div>
    </header>
    <div className="ideas-filters ideas-catalogue-filters" role="search" aria-label={en ? 'Filter ideas' : 'আইডিয়া বাছাই করুন'}>
      <label className="ideas-search"><span className="ideas-sr-only">{en ? 'Search ideas' : 'আইডিয়া খুঁজুন'}</span><IdeaIcon name="search" /><input ref={searchRef} type="search" maxLength={120} value={filters.q} placeholder={en ? 'Search ideas…' : 'আইডিয়া খুঁজুন…'} onChange={event => setFilters(current => ({ ...current, q: event.target.value }))} /></label>
      <label className="ideas-select"><span className="ideas-sr-only">{en ? 'Sector' : 'খাত'}</span><select value={filters.sector} onChange={event => update({ ...filters, sector: event.target.value })}><option value="">{en ? 'All sectors' : 'সব খাত'}</option>{Object.entries(sectors).map(([value, label]) => <option key={value} value={value}>{label[locale]}</option>)}</select></label>
      <label className="ideas-select"><span className="ideas-sr-only">{en ? 'Location' : 'জায়গা'}</span><select value={filters.place} onChange={event => update({ ...filters, place: event.target.value })}><option value="">{en ? 'All locations' : 'সব জায়গা'}</option>{Object.entries(places).map(([value, label]) => <option key={value} value={value}>{label[locale]}</option>)}</select></label>
    </div>
    <div className="ideas-kinds" role="group" aria-label={en ? 'What it takes to start' : 'শুরু করতে যা লাগবে'}>
      {kindFilters.map(option => <button key={option.value} type="button" aria-pressed={filters.kind === option.value} onClick={() => update({ ...filters, kind: option.value })}>{option.label[locale]}</button>)}
      <span className="ideas-kinds-help">{en ? 'Service and workflow ideas can start with a phone and a notebook.' : 'সেবা আর কাজের পদ্ধতির আইডিয়া ফোন আর একটা খাতা দিয়েই শুরু করা যায়।'}</span>
    </div>
    <div className="ideas-results-toolbar"><div className="ideas-collection" role="group" aria-label={en ? 'Collection' : 'তালিকা'}><button type="button" aria-pressed={!filters.saved} onClick={() => update({ ...filters, saved: false })}>{en ? 'All ideas' : 'সব আইডিয়া'}</button><button type="button" aria-pressed={filters.saved} disabled={!ready} onClick={() => update({ ...filters, saved: true })}><IdeaIcon name="bookmark" filled={filters.saved} />{en ? 'Saved' : 'সেভ করা'}{ready && savedCount > 0 && <span>{number(savedCount, locale)}</span>}</button></div><h2 ref={resultHeading} tabIndex={-1} className="ideas-result-count" aria-live="polite">{number(results.length, locale)} {en ? (results.length === 1 ? 'idea' : 'ideas') : 'টি আইডিয়া'}</h2>{hasFilters && <button className="ideas-text-button ideas-clear" type="button" onClick={clear}>{en ? 'Clear filters' : 'ফিল্টার সরান'}</button>}</div>
    {filters.saved && <p className="ideas-browser-note">{en ? 'Saved on this browser only.' : 'সেভ করা তালিকা এই ব্রাউজারেই থাকে।'}</p>}
    {error && <p className="ideas-error" role="alert">{en ? 'Your saved list could not be updated. Allow site storage and try again.' : 'ব্রাউজারে তালিকাটি সেভ করা যায়নি। সাইটের স্টোরেজ চালু করে আবার চেষ্টা করুন।'}</p>}
    <p className="ideas-sr-only" role="status">{message}</p>
    {results.length ? <div className="ideas-list">{results.map(idea => {
      const active = saved.includes(idea.id)
      const label = active ? (en ? 'Remove from saved' : 'সেভ করা থেকে সরান') : (en ? 'Save idea' : 'আইডিয়া সেভ করুন')
      return <article className="ideas-row" key={idea.id}>
        <p className="ideas-row-sector"><IdeaIcon name={idea.sector} />{sectors[idea.sector as Sector]?.[locale] || idea.sector}</p>
        <div className="ideas-row-copy">
          <h3><a href={ideaPath(locale, idea.slug)}>{idea.title}</a></h3>
          <p className="ideas-row-for"><span>{forLabel(locale)}</span>{idea.customer}</p>
          <p className="ideas-row-summary">{idea.summary}</p>
          <p className="ideas-chips">{filters.saved && <span className={`ideas-chip ideas-chip-progress${stepsDone(progress, idea.id, idea.steps) >= idea.steps ? ' ideas-chip-done' : ''}`}><span className="ideas-chip-bar" aria-hidden="true"><span style={{ width: `${Math.round(stepsDone(progress, idea.id, idea.steps) / idea.steps * 100)}%` }} /></span>{stepProgressLabel(stepsDone(progress, idea.id, idea.steps), idea.steps, locale)}</span>}<span className="ideas-chip">{kindLabel(idea.kind, locale)}</span><span className="ideas-chip">{idea.places.map(place => places[place as Place]?.[locale] || place).join(' · ')}</span>{idea.isNew && <span className="ideas-chip ideas-chip-new">{en ? 'New' : 'নতুন'}</span>}</p>
        </div>
        <button ref={element => { if (element) saveButtons.current.set(idea.id, element); else saveButtons.current.delete(idea.id) }} className="ideas-bookmark" type="button" aria-label={`${label}: ${idea.title}`} title={label} aria-pressed={active} disabled={!ready} onClick={() => save(idea.id)}><IdeaIcon name="bookmark" filled={active} /></button>
      </article>
    })}</div> : <div className="ideas-empty"><IdeaIcon name={filters.saved && !savedCount ? 'bookmark' : 'search'} /><h3>{filters.saved && !savedCount ? (en ? 'No saved ideas yet.' : 'এখনো কোনো আইডিয়া সেভ করেননি।') : (en ? 'No matching ideas.' : 'মিলে যায় এমন আইডিয়া পাওয়া যায়নি।')}</h3><p>{filters.saved && !savedCount ? (en ? 'Use the bookmark beside an idea to save it.' : 'আইডিয়ার পাশের বুকমার্ক চাপলে নিজের তালিকায় রাখতে পারবেন।') : (en ? 'Try a broader search or clear your filters.' : 'অন্য শব্দ দিয়ে খুঁজুন বা ফিল্টার সরিয়ে দেখুন।')}</p><button className="ideas-button ideas-button-secondary" type="button" onClick={browseAll}>{en ? 'Browse all ideas' : 'সব আইডিয়া দেখুন'}</button></div>}
  </IdeaShell>
}
