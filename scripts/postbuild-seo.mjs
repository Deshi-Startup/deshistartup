#!/usr/bin/env node
/**
 * Adds route-aware SEO metadata to statically exported HTML.
 *
 * Nextra supplies each MDX page's title and description, but the shared client
 * shell cannot know the route during the static root-layout render. This pass
 * adds the server-visible canonical, hreflang, robots, social metadata, HTML
 * language, and accurate JSON-LD that need route and stub information.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'cheerio'
import {
  CONTENT_LICENSE_URL,
  DEFAULT_DESCRIPTIONS,
  DEFAULT_OG_IMAGE,
  REPOSITORY_URL,
  SITE_NAME,
  SITE_NAME_BN,
  SITE_URL,
  canonicalUrl
} from '../app/seo.config.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'out')
const pages = JSON.parse(fs.readFileSync(path.join(root, 'app', 'generated', 'seo-pages.json'), 'utf8'))

const pageByLocaleSlug = new Map(pages.map((page) => [`${page.locale}:${page.slug}`, page]))
const pageByRoute = new Map(pages.map((page) => [page.route, page]))
const writtenPages = pages.filter((page) => !page.stub)

function htmlFileFor(route) {
  return path.join(outDir, route === '/' ? 'index.html' : `${route.slice(1)}.html`)
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function jsonLd(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function localHomeRoute(locale) {
  return locale === 'en' ? '/en' : '/'
}

function sectionRouteFor(page) {
  const parts = page.slug.split('/').filter(Boolean)
  if (parts.length < 2) return null
  return `${page.locale === 'en' ? '/en' : ''}/${parts[0]}`
}

function breadcrumbsFor(page) {
  if (page.slug === '') return null
  const isEn = page.locale === 'en'
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: isEn ? 'Home' : 'প্রধান পাতা',
      item: canonicalUrl(localHomeRoute(page.locale))
    }
  ]
  const sectionRoute = sectionRouteFor(page)
  if (sectionRoute) {
    const sectionPage = pageByRoute.get(sectionRoute)
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: sectionPage?.fullTitle || page.slug.split('/')[0],
      item: canonicalUrl(sectionRoute)
    })
  }
  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: page.fullTitle,
    item: canonicalUrl(page.route)
  })
  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl(page.route)}#breadcrumb`,
    itemListElement: items
  }
}

function childrenFor(page) {
  if (page.slug === 'sitemap') {
    return writtenPages.filter((candidate) => candidate.locale === page.locale && candidate.route !== page.route)
  }
  if (!page.slug || page.slug.includes('/')) return []
  return writtenPages.filter(
    (candidate) => candidate.locale === page.locale && candidate.slug.startsWith(`${page.slug}/`)
  )
}

function schemaFor(page, wordCount) {
  if (page.stub) return null

  const isEn = page.locale === 'en'
  const locale = isEn ? 'en-BD' : 'bn-BD'
  const url = canonicalUrl(page.route)
  const description = page.description || DEFAULT_DESCRIPTIONS[page.locale]
  const children = childrenFor(page)
  const isHome = page.slug === ''
  const isAbout = page.slug === 'about'
  const isCollection =
    page.slug === 'sitemap' ||
    page.slug === 'directory' ||
    page.slug.startsWith('directory/') ||
    children.length > 0
  const isArticle = !isHome && !isAbout && !isCollection && page.slug !== 'contribute'
  const pageType = isAbout ? 'AboutPage' : isCollection ? 'CollectionPage' : 'WebPage'
  const pageName = isHome ? `${isEn ? SITE_NAME : SITE_NAME_BN} – ${page.fullTitle}` : page.fullTitle

  const organizationNode = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: SITE_NAME_BN,
    url: `${SITE_URL}/`,
    description: DEFAULT_DESCRIPTIONS[page.locale],
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#logo`,
      url: `${SITE_URL}/deshi-mark.svg`,
      contentUrl: `${SITE_URL}/deshi-mark.svg`,
      width: 128,
      height: 128
    },
    sameAs: [REPOSITORY_URL],
    areaServed: { '@type': 'Country', name: 'Bangladesh' },
    knowsLanguage: ['bn', 'en'],
    publishingPrinciples: canonicalUrl(isEn ? '/en/about' : '/about')
  }
  const websiteNode = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    alternateName: SITE_NAME_BN,
    description: DEFAULT_DESCRIPTIONS[page.locale],
    inLanguage: ['bn-BD', 'en-BD'],
    publisher: { '@id': organizationNode['@id'] }
  }

  const pageNode = {
    '@type': pageType,
    '@id': `${url}#webpage`,
    url,
    name: pageName,
    description,
    inLanguage: locale,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: {
      '@type': 'Thing',
      name: isEn ? 'Startups and entrepreneurship in Bangladesh' : 'বাংলাদেশে স্টার্টআপ ও উদ্যোক্তা'
    }
  }

  if (page.date) pageNode.dateModified = page.date
  if (isCollection && children.length > 0) {
    pageNode.mainEntity = {
      '@type': 'ItemList',
      numberOfItems: children.length,
      itemListElement: children.map((child, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: child.fullTitle,
        url: canonicalUrl(child.route)
      }))
    }
  }
  const graph = [organizationNode, websiteNode]

  graph.push(pageNode)
  if (isArticle) {
    const articleNode = {
      '@type': 'Article',
      '@id': `${url}#article`,
      url,
      headline: page.fullTitle,
      description,
      inLanguage: locale,
      mainEntityOfPage: { '@id': `${url}#webpage` },
      isPartOf: { '@id': `${SITE_URL}/#website` },
      author: { '@id': `${SITE_URL}/#organization` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      image: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE,
        contentUrl: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630
      },
      publishingPrinciples: canonicalUrl(isEn ? '/en/about' : '/about'),
      isAccessibleForFree: true,
      license: CONTENT_LICENSE_URL,
      copyrightHolder: { '@id': `${SITE_URL}/#organization` }
    }
    if (page.published) articleNode.datePublished = page.published
    if (page.date) articleNode.dateModified = page.date
    if (wordCount > 0) articleNode.wordCount = wordCount
    pageNode.mainEntity = { '@id': articleNode['@id'] }
    graph.push(articleNode)
  }
  const breadcrumbs = breadcrumbsFor(page)
  if (breadcrumbs) {
    pageNode.breadcrumb = { '@id': breadcrumbs['@id'] }
    graph.push(breadcrumbs)
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

let enriched = 0
let noindexed = 0
const missing = []

for (const page of pages) {
  const file = htmlFileFor(page.route)
  if (!fs.existsSync(file)) {
    missing.push(page.route)
    continue
  }

  let html = fs.readFileSync(file, 'utf8')
  html = html.replace(/\n?<!-- deshi-seo:start -->[\s\S]*?<!-- deshi-seo:end -->\n?/g, '')

  const $ = load(html)
  const documentTitle = $('title').first().text().trim() || page.fullTitle
  const description = $('meta[name="description"]').first().attr('content') || page.description || DEFAULT_DESCRIPTIONS[page.locale]
  const articleText = $('.article').text().trim()
  const wordCount = articleText ? articleText.split(/\s+/).length : 0
  const isEn = page.locale === 'en'
  const htmlLanguage = isEn ? 'en' : 'bn'
  const contentLanguage = isEn ? 'en-BD' : 'bn-BD'
  const ogLocale = isEn ? 'en_BD' : 'bn_BD'
  const url = canonicalUrl(page.route)
  const socialTitle = page.slug === ''
    ? `${isEn ? SITE_NAME : SITE_NAME_BN} – ${page.fullTitle}`
    : page.fullTitle
  const expectedDocumentTitle = page.slug === ''
    ? socialTitle
    : `${page.fullTitle} | ${isEn ? SITE_NAME : SITE_NAME_BN}`
  const pairedBn = pageByLocaleSlug.get(`bn:${page.slug}`)
  const pairedEn = pageByLocaleSlug.get(`en:${page.slug}`)
  const hasIndexablePair = !page.stub && pairedBn && pairedEn && !pairedBn.stub && !pairedEn.stub
  const pageChildren = childrenFor(page)
  const isCollectionPage =
    page.slug === 'sitemap' ||
    page.slug === 'directory' ||
    page.slug.startsWith('directory/') ||
    pageChildren.length > 0
  const ogType = page.stub || page.slug === '' || isCollectionPage || page.slug === 'about' || page.slug === 'contribute'
    ? 'website'
    : 'article'
  const robots = page.stub
    ? 'noindex, follow, noarchive'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

  const tags = [
    '<!-- deshi-seo:start -->',
    `<link rel="canonical" href="${escapeHtml(url)}"/>`,
    `<meta name="robots" content="${robots}"/>`,
    `<meta http-equiv="content-language" content="${contentLanguage}"/>`,
    `<meta name="author" content="${SITE_NAME} contributors"/>`,
    `<link rel="license" href="${CONTENT_LICENSE_URL}"/>`
  ]

  if (hasIndexablePair) {
    tags.push(
      `<link rel="alternate" hreflang="bn-BD" href="${escapeHtml(canonicalUrl(pairedBn.route))}"/>`,
      `<link rel="alternate" hreflang="en-BD" href="${escapeHtml(canonicalUrl(pairedEn.route))}"/>`,
      `<link rel="alternate" hreflang="x-default" href="${escapeHtml(canonicalUrl(pairedBn.route))}"/>`
    )
  }

  tags.push(
    `<meta property="og:type" content="${ogType}"/>`,
    `<meta property="og:title" content="${escapeHtml(socialTitle)}"/>`,
    `<meta property="og:description" content="${escapeHtml(description)}"/>`,
    `<meta property="og:url" content="${escapeHtml(url)}"/>`,
    `<meta property="og:site_name" content="${SITE_NAME}"/>`,
    `<meta property="og:locale" content="${ogLocale}"/>`,
    `<meta property="og:locale:alternate" content="${isEn ? 'bn_BD' : 'en_BD'}"/>`,
    `<meta property="og:image" content="${DEFAULT_OG_IMAGE}"/>`,
    '<meta property="og:image:width" content="1200"/>',
    '<meta property="og:image:height" content="630"/>',
    '<meta property="og:image:type" content="image/png"/>',
    `<meta property="og:image:alt" content="${escapeHtml(isEn ? 'Deshi Startup, the Bangla-first startup guide for Bangladesh' : 'দেশি স্টার্টআপ, বাংলাদেশে স্টার্টআপ গড়ার বাংলা গাইড')}"/>`,
    '<meta name="twitter:card" content="summary_large_image"/>',
    `<meta name="twitter:title" content="${escapeHtml(socialTitle)}"/>`,
    `<meta name="twitter:description" content="${escapeHtml(description)}"/>`,
    `<meta name="twitter:image" content="${DEFAULT_OG_IMAGE}"/>`,
    `<meta name="twitter:image:alt" content="${escapeHtml(isEn ? 'Deshi Startup, the Bangla-first startup guide for Bangladesh' : 'দেশি স্টার্টআপ, বাংলাদেশে স্টার্টআপ গড়ার বাংলা গাইড')}"/>`
  )

  if (ogType === 'article') {
    if (page.published) tags.push(`<meta property="article:published_time" content="${page.published}"/>`)
    if (page.date) tags.push(`<meta property="article:modified_time" content="${page.date}"/>`)
    tags.push(`<meta property="article:author" content="${SITE_URL}/"/>`)
  }

  const schema = schemaFor(page, wordCount)
  if (schema) tags.push(`<script type="application/ld+json" data-deshi-schema>${jsonLd(schema)}</script>`)
  tags.push('<!-- deshi-seo:end -->')

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(expectedDocumentTitle)}</title>`)
  html = html.replace(/(<html\b[^>]*\blang=)["'][^"']*["']/i, `$1"${htmlLanguage}"`)
  html = html.replace('</head>', `${tags.join('')}\n</head>`)
  // The client shell discovers the page title after hydration; give the static
  // HTML the real breadcrumb leaf (the component suppresses the hydration diff).
  html = html.replace('<li aria-current="page">…</li>', `<li aria-current="page">${escapeHtml(page.title)}</li>`)
  fs.writeFileSync(file, html)
  enriched += 1
  if (page.stub) noindexed += 1

  // Keep a useful diagnostic if a page's actual document title diverges completely.
  if (!documentTitle.includes(page.title) && !documentTitle.includes(page.fullTitle)) {
    console.warn(`title mismatch: ${page.route}: ${documentTitle}`)
  }
}

if (missing.length > 0) {
  console.error(`postbuild SEO: ${missing.length} expected HTML files missing`)
  for (const route of missing.slice(0, 20)) console.error(`  ${route}`)
  process.exitCode = 1
} else {
  console.log(`postbuild SEO: enriched ${enriched} pages; noindexed ${noindexed} stubs`)
}
