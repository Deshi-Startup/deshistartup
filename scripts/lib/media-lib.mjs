/**
 * Shared plumbing for the media library.
 *
 * The bytes live in R2 and never enter git — that is the whole point of the
 * arrangement, because a repository cannot forget a binary once it has been
 * committed. What git does keep is `app/generated/media.json`, a small text
 * registry naming every uploaded object and its size, so pages can reserve the
 * right space for an image without the image being anywhere near the build.
 *
 * Three paths for one file:
 *
 *   media/registration/rjsc-search.png           local staging (gitignored)
 *   registration/rjsc-search.4a5afeaff848.png    R2 object key, content-addressed
 *   /media/registration/rjsc-search.png          what content writes, and the registry key
 *
 * The object key carries a hash of the bytes so it can be cached forever and
 * still be replaceable: re-uploading a corrected screenshot mints a new key,
 * and every reader sees it at once. Without that, a replaced image would serve
 * stale for as long as its TTL, and the only alternative — a short TTL — would
 * make every repeat visit re-download the image, which is the opposite of what
 * a reader on an expensive, slow connection needs.
 */
import { execFileSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const stagingDir = path.join(root, 'media')
export const registryFile = path.join(root, 'app', 'generated', 'media.json')

export const BUCKET = process.env.DESHI_R2_BUCKET || 'deshistartup-media'

/** Safe because the key changes whenever the bytes do. */
export const CACHE_CONTROL = 'public, max-age=31536000, immutable'

export const CONTENT_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
}

// --- header parsers -------------------------------------------------------
//
// Hand-written rather than pulled from a dependency: reading four image headers
// is a hundred lines, and it keeps a native module (sharp) out of every
// contributor's install and out of Workers Builds.

function pngSize(buf) {
  if (buf.length < 24) return null
  if (buf.readUInt32BE(0) !== 0x89504e47) return null
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
}

function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null
  let i = 2
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) {
      i++
      continue
    }
    const marker = buf[i + 1]
    if (marker === 0xff || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      i += 2
      continue
    }
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    if (isSof) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) }
    const length = buf.readUInt16BE(i + 2)
    if (length < 2) return null
    i += 2 + length
  }
  return null
}

function webpSize(buf) {
  if (buf.length < 30) return null
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null
  const chunk = buf.toString('ascii', 12, 16)
  if (chunk === 'VP8X') return { w: buf.readUIntLE(24, 3) + 1, h: buf.readUIntLE(27, 3) + 1 }
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21)
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 }
  }
  if (chunk === 'VP8 ') {
    if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) return null
    return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff }
  }
  return null
}

function gifSize(buf) {
  if (buf.length < 10 || buf.toString('ascii', 0, 4) !== 'GIF8') return null
  return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) }
}

function svgSize(buf) {
  const head = buf.toString('utf8', 0, Math.min(buf.length, 4096))
  const attr = (name) => {
    const match = head.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, 'i'))
    if (!match) return null
    const value = parseFloat(match[1])
    return Number.isFinite(value) ? value : null
  }
  const w = attr('width')
  const h = attr('height')
  if (w && h) return { w: Math.round(w), h: Math.round(h) }
  const viewBox = head.match(/\bviewBox\s*=\s*["']([^"']+)["']/i)
  if (viewBox) {
    const parts = viewBox[1].trim().split(/[\s,]+/).map(Number)
    if (parts.length === 4 && parts.every(Number.isFinite)) {
      return { w: Math.round(parts[2]), h: Math.round(parts[3]) }
    }
  }
  return null
}

/** Intrinsic dimensions straight from the file header, or null. */
export function imageSize(buf, ext) {
  switch (ext) {
    case '.png':
      return pngSize(buf)
    case '.jpg':
    case '.jpeg':
      return jpegSize(buf)
    case '.webp':
      return webpSize(buf)
    case '.gif':
      return gifSize(buf)
    case '.svg':
      return svgSize(buf)
    default:
      return null
  }
}

// --- registry -------------------------------------------------------------

export function readRegistry() {
  if (!fs.existsSync(registryFile)) return {}
  return JSON.parse(fs.readFileSync(registryFile, 'utf8'))
}

export function writeRegistry(registry) {
  const sorted = {}
  for (const key of Object.keys(registry).sort()) sorted[key] = registry[key]
  fs.mkdirSync(path.dirname(registryFile), { recursive: true })
  fs.writeFileSync(registryFile, JSON.stringify(sorted, null, 2) + '\n')
  return sorted
}

/** media/a/b.png -> a/b.png */
export function stagedPath(file) {
  return path.relative(stagingDir, file).split(path.sep).join('/')
}

/** a/b.png -> /media/a/b.png */
export function registryKey(staged) {
  return `/media/${staged}`
}

/** a/b.png + hash -> a/b.<hash>.png, the content-addressed key in the bucket. */
export function objectKey(staged, sha) {
  const ext = path.extname(staged)
  return `${staged.slice(0, -ext.length)}.${sha}${ext}`
}

export function walkStaging(dir = stagingDir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkStaging(full))
    else out.push(full)
  }
  return out
}

export function contentHash(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 12)
}

// --- upload ---------------------------------------------------------------

/**
 * Puts one file in the bucket with wrangler, reusing the maintainer's existing
 * login rather than introducing an R2 access key the project would then have to
 * keep secret.
 */
export function putObject(file, key) {
  const ext = path.extname(file).toLowerCase()
  const contentType = CONTENT_TYPES[ext]
  if (!contentType) throw new Error(`${key}: ${ext || 'no extension'} is not a format this site serves`)
  execFileSync(
    'npx',
    [
      'wrangler',
      'r2',
      'object',
      'put',
      `${BUCKET}/${key}`,
      '--file',
      file,
      '--content-type',
      contentType,
      '--cache-control',
      CACHE_CONTROL,
      '--remote'
    ],
    { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }
  )
}

/**
 * Uploads the given staging files and records them in the registry. Files whose
 * contents already match the registry are skipped, so re-running is cheap.
 *
 * @returns {{ uploaded: string[], skipped: string[], failed: {key: string, error: string}[] }}
 */
export function uploadFiles(files, { force = false } = {}) {
  const registry = readRegistry()
  const uploaded = []
  const skipped = []
  const failed = []

  for (const file of files) {
    const staged = stagedPath(file)
    const entry = registryKey(staged)
    const buf = fs.readFileSync(file)
    const sha = contentHash(buf)
    if (!force && registry[entry]?.sha === sha && registry[entry]?.remote) {
      skipped.push(entry)
      continue
    }

    const ext = path.extname(file).toLowerCase()
    const size = imageSize(buf, ext)
    if (!size && ext !== '.svg') {
      failed.push({ key: entry, error: 'could not read width and height from the file header' })
      continue
    }

    const key = objectKey(staged, sha)
    try {
      putObject(file, key)
    } catch (err) {
      const detail = (err.stderr?.toString() || err.message || '').trim().split('\n').slice(-6).join('\n')
      failed.push({ key: entry, error: detail })
      continue
    }

    registry[entry] = {
      key,
      ...(size ? { w: size.w, h: size.h } : {}),
      bytes: buf.length,
      sha,
      remote: true
    }
    uploaded.push(entry)
  }

  writeRegistry(registry)
  return { uploaded, skipped, failed }
}
