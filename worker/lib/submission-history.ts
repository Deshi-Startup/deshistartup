import { validEntityId } from '../../app/lib/ecosystem-input.ts'
import { ideaSlug } from '../../app/lib/idea-routes.mjs'
import { EcosystemConflict } from './ecosystem-store.ts'
import type { SubmissionRow } from './ecosystem-store.ts'

// Owner history excludes contacts; only the allowlisted reviewer endpoint reads them.
const fields = `s.id, s.status, s.revision, s.created_at, s.decided_at, s.decision_note, s.payload_json,
  COALESCE(l.approach_id, e.approach_id) AS idea_id,
  c.note AS editorial_close_note, c.closed_at AS editorial_closed_at,
  CASE WHEN e.approach_id IS NOT NULL THEN EXISTS (
    SELECT 1 FROM publication p JOIN releases current_release ON current_release.id = p.release_id
    JOIN releases linked_release ON linked_release.id = e.release_id,
    json_each(current_release.snapshot_json, '$.approaches') j
    WHERE (current_release.id = linked_release.id OR current_release.created_at > linked_release.created_at)
      AND json_extract(j.value, '$.id') = e.approach_id
  ) WHEN l.approach_id IS NOT NULL THEN l.approach_id IN (
    SELECT json_extract(j.value, '$.id') FROM publication p JOIN releases r ON r.id = p.release_id,
    json_each(r.snapshot_json, '$.approaches') j
  ) ELSE EXISTS (
    SELECT 1 FROM connections c WHERE c.submission_id = s.id AND c.id IN (
      SELECT json_extract(j.value, '$.id') FROM publication p JOIN releases r ON r.id = p.release_id,
      json_each(r.snapshot_json, '$.connections') j)
  ) END AS published`
const from = 'FROM submissions s LEFT JOIN idea_submission_links l ON l.submission_id = s.id LEFT JOIN idea_edit_publications e ON e.submission_id = s.id LEFT JOIN idea_editorial_closures c ON c.submission_id = s.id'
type Row = SubmissionRow & { idea_id: string | null; published: number; editorial_close_note: string | null; editorial_closed_at: string | null; contact_email?: string | null }
const shape = ({ payload_json, contact_email, ...row }: Row) => ({ ...row, payload: JSON.parse(payload_json), ...(contact_email ? { contactEmail: contact_email } : {}) })

export async function submissionHistory(db: D1Database, params: URLSearchParams, owner: string | null) {
  const columns = owner ? fields : `${fields}, sc.email AS contact_email`
  const source = owner ? from : `${from} LEFT JOIN submission_contacts sc ON sc.submission_id = s.id`
  const status = params.get('status') || 'pending'
  if (!owner && !['pending', 'approved', 'rejected'].includes(status)) throw new EcosystemConflict('invalid_filter')
  const ideaHistory = params.get('kind') === 'idea'
  const conditions = owner ? ["s.owner_hash = ?", ideaHistory
    ? "json_extract(s.payload_json, '$.kind') IN ('idea', 'idea-edit')"
    : "json_extract(s.payload_json, '$.kind') IS NULL"] : ['s.status = ?']
  const binds: string[] = owner ? [owner] : [status]
  const cursor = params.get('before')
  if (cursor) {
    const [date, id, extra] = cursor.split('|')
    if (extra || !/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(date || '') || !validEntityId(id || '')) throw new EcosystemConflict('invalid_cursor')
    conditions.push('(s.created_at < ? OR (s.created_at = ? AND s.id < ?))'); binds.push(date, date, id)
  }
  const rows = await db.prepare(`SELECT ${columns} ${source} WHERE ${conditions.join(' AND ')} ORDER BY s.created_at DESC, s.id DESC LIMIT 31`).bind(...binds).all<Row>()
  const page = rows.results.slice(0, 30)
  const selectedId = params.get('submission')
  let selected: Row | null = null
  if (selectedId) {
    if (!validEntityId(selectedId)) throw new EcosystemConflict('invalid_submission_id')
    selected = await db.prepare(`SELECT ${columns} ${source} WHERE s.id = ? ${owner ? 'AND s.owner_hash = ?' : ''}`).bind(...(owner ? [selectedId, owner] : [selectedId])).first<Row>()
    if (owner && selected) {
      const kind = JSON.parse(selected.payload_json).kind
      if (ideaHistory ? !['idea', 'idea-edit'].includes(kind) : !!kind) selected = null
    }
  }
  const submissions = page.map(shape)
  const chosen = selected ? shape(selected) : null
  if (!owner) {
    const items = [...submissions, ...(chosen ? [chosen] : [])]
    const ids = [...new Set(items.map(row => row.id))]
    if (ids.length) {
      const notifications = await db.prepare(`SELECT submission_id, kind, state FROM submission_notifications WHERE submission_id IN (${ids.map(() => '?').join(',')})`).bind(...ids).all<{ submission_id: string; kind: string; state: string }>()
      for (const row of items) Object.assign(row, { notifications: notifications.results.filter(n => n.submission_id === row.id).map(({ kind, state }) => ({ kind, state })) })
    }
  }
  const last = page.at(-1)
  return { submissions, selected: chosen, nextCursor: rows.results.length > 30 && last ? `${last.created_at}|${last.id}` : null }
}

