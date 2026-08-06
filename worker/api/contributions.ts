import { requireUser } from '../lib/google-token'
import { listUserContributions } from '../lib/github-app'

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
    console.error('[contributions] Google authentication is unavailable:', err)
    return json({ error: 'auth_unavailable' }, 503)
  }
  if (!user) return json({ error: 'unauthorized' }, 401)

  try {
    const contributions = await listUserContributions(env, user.email)
    return json({ contributions })
  } catch (err: any) {
    console.error('[contributions] Fetch failed:', err)
    return json({ error: 'github_fetch_failed' }, 502)
  }
}
