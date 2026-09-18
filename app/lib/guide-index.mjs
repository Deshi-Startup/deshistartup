// Resolve a manual slug to the page a reader can actually open. The content
// index is passed in, so this stays a pure function the tests can drive.
const cache = new WeakMap()

function bySlug(contentIndex, locale) {
  let locales = cache.get(contentIndex)
  if (!locales) { locales = {}; cache.set(contentIndex, locales) }
  if (locales[locale]) return locales[locale]
  const map = new Map()
  for (const section of Object.values(contentIndex[locale].sections)) {
    for (const page of [section[3], ...section[4].flatMap(group => group[1])]) {
      if (page) map.set(page[0].replace(/^\/en\//, '').replace(/^\//, ''), page)
    }
  }
  locales[locale] = map
  return map
}

/**
 * A written page, or null for a planned topic and an unknown route, so a linked
 * guide is never a promise of something unwritten.
 */
export function guidePage(contentIndex, locale, slug) {
  const page = bySlug(contentIndex, locale).get(slug)
  return page && !page[2] ? { route: page[0], title: page[1] } : null
}
