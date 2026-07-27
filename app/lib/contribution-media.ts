/**
 * Pure, Worker-safe rules for proposed contributor images.
 *
 * This module deliberately has no filesystem, Node Buffer, R2, or GitHub
 * dependency. The browser uses the marker helpers, route handlers use the byte
 * validator, and tests exercise the exact same limits.
 */

export const PENDING_MEDIA_PREFIX = '/__pending-media/'
export const PENDING_MEDIA_ID = /^[a-f0-9]{32}$/

export const MAX_CONTRIBUTION_IMAGE_BYTES = 300 * 1024
export const MAX_CONTRIBUTION_IMAGE_WIDTH = 3000
export const MAX_CONTRIBUTION_IMAGE_HEIGHT = 6000
export const MAX_CONTRIBUTION_IMAGE_PIXELS = 12_000_000
export const MAX_IMAGES_PER_CONTRIBUTION = 5
export const MAX_IMAGES_PER_USER_PER_DAY = 15
export const MAX_BYTES_PER_USER_PER_DAY = 1500 * 1024
export const MAX_QUARANTINE_BYTES = 25 * 1024 * 1024
export const PUBLIC_MEDIA_STORAGE_CEILING_BYTES = 500 * 1024 * 1024
export const QUARANTINE_TTL_SECONDS = 7 * 24 * 60 * 60

export const CONTRIBUTION_IMAGE_TYPES = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp'
} as const

export type ContributionImageMime = keyof typeof CONTRIBUTION_IMAGE_TYPES

export interface ContributionMediaInput {
  id: string
  alt: string
  source?: string
  credit?: string
  checked?: string
}

export interface ContributionImageValidation {
  errors: string[]
  mime: ContributionImageMime | null
  ext: string | null
  bytes: number
  size: { w: number; h: number } | null
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.slice(start, end))
}

function u16be(bytes: Uint8Array, offset: number): number {
  return bytes[offset] * 256 + bytes[offset + 1]
}

function u16le(bytes: Uint8Array, offset: number): number {
  return bytes[offset] + bytes[offset + 1] * 256
}

function u24le(bytes: Uint8Array, offset: number): number {
  return bytes[offset] + bytes[offset + 1] * 256 + bytes[offset + 2] * 65536
}

function u32be(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] * 0x1000000 +
    bytes[offset + 1] * 0x10000 +
    bytes[offset + 2] * 0x100 +
    bytes[offset + 3]
  )
}

function u32le(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] +
    bytes[offset + 1] * 0x100 +
    bytes[offset + 2] * 0x10000 +
    bytes[offset + 3] * 0x1000000
  )
}

function pngSize(bytes: Uint8Array): { w: number; h: number } | null {
  if (bytes.length < 24 || u32be(bytes, 0) !== 0x89504e47) return null
  if (ascii(bytes, 12, 16) !== 'IHDR') return null
  return { w: u32be(bytes, 16), h: u32be(bytes, 20) }
}

function jpegSize(bytes: Uint8Array): { w: number; h: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null
  let offset = 2
  while (offset < bytes.length - 9) {
    if (bytes[offset] !== 0xff) {
      offset++
      continue
    }
    const marker = bytes[offset + 1]
    if (marker === 0xff || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2
      continue
    }
    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    if (isStartOfFrame) {
      return { h: u16be(bytes, offset + 5), w: u16be(bytes, offset + 7) }
    }
    const length = u16be(bytes, offset + 2)
    if (length < 2) return null
    offset += 2 + length
  }
  return null
}

function webpSize(bytes: Uint8Array): { w: number; h: number } | null {
  if (
    bytes.length < 30 ||
    ascii(bytes, 0, 4) !== 'RIFF' ||
    ascii(bytes, 8, 12) !== 'WEBP'
  ) {
    return null
  }
  const chunk = ascii(bytes, 12, 16)
  if (chunk === 'VP8X') {
    return { w: u24le(bytes, 24) + 1, h: u24le(bytes, 27) + 1 }
  }
  if (chunk === 'VP8L') {
    const bits = u32le(bytes, 21)
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 }
  }
  if (chunk === 'VP8 ') {
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null
    return { w: u16le(bytes, 26) & 0x3fff, h: u16le(bytes, 28) & 0x3fff }
  }
  return null
}

function sniff(bytes: Uint8Array): {
  mime: ContributionImageMime
  size: { w: number; h: number }
} | null {
  const png = pngSize(bytes)
  if (png) return { mime: 'image/png', size: png }
  const jpeg = jpegSize(bytes)
  if (jpeg) return { mime: 'image/jpeg', size: jpeg }
  const webp = webpSize(bytes)
  if (webp) return { mime: 'image/webp', size: webp }
  return null
}

