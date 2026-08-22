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

import { createPrivateKey, sign as nodeSign, createHash, type KeyObject } from 'node:crypto'
import {
  GITHUB_JSON_BODY_MAX_BYTES,
  UPSTREAM_ERROR_BODY_MAX_BYTES,
  isRecord,
  readBoundedJson,
  readBoundedText
} from './request-body.ts'

const API = 'https://api.github.com'

const enc = new TextEncoder()

interface GitHubPullRequest {
  htmlUrl: string
  number: number
  body: string
  headSha?: string
}

function githubRecord(value: unknown, context: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`GitHub ${context} response is not an object`)
  return value
}

function requiredString(
  value: Record<string, unknown>,
  field: string,
  context: string
): string {
  const result = value[field]
  if (typeof result !== 'string' || !result) {
    throw new Error(`GitHub ${context} response is missing ${field}`)
  }
  return result
}

function optionalString(value: Record<string, unknown>, field: string): string | undefined {
  return typeof value[field] === 'string' ? value[field] : undefined
}

function objectSha(value: unknown, context: string): string {
  const record = githubRecord(value, context)
  return requiredString(githubRecord(record.object, `${context}.object`), 'sha', `${context}.object`)
}

function parsePullRequest(value: unknown, context: string): GitHubPullRequest {
  const record = githubRecord(value, context)
  const number = record.number
  if (typeof number !== 'number' || !Number.isSafeInteger(number) || number <= 0) {
    throw new Error(`GitHub ${context} response has an invalid pull request number`)
  }
  const head = isRecord(record.head) ? optionalString(record.head, 'sha') : undefined
  return {
    htmlUrl: requiredString(record, 'html_url', context),
    number,
    body: typeof record.body === 'string' ? record.body : '',
    ...(head ? { headSha: head } : {})
  }
}

async function responseDetail(response: Response): Promise<string> {
  const body = await readBoundedText(response, UPSTREAM_ERROR_BODY_MAX_BYTES)
  if (!body.ok) return body.error
  return body.value
}

async function responseJson(response: Response, context: string): Promise<unknown> {
  const body = await readBoundedJson(response, GITHUB_JSON_BODY_MAX_BYTES)
  if (!body.ok) throw new Error(`GitHub ${context} response ${body.error}`)
  return body.value
}

function repoName(env: CloudflareEnv): string {
  return env.GITHUB_REPO || 'Deshi-Startup/deshistartup'
}

