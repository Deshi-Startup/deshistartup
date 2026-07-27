import type { Metadata } from 'next'
import ContributionImageReview from '../../../components/ContributionImageReview'

export const metadata: Metadata = {
  title: 'প্রস্তাবিত ছবি যাচাই',
  robots: { index: false, follow: false }
}

export default async function ContributionReviewPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ContributionImageReview reviewId={id} />
}

