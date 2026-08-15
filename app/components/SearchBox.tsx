'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  trackSearchOnce,
  trackSearchResultSelect,
  type SearchReportState
} from '../lib/search-analytics'

interface PagefindItem {
  id: string
  data: () => Promise<{
    url: string
    meta?: {
      title?: string
      stub?: boolean | string | number
    }
    title?: string
    excerpt?: string
    content?: string
  }>
}

interface Pagefind {
  search: (query: string) => Promise<{
    results: PagefindItem[]
  }>
  options: (opts: {
    baseUrl: string
    ranking?: {
      metaWeights?: Record<string, number>
    }
  }) => Promise<void>
}

// Extend global window interface
declare global {
  interface Window {
    pagefind?: Pagefind
  }
}

let pagefindPromise: Promise<Pagefind> | null = null

const bengaliDigits = (value: number | string) => String(value).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])

async function loadPagefind(basePath = ''): Promise<Pagefind | null> {
  if (typeof window === 'undefined') return null

  if (!window.pagefind) {
    if (!pagefindPromise) {
      const pagefindUrl = `${basePath}/_pagefind/pagefind.js`
      // @ts-ignore
      pagefindPromise = import(/* webpackIgnore: true */ pagefindUrl).then((module) => {
        window.pagefind = module
        return window.pagefind!
          .options({
            baseUrl: basePath || '/',
            ranking: {
              // The translated page title is a search alias, not a second
              // result title. Keep the visible title's built-in 5x lead while
              // making an equivalent query in the other site language rank
              // well above an incidental body-text match.
              metaWeights: { 'alternate-title': 4 }
            }
          })
          .then(() => window.pagefind!)
      })
    }
    await pagefindPromise
  }

  return window.pagefind || null
}

function cleanTitle(data: any) {
  return data?.meta?.title || data?.title || data?.url || ''
}

/* Pagefind indexes the h1 as the first words of the page, so nearly every
   excerpt opened by restating the title printed directly above it – the reader
   had to get past a line they had already read to reach the first new word.
   Drop that opening, including the partial the excerpt window sometimes starts
   mid-title with, and the separator the h1 leaves behind. */
function stripTitleEcho(excerpt: string, title: string) {
  const trimmed = title.trim()
  if (!trimmed) return excerpt
  const words = trimmed.split(/\s+/)
  for (let start = 0; start < words.length; start += 1) {
    const candidate = words.slice(start).join(' ')
    if (candidate.length > 3 && excerpt.startsWith(candidate)) {
      return excerpt.slice(candidate.length).replace(/^[\s.।,–—-]+/, '')
    }
  }
  return excerpt
}

function cleanExcerpt(data: any, title: string) {
  const raw = data?.excerpt
    ? data.excerpt.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    : (data?.content || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 160)
  return stripTitleEcho(raw, title)
}

interface SearchResult {
  id: string
  url: string
  title: string
  excerpt: string
  isStub: boolean
}

interface SearchBoxProps {
  isEn?: boolean
}

