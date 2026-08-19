import fs from 'node:fs/promises'
import path from 'node:path'
import {
  MAX_PROFILE_TEXT_LENGTH,
  ROLE_IDS,
  prepareContributorSnapshot,
  safePublicUrl,
  validatePublicSnapshot
} from '../app/lib/contributor-leaderboard.mjs'
import { objectKeyMatchesLogicalPath } from './lib/media-lib.mjs'

const API_ROOT = 'https://api.github.com'
const INLINE_MARKER = 'Created via the Deshi Startup inline editor.'
const INLINE_MARKER_BN = 'দেশি স্টার্টআপ সাইটের ইনলাইন এডিটর থেকে তৈরি করা হয়েছে'
const INLINE_NAME_PATTERN = /^\*\*অবদানকারী \/ Contributor:\*\*\s*(.+?)\s*$/m
const BOT_LOGIN_PATTERN = /\[bot\]$/i
const SAFE_LOGIN_PATTERN = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i
const SAFE_ID_PATTERN = /^[a-z\d](?:[a-z\d-]{0,78}[a-z\d])?$/
const SAFE_TARGET_PATTERN = /^\/[a-z\d-]+(?:\/[a-z\d-]+)?$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
const PHONE_PATTERN = /(?:\+?88[\s.-]?)?01[3-9](?:[\s.-]?\d){8}\b|\+\d(?:[\s().-]?\d){7,14}\b/
const SECRET_PATTERN = /(?:github_pat_|gh[pousr]_|bearer\s+|id_token|authorization)/i
const PRIVATE_KEY_PATTERN = /(?:email|phone|token|authorization|consent(?:record|text|raw)?)/i
const DIRECT_CONTACT_HOSTS = new Set([
  'api.whatsapp.com',
  'm.me',
  't.me',
  'telegram.me',
  'wa.me',
  'web.whatsapp.com'
])
const ROLE_SET = new Set(ROLE_IDS)
const AVATAR_SIZE = 160
const MEDIA_SHA_PATTERN = /^[a-f0-9]{12}$/

export const SNAPSHOT_SCHEMA_VERSION = 3

function cleanPublicText(value, fallback = '', maximum = 180) {
  const cleaned = String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return [...cleaned].slice(0, maximum).join('') || fallback
}

function normalizedKey(value) {
  return cleanPublicText(value).toLocaleLowerCase('en-US')
}

function stringSet(values = []) {
  return new Set((Array.isArray(values) ? values : []).map(normalizedKey).filter(Boolean))
}

function validDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

