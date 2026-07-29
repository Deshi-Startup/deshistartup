import type { Metadata } from 'next'
import { Suspense } from 'react'
import ContributionImageReview from '../../components/ContributionImageReview'

export const metadata: Metadata = {
  title: 'প্রস্তাবিত ছবি যাচাই',
  robots: { index: false, follow: false }
}

export default function ContributionReviewPage() {
  return (
    <Suspense fallback={null}>
      <ContributionImageReview />
    </Suspense>
  )
}
