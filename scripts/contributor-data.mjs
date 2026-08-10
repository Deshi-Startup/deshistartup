import fs from 'node:fs/promises'
import path from 'node:path'

const API_ROOT = 'https://api.github.com'
const INLINE_MARKER = 'Created via the Deshi Startup inline editor.'
const INLINE_MARKER_BN = 'দেশি স্টার্টআপ সাইটের ইনলাইন এডিটর থেকে তৈরি করা হয়েছে'
const INLINE_NAME_PATTERN = /^\*\*অবদানকারী \/ Contributor:\*\*\s*(.+?)\s*$/m
const BOT_LOGIN_PATTERN = /\[bot\]$/i
const SAFE_LOGIN_PATTERN = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i
// The page shows avatars at 56–72px. Asking GitHub for a 160px source keeps them
// crisp on a 2× phone screen without pulling the 460px default down a slow link.
const AVATAR_SIZE = 160

export const SNAPSHOT_SCHEMA_VERSION = 2

function cleanPublicText(value, fallback = '') {
  const cleaned = String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.slice(0, 180) || fallback
}

function normalizedKey(value) {
  return cleanPublicText(value).toLocaleLowerCase('en-US')
}

function stringSet(values = []) {
  return new Set(values.map(normalizedKey).filter(Boolean))
}

function policyIndex(policy) {
  return {
    // Core-team membership is a flat list of logins. The section they appear
    // under is their title; there is nothing else to say per person.
    core: stringSet(policy.coreTeam),
    hiddenGitHub: stringSet(policy.exclusions?.githubLogins),
    hiddenInline: stringSet(policy.exclusions?.inlineNames),
    optedOutGitHub: stringSet(policy.optOuts?.githubLogins),
    optedOutInline: stringSet(policy.optOuts?.inlineNames),
    displayNames: new Map(
      Object.entries(policy.displayNameOverrides || {}).map(([key, value]) => [
        normalizedKey(key),
        cleanPublicText(value)
      ])
    ),
    inlineLinks: new Map(
      Object.entries(policy.inlineAttributionLinks || {}).map(([key, value]) => [
        normalizedKey(key),
        cleanPublicText(value)
      ])
    )
  }
}

function assertPolicy(policy) {
  if (!policy || policy.schemaVersion !== 1) throw new Error('Unsupported contributor policy')
  if (!/^[\w.-]+\/[\w.-]+$/.test(policy.repository || '')) {
    throw new Error('Contributor policy repository must use owner/repository format')
  }
  for (const login of policy.coreTeam || []) {
    if (!SAFE_LOGIN_PATTERN.test(login || '')) {
      throw new Error(`Invalid core-team GitHub login: ${login || '(missing)'}`)
    }
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
  if (indexes.hiddenGitHub.has(loginKey) || indexes.optedOutGitHub.has(loginKey)) {
    return { status: 'excluded' }
  }

  return {
    status: indexes.core.has(loginKey) ? 'core' : 'ranked',
    key: `github:${loginKey}`,
    displayName: cleanPublicText(indexes.displayNames.get(loginKey) || login, login),
    githubLogin: login,
    profileUrl: `https://github.com/${encodeURIComponent(login)}`,
    avatarUrl: sizedAvatarUrl(pull.user?.avatar_url)
  }
}

function inlineIdentity(pull, indexes) {
  const inlineName = parseInlineContributorName(pull.body)
  if (!inlineName) return { status: 'unattributed' }
  const inlineKey = normalizedKey(inlineName)
  if (indexes.hiddenInline.has(inlineKey) || indexes.optedOutInline.has(inlineKey)) {
    return { status: 'excluded' }
  }

  const linkedLogin = indexes.inlineLinks.get(inlineKey)
  if (linkedLogin) {
    return githubIdentity(
      { ...pull, user: { login: linkedLogin, type: 'User', avatar_url: null } },
      indexes
    )
  }

  return {
    status: 'ranked',
    key: `inline:${inlineKey}`,
    displayName: inlineName,
    githubLogin: null,
    profileUrl: null,
    avatarUrl: null
  }
}

export function identityForPull(pull, policy) {
  const indexes = policy.core instanceof Set ? policy : policyIndex(policy)
  return isInlineEditorPull(pull)
    ? inlineIdentity(pull, indexes)
    : githubIdentity(pull, indexes)
}

function profileFromGroup(identity, mergeDates) {
  return {
    displayName: identity.displayName,
    githubLogin: identity.githubLogin,
    profileUrl: identity.profileUrl,
    avatarUrl: identity.avatarUrl,
    mergedPullRequestCount: mergeDates.length,
    lastMergedAt: [...mergeDates].sort().at(-1) || null
  }
}

export function rankProfiles(profiles) {
  return [...profiles]
    .sort((a, b) => {
      const countOrder = b.mergedPullRequestCount - a.mergedPullRequestCount
      const recentOrder = (b.lastMergedAt || '').localeCompare(a.lastMergedAt || '')
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
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} for ${new URL(url).pathname}`)
  }
  const data = await response.json()
  if (!Array.isArray(data)) throw new Error(`Incomplete GitHub API response for ${url}`)
  return data
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

export async function buildContributorSnapshot({
  policy,
  fetchImpl = globalThis.fetch,
  token = process.env.GITHUB_TOKEN,
  now = new Date()
}) {
  assertPolicy(policy)
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required')
  const indexes = policyIndex(policy)
  const pulls = await fetchPaginated(
    fetchImpl,
    `${API_ROOT}/repos/${policy.repository}/pulls?state=closed&sort=updated&direction=desc`,
    token
  )
  const rankedGroups = new Map()
  const coreGroups = new Map()
  let unattributedCount = 0

  for (const pull of pulls) {
    if (!pull.merged_at) continue
    const identity = identityForPull(pull, indexes)
    if (identity.status === 'excluded') continue
    if (identity.status === 'unattributed') {
      unattributedCount += 1
      continue
    }

    const groups = identity.status === 'core' ? coreGroups : rankedGroups
    const group = groups.get(identity.key) || { identity, mergeDates: [] }
    group.mergeDates.push(new Date(pull.merged_at).toISOString())
    groups.set(identity.key, group)
  }

  const rankedProfiles = rankProfiles(
    [...rankedGroups.values()].map(({ identity, mergeDates }) => profileFromGroup(identity, mergeDates))
  )
  const coreProfiles = [...coreGroups.values()]
    .map(({ identity, mergeDates }) => profileFromGroup(identity, mergeDates))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'en', { sensitivity: 'base' }))

  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    repository: policy.repository,
    refreshedAt: new Date(now).toISOString(),
    totals: {
      contributors: rankedProfiles.length,
      mergedPullRequests: rankedProfiles.reduce((sum, profile) => sum + profile.mergedPullRequestCount, 0)
    },
    // Not rendered. A non-zero value means merged work could not be tied to a
    // person, which is a signal to add an entry to `inlineAttributionLinks`.
    unattributedCount,
    rankedProfiles,
    coreProfiles
  }
}

export function validatePublicSnapshot(snapshot) {
  if (snapshot?.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    throw new Error('Unsupported contributor snapshot schema')
  }
  if (!Array.isArray(snapshot.rankedProfiles) || !Array.isArray(snapshot.coreProfiles)) {
    throw new Error('Contributor snapshot profile lists are missing')
  }
  const serialized = JSON.stringify(snapshot)
  const forbidden = /(?:authorization|bearer\s|github_token|id_token|email|head_sha|branchName)/i
  if (forbidden.test(serialized)) throw new Error('Contributor snapshot contains a private field')
  return snapshot
}

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
