const MAX_BODY_BYTES = 120_000
const MAX_TEXT_LENGTH = 4_000
const MAX_CURRENT_TEXT_LENGTH = 4_000
const MAX_SOURCE_LENGTH = 45_000
const ISSUE_BODY_LIMIT = 62_000
const DEFAULT_ALLOWED_METHODS = 'POST, OPTIONS'
const DEFAULT_BRANCH = 'main'
const VALID_EDIT_TYPES = new Set(['copyedit', 'broken_link', 'source', 'factual', 'rewrite', 'full_source'])
const HIGH_RISK_EDIT_TYPES = new Set(['source', 'factual', 'full_source'])
const LOW_RISK_EDIT_TYPES = new Set(['copyedit', 'broken_link'])
const SOURCE_PATH_PATTERN = /^app\/\(contents\)\/(?:\(bn\)|en)(?:\/[a-z0-9-]+)*\/page\.mdx$/
const ENGLISH_HIGH_RISK_PATTERN = /\b(?:legal|law|tax|vat|bin|tin|rjsc|labou?r|employment|employee|fintech|healthtech|privacy|imports?|exports?|compliance|regulat\w*|licen[cs]es?|payments?|banks?)\b/i
const BANGLA_HIGH_RISK_PATTERN = /(?:সরকার|নিবন্ধন|কর|ভ্যাট|আইন|লাইসেন্স|পেমেন্ট|ব্যাংক|আমদানি|রপ্তানি)/

const LABEL_DEFINITIONS = {
  'content-suggestion': {
    color: '2f81f7',
    description: 'Public suggestion or correction for site content'
  },
  'pending-revision': {
    color: '0969da',
    description: 'Public edit draft waiting for editorial review'
  },
  'needs-triage': {
    color: 'f9d0c4',
    description: 'Needs maintainer triage'
  },
  urgent: {
    color: 'd1242f',
    description: 'Needs prompt review'
  },
  'fast-track': {
    color: '57ab5a',
    description: 'Low-risk edit that can be reviewed quickly'
  },
  'protected-page': {
    color: '8250df',
    description: 'Touches high-risk or protected content'
  },
  'needs-source': {
    color: 'fbca04',
    description: 'Needs a source before publishing'
  },
  'needs-expert-review': {
    color: 'b42318',
    description: 'Needs domain expert or senior editor signoff'
  },
  'risk: low': {
    color: '57ab5a',
    description: 'Low-risk content change'
  },
  'risk: medium': {
    color: 'bf8700',
    description: 'Medium-risk content change'
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

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || ''
  const origins = allowedOrigins(env)
  const allowOrigin = origins.includes(origin) ? origin : ''

  return {
    ...(allowOrigin ? { 'Access-Control-Allow-Origin': allowOrigin } : {}),
    'Access-Control-Allow-Methods': DEFAULT_ALLOWED_METHODS,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  }
}

function validateOrigin(request, env) {
  const origin = request.headers.get('Origin') || ''
  const origins = allowedOrigins(env)

  return origins.length === 0 || origins.includes(origin)
}

async function readLimitedText(request) {
  const contentLength = Number(request.headers.get('Content-Length') || 0)
  if (contentLength > MAX_BODY_BYTES) {
    return { error: 'Request is too large.', status: 413 }
  }

  if (!request.body) {
    return { text: '' }
  }

  const reader = request.body.getReader()
  const decoder = new TextDecoder()
  let receivedBytes = 0
  let text = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    receivedBytes += value.byteLength
    if (receivedBytes > MAX_BODY_BYTES) {
      return { error: 'Request is too large.', status: 413 }
    }

    text += decoder.decode(value, { stream: true })
  }

  text += decoder.decode()
  return { text }
}

