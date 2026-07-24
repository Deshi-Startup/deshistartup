'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

let pagefindPromise = null

const bengaliDigits = (value) => String(value).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d])

async function loadPagefind(basePath = '') {
  if (typeof window === 'undefined') return null

  if (!window.pagefind) {
    if (!pagefindPromise) {
      const pagefindUrl = `${basePath}/_pagefind/pagefind.js`
      pagefindPromise = import(/* webpackIgnore: true */ pagefindUrl).then((module) => {
        window.pagefind = module
        return window.pagefind.options({ baseUrl: basePath || '/' })
      })
    }
    await pagefindPromise
  }

  return window.pagefind
}

function cleanTitle(data) {
  return data?.meta?.title || data?.title || data?.url || ''
}

function cleanExcerpt(data) {
  if (data?.excerpt) {
    return data.excerpt.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  }
  return (data?.content || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 160)
}

export default function SearchBox({ isEn = false, variant = 'header' }) {
  const router = useRouter()
  const inputRef = useRef(null)
  const listboxId = `${useId()}listbox`
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState(false)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const optionId = (index) => `${listboxId}-option-${index}`
  // The popup only counts as a combobox listbox when it actually holds options;
  // the loading, error, and no-match panels are announced by the status region.
  const hasListbox = isOpen && !isLoading && !error && results.length > 0

  useEffect(() => {
    if (variant !== 'header') return undefined

    const handleKeyDown = (event) => {
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
  }, [variant])

  useEffect(() => {
    const trimmedQuery = query.trim()
    setActiveIndex(-1)

    if (!trimmedQuery) {
      setResults([])
      setIsOpen(false)
      setError(false)
      return undefined
    }

    let isActive = true
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
            return {
              id: item.id,
              url: data.url,
              title: cleanTitle(data),
              excerpt: cleanExcerpt(data),
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
    }
  }, [query, basePath])

  // Keep the arrow-selected option inside the scrolling popover.
  useEffect(() => {
    if (activeIndex < 0) return
    document
      .getElementById(optionId(activeIndex))
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [activeIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (url) => {
    const nextUrl = basePath && url.startsWith(basePath) ? url.slice(basePath.length) || '/' : url
    router.push(nextUrl)
    setQuery('')
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const moveActive = (step) => {
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
  const handleKeyDown = (event) => {
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
      : `${bengaliDigits(results.length)}টি ফলাফল। উপর-নিচ তীর দিয়ে বেছে নিন।`
  }

  return (
    <form
      className={variant === 'hero' ? 'search search--hero' : 'search'}
      role="search"
      aria-label={isEn ? 'Search Deshi Startup' : 'দেশি স্টার্টআপে খুঁজুন'}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false)
          setActiveIndex(-1)
        }
      }}
      onSubmit={(event) => {
        event.preventDefault()
        const target = results[activeIndex] || results[0]
        if (target) goTo(target.url)
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
              {isEn ? 'No results found. Try another word, or ' : 'কোনো মিল পাওয়া যায়নি। অন্য শব্দে খুঁজুন, বা '}
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
                onClick={() => goTo(result.url)}
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
