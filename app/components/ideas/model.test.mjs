import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const { approaches: ideas } = JSON.parse(fs.readFileSync(new URL('../../../data/ecosystem/public.json', import.meta.url), 'utf8'))
import { defaultFilters, draftLimits, draftMarkdown, emptyDraft, filterQuery, ideaPath, ideaSlug, matchingIdeas, parseDraft, parseFilters, parseSaved, readSaved, SAVED_KEY, LEGACY_SAVED_KEY, sortIdeas } from './model.ts'
import { guidePage } from '../../lib/guide-index.mjs'
import { pageChromePolicy } from '../../lib/page-chrome.ts'
import { sourceSupportsInlineEdit } from '../../lib/inline-edit-policy.mjs'

// Fixed fixtures keep filter behavior independent of editorial seed choices.
const summaries = [
  {
    "id": "courier-settlement-approach",
    "problemId": "courier-settlement",
    "sector": "commerce",
    "places": [
      "anywhere"
    ],
    "kind": "software",
    "search": "Track courier payments in one place One place to match delivered orders, returns and courier payouts, so growing online brands can see what is still owed. এক জায়গায় কুরিয়ারের পাওনা দেখুন কোন অর্ডার ডেলিভারি হলো, কোনটি ফেরত এলো আর কত টাকা পাওয়া গেল, সব মিলিয়ে অনলাইন ব্র্যান্ডের বাকি পাওনার হিসাব।"
  },
  {
    "id": "garment-offcuts-approach",
    "problemId": "garment-offcuts",
    "sector": "circular",
    "places": [
      "gazipur",
      "chattogram"
    ],
    "kind": "marketplace",
    "search": "Find the next use for garment offcuts Help factories and recyclers trade fabric offcuts with clearer information about material, quality and collection. গার্মেন্টসের ঝুট পাবে উপযুক্ত ক্রেতা কাপড়ের ধরন, মান ও সংগ্রহের শর্ত পরিষ্কার থাকলে কারখানার ঝুট কিনতে রিসাইক্লারদের সুবিধা হবে কি না, তা পরীক্ষা করুন।"
  },
  {
    "id": "shared-cold-delivery-approach",
    "problemId": "shared-cold-delivery",
    "sector": "agriculture",
    "places": [
      "bogura",
      "dhaka"
    ],
    "kind": "service",
    "search": "Share space in a refrigerated delivery Combine small food shipments on a repeat route instead of asking every supplier to fill a refrigerated vehicle. ঠান্ডা রাখার গাড়িতে জায়গা ভাগ করে নিন প্রতিজন সরবরাহকারীকে পুরো গাড়ি ভরতে না দিয়ে একই রুটের উপযুক্ত ছোট চালানগুলো একসঙ্গে পাঠানো।"
  },
  {
    "id": "bangla-order-notes-approach",
    "problemId": "bangla-order-notes",
    "sector": "commerce",
    "places": [
      "anywhere"
    ],
    "kind": "software",
    "search": "Turn a Bangla voice note into an order A human-confirmed order draft from a voice note, with missing quantities, variants and addresses made obvious. বাংলা ভয়েস নোট থেকে অর্ডারের খসড়া ভয়েস নোট শুনে অর্ডারের খসড়া হবে। পরিমাণ, ধরন বা ঠিকানা অস্পষ্ট থাকলে তা দেখাবে, মানুষ মিলিয়ে কনফার্ম করবেন।"
  },
  {
    "id": "produce-crates-approach",
    "problemId": "produce-crates",
    "sector": "agriculture",
    "places": [
      "bogura",
      "dhaka"
    ],
    "kind": "service",
    "search": "Rent produce crates that come back A reusable crate pool for a repeat produce route, with collection, cleaning and returns built into the service. ফসলের ক্রেট ভাড়া যাবে, ফেরতও আসবে নিয়মিত একটি রুটে বারবার ব্যবহার করা যায় এমন ক্রেট ভাড়া। সংগ্রহ, পরিষ্কার ও ফেরত আনা সেবার মধ্যেই থাকবে।"
  },
  {
    "id": "factory-maintenance-approach",
    "problemId": "factory-maintenance",
    "sector": "manufacturing",
    "places": [
      "gazipur",
      "chattogram"
    ],
    "kind": "service",
    "search": "Make machine repairs easier to arrange Help small factories find an appropriate technician, agree a visit and keep a useful maintenance record. কারখানার মেশিন সারানোর লোক পাওয়া সহজ হোক ছোট কারখানার জন্য উপযুক্ত টেকনিশিয়ান খোঁজা, আসার সময় ঠিক করা ও মেরামতের কাজের রেকর্ড রাখা।"
  },
  {
    "id": "courier-settlement-service",
    "problemId": "courier-settlement",
    "sector": "commerce",
    "places": [
      "anywhere"
    ],
    "kind": "service",
    "search": "Check courier payments for a business Do the work manually for one brand before building a product. ব্যবসার কুরিয়ার পেমেন্ট মিলিয়ে দিন সফটওয়্যার বানানোর আগে একটি ব্র্যান্ডের হিসাব হাতে মিলিয়ে দেখুন।"
  },
  {
    "id": "bangla-order-confirmation",
    "problemId": "bangla-order-notes",
    "sector": "commerce",
    "places": [
      "anywhere"
    ],
    "kind": "workflow",
    "search": "Confirm the order before processing it Try a short confirmation step without automated transcription. অর্ডার নেওয়ার পর ক্রেতার সঙ্গে মিলিয়ে নিন অডিও থেকে লেখা তৈরির সফটওয়্যার ছাড়াই ক্রেতার সঙ্গে অর্ডার মিলিয়ে দেখুন।"
  }
]

