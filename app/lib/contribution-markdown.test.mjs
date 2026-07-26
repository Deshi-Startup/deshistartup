import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import {
  decodeLockedMdx,
  encodeLockedMdx,
  lockedMdxBlocks,
  sameLockedMdx
} from './contribution-markdown.ts'

function pageFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? pageFiles(path) : entry.name === 'page.mdx' ? [path] : []
  })
}

test('protected MDX components survive the editor round trip exactly', () => {
  const source = [
    '# Title',
    '',
    '<StubNotice path="ideas/finding-ideas" locale="en" />',
    '',
    'Body copy.',
    '',
    '<SectionIndex',
    '  section="ideas"',
    '  locale="en"',
    '/>',
    ''
  ].join('\n')

  assert.equal(decodeLockedMdx(encodeLockedMdx(source)), source)
})

test('an author-written mdx code example remains a code example', () => {
  const source = ['```mdx', '<Example value="kept as code" />', '```'].join('\n')
  assert.equal(decodeLockedMdx(encodeLockedMdx(source)), source)
  assert.deepEqual(lockedMdxBlocks(source), [])
})

test('tilde fences and indented component blocks are preserved', () => {
  const source = [
    '~~~mdx',
    '<Example value="kept as code" />',
    '~~~',
    '',
    '  <StubNotice path="ideas/test" locale="en" />',
    ''
  ].join('\n')

  assert.equal(decodeLockedMdx(encodeLockedMdx(source)), source)
  assert.deepEqual(lockedMdxBlocks(source), [
    '<StubNotice path="ideas/test" locale="en" />'
  ])
})

test('protected-component validation catches changes, additions and deletion', () => {
  const original = lockedMdxBlocks('<StubNotice path="ideas/test" locale="en" />')

  assert.equal(sameLockedMdx(original, [...original]), true)
  assert.equal(
    sameLockedMdx(original, lockedMdxBlocks('<StubNotice path="ideas/changed" locale="en" />')),
    false
  )
  assert.equal(sameLockedMdx(original, []), false)
  assert.equal(
    sameLockedMdx(original, [...original, '<SectionIndex section="ideas" locale="en" />']),
    false
  )
})

test('every current content page survives the protected-component round trip', () => {
  for (const file of pageFiles('app/(contents)')) {
    const source = readFileSync(file, 'utf8')
    assert.equal(
      decodeLockedMdx(encodeLockedMdx(source)),
      source,
      `${file} changed during the editor round trip`
    )
  }
})
