import type { EcosystemSnapshot, Organization } from './ecosystem-types'

export interface PersonIdentity {
  id: string; slug: string; displayName: string; nameBn: string | null;
  aliases: string[]; links: { label: string; url: string }[];
  avatarPath: string | null; confirmedAt: string
}
export interface IdentitySource {
  title: string; url: string; publishedOn: string | null; checkedAt: string
}
export interface RelationshipEvidence {
  id: string; startedOn: string | null; endedOn: string | null;
  /** What date the claim describes; null end date does not prove a current role. */
  asOf: string; sources: IdentitySource[]; reviewedAt: string
}
export interface PersonAffiliation extends RelationshipEvidence {
  personId: string; organizationId: string;
  role: 'founder' | 'cofounder' | 'executive' | 'employee' | 'partner' | 'adviser' | 'board-member' | 'investor';
  title: { en: string | null; bn: string | null }
}
export interface OrganizationRelationship extends RelationshipEvidence {
  subjectId: string; objectId: string;
  kind: 'parent-of' | 'invested-in' | 'portfolio-mention' | 'accelerated' | 'grant-funded' | 'sponsored' | 'partnered-with'
}
export type IdentityReference = { namespace: 'contributor' | 'legacy-person'; externalId: string; personId: string }
  | { namespace: 'contributor-organization' | 'startup-50' | 'directory' | 'legacy-organization'; externalId: string; organizationId: string }
export interface PublicIdentities {
  version: 1; people: PersonIdentity[]; references: IdentityReference[];
  affiliations: PersonAffiliation[]; organizationRelationships: OrganizationRelationship[]
}

/** Build one index per published snapshot. No database or account lookup in browsers. */
export function sharedIdentityIndex(snapshot: EcosystemSnapshot) {
  const organizations = new Map(snapshot.organizations.map(o => [o.id, o]))
  const people = new Map((snapshot.identities?.people || []).map(p => [p.id, p]))
  const references = new Map<string, IdentityReference>((snapshot.identities?.references || []).map(r => [`${r.namespace}:${r.externalId}`, r]))
  // Compatibility with the first frozen releases, before the shared crosswalk existed.
  for (const org of snapshot.organizations) for (const ref of org.references) {
    if (ref.kind === 'startup-50' && !references.has(`startup-50:${ref.target}`)) {
      references.set(`startup-50:${ref.target}`, { namespace: 'startup-50', externalId: ref.target, organizationId: org.id })
    }
  }
  return {
    organization(namespace: 'startup-50' | 'directory' | 'contributor-organization' | 'legacy-organization', externalId: string): Organization | null {
      const reference = references.get(`${namespace}:${externalId}`)
      return reference && 'organizationId' in reference ? organizations.get(reference.organizationId) || null : null
    },
    person(namespace: 'contributor' | 'legacy-person', externalId: string): PersonIdentity | null {
      const reference = references.get(`${namespace}:${externalId}`)
      return reference && 'personId' in reference ? people.get(reference.personId) || null : null
    },
    affiliations(personId: string) { return (snapshot.identities?.affiliations || []).filter(r => r.personId === personId) },
    peopleAt(organizationId: string) { return (snapshot.identities?.affiliations || []).filter(r => r.organizationId === organizationId) },
    relationships(organizationId: string) { return (snapshot.identities?.organizationRelationships || []).filter(r => r.subjectId === organizationId || r.objectId === organizationId) }
  }
}
