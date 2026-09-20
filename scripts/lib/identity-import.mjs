import { contributorProfileWithdrawal } from './contributor-media.mjs'

const quote = value => value === null ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`

/** Bootstrap confirmed legacy people once. Never update existing D1 identity fields. */
export function contributorIdentityImport(ledger, policy, now) {
  const profiles = ledger.profiles.filter(p => !contributorProfileWithdrawal(p, policy) && p.confirmedAt)
  const statements = []
  for (const p of profiles) {
    const aliases = Object.entries(policy.identityAliases?.inlineNames || {}).filter(([, id]) => id === p.id).map(([alias]) => alias)
    const name = policy.displayNameOverrides?.[p.id] || policy.displayNameOverrides?.[p.githubLogin] || p.displayName
    const values = [p.id, p.slug, name, JSON.stringify(aliases), JSON.stringify(p.links || []),
      p.avatar?.kind === 'media' ? p.avatar.path : null, p.confirmedAt].map(quote)
    statements.push(`INSERT INTO people (id, slug, display_name, aliases_json, links_json, avatar_path, confirmed_at) VALUES (${values.join(', ')}) ON CONFLICT(id) DO NOTHING`)
    const guard = `identity-import:${p.id}`
    statements.push(`INSERT INTO mutation_guards (id, valid) VALUES (${quote(guard)}, CASE WHEN NOT EXISTS (SELECT 1 FROM identity_references WHERE namespace = 'contributor' AND external_id = ${quote(p.id)} AND (person_id IS NULL OR person_id != ${quote(p.id)})) THEN 1 ELSE 0 END)`)
    statements.push(`INSERT INTO identity_references (namespace, external_id, person_id) VALUES ('contributor', ${quote(p.id)}, ${quote(p.id)}) ON CONFLICT(namespace, external_id) DO NOTHING`)
    statements.push(`INSERT INTO identity_events (id, person_id, action, actor, created_at, detail_json) VALUES (${quote(guard)}, ${quote(p.id)}, 'import', 'maintainer:contributor-import', ${quote(now)}, ${quote(JSON.stringify({ source: 'data/contributor-ledger.json', legacyId: p.id, confirmedAt: p.confirmedAt }))}) ON CONFLICT(id) DO NOTHING`)
    statements.push(`DELETE FROM mutation_guards WHERE id = ${quote(guard)}`)
  }
  return { people: profiles.map(p => p.id), statements,
    unresolvedOrganizations: [...new Set(profiles.map(p => p.organizationId).filter(Boolean))] }
}
