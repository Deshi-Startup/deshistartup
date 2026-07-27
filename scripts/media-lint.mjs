#!/usr/bin/env node
/**
 * Keeps embedded media honest and small. Runs in prebuild, next to route-lint.
 *
 * Errors (✖, exit 1):
 *   - a page references a /media/... file that does not exist
 *   - <Figure> without alt text, or a media file the manifest cannot size
 *   - <YouTube> without a valid 11-character video id
 *   - a file over the hard weight cap, or in a format we do not serve
 *
 * Warnings (⚠, reported only):
 *   - markdown image with empty alt text
 *   - a file heavier or wider than an article needs
 *   - a file in public/media that no page references
 *   - a <YouTube> embed with no locally hosted poster
 *   - an image hotlinked from another domain
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(root, 'app', '(contents)')
const manifestFile = path.join(root, 'app', 'generated', 'media.json')

const ERROR_BYTES = 300 * 1024
const WARN_BYTES = 150 * 1024
const ERROR_WIDTH = 3000
const WARN_WIDTH = 1600
const ALLOWED = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'])
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

const manifest = fs.existsSync(manifestFile)
  ? JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
  : {}

const errors = []
const warnings = []
const referenced = new Set()

function walk(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.name.endsWith('.mdx')) out.push(full)
  }
  return out
}

function attributes(raw) {
  const out = {}
  for (const match of raw.matchAll(/([A-Za-z][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g)) {
    out[match[1]] = match[2] ?? match[3] ?? match[4] ?? ''
  }
  // Boolean shorthand: `priority` with no value.
  for (const match of raw.matchAll(/(?:^|\s)([A-Za-z][\w-]*)(?=\s|$)/g)) {
    if (!(match[1] in out)) out[match[1]] = true
  }
  return out
}

function checkSource(src, where, page) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith('//')) {
    warnings.push(
      `${page}: ${where} loads an image from another domain (${src}). ` +
        'Hotlinked images break when the other site moves them.'
    )
    return
  }
  if (!src.startsWith('/media/')) {
    errors.push(`${page}: ${where} points at "${src}". Embedded media belongs under /media/.`)
    return
  }
  referenced.add(src)
  if (!manifest[src]) {
    errors.push(`${page}: ${where} references ${src}, which is not in public/media.`)
  }
}

for (const file of walk(contentRoot)) {
  const page = path.relative(root, file)
  const source = fs.readFileSync(file, 'utf8')

  // ![alt](/media/x.png "caption")
  for (const match of source.matchAll(/!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g)) {
    const [, alt, src] = match
    checkSource(src, 'a markdown image', page)
    if (!alt.trim()) {
      warnings.push(
        `${page}: the image ${src} has no alt text. Describe what it shows, for readers who cannot see it.`
      )
    }
  }

  // <Figure src="..." alt="..." />
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

  // <YouTube id="..." title="..." />
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
      .find((candidate) => manifest[candidate])
    if (poster) referenced.add(poster)
    else {
      warnings.push(
        `${page}: <YouTube id="${props.id}"> has no poster. Run \`npm run media:posters\`.`
      )
    }
  }
}

// Every file in the library, weighed and measured.
for (const [key, entry] of Object.entries(manifest)) {
  const ext = path.extname(key).toLowerCase()
  if (!ALLOWED.has(ext)) {
    errors.push(`${key}: ${ext || 'no extension'} is not a format this site serves.`)
    continue
  }
  const bytes = entry.bytes || 0
  if (bytes > ERROR_BYTES) {
    errors.push(
      `${key} is ${(bytes / 1024).toFixed(0)} KB, over the ${ERROR_BYTES / 1024} KB cap. ` +
        'Export it narrower or save it as WebP.'
    )
  } else if (bytes > WARN_BYTES) {
    warnings.push(`${key} is ${(bytes / 1024).toFixed(0)} KB. Under ${WARN_BYTES / 1024} KB is kinder.`)
  }
  if (ext !== '.svg') {
    if (!entry.w || !entry.h) {
      errors.push(`${key}: no width and height could be read, so the page will reflow around it.`)
    } else if (entry.w > ERROR_WIDTH) {
      errors.push(`${key} is ${entry.w}px wide. Nothing on this site needs more than ${WARN_WIDTH}px.`)
    } else if (entry.w > WARN_WIDTH) {
      warnings.push(`${key} is ${entry.w}px wide; ${WARN_WIDTH}px is the widest an article uses.`)
    }
  }
  if (!referenced.has(key) && !key.startsWith('/media/youtube/')) {
    warnings.push(`${key} is not used by any page.`)
  }
}

const count = Object.keys(manifest).length
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
    `media lint: ${count} file${count === 1 ? '' : 's'}, ${referenced.size} referenced` +
      (warnings.length ? `, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}` : ', clean')
  )
}

process.exit(errors.length ? 1 : 0)
