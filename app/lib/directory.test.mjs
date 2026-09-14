import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'
import { localizeDirectory } from './directory.ts'

const directory = new URL('../../data/directory/', import.meta.url)
const validUrl = (value) => {
  assert.equal(typeof value, 'string')
  assert.ok(['http:', 'https:'].includes(new URL(value).protocol), value)
}

test('directory records have unique IDs, shared sources and complete matching locale fields', () => {
  for (const file of readdirSync(directory).filter((name) => name.endsWith('.json'))) {
    const entries = JSON.parse(readFileSync(new URL(file, directory), 'utf8'))
    const ids = new Set()
    for (const entry of entries) {
      assert.match(entry.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, file)
      assert.ok(!ids.has(entry.id), `${file}: duplicate ${entry.id}`)
      ids.add(entry.id)
      assert.deepEqual(Object.keys(entry).sort(), ['bn', 'en', 'id', 'lastVerified', 'sourceUrls', 'website'])
      assert.match(entry.lastVerified, /^\d{4}-\d{2}-\d{2}$/)
      assert.equal(new Date(entry.lastVerified).toISOString().slice(0, 10), entry.lastVerified)
      assert.ok(entry.sourceUrls.length > 0, entry.id)
      assert.equal(new Set(entry.sourceUrls).size, entry.sourceUrls.length)
      entry.sourceUrls.forEach(validUrl)
      if (typeof entry.website === 'object') {
        assert.deepEqual(Object.keys(entry.website).sort(), ['bn', 'en'])
        Object.values(entry.website).forEach(validUrl)
      } else validUrl(entry.website)
      assert.deepEqual(Object.keys(entry.en).sort(), Object.keys(entry.bn).sort(), entry.id)
      for (const locale of ['en', 'bn']) {
        assert.ok(entry[locale].name?.trim(), entry.id)
        for (const [key, value] of Object.entries(entry[locale])) {
          assert.ok(!['id', 'website', 'sourceUrl', 'sourceUrls', 'lastVerified'].includes(key), key)
          assert.ok(value === null || typeof value === 'string' ||
            (Array.isArray(value) && value.every((item) => typeof item === 'string')), key)
        }
      }
    }
  }
})

test('localization keeps shared evidence and language-specific websites without sending the other edition', () => {
  const entries = [{ id: 'example', website: { en: 'https://example.com/en/', bn: 'https://example.com/bn/' },
    sourceUrls: ['https://example.com/source'], lastVerified: '2026-08-19',
    en: { name: 'Example', notes: 'English' }, bn: { name: 'উদাহরণ', notes: 'বাংলা' } }]
  for (const locale of ['en', 'bn']) {
    assert.deepEqual(localizeDirectory(entries, locale), [{ ...entries[0][locale], id: 'example',
      website: entries[0].website[locale], sourceUrls: entries[0].sourceUrls, lastVerified: '2026-08-19' }])
  }
})
