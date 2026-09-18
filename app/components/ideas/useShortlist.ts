'use client'
import { useEffect, useState } from 'react'
import { readSaved, SAVED_KEY, type SavedIdea } from './model'

export function useShortlist(ideas: SavedIdea[]) {
  const [saved, setSaved] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  useEffect(() => {
    const read = () => {
      try { setSaved(readSaved(localStorage, ideas)); setError(false) }
      catch { setError(true) }
      setReady(true)
    }
    read()
    const changed = (event: StorageEvent) => { if (event.key === SAVED_KEY || event.key === null) read() }
    window.addEventListener('storage', changed)
    return () => window.removeEventListener('storage', changed)
  }, [ideas])
  const toggle = (id: string) => {
    try {
      const current = readSaved(localStorage, ideas)
      const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id]
      localStorage.setItem(SAVED_KEY, JSON.stringify(next))
      setSaved(next)
      setError(false)
      return true
    } catch { setError(true); return false }
  }
  return { saved, ready, error, toggle }
}
