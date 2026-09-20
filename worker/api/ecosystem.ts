import { requireUser, type GoogleUser } from '../lib/google-token.ts'
import { contributorHash, getContributionBindings, isReviewer, moderationFor, sha256Hex } from '../lib/contribution-guard.ts'
import { authenticatedJson as json } from '../lib/http.ts'
import { readBoundedJson } from '../lib/request-body.ts'
import { parseDecision, parseProposal, parseIdeaProposal, parseIdeaDecision, validEntityId } from '../../app/lib/ecosystem-input.ts'
import { createSubmission, decideSubmission, EcosystemConflict, type SubmissionRow } from '../lib/ecosystem-store.ts'
import { notifyEditorial } from '../lib/ecosystem-email.ts'
import { myVotes, setIdeaVote, voteCounts } from '../lib/idea-votes.ts'
import release from '../../public/ecosystem-release.json' with { type: 'json' }

type Environment = CloudflareEnv & { ECOSYSTEM_DB?: D1Database }
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
}
export function createEcosystemHandler({ authenticate = requireUser, admit = admitted, now = () => new Date().toISOString(), cache }: Dependencies = {}) {
  return async function ecosystem(request: Request, env: Environment, context?: Pick<ExecutionContext, 'waitUntil'>): Promise<Response> {
    const path = new URL(request.url).pathname.replace(/\/+$/, '')
    if (path === '/api/ecosystem/status' && request.method === 'GET') return json({ available: !!env.ECOSYSTEM_DB }, 200)
    if (!env.ECOSYSTEM_DB) return json({ error: 'ecosystem_unavailable' }, 503)
    try {
      const db = env.ECOSYSTEM_DB
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
        const ideas = new URL(request.url).searchParams.get('kind') === 'idea'
        const rows = await db.prepare(`SELECT s.id, s.status, s.revision, s.created_at, s.decided_at, s.decision_note, s.payload_json,
          EXISTS (SELECT 1 FROM connections c JOIN publication p ON p.singleton = 1 JOIN releases r ON r.id = p.release_id,
            json_each(r.snapshot_json, '$.connections') j WHERE c.submission_id = s.id AND json_extract(j.value, '$.id') = c.id) AS published
          FROM submissions s WHERE s.owner_hash = ? AND COALESCE(json_extract(s.payload_json, '$.kind'), 'connection') = ? ORDER BY s.created_at DESC, s.id DESC LIMIT 30`).bind(owner, ideas ? 'idea' : 'connection').all<SubmissionRow>()
        return json({ submissions: rows.results.map(row => ({ ...row, payload: JSON.parse(row.payload_json), payload_json: undefined })) }, 200)
      }
      if (path === '/api/ecosystem/review' && request.method === 'GET') {
        if (!reviewer) return json({ error: 'forbidden' }, 403)
        const rows = await db.prepare("SELECT id, status, revision, created_at, payload_json FROM submissions WHERE status = 'pending' ORDER BY created_at, id LIMIT 50").all<SubmissionRow>()
        const organizations = await db.prepare("SELECT o.id, o.slug, o.website, t.name, MAX(o.rowid) OVER () AS version FROM organizations o JOIN organization_text t ON t.organization_id = o.id AND t.locale = 'en' ORDER BY t.name LIMIT 1000").all<{ id: string; slug: string; website: string; name: string; version: number }>()
        return json({ submissions: rows.results.map(row => ({ ...row, payload: JSON.parse(row.payload_json), payload_json: undefined })), organizations: organizations.results.map(({ version, ...company }) => company), organizationVersion: organizations.results[0]?.version ?? 0 }, 200)
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
      if (reviewId) {
        const row = await db.prepare('SELECT payload_json FROM submissions WHERE id = ?').bind(reviewId).first<{ payload_json: string }>()
        if (!row) return json({ error: 'submission_not_found' }, 409)
        const decision = JSON.parse(row.payload_json).kind === 'idea' ? parseIdeaDecision(body.value) : parseDecision(body.value)
        if (!decision) return json({ error: 'invalid_decision' }, 400)
        return json(await decideSubmission(db, reviewId, owner, decision, now()), 200)
      }
      const proposal = parseIdeaProposal(body.value) || parseProposal(body.value)
      const key = request.headers.get('Idempotency-Key') || ''
      if (!proposal || !/^[a-zA-Z0-9_-]{16,80}$/.test(key)) return json({ error: 'invalid_submission' }, 400)
      const { created, ...submission } = await createSubmission(db, owner, key, await sha256Hex(JSON.stringify(proposal)), proposal, now())
      if (created) {
        const notification = notifyEditorial(env, db, submission.id, proposal)
        if (context) context.waitUntil(notification)
        else await notification
      }
      return json(submission, 201)
    } catch (error) {
      if (error instanceof EcosystemConflict) return json({ error: error.message }, 409)
      return json({ error: 'ecosystem_unavailable' }, 503)
    }
  }
}
export const handleEcosystem = createEcosystemHandler({ cache: typeof caches === 'undefined' ? undefined : caches.default })
