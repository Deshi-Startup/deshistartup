#!/usr/bin/env node
/**
 * Production-output SEO regression audit.
 * Run after `npm run build` (the build runs it automatically at the end).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'cheerio'
import robotsParser from 'robots-parser'
import snapshotData from '../app/generated/contributors.json' with { type: 'json' }
import {
  ROLE_LABELS,
  contributorProfilePath,
  prepareContributorSnapshot
} from '../app/lib/contributor-leaderboard.mjs'
import {
  DEFAULT_OG_IMAGE,
  INDEXNOW_KEY,
  ORGANIZATION_SAME_AS,
  SITE_NAME,
  SITE_URL,
  canonicalUrl
} from '../app/seo.config.mjs'
import { resolveBuildOutput } from './build-output.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { htmlDir: outDir, staticDir } = resolveBuildOutput(root)
const pages = JSON.parse(fs.readFileSync(path.join(root, 'app', 'generated', 'seo-pages.json'), 'utf8'))
const contributorView = prepareContributorSnapshot(snapshotData)
const contributorProfileById = new Map(
  contributorView.rankedProfiles.map((profile) => [profile.id, profile])
)
const contributorEventsByTarget = new Map()
for (const event of contributorView.events) {
  for (const target of event.targets) {
    const events = contributorEventsByTarget.get(target.path) || []
    events.push(event)
    contributorEventsByTarget.set(target.path, events)
  }
}
const pageByLocaleSlug = new Map(pages.map((page) => [`${page.locale}:${page.slug}`, page]))
const indexable = pages.filter((page) => !page.stub)
const indexableRoutes = new Set(indexable.map((page) => page.route))
const allRoutes = new Set(pages.map((page) => page.route))
const inbound = new Map(indexable.map((page) => [page.route, 0]))
const errors = []
const warnings = []
const titleOwners = new Map()
const descriptionOwners = new Map()

const htmlFileFor = (route) => path.join(outDir, route === '/' ? 'index.html' : `${route.slice(1)}.html`)
const record = (collection, message) => collection.push(message)

function isContributorProfile(page) {
  return page.kind === 'contributor-profile'
}

function referenceIds(value) {
  return (Array.isArray(value) ? value : value ? [value] : [])
    .map((reference) => reference?.['@id'])
    .filter(Boolean)
}

function normalizeInternalHref(href, sourceRoute) {
  if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:|data:)/i.test(href)) return null
  let parsed
  try {
    parsed = new URL(href, canonicalUrl(sourceRoute))
  } catch {
    return null
  }
  if (parsed.origin !== SITE_URL) return null

  let route = decodeURI(parsed.pathname)
  if (route === '/deshistartup') route = '/'
  else if (route.startsWith('/deshistartup/')) route = route.slice('/deshistartup'.length)
  if (route.endsWith('.html')) route = route.slice(0, -5)
  if (route.length > 1) route = route.replace(/\/$/, '')
  if (/\.[a-z0-9]{2,8}$/i.test(route)) return null
  return route || '/'
}

for (const page of pages) {
  const file = htmlFileFor(page.route)
  if (!fs.existsSync(file)) {
    record(errors, `${page.route}: missing exported HTML (${path.relative(root, file)})`)
    continue
  }

  const html = fs.readFileSync(file, 'utf8')
  const $ = load(html)
  const expectedLanguage = page.locale === 'en' ? 'en' : 'bn'
  const titles = $('title')
  const descriptions = $('meta[name="description"]')
  const canonicals = $('link[rel="canonical"]')
  const llmsDescriptions = $('link[rel="describedby"]')
  const robots = $('meta[name="robots"]').attr('content') || ''
  const alternates = $('link[rel="alternate"][hreflang]')
  const schemaScripts = $('script[data-deshi-schema][type="application/ld+json"]')
  const contributorProfile = isContributorProfile(page)
    ? contributorProfileById.get(page.profileId) || null
    : null
  const expectedContributionEvents = isContributorProfile(page)
    ? []
    : contributorEventsByTarget.get(`/${page.slug}`) || []
  const authorProfiles = contributorProfile
    ? [contributorProfile]
    : [...new Map(expectedContributionEvents.flatMap((event) =>
        event.credits.flatMap((credit) => {
          if (!credit.roles.includes('author') || !credit.profileId) return []
          const profile = contributorProfileById.get(credit.profileId)
          return profile ? [[profile.id, profile]] : []
        })
      )).values()]
  const expectedMetaAuthor = authorProfiles.length > 0
    ? authorProfiles.map((profile) => profile.displayName).join(', ')
    : `${SITE_NAME} contributors`
  const expectedAuthorLinks = authorProfiles.length > 0
    ? authorProfiles.map((profile) => canonicalUrl(contributorProfilePath(profile.slug, page.locale)))
    : [`${SITE_URL}/`]

  if ($('html').attr('lang') !== expectedLanguage) {
    record(errors, `${page.route}: html lang is ${$('html').attr('lang') || 'missing'}, expected ${expectedLanguage}`)
  }
  if (titles.length !== 1 || !titles.first().text().trim()) {
    record(errors, `${page.route}: expected exactly one non-empty title, found ${titles.length}`)
  }
  if (page.locale === 'en' && titles.first().text().includes('দেশি স্টার্টআপ')) {
    record(errors, `${page.route}: English title contains the Bengali site-name boilerplate`)
  }
  if (descriptions.length !== 1 || !descriptions.first().attr('content')?.trim()) {
    record(errors, `${page.route}: expected exactly one non-empty meta description, found ${descriptions.length}`)
  }
  if ($('h1').length !== 1) record(errors, `${page.route}: expected one H1, found ${$('h1').length}`)
  $('article img').each((_, image) => {
    const alt = $(image).attr('alt')
    const contributorRow = $(image).closest('.contributor-row')
    const redundantContributorAvatar =
      alt === '' &&
      contributorRow.length > 0 &&
      contributorRow.find('.contributor-row__identity').first().text().trim().length > 0
    const decorative =
      $(image).attr('role') === 'presentation' ||
      $(image).attr('aria-hidden') === 'true' ||
      redundantContributorAvatar
    if (!decorative && (!alt || !alt.trim())) {
      record(errors, `${page.route}: article image is missing meaningful alt text`)
    }
  })
  if (canonicals.length !== 1 || canonicals.first().attr('href') !== canonicalUrl(page.route)) {
    record(errors, `${page.route}: canonical is missing, duplicated, or incorrect`)
  }
  const metaAuthors = $('meta[name="author"]')
  if (metaAuthors.length !== 1 || metaAuthors.first().attr('content') !== expectedMetaAuthor) {
    record(errors, `${page.route}: meta author is missing, duplicated, or incorrect`)
  }
  const authorLinks = $('link[rel="author"]').toArray().map((node) => $(node).attr('href'))
  if (
    authorLinks.length !== expectedAuthorLinks.length ||
    expectedAuthorLinks.some((href) => !authorLinks.includes(href))
  ) {
    record(errors, `${page.route}: rel=author does not match the route's accepted author`)
  }
  if (isContributorProfile(page) && $('html').attr('data-pagefind-ignore') !== 'all') {
    record(errors, `${page.route}: contributor profile is not excluded from Pagefind`)
  }

  if (page.stub) {
    if (!/\bnoindex\b/i.test(robots) || !/\bfollow\b/i.test(robots)) {
      record(errors, `${page.route}: stub must be noindex, follow`)
    }
    if (schemaScripts.length !== 0) record(errors, `${page.route}: stub must not publish structured data`)
    if (alternates.length !== 0) record(errors, `${page.route}: noindex stub must not publish hreflang`)
  } else {
    if (!/^index, follow/i.test(robots)) record(errors, `${page.route}: written page is not index, follow`)
    if (schemaScripts.length !== 1) record(errors, `${page.route}: expected one Deshi Startup JSON-LD graph`)
    if (
      llmsDescriptions.length !== 1 ||
      llmsDescriptions.first().attr('href') !== canonicalUrl('/llms.txt')
    ) {
      record(errors, `${page.route}: missing or incorrect llms.txt discovery link`)
    }

    const bnPair = pageByLocaleSlug.get(`bn:${page.slug}`)
    const enPair = pageByLocaleSlug.get(`en:${page.slug}`)
    if (bnPair && enPair && !bnPair.stub && !enPair.stub) {
      const actual = new Map(alternates.toArray().map((node) => [$(node).attr('hreflang'), $(node).attr('href')]))
      const expected = new Map([
        ['bn-BD', canonicalUrl(bnPair.route)],
        ['en-BD', canonicalUrl(enPair.route)],
        ['x-default', canonicalUrl(bnPair.route)]
      ])
      if (actual.size !== expected.size || [...expected].some(([key, value]) => actual.get(key) !== value)) {
        record(errors, `${page.route}: incomplete or incorrect reciprocal hreflang set`)
      }
    }
  }

  for (const selector of [
    'meta[property="og:title"]',
    'meta[property="og:description"]',
    'meta[property="og:url"]',
    'meta[property="og:image"]',
    'meta[name="twitter:card"]',
    'meta[name="twitter:title"]',
    'meta[name="twitter:description"]',
    'meta[name="twitter:image"]'
  ]) {
    if ($(selector).length !== 1) record(errors, `${page.route}: expected one ${selector}`)
  }
  if ($('meta[property="og:url"]').attr('content') !== canonicalUrl(page.route)) {
    record(errors, `${page.route}: og:url does not match canonical`)
  }
  const expectedOgImage = contributorProfile
    ? `${SITE_URL}/contributor-cards/${contributorProfile.slug}.png`
    : DEFAULT_OG_IMAGE
  if ($('meta[property="og:image"]').attr('content') !== expectedOgImage) {
    record(errors, `${page.route}: wrong Open Graph image`)
  }

  if (!page.stub && schemaScripts.length === 1) {
    try {
      const schema = JSON.parse(schemaScripts.first().text())
      const graph = Array.isArray(schema['@graph']) ? schema['@graph'] : []
      const types = new Set(graph.map((node) => node['@type']))
      if (
        !types.has('Article') &&
        !types.has('AboutPage') &&
        !types.has('CollectionPage') &&
        !types.has('ProfilePage') &&
        !types.has('WebPage')
      ) {
        record(errors, `${page.route}: JSON-LD has no primary page type`)
      }
      if (!types.has('Organization') || !types.has('WebSite')) {
        record(errors, `${page.route}: JSON-LD must define its publisher Organization and WebSite`)
      }
      const organization = graph.find((node) => node['@type'] === 'Organization')
      const sameAs = new Set(Array.isArray(organization?.sameAs) ? organization.sameAs : [])
      if (
        sameAs.size !== ORGANIZATION_SAME_AS.length ||
        ORGANIZATION_SAME_AS.some((url) => !sameAs.has(url))
      ) {
        record(errors, `${page.route}: Organization sameAs does not list every official profile`)
      }
      if (page.slug && !types.has('BreadcrumbList')) record(errors, `${page.route}: JSON-LD has no BreadcrumbList`)
      if (!page.slug && (!types.has('Organization') || !types.has('WebSite'))) {
        record(errors, `${page.route}: home JSON-LD must define Organization and WebSite`)
      }
      if (page.slug === 'about' && !types.has('AboutPage')) {
        record(errors, `${page.route}: publisher trust page must use AboutPage schema`)
      }
      if (page.slug.startsWith('directory/') && !types.has('CollectionPage')) {
        record(errors, `${page.route}: directory listing must use CollectionPage schema`)
      }
      if (isContributorProfile(page)) {
        const profilePage = graph.find((node) => node['@type'] === 'ProfilePage')
        const person = graph.find((node) => node['@id'] === profilePage?.mainEntity?.['@id'])
        if (!profilePage || person?.['@type'] !== 'Person' || person.name !== contributorProfile?.displayName) {
          record(errors, `${page.route}: ProfilePage does not resolve to the expected Person`)
        }
        if ($('meta[property="og:type"]').attr('content') !== 'profile') {
          record(errors, `${page.route}: contributor profile must use profile Open Graph type`)
        }
      }
      const article = graph.find((node) => node['@type'] === 'Article')
      if (article) {
        const nodeIds = new Set(graph.map((node) => node['@id']).filter(Boolean))
        const authorIds = referenceIds(article.author)
        const contributorIds = referenceIds(article.contributor)
        if (authorIds.length === 0 || authorIds.some((id) => !nodeIds.has(id))) {
          record(errors, `${page.route}: Article author does not resolve to a public graph entity`)
        }
        if (article.publisher?.['@id'] !== `${SITE_URL}/#organization`) {
          record(errors, `${page.route}: Article publisher does not resolve to the publisher Organization`)
        }
        if (article.image?.url !== DEFAULT_OG_IMAGE || !article.publishingPrinciples) {
          record(errors, `${page.route}: Article image or publishing principles are missing`)
        }
        if (!article.headline || !article.datePublished || !article.dateModified) {
          record(errors, `${page.route}: Article headline or publication dates are missing`)
        }
        if (contributorIds.some((id) => !nodeIds.has(id))) {
          record(errors, `${page.route}: Article contributor does not resolve to a public graph entity`)
        }

        const expectedNamedAuthors = new Set()
        const expectedNamedContributors = new Set()
        let expectsAnonymousAuthor = false
        let expectsAnonymousContributor = false
        for (const event of expectedContributionEvents) {
          for (const credit of event.credits) {
            const profile = credit.profileId ? contributorProfileById.get(credit.profileId) : null
            if (credit.roles.includes('author')) {
              if (profile) expectedNamedAuthors.add(`${canonicalUrl(contributorProfilePath(profile.slug, 'bn'))}#person`)
              else expectsAnonymousAuthor = true
            }
            if (credit.roles.some((role) => role !== 'author')) {
              if (profile) expectedNamedContributors.add(`${canonicalUrl(contributorProfilePath(profile.slug, 'bn'))}#person`)
              else expectsAnonymousContributor = true
            }
          }
        }
        for (const id of expectedNamedAuthors) {
          if (!authorIds.includes(id)) record(errors, `${page.route}: accepted author is missing from Article author`)
        }
        for (const id of expectedNamedContributors) {
          if (!contributorIds.includes(id)) record(errors, `${page.route}: accepted non-author is missing from Article contributor`)
        }
        const anonymousId = `${canonicalUrl(page.route)}#anonymous-contributor`
        if (expectsAnonymousAuthor && !authorIds.includes(anonymousId)) {
          record(errors, `${page.route}: anonymous author credit is missing from Article author`)
        }
        if (expectsAnonymousContributor && !contributorIds.includes(anonymousId)) {
          record(errors, `${page.route}: anonymous non-author credit is missing from Article contributor`)
        }
      }
      const collection = graph.find((node) => node['@type'] === 'CollectionPage')
      if (collection && (page.slug === 'contributors' || page.slug.startsWith('directory/'))) {
        const visibleCount = page.slug === 'contributors'
          ? $('.contributor-list--ranked .contributor-row').length
          : $('.directory-card').length
        const items = collection.mainEntity?.itemListElement
        if (
          collection.mainEntity?.['@type'] !== 'ItemList' ||
          !Array.isArray(items) ||
          items.length !== visibleCount ||
          collection.mainEntity.numberOfItems !== visibleCount ||
          items.some((item, index) => item.position !== index + 1 || !item.item?.name)
        ) {
          record(errors, `${page.route}: CollectionPage ItemList does not match visible entries`)
        }
      }
    } catch (error) {
      record(errors, `${page.route}: invalid JSON-LD (${error.message})`)
    }
  }

  const renderedCredits = $('.page-credit')
  const expectedCredits = expectedContributionEvents.flatMap((event) =>
    event.credits.map((credit, index) => ({ event, credit, index }))
  )
  if (renderedCredits.length !== expectedCredits.length) {
    record(
      errors,
      `${page.route}: page credits show ${renderedCredits.length} entries, expected ${expectedCredits.length}`
    )
  }
  for (const { event, credit, index } of expectedCredits) {
    const row = renderedCredits.filter(
      `[data-contribution-event="${event.id}"][data-credit-index="${index}"]`
    )
    if (row.length !== 1) {
      record(errors, `${page.route}: missing or duplicate visible credit for ${event.id}:${index}`)
      continue
    }
    if (!row.text().includes(event.summary[page.locale])) {
      record(errors, `${page.route}: visible credit for ${event.id} has the wrong localized scope`)
    }
    if (row.find(`a[href="${event.evidenceUrl}"]`).length !== 1) {
      record(errors, `${page.route}: visible credit for ${event.id} has no exact evidence link`)
    }
    const profile = credit.profileId ? contributorProfileById.get(credit.profileId) : null
    if (profile) {
      const profileLink = row.find('.page-credit__person a[href]').attr('href')
      const expectedProfileRoute = contributorProfilePath(profile.slug, page.locale)
      if (normalizeInternalHref(profileLink, page.route) !== expectedProfileRoute) {
        record(errors, `${page.route}: visible credit for ${event.id} links to the wrong contributor profile`)
      }
    } else if (row.find('.page-credit__person a').length > 0) {
      record(errors, `${page.route}: anonymous credit for ${event.id} exposes a profile link`)
    }
  }

  if (page.slug === 'contributors') {
    const rankedRows = $('.contributor-list--ranked .contributor-row')
    if (rankedRows.length !== contributorView.rankedProfiles.length) {
      record(errors, `${page.route}: contributor register does not match the public snapshot`)
    }
    for (const profile of contributorView.rankedProfiles) {
      const row = rankedRows.filter(`[data-contributor-profile="${profile.slug}"]`)
      if (row.length !== 1) {
        record(errors, `${page.route}: missing or duplicate contributor row for ${profile.slug}`)
        continue
      }
      const confirmedIdentity = [profile.headline, profile.organization?.name].filter(Boolean)
      const expectedProfessional = confirmedIdentity.length
        ? confirmedIdentity.join(' · ')
        : profile.githubLogin
          ? `@${profile.githubLogin}`
          : ''
      const professional = row.find('.contributor-row__meta')
      if (
        professional.length !== (expectedProfessional ? 1 : 0) ||
        professional.text().trim() !== expectedProfessional
      ) {
        record(errors, `${page.route}: professional identity is malformed for ${profile.slug}`)
      }
      const localizedRoles = profile.roles.map((role) => ROLE_LABELS[role]?.[page.locale] || role)
      const roleCaption = page.locale === 'en'
        ? localizedRoles.length === 1 ? 'Role' : 'Roles'
        : 'ভূমিকা'
      const expectedRoles = `${roleCaption}: ${localizedRoles.join(' · ')}`
      const roleLine = row.find('.contributor-row__roles')
      if (roleLine.length !== 1 || roleLine.text().replace(/\s+/g, ' ').trim() !== expectedRoles) {
        record(errors, `${page.route}: contribution roles are malformed for ${profile.slug}`)
      }
    }

    const correctionLinks = $('.contributor-method > p:last-of-type a[href]')
    const expectedCorrectionRoute = page.locale === 'en' ? '/en/contact' : '/contact'
    const expectedCorrectionLabel = page.locale === 'en' ? 'contact us' : 'যোগাযোগ করুন'
    if (correctionLinks.length !== 1) {
      record(errors, `${page.route}: expected exactly one contributor correction contact link`)
    } else {
      const correctionLink = correctionLinks.first()
      if (normalizeInternalHref(correctionLink.attr('href'), page.route) !== expectedCorrectionRoute) {
        record(errors, `${page.route}: contributor correction link does not point to the localized contact page`)
      }
      if (correctionLink.text().trim() !== expectedCorrectionLabel) {
        record(errors, `${page.route}: contributor correction link has the wrong localized label`)
      }
    }
  }

  if (!page.stub) {
    const title = titles.first().text().trim()
    const description = descriptions.first().attr('content')?.trim() || ''
    if (titleOwners.has(title)) record(errors, `${page.route}: duplicate title also used by ${titleOwners.get(title)}`)
    else titleOwners.set(title, page.route)
    if (descriptionOwners.has(description)) {
      record(errors, `${page.route}: duplicate meta description also used by ${descriptionOwners.get(description)}`)
    } else descriptionOwners.set(description, page.route)
    if (title.length > 90) record(warnings, `${page.route}: long title (${title.length} characters)`)
    if (description.length < 60) record(warnings, `${page.route}: short meta description (${description.length} characters)`)
    if (description.length > 220) record(warnings, `${page.route}: long meta description (${description.length} characters)`)
  }

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href')
    const route = normalizeInternalHref(href, page.route)
    if (!route) return
    if (!allRoutes.has(route)) {
      record(errors, `${page.route}: broken internal link ${href} resolves to ${route}`)
      return
    }
    if (!page.stub && indexableRoutes.has(route) && route !== page.route) {
      inbound.set(route, (inbound.get(route) || 0) + 1)
    }
  })
}

for (const [route, count] of inbound) {
  if (count === 0) record(errors, `${route}: indexable orphan page with no inbound internal link`)
}

const sitemapPath = path.join(staticDir, 'sitemap.xml')
if (!fs.existsSync(sitemapPath)) {
  record(errors, 'sitemap.xml is missing from production output')
} else {
  const xml = fs.readFileSync(sitemapPath, 'utf8')
  const $xml = load(xml, { xmlMode: true })
  const locs = new Set($xml('url > loc').toArray().map((node) => $xml(node).text().trim()))
  const expected = new Set(indexable.map((page) => canonicalUrl(page.route)))
  if (locs.size !== expected.size) record(errors, `sitemap URL count is ${locs.size}, expected ${expected.size}`)
  for (const url of expected) if (!locs.has(url)) record(errors, `sitemap is missing ${url}`)
  for (const url of locs) if (!expected.has(url)) record(errors, `sitemap contains non-indexable or unknown URL ${url}`)
  if (!$xml('urlset').attr('xmlns:xhtml')) record(errors, 'sitemap.xml is missing the XHTML namespace for hreflang')
  $xml('url').each((_, node) => {
    const loc = $xml(node).find('> loc').text().trim()
    const route = [...indexable].find((page) => canonicalUrl(page.route) === loc)
    if (!route) return
    const expectedLastmod = route.date || ''
    const actualLastmod = $xml(node).find('> lastmod').text().trim()
    if (actualLastmod !== expectedLastmod) record(errors, `${loc}: sitemap lastmod is inaccurate`)
    const bnPair = pageByLocaleSlug.get(`bn:${route.slug}`)
    const enPair = pageByLocaleSlug.get(`en:${route.slug}`)
    if (bnPair && enPair && !bnPair.stub && !enPair.stub) {
      const alternates = new Map(
        $xml(node).find('> xhtml\\:link').toArray().map((link) => [
          $xml(link).attr('hreflang'),
          $xml(link).attr('href')
        ])
      )
      if (
        alternates.get('bn-BD') !== canonicalUrl(bnPair.route) ||
        alternates.get('en-BD') !== canonicalUrl(enPair.route) ||
        alternates.get('x-default') !== canonicalUrl(bnPair.route)
      ) {
        record(errors, `${loc}: sitemap hreflang set is incomplete or incorrect`)
      }
    }
  })
}

const robotsPath = path.join(staticDir, 'robots.txt')
if (!fs.existsSync(robotsPath)) {
  record(errors, 'robots.txt is missing from production output')
} else {
  const robots = fs.readFileSync(robotsPath, 'utf8')
  const parsedRobots = robotsParser(canonicalUrl('/robots.txt'), robots)
  for (const agent of ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'Claude-SearchBot', 'Claude-User', 'bingbot']) {
    if (!new RegExp(`User-agent: ${agent}`, 'i').test(robots)) record(errors, `robots.txt has no ${agent} policy`)
    if (!parsedRobots.isAllowed(`${SITE_URL}/start-here`, agent)) record(errors, `robots.txt blocks ${agent}`)
  }
  for (const agent of ['GPTBot', 'ClaudeBot', 'Google-Extended']) {
    if (!new RegExp(`User-agent: ${agent}`, 'i').test(robots)) record(errors, `robots.txt has no ${agent} policy`)
    if (parsedRobots.isAllowed(`${SITE_URL}/start-here`, agent) !== false) {
      record(errors, `robots.txt does not preserve the separate training-crawler policy for ${agent}`)
    }
  }
  if (!/Content-Signal:\s*search=yes,\s*ai-input=yes,\s*ai-train=no,\s*use=reference/i.test(robots)) {
    record(errors, 'robots.txt is missing the search/AI-input/training content-use signals')
  }
  if (!robots.includes(`Sitemap: ${canonicalUrl('/sitemap.xml')}`)) {
    record(errors, 'robots.txt has no canonical sitemap declaration')
  }
}

const llmsPath = path.join(staticDir, 'llms.txt')
if (!fs.existsSync(llmsPath)) {
  record(errors, 'llms.txt is missing from production output')
} else {
  const llms = fs.readFileSync(llmsPath, 'utf8')
  if (llms.includes('deshistartup.com/deshistartup')) record(errors, 'llms.txt contains non-canonical basePath URLs')
  if (!llms.includes(`Canonical sitemap: ${canonicalUrl('/sitemap.xml')}`)) {
    record(errors, 'llms.txt does not declare the canonical sitemap')
  }
  if (!llms.includes(canonicalUrl('/llms-full.txt'))) {
    record(errors, 'llms.txt does not link to the full published-page index')
  }
  if (Buffer.byteLength(llms, 'utf8') > 32 * 1024) {
    record(errors, 'llms.txt is too large to serve as a concise agent overview')
  }
}

const llmsFullPath = path.join(staticDir, 'llms-full.txt')
if (!fs.existsSync(llmsFullPath)) {
  record(errors, 'llms-full.txt is missing from production output')
} else {
  const llmsFull = fs.readFileSync(llmsFullPath, 'utf8')
  for (const page of indexable.filter((candidate) => !isContributorProfile(candidate))) {
    if (!llmsFull.includes(`](${canonicalUrl(page.route)})`)) {
      record(errors, `llms-full.txt is missing ${canonicalUrl(page.route)}`)
    }
  }
  for (const page of indexable.filter(isContributorProfile)) {
    if (llmsFull.includes(`](${canonicalUrl(page.route)})`)) {
      record(errors, `llms-full.txt should not mix contributor profiles into the founder-guide index`)
    }
  }
}

for (const required of ['og-default.png', `${INDEXNOW_KEY}.txt`]) {
  if (!fs.existsSync(path.join(staticDir, required))) record(errors, `${required} is missing from production output`)
}
for (const profile of contributorView.rankedProfiles) {
  const card = path.join(staticDir, 'contributor-cards', `${profile.slug}.png`)
  if (!fs.existsSync(card)) record(errors, `proof card is missing for ${profile.slug}`)
}
if (fs.existsSync(htmlFileFor('/contributors/not-a-real-contributor'))) {
  record(errors, 'unknown contributor profile unexpectedly has an exported route')
}

const notFoundPath = [
  path.join(outDir, '404.html'),
  path.join(outDir, '_not-found.html')
].find((candidate) => fs.existsSync(candidate))
if (!notFoundPath) {
  record(errors, '404.html is missing from production output')
} else {
  const $404 = load(fs.readFileSync(notFoundPath, 'utf8'))
  if (!/\bnoindex\b/i.test($404('meta[name="robots"]').attr('content') || '')) {
    record(errors, '404.html must be noindex')
  }
}

console.log(
  `SEO audit: ${pages.length} HTML pages, ${indexable.length} indexable, ${pages.length - indexable.length} noindex stubs (${path.relative(root, outDir)})`
)
if (warnings.length > 0) {
  console.log(`SEO audit warnings: ${warnings.length}`)
  for (const warning of warnings.slice(0, 40)) console.log(`  WARN ${warning}`)
  if (warnings.length > 40) console.log(`  ... ${warnings.length - 40} more warnings`)
}
if (errors.length > 0) {
  console.error(`SEO audit failed: ${errors.length} errors`)
  for (const error of errors.slice(0, 100)) console.error(`  ERROR ${error}`)
  if (errors.length > 100) console.error(`  ... ${errors.length - 100} more errors`)
  process.exit(1)
}
console.log('SEO audit passed')
