import { SITE_URL, canonicalUrl } from '../app/seo.config.mjs'

// These collections render their own lists instead of the manifest's child
// order. Read those lists so JSON-LD describes what the reader actually sees.
export function visibleLinkedCollectionItems($, page, { basePath = '' } = {}) {
  const selector = {
    sitemap: '.sitemap-list a[href]',
    companies: '.companies-gallery .companies-card h2 a[href]'
  }[page.slug]
  if (!selector) return []

  const items = []
  const seen = new Set()
  $(selector).each((_, element) => {
    const link = $(element)
    if (link.closest('[hidden], [aria-hidden="true"], .sr-only').length) return
    const text = link.clone()
    text.find('[hidden], [aria-hidden="true"], .sr-only').remove()
    const name = text.text().replace(/\s+/g, ' ').trim()
    const href = link.attr('href')?.trim()
    if (!name || !href || href.startsWith('#')) return
    let target
    try { target = new URL(href, canonicalUrl(page.route || '/')) } catch { return }
    if (target.origin !== SITE_URL) return
    let route = target.pathname
    if (basePath && route === basePath) route = '/'
    else if (basePath && route.startsWith(`${basePath}/`)) route = route.slice(basePath.length)
    route = route.replace(/\.html$/, '').replace(/\/$/, '') || '/'
    const url = canonicalUrl(route)
    if (seen.has(url)) return
    seen.add(url)
    items.push({ '@type': 'ListItem', position: items.length + 1, name, url })
  })
  return items
}
