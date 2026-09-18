// Slugs come from immutable record IDs, never editable titles.
export const ideaSlug = id => id.replace(/-approach$/, '')
export const ideaPath = (locale, slug = '') => `${locale === 'en' ? '/en' : ''}/startup-ideas${slug ? `/${slug}` : ''}`
export const relatedIdeasPath = (locale, problemId = '') => `${ideaPath(locale)}${problemId ? `?problem=${encodeURIComponent(problemId)}` : ''}`

// Keep the first preview's links useful without choosing one idea for a problem.
export function legacyIdeaDestination(pathname) {
  const old = pathname.match(/^\/(en\/)?problems(?:\/([^/]+))?\/?$/)
  if (old) {
    const locale = old[1] ? 'en' : 'bn'
    const child = old[2]
    if (!child) return ideaPath(locale)
    if (child === 'contribute') return ideaPath(locale, 'add-company')
    if (child === 'review' || child === 'draft') return ideaPath(locale, child === 'draft' ? 'add' : child)
    return relatedIdeasPath(locale, child)
  }
  const early = pathname.match(/^\/(en\/)?startup-ideas\/(add-startup|contribute|draft)\/?$/)
  return early ? ideaPath(early[1] ? 'en' : 'bn', early[2] === 'add-startup' ? 'add-company' : 'add') : null
}
