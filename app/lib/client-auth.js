/**
 * Client-side Google auth state. The ID token comes straight from Google
 * Identity Services ("Sign in with Google") in the browser; the backend
 * verifies it on each request (see app/lib/google-token.js). No server
 * session exists — the token lives in localStorage and is sent as a
 * Bearer header with API calls. Google ID tokens expire in ~1 hour.
 */

const STORAGE_KEY = 'deshi_auth'

function b64urlToBytes(str) {
  let s = str.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  const bin = atob(s)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr
}

/** Decode (not verify) a JWT payload — client-side display only. */
export function decodeIdToken(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(new TextDecoder().decode(b64urlToBytes(payload)))
  } catch {
    return null
  }
}

export function getStoredAuth() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || !data.token) return null
    const claims = decodeIdToken(data.token)
    if (!claims || !claims.exp || Date.now() / 1000 >= claims.exp) {
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return { token: data.token, user: data.user }
  } catch {
    return null
  }
}

export function storeAuth(token, user) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
  } catch {
    /* storage unavailable (private mode) — auth is in-memory only */
  }
}

export function clearAuth() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
