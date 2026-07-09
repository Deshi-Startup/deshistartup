'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

let pagefindPromise = null

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
  const containerRef = useRef(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState(false)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

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

  const goTo = (url) => {
    const nextUrl = basePath && url.startsWith(basePath) ? url.slice(basePath.length) || '/' : url
    router.push(nextUrl)
    setQuery('')
    setIsOpen(false)
  }

  const placeholder = isEn
    ? 'Search: trade license, bKash, VAT…'
    : 'খুঁজুন: ট্রেড লাইসেন্স, বিকাশ, ভ্যাট…'

  return (
    <form
      className={variant === 'hero' ? 'search search--hero' : 'search'}
      role="search"
      aria-label={isEn ? 'Search Deshi Startup' : 'দেশি স্টার্টআপে খুঁজুন'}
      onSubmit={(event) => {
        event.preventDefault()
        if (results.length > 0) goTo(results[0].url)
      }}
    >
      <input
        ref={inputRef}
        type="search"
        value={query}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          if (query.trim()) setIsOpen(true)
        }}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 150)
        }}
      />
      <button type="submit" className="search-submit" aria-label={isEn ? 'Search' : 'খুঁজুন'}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m21 21-4.3-4.3m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
        </svg>
      </button>

      {isOpen && (
        <div ref={containerRef} className="search-results">
          {isLoading && (
            <p className="search-status">{isEn ? 'Searching…' : 'খোঁজা হচ্ছে…'}</p>
          )}

          {!isLoading && error && (
            <p className="search-status is-error">
              {isEn ? 'Search is unavailable right now.' : 'সার্চ এখন কাজ করছে না। একটু পরে চেষ্টা করুন।'}
            </p>
          )}

          {!isLoading && !error && results.length === 0 && query.trim() && (
            <p className="search-status">{isEn ? 'No results found.' : 'কোনো মিল পাওয়া যায়নি।'}</p>
          )}

          {!isLoading && !error && results.length > 0 && (
            <ul>
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    className="search-result-btn"
                    onMouseDown={(event) => event.preventDefault()}
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
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  )
}
