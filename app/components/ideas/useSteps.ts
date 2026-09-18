'use client'
import { useEffect, useState } from 'react'
import { parseSteps, STEPS_KEY, toggleStep, type StepProgress } from './model'

/** First-test progress lives in the reader's browser, like the saved list. */
export function useSteps() {
  const [progress, setProgress] = useState<StepProgress>({})
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  useEffect(() => {
    const read = () => {
      try { setProgress(parseSteps(localStorage.getItem(STEPS_KEY))); setError(false) }
      catch { setError(true) }
      setReady(true)
    }
    read()
    const changed = (event: StorageEvent) => { if (event.key === STEPS_KEY || event.key === null) read() }
    window.addEventListener('storage', changed)
    return () => window.removeEventListener('storage', changed)
  }, [])
  const toggle = (id: string, step: number) => {
    try { setProgress(toggleStep(localStorage, id, step)); setError(false); return true }
    catch { setError(true); return false }
  }
  return { progress, ready, error, toggle }
}
