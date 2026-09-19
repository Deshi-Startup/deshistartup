'use client'
import { useEffect, useRef, useState } from 'react'
import { useEcosystemSession } from './useEcosystemSession'
import type { Locale } from './types'

type Intent = { id: string; voted: boolean }
type Counts = Record<string, number>
export function useIdeaVotes(locale: Locale) {
  const en = locale === 'en'
  const [counts, setCounts] = useState<Counts>({})
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  const [voted, setVoted] = useState<string[]>([])
  const [ownerReady, setOwnerReady] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<{ id: string; message: string } | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const intent = useRef<Intent | null>(null)
  const writing = useRef(false)
  const revision = useRef(0)
  const changes = useRef(new Map<string, { token: string; revision: number; voted: boolean; count: number }>())
  const privateLoaded = useRef(false)
  const session = useEcosystemSession(locale, {
    purpose: 'voting',
    onDismiss: () => { intent.current = null },
    onAuthenticated: auth => {
      const next = intent.current
      intent.current = null
      if (next) void submit(next, auth.token)
    }
  })
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/ecosystem/votes', { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12_000)]) }).then(async response => {
      if (!response.ok) throw new Error('unavailable')
      const data = await response.json()
      if (!privateLoaded.current && revision.current === 0) setCounts(data.counts)
      setStatus('ready')
    }).catch(() => { if (!controller.signal.aborted && !privateLoaded.current && revision.current === 0) setStatus('unavailable') })
    return () => controller.abort()
  }, [])
  useEffect(() => {
    const token = session.auth?.token
    if (!token) { setVoted([]); setOwnerReady(null); return }
    const controller = new AbortController()
    const initialRevision = revision.current
    fetch('/api/ecosystem/votes/mine', { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12_000)]) }).then(async response => {
      if (response.status === 401) { session.expire(); return }
      if (!response.ok) return
      const data = await response.json()
      if (controller.signal.aborted) return
      // Preserve every existing choice, then apply writes completed since this read began.
      const choices = new Set<string>(data.voted)
      for (const [id, change] of changes.current) {
        if (change.token !== token || change.revision <= initialRevision) continue
        if (change.voted) choices.add(id)
        else choices.delete(id)
        data.counts[id] = change.count
      }
      setVoted([...choices]); setCounts(data.counts)
      privateLoaded.current = true
      setStatus('ready')
      setOwnerReady(token)
    }).catch(() => {})
    return () => controller.abort()
    // The token, not the session object's render identity, owns this request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.auth?.token])

  async function submit(next: Intent, token: string) {
    if (writing.current) return
    writing.current = true; setPending(next.id); setError(null)
    try {
      const response = await fetch('/api/ecosystem/votes', {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(next), signal: AbortSignal.timeout(12_000)
      })
      if (response.status === 401) {
        session.expire(); intent.current = next; session.signIn(); return
      }
      if (!response.ok) {
        setError({ id: next.id, message: response.status === 429
          ? (en ? 'Wait a moment, then try again.' : 'একটু পরে আবার চেষ্টা করুন।')
          : (en ? 'Your vote wasn’t saved. Try again.' : 'ভোট সেভ হয়নি। আবার চেষ্টা করুন।') })
        return
      }
      const result = await response.json()
      revision.current += 1
      changes.current.set(result.id, { token, revision: revision.current, voted: result.voted, count: result.count })
      setCounts(current => ({ ...current, [result.id]: result.count }))
      setVoted(current => result.voted ? [...new Set([...current, result.id])] : current.filter(id => id !== result.id))
      setAnnouncement(result.voted ? (en ? 'Vote added.' : 'ভোট দেওয়া হয়েছে।') : (en ? 'Vote removed.' : 'ভোট সরানো হয়েছে।'))
    } catch {
      setError({ id: next.id, message: en ? 'Couldn’t confirm your vote. Try again.' : 'ভোট সেভ হয়েছে কি না জানা যায়নি। আবার চেষ্টা করুন।' })
    } finally { writing.current = false; setPending(null) }
  }
  async function toggle(id: string) {
    if (writing.current) return
    setError(null)
    if (status !== 'ready') {
      setPending(id)
      try {
        const response = await fetch('/api/ecosystem/votes', { cache: 'no-store', signal: AbortSignal.timeout(12_000) })
        if (!response.ok) throw new Error('unavailable')
        const data = await response.json()
        setCounts(data.counts); setStatus('ready')
      } catch {
        setError({ id, message: en ? 'Voting is unavailable. Try again later.' : 'এখন ভোট দেওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন।' }); return
      } finally { setPending(null) }
    }
    if (!session.auth) { intent.current = { id, voted: true }; session.signIn(); return }
    if (ownerReady !== session.auth.token) {
      // Retry a failed private read before deciding whether to add or remove a vote.
      setPending(id)
      try {
        const response = await fetch('/api/ecosystem/votes/mine', { headers: { Authorization: `Bearer ${session.auth.token}` }, signal: AbortSignal.timeout(12_000) })
        if (response.status === 401) { session.expire(); intent.current = { id, voted: true }; session.signIn(); return }
        if (!response.ok) throw new Error('unavailable')
        const data = await response.json()
        setVoted(data.voted); setCounts(data.counts); setOwnerReady(session.auth.token)
        await submit({ id, voted: !data.voted.includes(id) }, session.auth.token)
      } catch { setError({ id, message: en ? 'Couldn’t load your vote. Try again.' : 'আপনার ভোটের তথ্য পাওয়া যায়নি। আবার চেষ্টা করুন।' }) }
      finally { setPending(null) }
      return
    }
    await submit({ id, voted: !voted.includes(id) }, session.auth.token)
  }
  return { counts, voted, pending, loading: status === 'loading', error, announcement, toggle, dialog: session.dialog }
}
