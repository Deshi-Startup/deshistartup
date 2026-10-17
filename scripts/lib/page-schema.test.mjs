import assert from 'node:assert/strict'
import test from 'node:test'
import { load } from 'cheerio'
import { isArticleSchemaPage, schemaLinkUrl, schemaPageType, visibleCollectionItemsFor, visibleDefinedTermsFor } from './page-schema.mjs'

test('lookup, directory and utility pages do not impersonate authored guides', () => {
  for (const slug of ['start-here/glossary', 'privacy', 'terms', 'roadmap', 'guides']) {
    const page = { slug, guide: false }
    assert.equal(isArticleSchemaPage(page, schemaPageType(page)), false)
  }
  assert.equal(schemaPageType({ slug: 'start-here/glossary' }), 'CollectionPage')
  assert.equal(schemaPageType({ slug: 'guides' }), 'CollectionPage')
  assert.equal(schemaPageType({ slug: 'directory/investors' }), 'CollectionPage')
  const guide = { slug: 'funding/cap-table', guide: true }
  assert.equal(isArticleSchemaPage(guide, schemaPageType(guide)), true)
  assert.equal(isArticleSchemaPage({ slug: 'startup-50', guide: true }, 'CollectionPage'), false)
})

test('independent company entries are about pages while contributor profiles retain ProfilePage', () => {
  for (const locale of ['en', 'bn']) {
    const company = { slug: 'companies/pathao', locale, guide: false }
    assert.equal(schemaPageType(company), 'AboutPage')
    assert.equal(isArticleSchemaPage(company, schemaPageType(company)), false)
    assert.equal(schemaPageType({ slug: 'contributors/author', locale, kind: 'contributor-profile' }), 'ProfilePage')
  }
})

test('hub lists follow visible localized order and omit planned, hidden, absent and other-locale pages', () => {
  const pages = ['z', 'a', 'planned', 'hidden', 'unlisted'].map((slug) => ({ slug: `funding/${slug}`, route: `/funding/${slug}`, locale: 'bn', stub: slug === 'planned' }))
  pages.push({ slug: 'funding/en', route: '/en/funding/en', locale: 'en' })
  const map = new Map(pages.map((page) => [page.route, page]))
  const $ = load(`<section class="section-index"><a href="/funding/z">পিচ ডেক</a>
    <span hidden><a href="/funding/hidden">Hidden</a></span><a href="/funding/planned">Planned</a>
    <a href="/en/funding/en">Other locale</a><a href="/funding/absent">Absent</a>
    <a href="https://deshistartup.com.example.org/funding/a">Other origin</a>
    <a href="/funding/a">ক্যাপ টেবিল<span aria-hidden="true">→</span></a><a href="/funding/z#again">Duplicate</a></section>`)
  const items = visibleCollectionItemsFor($, { slug: 'funding', route: '/funding', locale: 'bn' }, map)
  assert.deepEqual(items.map(({ position, name, url }) => ({ position, name, url })), [
    { position: 1, name: 'পিচ ডেক', url: 'https://deshistartup.com/funding/z' },
    { position: 2, name: 'ক্যাপ টেবিল', url: 'https://deshistartup.com/funding/a' }
  ])
})

test('Startup 50 describes the displayed organizations, descriptions and destinations', () => {
  const $ = load(`<article class="startup50-entry"><div class="startup50-entry__identity"><h2><a href="/preview/en/companies/z.html">Zeta</a></h2></div><p class="startup50-entry__description">Visible company description.</p></article>
    <article class="startup50-entry"><div class="startup50-entry__identity"><h2><a href="https://example.com">Alpha</a></h2></div><p class="startup50-entry__description">Another company.</p></article>`)
  const items = visibleCollectionItemsFor($, { slug: 'startup-50', locale: 'en' }, new Map(), '/preview')
  assert.deepEqual(items.map((x) => x.item), [
    { '@type': 'Organization', name: 'Zeta', url: 'https://deshistartup.com/en/companies/z', description: 'Visible company description.' },
    { '@type': 'Organization', name: 'Alpha', url: 'https://example.com/', description: 'Another company.' }
  ])
  assert.deepEqual(items.map((x) => x.position), [1, 2])
})

test('glossary schema reuses visible definitions and existing fragments in each language', () => {
  for (const [locale, route, definition] of [['en', '/en/start-here/glossary', 'Cash received each month.'], ['bn', '/start-here/glossary', 'প্রতি মাসে যে টাকা আসে।']]) {
    const $ = load(`<div class="glossary-entry" id="mrr"><span class="glossary-entry__head">MRR</span><span class="glossary-entry__expansion">Monthly recurring revenue</span><p class="glossary-entry__def">${definition}</p></div>
      <div class="glossary-xref" id="monthly"><span class="glossary-entry__head">Monthly</span></div>`)
    const terms = visibleDefinedTermsFor($, { slug: 'start-here/glossary', route, locale })
    assert.equal(terms.length, 1)
    assert.equal(terms[0].description, definition)
    assert.equal(terms[0]['@id'], `https://deshistartup.com${route}#mrr`)
    assert.equal(terms[0].inDefinedTermSet['@id'], `https://deshistartup.com${route}#glossary`)
    assert.deepEqual(terms[0].alternateName, ['Monthly recurring revenue'])
  }
})

test('existing sitemap utility entries and empty rendered collections stay honest', () => {
  const $ = load('<div class="sitemap-list"><a href="/en/startup-ideas/review">Review submissions</a></div>')
  assert.equal(visibleCollectionItemsFor($, { slug: 'sitemap' }, new Map())[0].url, 'https://deshistartup.com/en/startup-ideas/review')
  assert.deepEqual(visibleCollectionItemsFor(load(''), { slug: 'funding' }, new Map()), [])
})

test('canonicalizes preview links and rejects executable or malformed URLs', () => {
  assert.equal(schemaLinkUrl('/preview/en/funding.html?q=x#one', '/preview'), 'https://deshistartup.com/en/funding')
  assert.equal(schemaLinkUrl('javascript:alert(1)'), null)
  assert.equal(schemaLinkUrl('data:text/html,x'), null)
  assert.equal(schemaLinkUrl('http://[bad'), null)
  assert.equal(schemaLinkUrl('  #heading  '), null)
})

test('topic index lists its visible topics, without treating prose or jump links as entries', () => {
  const map = new Map([
    ['/en', { route: '/en', slug: '', locale: 'en' }],
    ['/en/funding', { route: '/en/funding', slug: 'funding', locale: 'en' }],
    ['/en/about', { route: '/en/about', slug: 'about', locale: 'en' }]
  ])
  const $ = load('<div class="article"><p><a href="/en/about">About</a></p><ul><li><a href="#part">Jump</a></li><li><a href="/en/funding">Funding</a></li></ul></div>')
  assert.deepEqual(visibleCollectionItemsFor($, { slug: 'guides', route: '/en/guides', locale: 'en' }, map), [
    { '@type': 'ListItem', position: 1, name: 'Funding', url: 'https://deshistartup.com/en/funding' }
  ])
})