export async function publishedIdeas(db: D1Database, locale = 'en') {
  const rows = await db.prepare(`SELECT json_extract(j.value, '$.id') AS id, json_extract(j.value, ?) AS title
    FROM publication p JOIN releases r ON r.id = p.release_id, json_each(r.snapshot_json, '$.approaches') j ORDER BY title`).bind(locale === 'bn' ? '$.bn.title' : '$.en.title').all<{ id: string; title: string }>()
  return rows.results.map(row => ({ ...row, slug: ideaSlug(row.id) }))
}

export async function linkPublishedIdea(db: D1Database, id: string, ideaId: string, revision: number, reviewer: string, now: string, sendDecisionEmail = false) {
  const guard = crypto.randomUUID()
  try {
    await db.batch([
      db.prepare(`INSERT INTO mutation_guards (id, valid) VALUES (?, CASE WHEN EXISTS (
        SELECT 1 FROM submissions s, publication p JOIN releases r ON r.id = p.release_id, json_each(r.snapshot_json, '$.approaches') j
        WHERE s.id = ? AND s.status = 'approved' AND s.revision = ? AND json_extract(s.payload_json, '$.kind') = 'idea'
        AND json_extract(j.value, '$.id') = ? AND NOT EXISTS (SELECT 1 FROM idea_submission_links WHERE submission_id = s.id)
        AND NOT EXISTS (SELECT 1 FROM idea_editorial_closures WHERE submission_id = s.id)
      ) THEN 1 ELSE 0 END)`).bind(guard, id, revision, ideaId),
      db.prepare('INSERT INTO idea_submission_links (submission_id, approach_id, reviewer_hash, linked_at) VALUES (?, ?, ?, ?)').bind(id, ideaId, reviewer, now),
      db.prepare('UPDATE submissions SET revision = revision + 1 WHERE id = ?').bind(id),
      ...(sendDecisionEmail ? [db.prepare("INSERT INTO submission_notifications (submission_id, kind, available_at) SELECT submission_id, 'published', ? FROM submission_contacts WHERE submission_id = ?").bind(now, id)] : []),
      db.prepare('DELETE FROM mutation_guards WHERE id = ?').bind(guard)
    ])
  } catch (error) {
    if (/constraint|foreign key|unique/i.test(String(error))) throw new EcosystemConflict('publication_link_conflict')
    throw error
  }
  return { id, ideaId }
}

