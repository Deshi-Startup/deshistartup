'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

let pagefindPromise = null

async function loadPagefind() {
  if (typeof window === 'undefined') {
    return null
  }

  if (!window.pagefind) {
    if (!pagefindPromise) {
      pagefindPromise = import(/* webpackIgnore: true */ '/_pagefind/pagefind.js').then((module) => {
        window.pagefind = module
        return window.pagefind.options({ baseUrl: '/' })
      })
    }

    await pagefindPromise
  }

  return window.pagefind
}

function cleanTitle(data) {
  return data?.meta?.title || data?.title || data?.url || 'Untitled page'
}

function cleanExcerpt(data) {
  if (data?.excerpt) {
    // Remove any HTML tags (e.g. <mark>) coming from Pagefind excerpts
    return data.excerpt.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  }

  const content = data?.content || ''
  // strip HTML tags from content as well
  return content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 160)
}

export default function SearchBox() {
  const router = useRouter()
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(false)
  const [containerWidth, setContainerWidth] = useState('100%')

  useEffect(() => {
    // detect dark mode (class-based or prefers-color-scheme)
    const el = typeof document !== 'undefined' ? document.documentElement : null
    const detect = () => {
      if (!el) return false
      if (el.classList.contains('dark')) return true
      try {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      } catch (e) {
        return false
      }
    }
    setIsDark(detect())
    // listen for changes to prefers-color-scheme
    let mq
    if (typeof window !== 'undefined' && window.matchMedia) {
      mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e) => setIsDark(e.matches)
      if (mq.addEventListener) mq.addEventListener('change', handler)
      else if (mq.addListener) mq.addListener(handler)
    }
    const handleKeyDown = (event) => {
      const isSearchShortcut =
        event.key === '/' ||
        (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey) && !event.shiftKey)

      if (isSearchShortcut) {
        event.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    const handleResize = () => {
      try {
        const w = inputRef.current?.offsetWidth
        if (w) setContainerWidth(`${w}px`)
      } catch (e) {}
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
      if (mq) {
        if (mq.removeEventListener) mq.removeEventListener('change', () => {})
        else if (mq.removeListener) mq.removeListener(() => {})
      }
    }
  }, [])

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      setResults([])
      setIsOpen(false)
      setError('')
      return
    }

    let isActive = true
    const timeout = window.setTimeout(async () => {
      setIsLoading(true)
      setError('')

      try {
        const pagefind = await loadPagefind()

        if (!pagefind || !isActive) {
          return
        }

        const response = await pagefind.search(trimmedQuery)
        const searchResults = await Promise.all(
          response.results.slice(0, 8).map(async (item) => {
            const data = await item.data()
            return {
              id: item.id,
              url: data.url,
              title: cleanTitle(data),
              excerpt: cleanExcerpt(data)
            }
          })
        )

        if (isActive) {
          setResults(searchResults)
          setIsOpen(searchResults.length > 0)
        }
      } catch (err) {
        if (isActive) {
          setError('Search index is unavailable right now.')
          setResults([])
          setIsOpen(false)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }, 180)

    return () => {
      isActive = false
      window.clearTimeout(timeout)
    }
  }, [query])

  const placeholderClassName = useMemo(
    () =>
      'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400',
    []
  )

  return (
    <div className="x:relative x:w-full x:md:w-64">
      <input
        ref={inputRef}
        type="search"
        value={query}
        placeholder="Search documentation…"
        className={placeholderClassName}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(Boolean(event.target.value.trim()))
        }}
        onFocus={() => {
          if (query.trim()) {
            setIsOpen(true)
          }
        }}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 150)
        }}
      />

        {isOpen && (
        <div
          ref={containerRef}
          className="absolute top-full mt-2 rounded-lg border p-2 shadow-lg z-50"
          style={{
            width: containerWidth && parseInt(containerWidth) > 320 ? containerWidth : '320px',
            minWidth: '320px',
            maxWidth: '640px',
            maxHeight: '360px',
            overflowY: 'auto',
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            color: isDark ? '#e5e7eb' : '#111827',
            borderColor: isDark ? '#374151' : '#e5e7eb',
            boxShadow: '0 10px 30px rgba(2,6,23,0.6)',
            zIndex: 9999
          }}
        >
          {isLoading && <p className="px-2 py-1 text-sm text-gray-500">Loading…</p>}

          {!isLoading && error && <p className="px-2 py-1 text-sm text-red-500">{error}</p>}

          {!isLoading && !error && results.length === 0 && query.trim() && (
            <p className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">No results found.</p>
          )}

          {!isLoading && !error && results.length > 0 && (
            <ul className="max-h-72 overflow-auto" style={{padding:0, margin:0, listStyle:'none'}}>
              {results.map((result) => (
                <li key={result.id} style={{marginBottom:6}}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      router.push(result.url)
                      setQuery('')
                      setIsOpen(false)
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: 'transparent',
                      color: isDark ? '#e5e7eb' : '#0f172a',
                      lineHeight: '1.4',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere'
                    }}
                  >
                    <div style={{fontSize:14, fontWeight:600, marginBottom:4}}>{result.title}</div>
                    {result.excerpt && (
                      <div style={{fontSize:12, color: isDark ? '#cbd5e1' : '#6b7280'}}>{result.excerpt}</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
