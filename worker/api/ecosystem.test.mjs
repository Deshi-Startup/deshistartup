import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { unstable_splitSqlQuery } from 'wrangler'
import { createEcosystemHandler } from './ecosystem.ts'
import { notifyEditorial, deliverNotifications } from '../lib/ecosystem-email.ts'
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

test('editorial alerts have a fixed destination, safe copy and a trusted review link', async () => {
  const sent = []
  const env = { CONTACT_INBOX: 'verified-editorial@example.com', CONTACT_EMAIL: { send: async message => { sent.push(message) } } }
  const title = '<img src=x onerror=alert(1)>\r\nBcc: stranger@example.com'
  await notifyEditorial(env, null, 'submission_test', idea({ title, to: 'stranger@example.com' }))
  const alert = sent[0]
  assert.equal(alert.to, 'verified-editorial@example.com')
  assert.equal(alert.from.email, 'contact@deshistartup.com')
  assert.doesNotMatch(alert.subject, /[\r\n]/)
  assert.doesNotMatch(alert.html, /<img/)
  assert.match(alert.html, /&lt;img/)
  assert.match(alert.text, /https:\/\/deshistartup\.com\/en\/startup-ideas\/review/)
  assert.match(alert.html, /href="https:\/\/deshistartup\.com\/en\/startup-ideas\/review\?submission=submission_test"/)
  assert.doesNotMatch(alert.text, /Small factory owners|equipment repairs/)
  await notifyEditorial(env, null, 'submission_company', proposal({ organizationId: '', organization: { name: 'New Company', website: 'https://example.com', description: 'Company details', role: 'startup' } }))
  assert.match(sent[1].subject, /New company submission: New Company/)
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
  const sent = []
  const env = { ECOSYSTEM_DB: db, CONTRIBUTION_REVIEWER_EMAILS: 'reviewer@example.com', CONTACT_INBOX: 'verified-editorial@example.com', CONTACT_EMAIL: { send: async message => { sent.push(message) } } }
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
  await t.test('public vote caching shares one release key and never caches private reads', async () => {
    const entries = new Map()
    let reads = 0
    const cached = createEcosystemHandler({
      authenticate: async () => null,
      cache: {
        match: async request => entries.get(request.url)?.clone(),
        put: async (request, response) => { entries.set(request.url, response.clone()) }
      }
    })
    const counted = { ...env, ECOSYSTEM_DB: { prepare(sql) { reads++; return db.prepare(sql) } } }
    const read = path => cached(new Request(`https://example.com/api/ecosystem/${path}`), counted)
    assert.equal((await read('votes?nonce=one')).status, 200)
    assert.equal((await read('votes?nonce=two')).status, 200)
    assert.equal(reads, 1)
    assert.equal(entries.size, 1)
    const privateResponse = await read('votes/mine')
    assert.equal(privateResponse.status, 401)
    assert.match(privateResponse.headers.get('Cache-Control'), /no-store/)
    assert.equal(entries.size, 1)
  })

  await t.test('votes are public counts, private choices and idempotent authenticated writes', async () => {
    const publicResponse = await call('votes')
    assert.equal(publicResponse.status, 200)
    assert.equal(publicResponse.headers.get('Cache-Control'), 'public, max-age=60')
    const before = await publicResponse.json()
    assert.equal(before.counts['harvest-cooling'], 0)
    assert.equal(Object.hasOwn(before.counts, 'courier-settlement-approach'), false)
    assert.equal((await call('votes/mine')).status, 401)
    assert.equal((await call('votes', null, { id: 'harvest-cooling', voted: true })).status, 401)
    const responses = await Promise.all([1, 2].map(() => call('votes', 'voter', { id: 'harvest-cooling', voted: true })))
    for (const response of responses) assert.deepEqual(await response.json(), { id: 'harvest-cooling', voted: true, count: 1 })
    assert.deepEqual(await (await call('votes', 'another-voter', { id: 'harvest-cooling', voted: true })).json(), { id: 'harvest-cooling', voted: true, count: 2 })
    const mine = await call('votes/mine', 'voter')
    assert.match(mine.headers.get('Cache-Control'), /private, no-store/)
    const mineBody = await mine.json()
    assert.deepEqual(mineBody.voted, ['harvest-cooling'])
    assert.equal(mineBody.counts['harvest-cooling'], 2)
    assert.deepEqual((await (await call('votes/mine', 'unrelated')).json()).voted, [])
    assert.equal((await (await call('votes')).json()).counts['harvest-cooling'], 2)
    const firstDate = (await db.prepare("SELECT created_at FROM idea_votes WHERE approach_id = 'harvest-cooling' LIMIT 1").first()).created_at
    for (const voted of [false, false, true, false]) {
      const response = await call('votes', 'voter', { id: 'harvest-cooling', voted })
      assert.match(response.headers.get('Cache-Control'), /private, no-store/)
      assert.deepEqual(await response.json(), { id: 'harvest-cooling', voted, count: voted ? 2 : 1 })
    }
    assert.equal((await db.prepare("SELECT created_at FROM idea_votes WHERE approach_id = 'harvest-cooling' LIMIT 1").first()).created_at, firstDate)
    assert.deepEqual(await snapshot(), initial, 'live votes and voter identity must never enter a static release')
    assert.doesNotMatch(JSON.stringify(await (await call('votes')).json()), /owner|voter|email|created/)
  })
  await t.test('voting cannot expose unpublished records or bypass input, retirement and admission controls', async () => {
    for (const id of ['not-a-real-idea', 'courier-settlement-approach']) assert.equal((await call('votes', 'voter', { id, voted: true })).status, 404)
    await db.prepare("INSERT INTO approaches (id, problem_id, kind, added_at) VALUES ('unpublished-test', 'produce-cold-chain', 'service', '2026-09-19')").run()
    assert.equal((await call('votes', 'voter', { id: 'unpublished-test', voted: true })).status, 404)
    assert.equal(Object.hasOwn((await (await call('votes')).json()).counts, 'unpublished-test'), false)
    await db.prepare("DELETE FROM approaches WHERE id = 'unpublished-test'").run()
    await db.prepare("UPDATE problems SET active = 0 WHERE id = 'produce-cold-chain'").run()
    assert.equal((await call('votes', 'voter', { id: 'harvest-cooling', voted: true })).status, 404)
    assert.equal(Object.hasOwn((await (await call('votes')).json()).counts, 'harvest-cooling'), false)
    assert.deepEqual((await (await call('votes/mine', 'another-voter')).json()).voted, [])
    await db.prepare("UPDATE problems SET active = 1 WHERE id = 'produce-cold-chain'").run()
    for (const body of [{ id: 'harvest-cooling', voted: 'true' }, { id: '../bad', voted: true }, { id: 'harvest-cooling' }]) assert.equal((await call('votes', 'voter', body)).status, 400)
    assert.equal((await call('votes', 'voter', { id: 'harvest-cooling', voted: true, padding: 'x'.repeat(600) })).status, 413)
    const limited = createEcosystemHandler({ authenticate: async () => ({ sub: 'limited', email: 'limited@example.com' }), admit: async () => false })
    assert.equal((await limited(new Request('https://example.com/api/ecosystem/votes', { method: 'POST', body: JSON.stringify({ id: 'harvest-cooling', voted: true }) }), env)).status, 429)
    assert.equal((await handler(new Request('https://example.com/api/ecosystem/votes'), {})).status, 503)
  })
  await t.test('voting uses its own allowance and still respects account moderation', async () => {
    let votes = 0, contributions = 0
    const liveAdmission = createEcosystemHandler({ authenticate: async () => ({ sub: 'vote-quota', email: 'vote-quota@example.com' }) })
    const rateEnv = { ...env, CONTRIBUTION_GUARDS: { get: async () => null },
      IDEA_VOTE_RATE: { limit: async () => { votes++; return { success: true } } },
      CONTRIBUTION_USER_RATE: { limit: async () => { contributions++; return { success: false } } }
    }
    const request = () => new Request('https://example.com/api/ecosystem/votes', { method: 'POST', body: JSON.stringify({ id: 'solar-upkeep', voted: true }), headers: { 'Content-Type': 'application/json' } })
    assert.equal((await liveAdmission(request(), rateEnv)).status, 200)
    assert.equal(votes, 1); assert.equal(contributions, 0)
    const moderated = createEcosystemHandler({ authenticate: async () => ({ sub: 'banned-voter', email: 'banned-voter@example.com' }) })
    assert.equal((await moderated(request(), { ...rateEnv, CONTRIBUTION_GUARDS: { get: async () => ({ status: 'banned' }) } })).status, 429)
    assert.equal(votes, 1, 'moderation must reject before calling the vote limiter')
  })
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
    const alertsBefore = sent.length
    const replies = await Promise.all([call('submissions', 'contributor', proposal()), call('submissions', 'contributor', proposal())])
    assert.deepEqual(replies.map(r => r.status), [201, 201])
    const [a, b] = await Promise.all(replies.map(r => r.json()))
    assert.equal(a.id, b.id); submitted = a
    assert.equal(sent.length, alertsBefore + 1, 'only the request that inserts the row sends an alert')
    assert.match(sent.at(-1).subject, /New company submission: Dorik/)
    await call('submissions', 'contributor', proposal())
    assert.equal((await call('submissions', 'contributor', proposal({ work: 'Changed payload must not reuse an existing request key.' }))).status, 409)
    assert.equal((await call('submissions', 'other')).status, 200)
    assert.deepEqual((await (await call('submissions', 'other')).json()).submissions, [])
    assert.deepEqual(await snapshot(), initial)
    assert.equal(sent.length, alertsBefore + 1, 'retries, reads and rejected requests do not send alerts')
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
    const version = (await (await call('review', 'reviewer')).json()).organizationVersion
    const approve = decision({ organizationVersion: version, organizationId: '', organization: { slug: 'test-venture', en: { name: 'Test Venture', description: 'An illustrative venture used only in this test.' }, bn: { name: 'টেস্ট ভেঞ্চার', description: 'এই পরীক্ষার জন্য তৈরি একটি কাল্পনিক কোম্পানি।' } } })
    assert.equal((await call(`review/${pending.id}`, 'reviewer', approve)).status, 200)
    const duplicate = await (await call('submissions', 'other-contributor', incoming, 'duplicate-identity-00001')).json()
    const stale = { ...approve, organization: { ...approve.organization, slug: 'test-venture-alias' } }
    assert.equal((await call(`review/${duplicate.id}`, 'reviewer', stale)).status, 409)
    assert.equal((await db.prepare('SELECT status FROM submissions WHERE id = ?').bind(duplicate.id).first()).status, 'pending')
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM mutation_guards').first()).n, 0)
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
    const alertsBefore = sent.length
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
    assert.equal(sent.length, alertsBefore + 1, 'one alert for a new idea, none for invalid input or concurrent retries')
    assert.match(sent.at(-1).subject, /New idea: An idea for testing/)
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
  await t.test('email failure preserves the submission and logs no private message content', async t => {
    const errors = []
    t.mock.method(console, 'error', entry => errors.push(JSON.parse(entry)))
    const original = env.CONTACT_EMAIL
    t.after(() => { env.CONTACT_EMAIL = original })
    env.CONTACT_EMAIL = { send: async () => { throw new Error('Private provider details must not be logged') } }
    const response = await call('submissions', 'mail-failure-author', idea(), 'mail-failure-000001')
    assert.equal(response.status, 201)
    const result = await response.json()
    assert.deepEqual(Object.keys(result).sort(), ['id', 'status'])
    assert.equal((await db.prepare('SELECT status FROM submissions WHERE id = ?').bind(result.id).first()).status, 'pending')
    assert.deepEqual(errors, [{ level: 'error', scope: 'ecosystem', message: 'notification_failed', submissionId: result.id, kind: 'editorial', code: 'email_send_failed' }])
  })
  await t.test('background mail does not delay the submission response', async t => {
    let finish
    const mail = new Promise(resolve => { finish = resolve })
    const original = env.CONTACT_EMAIL
    t.after(() => { finish(); env.CONTACT_EMAIL = original })
    env.CONTACT_EMAIL = { send: () => mail }
    const pending = []
    const response = await handler(new Request('https://example.com/api/ecosystem/submissions', {
      method: 'POST', headers: { Authorization: 'background-author', 'Content-Type': 'application/json', 'Idempotency-Key': 'background-000001' }, body: JSON.stringify(idea())
    }), env, { waitUntil: task => pending.push(task) })
    assert.equal(response.status, 201)
    assert.equal(pending.length, 1)
    finish()
    await Promise.all(pending)
  })
  await t.test('review history and direct links remain private after a decision', async () => {
    const own = (await (await call('submissions?kind=idea', 'idea-author')).json()).submissions.find(s => s.status === 'approved')
    const accepted = await (await call('review?status=approved', 'reviewer')).json()
    assert.ok(accepted.submissions.some(s => s.id === own.id && s.decision_note))
    assert.equal((await call('review?status=approved', 'idea-author')).status, 403)
    const direct = await (await call(`review?submission=${own.id}`, 'reviewer')).json()
    assert.equal(direct.selected.id, own.id)
    const privateResponse = await call(`submissions?kind=idea&submission=${own.id}`, 'stranger')
    assert.equal((await privateResponse.json()).selected, null)
    assert.match(privateResponse.headers.get('Cache-Control'), /no-store/)
    assert.doesNotMatch(JSON.stringify(direct), /owner_hash|idempotency_key|payload_hash|@example.com/)
  })
  await t.test('idea history paginates without losing equal-time submissions', async () => {
    for (let i = 0; i < 33; i++) await call('submissions', 'history-author', idea({ title: `History idea ${i}` }), `history-submission-${String(i).padStart(3, '0')}`)
    const first = await (await call('submissions?kind=idea', 'history-author')).json()
    assert.equal(first.submissions.length, 30)
    assert.ok(first.nextCursor)
    const second = await (await call(`submissions?kind=idea&before=${encodeURIComponent(first.nextCursor)}`, 'history-author')).json()
    assert.equal(second.submissions.length, 3)
    assert.equal(new Set([...first.submissions, ...second.submissions].map(s => s.id)).size, 33)
    assert.equal(second.nextCursor, null)
  })
  await t.test('decision emails use only verified account contacts and safe localized copy', async t => {
    env.IDEA_DECISION_EMAILS = 'true'
    t.after(() => { delete env.IDEA_DECISION_EMAILS })
    const result = await (await call('submissions', 'email-author', idea({ locale: 'bn', email: 'attacker@example.com', title: '<script>idea</script>' }), 'decision-contact-001')).json()
    const contact = await db.prepare('SELECT email FROM submission_contacts WHERE submission_id = ?').bind(result.id).first()
    assert.equal(contact.email, 'email-author@example.com')
    const before = sent.length
    const responses = await Promise.all([1, 2].map(() => call(`review/${result.id}`, 'reviewer', ideaDecision({ decision: 'rejected', note: '<script>Reviewer note</script>' }))))
    assert.deepEqual(responses.map(r => r.status).sort(), [200,409])
    assert.equal(sent.length, before + 1)
    const mail = sent.at(-1)
    assert.equal(mail.to, 'email-author@example.com')
    assert.match(mail.text, /গ্রহণ|সিদ্ধান্ত/)
    assert.match(mail.text, new RegExp('startup-ideas/submissions\\?submission=' + result.id))
    assert.doesNotMatch(mail.html, /<script>/)
    const own = await (await call(`submissions?kind=idea&submission=${result.id}`, 'email-author')).json()
    assert.equal(own.selected.status, 'rejected')
    assert.doesNotMatch(JSON.stringify(own), /email-author@example.com|attacker@example.com/)
    assert.doesNotMatch(JSON.stringify(await snapshot()), /email-author@example.com|Reviewer note|submission_notifications|submission_contacts/)
  })
  await t.test('delivery capability controls the promise and private contact collection', async () => {
    assert.equal((await (await call('status')).json()).decisionEmails, false)
    const result = await (await call('submissions', 'no-email-author', idea(), 'no-email-contact-001')).json()
    assert.equal(await db.prepare('SELECT email FROM submission_contacts WHERE submission_id = ?').bind(result.id).first(), null)
  })
  await t.test('failed alerts retry durably with one concurrent dispatcher', async t => {
    const original = env.CONTACT_EMAIL
    t.after(() => { env.CONTACT_EMAIL = original })
    env.CONTACT_EMAIL = { send: async () => { throw new Error('provider private error') } }
    const result = await (await call('submissions', 'retry-author', idea(), 'durable-retry-00001')).json()
    let job = await db.prepare('SELECT * FROM submission_notifications WHERE submission_id = ?').bind(result.id).first()
    assert.equal(job.state, 'pending'); assert.equal(job.attempts, 1)
    env.CONTACT_EMAIL = original
    const before = sent.length
    await Promise.all([deliverNotifications(env, job.available_at, result.id), deliverNotifications(env, job.available_at, result.id)])
    assert.equal(sent.length, before + 1)
    job = await db.prepare('SELECT * FROM submission_notifications WHERE submission_id = ?').bind(result.id).first()
    assert.equal(job.state, 'sent'); assert.equal(job.attempts, 2)
  })
  await t.test('permanent email errors stop automatically and retry requires review access', async t => {
    const original = env.CONTACT_EMAIL
    t.after(() => { env.CONTACT_EMAIL = original })
    env.CONTACT_EMAIL = { send: async () => { throw Object.assign(new Error('private address'), { code: 'E_RECIPIENT_NOT_ALLOWED' }) } }
    const result = await (await call('submissions', 'permanent-email-author', idea(), 'permanent-email-001')).json()
    assert.equal((await db.prepare('SELECT state FROM submission_notifications WHERE submission_id = ?').bind(result.id).first()).state, 'failed')
    assert.equal((await call(`review/${result.id}/retry-email`, 'permanent-email-author', {})).status, 403)
    env.CONTACT_EMAIL = original
    const before = sent.length
    assert.equal((await call(`review/${result.id}/retry-email`, 'reviewer', {})).status, 200)
    assert.equal(sent.length, before + 1)
    await call(`review/${result.id}/retry-email`, 'reviewer', {})
    assert.equal(sent.length, before + 1, 'already-sent messages cannot be resent with the retry action')
  })
  await t.test('publication links require an accepted idea and an actually published record', async t => {
    env.IDEA_DECISION_EMAILS = 'true'
    t.after(() => { delete env.IDEA_DECISION_EMAILS })
    const result = await (await call('submissions', 'publication-author', idea(), 'publication-link-001')).json()
    const link = (revision, ideaId = 'solar-upkeep') => ({ revision, ideaId })
    assert.equal((await call(`review/${result.id}/publication`, 'reviewer', link(1))).status, 409)
    await call(`review/${result.id}`, 'reviewer', ideaDecision())
    assert.equal((await call(`review/${result.id}/publication`, 'publication-author', link(2))).status, 403)
    assert.equal((await call(`review/${result.id}/publication`, 'reviewer', link(2, 'not-published'))).status, 409)
    const before = await snapshot(), emailsBefore = sent.length
    const response = await call(`review/${result.id}/publication`, 'reviewer', link(2))
    assert.equal(response.status, 200)
    assert.equal(sent.length, emailsBefore + 1)
    assert.match(sent.at(-1).text, /https:\/\/deshistartup.com\/en\/startup-ideas\/solar-upkeep/)
    assert.equal((await call(`review/${result.id}/publication`, 'reviewer', link(2))).status, 409)
    const own = await (await call(`submissions?kind=idea&submission=${result.id}`, 'publication-author')).json()
    assert.equal(own.selected.published, 1)
    assert.equal(own.selected.idea_id, 'solar-upkeep')
    assert.deepEqual(await snapshot(), before, 'private workflow linkage must not change public data')
  })

  await t.test('publication mail stops after rollback and can be retried after the idea returns', async t => {
    const originalEmail = env.CONTACT_EMAIL
    const release = await db.prepare('SELECT r.id, r.snapshot_json FROM publication p JOIN releases r ON r.id = p.release_id').first()
    env.IDEA_DECISION_EMAILS = 'true'
    t.after(async () => {
      env.CONTACT_EMAIL = originalEmail
      delete env.IDEA_DECISION_EMAILS
      await db.prepare('UPDATE publication SET release_id = ? WHERE singleton = 1').bind(release.id).run()
    })
    const errors = []
    t.mock.method(console, 'error', entry => errors.push(JSON.parse(entry)))
    const result = await (await call('submissions', 'rollback-author', idea(), 'publication-rollback-001')).json()
    await call(`review/${result.id}`, 'reviewer', ideaDecision())
    env.CONTACT_EMAIL = { send: async () => { throw new Error('Temporary provider failure') } }
    assert.equal((await call(`review/${result.id}/publication`, 'reviewer', { revision: 2, ideaId: 'solar-upkeep' })).status, 200)
    const job = await db.prepare("SELECT * FROM submission_notifications WHERE submission_id = ? AND kind = 'published'").bind(result.id).first()
    assert.equal(job.state, 'pending')

    const rolledBack = JSON.parse(release.snapshot_json)
    rolledBack.approaches = rolledBack.approaches.filter(row => row.id !== 'solar-upkeep')
    await db.prepare('INSERT INTO releases (id, snapshot_json, digest, created_at) VALUES (?, ?, ?, ?)').bind('publication-rollback', JSON.stringify(rolledBack), 'test-rollback', now).run()
    await db.prepare('UPDATE publication SET release_id = ? WHERE singleton = 1').bind('publication-rollback').run()
    env.CONTACT_EMAIL = originalEmail
    const sentBefore = sent.length
    await deliverNotifications(env, job.available_at, result.id)
    const stopped = await db.prepare("SELECT * FROM submission_notifications WHERE submission_id = ? AND kind = 'published'").bind(result.id).first()
    assert.equal(sent.length, sentBefore, 'a rolled-back idea must never be announced as currently published')
    assert.equal(stopped.state, 'failed')
    assert.equal(stopped.error_code, 'publication_unavailable')
    assert.equal(stopped.sent_at, null)
    assert.equal(stopped.lease, null)
    assert.deepEqual(errors.at(-1), { level: 'error', scope: 'ecosystem', message: 'notification_failed', submissionId: result.id, kind: 'published', code: 'publication_unavailable' })
    await deliverNotifications(env, stopped.available_at, result.id)
    assert.equal(sent.length, sentBefore, 'stopped publication notices need a reviewer retry')

    await db.prepare('UPDATE publication SET release_id = ? WHERE singleton = 1').bind(release.id).run()
    assert.equal((await call(`review/${result.id}/retry-email`, 'reviewer', {})).status, 200)
    assert.equal(sent.length, sentBefore + 1)
    assert.match(sent.at(-1).text, /https:\/\/deshistartup.com\/en\/startup-ideas\/solar-upkeep/)
    const delivered = await db.prepare("SELECT state, error_code FROM submission_notifications WHERE submission_id = ? AND kind = 'published'").bind(result.id).first()
    assert.deepEqual(delivered, { state: 'sent', error_code: null })
  })

  await t.test('expired dispatch leases stop at the bounded attempt limit', async () => {
    const result = await (await call('submissions', 'lease-author', idea(), 'expired-lease-00001')).json()
    await db.prepare("UPDATE submission_notifications SET state = 'sending', attempts = 5, available_at = ?, lease = 'expired', sent_at = NULL WHERE submission_id = ?").bind(now, result.id).run()
    const before = sent.length
    await deliverNotifications(env, now, result.id)
    assert.equal(sent.length, before)
    assert.equal((await db.prepare('SELECT state FROM submission_notifications WHERE submission_id = ?').bind(result.id).first()).state, 'failed')
  })

})