export async function linkPublishedIdeaEdit(db: D1Database, id: string, revision: number, reviewer: string, now: string, deployedReleaseId: string, sendDecisionEmail = false) {
  const row = await db.prepare(`SELECT s.payload_json, current_release.id AS current_id,
    current_release.created_at AS current_created, current_release.snapshot_json AS current_json,
    base_release.created_at AS base_created, base_release.snapshot_json AS base_json
    FROM submissions s JOIN publication p ON p.singleton = 1
    JOIN releases current_release ON current_release.id = p.release_id
    LEFT JOIN releases base_release ON base_release.id = json_extract(s.payload_json, '$.baseReleaseId')
    WHERE s.id = ?`).bind(id).first<{ payload_json: string; current_id: string; current_created: string; current_json: string; base_created: string | null; base_json: string | null }>()
  if (!row) throw new EcosystemConflict('submission_not_found')
  const proposal = JSON.parse(row.payload_json)
  if (proposal.kind !== 'idea-edit' || !validEntityId(proposal.ideaId)) throw new EcosystemConflict('invalid_publication_link')
  if (row.current_id !== deployedReleaseId || !row.base_created || row.current_created <= row.base_created) throw new EcosystemConflict('release_not_live')
  const relevant = (raw: string | null) => {
    if (!raw) return null
    const release = JSON.parse(raw)
    const idea = release.approaches?.find((item: { id: string }) => item.id === proposal.ideaId)
    const problem = release.problems?.find((item: { id: string }) => item.id === proposal.problemId)
    return idea && problem ? JSON.stringify({ idea: { en: idea.en, bn: idea.bn }, problem: { en: problem.en, bn: problem.bn, sources: problem.sources } }) : null
  }
  const before = relevant(row.base_json), after = relevant(row.current_json)
  if (!before || !after || before === after) throw new EcosystemConflict('publication_content_unchanged')
  const guard = crypto.randomUUID()
  try {
    await db.batch([
      db.prepare(`INSERT INTO mutation_guards (id, valid) VALUES (?, CASE WHEN EXISTS (
        SELECT 1 FROM submissions s JOIN publication p ON p.singleton = 1
          JOIN releases r ON r.id = p.release_id
          JOIN releases base ON base.id = json_extract(s.payload_json, '$.baseReleaseId')
          JOIN json_each(r.snapshot_json, '$.approaches') j
        WHERE s.id = ? AND s.status = 'approved' AND s.revision = ?
          AND json_extract(s.payload_json, '$.kind') = 'idea-edit'
          AND p.release_id = ? AND r.created_at > base.created_at
          AND json_extract(j.value, '$.id') = ?
          AND NOT EXISTS (SELECT 1 FROM idea_edit_publications WHERE submission_id = s.id)
      ) THEN 1 ELSE 0 END)`).bind(guard, id, revision, deployedReleaseId, proposal.ideaId),
      db.prepare('INSERT INTO idea_edit_publications (submission_id, approach_id, release_id, reviewer_hash, linked_at) SELECT ?, ?, release_id, ?, ? FROM publication WHERE singleton = 1').bind(id, proposal.ideaId, reviewer, now),
      db.prepare('UPDATE submissions SET revision = revision + 1 WHERE id = ?').bind(id),
      ...(sendDecisionEmail ? [db.prepare("INSERT INTO submission_notifications (submission_id, kind, available_at) SELECT submission_id, 'published', ? FROM submission_contacts WHERE submission_id = ?").bind(now, id)] : []),
      db.prepare('DELETE FROM mutation_guards WHERE id = ?').bind(guard)
    ])
  } catch (error) {
    if (/constraint|foreign key|unique/i.test(String(error))) throw new EcosystemConflict('publication_link_conflict')
    throw error
  }
  return { id, ideaId: proposal.ideaId }
}

export async function closeAcceptedIdea(db: D1Database, id: string, revision: number, note: string, reviewer: string, now: string, sendDecisionEmail = false) {
  const guard = crypto.randomUUID()
  try {
    await db.batch([
      db.prepare(`INSERT INTO mutation_guards (id, valid) VALUES (?, CASE WHEN EXISTS (
        SELECT 1 FROM submissions s WHERE s.id = ? AND s.status = 'approved' AND s.revision = ?
        AND json_extract(s.payload_json, '$.kind') = 'idea'
        AND NOT EXISTS (SELECT 1 FROM idea_submission_links WHERE submission_id = s.id)
        AND NOT EXISTS (SELECT 1 FROM idea_editorial_closures WHERE submission_id = s.id)
      ) THEN 1 ELSE 0 END)`).bind(guard, id, revision),
      db.prepare('INSERT INTO idea_editorial_closures (submission_id, note, reviewer_hash, closed_at) VALUES (?, ?, ?, ?)').bind(id, note, reviewer, now),
      db.prepare('UPDATE submissions SET revision = revision + 1 WHERE id = ?').bind(id),
      ...(sendDecisionEmail ? [db.prepare("INSERT INTO submission_notifications (submission_id, kind, available_at) SELECT submission_id, 'closed', ? FROM submission_contacts WHERE submission_id = ?").bind(now, id)] : []),
      db.prepare('DELETE FROM mutation_guards WHERE id = ?').bind(guard)
    ])
  } catch (error) {
    if (/constraint|foreign key|unique/i.test(String(error))) throw new EcosystemConflict('editorial_close_conflict')
    throw error
  }
  return { id, closed: true }
}
