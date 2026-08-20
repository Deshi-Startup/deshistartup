import {
  localeNeutralContentRoute,
  routeSupportsInlineEdit
} from './inline-edit-policy.mjs'

export interface PageChromePolicy {
  showContentTabs: boolean
  showPageActions: boolean
  showEditAction: boolean
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

/**
 * The Guide/Discussion pair describes editorial content, not project,
 * policy, or task pages. Page actions stay independent so transparent history
 * and reviewed edits remain available wherever they are useful.
 */
export function pageChromePolicy(pathname: string): PageChromePolicy {
  const route = localeNeutralContentRoute(pathname)
  const showPageActions = !CHROMELESS_ROUTES.has(route)

  return {
    showContentTabs: !NON_CONTENT_ROUTES.has(route),
    showPageActions,
    showEditAction: showPageActions && routeSupportsInlineEdit(route)
  }
}
