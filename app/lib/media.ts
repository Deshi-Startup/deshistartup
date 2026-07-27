/**
 * The one place that decides where a media file lives and how it is delivered.
 *
 * Images live in an R2 bucket served from media.deshistartup.com, never in the
 * repository: git cannot forget a binary once it is committed, and a reference
 * work accumulates screenshots for years. What the repo keeps is the registry
 * in app/generated/media.json — a few lines of text per image.
 *
 * Content never writes a storage URL. Pages reference `/media/...` and nothing
 * else, so where the bytes actually sit stays a deployment concern:
 *
 *   bucket (default)  ->  https://media.deshistartup.com/x.webp
 *   self-hosted       ->  /media/x.webp from public/, if the base URL is unset
 *
 * Resizing is done at the edge by Cloudflare's /cdn-cgi/image/ transformations
 * rather than by storing derivatives or running an image service. That path
 * only exists on a Cloudflare zone with Transformations enabled, so it is
 * opt-in per deploy target; everywhere else serves the original file.
 */
import mediaManifest from '../generated/media.json'

export interface MediaEntry {
  /** Intrinsic width in pixels. Absent when the header could not be read. */
  w?: number
  /** Intrinsic height in pixels. */
  h?: number
  bytes?: number
  /** Content-addressed object key in the bucket, e.g. "a/b.4a5afeaff848.png". */
  key?: string
  /** Short content hash, so re-uploads only send what actually changed. */
  sha?: string
  /** True once the object is in the bucket. */
  remote?: boolean
}

const entries = mediaManifest as Record<string, MediaEntry>

/** Every in-repo media path starts here. Also the object key prefix in a bucket. */
export const MEDIA_PREFIX = '/media/'

/** Widths we ask the edge for. Tuned to the 72ch prose column, not the viewport. */
export const DEFAULT_WIDTHS = [480, 800, 1200]

/** Matches the 860px layout breakpoint in globals.css. */
export const DEFAULT_SIZES = '(max-width: 860px) 100vw, 800px'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
// Empty means "serve /media/... from public/" — the self-hosting escape hatch
// for a fork. next.config.mjs fills it with MEDIA_URL by default.
const remoteBase = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '').replace(/\/+$/, '')
const transformsEnabled = process.env.NEXT_PUBLIC_MEDIA_TRANSFORM === '1'

/**
 * The object's key in the bucket. Uploads content-address it
 * ("a/b.4a5afeaff848.png") so it can be cached forever and still be replaced;
 * the plain path is the fallback for anything not recorded that way.
 */
function objectKey(src: string): string {
  return entries[src]?.key || src.slice(MEDIA_PREFIX.length)
}

// SVG needs no resizing and GIF would lose its animation, so neither is sent
// through the transformer.
const TRANSFORMABLE = /\.(png|jpe?g|webp)$/i

export function isExternalMedia(src: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith('//')
}

export function isOwnMedia(src: string): boolean {
  return src.startsWith(MEDIA_PREFIX)
}

export function mediaEntry(src: string): MediaEntry | undefined {
  return entries[src]
}

/** The asset's own URL, before any transformation. */
export function mediaSource(src: string): string {
  if (isExternalMedia(src)) return src
  if (!src.startsWith('/')) return src
  if (remoteBase && isOwnMedia(src)) return `${remoteBase}/${objectKey(src)}`
  return `${basePath}${src}`
}

/**
 * Delivery URL at a given width. Without transformations — or for a file we do
 * not own, or a format that should not be re-encoded — this is just the source.
 *
 * The transformation is always requested from the host that serves the original
 * (the bucket's custom domain, or the site itself when self-hosting), so the
 * source is same-origin. That keeps it inside the zone's default source
 * restriction, and it is what makes `onerror=redirect` legal: if the account
 * ever exceeds its free monthly transformations, readers get the original file
 * instead of a broken image.
 */
export function mediaUrl(src: string, width?: number): string {
  const source = mediaSource(src)
  if (!width || !transformsEnabled || !isOwnMedia(src) || !TRANSFORMABLE.test(src)) return source
  const options = `width=${width},format=auto,onerror=redirect`
  if (remoteBase) return `${remoteBase}/cdn-cgi/image/${options}/${objectKey(src)}`
  return `${basePath}/cdn-cgi/image/${options}${src}`
}

/**
 * A srcset capped at the file's own width — asking the edge to upscale would
 * spend a billable transformation to make the image worse.
 */
export function mediaSrcSet(src: string, widths: number[] = DEFAULT_WIDTHS): string | undefined {
  if (!transformsEnabled || !isOwnMedia(src) || !TRANSFORMABLE.test(src)) return undefined
  const intrinsic = mediaEntry(src)?.w
  const usable = intrinsic ? widths.filter((width) => width < intrinsic) : [...widths]
  if (intrinsic) {
    // The file's own width is worth offering only when it is meaningfully
    // bigger than the largest step below it. A 1280px poster next to a 1200px
    // step gives no browser anything, and every candidate is a separate
    // billable transformation.
    const largest = usable[usable.length - 1] ?? 0
    if (intrinsic >= largest * 1.15) usable.push(intrinsic)
  }
  const unique = [...new Set(usable)].sort((a, b) => a - b)
  if (unique.length < 2) return undefined
  return unique.map((width) => `${mediaUrl(src, width)} ${width}w`).join(', ')
}

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']

/**
 * Bengali numerals without touching Intl: these strings are baked at build time
 * but may also render in the Worker, whose ICU data is not the build host's.
 */
export function toBengaliDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) => BN_DIGITS[Number(digit)])
}

const BN_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর'
]

const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

/** "2026-07-27" -> "২৭ জুলাই ২০২৬" / "27 July 2026". Unparseable input passes through. */
export function formatMediaDate(iso: string, locale: 'bn' | 'en' = 'bn'): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!match) return iso
  const [, year, month, day] = match
  const index = Number(month) - 1
  if (index < 0 || index > 11) return iso
  const months = locale === 'en' ? EN_MONTHS : BN_MONTHS
  const text = `${Number(day)} ${months[index]} ${year}`
  return locale === 'en' ? text : toBengaliDigits(text)
}

/** Stable id for aria wiring. Deterministic so server and client agree. */
export function mediaId(...parts: (string | undefined)[]): string {
  const input = parts.filter(Boolean).join('|')
  let hash = 5381
  for (let i = 0; i < input.length; i++) hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0
  return hash.toString(36)
}
