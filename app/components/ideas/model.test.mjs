import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const { problems, approaches: ideas } = JSON.parse(fs.readFileSync(new URL('../../../data/ecosystem/public.json', import.meta.url), 'utf8'))
import { defaultFilters, draftLimits, draftMarkdown, emptyDraft, filterQuery, ideaPath, ideaSlug, matchingIdeas, parseDraft, parseFilters, parseSaved, readSaved, SAVED_KEY, LEGACY_SAVED_KEY, places, sectors } from './model.ts'
import { pageChromePolicy } from '../../lib/page-chrome.ts'
import { sourceSupportsInlineEdit } from '../../lib/inline-edit-policy.mjs'

const summaries = ideas.map(idea => ({ ...problems.find(p => p.id === idea.problemId), ...idea, title: idea.en.title, summary: idea.en.summary, search: `${idea.en.title} ${idea.en.summary} ${idea.bn.title} ${idea.bn.summary}` }))

test('URL filters round-trip Bangla and punctuation without accepting unknown categories', () => {
  const state = { q: 'কুরিয়ার & returns', sector: 'commerce', place: 'dhaka', saved: true, problem: '' }
  assert.deepEqual(parseFilters(filterQuery(state)), state)
  assert.deepEqual(parseFilters('?sector=__proto__&place=constructor&view=unknown'), defaultFilters)
  assert.equal(parseFilters(`?q=${'x'.repeat(200)}`).q.length, 120)
  assert.equal(filterQuery(defaultFilters), '')
})

test('search, sector, pilot scope and shortlist narrow together', () => {
  assert.equal(matchingIdeas(summaries, { ...defaultFilters, sector: 'commerce', place: 'bogura', q: 'courier' }, []).length, 2, 'nationwide ideas apply to a specific pilot location')
  assert.equal(matchingIdeas(summaries, { ...defaultFilters, sector: 'circular', place: 'bogura' }, []).length, 0)
  assert.equal(matchingIdeas(summaries, { ...defaultFilters, saved: true, problem: '' }, ['courier-settlement-approach', 'removed-id']).length, 1)
  assert.equal(matchingIdeas(summaries, { ...defaultFilters, q: '  COURIER   payments ' }, []).length, 2)
  assert.equal(matchingIdeas(summaries, { ...defaultFilters, q: 'ভয়েস' }, []).length, 1)
  assert.equal(matchingIdeas(summaries, { ...defaultFilters, saved: true, problem: '' }, []).length, 0)
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
  assert.equal(Object.hasOwn(result, 'extra'), false)
  const output = draftMarkdown({ ...emptyDraft, title: 'বাংলা', problem: 'একটি সমস্যা' }, 'bn')
  assert.match(output, /একটি সমস্যা/)
  assert.match(output, /জমা দেওয়া বা যাচাই করা হয়নি/)
  assert.doesNotMatch(output, /undefined/)
})

test('every idea has a stable bilingual route and shares complete problem research', () => {
  assert.equal(new Set(ideas.map(idea => idea.id)).size, ideas.length)
  for (const idea of ideas) {
    assert.match(idea.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    const problem = problems.find(p => p.id === idea.problemId)
    assert.ok(Object.hasOwn(sectors, problem.sector))
    assert.ok(problem.places.every(place => Object.hasOwn(places, place)))
    for (const locale of ['bn', 'en']) {
      for (const field of ['title', 'summary', 'description', 'businessModel', 'signal', 'prototype']) assert.ok(idea[locale][field].trim(), `${idea.id}: ${locale}.${field}`)
      const route = ideaPath(locale, ideaSlug(idea.id))
      const file = `app/(contents)/${locale === 'en' ? 'en' : '(bn)'}/startup-ideas/${ideaSlug(idea.id)}/page.mdx`
      assert.ok(fs.readFileSync(file, 'utf8').includes(`id="${idea.id}"`))
      assert.deepEqual(pageChromePolicy(route), { showDiscussionAction: false, showPageActions: false, showEditAction: false })
      assert.equal(sourceSupportsInlineEdit({ slug: route.replace(/^\/en\//, '/').slice(1) }), false)
    }
    for (const source of problem.sources) {
      assert.equal(new URL(source.url).protocol, 'https:')
      assert.ok(source.en && source.bn && source.date)
    }
  }
  assert.equal(pageChromePolicy('/en/ideas/customer-research').showEditAction, true, 'existing guide section stays editable')
})


test('saved problems migrate to every related idea once, retaining unknown IDs and the backup', () => {
  const backup = JSON.stringify(['courier-settlement', 'removed-id', 'courier-settlement-approach'])
  const data = new Map([[LEGACY_SAVED_KEY, backup]])
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
  const expected = ['courier-settlement-approach', 'courier-settlement-service', 'removed-id']
  assert.deepEqual(readSaved(storage, ideas), expected)
  assert.equal(data.get(LEGACY_SAVED_KEY), backup)
  // Removing items must not bring them back from the old key on the next visit.
  storage.setItem(SAVED_KEY, '[]')
  assert.deepEqual(readSaved(storage, ideas), [])
  storage.setItem(SAVED_KEY, '["produce-crates-approach"]')
  assert.deepEqual(readSaved(storage, ideas), ['produce-crates-approach'])
})

test('failed migration leaves the backup intact and does not pretend saving succeeded', () => {
  const backup = '["courier-settlement"]'
  const storage = { getItem: key => key === LEGACY_SAVED_KEY ? backup : null, setItem: () => { throw new Error('Storage unavailable') } }
  assert.throws(() => readSaved(storage, ideas), /Storage unavailable/)
  assert.equal(storage.getItem(LEGACY_SAVED_KEY), backup)
})

test('legacy problem links show the related choices without selecting a solution', () => {
  const filtered = matchingIdeas(summaries, parseFilters('?problem=courier-settlement'), [])
  assert.deepEqual(filtered.map(idea => idea.id), ['courier-settlement-approach', 'courier-settlement-service'])
  assert.equal(matchingIdeas(summaries, defaultFilters, []).length, ideas.length)
  assert.equal(parseFilters('?problem=../bad').problem, '')
})
