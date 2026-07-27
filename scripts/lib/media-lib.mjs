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
export const retiredFile = path.join(root, 'app', 'generated', 'media-retired.json')

export const BUCKET = process.env.DESHI_R2_BUCKET || 'deshistartup-media'

/** Safe because the key changes whenever the bytes do. */
export const CACHE_CONTROL = 'public, max-age=31536000, immutable'

// These are storage controls, not editorial suggestions. They are shared by
// upload, lint, poster fetching, and tests so a file cannot pass one gate and
// fail only after it has already consumed R2 operations and storage.
export const MAX_FILE_BYTES = 300 * 1024
export const WARN_FILE_BYTES = 150 * 1024
export const MAX_IMAGE_WIDTH = 3000
export const WARN_IMAGE_WIDTH = 1600
export const MAX_IMAGE_HEIGHT = 6000
export const MAX_IMAGE_PIXELS = 12_000_000
export const MAX_BATCH_FILES = 25
export const MAX_BATCH_BYTES = 5 * 1024 * 1024
// Five percent of R2's current 10 GB-month Standard storage free allowance.
// Raising this is a deliberate code review decision, never an environment flag.
export const STORAGE_BUDGET_BYTES = 500 * 1024 * 1024
export const RETIREMENT_GRACE_DAYS = 30

export const CONTENT_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
}

// --- header parsers -------------------------------------------------------
//
// Hand-written rather than pulled from a dependency: reading three image headers
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

export function readRetired() {
  if (!fs.existsSync(retiredFile)) return []
  const value = JSON.parse(fs.readFileSync(retiredFile, 'utf8'))
  if (!Array.isArray(value)) throw new Error(`${path.relative(root, retiredFile)} must contain an array`)
  return value
}

