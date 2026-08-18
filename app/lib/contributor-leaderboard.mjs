// Read-side hardening for the committed contributor-recognition snapshot.
// Everything here runs while the static site is built. Malformed authored or
// generated data degrades to an empty public view instead of becoming a URL,
// identity, count, or structured-data claim on the site.

const SAFE_GITHUB_LOGIN_PATTERN = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i
const SAFE_REPOSITORY_PATTERN = /^[a-z\d][\w.-]{0,99}\/[a-z\d][\w.-]{0,99}$/i
const SAFE_ID_PATTERN = /^[a-z\d](?:[a-z\d-]{0,78}[a-z\d])?$/
const SAFE_SLUG_PATTERN = /^[a-z\d](?:[a-z\d-]{0,78}[a-z\d])?$/
const SAFE_TARGET_PATTERN = /^\/[a-z\d-]+(?:\/[a-z\d-]+)?$/
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MAX_PUBLIC_TEXT_LENGTH = 180
const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /\.localhost$/i,
  /\.local$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(?:1[6-9]|2\d|3[01])\./,
  /^\[?::1\]?$/
]

export const ROLE_IDS = Object.freeze([
  'author',
  'editor',
  'translator',
  'researcher',
  'operational-insight',
  'reviewer',
  'product'
])

export const ROLE_LABELS = Object.freeze({
  author: { bn: 'লেখা', en: 'Author' },
  editor: { bn: 'সম্পাদনা', en: 'Editor' },
  translator: { bn: 'অনুবাদ', en: 'Translator' },
  researcher: { bn: 'রিসার্চ', en: 'Researcher' },
  'operational-insight': { bn: 'মাঠের অভিজ্ঞতা', en: 'Operational insight' },
  reviewer: { bn: 'রিভিউ', en: 'Reviewer' },
  product: { bn: 'প্রোডাক্ট', en: 'Product' }
})

const ROLE_SET = new Set(ROLE_IDS)

function finiteNonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0
}

function safeText(value, fallback = '', maximum = MAX_PUBLIC_TEXT_LENGTH) {
  const text = typeof value === 'string'
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    : ''
  return [...text].slice(0, maximum).join('') || fallback
}

function safeId(value) {
  const id = typeof value === 'string' ? value.trim() : ''
  return SAFE_ID_PATTERN.test(id) ? id : null
}

function safeSlug(value) {
  const slug = typeof value === 'string' ? value.trim() : ''
  return SAFE_SLUG_PATTERN.test(slug) ? slug : null
}

function safeGithubLogin(value) {
  const login = typeof value === 'string' ? value.trim() : ''
  return SAFE_GITHUB_LOGIN_PATTERN.test(login) ? login : null
}

function safeRepository(value) {
  const repository = typeof value === 'string' ? value.trim() : ''
  return SAFE_REPOSITORY_PATTERN.test(repository) ? repository : ''
}

function isPublicHostname(hostname) {
  return hostname.length > 0 && !PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname))
}

export function safePublicUrl(value, requiredHost = null) {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      !isPublicHostname(url.hostname) ||
      (requiredHost && url.hostname !== requiredHost)
    ) {
      return null
    }
    return url.href
  } catch {
    return null
  }
}

function safeAvatarUrl(value) {
  if (typeof value !== 'string') return null
  if (/^\/media\/[a-z\d][a-z\d/_-]*\.(?:png|jpe?g|webp)$/i.test(value)) return value
  const url = safePublicUrl(value)
  if (!url) return null
  const hostname = new URL(url).hostname
  return hostname === 'avatars.githubusercontent.com' || hostname === 'media.deshistartup.com'
    ? url
    : null
}

function safeTimestamp(value) {
  if (typeof value !== 'string' || !ISO_TIMESTAMP_PATTERN.test(value)) return null
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? null : date.toISOString()
}

function safeDate(value) {
  if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value ? null : value
}