test('URL filters round-trip Bangla and punctuation without accepting unknown categories', () => {
  const state = { q: 'কুরিয়ার & returns', sector: 'commerce', place: 'dhaka', kind: 'service', saved: true, problem: '', sort: 'votes' }
  assert.deepEqual(parseFilters(filterQuery(state)), state)
  assert.deepEqual(parseFilters('?sector=__proto__&place=constructor&kind=__proto__&view=unknown'), defaultFilters)
  assert.equal(parseFilters(`?q=${'x'.repeat(200)}`).q.length, 120)
  assert.equal(filterQuery(defaultFilters), '')
})

test('editorial ordering stays independent of votes; optional sorts are stable and shareable', () => {
  const sample = [
    { id: 'a', addedAt: '2026-09-01', editorialPick: false },
    { id: 'b', addedAt: '2026-09-02', editorialPick: true },
    { id: 'c', addedAt: '2026-09-02', editorialPick: false }
  ]
  const ids = rows => rows.map(row => row.id)
  assert.deepEqual(ids(sortIdeas(sample, 'recommended', { a: 100 })), ['b', 'a', 'c'])
  assert.deepEqual(ids(sortIdeas(sample, 'votes', { a: 1, b: 4, c: 4 })), ['b', 'c', 'a'])
  assert.deepEqual(ids(sortIdeas(sample, 'newest')), ['b', 'c', 'a'])
  assert.deepEqual(ids(sortIdeas(sample, 'votes')), ['a', 'b', 'c'])
  assert.deepEqual(ids(sample), ['a', 'b', 'c'])
  assert.equal(parseFilters('?sort=trending').sort, 'recommended')
  assert.equal(parseFilters(filterQuery({ ...defaultFilters, sort: 'newest' })).sort, 'newest')
})

test('search, sector, pilot scope and shortlist narrow together', () => {
  assert.equal(matchingIdeas(summaries, { ...defaultFilters, sector: 'commerce', place: 'bogura', q: 'courier' }, []).length, 2, 'nationwide ideas apply to a specific pilot location')
  assert.equal(matchingIdeas(summaries, { ...defaultFilters, sector: 'circular', place: 'bogura' }, []).length, 0)
  assert.equal(matchingIdeas(summaries, { ...defaultFilters, saved: true, problem: '' }, ['courier-settlement-approach', 'removed-id']).length, 1)
  assert.equal(matchingIdeas(summaries, { ...defaultFilters, q: '  COURIER   payments ' }, []).length, 2)
  assert.equal(matchingIdeas(summaries, { ...defaultFilters, q: 'ভয়েস' }, []).length, 1)
  assert.equal(matchingIdeas(summaries, { ...defaultFilters, saved: true, problem: '' }, []).length, 0)
})

test('idea types combine with location and saved filters without making coding claims', () => {
  assert.deepEqual(matchingIdeas(summaries, { ...defaultFilters, kind: 'software' }, []).map(idea => idea.id), ['courier-settlement-approach', 'bangla-order-notes-approach'])
  assert.deepEqual(matchingIdeas(summaries, { ...defaultFilters, kind: 'marketplace' }, []).map(idea => idea.id), ['garment-offcuts-approach'])
  assert.deepEqual(matchingIdeas(summaries, { ...defaultFilters, kind: 'workflow' }, []).map(idea => idea.id), ['bangla-order-confirmation'])
  assert.deepEqual(matchingIdeas(summaries, { ...defaultFilters, kind: 'service', sector: 'commerce', saved: true }, ['courier-settlement-service', 'courier-settlement-approach']).map(idea => idea.id), ['courier-settlement-service'])
  assert.equal(parseFilters('?kind=nocode').kind, '', 'the retired no-code claim cannot silently select unrelated business types')
})

test('shortlist recovers safely from malformed or unrelated browser data', () => {
  assert.deepEqual(parseSaved('not json'), [])
  assert.deepEqual(parseSaved('{"id":"one"}'), [])
  assert.deepEqual(parseSaved('["courier-settlement",null,7,"courier-settlement","../other","<script>"]'), ['courier-settlement'])
  assert.equal(parseSaved(JSON.stringify(Array.from({ length: 400 }, (_, i) => `idea-${i}`))).length, 300)
})