function assertPublicText(value, label, { nullable = false, maximum = 260 } = {}) {
  if (nullable && value == null) return
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be public text`)
  if (value !== cleanPublicText(value, '', maximum)) throw new Error(`${label} contains unsafe or oversized text`)
  if (EMAIL_PATTERN.test(value) || PHONE_PATTERN.test(value) || SECRET_PATTERN.test(value)) {
    throw new Error(`${label} contains private data`)
  }
}

function assertPublicUrl(value, label) {
  if (!safePublicUrl(value)) throw new Error(`${label} must be a public HTTPS URL`)
}

function assertProfileLinkUrl(value, label) {
  assertPublicUrl(value, label)
  const url = new URL(value)
  let publicParts = `${url.pathname}${url.search}${url.hash}`
  try {
    publicParts = decodeURIComponent(publicParts)
  } catch {
    // The URL is still syntactically valid; scan its encoded form instead.
  }
  if (DIRECT_CONTACT_HOSTS.has(url.hostname) || PHONE_PATTERN.test(publicParts)) {
    throw new Error(`${label} must not expose direct contact details`)
  }
}

function isCanonicalGithubProfileLink(profile, value) {
  if (!profile.githubLogin) return false
  const url = new URL(value)
  return url.hostname === 'github.com' &&
    url.pathname.replace(/\/+$/, '').toLocaleLowerCase('en-US') ===
      `/${profile.githubLogin.toLocaleLowerCase('en-US')}` &&
    !url.search &&
    !url.hash
}

function isLinkedInProfileLink(value) {
  const url = new URL(value)
  const pathname = url.pathname.replace(/\/+$/, '')
  return url.hostname === 'www.linkedin.com' &&
    /^\/in\/[a-z\d][a-z\d-]{0,99}$/i.test(pathname) &&
    !url.search &&
    !url.hash
}

function assertNoPrivateFields(value, pathLabel = 'contributor data') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoPrivateFields(item, `${pathLabel}[${index}]`))
    return
  }
  if (!value || typeof value !== 'object') {
    if (typeof value === 'string') {
      if (/[\u0000-\u001f\u007f]/.test(value)) throw new Error(`${pathLabel} contains control characters`)
      if (EMAIL_PATTERN.test(value) || PHONE_PATTERN.test(value) || SECRET_PATTERN.test(value)) {
        throw new Error(`${pathLabel} contains private data`)
      }
    }
    return
  }
  for (const [key, item] of Object.entries(value)) {
    if (PRIVATE_KEY_PATTERN.test(key)) throw new Error(`${pathLabel}.${key} is not a public field`)
    assertNoPrivateFields(item, `${pathLabel}.${key}`)
  }
}

function parseFrontmatterTitle(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (match) {
    const line = match[1].split(/\r?\n/).find((item) => item.startsWith('title:'))
    if (line) {
      const raw = line.slice('title:'.length).trim()
      return raw.replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, (_, double, single) => double ?? single)
    }
  }
  return source.match(/^#\s+(.+)$/m)?.[1]?.trim() || null
}

async function walkPageFiles(directory, base = directory) {
  const files = []
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walkPageFiles(full, base))
    if (entry.isFile() && entry.name === 'page.mdx') {
      files.push({ full, route: `/${path.relative(base, directory).split(path.sep).filter(Boolean).join('/')}` })
    }
  }
  return files
}

export async function buildTargetCatalog(root) {
  const catalog = new Map()
  const locales = [
    ['bn', path.join(root, 'app', '(contents)', '(bn)')],
    ['en', path.join(root, 'app', '(contents)', 'en')]
  ]
  for (const [locale, directory] of locales) {
    for (const page of await walkPageFiles(directory)) {
      if (page.route === '/') continue
      const title = parseFrontmatterTitle(await fs.readFile(page.full, 'utf8'))
      if (!title) continue
      const entry = catalog.get(page.route) || { bn: null, en: null }
      entry[locale] = title
      catalog.set(page.route, entry)
    }
  }
  return catalog
}

function assertPolicy(policy) {
  assertNoPrivateFields(policy, 'contributor policy')
  if (!policy || policy.schemaVersion !== 2) throw new Error('Unsupported contributor policy')
  if (!/^[\w.-]+\/[\w.-]+$/.test(policy.repository || '')) {
    throw new Error('Contributor policy repository must use owner/repository format')
  }
  for (const login of policy.coreTeam || []) {
    if (!SAFE_LOGIN_PATTERN.test(login || '')) throw new Error(`Invalid core-team GitHub login: ${login || '(missing)'}`)
  }
  if (!policy.legacyAvatarUrls || typeof policy.legacyAvatarUrls !== 'object' || Array.isArray(policy.legacyAvatarUrls)) {
    throw new Error('Contributor policy legacy avatar allowlist is malformed')
  }
  const legacyAvatarUrls = new Set()
  for (const [profileId, avatarUrl] of Object.entries(policy.legacyAvatarUrls)) {
    if (!SAFE_ID_PATTERN.test(profileId)) throw new Error(`Invalid legacy avatar profile ID: ${profileId}`)
    assertPublicUrl(avatarUrl, `legacy avatar for ${profileId}`)
    if (new URL(avatarUrl).hostname !== 'avatars.githubusercontent.com') {
      throw new Error(`Legacy avatar for ${profileId} is not on GitHub's avatar host`)
    }
    if (legacyAvatarUrls.has(avatarUrl)) throw new Error(`Duplicate legacy avatar URL: ${avatarUrl}`)
    legacyAvatarUrls.add(avatarUrl)
  }
  for (const [group, aliases] of Object.entries(policy.identityAliases || {})) {
    if (!['githubLogins', 'inlineNames'].includes(group) || !aliases || typeof aliases !== 'object') {
      throw new Error('Contributor identity aliases are malformed')
    }
    for (const [identity, profileId] of Object.entries(aliases)) {
      assertPublicText(identity, `identity alias ${identity}`)
      if (!SAFE_ID_PATTERN.test(profileId)) throw new Error(`Invalid aliased profile ID: ${profileId}`)
      if (group === 'githubLogins' && !SAFE_LOGIN_PATTERN.test(identity)) {
        throw new Error(`Invalid aliased GitHub login: ${identity}`)
      }
    }
  }
}

function targetTitle(targetCatalog, targetPath) {
  const target = targetCatalog?.get?.(targetPath)
  if (!target?.bn || !target?.en) throw new Error(`Contributor target is missing a bilingual page: ${targetPath}`)
  return {
    bn: cleanPublicText(target.bn, '', 260),
    en: cleanPublicText(target.en, '', 260)
  }
}

