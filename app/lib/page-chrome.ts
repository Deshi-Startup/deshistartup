import {
  localeNeutralContentRoute,
  routeSupportsInlineEdit
} from './inline-edit-policy.mjs'

export interface PageChromePolicy {
  showDiscussionAction: boolean
  showPageActions: boolean
  showEditAction: boolean
}

const NON_CONTENT_ROUTES = new Set([
  '/',
  '/about',
  '/contact',
  '/contribute',
  '/privacy',
  '/startup-50',
  '/maps',
  '/terms',
  '/sitemap'
])

const CHROMELESS_ROUTES = new Set(['/', '/contact', '/startup-50', '/maps'])

/**
 * Discussion belongs to editorial content, not project, policy, or task pages.
 * Page actions stay independent so transparent history
 * and reviewed edits remain available wherever they are useful.
 */
export function pageChromePolicy(pathname: string): PageChromePolicy {
  const route = localeNeutralContentRoute(pathname)
  const showPageActions = !CHROMELESS_ROUTES.has(route)

  return {
    showDiscussionAction: !NON_CONTENT_ROUTES.has(route),
    showPageActions,
    showEditAction: showPageActions && routeSupportsInlineEdit(route)
  }
}

/** Ancestors of a cleaned route; the heading already names the current page. */
export function breadcrumbAncestors(pathname: string, labels: Record<string, string>) {
  const route = pathname
  const isEn = route === '/en' || route.startsWith('/en/')
  const segments = localeNeutralContentRoute(route).split('/').filter(Boolean)
  if (segments.length === 0) return []

  const home = { href: isEn ? '/en' : '/', label: isEn ? 'Home' : 'হোম' }
  if (segments.length === 1) return [home]
  const parent = `${isEn ? '/en' : ''}/${segments[0]}`
  return [home, { href: parent, label: labels[parent] || segments[0] }]
}
