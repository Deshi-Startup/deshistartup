import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { unstable_splitSqlQuery } from 'wrangler'
import { createEcosystemHandler } from './ecosystem.ts'
import { parseDecision, parseProposal, parseIdeaProposal, parseIdeaDecision } from '../../app/lib/ecosystem-input.ts'
import { readEcosystemSnapshot, snapshotRowsSql } from '../../scripts/lib/ecosystem-snapshot.mjs'

// Use the emulator version owned by Wrangler, including its v5 option adapter.
const require = createRequire(import.meta.resolve('wrangler'))
const { Miniflare, convertV4MiniflareOptions } = require('miniflare')
const now = '2026-09-16T12:00:00.000Z'
const proposal = (changes = {}) => ({ version: 1, locale: 'en', problemId: 'produce-cold-chain', organizationId: 'org_dorik', organization: null, work: 'A public example of relevant work to investigate.', stage: 'research', evidenceUrl: 'https://example.com/evidence', ...changes })
const decision = (changes = {}) => ({ revision: 1, decision: 'approved', note: 'Identity and the stated connection checked.', organizationId: 'org_dorik', organization: null, work: { en: 'A reviewed description of relevant work on this problem.', bn: 'এই সমস্যা নিয়ে কোম্পানির কাজের তথ্য পর্যালোচনা করা হয়েছে।' }, ...changes })
const idea = (changes = {}) => ({ version: 1, kind: 'idea', locale: 'en', title: 'An idea for testing', solution: 'A small service that helps factories arrange equipment repairs.', customer: 'Small factory owners', problem: '', place: '', evidence: '', test: '', ...changes })
const ideaDecision = (changes = {}) => ({ revision: 1, decision: 'approved', note: 'Useful proposal, ready for editorial preparation.', ...changes })

test('submission parser rejects ambiguous identity and unsafe input', () => {
  assert.ok(parseProposal(proposal()))
  assert.equal(parseProposal(proposal({ organization: { name: 'Duplicate' } })), null)
  assert.equal(parseProposal(proposal({ evidenceUrl: 'javascript:alert(1)' })), null)
  assert.equal(parseProposal(proposal({ evidenceUrl: 'https://user:password@example.com/' })), null)
  assert.equal(parseProposal(proposal({ work: 'Too short' })), null)
  assert.equal(parseDecision(decision({ organizationId: '', organization: { slug: 'review', en: { name: 'Test', description: 'An adequate company description.' }, bn: { name: 'Test', description: 'An adequate company description.' } } })), null)
})

test('idea intake requires useful bounded copy and ignores untrusted workflow fields', () => {
  assert.ok(parseIdeaProposal(idea()))
  for (const changes of [{ title: ' ' }, { solution: 'Too short' }, { customer: '' }, { solution: 'x'.repeat(2001) }, { kind: 'company' }, { locale: 'fr' }]) {
    assert.equal(parseIdeaProposal(idea(changes)), null)
  }
  assert.deepEqual(parseIdeaProposal(idea({ status: 'approved', owner_hash: 'forged', title: '  An idea for testing  ' })), idea())
  assert.equal(parseProposal(proposal({ kind: 'idea' })), null)
  assert.equal(parseProposal(idea()), null)
  assert.equal(parseIdeaDecision(ideaDecision({ note: '' })), null)
  assert.equal(parseIdeaDecision(ideaDecision({ revision: 0 })), null)
})

