const MAX_BODY_BYTES = 12_000
const MAX_TEXT_LENGTH = 4_000
const DEFAULT_ALLOWED_METHODS = 'POST, OPTIONS'
const LABEL_DEFINITIONS = {
  'content-suggestion': {
    color: '2f81f7',
    description: 'Public suggestion or correction for site content'
  },
  'needs-triage': {
    color: 'f9d0c4',
    description: 'Needs maintainer triage'
  },
  urgent: {
    color: 'd1242f',
    description: 'Needs prompt review'
  },
  'risk: high': {
    color: 'b42318',
    description: 'High-risk content requiring expert/editor review'
  }
}

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers
    }
  })
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || ''
  const allowedOrigins = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || ''

  return {
    ...(allowOrigin ? { 'Access-Control-Allow-Origin': allowOrigin } : {}),
    'Access-Control-Allow-Methods': DEFAULT_ALLOWED_METHODS,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  }
}

function validateOrigin(request, env) {
  const origin = request.headers.get('Origin') || ''
  const allowedOrigins = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  return allowedOrigins.length === 0 || allowedOrigins.includes(origin)
}

async function parseJsonBody(request) {
  const contentLength = Number(request.headers.get('Content-Length') || 0)
  if (contentLength > MAX_BODY_BYTES) {
    return { error: 'Request is too large.', status: 413 }
  }

  const text = await request.text()
  if (text.length > MAX_BODY_BYTES) {
    return { error: 'Request is too large.', status: 413 }
  }

  try {
    return { body: JSON.parse(text) }
  } catch {
    return { error: 'Invalid JSON body.', status: 400 }
  }
}

function sanitizeText(value, maxLength = MAX_TEXT_LENGTH) {
  return String(value || '')
    .replace(/\r/g, '')
    .trim()
    .slice(0, maxLength)
}

function normalizePayload(body) {
  return {
    kind: body.kind === 'urgent' ? 'urgent' : 'suggest',
    pageUrl: sanitizeText(body.pageUrl, 600),
    sourcePath: sanitizeText(body.sourcePath, 500),
    section: sanitizeText(body.section, 300),
    proposedChange: sanitizeText(body.proposedChange),
    sourceUrl: sanitizeText(body.sourceUrl, 800),
    sourceType: sanitizeText(body.sourceType, 60) || 'other',
    contact: sanitizeText(body.contact, 200),
    website: sanitizeText(body.website, 200),
    turnstileToken: sanitizeText(body.turnstileToken, 1500)
  }
}

function validatePayload(payload) {
  if (payload.website) {
    return { ok: true, spam: true }
  }

  if (!payload.pageUrl || !payload.sourcePath || !payload.proposedChange) {
    return { ok: false, error: 'Page URL, source path, and suggested change are required.' }
  }

  try {
    const page = new URL(payload.pageUrl)
    if (!['http:', 'https:'].includes(page.protocol)) {
      return { ok: false, error: 'Page URL must be HTTP or HTTPS.' }
    }
  } catch {
    return { ok: false, error: 'Page URL is invalid.' }
  }

  if (payload.sourceUrl) {
    try {
      const source = new URL(payload.sourceUrl)
      if (!['http:', 'https:'].includes(source.protocol)) {
        return { ok: false, error: 'Source URL must be HTTP or HTTPS.' }
      }
    } catch {
      return { ok: false, error: 'Source URL is invalid.' }
    }
  }

  return { ok: true, spam: false }
}

async function verifyTurnstile(payload, request, env) {
  const requiresTurnstile = env.REQUIRE_TURNSTILE !== 'false'
  if (!requiresTurnstile) return { ok: true }

  if (!env.TURNSTILE_SECRET_KEY) {
    return { ok: false, status: 500, error: 'Turnstile is not configured.' }
  }

  if (!payload.turnstileToken) {
    return { ok: false, status: 400, error: 'Turnstile token is required.' }
  }

  const formData = new FormData()
  formData.append('secret', env.TURNSTILE_SECRET_KEY)
  formData.append('response', payload.turnstileToken)

  const ip = request.headers.get('CF-Connecting-IP')
  if (ip) formData.append('remoteip', ip)

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData
  })
  const result = await response.json()

  if (!result.success) {
    return { ok: false, status: 401, error: 'Human verification failed.' }
  }

  return { ok: true }
}

