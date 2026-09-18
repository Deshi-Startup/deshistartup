import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
const { problems, approaches: ideas } = JSON.parse(fs.readFileSync(new URL('../../../data/ecosystem/public.json', import.meta.url), 'utf8'))
import { defaultFilters, draftLimits, draftMarkdown, emptyDraft, filterQuery, ideaPath, ideaSlug, matchingIdeas, parseDraft, parseFilters, parseSaved, parseSteps, readSaved, SAVED_KEY, STEPS_KEY, LEGACY_SAVED_KEY, places, sectors, startsWithoutCode, stepProgressLabel, stepsDone, toggleStep } from './model.ts'
import { guidePage } from '../../lib/guide-index.mjs'
import { pageChromePolicy } from '../../lib/page-chrome.ts'
import { sourceSupportsInlineEdit } from '../../lib/inline-edit-policy.mjs'

const summaries = ideas.map(idea => ({ ...problems.find(p => p.id === idea.problemId), ...idea, title: idea.en.title, summary: idea.en.summary, search: `${idea.en.title} ${idea.en.summary} ${idea.bn.title} ${idea.bn.summary}` }))

test('URL filters round-trip Bangla and punctuation without accepting unknown categories', () => {
  const state = { q: 'কুরিয়ার & returns', sector: 'commerce', place: 'dhaka', kind: 'nocode', saved: true, problem: '' }
  assert.deepEqual(parseFilters(filterQuery(state)), state)
  assert.deepEqual(parseFilters('?sector=__proto__&place=constructor&kind=__proto__&view=unknown'), defaultFilters)
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

test('the no-code filter selects every idea a reader can start without software', () => {
  const withoutCode = matchingIdeas(summaries, { ...defaultFilters, kind: 'nocode' }, [])
  assert.deepEqual(withoutCode.map(idea => idea.kind).filter(kind => !startsWithoutCode(kind)), [])
  assert.equal(withoutCode.length, ideas.filter(idea => startsWithoutCode(idea.kind)).length)
  assert.ok(withoutCode.length > 0 && withoutCode.length < ideas.length, 'the filter is worth offering only if it divides the collection')
  assert.equal(matchingIdeas(summaries, { ...defaultFilters, kind: 'software' }, []).every(idea => idea.kind === 'software'), true)
  assert.equal(matchingIdeas(summaries, { ...defaultFilters, kind: 'nocode', sector: 'commerce' }, []).every(idea => idea.sector === 'commerce' && startsWithoutCode(idea.kind)), true)
})

test('first-test progress survives bad data, re-ordered steps and a removed tick', () => {
  assert.deepEqual(parseSteps('not json'), {})
  assert.deepEqual(parseSteps('[1,2]'), {})
  assert.deepEqual(parseSteps('{"../escape":[0],"good-id":[1,1,0,"x",-1,99]}'), { 'good-id': [0, 1] })
  assert.deepEqual(parseSteps('{"good-id":[]}'), {}, 'an untouched idea leaves nothing behind')
  // A shortened first test must not report progress the reader never made.
  assert.equal(stepsDone({ 'good-id': [0, 2] }, 'good-id', 2), 1)
  assert.equal(stepsDone({}, 'missing', 3), 0)
  const data = new Map()
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
  assert.deepEqual(toggleStep(storage, 'courier-settlement-approach', 1), { 'courier-settlement-approach': [1] })
  assert.deepEqual(toggleStep(storage, 'courier-settlement-approach', 0), { 'courier-settlement-approach': [0, 1] })
  assert.deepEqual(toggleStep(storage, 'courier-settlement-approach', 0), { 'courier-settlement-approach': [1] })
  // Removing the last tick leaves no entry behind for an idea the reader abandoned.
  assert.deepEqual(toggleStep(storage, 'courier-settlement-approach', 1), {})
  assert.deepEqual(parseSteps(data.get(STEPS_KEY)), {})
  assert.equal(stepProgressLabel(0, 3, 'en'), 'Not started')
  assert.equal(stepProgressLabel(2, 3, 'en'), '2 of 3 steps done')
  assert.equal(stepProgressLabel(3, 3, 'bn'), 'সব ধাপ শেষ')
  assert.match(stepProgressLabel(2, 3, 'bn'), /৩টির মধ্যে ২টি/)
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


test('every idea is dated and links only to guides that are written in both languages', () => {
  const contentIndex = JSON.parse(fs.readFileSync(new URL('../../generated/content-index.json', import.meta.url), 'utf8'))
  const anyStub = Object.values(contentIndex.bn.sections).flatMap(section => section[4].flatMap(group => group[1])).find(page => page[2])
  assert.ok(anyStub, 'the manual still has planned topics, which this rule exists to exclude')
  assert.equal(guidePage(contentIndex, 'bn', anyStub[0].replace(/^\//, '')), null, 'a planned topic is never offered as a guide')
  assert.equal(guidePage(contentIndex, 'bn', 'not/a/real/page'), null)
  for (const idea of ideas) {
    assert.match(idea.addedAt, /^\d{4}-\d{2}-\d{2}$/, `${idea.id}: added date`)
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
