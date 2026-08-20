import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ContributorProfile from '../../../../components/ContributorProfile'
import styles from '../../../../components/ContributorRecognition.module.css'
import {
  getContributorOrganizations,
  getContributorProfile,
  getContributorProfiles,
  getContributorSnapshotDate
} from '../../../../lib/contributor-profile-data'

export const dynamicParams = false

export function generateStaticParams() {
  return getContributorProfiles().map((profile) => ({ slug: profile.slug }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const profile = getContributorProfile(slug)
  if (!profile) return { title: 'Contributor not found', robots: { index: false } }
  return {
    title: `${profile.displayName} – Contributor`,
    description: `What ${profile.displayName} has worked on at Deshi Startup, which pages, and when.`
  }
}

export default async function EnglishContributorProfilePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const profile = getContributorProfile(slug)
  if (!profile) notFound()
  return (
    <ContributorProfile
      profile={profile}
      organizations={getContributorOrganizations()}
      refreshedAt={getContributorSnapshotDate()}
      locale="en"
      scopeClassName={styles.scope}
    />
  )
}
