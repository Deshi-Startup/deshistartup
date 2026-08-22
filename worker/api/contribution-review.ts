import {
  PUBLIC_MEDIA_STORAGE_CEILING_BYTES,
  approvePendingMediaInMarkdown,
  contributionMediaLogicalPath,
  rejectPendingMediaInMarkdown,
  validateContributionImage
} from '../../app/lib/contribution-media'
import {
  ContributionReviewRecord,
  QuarantineMediaRecord,
  getContributionBindings,
  isReviewer,
  mediaRecordKey,
  moderationFor,
  readJson,
  reviewRecordKey,
  setModeration,
  sha256Hex,
  writeJson
} from '../lib/contribution-guard'
import { requireUser } from '../lib/google-token'
import {
  commitContributionFiles,
  readContributionFile
} from '../lib/github-app'
import {
  SMALL_JSON_BODY_MAX_BYTES,
  isRecord,
  readBoundedJson
} from '../lib/request-body.ts'
import { logError } from '../lib/logging.ts'
import { authenticatedJson as json } from '../lib/http.ts'

const REGISTRY_PATH = 'app/generated/media.json'
const CACHE_CONTROL = 'public, max-age=31536000, immutable'

async function reviewer(req: Request, env: CloudflareEnv) {
  const user = await requireUser(req, env).catch(() => null)
  if (!user) return { error: json({ error: 'unauthorized' }, 401) }
  if (!isReviewer(user, env)) return { error: json({ error: 'reviewer_required' }, 403) }
  return { user }
}

function safeReview(record: ContributionReviewRecord, moderation: unknown) {
  return {
    id: record.id,
    ownerName: record.ownerName,
    pagePath: record.pagePath,
    pageTitle: record.pageTitle,
    locale: record.locale,
    prUrl: record.prUrl,
    status: record.status,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
    moderation,
    media: record.media.map(({ objectKey: _objectKey, ...media }) => ({
      ...media,
      previewUrl: `/api/contribution-media/${media.id}`
    }))
  }
}

async function loadRecord(env: CloudflareEnv, id: string) {
  const bindings = getContributionBindings(env)
  const record = await readJson<ContributionReviewRecord>(
    bindings.guards,
    reviewRecordKey(id)
  )
  return { bindings, record }
}

export async function GET(
  req: Request,
  env: CloudflareEnv,
  id: string
) {
  const auth = await reviewer(req, env)
  if (auth.error) return auth.error

  let loaded
  try {
    loaded = await loadRecord(env, id)
  } catch (error) {
    logError('contribution_review', 'bindings_unavailable', error)
    return json({ error: 'review_unavailable' }, 503)
  }
  if (!loaded.record) return json({ error: 'review_expired' }, 404)
  const moderation = await moderationFor(loaded.bindings, loaded.record.ownerHash)
  return json(safeReview(loaded.record, moderation))
}

function sortedRegistry(registry: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(registry).sort(([left], [right]) => left.localeCompare(right)))
}

function parseRegistry(source: string): Record<string, unknown> {
  const value = JSON.parse(source) as unknown
  if (!isRecord(value)) throw new Error('media_registry_invalid')
  return value
}

function registryByteTotal(registry: Record<string, unknown>): number {
  let total = 0
  for (const entry of Object.values(registry)) {
    if (!isRecord(entry) || typeof entry.bytes !== 'number' || !Number.isSafeInteger(entry.bytes)) {
      throw new Error('media_registry_invalid')
    }
    if (entry.bytes < 0 || total > Number.MAX_SAFE_INTEGER - entry.bytes) {
      throw new Error('media_registry_invalid')
    }
    total += entry.bytes
  }
  return total
}

function objectKeyFor(logicalPath: string, sha: string): string {
  const staged = logicalPath.slice('/media/'.length)
  const dot = staged.lastIndexOf('.')
  return `${staged.slice(0, dot)}.${sha}${staged.slice(dot)}`
}

async function saveRecord(
  bindings: ReturnType<typeof getContributionBindings>,
  record: ContributionReviewRecord
) {
  const secondsLeft = Math.max(
    60,
    Math.ceil((Date.parse(record.expiresAt) - Date.now()) / 1000) + 24 * 60 * 60
  )
  await writeJson(bindings.guards, reviewRecordKey(record.id), record, secondsLeft)
}

