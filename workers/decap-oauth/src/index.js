const PROVIDER = 'github'
const DEFAULT_SCOPE = 'repo'
const STATE_TTL_SECONDS = 10 * 60
const ALLOWED_SCOPES = new Set(['repo', 'public_repo', 'read:user', 'user:email'])
const encoder = new TextEncoder()
const decoder = new TextDecoder()

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers
    }
  })
}

function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  })
}

function normalizeOrigin(value) {
  if (!value) return ''

  try {
    return new URL(value).origin
  } catch {
    return ''
  }
}

function splitCsv(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getAllowedOrigins(env) {
  return splitCsv(env.ALLOWED_ORIGINS)
    .map(normalizeOrigin)
    .filter(Boolean)
}

function getAllowedSiteIds(env) {
  return splitCsv(env.ALLOWED_SITE_IDS)
}

function validateSite(siteId, env) {
  const allowedSiteIds = getAllowedSiteIds(env)
  if (allowedSiteIds.length === 0) return true

  return allowedSiteIds.includes(siteId)
}

function resolveTargetOrigin(siteId, env) {
  const explicitOrigin = normalizeOrigin(env.SITE_ORIGIN)
  if (explicitOrigin) return explicitOrigin

  const matchingOrigin = getAllowedOrigins(env).find((origin) => {
    const url = new URL(origin)
    return url.hostname === siteId || url.host === siteId
  })

  return matchingOrigin || ''
}

function sanitizeScope(value) {
  const scopes = String(value || DEFAULT_SCOPE)
    .split(/[\s,]+/)
    .map((scope) => scope.trim())
    .filter((scope) => ALLOWED_SCOPES.has(scope))

  return scopes.length > 0 ? scopes.join(' ') : DEFAULT_SCOPE
}

function getCallbackUrl(request, env) {
  const configured = String(env.OAUTH_CALLBACK_URL || '').trim()
  if (configured) return configured

  const url = new URL(request.url)
  return `${url.origin}/callback`
}

function requireAuthConfig(env) {
  const missing = [
    ['GITHUB_OAUTH_CLIENT_ID', env.GITHUB_OAUTH_CLIENT_ID],
    ['GITHUB_OAUTH_CLIENT_SECRET', env.GITHUB_OAUTH_CLIENT_SECRET],
    ['OAUTH_STATE_SECRET', env.OAUTH_STATE_SECRET]
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)

  return missing
}

function base64urlEncode(input) {
  const bytes = typeof input === 'string' ? encoder.encode(input) : new Uint8Array(input)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64urlDecodeToBytes(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

async function importStateKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

async function signStatePayload(encodedPayload, secret) {
  const key = await importStateKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(encodedPayload))
  return base64urlEncode(signature)
}

async function createState(payload, secret) {
  const encodedPayload = base64urlEncode(JSON.stringify(payload))
  const signature = await signStatePayload(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

async function verifyState(state, secret) {
  const [encodedPayload, signature] = String(state || '').split('.')
  if (!encodedPayload || !signature) {
    return { ok: false, error: 'Invalid OAuth state.' }
  }

  let verified = false

  try {
    const key = await importStateKey(secret)
    verified = await crypto.subtle.verify(
      'HMAC',
      key,
      base64urlDecodeToBytes(signature),
      encoder.encode(encodedPayload)
    )
  } catch {
    return { ok: false, error: 'Invalid OAuth state.' }
  }

  if (!verified) {
    return { ok: false, error: 'Invalid OAuth state.' }
  }

  try {
    const payload = JSON.parse(decoder.decode(base64urlDecodeToBytes(encodedPayload)))
    const age = Math.floor(Date.now() / 1000) - Number(payload.ts || 0)

    if (!Number.isFinite(age) || age < 0 || age > STATE_TTL_SECONDS) {
      return { ok: false, error: 'Expired OAuth state.' }
    }

    return { ok: true, payload }
  } catch {
    return { ok: false, error: 'Invalid OAuth state.' }
  }
}

function scriptValue(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function authResultHtml({ provider = PROVIDER, status, payload, targetOrigin }) {
  const message = `authorization:${provider}:${status}:${JSON.stringify(payload)}`
  const handshake = `authorizing:${provider}`
  const visibleMessage =
    status === 'success'
      ? 'Authentication complete. You can return to Decap CMS.'
      : payload.message || 'Authentication failed.'

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Decap CMS authentication</title>
    <style>
      body {
        align-items: center;
        background: #f8fafc;
        color: #0f172a;
        display: flex;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
      }

      main {
        background: #fff;
        border: 1px solid #dbe3ec;
        border-radius: 8px;
        max-width: 420px;
        padding: 24px;
        text-align: center;
      }

      p {
        color: #475569;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Decap CMS</h1>
      <p>${escapeHtml(visibleMessage)}</p>
    </main>
    <script>
      const targetOrigin = ${scriptValue(targetOrigin)};
      const handshake = ${scriptValue(handshake)};
      const resultMessage = ${scriptValue(message)};
      let sentResult = false;

      function postToCms(message) {
        if (!window.opener || window.opener.closed) return;
        window.opener.postMessage(message, targetOrigin);
      }

      function finishAuth() {
        if (sentResult) return;
        sentResult = true;
        postToCms(resultMessage);
        window.setTimeout(() => window.close(), 500);
      }

      window.addEventListener('message', (event) => {
        if (event.data === handshake) finishAuth();
      });

      postToCms(handshake);
      const timer = window.setInterval(() => {
        if (sentResult) {
          window.clearInterval(timer);
          return;
        }
        postToCms(handshake);
      }, 500);

      window.setTimeout(() => {
        window.clearInterval(timer);
        finishAuth();
      }, 8000);
    </script>
  </body>
</html>`
}

function authError(message, targetOrigin, status = 400) {
  return htmlResponse(
    authResultHtml({
      status: 'error',
      payload: { message },
      targetOrigin: targetOrigin || '*'
    }),
    status
  )
}

async function handleAuth(request, env) {
  const missing = requireAuthConfig(env)
  if (missing.length > 0) {
    return jsonResponse({ error: `Missing Worker secrets or variables: ${missing.join(', ')}` }, 500)
  }

  const url = new URL(request.url)
  const provider = url.searchParams.get('provider')
  const siteId = url.searchParams.get('site_id') || ''
  const scope = sanitizeScope(url.searchParams.get('scope'))
  const targetOrigin = resolveTargetOrigin(siteId, env)

  if (provider !== PROVIDER) {
    return authError('Unsupported authentication provider.', targetOrigin)
  }

  if (!siteId || !validateSite(siteId, env)) {
    return authError('This site is not allowed to use the Decap CMS OAuth proxy.', targetOrigin, 403)
  }

  if (!targetOrigin || targetOrigin === '*') {
    return jsonResponse({ error: 'SITE_ORIGIN or ALLOWED_ORIGINS must identify the Decap CMS site origin.' }, 500)
  }

  const callbackUrl = getCallbackUrl(request, env)
  const state = await createState(
    {
      provider,
      siteId,
      targetOrigin,
      scope,
      ts: Math.floor(Date.now() / 1000),
      nonce: crypto.randomUUID()
    },
    env.OAUTH_STATE_SECRET
  )

  const redirectUrl = new URL('https://github.com/login/oauth/authorize')
  redirectUrl.searchParams.set('client_id', env.GITHUB_OAUTH_CLIENT_ID)
  redirectUrl.searchParams.set('redirect_uri', callbackUrl)
  redirectUrl.searchParams.set('scope', scope)
  redirectUrl.searchParams.set('state', state)

  return Response.redirect(redirectUrl.toString(), 302)
}

async function exchangeCodeForToken({ code, request, env }) {
  const body = new URLSearchParams()
  body.set('client_id', env.GITHUB_OAUTH_CLIENT_ID)
  body.set('client_secret', env.GITHUB_OAUTH_CLIENT_SECRET)
  body.set('code', code)
  body.set('redirect_uri', getCallbackUrl(request, env))

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'deshi-startup-decap-oauth'
    },
    body
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.error || !data.access_token) {
    return {
      ok: false,
      error:
        data.error_description ||
        data.error ||
        'GitHub did not return an access token.'
    }
  }

  return {
    ok: true,
    token: data.access_token,
    scope: data.scope || '',
    tokenType: data.token_type || 'bearer'
  }
}

async function handleCallback(request, env) {
  const missing = requireAuthConfig(env)
  if (missing.length > 0) {
    return jsonResponse({ error: `Missing Worker secrets or variables: ${missing.join(', ')}` }, 500)
  }

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error_description') || url.searchParams.get('error')
  const verifiedState = await verifyState(state, env.OAUTH_STATE_SECRET)
  const targetOrigin = verifiedState.ok ? verifiedState.payload.targetOrigin : ''

  if (!verifiedState.ok) {
    return authError(verifiedState.error, targetOrigin)
  }

  if (verifiedState.payload.provider !== PROVIDER) {
    return authError('Unsupported authentication provider.', targetOrigin)
  }

  if (error) {
    return authError(error, targetOrigin)
  }

  if (!code) {
    return authError('GitHub did not return an OAuth code.', targetOrigin)
  }

  const token = await exchangeCodeForToken({ code, request, env })
  if (!token.ok) {
    return authError(token.error, targetOrigin, 502)
  }

  return htmlResponse(
    authResultHtml({
      status: 'success',
      payload: {
        token: token.token,
        provider: PROVIDER
      },
      targetOrigin
    })
  )
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204 })
    }

    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed.' }, 405)
    }

    if (url.pathname === '/' || url.pathname === '/health') {
      return jsonResponse({ ok: true, service: 'deshi-startup-decap-oauth' })
    }

    if (url.pathname === '/auth') {
      return handleAuth(request, env)
    }

    if (url.pathname === '/callback') {
      return handleCallback(request, env)
    }

    return jsonResponse({ error: 'Not found.' }, 404)
  }
}
