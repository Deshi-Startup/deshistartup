import assert from 'node:assert/strict'
import worker from '../workers/decap-oauth/src/index.js'

const env = {
  GITHUB_OAUTH_CLIENT_ID: 'test-client-id',
  GITHUB_OAUTH_CLIENT_SECRET: 'test-client-secret',
  OAUTH_STATE_SECRET: 'test-state-secret',
  SITE_ORIGIN: 'https://deshi-startup.github.io',
  ALLOWED_ORIGINS: 'https://deshi-startup.github.io',
  ALLOWED_SITE_IDS: 'deshi-startup.github.io'
}

function request(url, init = {}) {
  return new Request(url, {
    method: 'GET',
    ...init
  })
}

async function getRedirectState() {
  const response = await worker.fetch(
    request('https://cms-auth.example.com/auth?provider=github&site_id=deshi-startup.github.io&scope=repo'),
    env
  )

  assert.equal(response.status, 302)

  const location = response.headers.get('Location')
  assert.ok(location)

  const redirect = new URL(location)
  assert.equal(redirect.origin, 'https://github.com')
  assert.equal(redirect.pathname, '/login/oauth/authorize')
  assert.equal(redirect.searchParams.get('client_id'), env.GITHUB_OAUTH_CLIENT_ID)
  assert.equal(redirect.searchParams.get('redirect_uri'), 'https://cms-auth.example.com/callback')
  assert.equal(redirect.searchParams.get('scope'), 'repo')

  return redirect.searchParams.get('state')
}

{
  const response = await worker.fetch(request('https://cms-auth.example.com/health'), env)
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.ok, true)
}

const state = await getRedirectState()
assert.ok(state)

{
  const originalFetch = globalThis.fetch

  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), 'https://github.com/login/oauth/access_token')
    assert.equal(init.method, 'POST')
    assert.equal(init.headers.Accept, 'application/json')

    const body = new URLSearchParams(init.body)
    assert.equal(body.get('client_id'), env.GITHUB_OAUTH_CLIENT_ID)
    assert.equal(body.get('client_secret'), env.GITHUB_OAUTH_CLIENT_SECRET)
    assert.equal(body.get('code'), 'test-code')
    assert.equal(body.get('redirect_uri'), 'https://cms-auth.example.com/callback')

    return new Response(
      JSON.stringify({
        access_token: 'gho_test_token',
        scope: 'repo',
        token_type: 'bearer'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const response = await worker.fetch(
      request(`https://cms-auth.example.com/callback?code=test-code&state=${encodeURIComponent(state)}`),
      env
    )
    const html = await response.text()

    assert.equal(response.status, 200)
    assert.match(html, /authorization:github:success:/)
    assert.match(html, /gho_test_token/)
    assert.match(html, /https:\/\/deshi-startup\.github\.io/)
  } finally {
    globalThis.fetch = originalFetch
  }
}

{
  const response = await worker.fetch(
    request('https://cms-auth.example.com/auth?provider=github&site_id=evil.example&scope=repo'),
    env
  )
  const html = await response.text()

  assert.equal(response.status, 403)
  assert.match(html, /not allowed/)
}

{
  const response = await worker.fetch(
    request('https://cms-auth.example.com/callback?code=test-code&state=bad-state'),
    env
  )
  const html = await response.text()

  assert.equal(response.status, 400)
  assert.match(html, /Invalid OAuth state/)
}

{
  const response = await worker.fetch(
    request('https://cms-auth.example.com/auth?provider=github&site_id=deshi-startup.github.io'),
    {
      ...env,
      OAUTH_STATE_SECRET: ''
    }
  )
  const body = await response.json()

  assert.equal(response.status, 500)
  assert.match(body.error, /OAUTH_STATE_SECRET/)
}

console.log('Decap OAuth Worker tests passed.')
