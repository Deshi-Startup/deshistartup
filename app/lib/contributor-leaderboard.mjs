// Read-side hardening for the committed contributor snapshot. The page is a
// static export, so this runs at build time: it exists so a malformed or
// hand-edited snapshot degrades to an empty list instead of shipping a broken
// page or an attacker-controlled URL.

const SAFE_GITHUB_LOGIN_PATTERN = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i
const SAFE_REPOSITORY_PATTERN = /^[a-z\d][\w.-]{0,99}\/[a-z\d][\w.-]{0,99}$/i
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/
const MAX_PUBLIC_TEXT_LENGTH = 180

function finiteNonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0
}

function safeText(value, fallback) {
  const text = typeof value === 'string'
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    : ''
  return [...text].slice(0, MAX_PUBLIC_TEXT_LENGTH).join('') || fallback
}

function safeUrl(value, host) {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (!host || url.hostname === host) ? url.href : null
  } catch {
    return null
  }
}

function safeGithubLogin(value) {
  const login = typeof value === 'string' ? value.trim() : ''
  return SAFE_GITHUB_LOGIN_PATTERN.test(login) ? login : null
}

function safeRepository(value) {
  const repository = typeof value === 'string' ? value.trim() : ''
  return SAFE_REPOSITORY_PATTERN.test(repository) ? repository : ''
}

function safeTimestamp(value) {
  if (typeof value !== 'string' || !ISO_TIMESTAMP_PATTERN.test(value)) return null
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? null : date.toISOString()
}

export function monogramForName(displayName) {
  return safeText(displayName, '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => [...part][0] || '')
    .join('')
    .toLocaleUpperCase('en-US') || '?'
}

// Every count on the page is a claim about merged pull requests, so each one
// links to the GitHub search that reproduces it.
export function mergedPullsUrl(repository, githubLogin) {
  const safeLogin = safeGithubLogin(githubLogin)
  const safeRepo = safeRepository(repository)
  if (!safeLogin || !safeRepo) return null
  const query = `is:pr is:merged author:${safeLogin}`
  return `https://github.com/${safeRepo}/pulls?q=${encodeURIComponent(query)}`
}

function prepareProfile(profile, index, repository, ranked) {
  const displayName = safeText(profile?.displayName, 'Unnamed contributor')
  const githubLogin = safeGithubLogin(profile?.githubLogin)
  return {
    rank: ranked ? index + 1 : null,
    displayName,
    monogram: monogramForName(displayName),
    githubLogin,
    profileUrl: safeUrl(profile?.profileUrl, 'github.com'),
    avatarUrl: safeUrl(profile?.avatarUrl, 'avatars.githubusercontent.com'),
    pullsUrl: mergedPullsUrl(repository, githubLogin),
    mergedPullRequestCount: finiteNonNegativeInteger(profile?.mergedPullRequestCount),
    lastMergedAt: safeTimestamp(profile?.lastMergedAt)
  }
}

export function prepareContributorSnapshot(snapshot) {
  const source = snapshot && typeof snapshot === 'object' ? snapshot : {}
  const repository = safeRepository(source.repository)
  const list = (value, ranked) =>
    (Array.isArray(value) ? value : []).map((profile, index) =>
      prepareProfile(profile, index, repository, ranked)
    )

  const rankedProfiles = list(source.rankedProfiles, true)
  return {
    repository,
    refreshedAt: safeTimestamp(source.refreshedAt),
    totals: {
      contributors: rankedProfiles.length,
      mergedPullRequests: rankedProfiles.reduce(
        (sum, profile) => sum + profile.mergedPullRequestCount,
        0
      )
    },
    rankedProfiles,
    coreProfiles: list(source.coreProfiles, false),
    hasContributors: rankedProfiles.length > 0
  }
}
