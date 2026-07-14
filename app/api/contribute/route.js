import contributable from '../../generated/contributable.json'
import { requireUser } from '../../lib/google-token'
import { createContributionPR } from '../../lib/github-app'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function POST(req) {
  const user = await requireUser(req)
  if (!user) return json({ error: 'unauthorized' }, 401)

  // Bearer-token auth is not vulnerable to CSRF (the token isn't sent
  // automatically by the browser like a cookie), so no Origin check needed.

  let body
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const { path, content, summary } = body || {}
  if (!path || typeof path !== 'string') return json({ error: 'path_required' }, 400)

  const entry = contributable[path]
  if (!entry) return json({ error: 'not_contributable' }, 404)

  if (typeof content !== 'string' || content.trim().length < 10) {
    return json({ error: 'content_too_short' }, 400)
  }
  if (content.length > 200_000) return json({ error: 'content_too_large' }, 413)

  const summaryStr = typeof summary === 'string' ? summary.trim().slice(0, 1000) : ''

  const pageUrl = `https://deshistartup.com${path}`
  let result
  try {
    result = await createContributionPR({
      repoPath: entry.repoPath,
      content,
      summary: summaryStr,
      contributor: user,
      pageTitle: entry.title,
      pageUrl,
      pagePath: path
    })
  } catch (err) {
    console.error('[contribute] PR creation failed:', err)
    return json({ error: 'pr_creation_failed', detail: err.message }, 502)
  }

  return json(result)
}
