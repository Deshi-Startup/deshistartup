'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

interface ExpertReviewProps {
  reviewer: string
  role: string
  organization?: string
  date?: string
  source?: string
  notes?: string
}

function formatDate(iso: string, isEn: boolean) {
  try {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString(isEn ? 'en-GB' : 'bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    })
  } catch {
    return iso
  }
}

export default function ExpertReview({
  reviewer,
  role,
  organization,
  date,
  source,
  notes
}: ExpertReviewProps) {
  const pathname = usePathname() || ''
  const isEn = pathname.startsWith('/en/') || pathname === '/en'

  const formattedDate = date ? formatDate(date, isEn) : null

  return (
    <aside className="expert-review" role="note" aria-label={isEn ? 'Expert Editorial Review' : 'বিশেষজ্ঞ পর্যালোচনা ও যাচাই'}>
      <div className="expert-review__header">
        <span className="expert-review__badge">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {isEn ? 'Expert Verified' : 'বিশেষজ্ঞ দ্বারা যাচাইকৃত'}
        </span>
        {formattedDate && (
          <span className="expert-review__date">
            {isEn ? 'Verified date: ' : 'যাচাইয়ের তারিখ: '}
            {formattedDate}
          </span>
        )}
      </div>

      <div className="expert-review__body">
        <div className="expert-review__person">
          <strong className="expert-review__name">{reviewer}</strong>
          <span className="expert-review__role">{role}</span>
          {organization && <span className="expert-review__org"> · {organization}</span>}
        </div>

        {notes && <p className="expert-review__notes">{notes}</p>}

        {source && (
          <p className="expert-review__source">
            <strong>{isEn ? 'Primary authority: ' : 'মূল সরকারি আইনি উৎস: '}</strong>
            {source}
          </p>
        )}
      </div>
    </aside>
  )
}
