import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { GoogleUser } from './google-token'
import type { ContributionMediaInput, ContributionImageMime } from './contribution-media'

export interface GuardNamespace {
  get<T>(key: string, type: 'json'): Promise<T | null>
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>
  delete(key: string): Promise<void>
}

export interface ContributionR2Object {
  key: string
  size: number
}

export interface ContributionR2Body extends ContributionR2Object {
  body: ReadableStream<Uint8Array>
  arrayBuffer(): Promise<ArrayBuffer>
}

export interface ContributionR2Bucket {
  get(key: string): Promise<ContributionR2Body | null>
  head(key: string): Promise<ContributionR2Object | null>
  put(
    key: string,
    value: Uint8Array | ArrayBuffer | ReadableStream,
    options?: {
      httpMetadata?: { contentType?: string; cacheControl?: string }
      customMetadata?: Record<string, string>
    }
  ): Promise<ContributionR2Object>
  delete(key: string): Promise<void>
  list(options?: {
    prefix?: string
    limit?: number
    cursor?: string
  }): Promise<{
    objects: ContributionR2Object[]
    truncated: boolean
    cursor?: string
  }>
}

export interface ContributionRateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

export interface ContributionBindings {
  guards: GuardNamespace
  library: ContributionR2Bucket
  quarantine: ContributionR2Bucket
  mediaUserRate: ContributionRateLimit
  mediaGlobalRate: ContributionRateLimit
  contributionUserRate: ContributionRateLimit
}

export type ModerationState =
  | { status: 'active' }
  | { status: 'muted'; until: string; reason?: string }
  | { status: 'banned'; reason?: string }

export interface QuarantineMediaRecord {
  version: 1
  id: string
  ownerHash: string
  ownerName: string
  pagePath: string
  objectKey: string
  originalName: string
  mime: ContributionImageMime
  ext: string
  bytes: number
  w: number
  h: number
  createdAt: string
  expiresAt: string
  status: 'quarantined' | 'pending_review'
  contributionId?: string
  metadata?: ContributionMediaInput
}

export interface ReviewMediaRecord extends ContributionMediaInput {
  objectKey: string
  originalName: string
  mime: ContributionImageMime
  ext: string
  bytes: number
  w: number
  h: number
  createdAt: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  publicPath?: string
  reason?: string
  decidedAt?: string
  decidedBy?: string
}

export interface ContributionReviewRecord {
  version: 1
  id: string
  ownerHash: string
  ownerName: string
  pagePath: string
  repoPath: string
  pageTitle: string
  locale: string
  branchName?: string
  prNumber?: number
  prUrl?: string
  status: 'creating' | 'pending' | 'decided'
  createdAt: string
  expiresAt: string
  media: ReviewMediaRecord[]
}

const moderationCache = new Map<string, { value: ModerationState; expires: number }>()
const MODERATION_CACHE_MS = 30_000
const textEncoder = new TextEncoder()

export function getContributionBindings(): ContributionBindings {
  const { env } = getCloudflareContext()
  const contributionEnv = env as unknown as {
    CONTRIBUTION_GUARDS?: GuardNamespace
    MEDIA_LIBRARY?: ContributionR2Bucket
    MEDIA_QUARANTINE?: ContributionR2Bucket
    MEDIA_USER_RATE?: ContributionRateLimit
    MEDIA_GLOBAL_RATE?: ContributionRateLimit
    CONTRIBUTION_USER_RATE?: ContributionRateLimit
  }
  if (
    !contributionEnv.CONTRIBUTION_GUARDS ||
    !contributionEnv.MEDIA_LIBRARY ||
    !contributionEnv.MEDIA_QUARANTINE ||
    !contributionEnv.MEDIA_USER_RATE ||
    !contributionEnv.MEDIA_GLOBAL_RATE ||
    !contributionEnv.CONTRIBUTION_USER_RATE
  ) {
    throw new Error('contribution_bindings_unavailable')
  }
  return {
    guards: contributionEnv.CONTRIBUTION_GUARDS,
    library: contributionEnv.MEDIA_LIBRARY,
    quarantine: contributionEnv.MEDIA_QUARANTINE,
    mediaUserRate: contributionEnv.MEDIA_USER_RATE,
    mediaGlobalRate: contributionEnv.MEDIA_GLOBAL_RATE,
    contributionUserRate: contributionEnv.CONTRIBUTION_USER_RATE
  }
}

export async function sha256Hex(value: string | Uint8Array): Promise<string> {
  const input = typeof value === 'string' ? textEncoder.encode(value) : value
  const copy = new Uint8Array(input.byteLength)
  copy.set(input)
  const digest = await crypto.subtle.digest('SHA-256', copy.buffer)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function contributorHash(user: Pick<GoogleUser, 'sub' | 'email'>): Promise<string> {
  return (await sha256Hex(user.sub || user.email.toLowerCase().trim())).slice(0, 24)
}

export function newOpaqueId(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

export function mediaRecordKey(id: string): string {
  return `media:${id}`
}

export function reviewRecordKey(id: string): string {
  return `review:${id}`
}

export function moderationRecordKey(ownerHash: string): string {
  return `moderation:${ownerHash}`
}

export async function readJson<T>(namespace: GuardNamespace, key: string): Promise<T | null> {
  return namespace.get<T>(key, 'json')
}

export async function writeJson(
  namespace: GuardNamespace,
  key: string,
  value: unknown,
  expirationTtl?: number
): Promise<void> {
  await namespace.put(key, JSON.stringify(value), expirationTtl ? { expirationTtl } : undefined)
}

export async function moderationFor(
  bindings: ContributionBindings,
  ownerHash: string,
  now = Date.now()
): Promise<ModerationState> {
  const cached = moderationCache.get(ownerHash)
  if (cached && cached.expires > now) return cached.value

  const stored = await readJson<ModerationState>(
    bindings.guards,
    moderationRecordKey(ownerHash)
  )
  let value: ModerationState = { status: 'active' }
  if (stored?.status === 'banned') {
    value = stored
  } else if (stored?.status === 'muted' && Date.parse(stored.until) > now) {
    value = stored
  }
  moderationCache.set(ownerHash, { value, expires: now + MODERATION_CACHE_MS })
  return value
}

export async function setModeration(
  bindings: ContributionBindings,
  ownerHash: string,
  state: ModerationState
): Promise<void> {
  const key = moderationRecordKey(ownerHash)
  if (state.status === 'active') await bindings.guards.delete(key)
  else await writeJson(bindings.guards, key, state)
  moderationCache.delete(ownerHash)
}

export function isReviewer(user: Pick<GoogleUser, 'email'>): boolean {
  const allowed = (process.env.CONTRIBUTION_REVIEWER_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
  return allowed.includes(user.email.toLowerCase().trim())
}

export async function mediaRateAllowed(
  bindings: ContributionBindings,
  ownerHash: string
): Promise<boolean> {
  const [user, global] = await Promise.all([
    bindings.mediaUserRate.limit({ key: ownerHash }),
    bindings.mediaGlobalRate.limit({ key: 'all-media-uploads' })
  ])
  return user.success && global.success
}

export async function contributionRateAllowed(
  bindings: ContributionBindings,
  ownerHash: string
): Promise<boolean> {
  return (await bindings.contributionUserRate.limit({ key: ownerHash })).success
}

export async function listQuarantineObjects(
  bucket: ContributionR2Bucket
): Promise<{ objects: ContributionR2Object[]; truncated: boolean }> {
  const page = await bucket.list({ prefix: 'pending/', limit: 1000 })
  return { objects: page.objects, truncated: page.truncated }
}