test('draft recovery preserves authored text, limits size and rejects unexpected shapes', () => {
  assert.deepEqual(parseDraft('null'), emptyDraft)
  assert.deepEqual(parseDraft('{'), emptyDraft)
  const result = parseDraft(JSON.stringify({ title: 'x'.repeat(300), problem: 'A real\nproblem', customer: 123, extra: 'ignored' }))
  assert.equal(result.title.length, draftLimits.title)
  assert.equal(result.problem, 'A real\nproblem')
  assert.equal(result.customer, '')
  assert.equal(result.creditRequested, false)
  assert.equal(Object.hasOwn(result, 'extra'), false)
  assert.deepEqual(parseDraft(JSON.stringify({ creditRequested: true, creditName: '  Farhana Rahman  ' })).creditName, '  Farhana Rahman  ')
  const output = draftMarkdown({ ...emptyDraft, title: 'বাংলা', problem: 'একটি সমস্যা' }, 'bn')
  assert.match(output, /একটি সমস্যা/)
  assert.match(output, /জমা দেওয়া বা যাচাই করা হয়নি/)
  assert.doesNotMatch(output, /undefined/)
})

test('every idea has a generated bilingual route and uses the idea editor', () => {
  for (const idea of ideas) {
    for (const locale of ['bn', 'en']) {
      const route = ideaPath(locale, ideaSlug(idea.id))
      const file = `app/(contents)/${locale === 'en' ? 'en' : '(bn)'}/startup-ideas/${ideaSlug(idea.id)}/page.mdx`
      assert.ok(fs.readFileSync(file, 'utf8').includes(`id="${idea.id}"`))
      assert.deepEqual(pageChromePolicy(route), { showDiscussionAction: false, showPageActions: false, showEditAction: false })
      assert.equal(sourceSupportsInlineEdit({ slug: route.replace(/^\/en\//, '/').slice(1) }), false)
    }
  }
  assert.equal(pageChromePolicy('/en/ideas/customer-research').showEditAction, true, 'existing guide section stays editable')
})


test('idea guides are written in both languages and planned topics stay hidden', () => {
  const contentIndex = JSON.parse(fs.readFileSync(new URL('../../generated/content-index.json', import.meta.url), 'utf8'))
  const anyStub = Object.values(contentIndex.bn.sections).flatMap(section => section[4].flatMap(group => group[1])).find(page => page[2])
  assert.ok(anyStub, 'the manual still has planned topics, which this rule exists to exclude')
  assert.equal(guidePage(contentIndex, 'bn', anyStub[0].replace(/^\//, '')), null, 'a planned topic is never offered as a guide')
  assert.equal(guidePage(contentIndex, 'bn', 'not/a/real/page'), null)
  for (const idea of ideas) {
    assert.ok(idea.guides.length >= 1 && idea.guides.length <= 5, `${idea.id}: guide count`)
    for (const slug of idea.guides) for (const locale of ['bn', 'en']) {
      const guide = guidePage(contentIndex, locale, slug)
      assert.ok(guide, `${idea.id}: ${locale} guide ${slug} is missing or still a stub`)
      assert.equal(guide.route, locale === 'en' ? `/en/${slug}` : `/${slug}`)
      assert.ok(guide.title.trim(), `${idea.id}: ${locale} guide ${slug} has no title`)
    }
  }
})

test('saved problems migrate to every related idea once, retaining unknown IDs and the backup', () => {
  const backup = JSON.stringify(['courier-settlement', 'removed-id', 'courier-settlement-approach'])
  const data = new Map([[LEGACY_SAVED_KEY, backup]])
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
  const expected = ['courier-settlement-approach', 'courier-settlement-service', 'removed-id']
  assert.deepEqual(readSaved(storage, summaries), expected)
  assert.equal(data.get(LEGACY_SAVED_KEY), backup)
  // Removing items must not bring them back from the old key on the next visit.
  storage.setItem(SAVED_KEY, '[]')
  assert.deepEqual(readSaved(storage, summaries), [])
  storage.setItem(SAVED_KEY, '["produce-crates-approach"]')
  assert.deepEqual(readSaved(storage, summaries), ['produce-crates-approach'])
})

test('failed migration leaves the backup intact and does not pretend saving succeeded', () => {
  const backup = '["courier-settlement"]'
  const storage = { getItem: key => key === LEGACY_SAVED_KEY ? backup : null, setItem: () => { throw new Error('Storage unavailable') } }
  assert.throws(() => readSaved(storage, summaries), /Storage unavailable/)
  assert.equal(storage.getItem(LEGACY_SAVED_KEY), backup)
})

test('legacy problem links show the related choices without selecting a solution', () => {
  const filtered = matchingIdeas(summaries, parseFilters('?problem=courier-settlement'), [])
  assert.deepEqual(filtered.map(idea => idea.id), ['courier-settlement-approach', 'courier-settlement-service'])
  assert.equal(matchingIdeas(summaries, defaultFilters, []).length, summaries.length)
  assert.equal(parseFilters('?problem=../bad').problem, '')
})
