import { requireUser, type GoogleUser } from '../lib/google-token.ts'
import { contributorHash, getContributionBindings, isReviewer, moderationFor, sha256Hex } from '../lib/contribution-guard.ts'
import { authenticatedJson as json } from '../lib/http.ts'
import { readBoundedJson } from '../lib/request-body.ts'
import { parseDecision, parseProposal, parseIdeaProposal, parseIdeaEditProposal, parseIdeaDecision, validEntityId } from '../../app/lib/ecosystem-input.ts'
import { createSubmission, decideSubmission, EcosystemConflict } from '../lib/ecosystem-store.ts'
import { logError } from '../lib/logging.ts'
import { deliverNotifications, decisionEmailsEnabled } from '../lib/ecosystem-email.ts'
import { submissionHistory, publishedIdeas, linkPublishedIdea, linkPublishedIdeaEdit, closeAcceptedIdea } from '../lib/submission-history.ts'
import { myVotes, setIdeaVote, voteCounts } from '../lib/idea-votes.ts'
import release from '../../public/ecosystem-release.json' with { type: 'json' }
import type { EcosystemSnapshot } from '../../app/lib/ecosystem-types.ts'

type Environment = CloudflareEnv & { ECOSYSTEM_DB?: D1Database; IDEA_DECISION_EMAILS?: string }
async function admitted(env: Environment, user: GoogleUser, voting = false) {
  const owner = await contributorHash(user)
  const state = await moderationFor(getContributionBindings(env), owner)
  if (state.status !== 'active') return false
  const limiter = voting ? env.IDEA_VOTE_RATE : env.CONTRIBUTION_USER_RATE
  return (await limiter.limit({ key: owner })).success
}
interface Dependencies {
  authenticate?: typeof requireUser
  admit?: typeof admitted
  now?: () => string
  cache?: Cache
  deployedReleaseId?: string
}
export function createEcosystemHandler({ authenticate = requireUser, admit = admitted, now = () => new Date().toISOString(), cache, deployedReleaseId = release.releaseId }: Dependencies = {}) {
  return async function ecosystem(request: Request, env: Environment, context?: Pick<ExecutionContext, 'waitUntil'>): Promise<Response> {
    const path = new URL(request.url).pathname.replace(/\/+$/, '')
    if (path === '/api/ecosystem/status' && request.method === 'GET') return json({ available: !!env.ECOSYSTEM_DB, decisionEmails: decisionEmailsEnabled(env) }, 200)
    if (!env.ECOSYSTEM_DB) return json({ error: 'ecosystem_unavailable' }, 503)
    try {
      const db = env.ECOSYSTEM_DB
      const notify = async (id: string) => {
        const task = deliverNotifications(env, now(), id).catch(() => logError('ecosystem', 'notification_dispatch_failed', undefined, { submissionId: id }))
        if (context) context.waitUntil(task)
        else await task
      }
      if (path === '/api/ecosystem/votes' && request.method === 'GET') {
        // One shared entry per release and edge location, independent of client query strings.
        const key = new Request(`${new URL(request.url).origin}/api/ecosystem/votes?release=${release.releaseId}`)
        const cached = await cache?.match(key).catch(() => undefined)
        if (cached) return cached
        const response = Response.json({ counts: await voteCounts(db) }, { headers: { 'Cache-Control': 'public, max-age=60' } })
        await cache?.put(key, response.clone()).catch(() => {})
        return response
      }
      const user = await authenticate(request, env)
      if (!user?.sub) return json({ error: 'unauthorized' }, 401)
      const owner = await contributorHash(user)
      if (path === '/api/ecosystem/votes/mine' && request.method === 'GET') {
        // A recent voter gets fresh counts even if the public response is cached.
        const [voted, counts] = await Promise.all([myVotes(db, owner), voteCounts(db)])
        return json({ voted, counts })
      }
      if (path === '/api/ecosystem/votes') {
        if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'GET, POST', 'Cache-Control': 'no-store' } })
        if (!(await admit(env, user, true))) return json({ error: 'rate_limited' }, 429)
        const body = await readBoundedJson(request, 512)
        if (!body.ok) return json({ error: body.error }, body.error === 'body_too_large' ? 413 : 400)
        const value = body.value as { id?: unknown; voted?: unknown } | null
        if (!value || typeof value.id !== 'string' || !validEntityId(value.id) || typeof value.voted !== 'boolean') return json({ error: 'invalid_vote' }, 400)
        const vote = await setIdeaVote(db, owner, value.id, value.voted, now())
        return vote ? json(vote) : json({ error: 'idea_not_found' }, 404)
      }
      const reviewer = isReviewer(user, env)
      if (path === '/api/ecosystem/submissions' && request.method === 'GET') {
        return json({ ...await submissionHistory(db, new URL(request.url).searchParams, owner), canReview: reviewer })
      }
      if (path === '/api/ecosystem/review' && request.method === 'GET') {
        if (!reviewer) return json({ error: 'forbidden' }, 403)
        const history = await submissionHistory(db, new URL(request.url).searchParams, null)
        const organizations = await db.prepare("SELECT o.id, o.slug, o.website, t.name, MAX(o.rowid) OVER () AS version FROM organizations o JOIN organization_text t ON t.organization_id = o.id AND t.locale = 'en' ORDER BY t.name LIMIT 1000").all<{ id: string; slug: string; website: string; name: string; version: number }>()
        return json({ ...history, organizations: organizations.results.map(({ version, ...company }) => company), organizationVersion: organizations.results[0]?.version ?? 0, publishedIdeas: await publishedIdeas(db, new URL(request.url).searchParams.get('locale') || 'en') })
      }
      const action = path.match(/^\/api\/ecosystem\/review\/([^/]+)\/(publication|publication-edit|close|retry-email)$/)
      if (action) {
        if (!reviewer) return json({ error: 'forbidden' }, 403)
        if (request.method !== 'POST') {
          const response = json({ error: 'method_not_allowed' }, 405)
          response.headers.set('Allow', 'POST')
          return response
        }
        if (!validEntityId(action[1])) return json({ error: 'not_found' }, 404)
        if (!(await admit(env, user))) return json({ error: 'rate_limited' }, 429)
        if (action[2] === 'publication') {
          const body = await readBoundedJson(request, 512)
          if (!body.ok) return json({ error: body.error }, body.error === 'body_too_large' ? 413 : 400)
          const value = body.value as { ideaId?: unknown; revision?: unknown } | null
          if (!value || typeof value.ideaId !== 'string' || !validEntityId(value.ideaId) || typeof value.revision !== 'number' || !Number.isSafeInteger(value.revision) || value.revision < 1) return json({ error: 'invalid_publication_link' }, 400)
          const result = await linkPublishedIdea(db, action[1], value.ideaId, value.revision, owner, now())
          await notify(action[1])
          return json(result)
        }
        if (action[2] === 'publication-edit') {
          const body = await readBoundedJson(request, 512)
          if (!body.ok) return json({ error: body.error }, body.error === 'body_too_large' ? 413 : 400)
          const revision = (body.value as { revision?: unknown } | null)?.revision
          if (!Number.isSafeInteger(revision) || Number(revision) < 1) return json({ error: 'invalid_publication_link' }, 400)
          const result = await linkPublishedIdeaEdit(db, action[1], Number(revision), owner, now(), deployedReleaseId)
          await notify(action[1])
          return json(result)
        }
        if (action[2] === 'close') {
          const body = await readBoundedJson(request, 2048)
          if (!body.ok) return json({ error: body.error }, body.error === 'body_too_large' ? 413 : 400)
          const value = body.value as { revision?: unknown; note?: unknown } | null
          if (!value || !Number.isSafeInteger(value.revision) || Number(value.revision) < 1 || typeof value.note !== 'string' || value.note.trim().length < 10 || value.note.trim().length > 1000) return json({ error: 'invalid_editorial_close' }, 400)
          const result = await closeAcceptedIdea(db, action[1], Number(value.revision), value.note.trim(), owner, now())
          await notify(action[1])
          return json(result)
        }
        await db.prepare("UPDATE submission_notifications SET state = 'pending', attempts = 0, available_at = ?, error_code = NULL WHERE submission_id = ? AND state = 'failed'").bind(now(), action[1]).run()
        await notify(action[1])
        return json({ ok: true })
      }
      const reviewId = path.startsWith('/api/ecosystem/review/') ? path.slice('/api/ecosystem/review/'.length) : ''
      if (path !== '/api/ecosystem/submissions' && !validEntityId(reviewId)) return json({ error: 'not_found' }, 404)
      if (request.method !== 'POST') {
        const response = json({ error: 'method_not_allowed' }, 405)
        response.headers.set('Allow', 'POST')
        return response
      }
      if (reviewId && !reviewer) return json({ error: 'forbidden' }, 403)
      if (!(await admit(env, user))) return json({ error: 'rate_limited' }, 429)
      const body = await readBoundedJson(request, 24_000)
      if (!body.ok) return json({ error: body.error }, body.error === 'body_too_large' ? 413 : 400)
      let editSnapshot: EcosystemSnapshot | null = null
      if (!reviewId && (body.value as { kind?: unknown } | null)?.kind === 'idea-edit') {
        const frozen = await db.prepare('SELECT r.id, r.snapshot_json FROM publication p JOIN releases r ON r.id = p.release_id WHERE p.singleton = 1').first<{ id: string; snapshot_json: string }>()
        if (!frozen || frozen.id !== deployedReleaseId || (body.value as { baseReleaseId?: unknown }).baseReleaseId !== frozen.id) return json({ error: 'stale_idea' }, 409)
        editSnapshot = JSON.parse(frozen.snapshot_json) as EcosystemSnapshot
      }
      if (reviewId) {
        const row = await db.prepare('SELECT payload_json FROM submissions WHERE id = ?').bind(reviewId).first<{ payload_json: string }>()
        if (!row) return json({ error: 'submission_not_found' }, 409)
        const decision = JSON.parse(row.payload_json).kind ? parseIdeaDecision(body.value) : parseDecision(body.value)
        if (!decision) return json({ error: 'invalid_decision' }, 400)
        const result = await decideSubmission(db, reviewId, owner, decision, now())
        await notify(reviewId)
        return json(result, 200)
      }
      const proposal = (editSnapshot && parseIdeaEditProposal(body.value, editSnapshot)) || parseIdeaProposal(body.value) || parseProposal(body.value)
      const key = request.headers.get('Idempotency-Key') || ''
      if (!proposal || !/^[a-zA-Z0-9_-]{16,80}$/.test(key)) return json({ error: 'invalid_submission' }, 400)
      const { created: _created, ...submission } = await createSubmission(db, owner, key, await sha256Hex(JSON.stringify(proposal)), proposal, now(), decisionEmailsEnabled(env) ? user.email : undefined)
      // Retries can also pick up an unsent outbox entry; the lease suppresses concurrent sends.
      await notify(submission.id)
      return json(submission, 201)
    } catch (error) {
      if (error instanceof EcosystemConflict) return json({ error: error.message }, 409)
      return json({ error: 'ecosystem_unavailable' }, 503)
    }
  }
}
export const handleEcosystem = createEcosystemHandler({ cache: typeof caches === 'undefined' ? undefined : caches.default })
