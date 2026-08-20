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
import snapshotData from '../app/generated/contributors.json' with { type: 'json' }
import {
  contributorProfilePath,
  prepareContributorSnapshot
} from '../app/lib/contributor-leaderboard.mjs'
import { pageBylineHtml } from '../app/lib/page-byline.mjs'
import { pageCreditsHtml } from '../app/lib/page-credits.mjs'
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
import {
  eventsForLocale,
  fillPageByline,
  fillPageCredits
} from './postbuild-contributors.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { htmlDir: outDir } = resolveBuildOutput(root)
const pages = JSON.parse(fs.readFileSync(path.join(root, 'app', 'generated', 'seo-pages.json'), 'utf8'))
const contributorView = prepareContributorSnapshot(snapshotData)
const contributorProfileById = new Map(
  contributorView.rankedProfiles.map((profile) => [profile.id, profile])
)
const contributorOrganizationById = new Map(
  contributorView.organizations.map((organization) => [organization.id, organization])
)
const contributionEventsByTarget = new Map()
for (const event of contributorView.events) {
  for (const target of event.targets) {
    const events = contributionEventsByTarget.get(target.path) || []
    events.push(event)
    contributionEventsByTarget.set(target.path, events)
  }
}

const pageByLocaleSlug = new Map(pages.map((page) => [`${page.locale}:${page.slug}`, page]))
const pageByRoute = new Map(pages.map((page) => [page.route, page]))
const writtenPages = pages.filter((page) => !page.stub)
const UTILITY_SLUGS = new Set(['contribute', 'contact'])

function isContributorProfile(page) {
  return page.kind === 'contributor-profile'
}

function contributorProfileForPage(page) {
  return isContributorProfile(page)
    ? contributorProfileById.get(page.profileId) || null
    : null
}

function contributionEventsForPage(page) {
  if (isContributorProfile(page) || page.slug.includes('contributors')) return []
  const target = `/${page.slug}`
  return eventsForLocale(contributionEventsByTarget.get(target) || [], page.locale)
}

function isUtilityPage(page) {
  return UTILITY_SLUGS.has(page.slug)
}

function htmlFileFor(route) {
  return path.join(outDir, route === '/' ? 'index.html' : `${route.slice(1)}.html`)
}

/* Contributor media paths are resolved by app/lib/media.ts while Next renders
   the static profile. Read that rendered src once, before enriching any page,
   so ProfilePage and article Person nodes use the same delivery URL without a
   second media-registry resolver in this postbuild pass. */
function renderedContributorAvatarUrls() {
  const avatars = new Map()
  for (const page of pages) {
    if (!isContributorProfile(page)) continue
    const file = htmlFileFor(page.route)
    if (!fs.existsSync(file)) continue
    const $ = load(fs.readFileSync(file, 'utf8'))
    const src = $('.contributor-profile__avatar img[src]').first().attr('src')
    if (!src) continue
    const existing = avatars.get(page.profileId)
    if (existing && existing !== src) {
      throw new Error(`Contributor ${page.profileId} rendered different avatar URLs across locales`)
    }
    avatars.set(page.profileId, src)
  }
  return avatars
}

const contributorAvatarUrlById = renderedContributorAvatarUrls()

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