async function parseJsonBody(request) {
  const read = await readLimitedText(request)
  if (read.error) return read

  try {
    return { body: JSON.parse(read.text) }
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

function normalizeSource(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
}

function normalizeEditType(value, editMode, kind) {
  if (editMode === 'source') return 'full_source'

  const editType = sanitizeText(value, 60)
  if (VALID_EDIT_TYPES.has(editType) && editType !== 'full_source') return editType

  return kind === 'urgent' ? 'factual' : 'copyedit'
}

function normalizePayload(body) {
  const editMode = body.editMode === 'source' ? 'source' : 'focused'
  const kind = body.kind === 'urgent' ? 'urgent' : 'suggest'

  return {
    kind,
    editMode,
    editType: normalizeEditType(body.editType, editMode, kind),
    pageUrl: sanitizeText(body.pageUrl, 600),
    sourcePath: sanitizeText(body.sourcePath, 500),
    section: sanitizeText(body.section, 300),
    currentText: sanitizeText(body.currentText, MAX_CURRENT_TEXT_LENGTH),
    proposedChange: sanitizeText(body.proposedChange),
    proposedContent: normalizeSource(body.proposedContent),
    sourceUrl: sanitizeText(body.sourceUrl, 800),
    sourceType: sanitizeText(body.sourceType, 60) || 'other',
    contact: sanitizeText(body.contact, 200),
    website: sanitizeText(body.website, 200),
    turnstileToken: sanitizeText(body.turnstileToken, 1500)
  }
}

function isValidHttpUrl(value, label) {
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { ok: false, error: `${label} must be HTTP or HTTPS.` }
    }
  } catch {
    return { ok: false, error: `${label} is invalid.` }
  }

  return { ok: true }
}

function hasHighRiskTerms(value) {
  return ENGLISH_HIGH_RISK_PATTERN.test(value || '') || BANGLA_HIGH_RISK_PATTERN.test(value || '')
}

function classifyReview(payload) {
  const proposedText = payload.editMode === 'source' ? payload.proposedContent : payload.proposedChange
  const protectedPage = hasHighRiskTerms(payload.sourcePath) || hasHighRiskTerms(payload.pageUrl)
  const highRiskTermsInChange = hasHighRiskTerms(`${payload.section}\n${payload.currentText}\n${proposedText}`)
  const factualOrSourceChange = HIGH_RISK_EDIT_TYPES.has(payload.editType)
  let riskLevel = 'medium'

  if (payload.kind === 'urgent' || (factualOrSourceChange && (protectedPage || highRiskTermsInChange))) {
    riskLevel = 'high'
  } else if (LOW_RISK_EDIT_TYPES.has(payload.editType) && !protectedPage && !highRiskTermsInChange) {
    riskLevel = 'low'
  }

  const sourceRequired = riskLevel === 'high' && payload.kind !== 'urgent'
  const needsExpert = riskLevel === 'high'
  const fastTrack = riskLevel === 'low' && !protectedPage

  return {
    riskLevel,
    protectedPage,
    highRiskTermsInChange,
    sourceRequired,
    needsExpert,
    fastTrack
  }
}

