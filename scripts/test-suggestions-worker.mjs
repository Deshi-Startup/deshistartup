import assert from 'node:assert/strict'
import worker from '../workers/suggestions/src/index.js'

const origin = 'https://deshi-startup.github.io'
const baseEnv = {
  GITHUB_REPO: 'Deshi-Startup/deshistartup',
  GITHUB_TOKEN: 'test-token',
  ALLOWED_ORIGINS: origin,
  REQUIRE_TURNSTILE: 'false'
}

function request(body, headers = {}) {
  return new Request('https://suggestions.example.com/suggestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': origin,
      'CF-Connecting-IP': '203.0.113.10',
      ...headers
    },
    body: JSON.stringify(body)
  })
}

function validPayload(extra = {}) {
  return {
    kind: 'suggest',
    editMode: 'focused',
    editType: 'copyedit',
    pageUrl: 'https://deshi-startup.github.io/deshistartup/start-here',
    sourcePath: 'app/(contents)/(bn)/start-here/page.mdx',
    section: 'Intro',
    currentText: 'Old sentence.',
    proposedChange: 'Better sentence.',
    proposedContent: '',
    sourceUrl: '',
    sourceType: 'official',
    contact: '',
    website: '',
    ...extra
  }
}

async function withMockedFetch(callback) {
  const originalFetch = globalThis.fetch
  const calls = []

  globalThis.fetch = async (url, init = {}) => {
    const href = String(url)
    calls.push({ url: href, init })

    if (href.startsWith('https://raw.githubusercontent.com/')) {
      return new Response('---\ntitle: Test\n---\n\nOld sentence.\n', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    if (href.endsWith('/issues')) {
      return new Response(JSON.stringify({ html_url: 'https://github.com/example/issues/1', number: 1 }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ name: 'label' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    await callback(calls)
  } finally {
    globalThis.fetch = originalFetch
  }
}

function createdIssue(calls) {
  const call = calls.find((entry) => entry.url.endsWith('/issues'))
  assert.ok(call, 'expected GitHub issue creation call')
  return JSON.parse(call.init.body)
}

await withMockedFetch(async (calls) => {
  const response = await worker.fetch(request(validPayload()), baseEnv)
  const body = await response.json()
  const issue = createdIssue(calls)

  assert.equal(response.status, 201)
  assert.equal(body.issueUrl, 'https://github.com/example/issues/1')
  assert.equal(body.reviewTier, 'low')
  assert.ok(issue.labels.includes('pending-revision'))
  assert.ok(issue.labels.includes('risk: low'))
  assert.ok(issue.labels.includes('fast-track'))
  assert.ok(!issue.labels.includes('needs-source'))
  assert.match(issue.body, /## Focused edit diff/)
  assert.match(issue.body, /-Old sentence\./)
  assert.match(issue.body, /\+Better sentence\./)
})

await withMockedFetch(async (calls) => {
  const response = await worker.fetch(request(validPayload({
    kind: 'urgent',
    pageUrl: 'https://deshi-startup.github.io/deshistartup/legal-roadmap',
    sourcePath: 'app/(contents)/(bn)/legal-roadmap/page.mdx',
    proposedChange: 'The VAT guidance may be wrong.'
  })), baseEnv)
  const issue = createdIssue(calls)

  assert.equal(response.status, 201)
  assert.ok(issue.labels.includes('urgent'))
  assert.ok(issue.labels.includes('risk: high'))
  assert.ok(issue.labels.includes('protected-page'))
  assert.ok(issue.labels.includes('needs-expert-review'))
})

await withMockedFetch(async (calls) => {
  const sourceDraft = '---\ntitle: Test\n---\n\nBetter source draft.\n'
  const response = await worker.fetch(request(validPayload({
    editMode: 'source',
    editType: 'full_source',
    pageUrl: 'https://deshi-startup.github.io/deshistartup/start-here',
    sourcePath: 'app/(contents)/(bn)/start-here/page.mdx',
    proposedChange: '',
    proposedContent: sourceDraft,
    sourceUrl: 'https://example.gov.bd/service/details'
  })), baseEnv)
  const issue = createdIssue(calls)

  assert.equal(response.status, 201)
  assert.ok(issue.labels.includes('pending-revision'))
  assert.match(issue.body, /## Draft source diff/)
  assert.match(issue.body, /-Old sentence\./)
  assert.match(issue.body, /\+Better source draft\./)
  assert.match(issue.body, /## Full draft source/)
})

{
  const response = await worker.fetch(request(validPayload({ proposedChange: '' })), baseEnv)
  assert.equal(response.status, 422)
}

{
  const response = await worker.fetch(request(validPayload({
    editType: 'factual',
    pageUrl: 'https://deshi-startup.github.io/deshistartup/e-tin-vat-bin',
    sourcePath: 'app/(contents)/(bn)/e-tin-vat-bin/page.mdx',
    proposedChange: 'VAT threshold is now different.'
  })), baseEnv)
  const body = await response.json()

  assert.equal(response.status, 422)
  assert.match(body.error, /source URL/i)
}

{
  const response = await worker.fetch(request(validPayload({ website: 'https://spam.example' })), baseEnv)
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.ignored, true)
}

{
  const response = await worker.fetch(request(validPayload()), {
    ...baseEnv,
    REQUIRE_TURNSTILE: 'true',
    TURNSTILE_SECRET_KEY: 'secret'
  })
  assert.equal(response.status, 400)
}

{
  const response = await worker.fetch(request(validPayload()), {
    ...baseEnv,
    RATE_LIMITER: {
      async limit() {
        return { success: false }
      }
    }
  })
  assert.equal(response.status, 429)
}

console.log('Suggestion Worker tests passed.')