function mediaAvatarPath(profile, mediaManifest) {
  const logicalPath = profile.avatar?.path
  const expectedPath = `/media/contributors/${profile.slug}.webp`
  if (logicalPath !== expectedPath) {
    throw new Error(`Profile ${profile.id} media avatar must use ${expectedPath}`)
  }
  const entry = mediaManifest && !Array.isArray(mediaManifest) ? mediaManifest[logicalPath] : null
  if (
    !entry ||
    entry.remote !== true ||
    !MEDIA_SHA_PATTERN.test(entry.sha || '') ||
    !objectKeyMatchesLogicalPath(logicalPath, entry.key) ||
    !entry.key.includes(`.${entry.sha}.webp`)
  ) {
    throw new Error(`Profile ${profile.id} media avatar is missing a remote content-addressed registry entry`)
  }
  return logicalPath
}

export function validateContributorLedger({
  ledger,
  policy,
  targetCatalog = new Map(),
  mediaManifest = {}
}) {
  assertPolicy(policy)
  assertNoPrivateFields(ledger, 'contributor ledger')
  if (!ledger || ledger.schemaVersion !== 1) throw new Error('Unsupported contributor ledger')
  if (!Array.isArray(ledger.profiles) || !Array.isArray(ledger.organizations) || !Array.isArray(ledger.events)) {
    throw new Error('Contributor ledger lists are missing')
  }

  const organizationIds = new Set()
  for (const organization of ledger.organizations) {
    if (!SAFE_ID_PATTERN.test(organization?.id || '') || organizationIds.has(organization.id)) {
      throw new Error(`Duplicate or invalid contributor organization ID: ${organization?.id || '(missing)'}`)
    }
    assertPublicText(organization.name, `organization ${organization.id} name`, {
      maximum: MAX_PROFILE_TEXT_LENGTH
    })
    if (organization.url != null) assertPublicUrl(organization.url, `organization ${organization.id} URL`)
    organizationIds.add(organization.id)
  }

  const profileIds = new Set()
  const slugs = new Set()
  const githubLogins = new Set()
  for (const profile of ledger.profiles) {
    if (!SAFE_ID_PATTERN.test(profile?.id || '') || profileIds.has(profile.id)) {
      throw new Error(`Duplicate or invalid contributor profile ID: ${profile?.id || '(missing)'}`)
    }
    if (!SAFE_ID_PATTERN.test(profile?.slug || '') || slugs.has(profile.slug)) {
      throw new Error(`Duplicate or invalid contributor slug: ${profile?.slug || '(missing)'}`)
    }
    assertPublicText(profile.displayName, `profile ${profile.id} display name`, {
      maximum: MAX_PROFILE_TEXT_LENGTH
    })
    assertPublicText(profile.headline, `profile ${profile.id} headline`, {
      nullable: true,
      maximum: MAX_PROFILE_TEXT_LENGTH
    })
    if (!['public', 'hidden'].includes(profile.visibility)) throw new Error(`Invalid profile visibility: ${profile.id}`)
    if (profile.organizationId != null && !organizationIds.has(profile.organizationId)) {
      throw new Error(`Profile ${profile.id} references an unknown organization`)
    }
    if (profile.githubLogin != null) {
      if (!SAFE_LOGIN_PATTERN.test(profile.githubLogin) || githubLogins.has(normalizedKey(profile.githubLogin))) {
        throw new Error(`Duplicate or invalid profile GitHub login: ${profile.githubLogin}`)
      }
      githubLogins.add(normalizedKey(profile.githubLogin))
    }
    let hasUnconfirmedExternalLink = false
    let hasRecognizedProfileLink = false
    for (const [index, link] of (profile.links || []).entries()) {
      assertPublicText(link?.label, `profile ${profile.id} link ${index} label`, { maximum: 60 })
      assertProfileLinkUrl(link?.url, `profile ${profile.id} link ${index}`)
      const isGithubProfile = isCanonicalGithubProfileLink(profile, link.url)
      const isLinkedInProfile = isLinkedInProfileLink(link.url)
      if (isGithubProfile || isLinkedInProfile) hasRecognizedProfileLink = true
      if (!isGithubProfile) hasUnconfirmedExternalLink = true
    }
    if (profile.visibility === 'public' && !hasRecognizedProfileLink) {
      throw new Error(`Public profile ${profile.id} requires at least one GitHub or LinkedIn profile link`)
    }
    if (!['monogram', 'url', 'github', 'media'].includes(profile.avatar?.kind)) {
      throw new Error(`Invalid avatar preference: ${profile.id}`)
    }
    if (profile.avatar.kind === 'url') {
      assertPublicUrl(profile.avatar.url, `profile ${profile.id} avatar`)
      const host = new URL(profile.avatar.url).hostname
      if (host !== 'avatars.githubusercontent.com') {
        throw new Error(`Profile ${profile.id} avatar host is not approved`)
      }
      if (policy.legacyAvatarUrls?.[profile.id] !== profile.avatar.url) {
        throw new Error(`Profile ${profile.id} URL avatar is not in the migration allowlist`)
      }
    }
    if (profile.confirmedAt != null && !validDate(profile.confirmedAt)) {
      throw new Error(`Profile ${profile.id} confirmation date is malformed`)
    }
    if (profile.avatar.kind === 'github') {
      if (!profile.githubLogin) throw new Error(`Profile ${profile.id} GitHub avatar requires a GitHub login`)
      if (!profile.confirmedAt) throw new Error(`Profile ${profile.id} GitHub avatar requires confirmation`)
    }
    if (profile.avatar.kind === 'media') {
      if (!profile.confirmedAt) throw new Error(`Profile ${profile.id} media avatar requires confirmation`)
      mediaAvatarPath(profile, mediaManifest)
    }
    if ((profile.headline || profile.organizationId || hasUnconfirmedExternalLink) && !profile.confirmedAt) {
      throw new Error(`Profile ${profile.id} contains unconfirmed public details`)
    }
    profileIds.add(profile.id)
    slugs.add(profile.slug)
  }

  for (const [profileId, avatarUrl] of Object.entries(policy.legacyAvatarUrls || {})) {
    const profile = ledger.profiles.find((candidate) => candidate.id === profileId)
    if (!profile || profile.avatar?.kind !== 'url' || profile.avatar.url !== avatarUrl) {
      throw new Error(`Legacy avatar allowlist entry does not match profile ${profileId}`)
    }
  }

  for (const aliases of Object.values(policy.identityAliases || {})) {
    for (const profileId of Object.values(aliases || {})) {
      if (!profileIds.has(profileId)) throw new Error(`Identity alias references unknown profile: ${profileId}`)
    }
  }

  const eventIds = new Set()
  const githubPulls = new Set()
  const evidenceUrls = new Set()
  for (const event of ledger.events) {
    if (!SAFE_ID_PATTERN.test(event?.id || '') || eventIds.has(event.id)) {
      throw new Error(`Duplicate or invalid contributor event ID: ${event?.id || '(missing)'}`)
    }
    if (!validDate(event.acceptedAt)) throw new Error(`Event ${event.id} has a malformed acceptance date`)
    if (!['github-pr', 'editorial'].includes(event.sourceType)) throw new Error(`Event ${event.id} has an unknown source type`)
    assertPublicUrl(event.evidenceUrl, `event ${event.id} evidence`)
    if (evidenceUrls.has(event.evidenceUrl)) throw new Error(`Duplicate event evidence URL: ${event.evidenceUrl}`)
    evidenceUrls.add(event.evidenceUrl)

    if (event.sourceType === 'github-pr') {
      if (!Number.isSafeInteger(event.sourceRef) || event.sourceRef <= 0 || githubPulls.has(event.sourceRef)) {
        throw new Error(`Event ${event.id} has a duplicate or invalid GitHub PR number`)
      }
      const expected = `https://github.com/${policy.repository}/pull/${event.sourceRef}`
      if (new URL(event.evidenceUrl).href !== new URL(expected).href) {
        throw new Error(`Event ${event.id} evidence does not match its GitHub PR`)
      }
      githubPulls.add(event.sourceRef)
    } else if (typeof event.sourceRef !== 'string' || !SAFE_ID_PATTERN.test(event.sourceRef)) {
      throw new Error(`Event ${event.id} needs a stable editorial source reference`)
    }

    assertPublicText(event.summary?.bn, `event ${event.id} Bangla summary`)
    assertPublicText(event.summary?.en, `event ${event.id} English summary`)
    if (!Array.isArray(event.targetPaths) || !Array.isArray(event.credits) || event.credits.length === 0) {
      throw new Error(`Event ${event.id} is missing targets or credits`)
    }
    const targetPaths = new Set()
    for (const targetPath of event.targetPaths) {
      if (!SAFE_TARGET_PATTERN.test(targetPath || '') || targetPaths.has(targetPath)) {
        throw new Error(`Event ${event.id} has a duplicate or invalid target path`)
      }
      targetTitle(targetCatalog, targetPath)
      targetPaths.add(targetPath)
    }

    const creditedProfiles = new Set()
    let anonymousCredits = 0
    for (const [index, credit] of event.credits.entries()) {
      if (!['person', 'person+organization', 'anonymous'].includes(credit?.mode)) {
        throw new Error(`Event ${event.id} credit ${index} has an invalid mode`)
      }
      if (!Array.isArray(credit.roles) || credit.roles.length === 0 || new Set(credit.roles).size !== credit.roles.length) {
        throw new Error(`Event ${event.id} credit ${index} has malformed roles`)
      }
      for (const role of credit.roles) {
        if (!ROLE_SET.has(role)) throw new Error(`Event ${event.id} uses unknown role: ${role}`)
      }
      if (credit.mode === 'anonymous') {
        if (credit.profileId != null || credit.organizationId != null) {
          throw new Error(`Anonymous credit in ${event.id} exposes an identity reference`)
        }
        anonymousCredits += 1
      } else {
        if (!profileIds.has(credit.profileId) || creditedProfiles.has(credit.profileId)) {
          throw new Error(`Event ${event.id} has a duplicate or unknown credited profile`)
        }
        creditedProfiles.add(credit.profileId)
      }
      if (credit.mode === 'person+organization') {
        if (!organizationIds.has(credit.organizationId)) {
          throw new Error(`Event ${event.id} credit references an unknown organization`)
        }
      } else if (credit.organizationId != null) {
        throw new Error(`Event ${event.id} carries organization credit in the wrong mode`)
      }
      if (credit.roles.includes('reviewer')) {
        assertPublicText(credit.review?.scope?.bn, `event ${event.id} Bangla review scope`)
        assertPublicText(credit.review?.scope?.en, `event ${event.id} English review scope`)
        if (!validDate(credit.review?.reviewedAt)) throw new Error(`Event ${event.id} reviewer date is malformed`)
      } else if (credit.review != null) {
        throw new Error(`Event ${event.id} has review metadata without a reviewer role`)
      }
    }
    if (anonymousCredits > 1) throw new Error(`Event ${event.id} must bundle anonymous credit into one entry`)
    eventIds.add(event.id)
  }

  return { ledger, policy }
}

