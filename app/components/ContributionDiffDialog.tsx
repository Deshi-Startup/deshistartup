'use client'

import React, { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ContributionDiffRow, ContributionReview } from '../lib/contribution-diff'
import styles from './ContributionDiffDialog.module.css'

const FOCUSABLE_SELECTOR =
  'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])'

interface ContributionDiffDialogProps {
  review: ContributionReview
  isEn: boolean
  onClose: () => void
  /** Sending from here closes the dialog first, so errors land on the panel. */
  onSubmit?: () => void
  canSubmit?: boolean
}

function formatNumber(value: number, isEn: boolean): string {
  return value.toLocaleString(isEn ? 'en-US' : 'bn-BD')
}

/**
 * Heading hashes, bullets and quote marks at the head of a line. A contributor
 * edited rendered prose and has never seen these, so they are dimmed rather
 * than removed: the line stays honest, the sentence stays the loud part.
 */
const LEADING_SYNTAX = /^[ \t]*(?:#{1,6}[ \t]+|[-*+][ \t]+|\d+[.)][ \t]+|>[ \t]?)+/

/**
 * The line as the reader should see it: the words that actually moved carry a
 * mark, and everything else stays plain. Lines with no pairing fall back to
 * one flat run, which the row tint already colours.
 */
function RowText({ row }: { row: ContributionDiffRow }) {
  const segments = row.segments ?? [{ kind: 'same' as const, text: row.text }]
  const prefix = row.text.match(LEADING_SYNTAX)?.[0] ?? ''
  // Only lift the prefix when it sits wholly inside the first unchanged run,
  // otherwise a word mark that starts mid-prefix would be split in half.
  const lifted =
    prefix && segments[0].kind === 'same' && segments[0].text.length >= prefix.length
      ? prefix
      : ''

  return (
    <>
      {lifted && <span className={styles.syntax}>{lifted}</span>}
      {segments.map((segment, index) => {
        const text = index === 0 ? segment.text.slice(lifted.length) : segment.text
        if (text === '') return null
        return segment.kind === 'changed' ? (
          <mark className={styles.mark} key={index}>
            {text}
          </mark>
        ) : (
          <React.Fragment key={index}>{text}</React.Fragment>
        )
      })}
    </>
  )
}

export default function ContributionDiffDialog({
  review,
  isEn,
  onClose,
  onSubmit,
  canSubmit = false
}: ContributionDiffDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const headingId = useId()
  const descriptionId = useId()
  const summaryId = useId()
  const t = (bn: string, en: string) => (isEn ? en : bn)

  useEffect(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const background = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        !element.hasAttribute('data-contribution-review-portal')
    )
    const previousInert = background.map((element) => element.inert)
    background.forEach((element) => {
      element.inert = true
    })

    const focusFrame = window.requestAnimationFrame(() => dialogRef.current?.focus())
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true')
      if (focusable.length === 0) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (
        document.activeElement === dialogRef.current ||
        !dialogRef.current.contains(document.activeElement)
      ) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      background.forEach((element, index) => {
        element.inert = previousInert[index]
      })
      document.body.style.overflow = previousOverflow
      window.requestAnimationFrame(() => previousFocusRef.current?.focus())
    }
  }, [onClose])

  const places = review.hunks.length

  return createPortal(
    <div
      className="modal-overlay"
      data-contribution-review-portal
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className={styles.card}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={
          review.status === 'ready' ? `${descriptionId} ${summaryId}` : descriptionId
        }
        tabIndex={-1}
      >
        <header className={styles.header}>
          <button
            className="modal-close"
            type="button"
            aria-label={t('এডিটে ফিরুন', 'Close change review')}
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
          <h2 id={headingId}>{t('এডিটে কী বদলেছে', 'Review changes')}</h2>
          <p id={descriptionId}>
            {t(
              'রিভিউতে পাঠানোর আগে যোগ ও বাদ দেওয়া অংশ দেখে নিন।',
              'Check what was added or removed before sending it for review.'
            )}
          </p>
        </header>

        {review.status === 'ready' && (
          /* The chips are the legend: each count is painted in the colour the
             rows below use, so nothing has to explain green and amber twice. */
          <p className={styles.summary} id={summaryId}>
            <span className={styles.places}>
              {isEn
                ? `${formatNumber(places, true)} ${places === 1 ? 'place' : 'places'} changed`
                : `${formatNumber(places, false)} জায়গায় বদল`}
            </span>
            <span className={`${styles.chip} ${styles.chipAdd}`}>
              {isEn
                ? `+${formatNumber(review.additions, true)} added`
                : `+${formatNumber(review.additions, false)} যোগ`}
            </span>
            <span className={`${styles.chip} ${styles.chipRemove}`}>
              {isEn
                ? `−${formatNumber(review.deletions, true)} removed`
                : `−${formatNumber(review.deletions, false)} বাদ`}
            </span>
          </p>
        )}

        <div className={styles.body}>
          {review.status === 'too-large' ? (
            <p className={styles.notice}>
              {t(
                'এডিটটি এখানে দেখানোর জন্য খুব বড়, তাই পাঠানোর আগে লেখাটি একবার দেখে নিন।',
                'This edit is too large to preview here, so check the article once before sending it.'
              )}
            </p>
          ) : review.status === 'unchanged' ? (
            <p className={styles.notice}>
              {t(
                'লেখায় কিছু বদলায়নি, ছবির তথ্য উপরের তালিকায় আছে।',
                'No text changed; image details remain in the editor above.'
              )}
            </p>
          ) : (
            review.hunks.map((hunk, hunkIndex) => {
              const position = isEn
                ? `Change ${formatNumber(hunkIndex + 1, true)} of ${formatNumber(places, true)}`
                : `পরিবর্তন ${formatNumber(hunkIndex + 1, false)}/${formatNumber(places, false)}`
              return (
                <section
                  className={styles.hunk}
                  key={`${hunk.oldStart}-${hunk.newStart}-${hunkIndex}`}
                  aria-label={hunk.heading ? `${position}, ${hunk.heading}` : position}
                >
                  <p className={styles.hunkHeader} aria-hidden="true">
                    <span className={styles.hunkIndex}>{position}</span>
                    {hunk.heading && (
                      <span className={styles.hunkWhere} title={hunk.heading}>
                        {hunk.heading}
                      </span>
                    )}
                  </p>
                  <div className={styles.rows}>
                    {hunk.rows
                      .filter((row) => !row.wrapper)
                      .map((row, rowIndex) => (
                        <div
                          className={`${styles.row} ${styles[row.kind]}${
                            row.kind === 'context' && row.text === '' ? ` ${styles.blank}` : ''
                          }`}
                          key={`${row.kind}-${row.oldLine}-${row.newLine}-${rowIndex}`}
                        >
                          <span className={styles.marker} aria-hidden="true">
                            {row.kind === 'addition' ? '+' : row.kind === 'deletion' ? '−' : ''}
                          </span>
                          <span className={styles.code}>
                            {row.kind !== 'context' && (
                              <span className="sr-only">
                                {row.kind === 'addition'
                                  ? t('যোগ করা হয়েছে: ', 'Added: ')
                                  : t('বাদ দেওয়া হয়েছে: ', 'Removed: ')}
                              </span>
                            )}
                            {row.text ? (
                              <RowText row={row} />
                            ) : (
                              <>
                                <span className="sr-only">{t('ফাঁকা লাইন', 'blank line')}</span>
                                <span aria-hidden="true">&nbsp;</span>
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                  </div>
                </section>
              )
            })
          )}
        </div>

        <footer className={styles.footer}>
          <button type="button" className="edit-btn" onClick={onClose}>
            {t('এডিটে ফিরুন', 'Back to editing')}
          </button>
          {onSubmit && (
            <button
              type="button"
              className="edit-btn is-primary"
              onClick={onSubmit}
              disabled={!canSubmit}
            >
              {t('রিভিউতে পাঠান', 'Send for review')}
            </button>
          )}
        </footer>
      </div>
    </div>,
    document.body
  )
}
