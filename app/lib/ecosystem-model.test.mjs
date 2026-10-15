import assert from 'node:assert/strict'
import test from 'node:test'
import { partitionSources } from './ecosystem-model.ts'

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
