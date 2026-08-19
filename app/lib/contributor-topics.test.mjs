import assert from 'node:assert/strict'
import test from 'node:test'
import { contributorTopics } from './contributor-topics.mjs'

function contribution(paths) {
  return { event: { targets: paths.map((path) => ({ path })) } }
}

test('groups published pages by topic section and ranks by page count', () => {
  const { pageCount, topics } = contributorTopics([
    contribution(['/tax/e-tin', '/tax/mushak-63', '/registration/name-clearance']),
    contribution(['/tax/personal-vs-company-tin'])
  ])

  assert.equal(pageCount, 4)
  assert.deepEqual(topics, [
    { slug: 'tax', count: 3 },
    { slug: 'registration', count: 1 }
  ])
})

test('counts a page once however many accepted events touched it', () => {
  const { pageCount, topics } = contributorTopics([
    contribution(['/funding/safe-note']),
    contribution(['/funding/safe-note', '/funding/term-sheet'])
  ])

  assert.equal(pageCount, 2)
  assert.deepEqual(topics, [{ slug: 'funding', count: 2 }])
})

test('breaks a tie on the section slug so the order never depends on input order', () => {
  const first = contributorTopics([contribution(['/tax/e-tin', '/funding/safe-note'])])
  const second = contributorTopics([contribution(['/funding/safe-note', '/tax/e-tin'])])

  assert.deepEqual(first.topics, second.topics)
  assert.deepEqual(first.topics, [
    { slug: 'funding', count: 1 },
    { slug: 'tax', count: 1 }
  ])
})

test('ignores product work that has no published target page', () => {
  const { pageCount, topics } = contributorTopics([
    { event: {} },
    { event: { targets: [] } },
    { event: { targets: [{ path: '' }, { path: 'tax/e-tin' }] } }
  ])

  assert.equal(pageCount, 0)
  assert.deepEqual(topics, [])
})

test('survives a single-segment route without inventing a section', () => {
  const { pageCount, topics } = contributorTopics([contribution(['/start-here'])])

  assert.equal(pageCount, 1)
  assert.deepEqual(topics, [{ slug: 'start-here', count: 1 }])
})