function policyIndex(policy, profiles = []) {
  const githubProfileIds = new Map(
    profiles
      .filter((profile) => profile.githubLogin)
      .map((profile) => [normalizedKey(profile.githubLogin), profile.id])
  )
  const aliasMap = (source) => new Map(
    Object.entries(source || {}).map(([identity, profileId]) => [normalizedKey(identity), profileId])
  )
  return {
    core: stringSet(policy.coreTeam),
    hiddenGitHub: stringSet(policy.exclusions?.githubLogins),
    hiddenInline: stringSet(policy.exclusions?.inlineNames),
    hiddenProfiles: stringSet(policy.exclusions?.profileIds),
    optedOutGitHub: stringSet(policy.optOuts?.githubLogins),
    optedOutInline: stringSet(policy.optOuts?.inlineNames),
    optedOutProfiles: stringSet(policy.optOuts?.profileIds),
    displayNames: new Map(
      Object.entries(policy.displayNameOverrides || {}).map(([key, value]) => [
        normalizedKey(key),
        cleanPublicText(value)
      ])
    ),
    githubAliases: aliasMap(policy.identityAliases?.githubLogins),
    inlineAliases: aliasMap(policy.identityAliases?.inlineNames),
    githubProfileIds
  }
}

function isInlineEditorPull(pull) {
  const body = String(pull.body || '')
  return body.includes(INLINE_MARKER) || body.includes(INLINE_MARKER_BN)
}

