import assert from 'node:assert/strict'
import test from 'node:test'
import { CONTACT_BODY_MAX_BYTES, CONTACT_FIELD_LIMITS } from '../../app/lib/contact.ts'
import { POST } from './contact.ts'

const ORIGIN = 'https://deshistartup.com'

function payload(overrides = {}) {
  return {
    name: 'A Reader',
    email: 'reader@example.com',
    topic: 'general',
    message: 'This is a useful test message.',
    website: '',
    ...overrides
  }
}

function request(body = payload(), overrides = {}) {
  const headers = new Headers({
    Origin: ORIGIN,
    'Content-Type': 'application/json',
    'CF-Connecting-IP': '203.0.113.10',
    ...overrides.headers
  })
  return new Request(overrides.url || `${ORIGIN}/api/contact`, {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body)
  })
}

function mockEnv({ ipAllowed = true, regionAllowed = true } = {}) {
  const sent = []
  const limitCalls = []
  return {
    sent,
    limitCalls,
    env: {
      CONTACT_INBOX: 'verified-destination@example.com',
      CONTACT_EMAIL: {
        async send(message) {
          sent.push(message)
          return { messageId: 'test-message' }
        }
      },
      CONTACT_IP_RATE: {
        async limit({ key }) {
          limitCalls.push({ limiter: 'ip', key })
          return { success: ipAllowed }
        }
      },
      CONTACT_REGION_RATE: {
        async limit({ key }) {
          limitCalls.push({ limiter: 'region', key })
          return { success: regionAllowed }
        }
      }
    }
  }
}

async function responseBody(response) {
  return response.json()
}

test('sends a valid same-origin message only to the runtime destination', async () => {
  const { env, sent, limitCalls } = mockEnv()
  const response = await POST(request(), env)

  assert.equal(response.status, 200)
  assert.deepEqual(await responseBody(response), { ok: true })
  assert.deepEqual(limitCalls, [
    { limiter: 'ip', key: '203.0.113.10' },
    { limiter: 'region', key: 'contact' }
  ])
  assert.equal(sent.length, 1)
  assert.equal(sent[0].to, 'verified-destination@example.com')
  assert.match(sent[0].subject, /General question/)
  assert.doesNotMatch(sent[0].text, /Sent from:/)
})

test('blocks cross-origin and non-JSON browser submissions before rate limiting', async () => {
  const crossOrigin = mockEnv()
  const crossOriginResponse = await POST(
    request(payload(), {
      headers: { Origin: 'https://attacker.example', 'Content-Type': 'text/plain' }
    }),
    crossOrigin.env
  )
  assert.equal(crossOriginResponse.status, 403)
  assert.equal(crossOrigin.sent.length, 0)
  assert.equal(crossOrigin.limitCalls.length, 0)

  const wrongType = mockEnv()
  const wrongTypeResponse = await POST(
    request(payload(), { headers: { 'Content-Type': 'text/plain' } }),
    wrongType.env
  )
  assert.equal(wrongTypeResponse.status, 415)
  assert.equal(wrongType.sent.length, 0)
  assert.equal(wrongType.limitCalls.length, 0)

  const noOrigin = mockEnv()
  const noOriginResponse = await POST(
    request(payload(), { headers: { Origin: '' } }),
    noOrigin.env
  )
  assert.equal(noOriginResponse.status, 403)
  assert.equal(noOrigin.sent.length, 0)
})

test('allows the loopback origin change made by the local Next proxy', async () => {
  const { env, sent } = mockEnv()
  const response = await POST(
    request(payload(), {
      url: 'http://127.0.0.1:8787/api/contact',
      headers: { Origin: 'http://localhost:3000' }
    }),
    env
  )
  assert.equal(response.status, 200)
  assert.equal(sent.length, 1)
})

test('rejects an over-limit IP before parsing or spending regional capacity', async () => {
  const { env, sent, limitCalls } = mockEnv({ ipAllowed: false })
  const response = await POST(request('{'), env)

  assert.equal(response.status, 429)
  assert.deepEqual(await responseBody(response), { error: 'rate_limited' })
  assert.equal(sent.length, 0)
  assert.deepEqual(limitCalls, [{ limiter: 'ip', key: '203.0.113.10' }])
})

test('rejects declared and streamed bodies over the byte ceiling', async () => {
  const declared = mockEnv()
  const declaredResponse = await POST(
    request('{}', { headers: { 'Content-Length': String(CONTACT_BODY_MAX_BYTES + 1) } }),
    declared.env
  )
  assert.equal(declaredResponse.status, 413)
  assert.equal(declared.limitCalls.length, 0)

  const streamed = mockEnv()
  const streamRequest = {
    url: `${ORIGIN}/api/contact`,
    headers: new Headers({
      Origin: ORIGIN,
      'Content-Type': 'application/json',
      'CF-Connecting-IP': '203.0.113.10'
    }),
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(CONTACT_BODY_MAX_BYTES + 1))
        controller.close()
      }
    })
  }
  const streamedResponse = await POST(streamRequest, streamed.env)
  assert.equal(streamedResponse.status, 413)
  assert.equal(streamed.sent.length, 0)
  assert.deepEqual(streamed.limitCalls, [{ limiter: 'ip', key: '203.0.113.10' }])
})

test('rejects overlong fields without spending regional capacity', async () => {
  const { env, sent, limitCalls } = mockEnv()
  const response = await POST(
    request(payload({ message: 'x'.repeat(CONTACT_FIELD_LIMITS.message + 1) })),
    env
  )

  assert.equal(response.status, 400)
  assert.deepEqual(await responseBody(response), { error: 'invalid_fields' })
  assert.equal(sent.length, 0)
  assert.deepEqual(limitCalls, [{ limiter: 'ip', key: '203.0.113.10' }])
})

test('returns silent success for a filled honeypot without sending mail', async () => {
  const { env, sent, limitCalls } = mockEnv()
  const response = await POST(request(payload({ website: 'bot-filled.example' })), env)

  assert.equal(response.status, 200)
  assert.deepEqual(await responseBody(response), { ok: true })
  assert.equal(sent.length, 0)
  assert.deepEqual(limitCalls, [{ limiter: 'ip', key: '203.0.113.10' }])
})
