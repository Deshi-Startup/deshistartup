import {
  QuarantineMediaRecord,
  contributorHash,
  getContributionBindings,
  isReviewer,
  mediaRecordKey,
  readJson
} from '../lib/contribution-guard'
import { requireUser } from '../lib/google-token'
import { authenticatedJson } from '../lib/http.ts'

function json(error: string, status: number) {
  return authenticatedJson({ error }, status)
}

export async function GET(
  req: Request,
  env: CloudflareEnv,
  id: string
) {
  const user = await requireUser(req, env).catch(() => null)
  if (!user) return json('unauthorized', 401)

  let bindings
  try {
    bindings = getContributionBindings(env)
  } catch {
    return json('media_unavailable', 503)
  }

  const record = await readJson<QuarantineMediaRecord>(bindings.guards, mediaRecordKey(id))
  if (!record) return json('media_expired', 404)
  const owner = record.ownerHash === (await contributorHash(user))
  if (!owner && !isReviewer(user, env)) return json('forbidden', 403)

  const object = await bindings.quarantine.get(record.objectKey)
  if (!object) return json('media_expired', 404)
  return new Response(object.body, {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Disposition': 'inline',
      'Content-Length': String(object.size),
      'Content-Type': record.mime,
      'X-Content-Type-Options': 'nosniff',
      Vary: 'Authorization'
    }
  })
}
