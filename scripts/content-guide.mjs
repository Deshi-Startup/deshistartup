const NON_GUIDE_SLUGS = new Set([
  '',
  'about',
  'contact',
  'contribute',
  'contributors',
  'directory',
  'guides',
  'privacy',
  'roadmap',
  'sitemap',
  'terms'
])

const NON_GUIDE_COMPONENT = /<(?:Glossary|ContributorLeaderboard|DirectoryList|SiteMap|WikiLanding|ContactForm)\b/
const SECTION_INDEX_COMPONENT = /<SectionIndex\b/

/**
 * Classifies authored MDX before it is reduced to the SEO route manifest.
 * The manifest then remains the only input the postbuild pass needs.
 */
export function isWrittenGuide({ slug = '', source = '', stub = false } = {}) {
  if (stub || NON_GUIDE_SLUGS.has(slug)) return false
  if (NON_GUIDE_COMPONENT.test(source)) return false
  // Section indexes own top-level section hubs. A nested guide may append the
  // same generated list as a "read next" aid without becoming a hub itself.
  if (SECTION_INDEX_COMPONENT.test(source) && !slug.includes('/')) return false
  return true
}
