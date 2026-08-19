export interface PageChromePolicy {
  showContentTabs: boolean
  showPageActions: boolean
}

const NON_CONTENT_ROUTES = new Set([
  '/',
  '/about',
  '/contact',
  '/contribute',
  '/privacy',
  '/terms',
  '/sitemap'
])

const CHROMELESS_ROUTES = new Set(['/', '/contact'])

function localeNeutralRoute(pathname: string) {
  if (pathname === '/en' || pathname === '/en/') return '/'
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/'
  return pathname
}

/**
 * The Guide/Discussion pair describes editorial content, not project,
 * policy, or task pages. Page actions stay independent so transparent history
 * and reviewed edits remain available wherever they are useful.
 */
export function pageChromePolicy(pathname: string): PageChromePolicy {
  const route = localeNeutralRoute(pathname)

  return {
    showContentTabs: !NON_CONTENT_ROUTES.has(route),
    showPageActions: !CHROMELESS_ROUTES.has(route)
  }
}
