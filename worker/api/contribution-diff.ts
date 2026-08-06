import { requireUser } from '../lib/google-token'
import { getUserPullRequestDiff } from '../lib/github-app'

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

export async function GET(req: Request, env: CloudflareEnv) {
  let user
  try {
    user = await requireUser(req, env)
  } catch (err) {
    console.error('[contribution-diff] Google authentication is unavailable:', err)
    return json({ error: 'auth_unavailable' }, 503)
  }
  if (!user) return json({ error: 'unauthorized' }, 401)

  const url = new URL(req.url)
  const prNumberStr = url.searchParams.get('prNumber')
  if (!prNumberStr) return json({ error: 'prNumber_required' }, 400)
  const prNumber = parseInt(prNumberStr, 10)
  if (isNaN(prNumber)) return json({ error: 'invalid_prNumber' }, 400)

  try {
    const diffText = await getUserPullRequestDiff(env, prNumber, user.email)
    return json({ diffText })
  } catch (err: any) {
    console.error(`[contribution-diff] Fetch failed for PR ${prNumber}:`, err)
    if (err.message === 'PR_NOT_FOUND') {
      return json({ error: 'pull_request_not_found' }, 404)
    }
    if (err.message === 'FORBIDDEN') {
      return json({ error: 'forbidden' }, 403)
    }
    return json({ error: 'diff_fetch_failed' }, 502)
  }
}
