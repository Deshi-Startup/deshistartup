import React from 'react'
import StubNotice from './app/components/StubNotice'
import SectionIndex from './app/components/SectionIndex'
import SiteMap from './app/components/SiteMap'
import Figure, { MarkdownImage } from './app/components/Figure'
import DataBars from './app/components/DataBars'
import Waterfall from './app/components/Waterfall'
import Timeline from './app/components/Timeline'
import YouTube from './app/components/YouTube'
import FacebookVideo from './app/components/FacebookVideo'
import OfficialSocialLinks from './app/components/OfficialSocialLinks'
import Term from './app/components/Term'
import ExpertReview from './app/components/ExpertReview'
import ContributorLeaderboard from './app/components/ContributorLeaderboard'
import ContributionInvite from './app/components/ContributionInvite'
import contentIndex from './app/generated/content-index.json'

type IndexedPage = [route: string, title: string, stub: number, description: string | null]
type IndexedSection = [string, number, number, IndexedPage | null, [string, IndexedPage[]][]]

// A curated Markdown list can link across sections. Use the same readiness
// source as SectionIndex so an unfinished tool cannot look ready to use.
// This module renders on the server; the index is not sent to the reader.
const unfinishedRoutes = new Set<string>()
for (const locale of Object.values(contentIndex)) {
  for (const entry of Object.values(locale.sections)) {
    const [, , , index, groups] = entry as unknown as IndexedSection
    for (const page of [...(index ? [index] : []), ...groups.flatMap(([, pages]) => pages)]) {
      if (page[2] === 1) unfinishedRoutes.add(page[0])
    }
  }
}

interface AnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string
}

function BasePathAnchor({ href = '', children, className, rel, ...props }: AnchorProps) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const withoutBase = basePath && href.startsWith(`${basePath}/`) ? href.slice(basePath.length) : href
  const route = withoutBase.split(/[?#]/)[0].replace(/\/$/, '') || '/'
  const isStub = unfinishedRoutes.has(route)
  const shouldPrefix =
    basePath &&
    href.startsWith('/') &&
    !href.startsWith('//') &&
    !href.startsWith(`${basePath}/`) &&
    href !== basePath
  const resolvedHref = shouldPrefix ? `${basePath}${href}` : href

  return (
    <>
      <a
        {...props}
        href={resolvedHref}
        className={[className, isStub && 'is-stub-link'].filter(Boolean).join(' ') || undefined}
        rel={isStub ? [...new Set([...(rel?.split(/\s+/) || []), 'nofollow'])].join(' ') : rel}
      >
        {children}
      </a>
      {isStub && (
        <span className="stub-chip" data-pagefind-ignore>
          {route.startsWith('/en/') ? 'to be written' : 'লেখা বাকি'}
        </span>
      )}
    </>
  )
}

export function useMDXComponents(components: Record<string, any>): Record<string, any> {
  // Only shared guide primitives belong here. Page-specific widgets import
  // their components directly in MDX so Next can split their scripts and CSS.
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
    YouTube,
    FacebookVideo,
    OfficialSocialLinks,
    Term,
    ExpertReview,
    ContributorLeaderboard,
    ContributionInvite
  }
}