export function writeRetired(retired) {
  const sorted = [...retired].sort(
    (a, b) =>
      String(a.retiredAt).localeCompare(String(b.retiredAt)) ||
      String(a.key).localeCompare(String(b.key))
  )
  fs.mkdirSync(path.dirname(retiredFile), { recursive: true })
  fs.writeFileSync(retiredFile, JSON.stringify(sorted, null, 2) + '\n')
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

const SAFE_STAGED_PATH =
  /^(?:[A-Za-z0-9][A-Za-z0-9_-]*\/)*[A-Za-z0-9][A-Za-z0-9_-]*\.(?:png|jpe?g|webp)$/

export function validLogicalPath(logicalPath) {
  return logicalPath.startsWith('/media/') && SAFE_STAGED_PATH.test(logicalPath.slice('/media/'.length))
}

export function objectKeyMatchesLogicalPath(logicalPath, key) {
  if (!validLogicalPath(logicalPath) || typeof key !== 'string') return false
  const staged = logicalPath.slice('/media/'.length)
  const ext = path.extname(staged)
  const base = staged.slice(0, -ext.length)
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${escape(base)}\\.[a-f0-9]{12}${escape(ext)}$`).test(key)
}

/**
 * Validate bytes before any network request. Relying on an extension alone is
 * unsafe, and discovering an oversize file in prebuild is too late: it is
 * already occupying R2 by then.
 */
export function validateImageBuffer(buf, staged) {
  const errors = []
  const ext = path.extname(staged).toLowerCase()

  if (!SAFE_STAGED_PATH.test(staged)) {
    errors.push(
      'path must use ASCII letters, numbers, hyphens, underscores, and folders, with a PNG, JPEG, or WebP extension'
    )
  }
  if (!CONTENT_TYPES[ext]) {
    errors.push(`${ext || 'no extension'} is not allowed; use PNG, JPEG, or WebP`)
  }
  if (buf.length > MAX_FILE_BYTES) {
    errors.push(
      `${Math.ceil(buf.length / 1024)} KB exceeds the ${MAX_FILE_BYTES / 1024} KB per-file limit`
    )
  }

  const size = CONTENT_TYPES[ext] ? imageSize(buf, ext) : null
  if (!size) {
    errors.push('the file header does not match its extension or has no readable dimensions')
  } else {
    if (size.w > MAX_IMAGE_WIDTH) {
      errors.push(`${size.w}px width exceeds the ${MAX_IMAGE_WIDTH}px limit`)
    }
    if (size.h > MAX_IMAGE_HEIGHT) {
      errors.push(`${size.h}px height exceeds the ${MAX_IMAGE_HEIGHT}px limit`)
    }
    if (size.w * size.h > MAX_IMAGE_PIXELS) {
      errors.push(
        `${size.w.toLocaleString()}×${size.h.toLocaleString()} exceeds the ${MAX_IMAGE_PIXELS.toLocaleString()}-pixel limit`
      )
    }
  }

  return { errors, ext, size, bytes: buf.length }
}

/**
 * Inspect the complete batch atomically. If one file is unsafe or the batch
 * crosses a budget, nothing is uploaded.
 */
export function preflightFiles(files) {
  const errors = []
  const inspected = []
  const seen = new Set()

  for (const file of files) {
    let stat
    try {
      stat = fs.lstatSync(file)
    } catch (error) {
      errors.push({ key: path.relative(root, file), error: error.message })
      continue
    }
    if (!stat.isFile() || stat.isSymbolicLink()) {
      errors.push({
        key: path.relative(root, file),
        error: 'only regular files are accepted; directories and symbolic links are rejected'
      })
      continue
    }

    const real = fs.realpathSync(file)
    if (!real.startsWith(stagingDir + path.sep)) {
      errors.push({
        key: path.relative(root, file),
        error: 'the resolved file is outside media/'
      })
      continue
    }

    const staged = stagedPath(file)
    const entry = registryKey(staged)
    if (seen.has(entry)) {
      errors.push({ key: entry, error: 'the same logical media path appears more than once' })
      continue
    }
    seen.add(entry)

    const buf = fs.readFileSync(file)
    const validation = validateImageBuffer(buf, staged)
    if (validation.errors.length) {
      errors.push({ key: entry, error: validation.errors.join('; ') })
      continue
    }
    inspected.push({
      file,
      staged,
      entry,
      buf,
      sha: contentHash(buf),
      size: validation.size,
      bytes: validation.bytes,
      ext: validation.ext
    })
  }

  if (files.length > MAX_BATCH_FILES) {
    errors.push({
      key: 'batch',
      error: `${files.length} files exceeds the ${MAX_BATCH_FILES}-file upload limit`
    })
  }
  const batchBytes = inspected.reduce((sum, item) => sum + item.bytes, 0)
  if (batchBytes > MAX_BATCH_BYTES) {
    errors.push({
      key: 'batch',
      error: `${(batchBytes / 1024 / 1024).toFixed(1)} MB exceeds the ${MAX_BATCH_BYTES / 1024 / 1024} MB upload limit`
    })
  }

  const registry = readRegistry()
  const retired = readRetired()
  const activeBytes = Object.values(registry).reduce((sum, entry) => sum + (entry.bytes || 0), 0)
  const retiredBytes = retired.reduce((sum, entry) => sum + (entry.bytes || 0), 0)
  let projectedBytes = activeBytes + retiredBytes
  for (const item of inspected) {
    const previous = registry[item.entry]
    // Replacing a logical path keeps the previous immutable object during the
    // grace period, so only a same-key force upload avoids adding stored bytes.
    if (previous?.key === objectKey(item.staged, item.sha)) {
      projectedBytes += item.bytes - (previous.bytes || 0)
    } else {
      projectedBytes += item.bytes
    }
  }
  if (projectedBytes > STORAGE_BUDGET_BYTES) {
    errors.push({
      key: 'storage budget',
      error:
        `${(projectedBytes / 1024 / 1024).toFixed(1)} MB projected active + retired storage exceeds ` +
        `the ${STORAGE_BUDGET_BYTES / 1024 / 1024} MB project ceiling; prune retired media first`
    })
  }

  return { errors, inspected, registry, retired, batchBytes, projectedBytes }
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
  const preflight = preflightFiles(files)
  if (preflight.errors.length) {
    return { uploaded: [], skipped: [], failed: preflight.errors }
  }

  const { inspected, registry, retired } = preflight
  const uploaded = []
  const skipped = []
  const failed = []

  for (const item of inspected) {
    const { file, staged, entry, buf, sha, size } = item
    if (!force && registry[entry]?.sha === sha && registry[entry]?.remote) {
      skipped.push(entry)
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

    const previous = registry[entry]
    if (previous?.key && previous.key !== key) {
      const alreadyRetired = retired.some((candidate) => candidate.key === previous.key)
      if (!alreadyRetired) {
        retired.push({
          logicalPath: entry,
          key: previous.key,
          bytes: previous.bytes || 0,
          retiredAt: new Date().toISOString(),
          reason: 'superseded',
          replacementKey: key
        })
      }
    }

    registry[entry] = {
      key,
      w: size.w,
      h: size.h,
      bytes: buf.length,
      sha,
      remote: true,
      uploadedAt: new Date().toISOString()
    }
    uploaded.push(entry)
  }

  // Write the safety ledger first. If the process is interrupted between the
  // two local writes, prune still refuses to delete any key that is active in
  // the registry.
  writeRetired(retired)
  writeRegistry(registry)
  return { uploaded, skipped, failed }
}

export function deleteObject(key) {
  execFileSync(
    'npx',
    ['wrangler', 'r2', 'object', 'delete', `${BUCKET}/${key}`, '--remote'],
    { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }
  )
}