function stripAuthorMetadata(html) {
  // Next's root metadata cannot know which accepted author belongs to a route.
  // Remove its generic author tags so this route-aware pass remains the only
  // owner of meta author and rel=author in the exported document.
  return html.replace(
    /<(?:meta|link)\b(?=[^>]*\b(?:name|rel)=["']author["'])[^>]*\/?\s*>/gi,
    ''
  )
}

function jsonLd(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function contributorEntityId(profile) {
  return `${canonicalUrl(contributorProfilePath(profile.slug, 'bn'))}#person`
}

function publicImageUrl(value) {
  if (!value) return null
  return value.startsWith('/') ? `${SITE_URL}${value}` : value
}

function contributorPersonNode(profile) {
  const profileUrl = canonicalUrl(contributorProfilePath(profile.slug, 'bn'))
  const node = {
    '@type': 'Person',
    '@id': contributorEntityId(profile),
    name: profile.displayName,
    url: profileUrl
  }
  if (profile.headline) node.description = profile.headline
  const image = publicImageUrl(contributorAvatarUrlById.get(profile.id))
  if (image) node.image = image
  if (profile.links.length > 0) node.sameAs = profile.links.map((link) => link.url)
  if (profile.organization) {
    node.affiliation = {
      '@type': 'Organization',
      name: profile.organization.name,
      ...(profile.organization.url ? { url: profile.organization.url } : {})
    }
  }
  return node
}

function namedCreditsForEvents(events) {
  return events.flatMap((event) => event.credits.flatMap((credit) => {
    const profile = credit.profileId ? contributorProfileById.get(credit.profileId) : null
    return profile ? [{ event, credit, profile }] : []
  }))
}

function uniqueProfiles(credits) {
  const seen = new Set()
  return credits.flatMap(({ profile }) => {
    if (seen.has(profile.id)) return []
    seen.add(profile.id)
    return [profile]
  })
}

function basePathFromHtml(html) {
  const match = html.match(/(?:src|href)="([^"]*\/_next\/)/)
  if (!match) return ''
  const prefix = match[1].slice(0, match[1].indexOf('/_next/'))
  return prefix.startsWith('/') ? prefix : ''
}

function localBuildHref(route, basePath) {
  if (!route.startsWith('/') || !basePath) return route
  return route === '/' ? basePath : `${basePath}${route}`
}

function excludeProfileFromPagefind(html) {
  return html.replace(/<html\b([^>]*)>/i, (tag, attributes) => {
    if (/\bdata-pagefind-ignore=/.test(attributes)) return tag
    return `<html${attributes} data-pagefind-ignore="all">`
  })
}

/**
 * The two "On this page" lists.
 *
 * The shared client shell cannot know the route while the static HTML is
 * rendered, so it used to collect the article's h2s after hydration. That put a
 * collapsed accordion above the article a moment after first paint and pushed
 * the whole page down, a layout shift on every guide, charged to exactly the
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
    return $('.contributor-list--ranked .contributor-row')
      .map((index, element) => {
        const row = $(element)
        const identity = row.find('.contributor-row__identity strong').first()
        const name = identity.text().trim()
        if (!name) return null
        const profileSlug = row.attr('data-contributor-profile')
        const profilePath = contributorProfilePath(profileSlug, page.locale)
        const item = { '@type': 'Person', name }
        if (profilePath) item.url = canonicalUrl(profilePath)
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

function schemaFor(page, wordCount, visibleCollectionItems = [], contributionEvents = []) {
  if (page.stub) return null

  const isEn = page.locale === 'en'
  const locale = isEn ? 'en-BD' : 'bn-BD'
  const url = canonicalUrl(page.route)
  const description = page.description || DEFAULT_DESCRIPTIONS[page.locale]
  const children = childrenFor(page)
  const isHome = page.slug === ''
  const isAbout = page.slug === 'about'
  const isProfile = isContributorProfile(page)
  const contributorProfile = contributorProfileForPage(page)
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
  const isArticle = !isHome && !isAbout && !isCollection && !isUtility && !isProfile
  const pageType = isProfile
    ? 'ProfilePage'
    : isAbout
      ? 'AboutPage'
      : isCollection
        ? 'CollectionPage'
        : 'WebPage'
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
      url: `${SITE_URL}/deshi-mark.webp`,
      contentUrl: `${SITE_URL}/deshi-mark.webp`,
      width: 384,
      height: 384
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
  if (isProfile && contributorProfile) {
    const personNode = contributorPersonNode(contributorProfile)
    pageNode.mainEntity = { '@id': personNode['@id'] }
    graph.push(personNode)
  }
  if (isArticle) {
    const namedCredits = namedCreditsForEvents(contributionEvents)
    const namedAuthors = uniqueProfiles(
      namedCredits.filter(({ credit }) => credit.roles.includes('author'))
    )
    const namedContributors = uniqueProfiles(
      namedCredits.filter(({ credit }) => credit.roles.some((role) => role !== 'author'))
    )
    const hasAnonymousAuthor = contributionEvents.some((event) =>
      event.credits.some((credit) => !credit.profileId && credit.roles.includes('author'))
    )
    const hasAnonymousContributor = contributionEvents.some((event) =>
      event.credits.some((credit) => !credit.profileId && credit.roles.some((role) => role !== 'author'))
    )
    const anonymousPersonId = `${url}#anonymous-contributor`
    const authorReferences = namedAuthors.map((profile) => ({ '@id': contributorEntityId(profile) }))
    const contributorReferences = namedContributors.map((profile) => ({ '@id': contributorEntityId(profile) }))
    if (hasAnonymousAuthor) authorReferences.push({ '@id': anonymousPersonId })
    if (hasAnonymousContributor) contributorReferences.push({ '@id': anonymousPersonId })
    const articleNode = {
      '@type': 'Article',
      '@id': `${url}#article`,
      url,
      headline: page.fullTitle,
      description,
      inLanguage: locale,
      mainEntityOfPage: { '@id': `${url}#webpage` },
      isPartOf: { '@id': `${SITE_URL}/#website` },
      author: authorReferences.length > 0
        ? (authorReferences.length === 1 ? authorReferences[0] : authorReferences)
        : { '@id': `${SITE_URL}/#organization` },
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
    if (contributorReferences.length > 0) {
      articleNode.contributor = contributorReferences.length === 1
        ? contributorReferences[0]
        : contributorReferences
    }
    if (page.published) articleNode.datePublished = page.published
    if (page.date) articleNode.dateModified = page.date
    if (wordCount > 0) articleNode.wordCount = wordCount
    pageNode.mainEntity = { '@id': articleNode['@id'] }
    graph.push(articleNode)
    for (const profile of uniqueProfiles(namedCredits)) graph.push(contributorPersonNode(profile))
    if (hasAnonymousAuthor || hasAnonymousContributor) {
      graph.push({
        '@type': 'Person',
        '@id': anonymousPersonId,
        name: isEn ? 'Anonymous contributor' : 'নাম প্রকাশে অনিচ্ছুক কন্ট্রিবিউটর'
      })
    }
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
  html = stripAuthorMetadata(html)

  const $ = load(html)
  const documentTitle = $('title').first().text().trim() || page.fullTitle
  const description = $('meta[name="description"]').first().attr('content') || page.description || DEFAULT_DESCRIPTIONS[page.locale]
  const articleText = $('.article').text().trim()
  const wordCount = articleText ? articleText.split(/\s+/).length : 0
  const isEn = page.locale === 'en'
  const contributorProfile = contributorProfileForPage(page)
  const pageContributionEvents = contributionEventsForPage(page)
  const pageNamedCredits = namedCreditsForEvents(pageContributionEvents)
  const pageNamedAuthors = uniqueProfiles(
    pageNamedCredits.filter(({ credit }) => credit.roles.includes('author'))
  )
  const buildBasePath = basePathFromHtml(html)
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
  const ogType = isContributorProfile(page)
    ? 'profile'
    : page.stub ||
      page.slug === '' ||
      isCollectionPage ||
      page.slug === 'about' ||
      isUtilityPage(page)
      ? 'website'
      : 'article'
  // The manifest classifies authored MDX before build output loses its source
  // components. Do not infer a guide from SEO type or the number of written
  // children: both misclassify empty section hubs and lookup pages.
  const showsByline = page.guide === true
  const robots = page.stub
    ? 'noindex, follow, noarchive'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  const socialImage = contributorProfile
    ? `${SITE_URL}/contributor-cards/${contributorProfile.slug}.png`
    : DEFAULT_OG_IMAGE
  const socialImageAlt = contributorProfile
    ? (isEn
        ? `${contributorProfile.displayName}'s Deshi Startup contributor card`
        : `${contributorProfile.displayName}-এর দেশি স্টার্টআপ কন্ট্রিবিউটর কার্ড`)
    : (isEn
        ? 'Deshi Startup, the free, open-source manual for building startups in Bangladesh'
        : 'দেশি স্টার্টআপ, বাংলাদেশে স্টার্টআপ গড়ার ফ্রি, ওপেন-সোর্স ম্যানুয়াল')
  const metaAuthor = contributorProfile?.displayName ||
    (pageNamedAuthors.length > 0
      ? pageNamedAuthors.map((profile) => profile.displayName).join(', ')
      : `${SITE_NAME} contributors`)
  const authorProfiles = contributorProfile ? [contributorProfile] : pageNamedAuthors
  const authorLinks = authorProfiles.length > 0
    ? authorProfiles.map((profile) =>
        `<link rel="author" href="${canonicalUrl(contributorProfilePath(profile.slug, page.locale))}"/>`
      )
    : [`<link rel="author" href="${SITE_URL}/"/>`]

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
    `<meta name="author" content="${escapeHtml(metaAuthor)}"/>`,
    ...authorLinks,
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
    `<meta property="og:image" content="${socialImage}"/>`,
    '<meta property="og:image:width" content="1200"/>',
    '<meta property="og:image:height" content="630"/>',
    '<meta property="og:image:type" content="image/png"/>',
    `<meta property="og:image:alt" content="${escapeHtml(socialImageAlt)}"/>`,
    '<meta name="twitter:card" content="summary_large_image"/>',
    `<meta name="twitter:title" content="${escapeHtml(socialTitle)}"/>`,
    `<meta name="twitter:description" content="${escapeHtml(description)}"/>`,
    `<meta name="twitter:image" content="${socialImage}"/>`,
    `<meta name="twitter:image:alt" content="${escapeHtml(socialImageAlt)}"/>`
  )

  if (ogType === 'article') {
    if (page.published) tags.push(`<meta property="article:published_time" content="${page.published}"/>`)
    if (page.date) tags.push(`<meta property="article:modified_time" content="${page.date}"/>`)
    if (pageNamedAuthors.length > 0) {
      for (const profile of pageNamedAuthors) {
        tags.push(
          `<meta property="article:author" content="${canonicalUrl(contributorProfilePath(profile.slug, page.locale))}"/>`
        )
      }
    } else {
      tags.push(`<meta property="article:author" content="${SITE_URL}/"/>`)
    }
  }

  // The client shell's meta bar reads these instead of downloading the
  // site-wide date maps. Emitted for every page, not just article-typed ones,
  // because collection and hub pages show the same line.
  if (page.date) tags.push(`<meta name="deshi:updated" content="${page.date}"/>`)
  if (page.verified) tags.push(`<meta name="deshi:verified" content="${page.verified}"/>`)

  // Tells the shell the heading lists below are already in the HTML, so its
  // first client render reproduces them instead of adding them after paint.
  if (shellHeadings.length > 0) tags.push('<meta name="deshi:toc" content="1"/>')

  const schema = schemaFor(
    page,
    wordCount,
    visibleCollectionItemsFor($, page),
    pageContributionEvents
  )
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
  html = fillPageByline(
    html,
    showsByline
      ? pageBylineHtml({
          events: pageContributionEvents,
          locale: page.locale,
          profileById: contributorProfileById,
          href: (route) => localBuildHref(route, buildBasePath)
        })
      : ''
  )
  html = fillPageCredits(
    html,
    pageCreditsHtml({
      events: pageContributionEvents,
      locale: page.locale,
      profileById: contributorProfileById,
      organizationById: contributorOrganizationById,
      href: (route) => localBuildHref(route, buildBasePath)
    })
  )
  if (isContributorProfile(page)) html = excludeProfileFromPagefind(html)
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
