/**
 * GitHub App auth + PR creation for the inline contribution flow.
 *
 * The contributor never touches GitHub — this module signs an App JWT
 * (RS256), mints an installation token, then creates a branch, commits
 * the edited MDX, and opens a pull request.
 *
 * Uses Node's crypto module (createPrivateKey auto-detects PKCS#1 vs
 * PKCS#8 PEM format — GitHub App keys can be either).
 */

import { createPrivateKey, sign as nodeSign, createHash, KeyObject } from 'node:crypto'

const API = 'https://api.github.com'
const REPO = process.env.GITHUB_REPO || 'Deshi-Startup/deshistartup'

const enc = new TextEncoder()

function repoApi(path: string) {
  return `${API}/repos/${REPO}${path}`
}

function apiHeaders(token: string, extra: Record<string, string> = {}) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'deshistartup-contributor-bot',
    ...extra
  }
}

// --- base64url / base64 helpers (portable) ---

function b64urlFromBytes(bytes: Uint8Array | ArrayBuffer): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let bin = ''
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlFromStr(s: string): string {
  return b64urlFromBytes(enc.encode(s))
}

function utf8ToBase64(str: string): string {
  const bytes = enc.encode(str)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

// --- GitHub App JWT (RS256) ---

let _cachedKey: KeyObject | null = null
function getAppKey(): KeyObject {
  if (_cachedKey) return _cachedKey
  const pem = process.env.GITHUB_APP_PRIVATE_KEY
  if (!pem) throw new Error('GITHUB_APP_PRIVATE_KEY is not set')
  // Support literal-\n escapes or real-newline PEMs from env vars.
  const normalized = pem.replace(/\\n/g, '\n')
  _cachedKey = createPrivateKey({ key: normalized, format: 'pem' })
  return _cachedKey
}

export async function appJwt(): Promise<string> {
  const appId = process.env.GITHUB_APP_ID
  if (!appId) throw new Error('GITHUB_APP_ID is not set')
  const key = getAppKey()
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = { iat: now - 60, exp: now + 9 * 60, iss: appId }
  const data = b64urlFromStr(JSON.stringify(header)) + '.' + b64urlFromStr(JSON.stringify(payload))
  const sig = nodeSign('sha256', Buffer.from(data), key)
  return data + '.' + b64urlFromBytes(sig)
}

// --- Installation token (cached ~55 min) ---

let _tokenCache = { token: null as string | null, expiresAt: 0 }

export async function installationToken(): Promise<string> {
  const now = Date.now()
  if (_tokenCache.token && _tokenCache.expiresAt - now > 5 * 60 * 1000) {
    return _tokenCache.token
  }
  const installationId = process.env.GITHUB_INSTALLATION_ID
  if (!installationId) throw new Error('GITHUB_INSTALLATION_ID is not set')
  const jwt = await appJwt()
  const res = await fetch(`${API}/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    headers: apiHeaders(jwt)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to create installation token (${res.status}): ${text}`)
  }
  const data = await res.json()
  _tokenCache = {
    token: data.token,
    expiresAt: data.expires_at ? new Date(data.expires_at).getTime() : now + 50 * 60 * 1000
  }
  return _tokenCache.token!
}

// --- PR creation ---

