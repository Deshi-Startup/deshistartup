import assert from 'node:assert/strict'
import test from 'node:test'
import { load } from 'cheerio'
import { inspectRenderedContent } from './rendered-content-audit.mjs'

test('detects a hub directory separating references from their heading', () => {
  const $ = load('<article class="article"><h2>Relevant Sources</h2><section class="section-index">Directory</section><section data-footnotes>Sources</section></article>')
  assert.deepEqual(inspectRenderedContent($), ['footnotes are separated from the sources heading'])
})

test('accepts references attached to either localized heading', () => {
  for (const title of ['Relevant Sources', 'প্রাসঙ্গিক সোর্স']) {
    const $ = load(`<article class="article"><h2>${title}</h2>\n<section data-footnotes>Sources</section><section>Directory</section></article>`)
    assert.deepEqual(inspectRenderedContent($), [])
  }
})

test('checks exact Unicode fragment IDs and malformed links', () => {
  const $ = load('<article class="article"><h2 id="দেওয়া">Title</h2><a href="#দেওয়া">Wrong spelling</a><a href="#%FF">Malformed</a></article>')
  assert.deepEqual(inspectRenderedContent($), ['missing fragment target: #দেওয়া', 'malformed fragment: #%FF'])
})

test('accepts encoded targets, footnotes, and non-cited section pages', () => {
  const $ = load('<article class="article"><h2 id="টাকা">Title</h2><a href="#%E0%A6%9F%E0%A6%BE%E0%A6%95%E0%A6%BE">Jump</a><a href="#">Top</a></article>')
  assert.deepEqual(inspectRenderedContent($), [])
})

test('checks same-page absolute paths without testing another page’s fragment locally', () => {
  const $ = load('<article class="article"><a href="/trade/export-proceeds#missing">Broken</a><a href="/other#elsewhere">Other page</a></article>')
  assert.deepEqual(inspectRenderedContent($, { route: '/trade/export-proceeds' }), ['missing fragment target: #missing'])
})

test('detects empty headings across component wrappers and anchor aliases', () => {
  const $ = load('<article class="article"><h2>Stage guides</h2><span id="old-anchor"></span><section><h2>All guides</h2><p>4 guides available</p></section></article>')
  assert.deepEqual(inspectRenderedContent($), ['empty section before next heading: Stage guides'])
})

test('ignores hidden filler and catches an empty final section', () => {
  const $ = load('<article class="article"><h2>Explore</h2><p hidden>Hidden</p><hr><h2>Sources</h2><span class="sr-only">Hidden label</span></article>')
  assert.deepEqual(inspectRenderedContent($), [
    'empty section before next heading: Explore',
    'empty section at end of article: Sources'
  ])
})

test('allows genuine subheadings, prose, and media as section content', () => {
  const $ = load('<article class="article"><h2>Examples</h2><h3>First example</h3><p>Explanation</p><h2>Diagram</h2><figure><img src="diagram.svg"></figure><h2>Next section</h2><p>Details</p></article>')
  assert.deepEqual(inspectRenderedContent($), [])
})
