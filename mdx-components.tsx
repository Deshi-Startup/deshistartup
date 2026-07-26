import React from 'react'
import StubNotice from './app/components/StubNotice'
import SectionIndex from './app/components/SectionIndex'
import SiteMap from './app/components/SiteMap'

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
    StubNotice,
    SectionIndex,
    SiteMap
  }
}
