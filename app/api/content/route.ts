import contributable from '../../generated/contributable.json'
import { requireUser } from '../../lib/google-token'
import { findOpenContribution } from '../../lib/github-app'
import { extractPendingMediaIds } from '../../lib/contribution-media'
import {
  QuarantineMediaRecord,
  contributorHash,
  getContributionBindings,
  mediaRecordKey,
  moderationFor,
  readJson
} from '../../lib/contribution-guard'

interface ContributableEntry {
  repoPath: string
  title: string
  locale: string
  stub: boolean
}

const typedContributable = contributable as Record<string, ContributableEntry>

const RAW_BASE = 'https://raw.githubusercontent.com'
const REPO = process.env.GITHUB_REPO || 'Deshi-Startup/deshistartup'

interface CacheEntry {
  source: string
  t: number
}

// 5-minute in-memory cache for raw MDX. Avoids the 60 req/h unauthenticated
// GitHub raw limit when many contributors open the editor in the same isolate.
const _cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Type': 'application/json',
      Vary: 'Authorization'
    }
  })
}

function splitFrontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { frontmatterRaw: '', frontmatter: {} as Record<string, string>, content: source.replace(/\s+$/, '') + '\n' }
  const fmText = match[1]
  const frontmatterRaw = `---\n${fmText.replace(/\r\n/g, '\n')}\n---\n`
  const frontmatter: Record<string, string> = {}
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

async function fetchRawMdx(repoPath: string, ref = 'main'): Promise<string> {
  const cacheKey = `${ref}:${repoPath}`
  const cached = _cache.get(cacheKey)
  if (cached && Date.now() - cached.t < CACHE_TTL) return cached.source
  const url = `${RAW_BASE}/${REPO}/${ref}/${repoPath.split('/').map(encodeURIComponent).join('/')}`
  const res = await fetch(url, {
    cache: 'no-store',
    headers: { 'User-Agent': 'deshistartup-contributor-bot' }
  })
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

export async function GET(req: Request) {
  let user
  try {
    user = await requireUser(req)
  } catch (err) {
    console.error('[content] Google authentication is unavailable:', err)
    return json({ error: 'auth_unavailable' }, 503)
  }
  if (!user) return json({ error: 'unauthorized' }, 401)

  let bindings
  try {
    bindings = getContributionBindings()
  } catch (err) {
    console.error('[content] Cloudflare contribution bindings unavailable:', err)
    return json({ error: 'contribution_unavailable' }, 503)
  }
  const ownerHash = await contributorHash(user)
  const moderation = await moderationFor(bindings, ownerHash)
  if (moderation.status === 'banned') return json({ error: 'contributor_banned' }, 403)
  if (moderation.status === 'muted') {
    return json({ error: 'contributor_muted', until: moderation.until }, 403)
  }

  const url = new URL(req.url)
  const path = url.searchParams.get('path')
  if (!path || typeof path !== 'string') return json({ error: 'path required' }, 400)

  const entry = typedContributable[path]
  if (!entry) return json({ error: 'not_contributable' }, 404)

  // Check if this contributor has a branch for this page. It may hold either
  // an open PR or a draft saved just before PR creation was interrupted.
  let existingPR: { url: string } | null = null
  let ref = 'main'
  try {
    const contrib = await findOpenContribution(path, user.email)
    if (contrib) {
      if (contrib.prUrl) existingPR = { url: contrib.prUrl }
      // Cache by immutable commit SHA rather than branch name. When the same
      // contributor updates a draft, the next editor load sees the new head
      // immediately instead of a five-minute-old branch response.
      ref = contrib.headSha
    }
  } catch (err: any) {
    // Loading main here could overwrite a newer draft on the contribution
    // branch. Fail visibly and let the contributor retry instead.
    console.error('[content] Contribution lookup failed:', err)
    return json({ error: 'fetch_failed' }, 502)
  }

  let source: string
  try {
    source = await fetchRawMdx(entry.repoPath, ref)
  } catch (err: any) {
    console.error('[content] Source fetch failed:', err)
    return json({ error: 'fetch_failed' }, 502)
  }

  const { frontmatterRaw, frontmatter, content } = splitFrontmatter(source)
  const pendingMedia = await Promise.all(
    extractPendingMediaIds(content).map(async (id) => {
      const record = await readJson<QuarantineMediaRecord>(
        bindings.guards,
        mediaRecordKey(id)
      )
      if (!record || record.ownerHash !== ownerHash) return { id, status: 'expired' }
      return {
        id,
        name: record.originalName,
        bytes: record.bytes,
        w: record.w,
        h: record.h,
        expiresAt: record.expiresAt,
        status: record.status,
        ...(record.metadata || {})
      }
    })
  )
  return json({
    path,
    repoPath: entry.repoPath,
    title: entry.title,
    locale: entry.locale,
    stub: entry.stub,
    frontmatter,
    frontmatterRaw,
    content,
    pendingMedia,
    ...(existingPR ? { existingPR } : {})
  })
}
