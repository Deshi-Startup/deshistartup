#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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