export function parseInlineContributorName(body) {
  const match = String(body || '').match(INLINE_NAME_PATTERN)
  if (!match) return null
  const name = cleanPublicText(match[1].replace(/@\u200b/g, '@'))
  if (!name || /^anonymous contributor$/i.test(name)) return null
  return name
}

export function sizedAvatarUrl(value) {
  if (!/^https:\/\/avatars\.githubusercontent\.com\//.test(value || '')) return null
  try {
    const url = new URL(value)
    url.searchParams.set('s', String(AVATAR_SIZE))
    return url.href
  } catch {
    return null
  }
}

function githubIdentity(pull, indexes) {
  const login = cleanPublicText(pull.user?.login)
  const loginKey = normalizedKey(login)
  if (pull.user?.type === 'Bot' || BOT_LOGIN_PATTERN.test(login)) return { status: 'excluded' }
  if (!login || !SAFE_LOGIN_PATTERN.test(login)) return { status: 'unattributed' }
  if (indexes.hiddenGitHub.has(loginKey)) return { status: 'excluded' }

  if (indexes.core.has(loginKey)) {
    return {
      status: 'core',
      key: `github:${loginKey}`,
      displayName: cleanPublicText(indexes.displayNames.get(loginKey) || login, login),
      githubLogin: login,
      profileUrl: `https://github.com/${encodeURIComponent(login)}`,
      avatarUrl: sizedAvatarUrl(pull.user?.avatar_url)
    }
  }

  return {
    status: 'ranked',
    profileId: indexes.githubAliases.get(loginKey) || indexes.githubProfileIds.get(loginKey) || null,
    githubLogin: login,
    optedOut: indexes.optedOutGitHub.has(loginKey)
  }
}

function inlineIdentity(pull, indexes) {
  const inlineName = parseInlineContributorName(pull.body)
  if (!inlineName) return { status: 'unattributed' }
  const inlineKey = normalizedKey(inlineName)
  if (indexes.hiddenInline.has(inlineKey)) return { status: 'excluded' }
  return {
    status: 'ranked',
    profileId: indexes.inlineAliases.get(inlineKey) || null,
    inlineName,
    optedOut: indexes.optedOutInline.has(inlineKey)
  }
}

export function identityForPull(pull, policyOrIndexes, profiles = []) {
  const indexes = policyOrIndexes.core instanceof Set
    ? policyOrIndexes
    : policyIndex(policyOrIndexes, profiles)
  return isInlineEditorPull(pull)
    ? inlineIdentity(pull, indexes)
    : githubIdentity(pull, indexes)
}

export function rankProfiles(profiles) {
  return [...profiles]
    .sort((a, b) => {
      const countOrder = (b.acceptedEventCount ?? b.mergedPullRequestCount ?? 0) -
        (a.acceptedEventCount ?? a.mergedPullRequestCount ?? 0)
      const recentOrder = (b.lastAcceptedAt || b.lastMergedAt || '').localeCompare(
        a.lastAcceptedAt || a.lastMergedAt || ''
      )
      const nameOrder = a.displayName.localeCompare(b.displayName, 'en', { sensitivity: 'base' })
      return countOrder || recentOrder || nameOrder
    })
    .map((profile, index) => ({ ...profile, rank: index + 1 }))
}

async function githubJson(fetchImpl, url, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'deshi-startup-contributor-refresh'
  }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetchImpl(url, { headers })
  if (!response.ok) throw new Error(`GitHub API ${response.status} for ${new URL(url).pathname}`)
  const data = await response.json()
  if (!Array.isArray(data)) throw new Error(`Incomplete GitHub API response for ${url}`)
  return data
}

