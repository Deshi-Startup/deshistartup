import type { ConnectionProposal, ReviewDecision, IdeaProposal, IdeaDecision } from '../../app/lib/ecosystem-types.ts'

export interface SubmissionRow {
  id: string; owner_hash: string; payload_json: string; payload_hash: string;
  status: 'pending' | 'approved' | 'rejected'; revision: number;
  created_at: string; decided_at: string | null; decision_note: string | null
}
export class EcosystemConflict extends Error {}

export async function createSubmission(db: D1Database, owner: string, key: string, hash: string, payload: ConnectionProposal | IdeaProposal, now: string) {
  const previous = await db.prepare('SELECT * FROM submissions WHERE owner_hash = ? AND idempotency_key = ?').bind(owner, key).first<SubmissionRow>()
  if (previous) {
    if (previous.payload_hash !== hash) throw new EcosystemConflict('idempotency_conflict')
    return { id: previous.id, status: previous.status }
  }
  if (!('kind' in payload)) {
    if (!await db.prepare('SELECT id FROM problems WHERE id = ? AND active = 1').bind(payload.problemId).first()) throw new EcosystemConflict('problem_not_found')
    if (payload.organizationId && !await db.prepare('SELECT id FROM organizations WHERE id = ?').bind(payload.organizationId).first()) throw new EcosystemConflict('organization_not_found')
  }
  const id = `submission_${crypto.randomUUID()}`
  // The unique key handles two retries that both passed the first lookup.
  await db.prepare('INSERT INTO submissions (id, owner_hash, idempotency_key, payload_hash, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(owner_hash, idempotency_key) DO NOTHING')
    .bind(id, owner, key, hash, JSON.stringify(payload), now).run()
  const stored = await db.prepare('SELECT id, status, payload_hash FROM submissions WHERE owner_hash = ? AND idempotency_key = ?').bind(owner, key).first<SubmissionRow>()
  if (!stored || stored.payload_hash !== hash) throw new EcosystemConflict('idempotency_conflict')
  return { id: stored.id, status: stored.status }
}

export async function decideSubmission(db: D1Database, id: string, reviewer: string, decision: ReviewDecision | IdeaDecision, now: string) {
  const row = await db.prepare('SELECT * FROM submissions WHERE id = ?').bind(id).first<SubmissionRow>()
  if (!row) throw new EcosystemConflict('submission_not_found')
  if (row.status !== 'pending' || row.revision !== decision.revision) throw new EcosystemConflict('stale_decision')
  const proposal: ConnectionProposal | IdeaProposal = JSON.parse(row.payload_json)
  const idea = 'kind' in proposal && proposal.kind === 'idea'
  if (!idea && !('organizationId' in decision)) throw new EcosystemConflict('invalid_decision')
  if (!idea && decision.decision === 'approved' && !('organizationId' in decision && decision.organizationId) && !('organization' in proposal && proposal.organization)) throw new EcosystemConflict('organization_required')
  const guard = crypto.randomUUID()
  const statements = [db.prepare('INSERT INTO mutation_guards (id, valid) VALUES (?, CASE WHEN EXISTS (SELECT 1 FROM submissions WHERE id = ? AND status = ? AND revision = ?) THEN 1 ELSE 0 END)')
    .bind(guard, id, 'pending', decision.revision)]
  if (decision.decision === 'approved' && !('kind' in proposal) && 'organizationId' in decision) {
    // Keep the active-record check in the same transaction as the approval.
    statements.push(db.prepare('INSERT INTO mutation_guards (id, valid) VALUES (?, CASE WHEN EXISTS (SELECT 1 FROM problems WHERE id = ? AND active = 1) THEN 1 ELSE 0 END)').bind(`${guard}:problem`, proposal.problemId))
    const organizationId = decision.organizationId || `org_${crypto.randomUUID()}`
    if (!decision.organizationId) {
      // A newly approved identity must be seen before another reviewer creates one.
      // Company identities are retained, so rowid is a monotonic catalogue version.
      statements.push(db.prepare('INSERT INTO mutation_guards (id, valid) VALUES (?, CASE WHEN COALESCE((SELECT MAX(rowid) FROM organizations), 0) = ? THEN 1 ELSE 0 END)').bind(`${guard}:organizations`, decision.organizationVersion ?? -1))
      const org = decision.organization!
      const submitted = proposal.organization!
      statements.push(db.prepare('INSERT INTO organizations (id, slug, website, roles_json, aliases_json, sources_json, source_date, origin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(organizationId, org.slug, submitted.website, JSON.stringify([submitted.role]), '[]', JSON.stringify([submitted.website, proposal.evidenceUrl]), now.slice(0, 10), 'reviewed-submission'))
      for (const locale of ['en', 'bn'] as const) statements.push(db.prepare('INSERT INTO organization_text (organization_id, locale, name, description) VALUES (?, ?, ?, ?)')
        .bind(organizationId, locale, org[locale].name.trim(), org[locale].description.trim()))
    }
    // Duplicate connections require a correction workflow, not an implicit overwrite.
    statements.push(db.prepare('INSERT INTO connections (id, organization_id, problem_id, stage, work_en, work_bn, evidence_url, review_scope, reviewed_at, submission_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(`connection_${crypto.randomUUID()}`, organizationId, proposal.problemId, proposal.stage, decision.work.en, decision.work.bn, proposal.evidenceUrl, 'identity-and-relevance', now, id))
  }
  statements.push(
    db.prepare('UPDATE submissions SET status = ?, revision = revision + 1, decided_at = ?, decision_note = ? WHERE id = ?').bind(decision.decision, now, decision.note, id),
    db.prepare('INSERT INTO review_events (id, submission_id, reviewer_hash, decision, note, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(`review_${crypto.randomUUID()}`, id, reviewer, decision.decision, decision.note, now),
    db.prepare('DELETE FROM mutation_guards WHERE id IN (?, ?, ?)').bind(guard, `${guard}:problem`, `${guard}:organizations`)
  )
  try { await db.batch(statements) }
  catch (error) {
    // Never expose SQL, user payloads or D1 internals in an API response.
    if (/constraint|foreign key|unique/i.test(String(error))) throw new EcosystemConflict('review_conflict')
    throw error
  }
  return { id, status: decision.decision, publication: decision.decision === 'approved' ? (idea ? 'editorial-preparation' : 'awaiting-publication') : null }
}
