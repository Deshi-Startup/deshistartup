import assert from 'node:assert/strict'
import test from 'node:test'
import { partitionSources, splitSizeNote } from './ecosystem-model.ts'

const card = (section) => ({
  title: 'Example',
  url: `https://example.com/${section || 'note'}`,
  date: '2026-10-15',
  en: 'English note.',
  bn: 'বাংলা নোট।',
  ...(section ? { section } : {})
})

test('ungrouped sources stay together and empty groups are omitted from the labelled lists', () => {
  const groups = partitionSources([card(), card('facts'), card('maps'), card('size')])
  assert.equal(groups.other.length, 1)
  assert.equal(groups.facts[0].url, 'https://example.com/facts')
  assert.equal(groups.maps[0].url, 'https://example.com/maps')
  assert.equal(groups.size[0].url, 'https://example.com/size')
})

test('older cards without section still render when no labelled groups exist', () => {
  const groups = partitionSources([card(), card()])
  assert.equal(groups.other.length, 2)
  assert.deepEqual(groups.facts, [])
  assert.deepEqual(groups.maps, [])
  assert.deepEqual(groups.size, [])
})

test('size notes split into equations then assumption bullets', () => {
  const parsed = splitSizeNote('1 × 2 = 2\n3 × 4 = 12\n\nAssumptions\n- FX is 120\n- Mixed grade')
  assert.deepEqual(parsed, {
    equations: ['1 × 2 = 2', '3 × 4 = 12'],
    assumptions: ['FX is 120', 'Mixed grade']
  })
  const bangla = splitSizeNote('1 × 2 = 2\n\nঅনুমান\n- ১২০ টাকায় এক ডলার')
  assert.deepEqual(bangla.equations, ['1 × 2 = 2'])
  assert.deepEqual(bangla.assumptions, ['১২০ টাকায় এক ডলার'])
  assert.equal(splitSizeNote('A paragraph with no split.'), null)
})
