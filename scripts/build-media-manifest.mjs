#!/usr/bin/env node
/**
 * Builds the media manifest from the files in public/media.
 *
 * Every image the site renders needs its intrinsic size in the HTML, or the
 * article reflows as each image arrives — the one layout jump a reader on a
 * slow Bangladeshi connection sees most. Rather than ask authors to measure
 * their screenshots, we read the width and height straight out of the file
 * header at build time.
 *
 * The parsers below are deliberately hand-written instead of pulled from a
 * dependency: reading four image headers is ~120 lines, and the article
 * pipeline is not worth a native module (sharp) that has to install on every
 * contributor's machine and in Workers Builds.
 *
 * Output: app/generated/media.json  – "/media/path.webp": { w, h, bytes }
 *
 * Entries flagged "remote": true are preserved even when the file is absent
 * from disk. That is the hook for moving the library to R2 later: the object
 * keeps its /media/... key, the manifest keeps its dimensions, and only
 * NEXT_PUBLIC_MEDIA_BASE_URL changes.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const mediaRoot = path.join(root, 'public', 'media')
const outFile = path.join(root, 'app', 'generated', 'media.json')

const READABLE = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'])

// --- header parsers -------------------------------------------------------

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
    // Standalone markers carry no length payload.
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
  if (chunk === 'VP8X') {
    return { w: buf.readUIntLE(24, 3) + 1, h: buf.readUIntLE(27, 3) + 1 }
  }
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21)
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 }
  }
  if (chunk === 'VP8 ') {
    // Key-frame header: 3-byte sync code, then 14-bit width and height.
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

function readSize(file, ext) {
  const buf = fs.readFileSync(file)
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

// --- walk -----------------------------------------------------------------

function walk(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

const previous = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : {}
const manifest = {}
const unreadable = []

for (const file of walk(mediaRoot)) {
  const ext = path.extname(file).toLowerCase()
  const key = '/media/' + path.relative(mediaRoot, file).split(path.sep).join('/')
  const bytes = fs.statSync(file).size
  if (!READABLE.has(ext)) {
    // Unknown formats still belong in the manifest so the linter can see them.
    manifest[key] = { bytes }
    continue
  }
  let size = null
  try {
    size = readSize(file, ext)
  } catch {
    size = null
  }
  if (size && size.w && size.h) manifest[key] = { w: size.w, h: size.h, bytes }
  else {
    manifest[key] = { bytes }
    unreadable.push(key)
  }
}

// Keep entries that have moved off disk to a bucket.
let carried = 0
for (const [key, entry] of Object.entries(previous)) {
  if (!manifest[key] && entry?.remote) {
    manifest[key] = entry
    carried++
  }
}

const sorted = {}
for (const key of Object.keys(manifest).sort()) sorted[key] = manifest[key]

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, JSON.stringify(sorted, null, 2) + '\n')

const count = Object.keys(sorted).length
const totalBytes = Object.values(sorted).reduce((sum, entry) => sum + (entry.bytes || 0), 0)
console.log(
  `media manifest: ${count} file${count === 1 ? '' : 's'}` +
    `, ${(totalBytes / 1024).toFixed(0)} KB` +
    (carried ? `, ${carried} remote` : '')
)
if (unreadable.length) {
  console.log(`  ⚠ no dimensions read from: ${unreadable.join(', ')}`)
}