function branchSlugFromPath(path: string): string {
  const slug = path
    .replace(/^\/en\//, 'en-')
    .replace(/^\//, '')
    .replace(/\//g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .slice(0, 40)
  return slug || 'page'
}

function emailHash(email: string): string {
  return createHash('sha256').update((email || '').toLowerCase().trim()).digest('hex').slice(0, 8)
}

/** Deterministic branch name per contributor+page — same user editing the
 *  same page always lands on the same branch, so a second edit updates the
 *  existing PR instead of creating a duplicate. */
function contribBranchName(pagePath: string, contributorEmail: string): string {
  return `contrib/${branchSlugFromPath(pagePath || '')}-${emailHash(contributorEmail)}`
}

interface GhOptions {
  method?: string
  body?: any
  token: string
}

async function gh(path: string, { method = 'GET', body, token }: GhOptions) {
  const res = await fetch(repoApi(path), {
    method,
    headers: apiHeaders(token, body ? { 'Content-Type': 'application/json' } : {}),
    body: body ? JSON.stringify(body) : undefined
  })
  return res
}

async function ghJson(path: string, opts: GhOptions): Promise<any> {
  const res = await gh(path, opts)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub API ${opts?.method || 'GET'} ${path} → ${res.status}: ${text}`)
  }
  return res.json()
}

/**
 * Check if a contributor has a branch for a page. A branch without an open PR
 * is a recoverable draft left by an interrupted PR-creation request.
 */
export async function findOpenContribution(
  pagePath: string,
  contributorEmail: string
): Promise<{ branchName: string; prUrl: string | null; headSha: string } | null> {
  const token = await installationToken()
  const branchName = contribBranchName(pagePath, contributorEmail)
  const owner = REPO.split('/')[0]

  // 1. Does the branch exist?
  const refRes = await fetch(repoApi(`/git/ref/heads/${branchName}`), {
    headers: apiHeaders(token)
  })
  if (refRes.status === 404) return null
  if (!refRes.ok) {
    throw new Error(`GitHub API GET branch reference failed (${refRes.status})`)
  }
  const ref = await refRes.json()
  const headSha = ref?.object?.sha
  if (!headSha) throw new Error('GitHub branch reference is missing its head SHA')

  // 2. Is there an open PR for it?
  const params = new URLSearchParams({ state: 'open', head: `${owner}:${branchName}`, per_page: '1' })
  const prRes = await fetch(repoApi(`/pulls?${params}`), { headers: apiHeaders(token) })
  if (!prRes.ok) {
    throw new Error(`GitHub API GET pull requests failed (${prRes.status})`)
  }
  const prs = await prRes.json()
  if (!prs.length) return { branchName, prUrl: null, headSha }

  return { branchName, prUrl: prs[0].html_url, headSha: prs[0]?.head?.sha || headSha }
}

interface CreateContributionPRProps {
  repoPath: string
  content: string
  summary: string
  contributor: {
    name: string
    email: string
  }
  pageTitle: string
  pageUrl?: string
  pagePath: string
}

/**
 * Creates or updates a contribution PR.
 *
 * - Branch name is deterministic (page + contributor email hash), so a
 *   second edit of the same page by the same person updates the existing
 *   PR instead of opening a duplicate.
 * - If the branch exists and has an open PR → commit updates the file,
 *   PR auto-updates, we return the existing PR URL.
 * - If the branch exists without an open PR → preserve its saved draft,
 *   commit the latest edit, and open a fresh PR.
 * - If the branch doesn't exist → create from main, commit, open PR.
 *
 * @returns {{ prUrl: string, prNumber: number, updated: boolean }}
 */
export async function createContributionPR({ repoPath, content, summary, contributor, pageTitle, pageUrl, pagePath }: CreateContributionPRProps) {
  const token = await installationToken()
  const branchName = contribBranchName(pagePath, contributor.email)
  const owner = REPO.split('/')[0]

  // 1. Does the branch already exist?
  const refRes = await fetch(repoApi(`/git/ref/heads/${branchName}`), {
    headers: apiHeaders(token)
  })
  if (!refRes.ok && refRes.status !== 404) {
    throw new Error(`GitHub API GET branch reference failed (${refRes.status})`)
  }
  const branchExists = refRes.ok

  // 2. Is there an open PR for it?
  let existingPR: any = null
  if (branchExists) {
    const params = new URLSearchParams({ state: 'open', head: `${owner}:${branchName}`, per_page: '1' })
    const prRes = await fetch(repoApi(`/pulls?${params}`), { headers: apiHeaders(token) })
    if (!prRes.ok) {
      throw new Error(`GitHub API GET pull requests failed (${prRes.status})`)
    }
    const prs = await prRes.json()
    if (prs.length > 0) existingPR = prs[0]
  }

  // 3. Prepare the branch
  if (!branchExists) {
    const mainRef = await ghJson('/git/ref/heads/main', { token })
    await ghJson('/git/refs', {
      method: 'POST',
      token,
      body: { ref: `refs/heads/${branchName}`, sha: mainRef.object.sha }
    })
  }

  // 4. Commit the new content
  //    Existing branches can contain a recoverable draft from an interrupted
  //    request, so always read their file SHA before updating them.
  const fileRef = branchExists ? branchName : 'main'
  const fileInfo = await ghJson(`/contents/${repoPath}?ref=${encodeURIComponent(fileRef)}`, {
    token
  })

  await ghJson(`/contents/${repoPath}`, {
    method: 'PUT',
    token,
    body: {
      message: `chore: update "${pageTitle}" via inline editor`,
      content: utf8ToBase64(content),
      branch: branchName,
      ...(fileInfo?.sha ? { sha: fileInfo.sha } : {})
    }
  })

  // 5. Return existing PR or create a new one
  if (existingPR) {
    return { prUrl: existingPR.html_url, prNumber: existingPR.number, updated: true }
  }

  const neutralizeMentions = (text: string) => text.replace(/@/g, '@\u200b')
  const safeName = neutralizeMentions(
    contributor.name || contributor.email || 'Anonymous contributor'
  )
  const safeSummary = neutralizeMentions(summary.trim())
  const prBody = [
    safeSummary ? `## সারসংক্ষেপ / Summary\n\n${safeSummary}` : '',
    '',
    `**পাতা / Page:** [${pageTitle}](${pageUrl || ''})`,
    `**অবদানকারী / Contributor:** ${safeName}`,
    '',
    '---',
    '_এই পুল রিকোয়েস্টটি দেশি স্টার্টআপ সাইটের ইনলাইন এডিটর থেকে তৈরি করা হয়েছে।_  ',
    '_Created via the Deshi Startup inline editor._'
  ]
    .filter(Boolean)
    .join('\n')

  const pr = await ghJson('/pulls', {
    method: 'POST',
    token,
    body: {
      title: `Update: ${pageTitle}`,
      head: branchName,
      base: 'main',
      body: prBody
    }
  })

  return { prUrl: pr.html_url, prNumber: pr.number, updated: false }
}
