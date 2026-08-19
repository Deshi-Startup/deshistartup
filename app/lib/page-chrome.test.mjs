import assert from 'node:assert/strict'
import test from 'node:test'
import { cleanRoute } from './clean-route.ts'
import { pageChromePolicy } from './page-chrome.ts'

test('utility and policy pages do not present Guide and Discussion as content tabs', () => {
  for (const route of [
    '/about',
    '/contact',
    '/contribute',
    '/privacy',
    '/terms',
    '/sitemap',
    '/en/about',
    '/en/contact',
    '/en/contribute',
    '/en/privacy',
    '/en/terms',
    '/en/sitemap'
  ]) {
    assert.equal(pageChromePolicy(route).showContentTabs, false, route)
  }
})

test('home and contact omit the whole page-chrome strip', () => {
  for (const route of ['/', '/en', '/en/', '/contact', '/en/contact']) {
    assert.deepEqual(
      pageChromePolicy(route),
      { showContentTabs: false, showPageActions: false },
      route
    )
  }
})

test('non-guide pages retain useful edit and history actions', () => {
  for (const route of ['/about', '/contribute', '/privacy', '/terms', '/sitemap', '/en/privacy']) {
    assert.equal(pageChromePolicy(route).showPageActions, true, route)
  }
})

test('guides and content collections retain the established content chrome', () => {
  for (const route of [
    '/registration/private-limited',
    '/en/registration/private-limited',
    '/tax',
    '/guides',
    '/directory',
    '/journeys'
  ]) {
    assert.deepEqual(
      pageChromePolicy(route),
      { showContentTabs: true, showPageActions: true },
      route
    )
  }
})

test('static-export spellings resolve to the same page-chrome policy', () => {
  for (const route of [
    '/privacy/',
    '/privacy.html',
    '/privacy/index.html',
    '/en/privacy/',
    '/en/privacy.html',
    '/en/privacy/index.html'
  ]) {
    assert.deepEqual(
      pageChromePolicy(cleanRoute(route)),
      { showContentTabs: false, showPageActions: true },
      route
    )
  }
})

test('utility route names are exact rather than prefix matches', () => {
  for (const route of ['/privacy/notice-template', '/contact/customer-support', '/en/terms/term-sheets']) {
    assert.deepEqual(
      pageChromePolicy(route),
      { showContentTabs: true, showPageActions: true },
      route
    )
  }
})
