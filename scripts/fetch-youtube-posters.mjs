#!/usr/bin/env node
/**
 * Downloads a poster image for every <YouTube id="..."> in the content tree
 * and commits it to public/media/youtube/.
 *
 * The point of hosting the poster ourselves is that a reader who never plays
 * the video never contacts Google — no request, no cookie, no third-party
 * handshake on a connection that cannot spare one. Fetching the thumbnail at
 * build time would give that away, so this runs by hand and the result is
 * reviewed and committed like any other asset:
 *
 *   npm run media:posters          # only what is missing
 *   npm run media:posters -- --force   # re-fetch everything
 *
 * The file stays a JPEG. Cloudflare's format=auto serves it as WebP or AVIF at
 * delivery time, so there is nothing to gain from re-encoding it here.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(root, 'app', '(contents)')
const posterDir = path.join(root, 'public', 'media', 'youtube')
const force = process.argv.includes('--force')

// maxres is the only 16:9 size guaranteed to look right at article width; the
// others are fallbacks for videos that never got one.
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

function existingPoster(id) {
  return ['.jpg', '.webp', '.png']
    .map((ext) => path.join(posterDir, `${id}${ext}`))
    .find((file) => fs.existsSync(file))
}

let fetched = 0
let skipped = 0
const failed = []

for (const [id, pages] of videos) {
  const existing = existingPoster(id)
  if (existing && !force) {
    skipped++
    continue
  }

  let saved = false
  for (const name of CANDIDATES) {
    const url = `https://i.ytimg.com/vi/${id}/${name}.jpg`
    let res
    try {
      res = await fetch(url)
    } catch (err) {
      continue
    }
    if (!res.ok) continue
    const buf = Buffer.from(await res.arrayBuffer())
    // YouTube answers a missing size with a 120x90 grey placeholder, served
    // as a 200. Anything that small is that placeholder.
    if (buf.length < 4096) continue
    fs.writeFileSync(path.join(posterDir, `${id}.jpg`), buf)
    console.log(`  ✓ ${id}.jpg  ${name}  ${(buf.length / 1024).toFixed(0)} KB`)
    saved = true
    fetched++
    break
  }
  if (!saved) failed.push({ id, pages })
}

console.log(
  `youtube posters: ${fetched} fetched, ${skipped} already present, ${videos.size} embed${
    videos.size === 1 ? '' : 's'
  } total`
)

if (failed.length) {
  console.log('\n⚠ no poster available for:')
  for (const { id, pages } of failed) {
    console.log(`  ${id}  (${pages.join(', ')})`)
  }
  console.log('  The player still works; it just renders without a poster image.')
}