async function githubUser(fetchImpl, login, token) {
  const url = `${API_ROOT}/users/${encodeURIComponent(login)}`
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'deshi-startup-contributor-refresh'
  }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetchImpl(url, { headers })
  if (!response.ok) throw new Error(`GitHub API ${response.status} for ${new URL(url).pathname}`)
  const user = await response.json()
  const returnedLogin = cleanPublicText(user?.login)
  if (!returnedLogin || normalizedKey(returnedLogin) !== normalizedKey(login)) {
    throw new Error(`GitHub avatar lookup for ${login} returned a different public identity`)
  }
  const avatarUrl = sizedAvatarUrl(user?.avatar_url)
  if (!avatarUrl) throw new Error(`GitHub avatar lookup for ${login} returned an unsafe avatar URL`)
  return avatarUrl
}

export async function fetchPaginated(fetchImpl, url, token) {
  const items = []
  const seen = new Set()
  for (let page = 1; ; page += 1) {
    const separator = url.includes('?') ? '&' : '?'
    const batch = await githubJson(fetchImpl, `${url}${separator}per_page=100&page=${page}`, token)
    for (const item of batch) {
      const key = Number.isFinite(Number(item.number)) ? `number:${Number(item.number)}` : JSON.stringify(item)
      if (seen.has(key)) continue
      seen.add(key)
      items.push(item)
    }
    if (batch.length < 100) break
  }
  return items
}

function publicProfileFromLedger(profile, policy, optedOutProfileIds, mediaManifest) {
  const profileIdKey = normalizedKey(profile.id)
  const hidden = profile.visibility !== 'public' ||
    optedOutProfileIds.has(profileIdKey) ||
    stringSet(policy.exclusions?.profileIds).has(profileIdKey)
  if (hidden) return null
  const override = policy.displayNameOverrides?.[profile.id] ||
    (profile.githubLogin ? policy.displayNameOverrides?.[profile.githubLogin] : null)
  return {
    id: profile.id,
    slug: profile.slug,
    displayName: cleanPublicText(override || profile.displayName, profile.displayName),
    headline: profile.headline || null,
    organizationId: profile.organizationId || null,
    githubLogin: profile.githubLogin || null,
    links: profile.links || [],
    avatarUrl: profile.avatar?.kind === 'url'
      ? sizedAvatarUrl(profile.avatar.url) || profile.avatar.url
      : profile.avatar?.kind === 'media'
        ? mediaAvatarPath(profile, mediaManifest)
        : null
  }
}