export function validateContributionImage(
  bytes: Uint8Array,
  fileName: string,
  declaredType: string
): ContributionImageValidation {
  const errors: string[] = []
  const lowerName = String(fileName || '').toLowerCase()
  const declared = declaredType.toLowerCase() as ContributionImageMime
  const expectedExt = CONTRIBUTION_IMAGE_TYPES[declared]

  if (!expectedExt) errors.push('unsupported_type')
  if (
    lowerName.includes('/') ||
    lowerName.includes('\\') ||
    !/\.(?:png|jpe?g|webp)$/.test(lowerName)
  ) {
    errors.push('unsupported_extension')
  }
  if (bytes.length <= 0) errors.push('empty_file')
  if (bytes.length > MAX_CONTRIBUTION_IMAGE_BYTES) errors.push('file_too_large')

  const detected = sniff(bytes)
  if (!detected) {
    errors.push('invalid_image')
  } else {
    if (expectedExt && detected.mime !== declared) errors.push('type_mismatch')
    const nameMatches =
      detected.mime === 'image/jpeg'
        ? /\.jpe?g$/.test(lowerName)
        : lowerName.endsWith(CONTRIBUTION_IMAGE_TYPES[detected.mime])
    if (!nameMatches) errors.push('extension_mismatch')
    if (detected.size.w > MAX_CONTRIBUTION_IMAGE_WIDTH) errors.push('image_too_wide')
    if (detected.size.h > MAX_CONTRIBUTION_IMAGE_HEIGHT) errors.push('image_too_tall')
    if (detected.size.w * detected.size.h > MAX_CONTRIBUTION_IMAGE_PIXELS) {
      errors.push('too_many_pixels')
    }
  }

  return {
    errors: [...new Set(errors)],
    mime: detected?.mime ?? null,
    ext: detected ? CONTRIBUTION_IMAGE_TYPES[detected.mime] : null,
    bytes: bytes.length,
    size: detected?.size ?? null
  }
}

export function pendingMediaSrc(id: string): string {
  if (!PENDING_MEDIA_ID.test(id)) throw new Error('invalid_media_id')
  return `${PENDING_MEDIA_PREFIX}${id}`
}

export function extractPendingMediaIds(markdown: string): string[] {
  const found = new Set<string>()
  const expression = /\/__pending-media\/([a-f0-9]{32})(?![a-f0-9])/g
  for (const match of markdown.matchAll(expression)) found.add(match[1])
  return [...found]
}

/** Existing reviewed /media paths and private pending markers are the only
 * image sources accepted from the browser editor. */
export function uncontrolledImageSources(markdown: string): string[] {
  const found = new Set<string>()
  for (const match of markdown.matchAll(/!\[[^\]]*\]\(\s*([^)\s]+)/g)) {
    const source = match[1]
    if (!source.startsWith('/media/') && !source.startsWith(PENDING_MEDIA_PREFIX)) {
      found.add(source)
    }
  }
  for (const match of markdown.matchAll(/<Figure\b[\s\S]*?\bsrc=["']([^"']+)["'][\s\S]*?\/>/g)) {
    const source = match[1]
    if (!source.startsWith('/media/')) found.add(source)
  }
  return [...found]
}

export function normalizeContributionMediaInput(value: unknown): ContributionMediaInput | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const id = typeof raw.id === 'string' ? raw.id : ''
  const alt = typeof raw.alt === 'string' ? raw.alt.trim().slice(0, 280) : ''
  const source = typeof raw.source === 'string' ? raw.source.trim().slice(0, 300) : ''
  const credit = typeof raw.credit === 'string' ? raw.credit.trim().slice(0, 200) : ''
  const checked = typeof raw.checked === 'string' ? raw.checked.trim() : ''
  if (!PENDING_MEDIA_ID.test(id) || !alt) return null
  if (checked && !/^\d{4}-\d{2}-\d{2}$/.test(checked)) return null
  return {
    id,
    alt,
    ...(source ? { source } : {}),
    ...(credit ? { credit } : {}),
    ...(checked ? { checked } : {})
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeMdxAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r?\n/g, ' ')
}

function pendingMarkdownPattern(id: string): RegExp {
  const src = escapeRegExp(pendingMediaSrc(id))
  return new RegExp(
    `!\\[[^\\]]*\\]\\(\\s*${src}(?:\\s+["']([^"']*)["'])?\\s*\\)`,
    'g'
  )
}

export function countPendingMediaUses(markdown: string, id: string): number {
  return [...markdown.matchAll(pendingMarkdownPattern(id))].length
}

export function approvePendingMediaInMarkdown(
  markdown: string,
  id: string,
  publicPath: string,
  metadata: ContributionMediaInput,
  locale: string
): string {
  const pattern = pendingMarkdownPattern(id)
  let replacements = 0
  const next = markdown.replace(pattern, (_match, caption: string | undefined) => {
    replacements++
    const props = [
      `src="${escapeMdxAttribute(publicPath)}"`,
      `alt="${escapeMdxAttribute(metadata.alt)}"`,
      caption ? `caption="${escapeMdxAttribute(caption)}"` : '',
      metadata.source ? `source="${escapeMdxAttribute(metadata.source)}"` : '',
      metadata.credit ? `credit="${escapeMdxAttribute(metadata.credit)}"` : '',
      metadata.checked ? `checked="${escapeMdxAttribute(metadata.checked)}"` : '',
      locale === 'en' ? 'locale="en"' : ''
    ].filter(Boolean)
    return `<Figure ${props.join(' ')} />`
  })
  if (replacements !== 1) throw new Error('pending_media_marker_mismatch')
  return next
}

export function rejectPendingMediaInMarkdown(markdown: string, id: string): string {
  const pattern = pendingMarkdownPattern(id)
  let replacements = 0
  const next = markdown.replace(pattern, () => {
    replacements++
    return ''
  })
  if (replacements !== 1) throw new Error('pending_media_marker_mismatch')
  return next.replace(/\n{3,}/g, '\n\n')
}

export function contributionMediaLogicalPath(
  pagePath: string,
  id: string,
  ext: string
): string {
  if (!PENDING_MEDIA_ID.test(id) || !/^\.(?:png|jpg|webp)$/.test(ext)) {
    throw new Error('invalid_media_path')
  }
  const page = pagePath
    .replace(/^\/en(?:\/|$)/, '')
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .map((part) => part.replace(/[^a-z0-9-]/g, '').slice(0, 50))
    .filter(Boolean)
    .join('/')
  return `/media/contributions/${page || 'page'}/${id.slice(0, 12)}${ext}`
}
