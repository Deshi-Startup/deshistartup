import contributable from '../../generated/contributable.json'
import { requireUser } from '../../lib/google-token'
import { findOpenContribution } from '../../lib/github-app'

const RAW_BASE = 'https://raw.githubusercontent.com'
const REPO = process.env.GITHUB_REPO || 'Deshi-Startup/deshistartup'

// 5-minute in-memory cache for raw MDX. Avoids the 60 req/h unauthenticated
// GitHub raw limit when many contributors open the editor in the same isolate.
const _cache = new Map()
const CACHE_TTL = 5 * 60 * 1000

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

function splitFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { frontmatterRaw: '', frontmatter: {}, content: source.replace(/\s+$/, '') + '\n' }
  const fmText = match[1]
  const frontmatterRaw = `---\n${fmText.replace(/\r\n/g, '\n')}\n---\n`
  const frontmatter = {}
  for (const line of fmText.split(/\r?\n/)) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/)
    if (!kv) continue
    let v = kv[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    frontmatter[kv[1]] = v
  }
  const content = source.slice(match[0].length).replace(/^\r?\n+/, '').replace(/\s+$/, '') + '\n'
  return { frontmatterRaw, frontmatter, content }
}

async function fetchRawMdx(repoPath, ref = 'main') {
  const cacheKey = `${ref}:${repoPath}`
  const cached = _cache.get(cacheKey)
  if (cached && Date.now() - cached.t < CACHE_TTL) return cached.source
  const url = `${RAW_BASE}/${REPO}/${ref}/${repoPath.split('/').map(encodeURIComponent).join('/')}`
  const res = await fetch(url, { headers: { 'User-Agent': 'deshistartup-contributor-bot' } })
  if (!res.ok) throw new Error(`raw fetch ${res.status}`)
  const source = await res.text()
  _cache.set(cacheKey, { source, t: Date.now() })
  if (_cache.size > 200) {
    // evict oldest
    const oldest = [..._cache.entries()].sort((a, b) => a[1].t - b[1].t)[0]
    if (oldest) _cache.delete(oldest[0])
  }
  return source
}

export async function GET(req) {
  const user = await requireUser(req)
  if (!user) return json({ error: 'unauthorized' }, 401)

  const url = new URL(req.url)
  const path = url.searchParams.get('path')
  if (!path || typeof path !== 'string') return json({ error: 'path required' }, 400)

  const entry = contributable[path]
  if (!entry) return json({ error: 'not_contributable' }, 404)

  // Check if this contributor has an open PR for this page. If so, fetch
  // from their branch instead of main so they see their own draft.
  let existingPR = null
  let ref = 'main'
  try {
    const contrib = await findOpenContribution(path, user.email)
    if (contrib) {
      existingPR = { url: contrib.prUrl }
      ref = contrib.branchName
    }
  } catch (err) {
    // Non-fatal — fall back to main
    console.error('[content] findOpenContribution failed:', err.message)
  }

  let source
  try {
    source = await fetchRawMdx(entry.repoPath, ref)
  } catch (err) {
    // If the branch fetch failed (e.g. branch was just deleted), try main
    if (ref !== 'main') {
      try {
        source = await fetchRawMdx(entry.repoPath, 'main')
        existingPR = null
      } catch (err2) {
        return json({ error: 'fetch_failed', detail: err2.message }, 502)
      }
    } else {
      return json({ error: 'fetch_failed', detail: err.message }, 502)
    }
  }

  const { frontmatterRaw, frontmatter, content } = splitFrontmatter(source)
  return json({
    path,
    repoPath: entry.repoPath,
    title: entry.title,
    locale: entry.locale,
    stub: entry.stub,
    frontmatter,
    frontmatterRaw,
    content,
    ...(existingPR ? { existingPR } : {})
  })
}
