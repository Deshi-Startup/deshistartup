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

import { createPrivateKey, sign as nodeSign } from 'node:crypto'

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

function randomHash(len = 6) {
  const bytes = new Uint8Array(len)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, len)
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
 * Creates a branch off main, commits the new MDX content, and opens a PR.
 * @returns {{ prUrl: string, prNumber: number }}
 */
export async function createContributionPR({ repoPath, content, summary, contributor, pageTitle, pageUrl }) {
  const token = await installationToken()
  const branchName = `contrib/${branchSlugFromPath(pageUrl || repoPath)}-${randomHash()}`

  // 1. main SHA
  const mainRef = await ghJson('/git/refs/heads/main', { token })
  const mainSha = mainRef.object.sha

  // 2. create branch
  await ghJson('/git/refs', {
    method: 'POST',
    token,
    body: { ref: `refs/heads/${branchName}`, sha: mainSha }
  })

  // 3. current file sha (required to update an existing file)
  const fileInfo = await ghJson(`/contents/${repoPath}?ref=main`, { token }).catch(() => null)
  const fileSha = fileInfo ? fileInfo.sha : undefined

  // 4. commit the new content
  await ghJson(`/contents/${repoPath}`, {
    method: 'PUT',
    token,
    body: {
      message: `chore: update "${pageTitle}" via inline editor`,
      content: utf8ToBase64(content),
      branch: branchName,
      ...(fileSha ? { sha: fileSha } : {})
    }
  })

  // 5. open a pull request
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

  return { prUrl: pr.html_url, prNumber: pr.number }
}
