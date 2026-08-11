import assert from 'node:assert/strict'
import test from 'node:test'

import { cleanRoute } from './clean-route.ts'

test('clean URLs are returned unchanged', () => {
  assert.equal(cleanRoute('/'), '/')
  assert.equal(cleanRoute('/en'), '/en')
  assert.equal(cleanRoute('/en/start-here'), '/en/start-here')
  assert.equal(cleanRoute('/registration/structure-comparison'), '/registration/structure-comparison')
})

test('the literal exported file name resolves to its clean route', () => {
  assert.equal(cleanRoute('/en.html'), '/en')
  assert.equal(cleanRoute('/en/start-here.html'), '/en/start-here')
  assert.equal(cleanRoute('/index.html'), '/')
  assert.equal(cleanRoute('/en/index.html'), '/en')
})

test('a trailing slash is an equivalent spelling', () => {
  assert.equal(cleanRoute('/en/'), '/en')
  assert.equal(cleanRoute('/registration/'), '/registration')
})

test('the English test holds for every spelling of the English home', () => {
  const isEn = (path) => {
    const route = cleanRoute(path)
    return route === '/en' || route.startsWith('/en/')
  }
  for (const spelling of ['/en', '/en/', '/en.html', '/en/index.html']) {
    assert.equal(isEn(spelling), true, spelling)
  }
  for (const spelling of ['/', '/index.html', '/enterprise', '/english']) {
    assert.equal(isEn(spelling), false, spelling)
  }
})