async function decideImage(
  env: CloudflareEnv,
  record: ContributionReviewRecord,
  mediaId: string,
  action: 'approve' | 'reject',
  reviewerEmail: string,
  reason?: string
) {
  const bindings = getContributionBindings(env)
  if (!record.branchName) throw new Error('review_branch_missing')
  const index = record.media.findIndex((item) => item.id === mediaId)
  if (index < 0) throw new Error('media_not_in_review')
  const media = record.media[index]
  if (media.status !== 'pending') return record

  const pageContent = await readContributionFile(env, record.branchName, record.repoPath)
  const liveMedia = await readJson<QuarantineMediaRecord>(
    bindings.guards,
    mediaRecordKey(media.id)
  )
  if (liveMedia && liveMedia.contributionId !== record.id) {
    throw new Error('stale_review')
  }
  if (!liveMedia) {
    const expectedPath = contributionMediaLogicalPath(record.pagePath, media.id, media.ext)
    if (!pageContent.includes(`/__pending-media/${media.id}`)) {
      record.media[index] = {
        ...media,
        status: action === 'approve' && pageContent.includes(expectedPath) ? 'approved' : 'rejected',
        ...(pageContent.includes(expectedPath) ? { publicPath: expectedPath } : {}),
        decidedAt: new Date().toISOString(),
        decidedBy: reviewerEmail
      }
      return record
    }
    if (action === 'approve') throw new Error('image_expired')
  }

  if (action === 'reject') {
    const nextContent = rejectPendingMediaInMarkdown(pageContent, media.id)
    await commitContributionFiles(env, {
      branchName: record.branchName,
      files: [{ path: record.repoPath, content: nextContent }],
      message: `chore: reject proposed image for "${record.pageTitle}"`
    })
    await Promise.all([
      bindings.quarantine.delete(media.objectKey),
      bindings.guards.delete(mediaRecordKey(media.id))
    ])
    record.media[index] = {
      ...media,
      status: 'rejected',
      ...(reason ? { reason } : {}),
      decidedAt: new Date().toISOString(),
      decidedBy: reviewerEmail
    }
    return record
  }

  const [object, registryText] = await Promise.all([
    bindings.quarantine.get(media.objectKey),
    readContributionFile(env, record.branchName, REGISTRY_PATH)
  ])
  if (!object) throw new Error('image_expired')

  const bytes = new Uint8Array(await object.arrayBuffer())
  const validation = validateContributionImage(bytes, media.originalName, media.mime)
  if (validation.errors.length || !validation.ext || !validation.size) {
    throw new Error('image_failed_revalidation')
  }
  const sha = (await sha256Hex(bytes)).slice(0, 12)
  const publicPath = contributionMediaLogicalPath(
    record.pagePath,
    media.id,
    validation.ext
  )
  const objectKey = objectKeyFor(publicPath, sha)
  const registry = parseRegistry(registryText)
  const trackedBytes = registryByteTotal(registry)
  if (trackedBytes + bytes.byteLength > PUBLIC_MEDIA_STORAGE_CEILING_BYTES) {
    throw new Error('public_media_storage_full')
  }

  const nextContent = approvePendingMediaInMarkdown(
    pageContent,
    media.id,
    publicPath,
    media,
    record.locale
  )
  registry[publicPath] = {
    key: objectKey,
    w: validation.size.w,
    h: validation.size.h,
    bytes: bytes.byteLength,
    sha,
    remote: true,
    uploadedAt: new Date().toISOString()
  }
  const nextRegistry = JSON.stringify(sortedRegistry(registry), null, 2) + '\n'

  const existed = Boolean(await bindings.library.head(objectKey))
  if (!existed) {
    await bindings.library.put(objectKey, bytes, {
      httpMetadata: {
        contentType: media.mime,
        cacheControl: CACHE_CONTROL
      },
      customMetadata: {
        logicalPath: publicPath,
        approvedBy: reviewerEmail,
        reviewId: record.id
      }
    })
  }
  try {
    await commitContributionFiles(env, {
      branchName: record.branchName,
      files: [
        { path: record.repoPath, content: nextContent },
        { path: REGISTRY_PATH, content: nextRegistry }
      ],
      message: `chore: approve proposed image for "${record.pageTitle}"`
    })
  } catch (error) {
    if (!existed) await bindings.library.delete(objectKey).catch(() => {})
    throw error
  }

  await Promise.all([
    bindings.quarantine.delete(media.objectKey),
    bindings.guards.delete(mediaRecordKey(media.id))
  ])
  record.media[index] = {
    ...media,
    status: 'approved',
    publicPath,
    decidedAt: new Date().toISOString(),
    decidedBy: reviewerEmail
  }
  return record
}

export async function POST(
  req: Request,
  env: CloudflareEnv,
  id: string
) {
  const auth = await reviewer(req, env)
  if (auth.error || !auth.user) return auth.error

  const body = await readBoundedJson(req, SMALL_JSON_BODY_MAX_BYTES)
  if (!body.ok) {
    return json(
      { error: body.error === 'body_too_large' ? 'body_too_large' : 'invalid_json' },
      body.error === 'body_too_large' ? 413 : 400
    )
  }
  if (!isRecord(body.value)) return json({ error: 'invalid_json' }, 400)

  let loaded
  try {
    loaded = await loadRecord(env, id)
  } catch {
    return json({ error: 'review_unavailable' }, 503)
  }
  if (!loaded.record) return json({ error: 'review_expired' }, 404)
  let record = loaded.record
  const reason =
    typeof body.value.reason === 'string'
      ? body.value.reason.trim().slice(0, 200)
      : undefined

  if (body.value.action === 'mute') {
    const durationDays = body.value.durationDays === 30 ? 30 : 7
    await setModeration(loaded.bindings, record.ownerHash, {
      status: 'muted',
      until: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
      ...(reason ? { reason } : {})
    })
  } else if (body.value.action === 'ban') {
    await setModeration(loaded.bindings, record.ownerHash, {
      status: 'banned',
      ...(reason ? { reason } : {})
    })
  } else if (body.value.action === 'unmute') {
    await setModeration(loaded.bindings, record.ownerHash, { status: 'active' })
  } else if (
    (body.value.action === 'approve' || body.value.action === 'reject') &&
    typeof body.value.mediaId === 'string'
  ) {
    try {
      record = await decideImage(
        env,
        record,
        body.value.mediaId,
        body.value.action,
        auth.user.email,
        reason
      )
    } catch (error) {
      logError('contribution_review', 'decision_failed', error, {
        reviewId: id,
        mediaId: body.value.mediaId,
        action: body.value.action
      })
      const code = error instanceof Error ? error.message : 'review_decision_failed'
      return json({ error: code }, code === 'public_media_storage_full' ? 507 : 409)
    }
    if (record.media.every((item) => item.status !== 'pending')) record.status = 'decided'
    await saveRecord(loaded.bindings, record)
  } else {
    return json({ error: 'invalid_review_action' }, 400)
  }

  const moderation = await moderationFor(loaded.bindings, record.ownerHash)
  return json(safeReview(record, moderation))
}
