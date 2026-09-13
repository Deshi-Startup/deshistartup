// Permanent case-study slugs can differ from a company's Startup 50 identity.
const startupAliases = new Map([['myalice', 'revora']])

export function startupCaseStudyRoutes(contentIndex, locale) {
  const routes = new Map()
  const groups = contentIndex[locale]?.sections?.['case-studies']?.[4] || []
  const prefix = locale === 'en' ? '/en/case-studies/' : '/case-studies/'

  for (const [, pages] of groups) {
    for (const [route, , stub] of pages) {
      // The same manifest flag controls sitemap inclusion and index/noindex.
      if (stub !== 0 || !route.startsWith(prefix)) continue
      const slug = route.slice(prefix.length)
      if (!slug || slug.includes('/')) continue
      routes.set(startupAliases.get(slug) || slug, route)
    }
  }

  return routes
}
