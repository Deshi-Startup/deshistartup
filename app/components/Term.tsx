'use client'

import React, { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import glossaryData from '../../data/glossary.json'

interface GlossaryEntry {
  bn: string
  en: string
}

type GlossaryMap = Record<string, GlossaryEntry>
const glossary = glossaryData as GlossaryMap

interface TermProps {
  name?: string
  def?: string
  children: React.ReactNode
}

export default function Term({ name, def, children }: TermProps) {
  const pathname = usePathname() || ''
  const isEn = pathname.startsWith('/en/') || pathname === '/en'
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)

  // Resolve definition from explicit `def` or lookup in `glossary.json`
  let resolvedDef = def
  if (!resolvedDef && name && glossary[name]) {
    resolvedDef = isEn ? glossary[name].en : glossary[name].bn
  }

  useEffect(() => {
    if (!isOpen) return undefined

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (!resolvedDef) {
    return <span className="glossary-term-plain">{children}</span>
  }

  return (
    <span
      ref={containerRef}
      className={`glossary-term-wrap ${isOpen ? 'is-active' : ''}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className="glossary-term-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isEn ? `Definition of ${children}` : `${children}-এর সংজ্ঞা`}
      >
        {children}
        <span className="glossary-term-dot" aria-hidden="true" />
      </button>

      {isOpen && (
        <span className="glossary-popover" role="tooltip">
          <span className="glossary-popover__title">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="currentColor">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.75 12h-1.5V7h1.5v5zm0-6h-1.5V4.5h1.5V6z" />
            </svg>
            {isEn ? 'Term Definition' : 'শব্দের সংজ্ঞা'}
          </span>
          <span className="glossary-popover__body">{resolvedDef}</span>
        </span>
      )}
    </span>
  )
}
