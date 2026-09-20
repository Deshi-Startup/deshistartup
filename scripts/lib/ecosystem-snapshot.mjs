import { validateCompanyProfile, publicCompanyProfile } from './company-profile.mjs'
import { createHash } from 'node:crypto'
import { identityColumns, identityWhere, identitySnapshot, validateIdentities } from './identity-snapshot.mjs'

export const snapshotDigest = snapshot => createHash('sha256').update(JSON.stringify(snapshot)).digest('hex')
const parsed = value => JSON.parse(value)
// One SELECT gives the publisher a consistent view even while a reviewer writes.
// Explicit columns also keep private submission data out of release artifacts.
export const publicColumns = {
  problems: 'id slug sector places_json sources_json',
  problem_text: 'problem_id locale title summary customer context unknown',
  approaches: 'id problem_id kind position added_at guides_json',
  approach_text: 'approach_id locale title summary description business_model steps_json signal prototype editorial_note',
  organizations: 'id slug website logo_path roles_json aliases_json sources_json source_date origin',
  organization_text: 'organization_id locale name description',
  organization_references: 'organization_id kind target',
  connections: 'id organization_id problem_id stage work_en work_bn evidence_url review_scope reviewed_at',
  organization_profiles: 'organization_id profile_json reviewed_at',
  ...identityColumns
}
const activeProblems = 'SELECT id FROM problems WHERE active = 1'
const publicWhere = {
  problems: 'active = 1',
  problem_text: `problem_id IN (${activeProblems})`,
  approaches: `problem_id IN (${activeProblems})`,
  approach_text: `approach_id IN (SELECT id FROM approaches WHERE problem_id IN (${activeProblems}))`,
  connections: `problem_id IN (${activeProblems})`,
  ...identityWhere
}
const publicQuery = table => `SELECT * FROM ${table}${publicWhere[table] ? ` WHERE ${publicWhere[table]}` : ''} ORDER BY rowid`
export const snapshotRowsSql = 'SELECT json_object(' + Object.entries(publicColumns).map(([table, columns]) =>
  `'${table}', (SELECT json_group_array(json_object(${columns.split(' ').map(c => `'${c}', ${c}`).join(', ')})) FROM (${publicQuery(table)}))`
).join(', ') + ') AS snapshot_rows'

export async function readEcosystemSnapshot(query, releaseId, createdAt) {
  const tables = Object.keys(publicColumns)
  const values = await Promise.all(tables.map(table => query(publicQuery(table))))
  const [problems, problemText, approaches, approachText, organizations, organizationText, references, connections] = values
  const identities = identitySnapshot(Object.fromEntries(tables.map((table, i) => [table, values[i]])))
  const localized = (rows, idKey, id, transform) => Object.fromEntries(rows.filter(x => x[idKey] === id).map(x => [x.locale, transform(x)]))
  const snapshot = {
    version: 1, releaseId, createdAt,
    problems: problems.map(p => ({ id: p.id, slug: p.slug, sector: p.sector, places: parsed(p.places_json), sources: parsed(p.sources_json),
      ...localized(problemText, 'problem_id', p.id, t => ({ title: t.title, summary: t.summary, customer: t.customer, context: t.context, unknown: t.unknown })) })),
    approaches: approaches.map(a => ({ id: a.id, problemId: a.problem_id, kind: a.kind, position: a.position, addedAt: a.added_at, guides: parsed(a.guides_json),
      ...localized(approachText, 'approach_id', a.id, t => ({ title: t.title, summary: t.summary, description: t.description, businessModel: t.business_model, steps: parsed(t.steps_json), signal: t.signal, prototype: t.prototype, editorialNote: t.editorial_note })) })),
    organizations: organizations.map(o => ({ id: o.id, slug: o.slug, website: o.website, logoPath: o.logo_path, roles: parsed(o.roles_json), aliases: parsed(o.aliases_json), sourceUrls: parsed(o.sources_json), sourceDate: o.source_date, origin: o.origin,
      ...localized(organizationText, 'organization_id', o.id, t => ({ name: t.name, description: t.description })),
      ...(values[tables.indexOf('organization_profiles')]?.find(p => p.organization_id === o.id) ? { profile: publicCompanyProfile(parsed(values[tables.indexOf('organization_profiles')].find(p => p.organization_id === o.id).profile_json)) } : {}),
      references: [
        ...references.filter(r => r.organization_id === o.id).map(r => ({ kind: r.kind, target: r.target })),
        ...identities.references.filter(r => r.organizationId === o.id && r.namespace === 'startup-50').map(r => ({ kind: 'startup-50', target: r.externalId }))
      ] })),
    connections: connections.map(c => ({ id: c.id, organizationId: c.organization_id, problemId: c.problem_id, stage: c.stage, en: c.work_en, bn: c.work_bn, evidenceUrl: c.evidence_url, reviewScope: c.review_scope, reviewedAt: c.reviewed_at })),
    identities
  }
  validateEcosystemSnapshot(snapshot)
  return snapshot
}

