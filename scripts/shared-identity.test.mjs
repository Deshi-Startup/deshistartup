import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { unstable_splitSqlQuery } from 'wrangler'
import { contributorIdentityImport } from './lib/identity-import.mjs'
import { readEcosystemSnapshot, snapshotRowsSql, validateEcosystemSnapshot } from './lib/ecosystem-snapshot.mjs'
import { sharedIdentityIndex } from '../app/lib/shared-identity.ts'

const require = createRequire(import.meta.resolve('wrangler'))
const { Miniflare, convertV4MiniflareOptions } = require('miniflare')
const now = '2026-09-20T12:00:00.000Z'
const profile = { id: 'sample-person', slug: 'sample-person', displayName: 'Sample Person', visibility: 'public',
  confirmedAt: '2026-08-19', organizationId: 'unmapped-org', links: [{ label: 'Profile', url: 'https://example.com/person' }], avatar: { kind: 'monogram' } }
const policy = { identityAliases: { inlineNames: { 'Earlier Name': profile.id } } }
const ledger = { profiles: [profile] }
const evidence = [{ title: 'Official organization history', url: 'https://example.com/history', publishedOn: '2020-01-01', checkedAt: '2026-09-20' }]

test('identity import preserves legacy IDs, skips withdrawals and never infers a role or account', () => {
  const plan = contributorIdentityImport(ledger, policy, now)
  assert.deepEqual(plan.people, ['sample-person'])
  assert.deepEqual(plan.unresolvedOrganizations, ['unmapped-org'])
  assert.doesNotMatch(plan.statements.join('\n'), /INSERT INTO (?:person_accounts|person_organizations)/)
  assert.deepEqual(contributorIdentityImport(ledger, { optOuts: { profileIds: [profile.id] } }, now).people, [])
  assert.deepEqual(contributorIdentityImport({ profiles: [{ ...profile, confirmedAt: null }] }, policy, now).people, [])
})

test('old published snapshots still resolve Startup 50 identities without exposing people', () => {
  const snapshot = JSON.parse(fs.readFileSync(new URL('../data/ecosystem/public.json', import.meta.url)))
  validateEcosystemSnapshot(snapshot)
  const index = sharedIdentityIndex(snapshot)
  assert.equal(index.organization('startup-50', '10-minute-school').id, 'org_10-minute-school')
  assert.equal(index.organization('startup-50', 'not-a-company'), null)
  assert.equal(index.person('contributor', 'sample-person'), null)
})

