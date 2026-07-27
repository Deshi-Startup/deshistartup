#!/usr/bin/env node
/**
 * Keeps embedded media honest, small, and out of git. Runs in prebuild, next to
 * route-lint.
 *
 * The registry (app/generated/media.json) is the source of truth for what has
 * been uploaded; this checks the content tree against it.
 *
 * Errors (✖, exit 1):
 *   - a page references a /media/... file that was never uploaded
 *   - <Figure> without alt text
 *   - <YouTube> without a valid 11-character video id, or without a title
 *   - hotlinked or raw media that bypasses the controlled components
 *   - an image committed into public/media (bytes belong in the bucket)
 *   - a file over the hard weight cap, or in a format we do not serve
 *
 * Warnings (⚠, reported only):
 *   - markdown image with empty alt text
 *   - a file heavier or wider than an article needs
 *   - an uploaded file no page references (paying storage for nothing)
 *   - a <YouTube> embed with no poster in the bucket
 */
import fs from 'node:fs'
import path from 'node:path'
import {
  CONTENT_TYPES,
  MAX_FILE_BYTES,
  MAX_IMAGE_HEIGHT,
  MAX_IMAGE_PIXELS,
  MAX_IMAGE_WIDTH,
  readRegistry,
  readRetired,
  root,
  STORAGE_BUDGET_BYTES,
  stagingDir,
  objectKeyMatchesLogicalPath,
  validLogicalPath,
  WARN_FILE_BYTES,
  WARN_IMAGE_WIDTH
} from './lib/media-lib.mjs'

const contentRoot = path.join(root, 'app', '(contents)')
const publicMedia = path.join(root, 'public', 'media')

const ALLOWED = new Set(Object.keys(CONTENT_TYPES))
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

const registry = readRegistry()
const retired = readRetired()
const errors = []
const warnings = []
const referenced = new Set()

function walk(dir, match) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full, match))
    else if (!match || match(entry.name)) out.push(full)
  }
  return out
}

