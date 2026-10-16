import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { unstable_splitSqlQuery } from 'wrangler'
import { parseSourceLine, sourceLines, sourceMetadata, splitSizeNote } from '../app/lib/ecosystem-model.ts'
import { readEcosystemSnapshot, snapshotRowsSql } from './lib/ecosystem-snapshot.mjs'

const require = createRequire(import.meta.resolve('wrangler'))
const { Miniflare, convertV4MiniflareOptions } = require('miniflare')

test('reviewed source cards survive D1 migration, export and bilingual brief generation', { timeout: 90_000 }, async t => {
  const options = { modules: true, script: '', d1Databases: { DB: 'research-source-tests' } }
  const mf = new Miniflare(convertV4MiniflareOptions ? convertV4MiniflareOptions(options) : options)
  t.after(() => mf.dispose())
  const db = await mf.getD1Database('DB')
  const directory = new URL('../worker/migrations/ecosystem/', import.meta.url)
  const correction = '0030_research_source_review.sql'
  const apply = name => db.batch(unstable_splitSqlQuery(fs.readFileSync(new URL(name, directory), 'utf8')).map(sql => db.prepare(sql)))
  let before
  for (const name of fs.readdirSync(directory).filter(n => n.endsWith('.sql')).sort()) {
    if (name === correction) before = (await db.prepare('SELECT id, sources_json FROM problems').all()).results
    await apply(name)
  }
  const readRows = async () => (await db.prepare('SELECT id, sources_json, revision FROM problems ORDER BY id').all()).results
  const after = await readRows()
  for (const row of before) {
    const oldSources = JSON.parse(row.sources_json)
    const newSources = JSON.parse(after.find(p => p.id === row.id).sources_json)
    assert.deepEqual(newSources.map(s => s.url), oldSources.map(s => s.url), `source identity: ${row.id}`)
    for (const source of oldSources.filter(s => !['maps', 'size'].includes(s.section))) {
      assert.deepEqual(newSources.find(s => s.url === source.url), source, `unrelated evidence: ${row.id}`)
    }
  }
  await apply(correction)
  assert.deepEqual(await readRows(), after, 'rerunning the correction changes neither data nor revisions')

  const rows = JSON.parse((await db.prepare(snapshotRowsSql).first()).snapshot_rows)
  const snapshot = await readEcosystemSnapshot(sql => rows[sql.match(/FROM (\w+)/)[1]], 'source-review-test', '2026-10-16T12:00:00Z')
  const cards = snapshot.problems.flatMap(p => p.sources.filter(s => s.section === 'size'))
  assert.equal(cards.length, 7)
  for (const source of cards) for (const locale of ['en', 'bn']) {
    const { title, date } = sourceMetadata(source, locale)
    assert.match(title, locale === 'en' ? /draft estimate/ : /খসড়া হিসাব/)
    assert.ok(date)
    const brief = sourceLines([source], locale)
    assert.ok(brief.includes(title) && brief.includes(date), 'download retains scope and source dates')
    for (const line of splitSizeNote(source[locale]).sources) assert.ok(parseSourceLine(line).url, `unlinked input: ${line}`)
  }
  for (const problem of snapshot.problems) {
    const maps = problem.sources.filter(s => s.section === 'maps')
    assert.ok(maps.length)
    for (const map of maps) assert.match(map.bn, /চাহিদা আছে কি না বোঝা যায় না/)
  }
  const clinic = snapshot.problems.find(p => p.id === 'missed-follow-up').sources.find(s => s.section === 'size')
  const parsed = splitSizeNote(clinic.en)
  const clinics = Number(parsed.factors[0].value.replaceAll(',', ''))
  const annualFee = 500 * 12
  assert.equal(parsed.results[0].value, '$' + (clinics * annualFee / 120).toLocaleString('en-US'))
  assert.doesNotMatch(clinic.en, /ChamberBD Standard|At 700/)
})
