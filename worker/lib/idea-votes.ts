import publishedIds from '../../app/generated/idea-ids.json' with { type: 'json' }

const published = new Set(publishedIds)
const activeIdeas = `SELECT a.id FROM approaches a JOIN problems p ON p.id = a.problem_id WHERE p.active = 1`

export async function voteCounts(db: D1Database) {
  const rows = await db.prepare(`SELECT a.id, COUNT(v.approach_id) AS count FROM approaches a
    JOIN problems p ON p.id = a.problem_id
    LEFT JOIN idea_votes v ON v.approach_id = a.id AND v.active = 1
    WHERE p.active = 1 AND a.id IN (SELECT value FROM json_each(?)) GROUP BY a.id`).bind(JSON.stringify(publishedIds)).all<{ id: string; count: number }>()
  return Object.fromEntries(rows.results.filter(row => published.has(row.id)).map(row => [row.id, row.count]))
}

export async function myVotes(db: D1Database, owner: string) {
  const rows = await db.prepare(`SELECT approach_id AS id FROM idea_votes WHERE owner_hash = ? AND active = 1
    AND approach_id IN (${activeIdeas})`).bind(owner).all<{ id: string }>()
  return rows.results.filter(row => published.has(row.id)).map(row => row.id)
}

export async function setIdeaVote(db: D1Database, owner: string, id: string, voted: boolean, now: string) {
  if (!published.has(id)) return null
  // Explicit state makes retries idempotent; toggling never resets the first-vote date.
  // The guard in INSERT also prevents votes on a problem retired during the request.
  const [write, count] = await db.batch([
    db.prepare(`INSERT INTO idea_votes (approach_id, owner_hash, active, created_at)
      SELECT id, ?, ?, ? FROM approaches WHERE id = ? AND id IN (${activeIdeas})
      ON CONFLICT (approach_id, owner_hash) DO UPDATE SET active = excluded.active
      RETURNING approach_id`).bind(owner, Number(voted), now, id),
    db.prepare('SELECT COUNT(*) AS count FROM idea_votes WHERE approach_id = ? AND active = 1').bind(id)
  ])
  if (!write.results.length) return null
  return { id, voted, count: Number((count.results[0] as { count: number }).count) }
}