function safeTargetPath(value) {
  const target = typeof value === 'string' ? value.trim() : ''
  return SAFE_TARGET_PATTERN.test(target) ? target : null
}

function safeLocalizedText(value, fallback = '') {
  if (!value || typeof value !== 'object') return { bn: fallback, en: fallback }
  return {
    bn: safeText(value.bn, fallback, 260),
    en: safeText(value.en, fallback, 260)
  }
}

function safeRoles(value) {
  return [...new Set(Array.isArray(value) ? value.filter((role) => ROLE_SET.has(role)) : [])]
}

export function monogramForName(displayName) {
  return safeText(displayName, '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => [...part][0] || '')
    .join('')
    .toLocaleUpperCase('en-US') || '?'
}

export function contributorProfilePath(slug, locale = 'bn') {
  const safe = safeSlug(slug)
  if (!safe) return null
  return `${locale === 'en' ? '/en' : ''}/contributors/${safe}`
}

export function mergedPullsUrl(repository, githubLogin) {
  const safeLogin = safeGithubLogin(githubLogin)
  const safeRepo = safeRepository(repository)
  if (!safeLogin || !safeRepo) return null
  const query = `is:pr is:merged author:${safeLogin}`
  return `https://github.com/${safeRepo}/pulls?q=${encodeURIComponent(query)}`
}

function emptyView() {
  return {
    schemaVersion: 3,
    repository: '',
    refreshedAt: null,
    totals: {
      contributors: 0,
      acceptedEvents: 0,
      pagesImproved: 0,
      roleCategories: Object.fromEntries(ROLE_IDS.map((role) => [role, 0]))
    },
    organizations: [],
    events: [],
    rankedProfiles: [],
    coreProfiles: [],
    hasContributors: false
  }
}

function prepareOrganizations(source) {
  const seen = new Set()
  return (Array.isArray(source) ? source : []).flatMap((organization) => {
    const id = safeId(organization?.id)
    const name = safeText(organization?.name)
    const url = organization?.url == null ? null : safePublicUrl(organization.url)
    if (!id || !name || seen.has(id) || (organization?.url != null && !url)) return []
    seen.add(id)
    return [{ id, name, url }]
  })
}

function prepareProfiles(source, organizations) {
  const seenIds = new Set()
  const seenSlugs = new Set()
  const organizationIds = new Set(organizations.map((organization) => organization.id))

  return (Array.isArray(source) ? source : []).flatMap((profile) => {
    const id = safeId(profile?.id)
    const slug = safeSlug(profile?.slug)
    const displayName = safeText(profile?.displayName)
    if (!id || !slug || !displayName || seenIds.has(id) || seenSlugs.has(slug)) return []

    const links = (Array.isArray(profile?.links) ? profile.links : []).flatMap((link) => {
      const label = safeText(link?.label, '', 60)
      const url = safePublicUrl(link?.url)
      return label && url ? [{ label, url }] : []
    })
    const organizationId = safeId(profile?.organizationId)
    const safeOrganizationId = organizationId && organizationIds.has(organizationId) ? organizationId : null
    const githubLogin = safeGithubLogin(profile?.githubLogin)
    const profilePath = contributorProfilePath(slug, 'bn')
    if (!profilePath) return []

    seenIds.add(id)
    seenSlugs.add(slug)
    return [{
      id,
      slug,
      displayName,
      headline: profile?.headline == null ? null : safeText(profile.headline, '', 180) || null,
      organizationId: safeOrganizationId,
      githubLogin,
      links,
      avatarUrl: safeAvatarUrl(profile?.avatarUrl),
      proofCardImage: profile?.proofCardImage === 'approved-avatar' ? 'approved-avatar' : 'monogram',
      profilePath,
      monogram: monogramForName(displayName)
    }]
  })
}

function prepareEvents(source, profiles, organizations) {
  const profileIds = new Set(profiles.map((profile) => profile.id))
  const organizationIds = new Set(organizations.map((organization) => organization.id))
  const seen = new Set()

  return (Array.isArray(source) ? source : []).flatMap((event) => {
    const id = safeId(event?.id)
    const acceptedAt = safeDate(event?.acceptedAt)
    const evidenceUrl = safePublicUrl(event?.evidenceUrl)
    const sourceType = event?.sourceType === 'github-pr' || event?.sourceType === 'editorial'
      ? event.sourceType
      : null
    if (!id || seen.has(id) || !acceptedAt || !evidenceUrl || !sourceType) return []

    const summary = safeLocalizedText(event.summary)
    if (!summary.bn || !summary.en) return []

    const targetSeen = new Set()
    const targets = (Array.isArray(event?.targets) ? event.targets : []).flatMap((target) => {
      const path = safeTargetPath(target?.path)
      const title = safeLocalizedText(target?.title)
      if (!path || targetSeen.has(path) || !title.bn || !title.en) return []
      targetSeen.add(path)
      return [{ path, title }]
    })

    const creditSeen = new Set()
    const credits = (Array.isArray(event?.credits) ? event.credits : []).flatMap((credit, index) => {
      const mode = ['person', 'person+organization', 'anonymous'].includes(credit?.mode)
        ? credit.mode
        : null
      const roles = safeRoles(credit?.roles)
      if (!mode || roles.length === 0) return []

      const profileId = mode === 'anonymous' ? null : safeId(credit?.profileId)
      if (profileId && !profileIds.has(profileId)) return []
      if (mode !== 'anonymous' && !profileId) return []

      const organizationId = mode === 'person+organization' ? safeId(credit?.organizationId) : null
      if (mode === 'person+organization' && (!organizationId || !organizationIds.has(organizationId))) {
        return []
      }

      const key = profileId || `anonymous:${index}`
      if (creditSeen.has(key)) return []
      creditSeen.add(key)

      let review = null
      if (roles.includes('reviewer')) {
        const scope = safeLocalizedText(credit?.review?.scope)
        const reviewedAt = safeDate(credit?.review?.reviewedAt)
        if (!scope.bn || !scope.en || !reviewedAt) return []
        review = { scope, reviewedAt }
      }

      return [{ mode, profileId, organizationId, roles, review }]
    })
    if (credits.length === 0) return []

    seen.add(id)
    return [{ id, acceptedAt, sourceType, evidenceUrl, summary, targets, credits }]
  })
}

function prepareCoreProfiles(source, repository) {
  const seen = new Set()
  return (Array.isArray(source) ? source : []).flatMap((profile) => {
    const displayName = safeText(profile?.displayName)
    const githubLogin = safeGithubLogin(profile?.githubLogin)
    const key = githubLogin || displayName.toLocaleLowerCase('en-US')
    if (!displayName || !key || seen.has(key)) return []
    seen.add(key)
    return [{
      rank: null,
      displayName,
      githubLogin,
      profileUrl: githubLogin ? safePublicUrl(`https://github.com/${githubLogin}`, 'github.com') : null,
      avatarUrl: safeAvatarUrl(profile?.avatarUrl),
      monogram: monogramForName(displayName),
      mergedPullRequestCount: finiteNonNegativeInteger(profile?.mergedPullRequestCount),
      lastMergedAt: safeTimestamp(profile?.lastMergedAt),
      pullsUrl: mergedPullsUrl(repository, githubLogin)
    }]
  })
}

export function prepareContributorSnapshot(snapshot) {
  const source = snapshot && typeof snapshot === 'object' ? snapshot : {}
  if (source.schemaVersion !== 3) return emptyView()

  const repository = safeRepository(source.repository)
  const organizations = prepareOrganizations(source.organizations)
  const profiles = prepareProfiles(source.rankedProfiles, organizations)
  const events = prepareEvents(source.events, profiles, organizations)
  const organizationById = new Map(organizations.map((organization) => [organization.id, organization]))
  const eventStats = new Map(profiles.map((profile) => [profile.id, {
    events: [],
    roleCategories: Object.fromEntries(ROLE_IDS.map((role) => [role, 0]))
  }]))

  for (const event of events) {
    for (const credit of event.credits) {
      if (!credit.profileId) continue
      const stats = eventStats.get(credit.profileId)
      if (!stats) continue
      stats.events.push({ event, credit })
      for (const role of credit.roles) stats.roleCategories[role] += 1
    }
  }

  const rankedProfiles = profiles
    .flatMap((profile) => {
      const stats = eventStats.get(profile.id)
      if (!stats || stats.events.length === 0) return []
      const contributions = [...stats.events].sort((a, b) =>
        b.event.acceptedAt.localeCompare(a.event.acceptedAt) ||
        a.event.id.localeCompare(b.event.id)
      )
      const latest = contributions[0]?.event || null
      const contributorSince = contributions.at(-1)?.event.acceptedAt || null
      return [{
        ...profile,
        organization: profile.organizationId ? organizationById.get(profile.organizationId) || null : null,
        acceptedEventCount: contributions.length,
        lastAcceptedAt: latest?.acceptedAt || null,
        contributorSince,
        latestContribution: latest ? {
          id: latest.id,
          summary: latest.summary,
          evidenceUrl: latest.evidenceUrl
        } : null,
        roleCategories: stats.roleCategories,
        roles: ROLE_IDS.filter((role) => stats.roleCategories[role] > 0),
        contributions
      }]
    })
    .sort((a, b) =>
      b.acceptedEventCount - a.acceptedEventCount ||
      (b.lastAcceptedAt || '').localeCompare(a.lastAcceptedAt || '') ||
      a.displayName.localeCompare(b.displayName, 'en', { sensitivity: 'base' })
    )
    .map((profile, index) => ({ ...profile, rank: index + 1 }))

  const roleCategories = Object.fromEntries(ROLE_IDS.map((role) => [role, 0]))
  for (const event of events) {
    const eventRoles = new Set(event.credits.flatMap((credit) => credit.roles))
    for (const role of eventRoles) roleCategories[role] += 1
  }

  const pagesImproved = new Set(events.flatMap((event) => event.targets.map((target) => target.path))).size
  return {
    schemaVersion: 3,
    repository,
    refreshedAt: safeTimestamp(source.refreshedAt),
    totals: {
      contributors: rankedProfiles.length,
      acceptedEvents: events.length,
      pagesImproved,
      roleCategories
    },
    organizations,
    events,
    rankedProfiles,
    coreProfiles: prepareCoreProfiles(source.coreProfiles, repository),
    hasContributors: rankedProfiles.length > 0
  }
}

export function profileFromSnapshot(snapshot, slug) {
  const safe = safeSlug(slug)
  if (!safe) return null
  return prepareContributorSnapshot(snapshot).rankedProfiles.find((profile) => profile.slug === safe) || null
}

export function validatePublicSnapshot(snapshot) {
  if (snapshot?.schemaVersion !== 3) throw new Error('Unsupported contributor snapshot schema')
  if (
    !Array.isArray(snapshot.rankedProfiles) ||
    !Array.isArray(snapshot.coreProfiles) ||
    !Array.isArray(snapshot.events) ||
    !Array.isArray(snapshot.organizations)
  ) {
    throw new Error('Contributor snapshot lists are missing')
  }
  const serialized = JSON.stringify(snapshot)
  const forbidden = /(?:authorization|bearer\s|github_token|id_token|email|head_sha|branchName|consentRecord|phoneNumber)/i
  if (forbidden.test(serialized)) throw new Error('Contributor snapshot contains a private field')

  const prepared = prepareContributorSnapshot(snapshot)
  if (
    prepared.rankedProfiles.length !== snapshot.rankedProfiles.length ||
    prepared.events.length !== snapshot.events.length ||
    prepared.organizations.length !== snapshot.organizations.length
  ) {
    throw new Error('Contributor snapshot contains unsafe or inconsistent public data')
  }
  return snapshot
}
