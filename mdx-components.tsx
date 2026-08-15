import React from 'react'
import StubNotice from './app/components/StubNotice'
import SectionIndex from './app/components/SectionIndex'
import SiteMap from './app/components/SiteMap'
import Figure, { MarkdownImage } from './app/components/Figure'
import DataBars from './app/components/DataBars'
import Waterfall from './app/components/Waterfall'
import Timeline from './app/components/Timeline'
import CodRiskCalculator from './app/components/CodRiskCalculator'
import YouTube from './app/components/YouTube'
import FacebookVideo from './app/components/FacebookVideo'
import OfficialSocialLinks from './app/components/OfficialSocialLinks'
import Term from './app/components/Term'
import Glossary from './app/components/Glossary'
import ExpertReview from './app/components/ExpertReview'
import ContributorLeaderboard from './app/components/ContributorLeaderboard'
import ContributionInvite from './app/components/ContributionInvite'

interface AnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string
}

function BasePathAnchor({ href = '', ...props }: AnchorProps) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const shouldPrefix =
    basePath &&
    href.startsWith('/') &&
    !href.startsWith('//') &&
    !href.startsWith(`${basePath}/`) &&
    href !== basePath
  const resolvedHref = shouldPrefix ? `${basePath}${href}` : href

  return <a {...props} href={resolvedHref} />
}

export function useMDXComponents(components: Record<string, any>): Record<string, any> {
  return {
    ...components,
    a: BasePathAnchor,
    // Plain markdown images get the same responsive, size-locked rendering as
    // an explicit <Figure>, so nobody has to remember which one to reach for.
    img: MarkdownImage,
    StubNotice,
    SectionIndex,
    SiteMap,
    Figure,
    DataBars,
    Waterfall,
    Timeline,
    CodRiskCalculator,
    YouTube,
    FacebookVideo,
    OfficialSocialLinks,
    Term,
    Glossary,
    ExpertReview,
    ContributorLeaderboard,
    ContributionInvite
  }
}