export default function SearchBox({ isEn = false }: SearchBoxProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const searchReportRef = useRef<SearchReportState>({ term: null })
  const listboxId = `${useId()}listbox`
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState(false)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const optionId = (index: number) => `${listboxId}-option-${index}`
  // The popup only counts as a combobox listbox when it actually holds options;
  // the loading, error, and no-match panels are announced by the status region.
  const hasListbox = isOpen && !isLoading && !error && results.length > 0

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isSearchShortcut =
        (event.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || '')) ||
        (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey) && !event.shiftKey)

      if (isSearchShortcut) {
        event.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const trimmedQuery = query.trim()
    searchReportRef.current.term = null
    setActiveIndex(-1)

    if (!trimmedQuery) {
      setResults([])
      setIsOpen(false)
      setError(false)
      return undefined
    }

    let isActive = true
    let reportTimeout = 0
    const timeout = window.setTimeout(async () => {
      setIsLoading(true)
      setError(false)

      try {
        const pagefind = await loadPagefind(basePath)
        if (!pagefind || !isActive) return

        const response = await pagefind.search(trimmedQuery)
        const searchResults = await Promise.all(
          response.results.slice(0, 10).map(async (item) => {
            const data = await item.data()
            const title = cleanTitle(data)
            return {
              id: item.id,
              url: data.url,
              title,
              excerpt: cleanExcerpt(data, title),
              isStub: Boolean(data?.meta?.stub)
            }
          })
        )

        // Finished guides first; unwritten topics follow, clearly badged.
        const ranked = [
          ...searchResults.filter((r) => !r.isStub),
          ...searchResults.filter((r) => r.isStub)
        ].slice(0, 8)

        if (isActive) {
          setResults(ranked)
          setActiveIndex(-1)
          setIsOpen(true)

          /* Typing "ট্রেড লাইসেন্স" would otherwise report eleven searches, one
             per keystroke, and bury the query the reader actually meant under
             ten prefixes of it. The next keystroke re-runs this effect and the
             cleanup below cancels this timer, so only a query left alone long
             enough to be read is counted. */
          reportTimeout = window.setTimeout(() => {
            trackSearchOnce(searchReportRef.current, trimmedQuery, ranked.length, isEn)
          }, 900)
        }
      } catch {
        if (isActive) {
          setError(true)
          setResults([])
          setIsOpen(true)
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }, 180)

    return () => {
      isActive = false
      window.clearTimeout(timeout)
      window.clearTimeout(reportTimeout)
    }
  }, [query, basePath, isEn])

  // Keep the arrow-selected option inside the scrolling popover.
  useEffect(() => {
    if (activeIndex < 0) return
    document
      .getElementById(optionId(activeIndex))
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [activeIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // `selected` is absent when the reader leaves for the sitemap rather than for
  // a result, which is a different thing to have happened and stays uncounted.
  const goTo = (url: string, selected?: { index: number; isStub: boolean }) => {
    const nextUrl = basePath && url.startsWith(basePath) ? url.slice(basePath.length) || '/' : url
    if (selected) {
      // Selecting a result is conclusive intent. Flush the settled-search event
      // now in case this reader was faster than the quiet-period timer.
      trackSearchOnce(searchReportRef.current, query, results.length, isEn)
      trackSearchResultSelect(query, { url: nextUrl, ...selected }, isEn)
    }
    router.push(nextUrl)
    setQuery('')
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const moveActive = (step: number) => {
    if (results.length === 0) return
    setIsOpen(true)
    setActiveIndex((current) => {
      const next = current + step
      if (next < 0) return results.length - 1
      if (next > results.length - 1) return 0
      return next
    })
  }

  // Focus stays on the input throughout (aria-activedescendant), so the popover
  // closes on focusout only when focus actually leaves the whole widget.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        moveActive(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveActive(-1)
        break
      case 'Home':
        if (!isOpen || results.length === 0) break
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        if (!isOpen || results.length === 0) break
        event.preventDefault()
        setActiveIndex(results.length - 1)
        break
      case 'Escape':
        event.preventDefault()
        if (isOpen) setIsOpen(false)
        else setQuery('')
        setActiveIndex(-1)
        inputRef.current?.focus()
        break
      default:
        break
    }
  }

  const placeholder = isEn
    ? 'Search: trade license, bKash, VAT…'
    : 'খুঁজুন: ট্রেড লাইসেন্স, বিকাশ, ভ্যাট…'

  const sitemapHref = `${basePath}${isEn ? '/en/sitemap' : '/sitemap'}`

  const liveStatus = () => {
    if (!isOpen) return ''
    if (isLoading) return isEn ? 'Searching…' : 'খোঁজা হচ্ছে…'
    if (error) return isEn ? 'Search is unavailable right now.' : 'সার্চ এখন কাজ করছে না।'
    if (results.length === 0) return isEn ? 'No results found.' : 'কোনো মিল পাওয়া যায়নি।'
    return isEn
      ? `${results.length} results. Use the up and down arrow keys to choose.`
      : `${bengaliDigits(results.length)}টি ফলাফল। ওপর-নিচের তীর দিয়ে বেছে নিন।`
  }

  return (
    <form
      className="search"
      role="search"
      aria-label={isEn ? 'Search Deshi Startup' : 'দেশি স্টার্টআপে খুঁজুন'}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setIsOpen(false)
          setActiveIndex(-1)
        }
      }}
      onSubmit={(event) => {
        event.preventDefault()
        const targetIndex = activeIndex >= 0 ? activeIndex : 0
        const target = results[targetIndex]
        if (target) goTo(target.url, { index: targetIndex, isStub: target.isStub })
      }}
    >
      <input
        ref={inputRef}
        type="search"
        value={query}
        placeholder={placeholder}
        aria-label={placeholder}
        role="combobox"
        aria-expanded={hasListbox}
        aria-controls={hasListbox ? listboxId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
        autoComplete="off"
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (query.trim()) setIsOpen(true)
        }}
      />
      <button type="submit" className="search-submit" aria-label={isEn ? 'Search' : 'খুঁজুন'}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m21 21-4.3-4.3m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
        </svg>
      </button>

      <span className="sr-only" role="status">
        {liveStatus()}
      </span>

      {isOpen && (
        <div className="search-results">
          {isLoading && (
            <p className="search-status">{isEn ? 'Searching…' : 'খোঁজা হচ্ছে…'}</p>
          )}

          {!isLoading && error && (
            <p className="search-status is-error">
              {isEn ? 'Search is unavailable right now.' : 'সার্চ এখন কাজ করছে না। একটু পরে চেষ্টা করুন।'}
            </p>
          )}

          {!isLoading && !error && results.length === 0 && query.trim() && (
            <p className="search-status">
              {isEn ? 'No results found. Try another word, or ' : 'কিছু খুঁজে পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন, অথবা '}
              <a
                href={sitemapHref}
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  event.preventDefault()
                  goTo(sitemapHref)
                }}
              >
                {isEn ? 'browse every page' : 'সব পাতার তালিকা দেখুন'}
              </a>
              {isEn ? '.' : '।'}
            </p>
          )}

          {hasListbox && (
          <ul id={listboxId} role="listbox" aria-label={isEn ? 'Search results' : 'সার্চের ফলাফল'}>
            {results.map((result, index) => (
              <li
                key={result.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                className={index === activeIndex ? 'search-result is-active' : 'search-result'}
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => goTo(result.url, { index, isStub: result.isStub })}
              >
                <span className="result-title">
                  {result.title}
                  {result.isStub && (
                    <span className="stub-chip">{isEn ? 'to be written' : 'লেখা বাকি'}</span>
                  )}
                </span>
                {result.excerpt && !result.isStub && (
                  <span className="result-excerpt">{result.excerpt}</span>
                )}
              </li>
            ))}
          </ul>
          )}
        </div>
      )}
    </form>
  )
}
