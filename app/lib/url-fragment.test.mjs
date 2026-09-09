import assert from 'node:assert/strict'
import test from 'node:test'
import { decodeFragment } from './url-fragment.ts'

test('decodes shared headings, including Bangla and literal plus signs', () => {
  assert.equal(decodeFragment('#' + encodeURIComponent('টাকার হিসাব')), 'টাকার হিসাব')
  assert.equal(decodeFragment('#cash+flow'), 'cash+flow')
  assert.equal(decodeFragment('#credits'), 'credits')
  assert.equal(decodeFragment(''), '')
})

test('keeps malformed escapes usable as literal IDs without throwing', () => {
  for (const value of ['%broken', '100%', '%E0%A4', '%FF']) {
    assert.equal(decodeFragment('#' + value), value)
  }
})
