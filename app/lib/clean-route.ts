/**
 * The clean spelling of the route the reader is on.
 *
 * `output: 'export'` writes real files. Static servers and local previews can
 * expose literal names such as `/en.html` and `/en/start-here.html` alongside
 * their clean URLs. Every route comparison in the shell (`isEn`, `isLanding`,
 * the breadcrumb split, the source-file path) is written against the clean
 * spelling, so literal filenames must enter the tree in that same form.
 *
 * Normalising once, at the single place the pathname enters the tree, is
 * cheaper and harder to forget than hardening each comparison.
 * Raw browser paths also include a configured deployment prefix; router
 * paths already omit it, so only raw-path callers supply basePath.
 */
export function cleanRoute(pathname: string, basePath = '') {
  let route = basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))
    ? pathname.slice(basePath.length)
    : pathname
  if (route.endsWith('/index.html')) route = route.slice(0, -'/index.html'.length)
  else if (route.endsWith('.html')) route = route.slice(0, -'.html'.length)
  if (route.length > 1 && route.endsWith('/')) route = route.slice(0, -1)
  return route || '/'
}
