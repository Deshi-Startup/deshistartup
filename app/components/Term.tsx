import React, { useId } from 'react'
import glossaryData from '../../data/glossary.json'
import type { GlossaryEntry } from './Glossary'

interface TermProps {
  name?: string
  def?: string
  children: React.ReactNode
}

type GlossaryMap = Record<string, GlossaryEntry>
const glossary = glossaryData as unknown as GlossaryMap

const bengaliDigits = (value: string) =>
  value.replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)])

export default function Term({ name, def, children }: TermProps) {
  const reactId = useId()
  const popoverId = `term-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const anchorName = `--${popoverId}`
  const entry = name ? glossary[name] : undefined
  const definitionBn = def || entry?.def?.bn
  const definitionEn = def || entry?.def?.en
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  // The popover carries the short definition; the glossary entry carries the
  // worked example, the failure mode and the link to the guide that owns the
  // concept. One source, two depths, so they can never disagree.
  const entryPath = entry && name ? `/start-here/glossary#${name}` : null

  if (!definitionBn && !definitionEn) {
    return <span className="glossary-term-plain">{children}</span>
  }

  return (
    <span className="glossary-term-wrap">
      <button
        type="button"
        className="glossary-term-btn"
        popoverTarget={popoverId}
        popoverTargetAction="toggle"
        aria-details={popoverId}
        style={{ anchorName }}
      >
        {children}
        <span className="glossary-term-dot" aria-hidden="true" />
        <span className="sr-only" data-pagefind-ignore>
          <span className="glossary-copy glossary-copy--bn">: সংজ্ঞা দেখুন</span>
          <span className="glossary-copy glossary-copy--en">: show definition</span>
        </span>
      </button>

      <span
        id={popoverId}
        className="glossary-popover"
        popover="auto"
        role="note"
        data-pagefind-ignore
        style={{ positionAnchor: anchorName }}
      >
        <span className="glossary-popover__title">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="currentColor">
            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.75 12h-1.5V7h1.5v5zm0-6h-1.5V4.5h1.5V6z" />
          </svg>
          <span className="glossary-copy glossary-copy--bn">শব্দের সংজ্ঞা</span>
          <span className="glossary-copy glossary-copy--en">Term definition</span>
        </span>
        <span className="glossary-popover__body">
          <span className="glossary-copy glossary-copy--bn">
            {definitionBn || definitionEn}
          </span>
          <span className="glossary-copy glossary-copy--en">
            {definitionEn || definitionBn}
          </span>
        </span>
        {(entryPath || entry?.sourceUrl || entry?.verified) && (
          <span className="glossary-popover__meta">
            {entryPath && (
              <>
                <a
                  className="glossary-copy glossary-copy--bn"
                  href={`${basePath}${entryPath}`}
                >
                  বিস্তারিত দেখুন
                </a>
                <a
                  className="glossary-copy glossary-copy--en"
                  href={`${basePath}/en${entryPath}`}
                >
                  View details
                </a>
              </>
            )}
            {entryPath && (entry?.sourceUrl || entry?.verified) && (
              <span aria-hidden="true"> · </span>
            )}
            {entry?.sourceUrl && (
              <a href={entry.sourceUrl} target="_blank" rel="noreferrer">
                <span className="glossary-copy glossary-copy--bn">সরকারি সোর্স</span>
                <span className="glossary-copy glossary-copy--en">Official source</span>
              </a>
            )}
            {entry?.sourceUrl && entry?.verified && <span aria-hidden="true"> · </span>}
            {entry?.verified && (
              <>
                <span className="glossary-copy glossary-copy--bn">
                  যাচাই: {bengaliDigits(entry.verified)}
                </span>
                <span className="glossary-copy glossary-copy--en">
                  Verified: {entry.verified}
                </span>
              </>
            )}
          </span>
        )}
      </span>
    </span>
  )
}