test('D1 submission, review and public snapshot boundaries', { timeout: 90_000 }, async t => {
  const options = { modules: true, script: '', d1Databases: { DB: 'ecosystem-tests' } }
  const mf = new Miniflare(convertV4MiniflareOptions ? convertV4MiniflareOptions(options) : options)
  t.after(() => mf.dispose())
  const db = await mf.getD1Database('DB')
  // Read the directory so a new migration is exercised without editing this list.
  const migrations = fs.readdirSync(new URL('../migrations/ecosystem/', import.meta.url)).filter(name => name.endsWith('.sql')).sort()
  for (const file of migrations) {
    const sql = fs.readFileSync(new URL(`../migrations/ecosystem/${file}`, import.meta.url), 'utf8')
    await db.batch(unstable_splitSqlQuery(sql).map(statement => db.prepare(statement)))
  }
  const env = { ECOSYSTEM_DB: db, CONTRIBUTION_REVIEWER_EMAILS: 'reviewer@example.com' }
  const handler = createEcosystemHandler({
    authenticate: async request => {
      const role = request.headers.get('Authorization')
      return role ? { sub: role, email: `${role}@example.com`, name: role, picture: '' } : null
    }, admit: async () => true, now: () => now
  })
  const call = (path, role, body, key = 'test-idempotency-00001') => handler(new Request(`https://example.com/api/ecosystem/${path}`, {
    method: body ? 'POST' : 'GET', headers: { ...(role ? { Authorization: role } : {}), 'Content-Type': 'application/json', 'Idempotency-Key': key }, ...(body ? { body: JSON.stringify(body) } : {})
  }), env)
  const snapshot = async () => {
    const rows = JSON.parse((await db.prepare(snapshotRowsSql).first()).snapshot_rows)
    return readEcosystemSnapshot(sql => rows[sql.match(/FROM (\w+)/)[1]], 'release-test', now)
  }
  const initial = await snapshot()
  await t.test('retired preview records stay in D1 but cannot leak into a new release', async () => {
    assert.equal((await db.prepare("SELECT active FROM problems WHERE id = 'courier-settlement'").first()).active, 0)
    assert.ok(await db.prepare("SELECT id FROM approaches WHERE id = 'courier-settlement-approach'").first())
    assert.ok(!initial.problems.some(p => p.id === 'courier-settlement'))
    assert.ok(!initial.approaches.some(a => a.problemId === 'courier-settlement'))
    assert.ok(!initial.connections.some(c => c.problemId === 'courier-settlement'))
    assert.equal((await call('submissions', 'contributor', proposal({ problemId: 'courier-settlement' }), 'retired-submit-00001')).status, 409)
  })
  await t.test('anonymous and non-reviewer access stays private', async () => {
    assert.equal((await call('review')).status, 401)
    const denied = await call('review', 'contributor')
    assert.equal(denied.status, 403)
    assert.match(denied.headers.get('Cache-Control'), /no-store/)
    assert.equal((await call('submissions', null, proposal())).status, 401)
  })
  let submitted
  await t.test('concurrent retries create one private submission, not a public connection', async () => {
    const replies = await Promise.all([call('submissions', 'contributor', proposal()), call('submissions', 'contributor', proposal())])
    assert.deepEqual(replies.map(r => r.status), [201, 201])
    const [a, b] = await Promise.all(replies.map(r => r.json()))
    assert.equal(a.id, b.id); submitted = a
    assert.equal((await call('submissions', 'contributor', proposal({ work: 'Changed payload must not reuse an existing request key.' }))).status, 409)
    assert.equal((await call('submissions', 'other')).status, 200)
    assert.deepEqual((await (await call('submissions', 'other')).json()).submissions, [])
    assert.deepEqual(await snapshot(), initial)
  })
  await t.test('approval atomically links an existing identity and rejects a stale reviewer', async () => {
    const replies = await Promise.all([call(`review/${submitted.id}`, 'reviewer', decision()), call(`review/${submitted.id}`, 'reviewer', decision())])
    assert.deepEqual(replies.map(r => r.status).sort(), [200, 409])
    const approved = await snapshot()
    assert.equal(approved.organizations.length, initial.organizations.length)
    assert.equal(approved.connections.length, initial.connections.length + 1)
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM review_events').first()).n, 1)
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM mutation_guards').first()).n, 0)
    assert.doesNotMatch(JSON.stringify(approved), /owner_hash|reviewer_hash|decision_note|idempotency_key/)
    assert.equal(await db.prepare('SELECT * FROM publication').first(), null, 'approval is not publication')
  })
  await t.test('duplicate company/problem approval rolls back the entire decision', async () => {
    const duplicate = await (await call('submissions', 'contributor', proposal(), 'test-idempotency-00002')).json()
    assert.equal((await call(`review/${duplicate.id}`, 'reviewer', decision())).status, 409)
    assert.equal((await db.prepare('SELECT status FROM submissions WHERE id = ?').bind(duplicate.id).first()).status, 'pending')
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM mutation_guards').first()).n, 0)
    assert.equal((await call(`review/${duplicate.id}`, 'reviewer', decision({ decision: 'rejected', note: 'This company already has this problem connection.' }))).status, 200)
  })
  await t.test('new company approval creates one bilingual identity reused by a second connection', async () => {
    const incoming = proposal({ organizationId: '', organization: { name: 'Test Venture', website: 'https://example.com', description: 'An illustrative venture for this isolated integration test.', role: 'startup' } })
    const pending = await (await call('submissions', 'contributor', incoming, 'test-idempotency-00003')).json()
    assert.equal((await snapshot()).organizations.length, initial.organizations.length)
    const approve = decision({ organizationId: '', organization: { slug: 'test-venture', en: { name: 'Test Venture', description: 'An illustrative venture used only in this test.' }, bn: { name: 'টেস্ট ভেঞ্চার', description: 'এই পরীক্ষার জন্য তৈরি একটি কাল্পনিক কোম্পানি।' } } })
    assert.equal((await call(`review/${pending.id}`, 'reviewer', approve)).status, 200)
    const company = (await snapshot()).organizations.find(o => o.slug === 'test-venture')
    assert.ok(company.en.name && company.bn.name)
    const second = await (await call('submissions', 'contributor', proposal({ problemId: 'garment-offcuts', organizationId: company.id }), 'test-idempotency-00004')).json()
    assert.equal((await call(`review/${second.id}`, 'reviewer', decision({ organizationId: company.id }))).status, 200)
    const final = await snapshot()
    assert.equal(final.organizations.filter(o => o.slug === 'test-venture').length, 1)
    assert.equal(final.connections.filter(c => c.organizationId === company.id).length, 2)
  })
  await t.test('retiring a problem after submission prevents approval but still allows a decision', async () => {
    const pending = await (await call('submissions', 'contributor', proposal({ problemId: 'solar-maintenance' }), 'retired-review-00001')).json()
    await db.prepare("UPDATE problems SET active = 0 WHERE id = 'solar-maintenance'").run()
    assert.equal((await call(`review/${pending.id}`, 'reviewer', decision())).status, 409)
    assert.equal((await db.prepare('SELECT status FROM submissions WHERE id = ?').bind(pending.id).first()).status, 'pending')
    assert.equal((await call(`review/${pending.id}`, 'reviewer', decision({ decision: 'rejected' }))).status, 200)
    await db.prepare("UPDATE problems SET active = 1 WHERE id = 'solar-maintenance'").run()
  })
  await t.test('rate limits and absent D1 fail closed', async () => {
    const limited = createEcosystemHandler({ authenticate: async () => ({ sub: 'limited', email: 'limited@example.com' }), admit: async () => false })
    assert.equal((await limited(new Request('https://example.com/api/ecosystem/submissions', { method: 'POST' }), env)).status, 429)
    assert.equal((await handler(new Request('https://example.com/api/ecosystem/review'), {})).status, 503)
  })
  await t.test('publication uses a frozen release and approval alone never changes it', async () => {
    const approved = await snapshot()
    await db.prepare('INSERT INTO releases (id, snapshot_json, digest, created_at) VALUES (?, ?, ?, ?)').bind('before', JSON.stringify(initial), 'test-before', now).run()
    await db.prepare('INSERT INTO publication (singleton, release_id) VALUES (1, ?)').bind('before').run()
    let own = (await (await call('submissions', 'contributor')).json()).submissions.find(s => s.id === submitted.id)
    assert.equal(own.status, 'approved')
    assert.equal(own.published, 0)
    await assert.rejects(db.prepare('UPDATE publication SET release_id = ? WHERE singleton = 1').bind('missing-release').run())
    assert.equal((await db.prepare('SELECT release_id FROM publication').first()).release_id, 'before')
    await db.prepare('INSERT INTO releases (id, snapshot_json, digest, created_at) VALUES (?, ?, ?, ?)').bind('after', JSON.stringify(approved), 'test-after', now).run()
    await db.prepare('UPDATE publication SET release_id = ? WHERE singleton = 1').bind('after').run()
    own = (await (await call('submissions', 'contributor')).json()).submissions.find(s => s.id === submitted.id)
    assert.equal(own.published, 1)
    assert.equal(JSON.parse((await db.prepare('SELECT snapshot_json FROM releases WHERE id = ?').bind('before').first()).snapshot_json).connections.length, initial.connections.length)
    await db.prepare('UPDATE publication SET release_id = ? WHERE singleton = 1').bind('before').run()
    assert.equal((await (await call('submissions', 'contributor')).json()).submissions.find(s => s.id === submitted.id).published, 0)
  })
  await t.test('idea submissions are private, owner scoped and safe to retry', async () => {
    const before = await snapshot()
    assert.equal((await call('submissions', null, idea())).status, 401)
    assert.equal((await call('submissions', 'idea-author', idea({ solution: 'short' }))).status, 400)
    const replies = await Promise.all([call('submissions', 'idea-author', idea(), 'idea-retry-00000001'), call('submissions', 'idea-author', idea(), 'idea-retry-00000001')])
    assert.deepEqual(replies.map(r => r.status), [201, 201])
    const [a, b] = await Promise.all(replies.map(r => r.json()))
    assert.equal(a.id, b.id)
    assert.equal((await call('submissions', 'idea-author', idea({ title: 'Changed proposal' }), 'idea-retry-00000001')).status, 409)
    assert.deepEqual((await (await call('submissions?kind=idea', 'other')).json()).submissions, [])
    assert.deepEqual((await (await call('submissions', 'idea-author')).json()).submissions, [])
    const own = (await (await call('submissions?kind=idea', 'idea-author')).json()).submissions
    assert.equal(own.length, 1)
    assert.equal(own[0].payload.kind, 'idea')
    assert.equal(own[0].status, 'pending')
    assert.doesNotMatch(JSON.stringify(own), /owner_hash|payload_hash|idempotency_key/)
    assert.deepEqual(await snapshot(), before)
  })
  await t.test('accepting an idea is one audited editorial decision, not public data', async () => {
    const before = await snapshot()
    const pending = (await (await call('submissions?kind=idea', 'idea-author')).json()).submissions[0]
    assert.equal((await call(`review/${pending.id}`, 'idea-author', ideaDecision())).status, 403)
    assert.equal((await call(`review/${pending.id}`, 'reviewer', ideaDecision({ note: '' }))).status, 400)
    const replies = await Promise.all([call(`review/${pending.id}`, 'reviewer', ideaDecision()), call(`review/${pending.id}`, 'reviewer', ideaDecision())])
    assert.deepEqual(replies.map(r => r.status).sort(), [200, 409])
    const accepted = await replies.find(r => r.status === 200).json()
    assert.equal(accepted.publication, 'editorial-preparation')
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM review_events WHERE submission_id = ?').bind(pending.id).first()).n, 1)
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM mutation_guards').first()).n, 0)
    assert.deepEqual(await snapshot(), before)
    assert.equal((await db.prepare('SELECT release_id FROM publication').first()).release_id, 'before')
    const own = (await (await call('submissions?kind=idea', 'idea-author')).json()).submissions[0]
    assert.equal(own.status, 'approved')
    assert.equal(own.revision, 2)
    assert.equal(own.decision_note, ideaDecision().note)
    assert.equal(own.published, 0)
  })
  await t.test('idea decisions cannot bypass company review requirements', async () => {
    const pendingCompany = await (await call('submissions', 'contributor', proposal(), 'company-kind-000001')).json()
    assert.equal((await call(`review/${pendingCompany.id}`, 'reviewer', ideaDecision())).status, 400)
    assert.equal((await db.prepare('SELECT status FROM submissions WHERE id = ?').bind(pendingCompany.id).first()).status, 'pending')
    const pendingIdea = await (await call('submissions', 'idea-author', idea(), 'idea-decline-000001')).json()
    assert.equal((await call(`review/${pendingIdea.id}`, 'reviewer', ideaDecision({ decision: 'rejected' }))).status, 200)
    assert.equal((await db.prepare('SELECT status FROM submissions WHERE id = ?').bind(pendingIdea.id).first()).status, 'rejected')
    const queue = (await (await call('review', 'reviewer')).json()).submissions
    assert.ok(!queue.some(s => s.id === pendingIdea.id))
  })
})
