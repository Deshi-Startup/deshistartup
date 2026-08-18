import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ContributorProfile from '../../../../components/ContributorProfile'
import {
  getContributorOrganizations,
  getContributorProfile,
  getContributorProfiles
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
    description: `${profile.displayName}'s published Deshi Startup contributions and evidence trail.`
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
  return <ContributorProfile profile={profile} organizations={getContributorOrganizations()} locale="en" />
}
