// Read-side hardening for the committed contributor snapshot. The page is a
// static export, so this runs at build time: it exists so a malformed or
// hand-edited snapshot degrades to an empty list instead of shipping a broken
// page or an attacker-controlled URL.

function finiteNonNegative(value) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : 0
}

function safeText(value, fallback) {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || fallback
}

function safeUrl(value, host) {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (!host || url.hostname.endsWith(host)) ? url.href : null
  } catch {
    return null
  }
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
  if (!githubLogin || !/^[\w.-]+\/[\w.-]+$/.test(repository || '')) return null
  const query = `is:pr is:merged author:${githubLogin}`
  return `https://github.com/${repository}/pulls?q=${encodeURIComponent(query)}`
}

function prepareProfile(profile, index, repository, ranked) {
  const displayName = safeText(profile?.displayName, 'Unnamed contributor')
  const githubLogin = typeof profile?.githubLogin === 'string' ? profile.githubLogin : null
  return {
    rank: ranked ? finiteNonNegative(profile?.rank) || index + 1 : null,
    displayName,
    monogram: monogramForName(displayName),
    githubLogin,
    profileUrl: safeUrl(profile?.profileUrl, 'github.com'),
    avatarUrl: safeUrl(profile?.avatarUrl, 'githubusercontent.com'),
    pullsUrl: mergedPullsUrl(repository, githubLogin),
    mergedPullRequestCount: finiteNonNegative(profile?.mergedPullRequestCount),
    lastMergedAt: typeof profile?.lastMergedAt === 'string' ? profile.lastMergedAt : null
  }
}

export function prepareContributorSnapshot(snapshot) {
  const source = snapshot && typeof snapshot === 'object' ? snapshot : {}
  const repository = typeof source.repository === 'string' ? source.repository : ''
  const list = (value, ranked) =>
    (Array.isArray(value) ? value : []).map((profile, index) =>
      prepareProfile(profile, index, repository, ranked)
    )

  const rankedProfiles = list(source.rankedProfiles, true)
  return {
    repository,
    refreshedAt: typeof source.refreshedAt === 'string' ? source.refreshedAt : null,
    totals: {
      contributors: finiteNonNegative(source.totals?.contributors),
      mergedPullRequests: finiteNonNegative(source.totals?.mergedPullRequests)
    },
    rankedProfiles,
    coreProfiles: list(source.coreProfiles, false),
    hasContributors: rankedProfiles.length > 0
  }
}
