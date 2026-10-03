import assert from 'node:assert/strict'
import test from 'node:test'
import { load } from 'cheerio'
import { visibleLinkedCollectionItems } from './visible-collection-items.mjs'

const item = (position, name, path) => ({ '@type': 'ListItem', position, name, url: `https://deshistartup.com${path}` })

test('sitemap schema includes the displayed utility links and only the displayed pages', () => {
  const $ = load(`<nav><a href="/en">Home</a></nav><div class="sitemap-list">
    <h2><a href="/en/startup-ideas">Startup ideas</a></h2>
    <ul><li><a href="/en/startup-ideas/add">Suggest an idea</a></li>
    <li><a href="/en/startup-ideas/review">Review submissions</a></li></ul></div>`)
  assert.deepEqual(visibleLinkedCollectionItems($, { slug: 'sitemap' }), [
    item(1, 'Startup ideas', '/en/startup-ideas'),
    item(2, 'Suggest an idea', '/en/startup-ideas/add'),
    item(3, 'Review submissions', '/en/startup-ideas/review')
  ])
})

test('company schema follows the rendered company names and order, not wrapper SEO titles', () => {
  const $ = load(`<div class="companies-gallery">
    <article class="companies-card"><h2><a href="/en/companies/zeta?return=q#overview">Zeta &amp; Co</a></h2><a href="/en/companies/zeta">Explore Zeta</a></article>
    <article class="companies-card"><h2><a href="/en/companies/alpha">Alpha</a></h2></article></div>`)
  assert.deepEqual(visibleLinkedCollectionItems($, { slug: 'companies' }), [
    item(1, 'Zeta & Co', '/en/companies/zeta'), item(2, 'Alpha', '/en/companies/alpha')
  ])
})

test('uses the displayed localized names without inventing untranslated labels', () => {
  const name = 'পাঠাও'
  const $ = load(`<div class="companies-gallery"><article class="companies-card"><h2><a href="/companies/pathao">${name}</a></h2></article></div>`)
  assert.deepEqual(visibleLinkedCollectionItems($, { slug: 'companies' }), [item(1, name, '/companies/pathao')])
})

test('omits empty, hidden, external and duplicate links without gaps in positions', () => {
  const $ = load(`<div class="sitemap-list"><a href="/empty"> </a><span hidden><a href="/hidden">Hidden</a></span>
    <a aria-hidden="true" href="/hidden-label">Hidden label</a><span class="sr-only"><a href="/screenreader">Extra label</a></span>
    <a href="https://example.com">Other site</a><a href="/about">About</a><a href="/about#team">Team shortcut</a><a href="/contact">Contact</a></div>`)
  assert.deepEqual(visibleLinkedCollectionItems($, { slug: 'sitemap' }), [item(1, 'About', '/about'), item(2, 'Contact', '/contact')])
})

test('uses canonical clean URLs when a fork serves the rendered links under a base path', () => {
  const $ = load('<div class="sitemap-list"><a href="/preview/en/about.html">About</a><a href="/preview/">Home</a></div>')
  assert.deepEqual(visibleLinkedCollectionItems($, { slug: 'sitemap' }, { basePath: '/preview' }), [item(1, 'About', '/en/about'), item(2, 'Home', '/')])
})

test('empty and unrelated collections do not invent manifest entries', () => {
  assert.deepEqual(visibleLinkedCollectionItems(load('<div class="companies-gallery"></div>'), { slug: 'companies' }), [])
  assert.deepEqual(visibleLinkedCollectionItems(load('<div class="sitemap-list"><a href="/about">About</a></div>'), { slug: 'other' }), [])
})

test('omits hidden label text, empty or malformed hrefs and local jump links', () => {
  const $ = load(`<div class="sitemap-list"><a href="">Missing destination</a><a href="#top">Back to top</a>
    <a href="http://[invalid">Bad address</a><a href="javascript:alert(1)">Script</a>
    <a href="/en/about">About <span hidden>not displayed</span><span aria-hidden="true">→</span>
 us</a></div>`)
  assert.deepEqual(visibleLinkedCollectionItems($, { slug: 'sitemap', route: '/en/sitemap' }), [item(1, 'About us', '/en/about')])
})
