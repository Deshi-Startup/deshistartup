import React from 'react'

export interface DataBar {
  /** Category label, e.g. "BDT 1,200 product". */
  label: string
  /** Numeric value that drives the bar length. */
  value: number
  /** Text shown as the value. Defaults to value + unit. */
  display?: string
}

export interface DataBarsProps {
  data: DataBar[]
  /** Suffix appended to the numeric value when a bar has no display text. */
  unit?: string
  /** Scale ceiling. Defaults to the largest value. Use 100 for percentages. */
  max?: number
}

/**
 * A minimal horizontal bar chart for small comparisons, three to seven items.
 *
 * The bars are pure CSS, so there is no raster to upload, no SVG to sanitize
 * and no client JavaScript. The length is the only data channel: the label and
 * value are real text beside it, so the meaning survives a screen reader, a
 * print-out or a stylesheet that fails. The precise numbers always live in a
 * Markdown table next to the chart, which is the accessible text alternative.
 */
export default function DataBars({ data, unit = '', max }: DataBarsProps) {
  if (!data || data.length === 0) return null

  const ceiling = max ?? Math.max(...data.map((bar) => bar.value))
  const scale = ceiling > 0 ? ceiling : 1

  return (
    <ul className="databars">
      {data.map((bar, index) => {
        const pct = Math.min(100, Math.max(0, (bar.value / scale) * 100))
        const text = bar.display ?? `${bar.value}${unit}`
        return (
          <li key={index} className="databars__row">
            <div className="databars__head">
              <span className="databars__label">{bar.label}</span>
              <span className="databars__value">{text}</span>
            </div>
            <div className="databars__track" aria-hidden="true">
              <div className="databars__bar" style={{ width: `${pct}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