function publicEventsFromLedger(ledger, targetCatalog, publicProfileIds, hiddenProfileIds) {
  return ledger.events.map((event) => ({
    id: event.id,
    acceptedAt: event.acceptedAt,
    sourceType: event.sourceType,
    evidenceUrl: event.evidenceUrl,
    summary: event.summary,
    targets: event.targetPaths.map((targetPath) => ({
      path: targetPath,
      title: targetTitle(targetCatalog, targetPath)
    })),
    credits: event.credits.map((credit) => {
      if (credit.mode === 'anonymous' || hiddenProfileIds.has(normalizedKey(credit.profileId))) {
        return { mode: 'anonymous', profileId: null, organizationId: null, roles: credit.roles, review: credit.review || null }
      }
      if (!publicProfileIds.has(credit.profileId)) {
        return { mode: 'anonymous', profileId: null, organizationId: null, roles: credit.roles, review: credit.review || null }
      }
      return {
        mode: credit.mode,
        profileId: credit.profileId,
        organizationId: credit.mode === 'person+organization' ? credit.organizationId : null,
        roles: credit.roles,
        review: credit.review || null
      }
    })
  }))
}

function coreProfileFromGroup(identity, mergeDates) {
  return {
    displayName: identity.displayName,
    githubLogin: identity.githubLogin,
    profileUrl: identity.profileUrl,
    avatarUrl: identity.avatarUrl,
    mergedPullRequestCount: mergeDates.length,
    lastMergedAt: [...mergeDates].sort().at(-1) || null
  }
}

