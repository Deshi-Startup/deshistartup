import React from 'react'
import StubNotice from './app/components/StubNotice'
import SectionIndex from './app/components/SectionIndex'
import SiteMap from './app/components/SiteMap'
import Figure, { MarkdownImage } from './app/components/Figure'
import YouTube from './app/components/YouTube'
import FacebookVideo from './app/components/FacebookVideo'
import Term from './app/components/Term'
import Cite from './app/components/Cite'
import ExpertReview from './app/components/ExpertReview'

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
    YouTube,
    FacebookVideo,
    Term,
    Cite,
    ExpertReview
  }
}

