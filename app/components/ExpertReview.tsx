import React from 'react'

interface ExpertReviewProps {
  reviewer: string
  role: string
  organization?: string
  date?: string
  source?: string
  notes?: string
  locale?: 'bn' | 'en'
}

function containsBangla(value?: string): boolean {
  return Boolean(value && /[\u0980-\u09ff]/.test(value))
}

function validIsoDate(iso: string): Date | null {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
    ? date
    : null
}

function formatDate(iso: string, locale: 'bn' | 'en'): string {
  const date = validIsoDate(iso)
  if (!date) return iso

  return date.toLocaleDateString(locale === 'en' ? 'en-GB' : 'bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

export default function ExpertReview({
  reviewer,
  role,
  organization,
  date,
  source,
  notes,
  locale
}: ExpertReviewProps) {
  const resolvedLocale =
    locale ||
    (containsBangla(reviewer) ||
    containsBangla(role) ||
    containsBangla(organization) ||
    containsBangla(notes) ||
    containsBangla(source)
      ? 'bn'
      : 'en')
  const isEn = resolvedLocale === 'en'
  const formattedDate = date ? formatDate(date, resolvedLocale) : null

  return (
    <aside
      className="expert-review"
      role="note"
      aria-label={isEn ? 'Expert editorial review' : 'বিশেষজ্ঞের রিভিউ'}
    >
      <div className="expert-review__header">
        <span className="expert-review__badge">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {isEn ? 'Expert reviewed' : 'বিশেষজ্ঞ দেখে দিয়েছেন'}
        </span>
        {formattedDate && (
          <span className="expert-review__date">
            {isEn ? 'Reviewed: ' : 'রিভিউ করেছেন: '}
            {formattedDate}
          </span>
        )}
      </div>

      <div className="expert-review__body">
        <div className="expert-review__person">
          <strong className="expert-review__name">{reviewer}</strong>
          <span aria-hidden="true"> · </span>
          <span className="expert-review__role">{role}</span>
          {organization && <span className="expert-review__org"> · {organization}</span>}
        </div>

        {notes && <p className="expert-review__notes">{notes}</p>}

        {source && (
          <p className="expert-review__source">
            <strong>{isEn ? 'Sources reviewed: ' : 'যে সোর্সগুলো দেখেছেন: '}</strong>
            {source}
          </p>
        )}
      </div>
    </aside>
  )
}
