import assert from 'node:assert/strict'
import test from 'node:test'
import { inspectCitations } from './citation-lint-lib.mjs'

test('accepts a defined citation reused more than once', () => {
  const result = inspectCitations(
    [
      'First claim.[^official-source] Second claim.[^official-source]',
      '',
      '## Relevant Sources',
      '',
      '[^official-source]: [Source](https://example.com)'
    ].join('\n')
  )

  assert.deepEqual(result.errors, [])
  assert.equal(result.definitionCount, 1)
  assert.equal(result.referenceCount, 2)
  assert.deepEqual(result.referenceCounts, { 'official-source': 2 })
})

test('accepts the Bangla sources heading', () => {
  const result = inspectCitations(
    [
      'দাবি।[^official-source]',
      '',
      '## প্রাসঙ্গিক সোর্স',
      '',
      '[^official-source]: [সোর্স](https://example.com)'
    ].join('\n')
  )

  assert.deepEqual(result.errors, [])
})

test('rejects manual source lists on completed guides', () => {
  const result = inspectCitations(
    [
      '# Guide',
      '',
      '## Relevant Sources',
      '',
      '- [Source](https://example.com)'
    ].join('\n'),
    'page.mdx'
  )

  assert.ok(
    result.errors.some((error) =>
      /page\.mdx:5 completed guides must use inline GFM footnotes/.test(error)
    )
  )
})

test('allows manual source seeds on stubs', () => {
  const result = inspectCitations(
    [
      '# Stub',
      '',
      '<StubNotice path="example" locale="en" />',
      '',
      '## Relevant Sources',
      '',
      '- [Starting source](https://example.com)'
    ].join('\n')
  )

  assert.deepEqual(result.errors, [])
})

test('rejects unresolved citation syntax', () => {
  const result = inspectCitations('Claim.[^missing-source]', 'page.mdx')
  assert.match(result.errors[0], /page\.mdx:1 unresolved citation \[\^missing-source\]/)
})

test('rejects duplicate and unused definitions', () => {
  const result = inspectCitations(
    [
      'Claim.[^used-source]',
      '',
      '[^used-source]: One',
      '[^used-source]: Two',
      '[^unused-source]: Three'
    ].join('\n')
  )

  assert.ok(result.errors.some((error) => /used-source.*2 definitions/.test(error)))
  assert.ok(result.errors.some((error) => /unused-source.*defined but never used/.test(error)))
})

test('requires cited pages to retain their sources heading', () => {
  const result = inspectCitations(
    'Claim.[^official-source]\n\n[^official-source]: [Source](https://example.com)'
  )
  assert.ok(result.errors.some((error) => /must include a ## প্রাসঙ্গিক সোর্স/))
})

test('ignores citation-shaped examples inside code', () => {
  const result = inspectCitations(
    ['`[^inline-example]`', '', '```md', '[^fenced-example]', '```'].join('\n')
  )
  assert.deepEqual(result.errors, [])
})

test('requires stable citation identifiers', () => {
  const result = inspectCitations(
    'Claim.[^BadID]\n\n## Relevant Sources\n\n[^BadID]: Source'
  )
  assert.ok(result.errors.some((error) => /must use lowercase ASCII words separated by hyphens/))
})
