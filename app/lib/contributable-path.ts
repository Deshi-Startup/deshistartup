export interface ContributableEntry {
  repoPath: string
  locale: 'bn' | 'en'
}

const SEGMENT = /^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/

/**
 * Convert an already-allowlisted public content path to its mirrored source
 * location. The route registry still decides whether a page is editable; this
 * function only removes the need to repeat derivable paths and locale metadata
 * for every route in the deployed Worker.
 */
export function deriveContributableEntry(path: string): ContributableEntry | null {
  if (path === '/en') return null
  const isEn = path.startsWith('/en/')
  const slug = path.slice(isEn ? 4 : 1)
  const segments = slug.split('/')
  if (
    !path.startsWith('/') ||
    segments.length < 1 ||
    segments.length > 2 ||
    segments.some((segment) => !SEGMENT.test(segment))
  ) {
    return null
  }

  return {
    repoPath: `app/(contents)/${isEn ? 'en' : '(bn)'}/${segments.join('/')}/page.mdx`,
    locale: isEn ? 'en' : 'bn'
  }
}
