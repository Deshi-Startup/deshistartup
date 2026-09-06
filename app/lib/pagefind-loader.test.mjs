import assert from 'node:assert/strict'
import test from 'node:test'

import { createPagefindLoader } from './pagefind-loader.ts'

function fakePagefind(overrides = {}) {
  return {
    options: async () => {},
    init: async () => {},
    search: async () => ({ results: [] }),
    ...overrides
  }
}

test('reading does not load search; focus and typing share one initialized index', async () => {
  const calls = []
  const initialized = Promise.withResolvers()
  const pagefind = fakePagefind({
    options: async (options) => calls.push(['options', options]),
    init: async () => {
      calls.push(['init'])
      await initialized.promise
    }
  })
  const load = createPagefindLoader(async (url) => {
    calls.push(['import', url])
    return pagefind
  }, '/preview')
  assert.deepEqual(calls, [])

  const focus = load()
  const typing = load()
  assert.equal(focus, typing)
  await new Promise(setImmediate)
  assert.deepEqual(calls, [
    ['import', '/preview/_pagefind/pagefind.js'],
    ['options', { baseUrl: '/preview', ranking: { metaWeights: { 'alternate-title': 4 } } }],
    ['init']
  ])
  let ready = false
  focus.then(() => { ready = true })
  await new Promise(setImmediate)
  assert.equal(ready, false, 'callers must wait for initialization')

  initialized.resolve()
  assert.equal(await focus, pagefind)
  assert.equal(await load(), pagefind)
  assert.equal(calls.length, 3, 'repeated searches reuse the ready index')
})

test('a failed module download retries with a fresh URL, then caches success', async () => {
  const urls = []
  const pagefind = fakePagefind()
  const load = createPagefindLoader(async (url) => {
    urls.push(url)
    if (urls.length === 1) throw new Error('network unavailable')
    return pagefind
  })

  await assert.rejects(load(), /network unavailable/)
  assert.equal(await load(), pagefind)
  assert.equal(await load(), pagefind)
  assert.deepEqual(urls, ['/_pagefind/pagefind.js', '/_pagefind/pagefind.js?retry=1'])
})

test('an index that fails configuration or initialization never becomes the cached result', async () => {
  for (const failedStep of ['options', 'init']) {
    let attempts = 0
    let configuredBase
    const ready = fakePagefind({ options: async (options) => { configuredBase = options.baseUrl } })
    const load = createPagefindLoader(async () => {
      attempts += 1
      return attempts === 1
        ? fakePagefind({ [failedStep]: async () => { throw new Error(failedStep) } })
        : ready
    })
    await assert.rejects(load(), new RegExp(failedStep))
    assert.equal(await load(), ready)
    assert.equal(configuredBase, '/')
    assert.equal(attempts, 2)
  }
})
