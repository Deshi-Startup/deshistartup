import assert from 'node:assert/strict'
import test from 'node:test'
import { deriveContributableEntry } from './contributable-path.ts'

test('derives mirrored Bengali and English source paths', () => {
  assert.deepEqual(deriveContributableEntry('/registration/private-limited'), {
    repoPath: 'app/(contents)/(bn)/registration/private-limited/page.mdx',
    locale: 'bn'
  })
  assert.deepEqual(deriveContributableEntry('/en/registration/private-limited'), {
    repoPath: 'app/(contents)/en/registration/private-limited/page.mdx',
    locale: 'en'
  })
  assert.deepEqual(deriveContributableEntry('/about'), {
    repoPath: 'app/(contents)/(bn)/about/page.mdx',
    locale: 'bn'
  })
})

test('rejects paths outside the route shape', () => {
  assert.equal(deriveContributableEntry('/en'), null)
  assert.equal(deriveContributableEntry('/a/b/c'), null)
  assert.equal(deriveContributableEntry('/registration/../private-limited'), null)
  assert.equal(deriveContributableEntry('registration/private-limited'), null)
})
