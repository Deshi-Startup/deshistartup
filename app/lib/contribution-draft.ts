/**
 * Crash insurance for the inline editor.
 *
 * A contributor writing on a phone loses their work to a background tab being
 * reclaimed, a flat battery, or a mis-swiped back gesture, and none of those
 * fire `beforeunload` in a way you can trust. So the editor keeps the current
 * markdown in localStorage while it differs from what the server handed back,
 * and offers it on the way back in. Nothing is ever restored silently: what is
 * on screen when the editor opens is always the page as it stands.
 *
 * Drafts are keyed by page path only. The one Google account per browser makes
 * this unambiguous in practice, and keying on email would leave a stale draft
 * behind on the next sign-in with no way to name it.
 */

import type { ContributionMediaInput } from './contribution-media'

const PREFIX = 'deshi_draft:'
/** After a fortnight an unsent draft is a puzzle, not a rescue. */
const TTL_MS = 14 * 24 * 60 * 60 * 1000

export interface ContributionDraft {
  body: string
  savedAt: number
  media?: ContributionMediaInput[]
}

function storage(): Storage | null {
  try {
    // Private mode can expose localStorage and throw on touch.
    if (typeof window === 'undefined' || !window.localStorage) return null
    return window.localStorage
  } catch {
    return null
  }
}

const keyFor = (path: string) => `${PREFIX}${path}`

/** Drop every expired draft. Cheap, and keeps a long-lived browser from
 *  accumulating pages the contributor abandoned months ago. */
export function pruneDrafts(now = Date.now()): void {
  const store = storage()
  if (!store) return
  try {
    const stale: string[] = []
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i)
      if (!key || !key.startsWith(PREFIX)) continue
      let savedAt = 0
      try {
        savedAt = JSON.parse(store.getItem(key) || '{}')?.savedAt || 0
      } catch {
        /* unparseable is stale by definition */
      }
      if (!savedAt || now - savedAt > TTL_MS) stale.push(key)
    }
    stale.forEach((key) => store.removeItem(key))
  } catch {
    /* ignore */
  }
}

export function loadDraft(path: string, now = Date.now()): ContributionDraft | null {
  const store = storage()
  if (!store) return null
  try {
    const raw = store.getItem(keyFor(path))
    if (!raw) return null
    const data = JSON.parse(raw)
    if (typeof data?.body !== 'string' || !data.body.trim() || typeof data?.savedAt !== 'number') {
      store.removeItem(keyFor(path))
      return null
    }
    if (now - data.savedAt > TTL_MS) {
      store.removeItem(keyFor(path))
      return null
    }
    const media = Array.isArray(data.media)
      ? data.media.filter(
          (item: unknown): item is ContributionMediaInput =>
            Boolean(item) &&
            typeof item === 'object' &&
            typeof (item as ContributionMediaInput).id === 'string' &&
            typeof (item as ContributionMediaInput).alt === 'string'
        )
      : []
    return {
      body: data.body,
      savedAt: data.savedAt,
      ...(media.length ? { media } : {})
    }
  } catch {
    return null
  }
}

export function saveDraft(
  path: string,
  body: string,
  now = Date.now(),
  media: ContributionMediaInput[] = []
): void {
  const store = storage()
  if (!store) return
  try {
    store.setItem(
      keyFor(path),
      JSON.stringify({
        body,
        savedAt: now,
        ...(media.length ? { media } : {})
      })
    )
  } catch {
    // Quota exceeded, or storage disabled. The editor still holds the text;
    // only the crash insurance is gone, and there is nothing useful to say
    // about it mid-keystroke.
  }
}

export function clearDraft(path: string): void {
  const store = storage()
  if (!store) return
  try {
    store.removeItem(keyFor(path))
  } catch {
    /* ignore */
  }
}
