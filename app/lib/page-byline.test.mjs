import assert from 'node:assert/strict'
import test from 'node:test'

import { pageBylineHtml } from './page-byline.mjs'

const PROFILES = new Map([
  ['niloy', { id: 'niloy', slug: 'niloy-biswas', displayName: 'Niloy Biswas' }],
  ['uttam', { id: 'uttam', slug: 'uttam-deb', displayName: 'Uttam Deb' }],
  ['muhaiminul', { id: 'muhaiminul', slug: 'muhaiminul-islam-khan', displayName: 'Muhaiminul Islam Khan' }],
  ['shoumik', { id: 'shoumik', slug: 'shoumik-shahriar', displayName: 'Shoumik Shahriar' }]
])

const href = (route) => route

function event({ id = 'e1', acceptedAt = '2026-08-01', attribution = null, credits }) {
  return { id, acceptedAt, attribution, credits }
}

function credit(profileId, roles = ['author']) {
  return { profileId, roles }
}

function byline(events, locale = 'bn') {
  return pageBylineHtml({ events, locale, profileById: PROFILES, href })
}

/* The line the reader sees. Which words are wrapped in a no-break span is a
   typographic decision tested on its own below; the phrasing tests read the
   sentence, so a change to the break scaffolding cannot silently rewrite what
   the byline claims about a person. */
