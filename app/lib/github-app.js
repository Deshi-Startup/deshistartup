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

import { createPrivateKey, sign as nodeSign, createHash } from 'node:crypto'
import { appendFileSync } from 'node:fs'

const API = 'https://api.github.com'
const REPO = process.env.GITHUB_REPO || 'Deshi-Startup/deshistartup'

const enc = new TextEncoder()

function repoApi(path) {
  return `${API}/repos/${REPO}${path}`
}

function apiHeaders(token, extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'deshistartup-contributor-bot',
    ...extra
  }
}

// --- base64url / base64 helpers (portable) ---

function b64urlFromBytes(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let bin = ''
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlFromStr(s) {
  return b64urlFromBytes(enc.encode(s))
}

function utf8ToBase64(str) {
  const bytes = enc.encode(str)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

// --- GitHub App JWT (RS256) ---

let _cachedKey = null
function getAppKey() {
  if (_cachedKey) return _cachedKey
  const pem = process.env.GITHUB_APP_PRIVATE_KEY
  if (!pem) throw new Error('GITHUB_APP_PRIVATE_KEY is not set')
  // Support literal-\n escapes or real-newline PEMs from env vars.
  const normalized = pem.replace(/\\n/g, '\n')
  _cachedKey = createPrivateKey({ key: normalized, format: 'pem' })
  return _cachedKey
}

export async function appJwt() {
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

let _tokenCache = { token: null, expiresAt: 0 }

export async function installationToken() {
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
  return _tokenCache.token
}

// --- PR creation ---

function branchSlugFromPath(path) {
  const slug = path
    .replace(/^\/en\//, 'en-')
    .replace(/^\//, '')
    .replace(/\//g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .slice(0, 40)
  return slug || 'page'
}

function emailHash(email) {
  return createHash('sha256').update((email || '').toLowerCase().trim()).digest('hex').slice(0, 8)
}

/** Deterministic branch name per contributor+page — same user editing the
 *  same page always lands on the same branch, so a second edit updates the
 *  existing PR instead of creating a duplicate. */
function contribBranchName(pagePath, contributorEmail) {
  return `contrib/${branchSlugFromPath(pagePath || '')}-${emailHash(contributorEmail)}`
}

async function gh(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(repoApi(path), {
    method,
    headers: apiHeaders(token, body ? { 'Content-Type': 'application/json' } : {}),
    body: body ? JSON.stringify(body) : undefined
  })
  return res
}

async function ghJson(path, opts) {
  const res = await gh(path, opts)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub API ${opts?.method || 'GET'} ${path} → ${res.status}: ${text}`)
  }
  return res.json()
}

/**
 * Check if a contributor has an open PR for a page.
 * Returns { branchName, prUrl } or null.
 */
export async function findOpenContribution(pagePath, contributorEmail) {
  const token = await installationToken()
  const branchName = contribBranchName(pagePath, contributorEmail)
  const owner = REPO.split('/')[0]

  // 1. Does the branch exist?
  const refRes = await fetch(repoApi(`/git/refs/heads/${branchName}`), {
    headers: apiHeaders(token)
  })
  if (!refRes.ok) return null

  // 2. Is there an open PR for it?
  const params = new URLSearchParams({ state: 'open', head: `${owner}:${branchName}`, per_page: '1' })
  const prRes = await fetch(repoApi(`/pulls?${params}`), { headers: apiHeaders(token) })
  if (!prRes.ok) return null
  const prs = await prRes.json()
  if (!prs.length) return null

  return { branchName, prUrl: prs[0].html_url }
}

/**
 * Creates or updates a contribution PR.
 *
 * - Branch name is deterministic (page + contributor email hash), so a
 *   second edit of the same page by the same person updates the existing
 *   PR instead of opening a duplicate.
 * - If the branch exists and has an open PR → commit updates the file,
 *   PR auto-updates, we return the existing PR URL.
 * - If the branch exists but the PR was merged/closed → reset the branch
 *   to main, commit, and open a fresh PR.
 * - If the branch doesn't exist → create from main, commit, open PR.
 *
 * @returns {{ prUrl: string, prNumber: number, updated: boolean }}
 */
export async function createContributionPR({ repoPath, content, summary, contributor, pageTitle, pageUrl, pagePath }) {
  const _dbg = (msg) => { try { appendFileSync('/tmp/contrib-debug.log', `${new Date().toISOString()} ${msg}\n`) } catch {} }
  _dbg(`createContributionPR: pagePath=${pagePath} email=${contributor?.email} repoPath=${repoPath}`)
  const token = await installationToken()
  const branchName = contribBranchName(pagePath, contributor.email)
  const owner = REPO.split('/')[0]
  _dbg(`branchName=${branchName}`)

  // 1. Does the branch already exist?
  const refRes = await fetch(repoApi(`/git/refs/heads/${branchName}`), {
    headers: apiHeaders(token)
  })
  const branchExists = refRes.ok
  _dbg(`step1 branchExists=${branchExists} (${refRes.status})`)

  // 2. Is there an open PR for it?
  let existingPR = null
  if (branchExists) {
    const params = new URLSearchParams({ state: 'open', head: `${owner}:${branchName}`, per_page: '1' })
    const prRes = await fetch(repoApi(`/pulls?${params}`), { headers: apiHeaders(token) })
    _dbg(`step2 prSearch=${prRes.status}`)
    if (prRes.ok) {
      const prs = await prRes.json()
      _dbg(`step2 prs=${prs.length}`)
      if (prs.length > 0) existingPR = prs[0]
    }
  }

  // 3. Prepare the branch
  if (!branchExists) {
    _dbg('step3: creating new branch from main')
    const mainRef = await ghJson('/git/refs/heads/main', { token })
    await ghJson('/git/refs', {
      method: 'POST',
      token,
      body: { ref: `refs/heads/${branchName}`, sha: mainRef.object.sha }
    })
  } else if (!existingPR) {
    _dbg('step3: resetting stale branch to main')
    const mainRef = await ghJson('/git/refs/heads/main', { token })
    await ghJson(`/git/refs/heads/${branchName}`, {
      method: 'PATCH',
      token,
      body: { sha: mainRef.object.sha, force: true }
    })
  } else {
    _dbg('step3: skipping (branch exists with open PR)')
  }

  // 4. Commit the new content
  //    File SHA: from the branch if it has an open PR, otherwise from main
  //    (the branch was either just created from main or reset to main).
  const fileRef = existingPR ? branchName : 'main'
  _dbg(`step4: fileRef=${fileRef}`)
  const fileInfo = await ghJson(`/contents/${repoPath}?ref=${fileRef}`, { token }).catch((e) => {
    _dbg(`step4: GET file FAILED: ${e.message}`)
    return null
  })
  _dbg(`step4: fileInfo=${fileInfo ? fileInfo.sha?.slice(0, 12) : 'null'}`)

  _dbg('step5: PUTting content')
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
  _dbg('step5: PUT success')

  // 5. Return existing PR or create a new one
  if (existingPR) {
    _dbg(`step6: returning existing PR #${existingPR.number}`)
    return { prUrl: existingPR.html_url, prNumber: existingPR.number, updated: true }
  }

  const safeName = contributor.name || contributor.email || 'Anonymous contributor'
  const prBody = [
    summary && summary.trim() ? `## সারসংক্ষেপ / Summary\n\n${summary.trim()}` : '',
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
