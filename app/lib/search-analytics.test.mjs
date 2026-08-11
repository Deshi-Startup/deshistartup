import assert from 'node:assert/strict'
import test from 'node:test'

import { normalizeSearchTerm } from './search-analytics.ts'

test('spellings of the same query collapse into one row', () => {
  assert.equal(normalizeSearchTerm('Trade License'), 'trade license')
  assert.equal(normalizeSearchTerm('  trade   license  '), 'trade license')
  assert.equal(normalizeSearchTerm('ট্রেড লাইসেন্স'), 'ট্রেড লাইসেন্স')
})

test('an empty or blank query is not worth an event', () => {
  assert.equal(normalizeSearchTerm(''), null)
  assert.equal(normalizeSearchTerm('   '), null)
})

test('anything shaped like a contact detail is dropped', () => {
  assert.equal(normalizeSearchTerm('shamir@example.com'), null)
  assert.equal(normalizeSearchTerm('01712345678'), null)
  assert.equal(normalizeSearchTerm('০১৭১২৩৪৫৬৭৮'), null)
  assert.equal(normalizeSearchTerm('০১৭ ১২৩ ৪৫৬৭৮'), null)
  assert.equal(normalizeSearchTerm('+880 1712-345678'), null)
})

test('a real query keeps its numbers', () => {
  assert.equal(normalizeSearchTerm('কোম্পানি আইন ১৯৯৪'), 'কোম্পানি আইন ১৯৯৪')
  assert.equal(normalizeSearchTerm('ভ্যাট ১৫%'), 'ভ্যাট ১৫%')
  assert.equal(normalizeSearchTerm('form IX'), 'form ix')
  assert.equal(normalizeSearchTerm('section 234'), 'section 234')
})

test('a runaway paste cannot blow up the dimension', () => {
  const long = 'ক'.repeat(400)
  assert.equal(normalizeSearchTerm(long).length, 100)
})
