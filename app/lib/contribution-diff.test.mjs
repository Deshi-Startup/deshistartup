import assert from 'node:assert/strict'
import test from 'node:test'
import { buildContributionReview } from './contribution-diff.ts'
import { encodeLockedMdx, normalizeContributionMarkdown } from './contribution-markdown.ts'

test('returns no hunks when editor normalization makes the text equivalent', () => {
  const compact = [
    '| প্রশ্ন | ০ | ১ |',
    '|---|---|---|',
    '| সাম্প্রতিক ঘটনা শুনেছি? | না | একটা |',
    ''
  ].join('\n')
  const padded = [
    '| প্রশ্ন                  | ০      | ১    |',
    '| ----------------------- | ------ | ---- |',
    '| সাম্প্রতিক ঘটনা শুনেছি? | না     | একটা |',
    ''
  ].join('\n')

  assert.deepEqual(
    buildContributionReview(
      normalizeContributionMarkdown(compact),
      normalizeContributionMarkdown(padded)
    ),
    {
      status: 'unchanged',
      additions: 0,
      deletions: 0,
      hunks: []
    }
  )
})

test('reports additions and deletions with source line numbers', () => {
  const before = ['# Title', '', '---', '', 'Old fee', 'Keep this', ''].join('\n')
  const after = ['# Title', '', '---', '', 'New fee', 'Extra note', 'Keep this', ''].join('\n')
  const review = buildContributionReview(before, after, { contextLines: 2 })

  assert.equal(review.status, 'ready')
  assert.equal(review.additions, 2)
  assert.equal(review.deletions, 1)
  assert.equal(review.hunks.length, 1)
  assert.deepEqual(
    review.hunks[0].rows
      .filter((row) => row.kind !== 'context')
      .map(({ kind, oldLine, newLine, text }) => ({ kind, oldLine, newLine, text })),
    [
      { kind: 'deletion', oldLine: 5, newLine: null, text: 'Old fee' },
      { kind: 'addition', oldLine: null, newLine: 5, text: 'New fee' },
      { kind: 'addition', oldLine: null, newLine: 6, text: 'Extra note' }
    ]
  )
  assert.ok(
    review.hunks[0].rows.some((row) => row.kind === 'context' && row.text === '---'),
    'a Markdown thematic break should remain ordinary context'
  )
})

test('collapses distant edits into separate compact hunks', () => {
  const before = Array.from({ length: 30 }, (_, index) => `Line ${index + 1}`).join('\n')
  const afterLines = before.split('\n')
  afterLines[4] = 'Changed near the top'
  afterLines[24] = 'Changed near the bottom'

  const review = buildContributionReview(before, afterLines.join('\n'), { contextLines: 2 })

  assert.equal(review.status, 'ready')
  assert.equal(review.hunks.length, 2)
  assert.ok(review.hunks.every((hunk) => hunk.rows.length <= 6))
  assert.ok(review.hunks.every((hunk) => !hunk.rows.some((row) => row.text === 'Line 15')))
})

test('does not mark unchanged protected MDX as edited', () => {
  const protectedBlock = '<StubNotice path="ideas/test" locale="en" />'
  const before = encodeLockedMdx(['# Title', '', protectedBlock, '', 'Old copy', ''].join('\n'))
  const after = encodeLockedMdx(['# Title', '', protectedBlock, '', 'New copy', ''].join('\n'))
  const review = buildContributionReview(before, after)
  const changedRows = review.hunks.flatMap((hunk) =>
    hunk.rows.filter((row) => row.kind !== 'context')
  )

  assert.deepEqual(
    changedRows.map(({ kind, text }) => ({ kind, text })),
    [
      { kind: 'deletion', text: 'Old copy' },
      { kind: 'addition', text: 'New copy' }
    ]
  )
})

test('stops pathological comparisons at a fixed work budget', () => {
  const before = Array.from({ length: 600 }, (_, index) => `Before ${index}`).join('\n')
  const after = Array.from({ length: 600 }, (_, index) => `After ${index}`).join('\n')

  assert.deepEqual(buildContributionReview(before, after, { maxWork: 200 }), {
    status: 'too-large',
    additions: 0,
    deletions: 0,
    hunks: []
  })
})

test('rejects documents above the explicit line ceiling before diffing', () => {
  const before = Array.from({ length: 21 }, (_, index) => `Line ${index}`).join('\n')
  const after = `${before}\nOne more line`

  assert.equal(buildContributionReview(before, after, { maxLines: 20 }).status, 'too-large')
})

test('bounds the number of changed rows the dialog could render', () => {
  const after = Array.from({ length: 21 }, (_, index) => `Added ${index}`).join('\n')

  assert.equal(
    buildContributionReview('', after, { maxLines: 100, maxChangedLines: 20 }).status,
    'too-large'
  )
})

