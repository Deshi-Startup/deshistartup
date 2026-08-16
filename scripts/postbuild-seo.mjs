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
  ORGANIZATION_SAME_AS,
  REPOSITORY_URL,
  SITE_NAME,
  SITE_NAME_BN,
  SITE_URL,
  canonicalUrl
} from '../app/seo.config.mjs'
import { resolveBuildOutput } from './build-output.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { htmlDir: outDir } = resolveBuildOutput(root)
const pages = JSON.parse(fs.readFileSync(path.join(root, 'app', 'generated', 'seo-pages.json'), 'utf8'))

const pageByLocaleSlug = new Map(pages.map((page) => [`${page.locale}:${page.slug}`, page]))
const pageByRoute = new Map(pages.map((page) => [page.route, page]))
const writtenPages = pages.filter((page) => !page.stub)
const UTILITY_SLUGS = new Set(['contribute', 'contact'])

function isUtilityPage(page) {
  return UTILITY_SLUGS.has(page.slug)
}

function htmlFileFor(route) {
  return path.join(outDir, route === '/' ? 'index.html' : `${route.slice(1)}.html`)
}

/**
 * The hashed URL of the self-hosted Bengali face, lifted out of the built
 * stylesheet so it carries this deployment's basePath. Bengali pages always
 * use this file because the @font-face deliberately has no local() source.
 */
function bengaliPrimaryFontUrl() {
  const cssDirs = [
    path.join(root, '.next', 'static', 'css'),
    path.join(root, 'out', '_next', 'static', 'css')
  ]
  for (const dir of cssDirs) {
    if (!fs.existsSync(dir)) continue
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith('.css')) continue
      const match = fs
        .readFileSync(path.join(dir, name), 'utf8')
        .match(/url\(\s*["']?([^"')]*deshi-sans-bengali-var[^"')]*\.woff2)["']?\s*\)/)
      if (match) return match[1]
    }
  }
  return null
}

const bengaliFontUrl = bengaliPrimaryFontUrl()
if (!bengaliFontUrl) console.warn('postbuild SEO: Bengali font not found in built CSS; skipping font preload')

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

/**
 * The two "On this page" lists.
 *
 * The shared client shell cannot know the route while the static HTML is
 * rendered, so it used to collect the article's h2s after hydration. That put a
 * collapsed accordion above the article a moment after first paint and pushed
 * the whole page down — a layout shift on every guide, charged to exactly the
 * mid-range phone this site is read on. The lists are the same for every reader
 * and known here, so they are written into the HTML instead, and the shell
 * reproduces them on its first client render rather than adding them later.
 *
 * That only holds while both sides agree, so the rule lives in one sentence and
 * is implemented twice: the article's own h2s, in document order, first 16,
 * keeping the ones that carry both an id and text. `deshi:toc` tells the shell
 * this pass ran; without it (`next dev`) the shell falls back to filling the
 * lists in after hydration.
 */
const HEADING_LIMIT = 16

function collectShellHeadings($) {
  const article = $('.article').first()
  if (article.length === 0) return []
  return article
    .find('h2')
    .slice(0, HEADING_LIMIT)
    .map((_, el) => ({ id: $(el).attr('id') || '', text: $(el).text().trim() }))
    .get()
    .filter((heading) => heading.id && heading.text)
}

function pageTocHtml(headings, isEn) {
  // Matches the shell's own threshold: two headings are not a table of contents.
  if (headings.length <= 2) return ''
  const items = headings
    .map((h) => `<li><a href="#${escapeHtml(h.id)}">${escapeHtml(h.text)}</a></li>`)
    .join('')
  return `<details class="page-toc"><summary>${
    isEn ? 'On this page' : 'এই পেজে'
  }</summary><ul>${items}</ul></details>`
}

function sidebarTocHtml(headings, isEn) {
  if (headings.length === 0) return ''
  const links = headings
    .map((h) => `<a href="#${escapeHtml(h.id)}">${escapeHtml(h.text)}</a>`)
    .join('')
  // `sidebar-group--toc` is what hides this copy below 1024px, where the
  // article's own accordion takes over. Kept identical to the shell's markup in
  // LocalizedLayout, which reproduces this node on its first client render.
  return `<div class="sidebar-group sidebar-group--toc"><p>${
    isEn ? 'On This Page' : 'এই পেজে'
  }</p>${links}</div>`
}

/** Insert the accordion as the article lede's last child, where the shell
 *  renders it. Anchored on the lede so a page without one is left alone. */