export async function buildContributorSnapshot({
  policy,
  ledger,
  targetCatalog = new Map(),
  mediaManifest = {},
  fetchImpl = globalThis.fetch,
  token = process.env.GITHUB_TOKEN,
  now = new Date()
}) {
  validateContributorLedger({ ledger, policy, targetCatalog, mediaManifest })
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required')

  const indexes = policyIndex(policy, ledger.profiles)
  const pulls = await fetchPaginated(
    fetchImpl,
    `${API_ROOT}/repos/${policy.repository}/pulls?state=closed&sort=updated&direction=desc`,
    token
  )
  const eventByPull = new Map(
    ledger.events
      .filter((event) => event.sourceType === 'github-pr')
      .map((event) => [event.sourceRef, event])
  )
  const seenLedgerPulls = new Set()
  const missingLedgerPulls = []
  const coreGroups = new Map()
  let unattributedCount = 0

  for (const pull of pulls) {
    if (!pull.merged_at) continue
    const identity = identityForPull(pull, indexes)
    if (identity.status === 'excluded') continue
    if (identity.status === 'unattributed') {
      const event = eventByPull.get(Number(pull.number))
      if (event) {
        const acceptedAt = new Date(pull.merged_at).toISOString().slice(0, 10)
        if (event.acceptedAt !== acceptedAt) {
          throw new Error(`Ledger date for PR #${pull.number} does not match its merge date`)
        }
        if (event.credits.every((credit) => credit.mode === 'anonymous')) {
          seenLedgerPulls.add(Number(pull.number))
          continue
        }
        throw new Error(
          `Merged PR #${pull.number} has no stable contributor identity; ` +
          'use anonymous credit or record a stable identity'
        )
      }
      unattributedCount += 1
      continue
    }
    if (identity.status === 'core') {
      const group = coreGroups.get(identity.key) || { identity, mergeDates: [] }
      group.mergeDates.push(new Date(pull.merged_at).toISOString())
      coreGroups.set(identity.key, group)
      continue
    }

    const event = eventByPull.get(Number(pull.number))
    if (!event) {
      missingLedgerPulls.push(Number(pull.number))
      continue
    }
    const acceptedAt = new Date(pull.merged_at).toISOString().slice(0, 10)
    if (event.acceptedAt !== acceptedAt) {
      throw new Error(`Ledger date for PR #${pull.number} does not match its merge date`)
    }
    const isAnonymousEvent = event.credits.every((credit) => credit.mode === 'anonymous')
    if (isAnonymousEvent) {
      seenLedgerPulls.add(Number(pull.number))
      continue
    }
    if (!identity.profileId) {
      throw new Error(
        `Merged PR #${pull.number} has no stable contributor identity; ` +
        'set githubLogin on its ledger profile or add a historical identity alias'
      )
    }
    if (!event.credits.some((credit) => credit.profileId === identity.profileId)) {
      throw new Error(`Ledger credit for PR #${pull.number} does not match its public contributor identity`)
    }
    seenLedgerPulls.add(Number(pull.number))
  }

  if (missingLedgerPulls.length > 0) {
    throw new Error(
      `Merged community PRs missing from contributor ledger: ${missingLedgerPulls
        .sort((a, b) => a - b)
        .map((number) => `#${number}`)
        .join(', ')}`
    )
  }
  const unmergedLedgerPulls = [...eventByPull.keys()].filter((number) => !seenLedgerPulls.has(number))
  if (unmergedLedgerPulls.length > 0) {
    throw new Error(`Contributor ledger references unmerged or missing PRs: ${unmergedLedgerPulls.map((number) => `#${number}`).join(', ')}`)
  }

  const hiddenProfileIds = new Set([
    ...indexes.hiddenProfiles,
    ...indexes.optedOutProfiles
  ])
  for (const profile of ledger.profiles) {
    const githubKey = normalizedKey(profile.githubLogin)
    if (githubKey && (indexes.hiddenGitHub.has(githubKey) || indexes.optedOutGitHub.has(githubKey))) {
      hiddenProfileIds.add(normalizedKey(profile.id))
    }
  }
  for (const [inlineName, profileId] of indexes.inlineAliases.entries()) {
    if (indexes.hiddenInline.has(inlineName) || indexes.optedOutInline.has(inlineName)) {
      hiddenProfileIds.add(normalizedKey(profileId))
    }
  }

  const rawProfiles = ledger.profiles
    .map((profile) => publicProfileFromLedger(
      profile,
      policy,
      hiddenProfileIds,
      mediaManifest
    ))
    .filter(Boolean)
  const publicProfileIds = new Set(rawProfiles.map((profile) => profile.id))
  const events = publicEventsFromLedger(ledger, targetCatalog, publicProfileIds, hiddenProfileIds)
  const activeProfileIds = new Set(
    events.flatMap((event) => event.credits.map((credit) => credit.profileId).filter(Boolean))
  )
  const rankedProfiles = rawProfiles.filter((profile) => activeProfileIds.has(profile.id))
  const ledgerProfileById = new Map(ledger.profiles.map((profile) => [profile.id, profile]))
  await Promise.all(rankedProfiles.map(async (profile) => {
    const ledgerProfile = ledgerProfileById.get(profile.id)
    if (ledgerProfile?.avatar?.kind === 'github') {
      profile.avatarUrl = await githubUser(fetchImpl, ledgerProfile.githubLogin, token)
    }
  }))
  const usedOrganizationIds = new Set([
    ...rankedProfiles.map((profile) => profile.organizationId).filter(Boolean),
    ...events.flatMap((event) => event.credits.map((credit) => credit.organizationId).filter(Boolean))
  ])
  const organizations = ledger.organizations.filter((organization) => usedOrganizationIds.has(organization.id))
  const coreProfiles = [...coreGroups.values()]
    .map(({ identity, mergeDates }) => coreProfileFromGroup(identity, mergeDates))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'en', { sensitivity: 'base' }))

  const provisional = {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    repository: policy.repository,
    refreshedAt: new Date(now).toISOString(),
    totals: {},
    unattributedCount,
    organizations,
    events,
    rankedProfiles,
    coreProfiles
  }
  const prepared = prepareContributorSnapshot(provisional)
  provisional.totals = prepared.totals
  provisional.rankedProfiles = prepared.rankedProfiles.map((profile) => ({
    id: profile.id,
    slug: profile.slug,
    displayName: profile.displayName,
    headline: profile.headline,
    organizationId: profile.organizationId,
    githubLogin: profile.githubLogin,
    links: profile.links,
    avatarUrl: profile.avatarUrl,
    acceptedEventCount: profile.acceptedEventCount,
    lastAcceptedAt: profile.lastAcceptedAt,
    contributorSince: profile.contributorSince,
    roleCategories: profile.roleCategories,
    rank: profile.rank
  }))
  validatePublicSnapshot(provisional)
  return provisional
}

export { validatePublicSnapshot }

export async function writeSnapshotAtomically(outputPath, snapshot) {
  validatePublicSnapshot(snapshot)
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  const temporaryPath = `${outputPath}.${process.pid}.${Date.now()}.tmp`
  try {
    await fs.writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, { mode: 0o644 })
    await fs.rename(temporaryPath, outputPath)
  } catch (error) {
    await fs.rm(temporaryPath, { force: true }).catch(() => {})
    throw error
  }
}

export async function refreshContributorFile(options) {
  const snapshot = await buildContributorSnapshot(options)
  await writeSnapshotAtomically(options.outputPath, snapshot)
  return snapshot
}