test('reconstructs both versions when lines repeat or move', () => {
  for (const [before, after] of [
    ['a\nb\na\nc', 'a\na\nb\nc'],
    ['same\nend', 'start\nsame\nend\nlast'],
    ['first\nrepeat\nrepeat\nlast', 'first\nrepeat\nlast']
  ]) {
    const review = buildContributionReview(before, after, { contextLines: 100 })
    const rows = review.hunks.flatMap((hunk) => hunk.rows)
    assert.equal(
      rows
        .filter((row) => row.kind !== 'addition')
        .map((row) => row.text)
        .join('\n'),
      before
    )
    assert.equal(
      rows
        .filter((row) => row.kind !== 'deletion')
        .map((row) => row.text)
        .join('\n'),
      after
    )
  }
})

test('marks only the words that moved inside a rewritten line', () => {
  const before = ['# ফি', '', 'ট্রেড লাইসেন্সের ফি ২০২৪ সালে ছিল ১,০০০ টাকা।', ''].join('\n')
  const after = ['# ফি', '', 'ট্রেড লাইসেন্সের ফি ২০২৬ সালে ছিল ১,০০০ টাকা।', ''].join('\n')
  const rows = buildContributionReview(before, after).hunks.flatMap((hunk) => hunk.rows)
  const removed = rows.find((row) => row.kind === 'deletion')
  const added = rows.find((row) => row.kind === 'addition')

  assert.deepEqual(
    removed.segments.filter((segment) => segment.kind === 'changed').map((s) => s.text),
    ['২০২৪']
  )
  assert.deepEqual(
    added.segments.filter((segment) => segment.kind === 'changed').map((s) => s.text),
    ['২০২৬']
  )
  for (const row of [removed, added]) {
    assert.equal(row.segments.map((segment) => segment.text).join(''), row.text)
  }
})

test('leaves a wholly different line without word marks', () => {
  const review = buildContributionReview('Alpha beta gamma delta\n', 'একেবারে অন্য একটি বাক্য\n')
  const rows = review.hunks.flatMap((hunk) => hunk.rows)

  assert.ok(rows.some((row) => row.kind === 'deletion'))
  assert.ok(rows.every((row) => row.segments === undefined))
})

test('does not pair a pure insertion with the line above it', () => {
  const before = ['Keep this line', ''].join('\n')
  const after = ['Keep this line', 'A brand new line', ''].join('\n')
  const rows = buildContributionReview(before, after).hunks.flatMap((hunk) => hunk.rows)

  assert.ok(rows.every((row) => row.segments === undefined))
})

test('names the nearest heading above each changed region', () => {
  const before = [
    '# শুরুর কথা',
    '',
    'প্রথম অনুচ্ছেদ।',
    '',
    '## **নবায়ন** করা',
    '',
    'দ্বিতীয় অনুচ্ছেদ।',
    ''
  ].join('\n')
  const afterLines = before.split('\n')
  afterLines[2] = 'প্রথম অনুচ্ছেদ বদলেছে।'
  afterLines[6] = 'দ্বিতীয় অনুচ্ছেদ বদলেছে।'

  const review = buildContributionReview(before, afterLines.join('\n'), { contextLines: 1 })
  assert.deepEqual(
    review.hunks.map((hunk) => hunk.heading),
    ['শুরুর কথা', 'নবায়ন করা']
  )
})

test('uses a nearby heading even when the context window opens above it', () => {
  const before = ['# Intro', '', 'Opening copy.', '', '## Fees', '', 'Old fee', ''].join('\n')
  const after = ['# Intro', '', 'Opening copy.', '', '## Fees', '', 'New fee', ''].join('\n')

  const review = buildContributionReview(before, after)

  assert.equal(review.hunks[0].heading, 'Fees')
})

test('does not use a heading that is itself being replaced', () => {
  const review = buildContributionReview(
    '# Intro\n\n## Old heading\n\nCopy\n',
    '# Intro\n\n## New heading\n\nCopy\n'
  )

  assert.equal(review.hunks[0].heading, 'Intro')
})

test('reports no heading for a change that sits above the first one', () => {
  const review = buildContributionReview('intro line\n\n# Later\n', 'edited line\n\n# Later\n', {
    contextLines: 0
  })

  assert.equal(review.hunks[0].heading, null)
})

test('flags the protected-MDX fence so unchanged transport can be hidden', () => {
  const block = '<StubNotice path="ideas/test" locale="bn" />'
  const before = encodeLockedMdx(['# শিরোনাম', '', block, '', 'পুরনো লেখা।', ''].join('\n'))
  const after = encodeLockedMdx(['# শিরোনাম', '', block, '', 'নতুন লেখা।', ''].join('\n'))
  const rows = buildContributionReview(before, after, { contextLines: 4 }).hunks.flatMap(
    (hunk) => hunk.rows
  )

  assert.deepEqual(
    rows.filter((row) => row.wrapper).map((row) => row.text),
    ['```deshi-locked-mdx', '```']
  )
  assert.ok(
    rows.some((row) => row.text === block && !row.wrapper),
    'the component itself stays visible as context'
  )
})
