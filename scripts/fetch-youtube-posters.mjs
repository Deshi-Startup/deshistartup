#!/usr/bin/env node
/**
 * Fetches a poster image for every <YouTube id="..."> in the content tree and
 * uploads it to the media bucket.
 *
 * The point of hosting the poster ourselves is that a reader who never plays
 * the video never contacts Google — no request, no cookie, no third-party
 * handshake on a connection that cannot spare one. Fetching it at page-build
 * time would give that away, so this runs by hand:
 *
 *   npm run media:posters              # only what is missing
 *   npm run media:posters -- --force   # re-fetch and re-upload everything
 *
 * The file stays a JPEG. Cloudflare's format=auto serves it as WebP or AVIF at
 * delivery time, so there is nothing to gain from re-encoding it here.
 */
import fs from 'node:fs'
import path from 'node:path'
import {
  readRegistry,
  root,
  stagingDir,
  uploadFiles,
  validateImageBuffer
} from './lib/media-lib.mjs'

const contentRoot = path.join(root, 'app', '(contents)')
const posterDir = path.join(stagingDir, 'youtube')
const force = process.argv.includes('--force')

// maxres is the only 16:9 size guaranteed to look right at article width; the
// rest are fallbacks for videos that never got one.
const CANDIDATES = ['maxresdefault', 'hq720', 'sddefault', 'hqdefault']
const VIDEO_REF = /<YouTube\b[^>]*?\bid=["']([A-Za-z0-9_-]{11})["']/g

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

const videos = new Map()
for (const file of walk(contentRoot)) {
  const source = fs.readFileSync(file, 'utf8')
  for (const match of source.matchAll(VIDEO_REF)) {
    const id = match[1]
    if (!videos.has(id)) videos.set(id, [])
    videos.get(id).push(path.relative(root, file))
  }
}

if (!videos.size) {
  console.log('youtube posters: no <YouTube> embeds in the content tree')
  process.exit(0)
}

fs.mkdirSync(posterDir, { recursive: true })
const registry = readRegistry()

const staged = []
let present = 0
const missing = []

for (const [id, pages] of videos) {
  const file = path.join(posterDir, `${id}.jpg`)
  if (!force && registry[`/media/youtube/${id}.jpg`]?.remote) {
    present++
    continue
  }

  let saved = false
  for (const name of CANDIDATES) {
    let res
    try {
      res = await fetch(`https://i.ytimg.com/vi/${id}/${name}.jpg`)
    } catch {
      continue
    }
    if (!res.ok) continue
    const buf = Buffer.from(await res.arrayBuffer())
    // A missing size answers 200 with a 120x90 grey placeholder. Anything that
    // small is that placeholder.
    if (buf.length < 4096) continue
    const validation = validateImageBuffer(buf, `youtube/${id}.jpg`)
    // maxres thumbnails can exceed the site's hard weight/dimension limits.
    // Try the next, smaller YouTube size rather than uploading first and only
    // discovering the problem during prebuild.
    if (validation.errors.length) continue
    fs.writeFileSync(file, buf)
    console.log(`  ✓ ${id}.jpg  ${name}  ${(buf.length / 1024).toFixed(0)} KB`)
    staged.push(file)
    saved = true
    break
  }
  if (!saved) missing.push({ id, pages })
}

if (staged.length) {
  const { uploaded, failed } = uploadFiles(staged, { force })
  for (const key of uploaded) console.log(`  ↑ ${key}`)
  if (failed.length) {
    console.error('\n✖ upload failed:')
    for (const { key, error } of failed) console.error(`  ${key}\n    ${error}`)
    process.exit(1)
  }
}

console.log(
  `youtube posters: ${staged.length} fetched and uploaded, ${present} already in the bucket, ` +
    `${videos.size} embed${videos.size === 1 ? '' : 's'} total`
)

if (missing.length) {
  console.log('\n⚠ no poster available for:')
  for (const { id, pages } of missing) console.log(`  ${id}  (${pages.join(', ')})`)
  console.log('  The player still works; it just renders without a poster image.')
}
