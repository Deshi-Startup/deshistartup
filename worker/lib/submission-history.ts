import { validEntityId } from '../../app/lib/ecosystem-input.ts'
import { ideaSlug } from '../../app/lib/idea-routes.mjs'
import { EcosystemConflict } from './ecosystem-store.ts'
import type { SubmissionRow } from './ecosystem-store.ts'

// Read only explicit public-to-the-owner fields. Contacts, request keys and hashes stay private.
const fields = `s.id, s.status, s.revision, s.created_at, s.decided_at, s.decision_note, s.payload_json,
  l.approach_id AS idea_id,
  CASE WHEN l.approach_id IS NOT NULL THEN l.approach_id IN (
    SELECT json_extract(j.value, '$.id') FROM publication p JOIN releases r ON r.id = p.release_id,
    json_each(r.snapshot_json, '$.approaches') j
  ) ELSE EXISTS (
    SELECT 1 FROM connections c WHERE c.submission_id = s.id AND c.id IN (
      SELECT json_extract(j.value, '$.id') FROM publication p JOIN releases r ON r.id = p.release_id,
      json_each(r.snapshot_json, '$.connections') j)
  ) END AS published`
const from = 'FROM submissions s LEFT JOIN idea_submission_links l ON l.submission_id = s.id'
type Row = SubmissionRow & { idea_id: string | null; published: number }
const shape = ({ payload_json, ...row }: Row) => ({ ...row, payload: JSON.parse(payload_json) })

export async function submissionHistory(db: D1Database, params: URLSearchParams, owner: string | null) {
  const status = params.get('status') || 'pending'
  if (!owner && !['pending', 'approved', 'rejected'].includes(status)) throw new EcosystemConflict('invalid_filter')
  const conditions = owner ? ["s.owner_hash = ?", "COALESCE(json_extract(s.payload_json, '$.kind'), 'connection') = ?"] : ['s.status = ?']
  const binds: string[] = owner ? [owner, params.get('kind') === 'idea' ? 'idea' : 'connection'] : [status]
  const cursor = params.get('before')
  if (cursor) {
    const [date, id, extra] = cursor.split('|')
    if (extra || !/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(date || '') || !validEntityId(id || '')) throw new EcosystemConflict('invalid_cursor')
    conditions.push('(s.created_at < ? OR (s.created_at = ? AND s.id < ?))'); binds.push(date, date, id)
  }
  const rows = await db.prepare(`SELECT ${fields} ${from} WHERE ${conditions.join(' AND ')} ORDER BY s.created_at DESC, s.id DESC LIMIT 31`).bind(...binds).all<Row>()
  const page = rows.results.slice(0, 30)
  const selectedId = params.get('submission')
  let selected: Row | null = null
  if (selectedId) {
    if (!validEntityId(selectedId)) throw new EcosystemConflict('invalid_submission_id')
    selected = await db.prepare(`SELECT ${fields} ${from} WHERE s.id = ? ${owner ? 'AND s.owner_hash = ?' : ''}`).bind(...(owner ? [selectedId, owner] : [selectedId])).first<Row>()
    if (owner && selected && JSON.parse(selected.payload_json).kind !== params.get('kind')) selected = null
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

export async function linkPublishedIdea(db: D1Database, id: string, ideaId: string, revision: number, reviewer: string, now: string) {
  const guard = crypto.randomUUID()
  try {
    await db.batch([
      db.prepare(`INSERT INTO mutation_guards (id, valid) VALUES (?, CASE WHEN EXISTS (
        SELECT 1 FROM submissions s, publication p JOIN releases r ON r.id = p.release_id, json_each(r.snapshot_json, '$.approaches') j
        WHERE s.id = ? AND s.status = 'approved' AND s.revision = ? AND json_extract(s.payload_json, '$.kind') = 'idea'
        AND json_extract(j.value, '$.id') = ? AND NOT EXISTS (SELECT 1 FROM idea_submission_links WHERE submission_id = s.id)
      ) THEN 1 ELSE 0 END)`).bind(guard, id, revision, ideaId),
      db.prepare('INSERT INTO idea_submission_links (submission_id, approach_id, reviewer_hash, linked_at) VALUES (?, ?, ?, ?)').bind(id, ideaId, reviewer, now),
      db.prepare('UPDATE submissions SET revision = revision + 1 WHERE id = ?').bind(id),
      db.prepare("INSERT INTO submission_notifications (submission_id, kind, available_at) SELECT submission_id, 'published', ? FROM submission_contacts WHERE submission_id = ?").bind(now, id),
      db.prepare('DELETE FROM mutation_guards WHERE id = ?').bind(guard)
    ])
  } catch (error) {
    if (/constraint|foreign key|unique/i.test(String(error))) throw new EcosystemConflict('publication_link_conflict')
    throw error
  }
  return { id, ideaId }
}
