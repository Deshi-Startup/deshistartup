import type { GoogleUser } from './google-token'
import type {
  ContributionMediaInput,
  ContributionImageMime
} from '../../app/lib/contribution-media'

export type GuardNamespace = CloudflareEnv['CONTRIBUTION_GUARDS']
export type ContributionR2Bucket = CloudflareEnv['MEDIA_QUARANTINE']
export type ContributionR2Object = R2Object
export type ContributionR2Body = R2ObjectBody

export interface ContributionBindings {
  guards: CloudflareEnv['CONTRIBUTION_GUARDS']
  library: CloudflareEnv['MEDIA_LIBRARY']
  quarantine: CloudflareEnv['MEDIA_QUARANTINE']
  mediaUserRate: CloudflareEnv['MEDIA_USER_RATE']
  mediaGlobalRate: CloudflareEnv['MEDIA_GLOBAL_RATE']
  contributionUserRate: CloudflareEnv['CONTRIBUTION_USER_RATE']
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
const MODERATION_CACHE_MAX = 1024
const textEncoder = new TextEncoder()

export function getContributionBindings(env: CloudflareEnv): ContributionBindings {
  return {
    guards: env.CONTRIBUTION_GUARDS,
    library: env.MEDIA_LIBRARY,
    quarantine: env.MEDIA_QUARANTINE,
    mediaUserRate: env.MEDIA_USER_RATE,
    mediaGlobalRate: env.MEDIA_GLOBAL_RATE,
    contributionUserRate: env.CONTRIBUTION_USER_RATE
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
  if (moderationCache.size >= MODERATION_CACHE_MAX) {
    const cutoff = now
    for (const [key, entry] of moderationCache) {
      if (entry.expires <= cutoff) moderationCache.delete(key)
    }
    if (moderationCache.size >= MODERATION_CACHE_MAX) moderationCache.clear()
  }
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

export function isReviewer(
  user: Pick<GoogleUser, 'email'>,
  env: CloudflareEnv
): boolean {
  const allowed = (env.CONTRIBUTION_REVIEWER_EMAILS || '')
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
