import { validLogicalPath } from './media-lib.mjs'

export const identityColumns = {
  people: 'id slug display_name name_bn aliases_json links_json avatar_path confirmed_at',
  identity_references: 'namespace external_id person_id organization_id',
  person_organizations: 'id person_id organization_id role title_en title_bn started_on ended_on as_of sources_json reviewed_at',
  organization_relationships: 'id subject_id object_id kind started_on ended_on as_of sources_json reviewed_at'
}
const publicPeople = "SELECT id FROM people WHERE visibility = 'public' AND confirmed_at IS NOT NULL"
export const identityWhere = {
  people: "visibility = 'public' AND confirmed_at IS NOT NULL",
  identity_references: `person_id IS NULL OR person_id IN (${publicPeople})`,
  person_organizations: `status = 'confirmed' AND person_id IN (${publicPeople})`,
  organization_relationships: "status = 'confirmed'"
}
export function identitySnapshot(rows) {
  const relationship = row => ({ id: row.id, startedOn: row.started_on, endedOn: row.ended_on,
    asOf: row.as_of, sources: JSON.parse(row.sources_json).map(s => ({ title: s.title, url: s.url,
      publishedOn: s.publishedOn, checkedAt: s.checkedAt })), reviewedAt: row.reviewed_at })
  return {
    version: 1,
    people: rows.people.map(p => ({ id: p.id, slug: p.slug, displayName: p.display_name,
      nameBn: p.name_bn, aliases: JSON.parse(p.aliases_json), links: JSON.parse(p.links_json).map(l => ({ label: l.label, url: l.url })),
      avatarPath: p.avatar_path, confirmedAt: p.confirmed_at })),
    references: rows.identity_references.map(r => ({ namespace: r.namespace, externalId: r.external_id,
      ...(r.person_id ? { personId: r.person_id } : { organizationId: r.organization_id }) })),
    affiliations: rows.person_organizations.map(r => ({ ...relationship(r), personId: r.person_id,
      organizationId: r.organization_id, role: r.role, title: { en: r.title_en, bn: r.title_bn } })),
    organizationRelationships: rows.organization_relationships.map(r => ({ ...relationship(r),
      subjectId: r.subject_id, objectId: r.object_id, kind: r.kind }))
  }
}

const id = value => typeof value === 'string' && /^[a-z0-9][a-z0-9_-]{0,95}$/.test(value)
const text = (value, max = 180) => typeof value === 'string' && value.trim().length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value)
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
const timestamp = value => typeof value === 'string' && Number.isFinite(Date.parse(value))
const url = value => { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password } catch { return false } }
function unique(rows, key, label) {
  if (!Array.isArray(rows)) throw new Error(`Missing identity ${label}`)
  const seen = new Set()
  for (const row of rows) {
    const value = key(row)
    if (seen.has(value)) throw new Error(`Duplicate identity ${label}`)
    seen.add(value)
  }
  return seen
}
export function validateIdentities(data, organizations) {
  if (data.version !== 1) throw new Error('Invalid identity version')
  const people = unique(data.people, p => p.id, 'people')
  const slugs = new Set()
  for (const p of data.people) {
    if (!id(p.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || slugs.has(p.slug) ||
      !text(p.displayName) || (p.nameBn !== null && !text(p.nameBn)) || !timestamp(p.confirmedAt) ||
      !Array.isArray(p.aliases) || p.aliases.some(a => !text(a)) ||
      !Array.isArray(p.links) || !p.links.length || p.links.some(l => !text(l.label, 60) || !url(l.url)) ||
      (p.avatarPath !== null && !validLogicalPath(p.avatarPath))) throw new Error('Invalid public person')
    slugs.add(p.slug)
  }
  unique(data.references, r => `${r.namespace}:${r.externalId}`, 'references')
  for (const r of data.references) {
    const person = ['contributor', 'legacy-person'].includes(r.namespace)
    const organization = ['contributor-organization', 'startup-50', 'directory', 'legacy-organization'].includes(r.namespace)
    const safeReference = r.namespace === 'directory' ? /^[a-z0-9-]+\/[a-z0-9-]+$/.test(r.externalId) : id(r.externalId)
    if (!text(r.externalId, 200) || !safeReference || !(person || organization) ||
      (person ? !people.has(r.personId) || r.organizationId !== undefined : !organizations.has(r.organizationId) || r.personId !== undefined)) throw new Error('Invalid identity reference')
  }
  for (const [kind, rows] of [['affiliations', data.affiliations], ['organizationRelationships', data.organizationRelationships]]) {
    unique(rows, r => r.id, kind)
    for (const r of rows) {
      if (!id(r.id) || !date(r.asOf) || !timestamp(r.reviewedAt) ||
        (r.startedOn !== null && !date(r.startedOn)) || (r.endedOn !== null && !date(r.endedOn)) ||
        (r.startedOn && r.endedOn && r.endedOn < r.startedOn) || !Array.isArray(r.sources) || !r.sources.length ||
        r.sources.some(s => !text(s.title, 300) || !url(s.url) || !date(s.checkedAt) || (s.publishedOn !== null && !date(s.publishedOn)))) throw new Error('Invalid identity relationship evidence')
      if (kind === 'affiliations') {
        if (!people.has(r.personId) || !organizations.has(r.organizationId) || !['founder', 'cofounder', 'executive', 'employee', 'partner', 'adviser', 'board-member', 'investor'].includes(r.role) ||
          !r.title || ['en', 'bn'].some(l => r.title[l] !== null && !text(r.title[l]))) throw new Error('Invalid person affiliation')
      } else if (!organizations.has(r.subjectId) || !organizations.has(r.objectId) || r.subjectId === r.objectId ||
        !['parent-of', 'invested-in', 'portfolio-mention', 'accelerated', 'grant-funded', 'sponsored', 'partnered-with'].includes(r.kind)) throw new Error('Invalid organization relationship')
    }
  }
}