test('identity migrations, import, relationship review and public export work against real D1', { timeout: 90_000 }, async t => {
  const options = { modules: true, script: '', d1Databases: { DB: 'shared-identity-tests' } }
  const mf = new Miniflare(convertV4MiniflareOptions ? convertV4MiniflareOptions(options) : options)
  t.after(() => mf.dispose())
  const db = await mf.getD1Database('DB')
  const directory = new URL('../worker/migrations/ecosystem/', import.meta.url)
  for (const name of fs.readdirSync(directory).filter(n => n.endsWith('.sql')).sort()) {
    if (name.startsWith('0012')) {
      await db.prepare("INSERT INTO releases (id, snapshot_json, digest, created_at) VALUES ('legacy-release', ?, 'legacy-digest', ?)")
        .bind(fs.readFileSync(new URL('../data/ecosystem/public.json', import.meta.url), 'utf8'), now).run()
      await db.prepare("INSERT INTO publication VALUES (1, 'legacy-release')").run()
      await db.prepare("INSERT INTO idea_votes VALUES ('garment-offcuts-approach', 'legacy-owner-hash', 1, ?)").bind(now).run()
      await db.prepare("INSERT INTO submissions (id, owner_hash, idempotency_key, payload_hash, payload_json, created_at) VALUES ('legacy-submission', 'legacy-owner-hash', 'legacy-request-key', 'legacy-payload-hash', '{}', ?)").bind(now).run()
    }
    await db.batch(unstable_splitSqlQuery(fs.readFileSync(new URL(name, directory), 'utf8')).map(sql => db.prepare(sql)))
  }
  const exportSnapshot = async () => {
    const rows = JSON.parse((await db.prepare(snapshotRowsSql).first()).snapshot_rows)
    return readEcosystemSnapshot(sql => rows[sql.match(/FROM (\w+)/)[1]], 'identity-test', now)
  }
  const baseline = await exportSnapshot()
  const baselineEvents = (await db.prepare('SELECT COUNT(*) AS n FROM identity_events').first()).n
  const apply = plan => db.batch(plan.statements.map(sql => db.prepare(sql)))
  const plan = contributorIdentityImport(ledger, policy, now)

  await t.test('migration preserves frozen publication, private submission ownership and votes', async () => {
    const release = await db.prepare("SELECT r.* FROM releases r JOIN publication p ON p.release_id = r.id").first()
    assert.equal(release.id, 'legacy-release')
    assert.equal(release.snapshot_json, fs.readFileSync(new URL('../data/ecosystem/public.json', import.meta.url), 'utf8'))
    assert.equal((await db.prepare("SELECT owner_hash FROM submissions WHERE id = 'legacy-submission'").first()).owner_hash, 'legacy-owner-hash')
    assert.deepEqual(await db.prepare("SELECT owner_hash, active FROM idea_votes").first(), { owner_hash: 'legacy-owner-hash', active: 1 })
  })

  await t.test('Startup 50 mappings have one database owner while old public references remain available', async () => {
    assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM organization_references WHERE kind = 'startup-50'").first()).n, 0)
    await assert.rejects(db.prepare("INSERT INTO organization_references VALUES ('org_dorik', 'startup-50', 'dorik')").run(), /identity_references/)
    const snapshot = await exportSnapshot()
    assert.ok(snapshot.organizations.find(o => o.id === 'org_dorik').references.some(r => r.kind === 'startup-50' && r.target === 'dorik'))
    assert.equal(sharedIdentityIndex(snapshot).organization('startup-50', 'dorik').id, 'org_dorik')
  })

  await t.test('concurrent imports are idempotent and retain later edits and withdrawal', async () => {
    await Promise.all([apply(plan), apply(plan)])
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM people').first()).n, baseline.identities.people.length + 1)
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM identity_events').first()).n, baselineEvents + 1)
    assert.equal((await db.prepare('SELECT visibility FROM people WHERE id = ?').bind(profile.id).first()).visibility, 'private')
    await db.prepare("UPDATE people SET display_name = 'Reviewed Name', visibility = 'withdrawn' WHERE id = ?").bind(profile.id).run()
    await apply(plan)
    assert.deepEqual(await db.prepare('SELECT display_name, visibility FROM people WHERE id = ?').bind(profile.id).first(), { display_name: 'Reviewed Name', visibility: 'withdrawn' })
    assert.equal((await exportSnapshot()).identities.people.length, baseline.identities.people.length)
  })

  await t.test('public exports exclude account bindings, audit details and hidden identities', async () => {
    await db.prepare("INSERT INTO person_accounts VALUES ('google', ?, ?, ?)").bind('a'.repeat(24), profile.id, now).run()
    const hidden = await exportSnapshot()
    assert.equal(hidden.identities.references.some(r => r.personId === profile.id), false)
    await db.prepare("UPDATE people SET visibility = 'public' WHERE id = ?").bind(profile.id).run()
    const snapshot = await exportSnapshot()
    const index = sharedIdentityIndex(snapshot)
    assert.equal(index.person('contributor', profile.id).displayName, 'Reviewed Name')
    assert.deepEqual(index.person('contributor', profile.id).aliases, ['Earlier Name'])
    assert.equal(index.organization('directory', 'investors/bangladesh-angels-network').id, 'org_bangladesh-angels-network')
    assert.equal(index.organization('directory', 'investors/bangladesh-women-investors-network').id, 'org_bangladesh-women-investors-network')
    assert.doesNotMatch(JSON.stringify(snapshot), /subject_hash|identity_events|maintainer:|aaaaaaaaaaaaaaaaaaaaaaaa|visibility|unmapped-org/)
  })

  await t.test('foreign keys, entity kinds and account uniqueness prevent ambiguous links', async () => {
    await assert.rejects(db.prepare("INSERT INTO identity_references VALUES ('contributor', 'dangling', 'missing', NULL)").run(), /FOREIGN KEY/)
    await assert.rejects(db.prepare("INSERT INTO identity_references VALUES ('contributor', 'wrong-kind', NULL, 'org_dorik')").run(), /CHECK/)
    await assert.rejects(db.prepare("INSERT INTO identity_references VALUES ('contributor', 'two-owners', ?, 'org_dorik')").bind(profile.id).run(), /CHECK/)
    await assert.rejects(db.prepare("INSERT INTO person_accounts VALUES ('google', ?, ?, ?)").bind('a'.repeat(24), profile.id, now).run(), /UNIQUE/)
  })

  await t.test('conflicting legacy mappings roll back the whole import batch', async () => {
    await db.prepare("INSERT INTO identity_references VALUES ('contributor', 'other-person', ?, NULL)").bind(profile.id).run()
    const conflicting = contributorIdentityImport({ profiles: [{ ...profile, id: 'other-person', slug: 'other-person' }] }, policy, now)
    await assert.rejects(apply(conflicting), /CHECK/)
    assert.equal(await db.prepare("SELECT id FROM people WHERE id = 'other-person'").first(), null)
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM mutation_guards').first()).n, 0)
  })

  await t.test('only reviewed relationships publish, with distinct role and evidence dates', async () => {
    await db.prepare(`INSERT INTO person_organizations (id, person_id, organization_id, role, started_on, ended_on, as_of, sources_json)
      VALUES ('role-test', ?, 'org_dorik', 'founder', '2020-01-01', '2023-01-01', '2023-01-01', ?)`)
      .bind(profile.id, JSON.stringify(evidence.map(s => ({ ...s, privateNote: 'Never export this note' })))).run()
    await db.prepare(`INSERT INTO organization_relationships (id, subject_id, object_id, kind, as_of, sources_json)
      VALUES ('portfolio-test', 'org_bangladesh-angels-network', 'org_dorik', 'portfolio-mention', '2023-01-01', ?)`)
      .bind(JSON.stringify(evidence)).run()
    assert.equal((await exportSnapshot()).identities.affiliations.filter(a => a.personId === profile.id).length, 0)
    assert.equal((await exportSnapshot()).identities.organizationRelationships.filter(r => r.id === 'portfolio-test').length, 0)
    await assert.rejects(db.prepare("UPDATE person_organizations SET status = 'confirmed' WHERE id = 'role-test'").run(), /CHECK/)
    await db.batch([
      db.prepare("UPDATE person_organizations SET status = 'confirmed', reviewed_at = ? WHERE id = 'role-test'").bind(now),
      db.prepare("UPDATE organization_relationships SET status = 'confirmed', reviewed_at = ? WHERE id = 'portfolio-test'").bind(now)
    ])
    const snapshot = await exportSnapshot(), index = sharedIdentityIndex(snapshot)
    assert.equal(index.peopleAt('org_dorik').find(a => a.id === 'role-test').personId, profile.id)
    assert.equal(index.affiliations(profile.id)[0].endedOn, '2023-01-01')
    assert.equal(index.relationships('org_dorik')[0].kind, 'portfolio-mention')
    assert.equal(index.relationships('org_bangladesh-angels-network').find(r => r.id === 'portfolio-test').objectId, 'org_dorik')
    assert.deepEqual(snapshot.identities.affiliations.find(a => a.id === 'role-test').sources, evidence)
    assert.doesNotMatch(JSON.stringify(snapshot), /privateNote|Never export/)
    const broken = structuredClone(snapshot)
    broken.identities.affiliations[0].personId = 'missing'
    assert.throws(() => validateEcosystemSnapshot(broken), /affiliation/)
    const unsafe = structuredClone(snapshot)
    unsafe.identities.people[0].links[0].url = 'javascript:alert(1)'
    assert.throws(() => validateEcosystemSnapshot(unsafe), /person/)
    await db.prepare("UPDATE people SET visibility = 'withdrawn' WHERE id = ?").bind(profile.id).run()
    assert.equal((await exportSnapshot()).identities.affiliations.filter(a => a.personId === profile.id).length, 0)
    await db.prepare("UPDATE organization_relationships SET status = 'retracted' WHERE id = 'portfolio-test'").run()
    assert.equal((await exportSnapshot()).identities.organizationRelationships.filter(r => r.id === 'portfolio-test').length, 0)
  })
  assert.deepEqual((await db.prepare('PRAGMA foreign_key_check').all()).results, [])
})
