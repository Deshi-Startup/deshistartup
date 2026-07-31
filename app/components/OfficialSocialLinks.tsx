import { SOCIAL_PROFILE_URLS } from '../seo.config.mjs'

interface OfficialSocialLinksProps {
  locale?: 'bn' | 'en'
}

export default function OfficialSocialLinks({ locale = 'bn' }: OfficialSocialLinksProps) {
  const isEn = locale === 'en'

  return (
    <ul>
      <li>
        <a href={SOCIAL_PROFILE_URLS.facebook} target="_blank" rel="me noopener noreferrer">
          {isEn ? 'Follow on Facebook' : 'Facebook-এ ফলো করুন'}
        </a>
      </li>
      <li>
        <a href={SOCIAL_PROFILE_URLS.linkedin} target="_blank" rel="me noopener noreferrer">
          {isEn ? 'Follow on LinkedIn' : 'LinkedIn-এ ফলো করুন'}
        </a>
      </li>
      <li>
        <a href={SOCIAL_PROFILE_URLS.youtube} target="_blank" rel="me noopener noreferrer">
          {isEn ? 'Subscribe on YouTube' : 'YouTube-এ সাবস্ক্রাইব করুন'}
        </a>
      </li>
    </ul>
  )
}
