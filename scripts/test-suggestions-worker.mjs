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
    pageUrl: 'https://deshi-startup.github.io/deshistartup/trade-license',
    sourcePath: 'app/(contents)/(bn)/trade-license/page.mdx',
    section: 'Sources',
    proposedChange: 'Add the latest official city corporation link.',
    sourceUrl: 'https://example.gov.bd/service/details',
    sourceType: 'official',
    contact: '',
    website: '',
    ...extra
  }
}

async function withMockedFetch(callback) {
  const originalFetch = globalThis.fetch
  const calls = []

  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init })
    return new Response(JSON.stringify({ html_url: 'https://github.com/example/issues/1', number: 1 }), {
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

await withMockedFetch(async (calls) => {
  const response = await worker.fetch(request(validPayload()), baseEnv)
  const body = await response.json()

  assert.equal(response.status, 201)
  assert.equal(body.issueUrl, 'https://github.com/example/issues/1')
  assert.equal(calls.length, 3)

  const issue = JSON.parse(calls.at(-1).init.body)
  assert.deepEqual(issue.labels, ['content-suggestion', 'needs-triage'])
})

await withMockedFetch(async (calls) => {
  const response = await worker.fetch(request(validPayload({ kind: 'urgent' })), baseEnv)

  assert.equal(response.status, 201)
  assert.equal(calls.length, 5)
  const issue = JSON.parse(calls.at(-1).init.body)
  assert.ok(issue.labels.includes('urgent'))
  assert.ok(issue.labels.includes('risk: high'))
})

{
  const response = await worker.fetch(request(validPayload({ proposedChange: '' })), baseEnv)
  assert.equal(response.status, 422)
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
