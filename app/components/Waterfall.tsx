import React from 'react'

export interface WaterfallStep {
  /** Step name, e.g. "Courier". */
  label: string
  /** Signed change for this step: negative subtracts, positive adds. */
  delta?: number
  /**
   * Draw this step as a bar anchored to zero rather than a floating segment.
   * With a `delta` it opens the ladder at that amount; without one it closes
   * the ladder at whatever the preceding steps add up to, so a closing total
   * can never disagree with its own steps.
   */
  total?: boolean
}

export interface WaterfallProps {
  steps: WaterfallStep[]
  /** Numerals used for the running total. Bangla by default, as the site is. */
  digits?: 'bn' | 'en'
}

/**
 * A horizontal waterfall for money that arrives, then erodes step by step.
 *
 * The anchored steps are drawn from zero; the steps in between are floating
 * segments showing exactly how much each cost removed (red) or added (green).
 * Pure CSS, no client JavaScript, and every number is real text next to the
 * bar, so the precise figures — and the table that usually sits beside the
 * chart — remain readable on their own.
 */
export default function Waterfall({ steps, digits = 'bn' }: WaterfallProps) {
  if (!steps || steps.length === 0) return null

  const format = new Intl.NumberFormat(digits === 'en' ? 'en-BD' : 'bn-BD').format

  const points: Array<{
    label: string
    delta: number
    total: boolean
    before: number
    after: number
  }> = []

  let running = 0
  for (const step of steps) {
    const before = running
    if (step.total) {
      if (step.delta !== undefined) running = step.delta
    } else {
      running += step.delta ?? 0
    }
    points.push({
      label: step.label,
      delta: step.delta ?? 0,
      total: Boolean(step.total),
      before,
      after: running
    })
  }

  // The scale spans the whole run, and always includes zero, so a step that
  // takes the running total below zero still lands inside the track.
  const values = points.flatMap((point) => [point.before, point.after])
  const low = Math.min(0, ...values)
  const high = Math.max(0, ...values)
  const span = high - low || 1
  const position = (value: number) => ((value - low) / span) * 100

  return (
    <ol className="waterfall">
      {points.map((point, index) => {
        const from = point.total ? 0 : point.before
        const left = position(Math.min(from, point.after))
        const width = position(Math.max(from, point.after)) - left
        const tone = point.total
          ? 'waterfall__bar--total'
          : point.delta < 0
            ? 'waterfall__bar--neg'
            : 'waterfall__bar--pos'
        const deltaText = point.total
          ? ''
          : `${point.delta > 0 ? '+' : '−'}${format(Math.abs(point.delta))}`

        return (
          <li key={index} className="waterfall__row">
            <div className="waterfall__head">
              <span className="waterfall__label">
                {point.label}
                {deltaText && <span className="waterfall__delta"> {deltaText}</span>}
              </span>
              <span className="waterfall__value">{format(point.after)}</span>
            </div>
            <div className="waterfall__track" aria-hidden="true">
              <span
                className={`waterfall__bar ${tone}`}
                style={{ left: `${left}%`, width: `${width}%` }}
              />
            </div>
          </li>
        )
      })}
    </ol>
  )
}