function text(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function links(html) {
  return [...html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map(
    ([, target, label]) => ({ href: target, label: text(label) })
  )
}

/* The units that must survive a wrap intact. A no-break span can hold another
   span — the counted tail carries the arrow — so this matches the closing tag
   by depth rather than by the first one it meets. */
function unbroken(html) {
  const open = '<span class="byline-nb">'
  const units = []
  for (let start = html.indexOf(open); start !== -1; start = html.indexOf(open, start + 1)) {
    let depth = 1
    let cursor = start + open.length
    const tag = /<(\/?)span\b[^>]*>/g
    tag.lastIndex = cursor
    for (let match = tag.exec(html); match && depth > 0; match = tag.exec(html)) {
      depth += match[1] ? -1 : 1
      cursor = match.index
    }
    units.push(text(html.slice(start + open.length, cursor)))
  }
  return units
}

test('a page with no accepted events names the team and points at the policy', () => {
  assert.equal(text(byline([])), 'লিখেছেন দেশি স্টার্টআপ টিম')
  assert.deepEqual(links(byline([])), [{ href: '/about', label: 'দেশি স্টার্টআপ টিম' }])
  assert.equal(text(byline([], 'en')), 'Written by the Deshi Startup team')
  assert.deepEqual(links(byline([], 'en')), [
    { href: '/en/about', label: 'the Deshi Startup team' }
  ])
})

test('the English fallback links to the English about page', () => {
  const html = pageBylineHtml({ events: [], locale: 'en', profileById: PROFILES, href: (r) => `/base${r}` })
  assert.match(html, /href="\/base\/en\/about"/)
})

test('one author is named outright', () => {
  const html = byline([event({ credits: [credit('niloy')] })])
  assert.equal(text(html), 'লিখেছেন Niloy Biswas')
  assert.deepEqual(links(html), [{ href: '/contributors/niloy-biswas', label: 'Niloy Biswas' }])
})

test('two authors both fit, joined by ও in Bangla and and in English', () => {
  const events = [event({ credits: [credit('niloy'), credit('uttam')] })]
  assert.equal(text(byline(events)), 'লিখেছেন Niloy Biswas ও Uttam Deb')
  assert.equal(text(byline(events, 'en')), 'Written by Niloy Biswas and Uttam Deb')
})

test('past two, the lead holds the line and the rest becomes a counted link', () => {
  const events = [event({ credits: [credit('niloy'), credit('uttam'), credit('muhaiminul')] })]
  // one event, one date: the order the ledger credits them in is the order shown
  const html = byline(events)
  assert.match(text(html), /^লিখেছেন Niloy Biswas/)
  assert.match(html, /href="#credits">আরও ২ জন/)
  assert.equal(html.includes('Uttam Deb'), false, 'only the lead is named')
  assert.match(byline(events, 'en'), /href="#credits">2 others/)
})

test('the count uses Bengali numerals in Bangla and singular English past one', () => {
  const events = [event({ credits: [credit('niloy'), credit('uttam'), credit('muhaiminul'), credit('shoumik')] })]
  assert.match(text(byline(events)), /আরও ৩ জন/)
  const two = [event({ credits: [credit('niloy'), credit('uttam'), credit('muhaiminul')] })]
  assert.match(text(byline(two, 'en')), /2 others/)
  const three = [event({ credits: [credit('niloy'), credit('uttam')] }), event({ id: 'e2', credits: [credit('muhaiminul')] })]
  assert.match(text(byline(three, 'en')), /2 others/)
})

test('the classifier keeps the corpus spacing: ২ জন, never ২জন', () => {
  const events = [event({ credits: [credit('niloy'), credit('uttam'), credit('muhaiminul')] })]
  assert.match(text(byline(events)), /আরও ২ জন/)
  assert.equal(/২জন/.test(byline(events)), false)
})

test('the verb comes from the strongest role present, so an editor never claims authorship', () => {
  assert.match(text(byline([event({ credits: [credit('muhaiminul', ['editor'])] })])), /^সম্পাদনা করেছেন/)
  assert.match(text(byline([event({ credits: [credit('uttam', ['translator'])] })])), /^অনুবাদ করেছেন/)
  assert.match(text(byline([event({ credits: [credit('uttam', ['reviewer'])] })])), /^রিভিউ করেছেন/)
  assert.match(text(byline([event({ credits: [credit('uttam', ['researcher'])] })])), /^গবেষণা করেছেন/)
  assert.match(text(byline([event({ credits: [credit('uttam', ['reviewer'])] })], 'en')), /^Reviewed by/)
})

test('an author outranks an editor even when the editor came first', () => {
  const events = [
    event({ id: 'edit', acceptedAt: '2026-07-01', credits: [credit('muhaiminul', ['editor'])] }),
    event({ id: 'write', acceptedAt: '2026-08-01', credits: [credit('niloy', ['author'])] })
  ]
  assert.equal(
    text(byline(events)),
    'লিখেছেন Niloy Biswas · সম্পাদনা করেছেন Muhaiminul Islam Khan'
  )
  assert.deepEqual(links(byline(events)).map((link) => link.href), [
    '/contributors/niloy-biswas',
    '/contributors/muhaiminul-islam-khan'
  ])
  assert.equal(
    text(byline(events, 'en')),
    'Written by Niloy Biswas · Edited by Muhaiminul Islam Khan'
  )
})

test('among equals, the earliest acceptance leads', () => {
  const events = [
    event({ id: 'late', acceptedAt: '2026-08-10', credits: [credit('uttam')] }),
    event({ id: 'early', acceptedAt: '2026-06-01', credits: [credit('niloy')] })
  ]
  assert.match(text(byline(events)), /^লিখেছেন Niloy Biswas ও /)
})

test('among authors, earlier authorship leads even when the other person edited first', () => {
  const events = [
    event({ id: 'early-edit', acceptedAt: '2026-01-01', credits: [credit('uttam', ['editor'])] }),
    event({ id: 'first-author', acceptedAt: '2026-06-01', credits: [credit('niloy', ['author'])] }),
    event({ id: 'later-author', acceptedAt: '2026-12-01', credits: [credit('uttam', ['author'])] })
  ]

  assert.equal(text(byline(events, 'en')), 'Written by Niloy Biswas and Uttam Deb')
})

test('same-date authors keep authored credit order despite an earlier role for one person', () => {
  const events = [
    event({ id: 'early-edit', acceptedAt: '2026-01-01', credits: [credit('uttam', ['editor'])] }),
    event({
      id: 'joint-authorship',
      acceptedAt: '2026-06-01',
      credits: [credit('niloy', ['author']), credit('uttam', ['author'])]
    })
  ]

  assert.equal(text(byline(events, 'en')), 'Written by Niloy Biswas and Uttam Deb')
})

test('an adaptation is stated as one, in both editions', () => {
  const events = [event({ attribution: 'adaptation', credits: [credit('shoumik')] })]
  assert.equal(text(byline(events)), 'Shoumik Shahriar-এর লেখা অবলম্বনে')
  assert.equal(text(byline(events, 'en')), 'Adapted from Shoumik Shahriar')
})

test('two authors on the same adaptation are both named as adaptation authors', () => {
  const events = [event({
    attribution: 'adaptation',
    credits: [credit('shoumik'), credit('niloy')]
  })]

  assert.equal(text(byline(events)), 'Shoumik Shahriar ও Niloy Biswas-এর লেখা অবলম্বনে')
  assert.equal(text(byline(events, 'en')), 'Adapted from Shoumik Shahriar and Niloy Biswas')
})

test('an adaptation author takes precedence over an earlier ordinary author', () => {
  const events = [
    event({ id: 'original', acceptedAt: '2026-07-01', credits: [credit('niloy')] }),
    event({
      id: 'adaptation',
      acceptedAt: '2026-08-01',
      attribution: 'adaptation',
      credits: [credit('shoumik')]
    })
  ]

  assert.equal(
    text(byline(events, 'en')),
    'Adapted from Shoumik Shahriar · Written by Niloy Biswas'
  )
})

test('the adaptation survives later contributors instead of being replaced by them', () => {
  const events = [
    event({ id: 'adapt', acceptedAt: '2026-08-10', attribution: 'adaptation', credits: [credit('shoumik')] }),
    event({ id: 'edit', acceptedAt: '2026-09-01', credits: [credit('muhaiminul', ['editor'])] })
  ]
  assert.equal(
    text(byline(events)),
    'Shoumik Shahriar-এর লেখা অবলম্বনে · সম্পাদনা করেছেন Muhaiminul Islam Khan'
  )
  assert.equal(
    text(byline(events, 'en')),
    'Adapted from Shoumik Shahriar · Edited by Muhaiminul Islam Khan'
  )
})

test('an adaptation credited for editing only is not called an adaptation', () => {
  const events = [event({ attribution: 'adaptation', credits: [credit('shoumik', ['editor'])] })]
  assert.match(text(byline(events)), /^সম্পাদনা করেছেন/)
})

test('editing an adaptation does not turn the same person later original authorship into an adaptation', () => {
  const events = [
    event({
      id: 'adapt-edit',
      acceptedAt: '2026-08-01',
      attribution: 'adaptation',
      credits: [credit('shoumik', ['editor'])]
    }),
    event({
      id: 'original-author',
      acceptedAt: '2026-09-01',
      credits: [credit('shoumik', ['author'])]
    })
  ]

  assert.equal(text(byline(events, 'en')), 'Written by Shoumik Shahriar')
})

test('a person named by several events is counted once', () => {
  const events = [
    event({ id: 'a', acceptedAt: '2026-06-01', credits: [credit('niloy')] }),
    event({ id: 'b', acceptedAt: '2026-07-01', credits: [credit('niloy', ['editor'])] })
  ]
  assert.equal(text(byline(events)), 'লিখেছেন Niloy Biswas')
})

test('anonymous credits are counted but never named', () => {
  const events = [event({ credits: [credit(null), credit(null)] })]
  const html = byline(events)
  assert.match(text(html), /^লিখেছেন ২ জন/)
  assert.equal(html.includes('/contributors/'), false)
  assert.match(text(byline(events, 'en')), /2 contributors/)
})

test('an anonymous credit beside a named one raises the count without naming it', () => {
  const events = [event({ credits: [credit('niloy'), credit(null)] })]
  const html = byline(events)
  assert.match(text(html), /^লিখেছেন Niloy Biswas/)
  assert.match(text(html), /আরও ১ জন/)
})

test('a credit whose profile is not public is ignored rather than half-rendered', () => {
  const events = [event({ credits: [credit('withdrawn')] })]
  assert.equal(text(byline(events)), 'লিখেছেন দেশি স্টার্টআপ টিম')
})

test('display names are escaped, so a name can never inject markup', () => {
  const profiles = new Map([['x', { id: 'x', slug: 'x', displayName: 'A <script>alert(1)</script> B' }]])
  const html = pageBylineHtml({
    events: [event({ credits: [credit('x')] })],
    locale: 'bn',
    profileById: profiles,
    href
  })
  assert.equal(html.includes('<script>'), false)
  assert.match(html, /&lt;script&gt;/)
})

test('the arrow is hidden from assistive tech, and the record link is always #credits', () => {
  const events = [event({ credits: [credit('niloy'), credit('uttam'), credit('muhaiminul')] })]
  const html = byline(events)
  assert.match(html, /<span aria-hidden="true"> ↓<\/span>/)
  assert.equal((html.match(/href="#credits"/g) || []).length, 1)
  assert.equal(html.match(/<a\b[^>]*href="#credits"[^>]*>/)?.[0], '<a href="#credits">')
})

test('a wrap can fall between the verb and the name, never inside either', () => {
  const events = [
    event({ id: 'write', acceptedAt: '2026-07-01', credits: [credit('niloy')] }),
    event({ id: 'edit', acceptedAt: '2026-08-01', credits: [credit('muhaiminul', ['editor'])] })
  ]
  assert.deepEqual(unbroken(byline(events)), [
    'লিখেছেন',
    'Niloy Biswas',
    'সম্পাদনা করেছেন',
    'Muhaiminul Islam Khan'
  ])
  assert.deepEqual(unbroken(byline(events, 'en')), [
    'Written by',
    'Niloy Biswas',
    'Edited by',
    'Muhaiminul Islam Khan'
  ])
})

test('the Bangla possessive stays with the name it belongs to', () => {
  const events = [event({ attribution: 'adaptation', credits: [credit('shoumik')] })]
  assert.deepEqual(unbroken(byline(events)), ['Shoumik Shahriar-এর'])
})

test('the counted tail keeps its number, unit and arrow together', () => {
  const events = [event({ credits: [credit('niloy'), credit('uttam'), credit('muhaiminul')] })]
  assert.deepEqual(unbroken(byline(events)), ['লিখেছেন', 'Niloy Biswas', 'আরও ২ জন ↓'])
})

test('a name too long for any phone line stays breakable rather than running off the page', () => {
  const long = 'Mohammad Abdur Rahman Chowdhury Talukder'
  const profiles = new Map([['long', { id: 'long', slug: 'long', displayName: long }]])
  const html = pageBylineHtml({
    events: [event({ credits: [credit('long')] })],
    locale: 'en',
    profileById: profiles,
    href
  })
  assert.equal(text(html), `Written by ${long}`)
  assert.deepEqual(unbroken(html), ['Written by'])
})

test('the separator cannot be stranded at the start of a line', () => {
  const events = [
    event({ id: 'write', acceptedAt: '2026-07-01', credits: [credit('niloy')] }),
    event({ id: 'edit', acceptedAt: '2026-08-01', credits: [credit('muhaiminul', ['editor'])] })
  ]
  assert.match(byline(events), /<span class="byline-sep" aria-hidden="true"> ·<\/span> /)
})
