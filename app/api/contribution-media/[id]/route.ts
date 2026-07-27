import {
  QuarantineMediaRecord,
  contributorHash,
  getContributionBindings,
  isReviewer,
  mediaRecordKey,
  readJson
} from '../../../lib/contribution-guard'
import { requireUser } from '../../../lib/google-token'

function json(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Type': 'application/json',
      Vary: 'Authorization'
    }
  })
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser(req).catch(() => null)
  if (!user) return json('unauthorized', 401)

  let bindings
  try {
    bindings = getContributionBindings()
  } catch {
    return json('media_unavailable', 503)
  }

  const { id } = await params
  const record = await readJson<QuarantineMediaRecord>(bindings.guards, mediaRecordKey(id))
  if (!record) return json('media_expired', 404)
  const owner = record.ownerHash === (await contributorHash(user))
  if (!owner && !isReviewer(user)) return json('forbidden', 403)

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
