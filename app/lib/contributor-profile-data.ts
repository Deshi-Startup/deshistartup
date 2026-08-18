import snapshotData from '../generated/contributors.json'
import { prepareContributorSnapshot } from './contributor-leaderboard.mjs'

export type ContributorLocale = 'bn' | 'en'

export interface ContributorOrganization {
  id: string
  name: string
  url: string | null
}

export interface ContributorTarget {
  path: string
  title: { bn: string; en: string }
}

export interface ContributorCredit {
  mode: 'person' | 'person+organization' | 'anonymous'
  profileId: string | null
  organizationId: string | null
  roles: string[]
  review: null | {
    scope: { bn: string; en: string }
    reviewedAt: string
  }
}

export interface ContributorEvent {
  id: string
  acceptedAt: string
  sourceType: 'github-pr' | 'editorial'
  evidenceUrl: string
  summary: { bn: string; en: string }
  targets: ContributorTarget[]
  credits: ContributorCredit[]
}

export interface ContributorProfileView {
  id: string
  slug: string
  rank: number
  displayName: string
  headline: string | null
  organizationId: string | null
  organization: ContributorOrganization | null
  githubLogin: string | null
  links: Array<{ label: string; url: string }>
  avatarUrl: string | null
  monogram: string
  acceptedEventCount: number
  lastAcceptedAt: string | null
  contributorSince: string | null
  roles: string[]
  roleCategories: Record<string, number>
  contributions: Array<{ event: ContributorEvent; credit: ContributorCredit }>
}

const view = prepareContributorSnapshot(snapshotData) as {
  rankedProfiles: ContributorProfileView[]
  organizations: ContributorOrganization[]
  refreshedAt: string | null
}

export function getContributorProfiles() {
  return view.rankedProfiles
}

export function getContributorProfile(slug: string) {
  return view.rankedProfiles.find((profile) => profile.slug === slug) || null
}

export function getContributorOrganizations() {
  return view.organizations
}

/** The date the public record was last rebuilt, shown on every profile. */
export function getContributorSnapshotDate() {
  return view.refreshedAt
}
