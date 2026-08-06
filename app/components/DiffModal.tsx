'use client'

import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { DiffLine } from '../lib/diff'

interface DiffModalProps {
  open: boolean
  onClose: () => void
  diffLines: DiffLine[]
  title: string
  isEn?: boolean
}

export default function DiffModal({
  open,
  onClose,
  diffLines,
  title,
  isEn = false
}: DiffModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return undefined

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.classList.add('modal-open')

    const focusFrame = window.requestAnimationFrame(() => dialogRef.current?.focus())

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('modal-open')
      window.requestAnimationFrame(() => previousFocusRef.current?.focus())
    }
  }, [open, onClose])

  if (!open) return null

  const t = (bn: string, en: string) => (isEn ? en : bn)

  return createPortal(
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="modal-card modal-card--large"
        ref={dialogRef}
        tabIndex={-1}
        style={{ width: 'min(100%, 860px)' }}
      >
        <button
          className="modal-close"
          type="button"
          aria-label={t('বন্ধ করুন', 'Close')}
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>

        <h2 style={{ marginBottom: '16px' }}>{title}</h2>

        <div className="diff-container">
          {diffLines.length === 0 ? (
            <p className="diff-empty">{t('কোনো পরিবর্তন নেই।', 'No changes found.')}</p>
          ) : (
            <div className="diff-table">
              {diffLines.map((line, idx) => {
                const lineClass = `diff-row diff-row--${line.type}`
                const sign =
                  line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '

                return (
                  <div key={idx} className={lineClass}>
                    <span className="diff-line-number">{idx + 1}</span>
                    <span className="diff-sign">{sign}</span>
                    <span className="diff-content">{line.text || ' '}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