async function checkRateLimit(request, env) {
  if (!env.RATE_LIMITER) return { ok: true }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const origin = request.headers.get('Origin') || 'unknown'
  const result = await env.RATE_LIMITER.limit({ key: `${origin}:${ip}` })

  if (!result.success) {
    return { ok: false, status: 429, error: 'Too many submissions. Please try again later.' }
  }

  return { ok: true }
}

function buildIssue(payload) {
  const urgent = payload.kind === 'urgent'
  const title = urgent
    ? `Serious content issue: ${payload.sourcePath}`
    : `Content suggestion: ${payload.sourcePath}`
  const labels = urgent
    ? ['content-suggestion', 'needs-triage', 'urgent', 'risk: high']
    : ['content-suggestion', 'needs-triage']

  const body = [
    '## Public contribution',
    '',
    `- Page: ${payload.pageUrl}`,
    `- Source path: \`${payload.sourcePath}\``,
    `- Section: ${payload.section || 'Not specified'}`,
    `- Source URL: ${payload.sourceUrl || 'Not provided'}`,
    `- Source type: ${payload.sourceType}`,
    `- Contributor contact: ${payload.contact || 'Not provided'}`,
    `- Urgent: ${urgent ? 'yes' : 'no'}`,
    '',
    '## Suggested change or issue',
    '',
    payload.proposedChange,
    '',
    '## Triage checklist',
    '',
    '- [ ] Check whether this affects legal, tax, regulatory, health, privacy, payment, or personal/company claims.',
    '- [ ] Verify against an official or clearly reliable source when factual.',
    '- [ ] If high risk, request expert/editor signoff before publishing.',
    '- [ ] AI may summarize or compare sources, but must not be treated as approval.'
  ].join('\n')

  return { title, labels, body }
}

async function createGitHubIssue(payload, env) {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    return { ok: false, status: 500, error: 'GitHub issue queue is not configured.' }
  }

  const issue = buildIssue(payload)
  const headers = {
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'deshi-startup-suggestion-worker',
    'X-GitHub-Api-Version': '2022-11-28'
  }

  for (const label of issue.labels) {
    const definition = LABEL_DEFINITIONS[label]
    if (!definition) continue

    const labelResponse = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/labels`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: label, ...definition })
    })

    if (!labelResponse.ok && labelResponse.status !== 422) {
      const data = await labelResponse.json().catch(() => ({}))
      return {
        ok: false,
        status: labelResponse.status,
        error: data.message || `GitHub label setup failed for ${label}.`
      }
    }
  }

  const response = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/issues`, {
    method: 'POST',
    headers,
    body: JSON.stringify(issue)
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: data.message || 'GitHub issue creation failed.'
    }
  }

  return { ok: true, issueUrl: data.html_url, issueNumber: data.number }
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env)
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }

    if (request.method !== 'POST' || url.pathname !== '/suggestions') {
      return jsonResponse({ error: 'Not found.' }, 404, headers)
    }

    if (!validateOrigin(request, env)) {
      return jsonResponse({ error: 'Origin is not allowed.' }, 403, headers)
    }

    const rateLimit = await checkRateLimit(request, env)
    if (!rateLimit.ok) {
      return jsonResponse({ error: rateLimit.error }, rateLimit.status, headers)
    }

    const parsed = await parseJsonBody(request)
    if (parsed.error) {
      return jsonResponse({ error: parsed.error }, parsed.status, headers)
    }

    const payload = normalizePayload(parsed.body)
    const validation = validatePayload(payload)
    if (!validation.ok) {
      return jsonResponse({ error: validation.error }, 422, headers)
    }
    if (validation.spam) {
      return jsonResponse({ ok: true, ignored: true }, 200, headers)
    }

    const turnstile = await verifyTurnstile(payload, request, env)
    if (!turnstile.ok) {
      return jsonResponse({ error: turnstile.error }, turnstile.status, headers)
    }

    const issue = await createGitHubIssue(payload, env)
    if (!issue.ok) {
      return jsonResponse({ error: issue.error }, issue.status, headers)
    }

    return jsonResponse({ ok: true, issueUrl: issue.issueUrl, issueNumber: issue.issueNumber }, 201, headers)
  }
}