function attributes(raw) {
  const out = {}
  for (const match of raw.matchAll(/([A-Za-z][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g)) {
    out[match[1]] = match[2] ?? match[3] ?? match[4] ?? ''
  }
  for (const match of raw.matchAll(/(?:^|\s)([A-Za-z][\w-]*)(?=\s|$)/g)) {
    if (!(match[1] in out)) out[match[1]] = true
  }
  return out
}

function checkSource(src, where, page) {
  if (src.startsWith('/__pending-media/')) {
    errors.push(
      `${page}: ${where} is still waiting for explicit image review (${src}). ` +
        'Approve or reject it from the private review link in the pull request before merging.'
    )
    return
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith('//')) {
    errors.push(
      `${page}: ${where} loads an image from another domain (${src}). ` +
        'Hotlinked media bypasses review, privacy, and cost controls. Upload an approved copy to /media/.'
    )
    return
  }
  if (!src.startsWith('/media/')) {
    errors.push(`${page}: ${where} points at "${src}". Embedded media belongs under /media/.`)
    return
  }
  referenced.add(src)
  if (!registry[src]) {
    errors.push(
      `${page}: ${where} references ${src}, which has not been uploaded. ` +
        'Stage it under media/ and run `npm run media:upload`.'
    )
  }
}

for (const file of walk(contentRoot, (name) => name.endsWith('.mdx'))) {
  const page = path.relative(root, file)
  const source = fs.readFileSync(file, 'utf8')

  for (const match of source.matchAll(
    /<(img|picture|source|iframe|video|audio|object|embed|Image|svg|foreignObject|canvas|script)\b/gi
  )) {
    errors.push(
      `${page}: raw <${match[1]}> media is not allowed. Use <Figure> or <YouTube> so review and delivery controls apply.`
    )
  }
  if (/\b(?:mediaUrl|mediaSrcSet)\s*\(|cdn-cgi\/image|next\/image/.test(source)) {
    errors.push(
      `${page}: content cannot construct media or transformation URLs directly. Use <Figure> or <YouTube>.`
    )
  }

  for (const match of source.matchAll(/!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g)) {
    const [, alt, src] = match
    checkSource(src, 'a markdown image', page)
    if (!alt.trim()) {
      warnings.push(
        `${page}: the image ${src} has no alt text. Describe what it shows, for readers who cannot see it.`
      )
    }
  }

  for (const match of source.matchAll(/<Figure\b([\s\S]*?)\/>/g)) {
    const props = attributes(match[1])
    if (!props.src) {
      errors.push(`${page}: a <Figure> has no src.`)
      continue
    }
    checkSource(props.src, '<Figure>', page)
    if (props.alt === undefined) {
      errors.push(`${page}: <Figure src="${props.src}"> has no alt text.`)
    } else if (typeof props.alt === 'string' && !props.alt.trim()) {
      warnings.push(`${page}: <Figure src="${props.src}"> has empty alt text.`)
    }
  }

  for (const match of source.matchAll(/<YouTube\b([\s\S]*?)\/>/g)) {
    const props = attributes(match[1])
    if (typeof props.id !== 'string' || !VIDEO_ID.test(props.id)) {
      errors.push(
        `${page}: <YouTube id="${props.id ?? ''}"> is not an 11-character video id. ` +
          'Use the id, not the full URL.'
      )
      continue
    }
    if (typeof props.title !== 'string' || !props.title.trim()) {
      errors.push(`${page}: <YouTube id="${props.id}"> has no title.`)
    }
    const poster = ['.jpg', '.webp', '.png']
      .map((ext) => `/media/youtube/${props.id}${ext}`)
      .find((candidate) => registry[candidate])
    if (poster) referenced.add(poster)
    else {
      warnings.push(
        `${page}: <YouTube id="${props.id}"> has no poster in the bucket. Run \`npm run media:posters\`.`
      )
    }
  }
}

// The arrangement only works if the bytes stay out of git. A file here would be
// committed and permanent, which is exactly what the bucket exists to avoid.
// A fork that has opted out of the bucket (DESHI_MEDIA_BASE_URL=) is serving
// from public/ on purpose, so this rule is not theirs to obey.
const selfHosting = process.env.DESHI_MEDIA_BASE_URL === ''
if (!selfHosting) {
  for (const file of walk(publicMedia)) {
    errors.push(
      `${path.relative(root, file)} is committed to the repository. ` +
        `Move it to media/${path.relative(publicMedia, file)} and run \`npm run media:upload\`.`
    )
  }
}

// Everything in the bucket, weighed and measured.
for (const [key, entry] of Object.entries(registry)) {
  if (!validLogicalPath(key)) {
    errors.push(`${key}: registry path is not a safe logical /media/ path.`)
    continue
  }
  const ext = path.extname(key).toLowerCase()
  if (!ALLOWED.has(ext)) {
    errors.push(`${key}: ${ext || 'no extension'} is not a format this site serves.`)
    continue
  }
  const bytes = entry.bytes || 0
  if (
    !entry.remote ||
    !entry.key ||
    !/^[a-f0-9]{12}$/.test(entry.sha || '') ||
    !Number.isSafeInteger(entry.bytes) ||
    entry.bytes <= 0
  ) {
    errors.push(`${key}: registry entry is missing valid remote, key, or SHA metadata.`)
  } else {
    if (!objectKeyMatchesLogicalPath(key, entry.key) || !entry.key.includes(`.${entry.sha}${ext}`)) {
      errors.push(`${key}: object key does not match the logical path and recorded SHA.`)
    }
  }
  if (bytes > MAX_FILE_BYTES) {
    errors.push(
      `${key} is ${(bytes / 1024).toFixed(0)} KB, over the ${MAX_FILE_BYTES / 1024} KB cap. ` +
        'Export it narrower or save it as WebP.'
    )
  } else if (bytes > WARN_FILE_BYTES) {
    warnings.push(
      `${key} is ${(bytes / 1024).toFixed(0)} KB. Under ${WARN_FILE_BYTES / 1024} KB is kinder.`
    )
  }
  if (!entry.w || !entry.h) {
    errors.push(`${key}: no width and height recorded, so the page will reflow around it.`)
  } else {
    if (entry.w > MAX_IMAGE_WIDTH) {
      errors.push(`${key} is ${entry.w}px wide, over the ${MAX_IMAGE_WIDTH}px limit.`)
    } else if (entry.w > WARN_IMAGE_WIDTH) {
      warnings.push(`${key} is ${entry.w}px wide; ${WARN_IMAGE_WIDTH}px is the widest an article uses.`)
    }
    if (entry.h > MAX_IMAGE_HEIGHT) {
      errors.push(`${key} is ${entry.h}px tall, over the ${MAX_IMAGE_HEIGHT}px limit.`)
    }
    if (entry.w * entry.h > MAX_IMAGE_PIXELS) {
      errors.push(
        `${key} has ${(entry.w * entry.h).toLocaleString()} pixels, over the ${MAX_IMAGE_PIXELS.toLocaleString()}-pixel limit.`
      )
    }
  }
  if (!referenced.has(key)) {
    warnings.push(`${key} is in the bucket but no page uses it.`)
  }
}

const activeKeys = new Set(Object.values(registry).map((entry) => entry.key).filter(Boolean))
for (const entry of retired) {
  if (
    !entry.key ||
    !entry.logicalPath ||
    !entry.retiredAt ||
    !['superseded', 'unreferenced'].includes(entry.reason) ||
    !objectKeyMatchesLogicalPath(entry.logicalPath, entry.key) ||
    !Number.isFinite(Date.parse(entry.retiredAt)) ||
    !Number.isSafeInteger(entry.bytes) ||
    entry.bytes < 0
  ) {
    errors.push('app/generated/media-retired.json contains an incomplete retirement entry.')
  }
  if (activeKeys.has(entry.key)) {
    errors.push(`${entry.key}: the same object cannot be both active and retired.`)
  }
}

const trackedBytes =
  Object.values(registry).reduce((sum, entry) => sum + (entry.bytes || 0), 0) +
  retired.reduce((sum, entry) => sum + (entry.bytes || 0), 0)
if (trackedBytes > STORAGE_BUDGET_BYTES) {
  errors.push(
    `active + retired media uses ${(trackedBytes / 1024 / 1024).toFixed(1)} MB, over the ` +
      `${STORAGE_BUDGET_BYTES / 1024 / 1024} MB project ceiling.`
  )
}

// Staged files that were never uploaded are the easiest mistake to make: the
// image is right there on disk and the page looks fine to whoever staged it.
const stagedOnly = walk(stagingDir)
  .map((file) => `/media/${path.relative(stagingDir, file).split(path.sep).join('/')}`)
  .filter((key) => !registry[key])
if (stagedOnly.length) {
  warnings.push(
    `staged but not uploaded: ${stagedOnly.join(', ')} — run \`npm run media:upload\`.`
  )
}

const count = Object.keys(registry).length
if (errors.length) {
  console.error(`\n✖ ${errors.length} media error${errors.length === 1 ? '' : 's'}:`)
  for (const message of errors) console.error(`  ✖ ${message}`)
}
if (warnings.length) {
  console.warn(`\n⚠ ${warnings.length} media warning${warnings.length === 1 ? '' : 's'}:`)
  for (const message of warnings) console.warn(`  ⚠ ${message}`)
}
if (!errors.length) {
  console.log(
    `media lint: ${count} active, ${retired.length} retired, ${referenced.size} referenced, ` +
      `${(trackedBytes / 1024 / 1024).toFixed(1)} MB tracked` +
      (warnings.length ? `, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}` : ', clean')
  )
}

process.exit(errors.length ? 1 : 0)
