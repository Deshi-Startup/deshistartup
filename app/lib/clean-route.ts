/**
 * The clean spelling of the route the reader is on.
 *
 * `output: 'export'` writes real files, and a static host serves them at their
 * literal names as well as at the clean URL — the GitHub Pages mirror answers
 * `/en.html` and `/en/start-here.html` directly, with no redirect to `/en`.
 * Every route comparison in the shell (`isEn`, `isLanding`, the breadcrumb
 * split, the source-file path) is written against the clean spelling, so a
 * reader who lands on the literal name fails all of them at once: a correct,
 * server-rendered English page hydrates into Bangla chrome, and the language
 * switcher offers `/en/en.html`.
 *
 * Normalising once, at the single place the pathname enters the tree, is
 * cheaper and harder to forget than hardening each comparison.
 */
export function cleanRoute(pathname: string) {
  let route = pathname
  if (route.endsWith('/index.html')) route = route.slice(0, -'/index.html'.length)
  else if (route.endsWith('.html')) route = route.slice(0, -'.html'.length)
  if (route.length > 1 && route.endsWith('/')) route = route.slice(0, -1)
  return route || '/'
}