function validatePayload(payload, review) {
  if (payload.website) {
    return { ok: true, spam: true }
  }

  if (!payload.pageUrl || !payload.sourcePath) {
    return { ok: false, error: 'Page URL and source path are required.' }
  }

  if (!SOURCE_PATH_PATTERN.test(payload.sourcePath)) {
    return { ok: false, error: 'Source path is not editable through the public queue.' }
  }

  const page = isValidHttpUrl(payload.pageUrl, 'Page URL')
  if (!page.ok) return page

  if (payload.sourceUrl) {
    const source = isValidHttpUrl(payload.sourceUrl, 'Source URL')
    if (!source.ok) return source
  }

  if (payload.editMode === 'source') {
    if (!payload.proposedContent.trim()) {
      return { ok: false, error: 'Draft source content is required.' }
    }

    if (payload.proposedContent.length > MAX_SOURCE_LENGTH) {
      return { ok: false, error: `Draft source is too long. Keep it under ${MAX_SOURCE_LENGTH} characters.` }
    }
  } else {
    if (!payload.proposedChange) {
      return { ok: false, error: 'Suggested change is required.' }
    }

    if (payload.kind !== 'urgent' && !payload.currentText) {
      return { ok: false, error: 'Current text is required for focused edits so reviewers can see a diff.' }
    }
  }

  if (review.sourceRequired && !payload.sourceUrl) {
    return { ok: false, error: 'High-risk factual edits need a source URL before review.' }
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

function encodeGitHubPath(sourcePath) {
  return sourcePath.split('/').map((part) => encodeURIComponent(part)).join('/')
}

function githubRawUrl(payload, env) {
  const branch = encodeURIComponent(env.GITHUB_BRANCH || DEFAULT_BRANCH)
  return `https://raw.githubusercontent.com/${env.GITHUB_REPO}/${branch}/${encodeGitHubPath(payload.sourcePath)}`
}

async function fetchCurrentSource(payload, env) {
  if (payload.editMode !== 'source' || !env.GITHUB_REPO) return { text: '' }

  const response = await fetch(githubRawUrl(payload, env), {
    headers: {
      'User-Agent': 'deshi-startup-suggestion-worker'
    }
  })

  if (!response.ok) {
    return { text: '', warning: `Could not load current source for diff. GitHub returned ${response.status}.` }
  }

  const text = await response.text()
  return { text }
}

function diffLines(previousText, nextText, contextLines = 4, maxLines = 220) {
  if (!previousText && !nextText) return 'No source diff available.'
  if (previousText === nextText) return 'No changes detected.'

  const previous = previousText.split('\n')
  const next = nextText.split('\n')
  let start = 0

  while (start < previous.length && start < next.length && previous[start] === next[start]) {
    start += 1
  }

  let previousEnd = previous.length - 1
  let nextEnd = next.length - 1

  while (previousEnd >= start && nextEnd >= start && previous[previousEnd] === next[nextEnd]) {
    previousEnd -= 1
    nextEnd -= 1
  }

  const previousStart = Math.max(0, start - contextLines)
  const nextStart = Math.max(0, start - contextLines)
  const previousStop = Math.min(previous.length - 1, previousEnd + contextLines)
  const nextStop = Math.min(next.length - 1, nextEnd + contextLines)
  const lines = [`@@ -${previousStart + 1},${previousStop - previousStart + 1} +${nextStart + 1},${nextStop - nextStart + 1} @@`]

  for (let index = previousStart; index < start; index += 1) {
    lines.push(` ${previous[index]}`)
  }

  for (let index = start; index <= previousEnd; index += 1) {
    lines.push(`-${previous[index] || ''}`)
  }

  for (let index = start; index <= nextEnd; index += 1) {
    lines.push(`+${next[index] || ''}`)
  }

  for (let index = nextEnd + 1; index <= nextStop; index += 1) {
    lines.push(` ${next[index]}`)
  }

  if (lines.length > maxLines) {
    const hidden = lines.length - maxLines
    return [...lines.slice(0, maxLines), `... ${hidden} diff lines hidden; see full draft source below.`].join('\n')
  }

  return lines.join('\n')
}

function focusedDiff(payload) {
  if (!payload.currentText) return ''

  return [
    '```diff',
    ...payload.currentText.split('\n').map((line) => `-${line}`),
    ...payload.proposedChange.split('\n').map((line) => `+${line}`),
    '```'
  ].join('\n')
}

function issueLabels(payload, review) {
  const labels = ['content-suggestion', 'pending-revision', 'needs-triage', `risk: ${review.riskLevel}`]
  const missingSourceForReview = !payload.sourceUrl && (review.sourceRequired || HIGH_RISK_EDIT_TYPES.has(payload.editType))

  if (payload.kind === 'urgent') labels.push('urgent')
  if (review.fastTrack) labels.push('fast-track')
  if (review.protectedPage) labels.push('protected-page')
  if (missingSourceForReview) labels.push('needs-source')
  if (review.needsExpert) labels.push('needs-expert-review')

  return [...new Set(labels)]
}

function reviewSummary(review) {
  return [
    `- Review tier: ${review.riskLevel}`,
    `- Protected/high-risk page: ${review.protectedPage ? 'yes' : 'no'}`,
    `- High-risk terms in change: ${review.highRiskTermsInChange ? 'yes' : 'no'}`,
    `- Fast-track candidate: ${review.fastTrack ? 'yes' : 'no'}`,
    `- Expert review needed: ${review.needsExpert ? 'yes' : 'no'}`,
    `- Source required before publish: ${review.sourceRequired ? 'yes' : 'no'}`
  ].join('\n')
}

function buildIssueBody(payload, review, currentSource) {
  const sourceWarning = currentSource.warning ? `\n> ${currentSource.warning}\n` : ''
  const diff = payload.editMode === 'source'
    ? [
        '## Draft source diff',
        '',
        '```diff',
        diffLines(currentSource.text, payload.proposedContent),
        '```',
        sourceWarning
      ].join('\n')
    : [
        '## Focused edit diff',
        '',
        focusedDiff(payload) || '_No current text was provided. Review the proposed change against the page section._'
      ].join('\n')

  const sourceDraft = payload.editMode === 'source'
    ? [
        '## Full draft source',
        '',
        '<details>',
        '<summary>Proposed page.mdx</summary>',
        '',
        '```mdx',
        payload.proposedContent,
        '```',
        '',
        '</details>'
      ].join('\n')
    : ''

  const body = [
    '## Pending public revision',
    '',
    'A public contributor submitted this through the Deshi Startup website. This is a draft revision, not a published change.',
    '',
    '## Page',
    '',
    `- Page: ${payload.pageUrl}`,
    `- Source path: \`${payload.sourcePath}\``,
    `- Section: ${payload.section || 'Not specified'}`,
    `- Edit mode: ${payload.editMode}`,
    `- Edit type: ${payload.editType}`,
    `- Source URL: ${payload.sourceUrl || 'Not provided'}`,
    `- Source type: ${payload.sourceType}`,
    `- Contributor contact: ${payload.contact || 'Not provided'}`,
    `- Urgent: ${payload.kind === 'urgent' ? 'yes' : 'no'}`,
    '',
    '## Review classification',
    '',
    reviewSummary(review),
    '',
    diff,
    '',
    '## Suggested change or issue',
    '',
    payload.proposedChange || '_See the full draft source._',
    '',
    sourceDraft,
    '',
    '## Triage checklist',
    '',
    '- [ ] Confirm whether this is low, medium, or high risk.',
    '- [ ] Check citations for factual claims; high-risk factual edits need official or clearly reputable sources.',
    '- [ ] If this touches legal, tax, VAT, RJSC, employment, fintech, healthtech, privacy, import/export, payment, or government policy content, get expert/senior editor signoff.',
    '- [ ] Apply the edit through Decap CMS or a pull request; do not publish directly from this issue.',
    '- [ ] AI may summarize or compare sources, but must not be treated as approval.'
  ].filter(Boolean).join('\n')

  if (body.length <= ISSUE_BODY_LIMIT) return body

  return [
    body.slice(0, ISSUE_BODY_LIMIT),
    '',
    '_Issue body truncated by the Worker to stay within GitHub limits. Ask the contributor to split the draft if needed._'
  ].join('\n')
}

async function buildIssue(payload, review, env) {
  const currentSource = await fetchCurrentSource(payload, env)
  const title = payload.kind === 'urgent'
    ? `Serious content issue: ${payload.sourcePath}`
    : `Pending content edit: ${payload.sourcePath}`

  return {
    title,
    labels: issueLabels(payload, review),
    body: buildIssueBody(payload, review, currentSource)
  }
}

async function ensureLabels(labels, headers, env) {
  for (const label of labels) {
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

  return { ok: true }
}

async function createGitHubIssue(payload, review, env) {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    return { ok: false, status: 500, error: 'GitHub issue queue is not configured.' }
  }

  const issue = await buildIssue(payload, review, env)
  const headers = {
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'deshi-startup-suggestion-worker',
    'X-GitHub-Api-Version': '2022-11-28'
  }

  const labels = await ensureLabels(issue.labels, headers, env)
  if (!labels.ok) return labels

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

  return { ok: true, issueUrl: data.html_url, issueNumber: data.number, reviewTier: review.riskLevel }
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
    const review = classifyReview(payload)
    const validation = validatePayload(payload, review)
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

    const issue = await createGitHubIssue(payload, review, env)
    if (!issue.ok) {
      return jsonResponse({ error: issue.error }, issue.status, headers)
    }

    return jsonResponse({
      ok: true,
      issueUrl: issue.issueUrl,
      issueNumber: issue.issueNumber,
      reviewTier: issue.reviewTier
    }, 201, headers)
  }
}
