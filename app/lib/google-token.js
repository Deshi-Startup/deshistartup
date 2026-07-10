import { jwtVerify, createRemoteJWKSet } from 'jose'

/**
 * Verifies a Google ID token obtained client-side via Google Identity
 * Services ("Sign in with Google"). The backend keeps NO session — each
 * authenticated request carries the token in an Authorization: Bearer
 * header, and we verify it here (signature via Google's JWKS, plus issuer,
 * audience and expiry) before trusting the user info inside.
 *
 * Stateless: works in next dev (Node) and on edge/worker runtimes. jose
 * caches the JWKS and handles key rotation automatically.
 */

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
)

const VALID_ISSUERS = ['https://accounts.google.com', 'accounts.google.com']

/**
 * Verifies a raw Google ID token and returns {name, email, picture} or null.
 */
export async function verifyIdToken(token) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not set. Add it to .env.local.')
  }
  if (!token || typeof token !== 'string') return null

  let payload
  try {
    const result = await jwtVerify(token, GOOGLE_JWKS, {
      issuer: VALID_ISSUERS,
      audience: clientId,
      algorithms: ['RS256']
    })
    payload = result.payload
  } catch {
    return null
  }

  if (payload.email_verified !== true) return null
  if (!payload.email) return null

  return {
    name: payload.name || payload.email,
    email: payload.email,
    picture: payload.picture || ''
  }
}

/**
 * Reads + verifies the Bearer token from a request's Authorization header.
 * Returns the user object, or null if absent/invalid.
 */
export async function requireUser(req) {
  const auth = req.headers.get('authorization') || ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  if (!match) return null
  return verifyIdToken(match[1])
}