function insertPageToc(html, toc) {
  if (!toc) return html
  const ledeStart = html.indexOf('<div class="article-lede">')
  if (ledeStart === -1) return html
  const articleStart = html.indexOf('<article class="article', ledeStart)
  if (articleStart === -1) return html
  const closers = '</div></div>'
  if (html.slice(articleStart - closers.length, articleStart) !== closers) return html
  return `${html.slice(0, articleStart - closers.length)}</div>${toc}</div>${html.slice(articleStart)}`
}

/** The sidebar's last group, immediately before the standing contribution note. */
function insertSidebarToc(html, group) {
  const anchor = '<p class="sidebar-note">'
  if (!group || !html.includes(anchor)) return html
  return html.replace(anchor, `${group}${anchor}`)
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
      name: isEn ? 'Home' : 'হোম',
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

function visibleCollectionItemsFor($, page) {
  if (page.slug === 'contributors') {
    return $('.contributor-list .contributor-row')
      .map((index, element) => {
        const identity = $(element).find('.contributor-row__identity strong').first()
        const name = identity.text().trim()
        if (!name) return null
        const profileUrl = identity.find('a[href]').first().attr('href')
        const item = { '@type': 'Person', name }
        if (profileUrl) item.url = profileUrl
        return { '@type': 'ListItem', position: index + 1, item }
      })
      .get()
      .filter(Boolean)
  }

  if (page.slug.startsWith('directory/')) {
    return $('.directory-card')
      .map((index, element) => {
        const card = $(element)
        const name = card.find('h3').first().text().trim()
        if (!name) return null
        const sourceUrl = card.find('.directory-card__source a[href]').first().attr('href')
        const description = card.find('.directory-card__note').first().text().trim()
        const item = { '@type': 'Thing', name }
        if (sourceUrl) item.url = sourceUrl
        if (description) item.description = description
        return { '@type': 'ListItem', position: index + 1, item }
      })
      .get()
      .filter(Boolean)
  }

  return []
}

function schemaFor(page, wordCount, visibleCollectionItems = []) {
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
    page.slug === 'contributors' ||
    page.slug === 'directory' ||
    page.slug.startsWith('directory/') ||
    children.length > 0
  // /contribute and /contact invite an action rather than teaching something,
  // so neither is an Article: they carry no publication date a reader should
  // weigh, and marking them up as one would put a stale "last updated" beside
  // an address that has not changed.
  const isUtility = isUtilityPage(page)
  const isArticle = !isHome && !isAbout && !isCollection && !isUtility
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
    sameAs: ORGANIZATION_SAME_AS,
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
    },
    publisher: { '@id': organizationNode['@id'] },
    isAccessibleForFree: true,
    license: CONTENT_LICENSE_URL,
    copyrightHolder: { '@id': organizationNode['@id'] }
  }

  if (!isUtility && page.published) pageNode.datePublished = page.published
  if (!isUtility && page.date) pageNode.dateModified = page.date
  const collectionItems = visibleCollectionItems.length > 0
    ? visibleCollectionItems
    : children.map((child, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: child.fullTitle,
        url: canonicalUrl(child.route)
      }))
  if (isCollection && collectionItems.length > 0) {
    pageNode.mainEntity = {
      '@type': 'ItemList',
      numberOfItems: collectionItems.length,
      itemListElement: collectionItems
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
  // The head block below is rebuilt from scratch on every run. The heading
  // lists are written into the body, where there is nothing to strip them by,
  // so a second run over the same output has to leave them alone.
  const headingsAlreadyWritten = html.includes('<meta name="deshi:toc"')
  html = html.replace(/\n?<!-- deshi-seo:start -->[\s\S]*?<!-- deshi-seo:end -->\n?/g, '')

  const $ = load(html)
  const documentTitle = $('title').first().text().trim() || page.fullTitle
  const description = $('meta[name="description"]').first().attr('content') || page.description || DEFAULT_DESCRIPTIONS[page.locale]
  const articleText = $('.article').text().trim()
  const wordCount = articleText ? articleText.split(/\s+/).length : 0
  const isEn = page.locale === 'en'
  // The shell shows no page headings on the two landing pages, so neither does this.
  const shellHeadings = page.slug === '' ? [] : collectShellHeadings($)
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
  const pairedPage = isEn ? pairedBn : pairedEn
  const hasIndexablePair = !page.stub && pairedBn && pairedEn && !pairedBn.stub && !pairedEn.stub
  const pageChildren = childrenFor(page)
  const isCollectionPage =
    page.slug === 'sitemap' ||
    page.slug === 'contributors' ||
    page.slug === 'directory' ||
    page.slug.startsWith('directory/') ||
    pageChildren.length > 0
  const ogType = page.stub ||
    page.slug === '' ||
    isCollectionPage ||
    page.slug === 'about' ||
    isUtilityPage(page)
    ? 'website'
    : 'article'
  const robots = page.stub
    ? 'noindex, follow, noarchive'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

  const tags = [
    '<!-- deshi-seo:start -->',
    `<link rel="canonical" href="${escapeHtml(url)}"/>`,
    ...(!page.stub ? [`<link rel="describedby" href="${canonicalUrl('/llms.txt')}"/>`] : []),
    // Bengali pages only: the English tree renders no Bengali codepoints, so the
    // face's unicode-range keeps it unfetched there and a preload would be pure
    // cost. crossorigin is required or the preload misses and the font is
    // fetched twice.
    ...(bengaliFontUrl && !isEn
      ? [`<link rel="preload" as="font" type="font/woff2" href="${escapeHtml(bengaliFontUrl)}" crossorigin="anonymous"/>`]
      : []),
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

  // Pagefind builds separate indexes from <html lang>, which is the right
  // default: a reader should stay in the language they chose. The paired title
  // is nevertheless valuable search vocabulary. Index it as metadata so an
  // English phrase can find the Bangla route (and vice versa) without merging
  // both indexes and returning duplicate-language pages. Metadata also stays
  // out of excerpts, unlike hidden body copy.
  if (pairedPage) {
    tags.push(
      `<meta data-pagefind-meta="alternate-title[content]" content="${escapeHtml(pairedPage.fullTitle)}"/>`
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
    `<meta property="og:image:alt" content="${escapeHtml(isEn ? 'Deshi Startup, the Bangla-first startup guide for Bangladesh' : 'দেশি স্টার্টআপ, বাংলাদেশে স্টার্টআপ গড়ার উন্মুক্ত গাইড')}"/>`,
    '<meta name="twitter:card" content="summary_large_image"/>',
    `<meta name="twitter:title" content="${escapeHtml(socialTitle)}"/>`,
    `<meta name="twitter:description" content="${escapeHtml(description)}"/>`,
    `<meta name="twitter:image" content="${DEFAULT_OG_IMAGE}"/>`,
    `<meta name="twitter:image:alt" content="${escapeHtml(isEn ? 'Deshi Startup, the Bangla-first startup guide for Bangladesh' : 'দেশি স্টার্টআপ, বাংলাদেশে স্টার্টআপ গড়ার উন্মুক্ত গাইড')}"/>`
  )

  if (ogType === 'article') {
    if (page.published) tags.push(`<meta property="article:published_time" content="${page.published}"/>`)
    if (page.date) tags.push(`<meta property="article:modified_time" content="${page.date}"/>`)
    tags.push(`<meta property="article:author" content="${SITE_URL}/"/>`)
  }

  // The client shell's meta bar reads these instead of downloading the
  // site-wide date maps. Emitted for every page, not just article-typed ones,
  // because collection and hub pages show the same line.
  if (page.date) tags.push(`<meta name="deshi:updated" content="${page.date}"/>`)
  if (page.verified) tags.push(`<meta name="deshi:verified" content="${page.verified}"/>`)

  // Tells the shell the heading lists below are already in the HTML, so its
  // first client render reproduces them instead of adding them after paint.
  if (shellHeadings.length > 0) tags.push('<meta name="deshi:toc" content="1"/>')

  const schema = schemaFor(page, wordCount, visibleCollectionItemsFor($, page))
  if (schema) tags.push(`<script type="application/ld+json" data-deshi-schema>${jsonLd(schema)}</script>`)
  tags.push('<!-- deshi-seo:end -->')

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(expectedDocumentTitle)}</title>`)
  html = html.replace(/(<html\b[^>]*\blang=)["'][^"']*["']/i, `$1"${htmlLanguage}"`)
  html = html.replace('</head>', `${tags.join('')}\n</head>`)
  // The client shell discovers the page title after hydration; give the static
  // HTML the real breadcrumb leaf (the component suppresses the hydration diff).
  html = html.replace('<li aria-current="page">…</li>', `<li aria-current="page">${escapeHtml(page.title)}</li>`)
  if (shellHeadings.length > 0 && !headingsAlreadyWritten) {
    html = insertSidebarToc(html, sidebarTocHtml(shellHeadings, isEn))
    html = insertPageToc(html, pageTocHtml(shellHeadings, isEn))
  }
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
  console.log(
    `postbuild SEO: enriched ${enriched} pages; noindexed ${noindexed} stubs (${path.relative(root, outDir)})`
  )
}
