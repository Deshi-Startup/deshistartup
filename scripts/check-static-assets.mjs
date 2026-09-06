#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { load } from 'cheerio'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assetsDir = path.join(root, 'out')
const freePlanLimit = 20_000
const projectLimit = 18_000
const warningAt = 15_000
const perFileLimit = 25 * 1024 * 1024

if (!fs.existsSync(assetsDir)) {
  console.error('static-assets: out is missing; run npm run build:worker')
  process.exit(1)
}

const files = []
const pending = [assetsDir]
let directoryEntries = 0
while (pending.length) {
  const directory = pending.pop()
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      directoryEntries += 1
      pending.push(absolute)
    }
    else if (entry.isFile()) files.push(absolute)
  }
}

const oversized = files
  .map((file) => ({ file, bytes: fs.statSync(file).size }))
  .filter(({ bytes }) => bytes > perFileLimit)
const htmlFiles = files.filter((file) => file.endsWith('.html')).length
// Wrangler's scanner reports directory route entries as well as physical
// files. Budget against that conservative upload count so the check matches
// the deployment tool instead of under-counting clean URLs.
const uploadEntries = files.length + directoryEntries
const remaining = freePlanLimit - uploadEntries

console.log(
  `static-assets: ${uploadEntries} upload entries (${files.length} files, ${htmlFiles} HTML); ${Math.max(0, remaining)} entries of Cloudflare Free headroom`
)

if (oversized.length) {
  for (const { file, bytes } of oversized) {
    console.error(
      `static-assets: ${path.relative(root, file)} is ${(bytes / 1024 / 1024).toFixed(2)} MiB; maximum is 25 MiB`
    )
  }
  process.exit(1)
}

if (uploadEntries > freePlanLimit) {
  console.error(
    `static-assets: exceeds Cloudflare Free's ${freePlanLimit.toLocaleString()}-file limit`
  )
  process.exit(1)
}

if (uploadEntries > projectLimit) {
  console.error(
    `static-assets: exceeds the project's ${projectLimit.toLocaleString()}-file growth budget`
  )
  process.exit(1)
}

if (uploadEntries >= warningAt) {
  console.warn(
    `static-assets: warning threshold reached; investigate chunk and page growth before ${projectLimit.toLocaleString()} files`
  )
}

// Keep a normal guide small as features are added. Measure the actual linked
// assets, excluding Next's nomodule fallback (modern browsers do not load it).
const guide = load(fs.readFileSync(path.join(assetsDir, 'en/metrics/unit-economics.html'), 'utf8'))
const styles = guide('link[rel="stylesheet"]').map((_, el) => guide(el).attr('href')).get()
const scripts = guide('script[src]:not([nomodule])').map((_, el) => guide(el).attr('src')).get()
const readAssets = (urls) => [...new Set(urls)]
  .filter((url) => url.includes('/_next/static/'))
  .map((url) => fs.readFileSync(path.join(assetsDir, url.slice(url.indexOf('/_next/static/')))))
const css = readAssets(styles)
const js = readAssets(scripts)
const rawBytes = (buffers) => buffers.reduce((sum, buffer) => sum + buffer.length, 0)
const gzipBytes = (buffers) => buffers.reduce((sum, buffer) => sum + gzipSync(buffer).length, 0)
const cssBytes = rawBytes(css)
const cssGzip = gzipBytes(css)
const jsGzip = gzipBytes(js)

console.log(`page-weight: guide CSS ${(cssBytes / 1024).toFixed(2)} KiB (${(cssGzip / 1024).toFixed(2)} KiB gzip); JS ${(jsGzip / 1024).toFixed(2)} KiB gzip`)
if (!css.length || !js.length) {
  console.error('page-weight: expected guide styles and scripts are missing')
  process.exit(1)
}
if (cssBytes > 48 * 1024 || cssGzip > 12 * 1024 || jsGzip > 140 * 1024) {
  console.error('page-weight: guide exceeds 48 KiB CSS, 12 KiB CSS gzip, or 140 KiB JS gzip; inspect shared imports')
  process.exit(1)
}
if (css.some((buffer) => /\.(?:edit-live|modal-card|media-review)\b/.test(buffer.toString()))) {
  console.error('page-weight: editor, dialog, or private review styles leaked into the guide')
  process.exit(1)
}
