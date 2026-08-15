'use client'

import React, { useEffect, useState } from 'react'

type Locale = 'bn' | 'en'

const bengaliDigits = (value: number | string) =>
  String(value).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])

/** Must stay identical to `normalise` in Glossary.tsx: the server writes
 *  `data-find` with it and this reads the query with it. Duplicated rather than
 *  imported so the glossary JSON never follows a shared module into the client
 *  bundle. */
function normalise(value: string): string {
  return value
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^a-z0-9ঀ-৿]+/g, ' ')
    .trim()
}

const LABELS: Record<Locale, Record<string, string>> = {
  bn: {
    search: 'শব্দ খুঁজুন',
    placeholder: 'CAC, runway বা ভেস্টিং',
    area: 'বিষয় ধরে বাছুন',
    all: 'সব',
    clear: 'ফিল্টার মুছুন',
    empty: 'এই নামে কোনো শব্দ পাওয়া যায়নি। ইংরেজি বানানে চেষ্টা করে দেখুন।'
  },
  en: {
    search: 'Filter terms',
    placeholder: 'Try CAC, runway or vesting',
    area: 'Filter by area',
    all: 'All',
    clear: 'Clear filter',
    empty: 'No term matches that. Try the English spelling.'
  }
}

interface GlossaryControlsProps {
  locale: Locale
  total: number
  groups: { key: string; label: string }[]
}

/**
 * The lens, not the content. Every term is server-rendered into the static HTML
 * by <Glossary>; this only hides the rows that do not match, so the page is
 * complete and findable with browser search before any JavaScript runs, and the
 * controls are in the HTML from the first paint rather than arriving late and
 * pushing the reading down.
 */
export default function GlossaryControls({ locale, total, groups }: GlossaryControlsProps) {
  const isEn = locale === 'en'
  const labels = LABELS[locale]
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('')
  const [shown, setShown] = useState(total)
  const num = (value: number) => (isEn ? String(value) : bengaliDigits(value))

  useEffect(() => {
    const terms = normalise(query).split(' ').filter(Boolean)
    const filtering = terms.length > 0 || group !== ''
    let visible = 0

    for (const row of document.querySelectorAll<HTMLElement>('.glossary-entry, .glossary-xref')) {
      const find = row.dataset.find || ''
      const matches =
        (!group || row.dataset.group === group) && terms.every((term) => find.includes(term))
      row.hidden = !matches
      if (matches && row.classList.contains('glossary-entry')) visible += 1
    }

    const liveLetters = new Set<string>()
    for (const block of document.querySelectorAll<HTMLElement>('.glossary-letter-block')) {
      const survivor = block.querySelector('.glossary-entry:not([hidden]), .glossary-xref:not([hidden])')
      block.hidden = !survivor
      if (survivor) liveLetters.add(block.dataset.letter || '')
    }

    for (const link of document.querySelectorAll<HTMLAnchorElement>('.glossary-alphabet a')) {
      link.classList.toggle('is-empty', !liveLetters.has(link.dataset.letter || ''))
    }

    const starters = document.querySelector<HTMLElement>('[data-glossary-starters]')
    if (starters) starters.hidden = filtering

    setShown(visible)
  }, [query, group])

  // A "see also" link can point at a term the current filter is hiding, and
  // following it would otherwise scroll the reader to a row that is not there.
  // The link wins: the filter clears and the entry is where it says it is.
  useEffect(() => {
    const onHashChange = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return
      const target = document.getElementById(id)
      if (!target?.hidden) return
      setQuery('')
      setGroup('')
      requestAnimationFrame(() => target.scrollIntoView({ behavior: 'auto', block: 'start' }))
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const reset = () => {
    setQuery('')
    setGroup('')
  }

  const filtering = query.trim() !== '' || group !== ''

  return (
    <div className="glossary-controls" role="search" data-pagefind-ignore>
      <div className="glossary-controls__row">
        <label className="glossary-search">
          <span>{labels.search}</span>
          <input
            type="search"
            value={query}
            placeholder={labels.placeholder}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setQuery('')
            }}
          />
        </label>
        <p className="glossary-count" aria-live="polite">
          {filtering
            ? isEn
              ? `${num(shown)} of ${num(total)}`
              : `${num(total)}টির মধ্যে ${num(shown)}টি`
            : isEn
              ? `${num(total)} terms`
              : `${num(total)}টি শব্দ`}
        </p>
      </div>

      <div className="glossary-groups" role="group" aria-label={labels.area}>
        <button
          type="button"
          aria-pressed={group === ''}
          onClick={() => setGroup('')}
        >
          {labels.all}
        </button>
        {groups.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={group === item.key}
            onClick={() => setGroup(group === item.key ? '' : item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filtering && shown === 0 && (
        <div className="glossary-empty">
          <p>{labels.empty}</p>
          <button type="button" className="glossary-reset" onClick={reset}>
            {labels.clear}
          </button>
        </div>
      )}
    </div>
  )
}
