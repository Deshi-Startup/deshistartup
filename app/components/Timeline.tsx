import React from 'react'

export interface TimelineSpan {
  /** Tick index where the span begins (0-based). */
  start: number
  /** Tick index where the span ends, exclusive. */
  end: number
  label?: string
  /** 'gap' renders the span as a hollow risk window instead of a filled bar. */
  tone?: 'filled' | 'gap'
}

export interface TimelineRow {
  label: string
  spans: TimelineSpan[]
}

export interface TimelineProps {
  ticks: string[]
  rows: TimelineRow[]
}

/**
 * A horizontal band timeline for "what happens in what order" over a few
 * equal steps — for example, when a sale is booked on the ledger versus when
 * the cash actually lands in the bank. Each row is a series; each span is a
 * bar or a hollow gap placed on a shared tick axis. Pure CSS and static.
 *
 * The tick row is decorative: read aloud it is a bare run of day names, and
 * the meaning lives in where a span sits against it. So the ticks are hidden
 * from assistive technology and each span label has to carry its own reading.
 */
export default function Timeline({ ticks, rows }: TimelineProps) {
  if (!ticks || ticks.length < 2 || !rows || rows.length === 0) return null

  const columns = `repeat(${ticks.length}, 1fr)`

  return (
    <div className="timeline">
      <span className="timeline__corner" aria-hidden="true" />
      <div
        className="timeline__ticks"
        style={{ gridTemplateColumns: columns }}
        aria-hidden="true"
      >
        {ticks.map((tick, i) => (
          <span key={i} className="timeline__tick">
            {tick}
          </span>
        ))}
      </div>

      {rows.map((row) => (
        <React.Fragment key={row.label}>
          <span className="timeline__label">{row.label}</span>
          <div className="timeline__track" style={{ gridTemplateColumns: columns }}>
            {row.spans.map((span, i) => (
              <span
                key={i}
                className={`timeline__span ${span.tone === 'gap' ? 'timeline__span--gap' : ''}`}
                style={{ gridColumn: `${span.start + 1} / ${span.end + 1}` }}
              >
                {span.label && <span className="timeline__span-label">{span.label}</span>}
              </span>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}
