import assert from 'node:assert/strict'
import test from 'node:test'

import { pageCreditsHtml, scopeRepeatsRoles } from './page-credits.mjs'

const PROFILES = new Map([
  ['niloy', { id: 'niloy', slug: 'niloy-biswas', displayName: 'Niloy Biswas' }],
  ['uttam', { id: 'uttam', slug: 'uttam-deb', displayName: 'Uttam Deb' }],
  ['muhaiminul', { id: 'muhaiminul', slug: 'muhaiminul-islam-khan', displayName: 'Muhaiminul Islam Khan' }]
])

const ORGANIZATIONS = new Map([
  ['lightcastle', { id: 'lightcastle', name: 'LightCastle Partners', url: 'https://lightcastlepartners.com/' }]
])

const href = (route) => route

function event({ id = 'e1', acceptedAt = '2026-08-01', summary, credits, evidenceUrl = 'https://github.com/x/pull/1' }) {
  return { id, acceptedAt, evidenceUrl, summary, credits }
}

function credit(profileId, roles = ['author'], extra = {}) {
  return { profileId, roles, ...extra }
}

const SUMMARY = { bn: 'গাইডটি লেখা', en: 'Authored the guide' }

function credits(events, locale = 'bn') {
  return pageCreditsHtml({
    events,
    locale,
    profileById: PROFILES,
    organizationById: ORGANIZATIONS,
    href
  })
}

function count(html, pattern) {
  return (html.match(pattern) || []).length
}

test('a page with no accepted events renders nothing at all', () => {
  assert.equal(credits([]), '')
})

test('the visible heading can name the credits region', () => {
  const html = credits([event({ summary: SUMMARY, credits: [credit('niloy')] })])
  assert.match(html, /<h2 id="credits-heading">এই পেজে কারা কাজ করেছেন<\/h2>/)
  assert.match(credits([event({ summary: SUMMARY, credits: [credit('niloy')] })], 'en'),
    /<h2 id="credits-heading">Who worked on this page<\/h2>/)
})

test('a contribution is one entry however many people were credited on it', () => {
  const html = credits([
    event({ summary: SUMMARY, credits: [credit('niloy'), credit('uttam'), credit('muhaiminul')] })
  ])
  assert.equal(count(html, /class="page-credit"/g), 1, 'one accepted change, one entry')
  assert.equal(count(html, /class="page-credit__credit"/g), 3, 'each person is named')
  assert.equal(count(html, /class="page-credit__scope"/g), 1, 'the summary is stated once')
  assert.equal(count(html, /page-credit__meta/g), 1, 'the date and evidence are stated once')
  assert.equal(count(html, /https:\/\/github\.com\/x\/pull\/1/g), 1)
})

test('separate contributions stay separate entries, each with its own date and evidence', () => {
  const html = credits([
    event({ id: 'write', acceptedAt: '2026-06-01', summary: SUMMARY, credits: [credit('niloy')] }),
    event({
      id: 'edit',
      acceptedAt: '2026-07-01',
      evidenceUrl: 'https://github.com/x/pull/2',
      summary: { bn: 'ভাষা ও গঠন সম্পাদনা', en: 'Edited language and structure' },
      credits: [credit('muhaiminul', ['editor'])]
    })
  ])
  assert.equal(count(html, /class="page-credit"/g), 2)
  assert.match(html, /data-contribution-event="write"/)
  assert.match(html, /data-contribution-event="edit"/)
  assert.equal(count(html, /class="page-credit__meta"/g), 2)
})

test('every credit keeps its index, so the audit can find the row it expects', () => {
  const html = credits([event({ summary: SUMMARY, credits: [credit('niloy'), credit('uttam')] })])
  assert.match(html, /data-credit-index="0"/)
  assert.match(html, /data-credit-index="1"/)
})

test('the person leads the line and the roles follow, so names start at one edge', () => {
  const html = credits([event({ summary: SUMMARY, credits: [credit('niloy', ['author', 'researcher'])] })])
  assert.match(
    html,
    /<p class="page-credit__line"><strong class="page-credit__person"><a href="\/contributors\/niloy-biswas">Niloy Biswas<\/a><\/strong><span class="page-credit__roles"><span>লেখক<\/span><span>গবেষণা<\/span><\/span><\/p>/
  )
})

test('an anonymous credit is a sentence about a person, not set as their name', () => {
  const html = credits([event({ summary: SUMMARY, credits: [credit(null)] })])
  assert.match(html, /<span class="page-credit__anon">নাম প্রকাশ করেননি<\/span>/)
  assert.equal(html.includes('page-credit__person'), false)
  assert.equal(html.includes('/contributors/'), false)
  assert.match(credits([event({ summary: SUMMARY, credits: [credit(null)] })], 'en'), /Chose not to be named/)
})

