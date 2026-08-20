import assert from 'node:assert/strict'
import test from 'node:test'
import { cleanRoute } from './clean-route.ts'
import { sourceSupportsInlineEdit } from './inline-edit-policy.mjs'
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
      { showContentTabs: false, showPageActions: false, showEditAction: false },
      route
    )
  }
})

test('authored non-guide pages retain edit and history actions', () => {
  for (const route of ['/about', '/contribute', '/privacy', '/terms', '/en/privacy']) {
    assert.deepEqual(
      pageChromePolicy(route),
      { showContentTabs: false, showPageActions: true, showEditAction: true },
      route
    )
  }
})

test('guides and authored collections retain the established content chrome', () => {
  for (const route of [
    '/registration/private-limited',
    '/en/registration/private-limited',
    '/guides',
    '/journeys',
    '/case-studies',
    '/validation'
  ]) {
    assert.deepEqual(
      pageChromePolicy(route),
      { showContentTabs: true, showPageActions: true, showEditAction: true },
      route
    )
  }
})

test('data-owned routes keep read and history without offering the MDX editor', () => {
  for (const route of [
    '/directory',
    '/directory/investors',
    '/en/directory/payment-gateways',
    '/sitemap',
    '/en/sitemap'
  ]) {
    const policy = pageChromePolicy(route)
    assert.equal(policy.showPageActions, true, route)
    assert.equal(policy.showEditAction, false, route)
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
      { showContentTabs: false, showPageActions: true, showEditAction: true },
      route
    )
  }
})

test('utility route names are exact rather than prefix matches', () => {
  for (const route of ['/privacy/notice-template', '/contact/customer-support', '/en/terms/term-sheets']) {
    assert.deepEqual(
      pageChromePolicy(route),
      { showContentTabs: true, showPageActions: true, showEditAction: true },
      route
    )
  }
})

test('source policy blocks stubs and thin generated shells', () => {
  assert.equal(
    sourceSupportsInlineEdit({
      slug: 'funding/example',
      source: '# Example\n\n<StubNotice path="funding/example" />',
      stub: true
    }),
    false
  )
  assert.equal(
    sourceSupportsInlineEdit({
      slug: 'tax',
      source: '# Tax\n\n> **Summary:** Start here.\n\n<SectionIndex section="tax" locale="en" />'
    }),
    false
  )
  assert.equal(
    sourceSupportsInlineEdit({
      slug: 'directory/investors',
      source: '# Investors\n\n<DirectoryList category="investors" locale="en" />'
    }),
    false
  )
})

test('source policy keeps rich hubs, all guides, and nested guides editable', () => {
  assert.equal(
    sourceSupportsInlineEdit({
      slug: 'validation',
      source: '# Validation\n\n## First step\n\nTalk to customers.\n\n<SectionIndex section="validation" locale="en" />'
    }),
    true
  )
  assert.equal(
    sourceSupportsInlineEdit({ slug: 'guides', source: '# All topics\n\n## Start here' }),
    true
  )
  assert.equal(
    sourceSupportsInlineEdit({
      slug: 'start-here/30-day-roadmap',
      source: '# Roadmap\n\n<SectionIndex section="start-here" locale="en" />'
    }),
    true
  )
})

test('Markdown headings inside code fences do not make a thin hub editable', () => {
  assert.equal(
    sourceSupportsInlineEdit({
      slug: 'tax',
      source: '# Tax\n\n```md\n## Example only\n```\n\n<SectionIndex section="tax" locale="en" />'
    }),
    false
  )
  assert.equal(
    sourceSupportsInlineEdit({
      slug: 'tax',
      source: '# Tax\n\n````md\n```\n## Still example code\n````\n\n<SectionIndex section="tax" locale="en" />'
    }),
    false
  )
})
