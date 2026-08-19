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
  if (!profile) return { title: 'কন্ট্রিবিউটর পাওয়া যায়নি', robots: { index: false } }
  return {
    title: `${profile.displayName} – কন্ট্রিবিউটর`,
    description: `দেশি স্টার্টআপে ${profile.displayName}-এর পাবলিশ হওয়া কাজ আর প্রমাণের রেকর্ড।`
  }
}

export default async function BanglaContributorProfilePage({
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
      locale="bn"
      scopeClassName={styles.scope}
    />
  )
}