test('an anonymous credit beside a named one hides only the anonymous person', () => {
  const html = credits([event({ summary: SUMMARY, credits: [credit('niloy'), credit(null)] })])
  assert.match(html, /Niloy Biswas/)
  assert.match(html, /page-credit__anon/)
  assert.equal(count(html, /class="page-credit__credit"/g), 2)
})

test('a summary that only repeats the role labels is dropped instead of said twice', () => {
  const html = credits([
    event({ summary: { bn: 'সম্পাদনা', en: 'Editing' }, credits: [credit('muhaiminul', ['editor'])] })
  ])
  assert.equal(html.includes('page-credit__scope'), false)
  assert.match(html, /<span>সম্পাদনা<\/span>/, 'the role label still says what was done')
})

test('the conjunction between two role labels does not save a redundant summary', () => {
  const editReview = [credit('muhaiminul', ['editor']), credit('uttam', ['reviewer'])]
  assert.equal(
    scopeRepeatsRoles(event({ summary: { bn: 'সম্পাদনা ও রিভিউ', en: 'Editing and review' }, credits: editReview }), 'bn'),
    true
  )
  assert.equal(
    scopeRepeatsRoles(event({ summary: { bn: 'সম্পাদনা ও রিভিউ', en: 'Editing and review' }, credits: editReview }), 'en'),
    true
  )
})

test('a summary that says something the labels do not is kept', () => {
  const html = credits([
    event({
      summary: { bn: 'ভ্যাট থ্রেশহোল্ডের অংশ নতুন আইনের সঙ্গে মিলিয়ে দেখা', en: 'Checked the VAT threshold section against the new law' },
      credits: [credit('muhaiminul', ['editor'])]
    })
  ])
  assert.match(html, /class="page-credit__scope"/)
  assert.equal(
    scopeRepeatsRoles(
      event({ summary: { bn: 'মান ঠিক করা', en: 'Standard and practice' }, credits: [credit('niloy', ['author'])] }),
      'en'
    ),
    false,
    '"Standard" keeps its letters when the conjunction is dropped'
  )
})

test('an affiliation and a review scope stay attached to the person who carried them', () => {
  const html = credits([
    event({
      summary: { bn: 'আইনি অংশ রিভিউ', en: 'Reviewed the legal section' },
      credits: [
        credit('niloy'),
        credit('muhaiminul', ['reviewer'], {
          organizationId: 'lightcastle',
          review: { scope: { bn: 'ভ্যাট থ্রেশহোল্ডের অংশ', en: 'the VAT threshold section' }, reviewedAt: '2026-07-28' }
        })
      ]
    })
  ])
  const second = html.slice(html.indexOf('data-credit-index="1"'))
  assert.match(second, /LightCastle Partners/)
  assert.match(second, /the VAT threshold section|ভ্যাট থ্রেশহোল্ডের অংশ/)
  const first = html.slice(html.indexOf('data-credit-index="0"'), html.indexOf('data-credit-index="1"'))
  assert.equal(first.includes('LightCastle'), false)
})

test('dates are written in the reader’s edition', () => {
  const events = [event({ acceptedAt: '2026-07-09', summary: SUMMARY, credits: [credit('niloy')] })]
  assert.match(credits(events), /<time datetime="2026-07-09">৯ জুলাই, ২০২৬<\/time>/)
  assert.match(credits(events, 'en'), /<time datetime="2026-07-09">July 9, 2026<\/time>/)
})

test('the base path reaches contributor profiles', () => {
  const html = pageCreditsHtml({
    events: [event({ summary: SUMMARY, credits: [credit('niloy')] })],
    locale: 'en',
    profileById: PROFILES,
    organizationById: ORGANIZATIONS,
    href: (route) => `/base${route}`
  })
  assert.match(html, /href="\/base\/en\/contributors\/niloy-biswas"/)
})

test('display names and summaries are escaped, so neither can inject markup', () => {
  const profiles = new Map([['x', { id: 'x', slug: 'x', displayName: 'A <script>alert(1)</script> B' }]])
  const html = pageCreditsHtml({
    events: [event({ summary: { bn: '<img onerror=x>', en: '<img onerror=x>' }, credits: [credit('x')] })],
    locale: 'bn',
    profileById: profiles,
    organizationById: ORGANIZATIONS,
    href
  })
  assert.equal(html.includes('<script>'), false)
  assert.equal(html.includes('<img'), false)
  assert.match(html, /&lt;script&gt;/)
})
