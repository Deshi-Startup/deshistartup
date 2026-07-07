import StubNotice from './app/components/StubNotice'
import SectionIndex from './app/components/SectionIndex'
import DirectoryList from './app/components/DirectoryList'

function BasePathAnchor({ href = '', ...props }) {
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

export function useMDXComponents(components) {
  return {
    ...components,
    a: BasePathAnchor,
    StubNotice,
    SectionIndex,
    DirectoryList
  }
}
