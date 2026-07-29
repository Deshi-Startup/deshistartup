import {
  MAX_CONTRIBUTION_IMAGE_BYTES,
  MAX_BYTES_PER_USER_PER_DAY,
  MAX_IMAGES_PER_USER_PER_DAY,
  MAX_QUARANTINE_BYTES,
  QUARANTINE_TTL_SECONDS,
  validateContributionImage
} from '../../app/lib/contribution-media'
import {
  QuarantineMediaRecord,
  contributorHash,
  getContributionBindings,
  listQuarantineObjects,
  mediaRateAllowed,
  mediaRecordKey,
  moderationFor,
  newOpaqueId,
  readJson,
  writeJson
} from '../lib/contribution-guard'
import { resolveContributable } from '../../app/lib/contributable-registry'
import { requireUser } from '../lib/google-token'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Type': 'application/json',
      Vary: 'Authorization'
    }
  })
}

function safeFileName(header: string | null): string {
  if (!header) return ''
  try {
    return decodeURIComponent(header).slice(0, 180)
  } catch {
    return ''
  }
}

async function readBoundedBody(req: Request): Promise<Uint8Array | null> {
  if (!req.body) return new Uint8Array()
  const reader = req.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_CONTRIBUTION_IMAGE_BYTES) {
      await reader.cancel().catch(() => {})
      return null
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return bytes
}

export async function POST(req: Request, env: CloudflareEnv) {
  let user
  try {
    user = await requireUser(req, env)
  } catch (error) {
    console.error('[contribution-media] Google authentication unavailable:', error)
    return json({ error: 'auth_unavailable' }, 503)
  }
  if (!user) return json({ error: 'unauthorized' }, 401)

  let bindings
  try {
    bindings = getContributionBindings(env)
  } catch (error) {
    console.error('[contribution-media] Cloudflare bindings unavailable:', error)
    return json({ error: 'media_unavailable' }, 503)
  }

  const ownerHash = await contributorHash(user)
  if (!(await mediaRateAllowed(bindings, ownerHash))) {
    return json({ error: 'upload_rate_limited' }, 429)
  }
  const moderation = await moderationFor(bindings, ownerHash)
  if (moderation.status === 'banned') return json({ error: 'contributor_banned' }, 403)
  if (moderation.status === 'muted') {
    return json({ error: 'contributor_muted', until: moderation.until }, 403)
  }

  const pagePath = req.headers.get('x-page-path') || ''
  if (!resolveContributable(pagePath)) return json({ error: 'not_contributable' }, 404)

  const declaredType = (req.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
  const fileName = safeFileName(req.headers.get('x-file-name'))
  const declaredLength = Number(req.headers.get('content-length') || 0)
  if (declaredLength > MAX_CONTRIBUTION_IMAGE_BYTES) {
    return json({ error: 'file_too_large' }, 413)
  }

  let bytes: Uint8Array | null
  try {
    bytes = await readBoundedBody(req)
  } catch {
    return json({ error: 'invalid_upload' }, 400)
  }
  if (!bytes) return json({ error: 'file_too_large' }, 413)
  const validation = validateContributionImage(bytes, fileName, declaredType)
  if (validation.errors.length || !validation.mime || !validation.ext || !validation.size) {
    return json({ error: validation.errors[0] || 'invalid_image', errors: validation.errors }, 400)
  }

  // One strongly consistent R2 list enforces both the project-wide quarantine
  // ceiling and this account's daily allowance. If it ever needs pagination,
  // fail closed: 1,000 pending objects is already far outside this small site's
  // intended operating envelope.
  const listed = await listQuarantineObjects(bindings.quarantine)
  if (listed.truncated) return json({ error: 'quarantine_full' }, 503)
  const globalBytes = listed.objects.reduce((sum, object) => sum + object.size, 0)
  if (globalBytes + bytes.byteLength > MAX_QUARANTINE_BYTES) {
    return json({ error: 'quarantine_full' }, 507)
  }

  const day = new Date().toISOString().slice(0, 10)
  const dailyPrefix = `pending/${ownerHash}/${day}/`
  const daily = listed.objects.filter((object) => object.key.startsWith(dailyPrefix))
  const dailyBytes = daily.reduce((sum, object) => sum + object.size, 0)
  if (daily.length >= MAX_IMAGES_PER_USER_PER_DAY) {
    return json({ error: 'daily_image_limit' }, 429)
  }
  if (dailyBytes + bytes.byteLength > MAX_BYTES_PER_USER_PER_DAY) {
    return json({ error: 'daily_byte_limit' }, 429)
  }

  const id = newOpaqueId()
  const objectKey = `${dailyPrefix}${id}${validation.ext}`
  const createdAt = new Date()
  const expiresAt = new Date(createdAt.getTime() + QUARANTINE_TTL_SECONDS * 1000)
  const record: QuarantineMediaRecord = {
    version: 1,
    id,
    ownerHash,
    ownerName: user.name,
    pagePath,
    objectKey,
    originalName: fileName,
    mime: validation.mime,
    ext: validation.ext,
    bytes: bytes.byteLength,
    w: validation.size.w,
    h: validation.size.h,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'quarantined'
  }

  try {
    await bindings.quarantine.put(objectKey, bytes, {
      httpMetadata: { contentType: validation.mime },
      customMetadata: { owner: ownerHash, page: pagePath, id }
    })
    await writeJson(
      bindings.guards,
      mediaRecordKey(id),
      record,
      QUARANTINE_TTL_SECONDS + 24 * 60 * 60
    )
  } catch (error) {
    console.error('[contribution-media] Quarantine write failed:', error)
    await bindings.quarantine.delete(objectKey).catch(() => {})
    return json({ error: 'upload_failed' }, 502)
  }

  return json({
    id,
    src: `/__pending-media/${id}`,
    name: fileName,
    bytes: bytes.byteLength,
    w: validation.size.w,
    h: validation.size.h,
    expiresAt: expiresAt.toISOString()
  })
}

export async function DELETE(req: Request, env: CloudflareEnv) {
  const user = await requireUser(req, env).catch(() => null)
  if (!user) return json({ error: 'unauthorized' }, 401)

  let body: { id?: string } = {}
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }
  if (!body.id) return json({ error: 'media_id_required' }, 400)

  let bindings
  try {
    bindings = getContributionBindings(env)
  } catch {
    return json({ error: 'media_unavailable' }, 503)
  }
  const record = await readJson<QuarantineMediaRecord>(
    bindings.guards,
    mediaRecordKey(body.id)
  )
  if (!record) return json({ ok: true })
  if (record.ownerHash !== (await contributorHash(user))) {
    return json({ error: 'forbidden' }, 403)
  }
  // Removing an image is always a safe contributor action: a submitted PR
  // keeps failing CI until the marker is also removed and re-submitted, while
  // the stale review link can no longer promote bytes that do not exist.
  await Promise.all([
    bindings.quarantine.delete(record.objectKey),
    bindings.guards.delete(mediaRecordKey(record.id))
  ])
  return json({ ok: true })
}