function repoApi(env: CloudflareEnv, path: string) {
  return `${API}/repos/${repoName(env)}${path}`
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

function base64ToUtf8(str: string): string {
  const bin = atob(str.replace(/\s/g, ''))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

// --- GitHub App JWT (RS256) ---

let _cachedKey: { pem: string; key: KeyObject } | null = null
function getAppKey(env: CloudflareEnv): KeyObject {
  const pem = env.GITHUB_APP_PRIVATE_KEY
  if (!pem) throw new Error('GITHUB_APP_PRIVATE_KEY is not set')
  // Support literal-\n escapes or real-newline PEMs from env vars.
  const normalized = pem.replace(/\\n/g, '\n')
  const cached = _cachedKey
  if (cached?.pem === normalized) return cached.key
  const key = createPrivateKey({ key: normalized, format: 'pem' })
  _cachedKey = { pem: normalized, key }
  return key
}

export async function appJwt(env: CloudflareEnv): Promise<string> {
  const appId = env.GITHUB_APP_ID
  if (!appId) throw new Error('GITHUB_APP_ID is not set')
  const key = getAppKey(env)
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = { iat: now - 60, exp: now + 9 * 60, iss: appId }
  const data = b64urlFromStr(JSON.stringify(header)) + '.' + b64urlFromStr(JSON.stringify(payload))
  const sig = nodeSign('sha256', Buffer.from(data), key)
  return data + '.' + b64urlFromBytes(sig)
}

// --- Installation token (cached ~55 min) ---

let _tokenCache = { key: '', token: null as string | null, expiresAt: 0 }

export async function installationToken(env: CloudflareEnv): Promise<string> {
  const now = Date.now()
  const cacheKey = `${env.GITHUB_APP_ID}:${env.GITHUB_INSTALLATION_ID}`
  if (
    _tokenCache.key === cacheKey &&
    _tokenCache.token &&
    _tokenCache.expiresAt - now > 5 * 60 * 1000
  ) {
    return _tokenCache.token
  }
  const installationId = env.GITHUB_INSTALLATION_ID
  if (!installationId) throw new Error('GITHUB_INSTALLATION_ID is not set')
  const jwt = await appJwt(env)
  const res = await fetch(`${API}/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    headers: apiHeaders(jwt)
  })
  if (!res.ok) {
    const text = await responseDetail(res)
    throw new Error(`Failed to create installation token (${res.status}): ${text}`)
  }
  const data = githubRecord(
    await responseJson(res, 'installation token'),
    'installation token'
  )
  const token = requiredString(data, 'token', 'installation token')
  const expiresAt = optionalString(data, 'expires_at')
  const parsedExpiresAt = expiresAt ? Date.parse(expiresAt) : Number.NaN
  _tokenCache = {
    key: cacheKey,
    token,
    expiresAt: Number.isFinite(parsedExpiresAt) ? parsedExpiresAt : now + 50 * 60 * 1000
  }
  return token
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
  body?: unknown
  token: string
}

async function gh(
  env: CloudflareEnv,
  path: string,
  { method = 'GET', body, token }: GhOptions
) {
  const res = await fetch(repoApi(env, path), {
    method,
    headers: apiHeaders(token, body ? { 'Content-Type': 'application/json' } : {}),
    body: body ? JSON.stringify(body) : undefined
  })
  return res
}

async function ghJson(
  env: CloudflareEnv,
  path: string,
  opts: GhOptions
): Promise<unknown> {
  const res = await gh(env, path, opts)
  if (!res.ok) {
    const text = await responseDetail(res)
    throw new Error(`GitHub API ${opts?.method || 'GET'} ${path} → ${res.status}: ${text}`)
  }
  return responseJson(res, `${opts.method || 'GET'} ${path}`)
}

/**
 * Check if a contributor has a branch for a page. A branch without an open PR
 * is a recoverable draft left by an interrupted PR-creation request.
 */
export async function findOpenContribution(
  env: CloudflareEnv,
  pagePath: string,
  contributorEmail: string
): Promise<{ branchName: string; prUrl: string | null; headSha: string } | null> {
  const token = await installationToken(env)
  const branchName = contribBranchName(pagePath, contributorEmail)
  const owner = repoName(env).split('/')[0]

  // 1. Does the branch exist?
  const refRes = await fetch(repoApi(env, `/git/ref/heads/${branchName}`), {
    headers: apiHeaders(token)
  })
  if (refRes.status === 404) {
    await refRes.body?.cancel().catch(() => {})
    return null
  }
  if (!refRes.ok) {
    throw new Error(
      `GitHub API GET branch reference failed (${refRes.status}): ${await responseDetail(refRes)}`
    )
  }
  const headSha = objectSha(
    await responseJson(refRes, 'branch reference'),
    'branch reference'
  )

  // 2. Is there an open PR for it?
  const params = new URLSearchParams({ state: 'open', head: `${owner}:${branchName}`, per_page: '1' })
  const prRes = await fetch(repoApi(env, `/pulls?${params}`), {
    headers: apiHeaders(token)
  })
  if (!prRes.ok) {
    throw new Error(
      `GitHub API GET pull requests failed (${prRes.status}): ${await responseDetail(prRes)}`
    )
  }
  const rawPrs = await responseJson(prRes, 'pull requests')
  if (!Array.isArray(rawPrs)) throw new Error('GitHub pull requests response is not an array')
  const prs = rawPrs.map((value, index) => parsePullRequest(value, `pull requests[${index}]`))
  if (!prs.length) return { branchName, prUrl: null, headSha }

  return { branchName, prUrl: prs[0].htmlUrl, headSha: prs[0].headSha || headSha }
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
  reviewId?: string
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
export async function createContributionPR(
  env: CloudflareEnv,
  {
    repoPath,
    content,
    summary,
    contributor,
    pageTitle,
    pageUrl,
    pagePath,
    reviewId
  }: CreateContributionPRProps
) {
  const token = await installationToken(env)
  const branchName = contribBranchName(pagePath, contributor.email)
  const owner = repoName(env).split('/')[0]

  // 1. Does the branch already exist?
  const refRes = await fetch(repoApi(env, `/git/ref/heads/${branchName}`), {
    headers: apiHeaders(token)
  })
  if (!refRes.ok && refRes.status !== 404) {
    throw new Error(
      `GitHub API GET branch reference failed (${refRes.status}): ${await responseDetail(refRes)}`
    )
  }
  const branchExists = refRes.ok
  await refRes.body?.cancel().catch(() => {})

  // 2. Is there an open PR for it?
  let existingPR: GitHubPullRequest | null = null
  if (branchExists) {
    const params = new URLSearchParams({ state: 'open', head: `${owner}:${branchName}`, per_page: '1' })
    const prRes = await fetch(repoApi(env, `/pulls?${params}`), {
      headers: apiHeaders(token)
    })
    if (!prRes.ok) {
      throw new Error(
        `GitHub API GET pull requests failed (${prRes.status}): ${await responseDetail(prRes)}`
      )
    }
    const rawPrs = await responseJson(prRes, 'pull requests')
    if (!Array.isArray(rawPrs)) throw new Error('GitHub pull requests response is not an array')
    const prs = rawPrs.map((value, index) => parsePullRequest(value, `pull requests[${index}]`))
    if (prs.length > 0) existingPR = prs[0]
  }

  // 3. Prepare the branch
  if (!branchExists) {
    const mainRef = await ghJson(env, '/git/ref/heads/main', { token })
    const mainSha = objectSha(mainRef, 'main branch reference')
    await ghJson(env, '/git/refs', {
      method: 'POST',
      token,
      body: { ref: `refs/heads/${branchName}`, sha: mainSha }
    })
  }

  // 4. Commit the new content
  //    Existing branches can contain a recoverable draft from an interrupted
  //    request, so always read their file SHA before updating them.
  const fileRef = branchExists ? branchName : 'main'
  const fileInfo = githubRecord(
    await ghJson(
      env,
      `/contents/${repoPath}?ref=${encodeURIComponent(fileRef)}`,
      { token }
    ),
    'content file'
  )
  const fileSha = optionalString(fileInfo, 'sha')

  await ghJson(env, `/contents/${repoPath}`, {
    method: 'PUT',
    token,
    body: {
      message: `chore: update "${pageTitle}" via inline editor`,
      content: utf8ToBase64(content),
      branch: branchName,
      ...(fileSha ? { sha: fileSha } : {})
    }
  })

  // 5. Return existing PR or create a new one
  if (existingPR) {
    if (reviewId) {
      const reviewUrl = `https://deshistartup.com/contribute/review?id=${encodeURIComponent(reviewId)}`
      const currentBody = String(existingPR.body || '')
      if (!currentBody.includes(reviewUrl)) {
        await ghJson(env, `/pulls/${existingPR.number}`, {
          method: 'PATCH',
          token,
          body: {
            body:
              `${currentBody.trim()}\n\n` +
              `## ছবি যাচাই / Image review\n\n` +
              `[প্রস্তাবিত ছবিগুলো আলাদাভাবে যাচাই করুন / Review each proposed image](${reviewUrl})`
          }
        })
      }
    }
    return {
      prUrl: existingPR.htmlUrl,
      prNumber: existingPR.number,
      branchName,
      updated: true
    }
  }

  const neutralizeMentions = (text: string) => text.replace(/@/g, '@\u200b')
  const safeName = neutralizeMentions(
    contributor.name || contributor.email || 'Anonymous contributor'
  )
  const safeSummary = neutralizeMentions(summary.trim())
  const reviewUrl = reviewId
    ? `https://deshistartup.com/contribute/review?id=${encodeURIComponent(reviewId)}`
    : ''
  const prBody = [
    safeSummary ? `## সারসংক্ষেপ / Summary\n\n${safeSummary}` : '',
    '',
    `**পেজ / Page:** [${pageTitle}](${pageUrl || ''})`,
    `**অবদানকারী / Contributor:** ${safeName}`,
    reviewUrl
      ? `\n## ছবি যাচাই / Image review\n\n[প্রস্তাবিত ছবিগুলো আলাদাভাবে যাচাই করুন / Review each proposed image](${reviewUrl})`
      : '',
    '',
    '---',
    '_এই পুল রিকোয়েস্টটি দেশি স্টার্টআপ সাইটের ইনলাইন এডিটর থেকে তৈরি করা হয়েছে।_  ',
    '_Created via the Deshi Startup inline editor._'
  ]
    .filter(Boolean)
    .join('\n')

  const pr = parsePullRequest(
    await ghJson(env, '/pulls', {
      method: 'POST',
      token,
      body: {
        title: `Update: ${pageTitle}`,
        head: branchName,
        base: 'main',
        body: prBody
      }
    }),
    'create pull request'
  )

  return {
    prUrl: pr.htmlUrl,
    prNumber: pr.number,
    branchName,
    updated: false
  }
}

export async function readContributionFile(
  env: CloudflareEnv,
  branchName: string,
  repoPath: string
): Promise<string> {
  const token = await installationToken(env)
  const file = githubRecord(
    await ghJson(
      env,
      `/contents/${repoPath}?ref=${encodeURIComponent(branchName)}`,
      { token }
    ),
    `content ${repoPath}`
  )
  const content = optionalString(file, 'content')
  if (!content || file.encoding !== 'base64') {
    throw new Error(`GitHub did not return ${repoPath} as base64 content`)
  }
  return base64ToUtf8(content)
}

interface CommitContributionFilesProps {
  branchName: string
  files: Array<{ path: string; content: string }>
  message: string
}

/**
 * Commits all reviewer-generated file changes in one Git tree update. The page
 * and media registry therefore cannot land in separate commits, which prevents
 * an approved image from temporarily referencing an unregistered object.
 */
export async function commitContributionFiles(
  env: CloudflareEnv,
  { branchName, files, message }: CommitContributionFilesProps
): Promise<string> {
  const token = await installationToken(env)
  const ref = await ghJson(env, `/git/ref/heads/${branchName}`, { token })
  const parentSha = objectSha(ref, 'contribution branch reference')
  const parent = githubRecord(
    await ghJson(env, `/git/commits/${parentSha}`, { token }),
    'contribution branch commit'
  )
  const baseTree = requiredString(
    githubRecord(parent.tree, 'contribution branch commit.tree'),
    'sha',
    'contribution branch commit.tree'
  )

  const entries = []
  for (const file of files) {
    const blob = githubRecord(
      await ghJson(env, '/git/blobs', {
        method: 'POST',
        token,
        body: { content: utf8ToBase64(file.content), encoding: 'base64' }
      }),
      'create blob'
    )
    entries.push({
      path: file.path,
      mode: '100644',
      type: 'blob',
      sha: requiredString(blob, 'sha', 'create blob')
    })
  }
  const tree = githubRecord(
    await ghJson(env, '/git/trees', {
      method: 'POST',
      token,
      body: { base_tree: baseTree, tree: entries }
    }),
    'create tree'
  )
  const treeSha = requiredString(tree, 'sha', 'create tree')
  const commit = githubRecord(
    await ghJson(env, '/git/commits', {
      method: 'POST',
      token,
      body: { message, tree: treeSha, parents: [parentSha] }
    }),
    'create commit'
  )
  const commitSha = requiredString(commit, 'sha', 'create commit')
  await ghJson(env, `/git/refs/heads/${branchName}`, {
    method: 'PATCH',
    token,
    body: { sha: commitSha, force: false }
  })
  return commitSha
}
