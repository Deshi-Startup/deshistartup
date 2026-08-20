const DATA_OWNED_ROUTE = /^\/directory(?:\/|$)/
const SECTION_INDEX_COMPONENT = /<SectionIndex\b/

/**
 * Removes the locale prefix so one content-ownership rule covers both trees.
 * The caller already cleans export spellings such as /index.html.
 *
 * @param {string} pathname
 */
export function localeNeutralContentRoute(pathname) {
  if (pathname === '/en' || pathname === '/en/') return '/'
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/'
  return pathname || '/'
}

/**
 * Some rendered pages are views over another authored source. Opening their
 * MDX shell in the browser editor promises control over content it does not
 * contain: directory rows live in data/directory and the sitemap is generated.
 *
 * @param {string} pathname
 */
export function routeSupportsInlineEdit(pathname) {
  const route = localeNeutralContentRoute(pathname)
  return route !== '/sitemap' && !DATA_OWNED_ROUTE.test(route)
}

function hasAuthoredSection(source) {
  let fence = null

  for (const line of source.split(/\r?\n/)) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[1]
      if (fence === null) fence = marker
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null
      continue
    }
    if (fence === null && /^ {0,3}##(?!#)\s+\S/.test(line)) return true
  }

  return false
}

/**
 * Build-time counterpart to the rendered-page guard in LocalizedLayout.
 * Stubs keep their purpose-built GitHub writing CTA. A top-level SectionIndex
 * page remains browser-editable only when it also contains an authored section;
 * nested guides may append the same index as a read-next aid.
 *
 * @param {{ slug?: string, source?: string, stub?: boolean }} page
 */
export function sourceSupportsInlineEdit({ slug = '', source = '', stub = false } = {}) {
  if (stub || !routeSupportsInlineEdit(`/${slug}`)) return false
  if (
    !slug.includes('/') &&
    SECTION_INDEX_COMPONENT.test(source) &&
    !hasAuthoredSection(source)
  ) {
    return false
  }
  return true
}
