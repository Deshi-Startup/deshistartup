'use client'
import type { Locale } from './types'
import { stepProgressLabel } from './model'
import { useSteps } from './useSteps'

export default function StepChecklist({ id, locale, steps }: { id: string; locale: Locale; steps: string[] }) {
  const en = locale === 'en'
  const { progress, ready, error, toggle } = useSteps()
  const ticked = progress[id] || []
  const done = ticked.filter(step => step < steps.length).length
  return <div className="ideas-steps">
    <p className="ideas-steps-hint">{en ? 'Tick each step as you go. Progress stays on this device.' : 'যে ধাপ শেষ, টিক দিয়ে রাখুন। হিসাবটা এই ডিভাইসেই থাকবে।'}</p>
    <ol>{steps.map((step, index) => <li key={index}>
      <label>
        <input type="checkbox" checked={ticked.includes(index)} disabled={!ready} onChange={() => toggle(id, index)} />
        <span>{step}</span>
      </label>
    </li>)}</ol>
    <p className="ideas-steps-progress">
      <span className="ideas-steps-bar" aria-hidden="true"><span style={{ width: `${Math.round(done / steps.length * 100)}%` }} /></span>
      <span role="status">{stepProgressLabel(done, steps.length, locale)}</span>
    </p>
    {error && <p className="ideas-error" role="alert">{en ? 'Your progress could not be saved. Allow site storage and try again.' : 'অগ্রগতি সেভ করা যায়নি। সাইটের স্টোরেজ চালু করে আবার চেষ্টা করুন।'}</p>}
  </div>
}
