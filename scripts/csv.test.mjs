import assert from 'node:assert/strict'
import test from 'node:test'
import { parseCsv } from './csv.mjs'

test('backlog CSV preserves quoted commas, quotes, multiline notes and empty trailing fields', () => {
  assert.deepEqual(parseCsv('Path,Notes,Owner\r\n/a,"One, then ""two""\r\nNext line",\r\n\r\n/b,Plain,'), [
    ['Path', 'Notes', 'Owner'],
    ['/a', 'One, then "two"\r\nNext line', ''],
    ['/b', 'Plain', '']
  ])
})
