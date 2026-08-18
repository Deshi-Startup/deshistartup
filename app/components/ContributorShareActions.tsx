'use client'

import { useState } from 'react'

type Locale = 'bn' | 'en'

const copy = {
  bn: {
    download: 'কার্ড ডাউনলোড করুন',
    copy: 'প্রোফাইল লিংক কপি করুন',
    copied: 'লিংক কপি হয়েছে',
    failed: 'লিংক কপি করা যায়নি'
  },
  en: {
    download: 'Download proof card',
    copy: 'Copy profile link',
    copied: 'Profile link copied',
    failed: 'Could not copy the link'
  }
} as const

export default function ContributorShareActions({
  locale,
  profileUrl,
  cardHref,
  downloadName
}: {
  locale: Locale
  profileUrl: string
  cardHref: string
  downloadName: string
}) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const text = copy[locale]

  async function copyProfileLink() {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <div className="contributor-share-actions">
      <a href={cardHref} download={downloadName}>{text.download}</a>
      <button type="button" onClick={copyProfileLink}>{text.copy}</button>
      <span role="status" aria-live="polite">
        {status === 'copied' ? text.copied : status === 'failed' ? text.failed : ''}
      </span>
    </div>
  )
}