export function validateEcosystemSnapshot(snapshot) {
  if (snapshot.version !== 1 || !snapshot.releaseId || !Number.isFinite(Date.parse(snapshot.createdAt))) throw new Error('Invalid snapshot metadata')
  const ids = {}
  const safeUrl = value => { try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password } catch { return false } }
  for (const kind of ['problems', 'approaches', 'organizations', 'connections']) {
    if (!Array.isArray(snapshot[kind])) throw new Error(`Missing ${kind}`)
    ids[kind] = new Set()
    const slugs = new Set()
    for (const row of snapshot[kind]) {
      if (!/^[a-z0-9][a-z0-9_-]{0,95}$/.test(row.id) || ids[kind].has(row.id)) throw new Error(`Invalid or duplicate ${kind} ID`)
      ids[kind].add(row.id)
      if (kind !== 'connections') {
        for (const locale of ['en', 'bn']) {
          const required = kind === 'organizations' ? ['name', 'description'] : kind === 'problems' ? ['title', 'summary', 'customer', 'context', 'unknown'] : ['title', 'summary', 'description', 'businessModel', 'signal', 'prototype']
          if (!row[locale] || required.some(key => typeof row[locale][key] !== 'string' || !row[locale][key].trim())) throw new Error(`Incomplete ${kind} translation`)
        }
      }
      if (kind === 'problems' || kind === 'organizations') {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug) || ['contribute', 'review', 'draft'].includes(row.slug) || slugs.has(row.slug)) throw new Error('Invalid or reserved slug')
        slugs.add(row.slug)
      }
      if (kind === 'organizations' && row.profile !== undefined) validateCompanyProfile(row.profile)
      if (kind === 'organizations' && (!safeUrl(row.website) || row.sourceUrls.some(u => !safeUrl(u)) || (row.logoPath && !/^\/media\/[a-zA-Z0-9/_.-]+$/.test(row.logoPath)))) throw new Error('Unsafe organization URL')
      if (kind === 'problems' && (row.sources.some(s => !safeUrl(s.url)) || !row.places.length)) throw new Error('Invalid problem context')
      if (kind === 'approaches' && ['en', 'bn'].some(l => !Array.isArray(row[l].steps) || !row[l].steps.length || row[l].steps.some(s => typeof s !== 'string' || !s.trim()))) throw new Error('Incomplete first test')
      if (kind === 'approaches' && !['software', 'service', 'marketplace', 'workflow'].includes(row.kind)) throw new Error('Invalid idea type')
      if (kind === 'approaches' && (['en', 'bn'].some(l => row[l].editorialNote !== undefined && (typeof row[l].editorialNote !== 'string' || row[l].editorialNote.length > 350)) || Boolean(row.en.editorialNote?.trim()) !== Boolean(row.bn.editorialNote?.trim()))) throw new Error('Invalid editorial selection')
      if (kind === 'organizations' && (!row.roles.length || row.roles.some(role => !['startup', 'investor', 'accelerator', 'incubator', 'community'].includes(role)))) throw new Error('Invalid organization role')
      if (kind === 'connections' && !['research', 'prototype', 'live'].includes(row.stage)) throw new Error('Invalid work stage')
      // Keep editorial dates available without adding freshness claims to the UI.
      if (kind === 'approaches' && !/^\d{4}-\d{2}-\d{2}$/.test(row.addedAt || '')) throw new Error(`Missing added date: ${row.id}`)
      if (kind === 'approaches' && (!Array.isArray(row.guides) || row.guides.length > 5 || new Set(row.guides).size !== row.guides.length || row.guides.some(g => !/^[a-z0-9][a-z0-9-]*(?:\/[a-z0-9][a-z0-9-]*)*$/.test(g)))) throw new Error(`Invalid guide links: ${row.id}`)
      if (kind === 'connections' && (!safeUrl(row.evidenceUrl) || !row.en.trim() || !row.bn.trim())) throw new Error('Invalid connection evidence')
    }
  }
  if (snapshot.approaches.some(a => !ids.problems.has(a.problemId)) || snapshot.connections.some(c => !ids.problems.has(c.problemId) || !ids.organizations.has(c.organizationId))) throw new Error('Dangling relationship')
  // Older frozen releases remain buildable. New exports include the identity section.
  if (snapshot.identities !== undefined) validateIdentities(snapshot.identities, ids.organizations)
  return snapshot
}
