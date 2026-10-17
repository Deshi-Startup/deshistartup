import { SITE_URL, canonicalUrl } from '../../app/seo.config.mjs'
import { contributorProfilePath } from '../../app/lib/contributor-leaderboard.mjs'
import { visibleLinkedCollectionItems } from '../visible-collection-items.mjs'
import { isNoindexPage } from './page-indexability.mjs'

const COLLECTION_SLUGS = new Set([
  'sitemap', 'guides', 'contributors', 'startup-50', 'directory', 'start-here/glossary'
])

export function schemaPageType(page, hasChildren = false) {
  if (page.kind === 'contributor-profile' || page.slug.startsWith('companies/')) return 'ProfilePage'
  if (page.slug === 'about') return 'AboutPage'
  if (COLLECTION_SLUGS.has(page.slug) || page.slug.startsWith('directory/') || hasChildren) {
    return 'CollectionPage'
  }
  return 'WebPage'
}

export function isArticleSchemaPage(page, pageType) {
  return page.guide === true && pageType === 'WebPage' &&
    !/^(?:startup-ideas|companies)(?:\/|$)/.test(page.slug)
}

const text = (element) => {
  const visible = element.clone()
  visible.find('[hidden], [aria-hidden="true"], .sr-only').remove()
  return visible.text().replace(/\s+/g, ' ').trim()
}

/** Convert rendered local links (including a preview base path) to canonical URLs. */
export function schemaLinkUrl(href, basePath = '') {
  href = href?.trim()
  if (!href || href.startsWith('#')) return null
  let url
  try { url = new URL(href, SITE_URL) } catch { return null }
  if (!['https:', 'http:'].includes(url.protocol)) return null
  if (url.origin !== SITE_URL) return url.href
  let route = url.pathname
  if (basePath && (route === basePath || route.startsWith(`${basePath}/`))) {
    route = route.slice(basePath.length) || '/'
  }
  route = route.replace(/\.html$/, '').replace(/\/$/, '') || '/'
  return canonicalUrl(route)
}

/** Only list records a reader can actually find, in their rendered display order. */
export function visibleCollectionItemsFor($, page, pageByRoute, basePath = '') {
  if (page.slug === 'sitemap' || page.slug === 'companies') {
    return visibleLinkedCollectionItems($, page, { basePath })
  }
  const list = (items) => items.filter(Boolean).map((item, index) => ({
    '@type': 'ListItem', position: index + 1, ...item
  }))
  if (page.slug === 'startup-50') {
    return list($('.startup50-entry').toArray().map((element) => {
      const row = $(element)
      const link = row.find('.startup50-entry__identity h2 a[href]').first()
      const name = text(link)
      const url = schemaLinkUrl(link.attr('href'), basePath)
      if (!name || !url) return null
      const description = text(row.find('.startup50-entry__description').first())
      return { item: { '@type': 'Organization', name, url, ...(description ? { description } : {}) } }
    }))
  }
  if (page.slug === 'startup-ideas') {
    return list($('.ideas-row h3 a[href]').toArray().map((element) => {
      const name = text($(element))
      const url = schemaLinkUrl($(element).attr('href'), basePath)
      return name && url ? { name, url } : null
    }))
  }
  if (page.slug === 'contributors') {
    return list($('.contributor-list--ranked .contributor-row').toArray().map((element) => {
      const row = $(element)
      const name = text(row.find('.contributor-row__identity strong').first())
      if (!name) return null
      const profilePath = contributorProfilePath(row.attr('data-contributor-profile'), page.locale)
      const url = profilePath ? canonicalUrl(profilePath) : null
      return { item: { '@type': 'Person', name, ...(url ? { url } : {}) } }
    }))
  }
  if (page.slug.startsWith('directory/')) {
    return list($('.directory-card').toArray().map((element) => {
      const card = $(element)
      const name = text(card.find('h2').first())
      if (!name) return null
      const url = schemaLinkUrl(card.find('.directory-card__source a[href]').first().attr('href'), basePath)
      const description = text(card.find('.directory-card__note').first())
      return { item: { '@type': 'Thing', name, ...(url ? { url } : {}), ...(description ? { description } : {}) } }
    }))
  }

  const seen = new Set()
  // A section's listing is distinct from prose links and its planned disclosure.
  const selector = page.slug === 'guides' ? '.article ul > li > a[href]' : '.section-index a[href]'
  return list($(selector).toArray().map((element) => {
    const link = $(element)
    if (link.closest('[hidden], [aria-hidden="true"], .sr-only').length) return null
    const url = schemaLinkUrl(link.attr('href'), basePath)
    if (!url || new URL(url).origin !== SITE_URL) return null
    const target = pageByRoute.get(new URL(url).pathname)
    if (!target || target.locale !== page.locale || isNoindexPage(target) || target.route === page.route || seen.has(url)) return null
    if (!['sitemap', 'guides'].includes(page.slug) && !target.slug.startsWith(`${page.slug}/`)) return null
    const label = link.find('.case-cover__company, h2, h3').first()
    const name = text(label.length ? label : link)
    if (!name) return null
    seen.add(url)
    return { name, url }
  }))
}

export function visibleDefinedTermsFor($, page) {
  if (page.slug !== 'start-here/glossary') return []
  const url = canonicalUrl(page.route)
  return $('.glossary-entry[id]').toArray().flatMap((element) => {
    const row = $(element)
    const id = row.attr('id')
    const name = text(row.find('.glossary-entry__head').first())
    const description = text(row.find('.glossary-entry__def').first())
    if (!id || !name || !description) return []
    const alternatives = row.find('.glossary-entry__expansion, .glossary-entry__gloss')
      .toArray().map((element) => text($(element))).filter((value) => value && value !== name)
    return [{
      '@type': 'DefinedTerm', '@id': `${url}#${encodeURIComponent(id)}`,
      name, description, url: `${url}#${encodeURIComponent(id)}`,
      ...(alternatives.length ? { alternateName: alternatives } : {}),
      inDefinedTermSet: { '@id': `${url}#glossary` }
    }]
  })
}
