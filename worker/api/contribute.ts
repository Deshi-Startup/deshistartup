import { requireUser } from '../lib/google-token'
import { createContributionPR } from '../lib/github-app'
import { resolveContributable } from '../../app/lib/contributable-registry'
import {
  MAX_IMAGES_PER_CONTRIBUTION,
  countPendingMediaUses,
  extractPendingMediaIds,
  normalizeContributionMediaInput,
  QUARANTINE_TTL_SECONDS,
  uncontrolledImageSources
} from '../../app/lib/contribution-media'
import {
  ContributionReviewRecord,
  QuarantineMediaRecord,
  ReviewMediaRecord,
  contributionRateAllowed,
  contributorHash,
  getContributionBindings,
  mediaRecordKey,
  moderationFor,
  newOpaqueId,
  readJson,
  reviewRecordKey,
  writeJson
} from '../lib/contribution-guard'
import {
  CONTRIBUTION_JSON_BODY_MAX_BYTES,
  isRecord,
  readBoundedJson
} from '../lib/request-body.ts'
import { logError } from '../lib/logging.ts'
import { authenticatedJson as json } from '../lib/http.ts'

export async function POST(req: Request, env: CloudflareEnv) {
  let user
  try {
    user = await requireUser(req, env)
  } catch (err) {
    logError('contribute', 'google_authentication_unavailable', err)
    return json({ error: 'auth_unavailable' }, 503)
  }
  if (!user) return json({ error: 'unauthorized' }, 401)

  let bindings
  try {
    bindings = getContributionBindings(env)
  } catch (err) {
    logError('contribute', 'contribution_bindings_unavailable', err)
    return json({ error: 'contribution_unavailable' }, 503)
  }
  const ownerHash = await contributorHash(user)
  if (!(await contributionRateAllowed(bindings, ownerHash))) {
    return json({ error: 'contribution_rate_limited' }, 429)
  }
  const moderation = await moderationFor(bindings, ownerHash)
  if (moderation.status === 'banned') return json({ error: 'contributor_banned' }, 403)
  if (moderation.status === 'muted') {
    return json({ error: 'contributor_muted', until: moderation.until }, 403)
  }

  // Bearer-token auth is not vulnerable to CSRF (the token isn't sent
  // automatically by the browser like a cookie), so no Origin check needed.

  const body = await readBoundedJson(req, CONTRIBUTION_JSON_BODY_MAX_BYTES)
  if (!body.ok) {
    return json(
      { error: body.error === 'body_too_large' ? 'content_too_large' : 'invalid_json' },
      body.error === 'body_too_large' ? 413 : 400
    )
  }
  if (!isRecord(body.value)) return json({ error: 'invalid_json' }, 400)

  const { path, content, summary, media } = body.value
  if (!path || typeof path !== 'string') return json({ error: 'path_required' }, 400)

  const entry = resolveContributable(path)
  if (!entry) return json({ error: 'not_contributable' }, 404)

  if (typeof content !== 'string' || content.trim().length < 10) {
    return json({ error: 'content_too_short' }, 400)
  }
  if (content.length > 200_000) return json({ error: 'content_too_large' }, 413)
  if (uncontrolledImageSources(content).length) {
    return json({ error: 'uncontrolled_image_source' }, 400)
  }

  const pendingIds = extractPendingMediaIds(content)
  if (pendingIds.length > MAX_IMAGES_PER_CONTRIBUTION) {
    return json({ error: 'too_many_images' }, 400)
  }
  for (const id of pendingIds) {
    if (countPendingMediaUses(content, id) !== 1) {
      return json({ error: 'duplicate_image_marker' }, 400)
    }
  }

  const normalizedMedia = Array.isArray(media)
    ? media.map(normalizeContributionMediaInput)
    : []
  if (normalizedMedia.some((item) => !item)) {
    return json({ error: 'image_metadata_required' }, 400)
  }
  const mediaById = new Map(
    normalizedMedia
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => [item.id, item])
  )
  if (
    mediaById.size !== pendingIds.length ||
    pendingIds.some((id) => !mediaById.has(id))
  ) {
    return json({ error: 'image_metadata_required' }, 400)
  }

  const summaryStr = typeof summary === 'string' ? summary.trim().slice(0, 280) : ''
  const quarantineChecks = await Promise.all(
    pendingIds.map(async (id) => {
      const record = await readJson<QuarantineMediaRecord>(
        bindings.guards,
        mediaRecordKey(id)
      )
      if (
        !record ||
        record.ownerHash !== ownerHash ||
        record.pagePath !== path ||
        !['quarantined', 'pending_review'].includes(record.status) ||
        Date.parse(record.expiresAt) <= Date.now()
      ) {
        return { id, record: null }
      }
      if (!(await bindings.quarantine.head(record.objectKey))) {
        return { id, record: null }
      }
      return { id, record }
    })
  )
  const quarantineRecords: QuarantineMediaRecord[] = []
  for (const { id, record } of quarantineChecks) {
    if (!record) return json({ error: 'image_expired_or_forbidden', id }, 409)
    quarantineRecords.push(record)
  }

  const pageUrl = `https://deshistartup.com${path}`
  const reviewId = pendingIds.length ? newOpaqueId() : undefined
  let reviewRecord: ContributionReviewRecord | undefined
  if (reviewId) {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + QUARANTINE_TTL_SECONDS * 1000)
    const reviewMedia: ReviewMediaRecord[] = quarantineRecords.map((record) => ({
      ...mediaById.get(record.id)!,
      objectKey: record.objectKey,
      originalName: record.originalName,
      mime: record.mime,
      ext: record.ext,
      bytes: record.bytes,
      w: record.w,
      h: record.h,
      createdAt: record.createdAt,
      status: 'pending'
    }))
    reviewRecord = {
      version: 1,
      id: reviewId,
      ownerHash,
      ownerName: user.name,
      pagePath: path,
      repoPath: entry.repoPath,
      pageTitle: entry.title,
      locale: entry.locale,
      status: 'creating',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      media: reviewMedia
    }
    try {
      await writeJson(
        bindings.guards,
        reviewRecordKey(reviewId),
        reviewRecord,
        QUARANTINE_TTL_SECONDS + 24 * 60 * 60
      )
      await Promise.all(
        quarantineRecords.map((record) =>
          writeJson(
            bindings.guards,
            mediaRecordKey(record.id),
            {
              ...record,
              status: 'pending_review',
              contributionId: reviewId,
              metadata: mediaById.get(record.id)
            } satisfies QuarantineMediaRecord,
            QUARANTINE_TTL_SECONDS + 24 * 60 * 60
          )
        )
      )
    } catch (err) {
      logError('contribute', 'media_review_reservation_failed', err)
      return json({ error: 'media_review_unavailable' }, 503)
    }
  }

  let result: Awaited<ReturnType<typeof createContributionPR>>
  try {
    result = await createContributionPR(env, {
      repoPath: entry.repoPath,
      content,
      summary: summaryStr,
      contributor: user,
      pageTitle: entry.title,
      pageUrl,
      pagePath: path,
      reviewId
    })
  } catch (err) {
    logError('contribute', 'pr_creation_failed', err)
    if (reviewRecord) {
      await Promise.allSettled([
        bindings.guards.delete(reviewRecordKey(reviewRecord.id)),
        ...quarantineRecords.map((record) =>
          writeJson(
            bindings.guards,
            mediaRecordKey(record.id),
            { ...record, status: 'quarantined', contributionId: undefined, metadata: undefined },
            QUARANTINE_TTL_SECONDS + 24 * 60 * 60
          )
        )
      ])
    }
    return json({ error: 'pr_creation_failed' }, 502)
  }

  if (reviewRecord) {
    reviewRecord = {
      ...reviewRecord,
      branchName: result.branchName,
      prNumber: result.prNumber,
      prUrl: result.prUrl,
      status: 'pending'
    }
    try {
      await writeJson(
        bindings.guards,
        reviewRecordKey(reviewRecord.id),
        reviewRecord,
        QUARANTINE_TTL_SECONDS + 24 * 60 * 60
      )
    } catch (err) {
      // The PR contains private markers, so CI remains failed and nothing can
      // publish accidentally. A reviewer can retry after the transient store
      // issue rather than an unapproved image slipping through.
      logError('contribute', 'review_record_finalization_failed', err, {
        prUrl: result.prUrl
      })
      return json({ error: 'media_review_unavailable', prUrl: result.prUrl }, 503)
    }
  }

  return json({
    ...result,
    ...(reviewRecord
      ? { reviewId: reviewRecord.id, pendingImages: reviewRecord.media.length }
      : {})
  })
}
