#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { inspectCitations } from './citation-lint-lib.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(root, 'app', '(contents)')

const pageFiles = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) return pageFiles(target)
    return entry.name === 'page.mdx' ? [target] : []
  })

const localeKey = (file) => {
  const relative = path.relative(contentRoot, file).split(path.sep)
  if (relative[0] === '(bn)') return { locale: 'bn', slug: relative.slice(1).join('/') }
  if (relative[0] === 'en') return { locale: 'en', slug: relative.slice(1).join('/') }
  return null
}

const files = pageFiles(contentRoot)
const errors = []
const localized = new Map()
let referenceCount = 0

for (const file of files) {
  const relative = path.relative(root, file)
  const result = inspectCitations(fs.readFileSync(file, 'utf8'), relative)
  errors.push(...result.errors)
  referenceCount += result.referenceCount

  const key = localeKey(file)
  if (key) {
    const pair = localized.get(key.slug) || {}
    pair[key.locale] = result.referenceCounts
    localized.set(key.slug, pair)
  }
}

for (const [slug, pair] of localized) {
  if (!pair.bn || !pair.en) continue
  const bn = JSON.stringify(pair.bn)
  const en = JSON.stringify(pair.en)
  if (bn !== en && (Object.keys(pair.bn).length || Object.keys(pair.en).length)) {
    errors.push(
      `${slug}: Bengali and English citation identifiers or occurrence counts differ (${bn} vs ${en})`
    )
  }
}

if (errors.length) {
  console.error(`citation-lint: ${errors.length} error${errors.length === 1 ? '' : 's'}`)
  for (const error of errors) console.error(`  ERROR ${error}`)
  process.exit(1)
}

console.log(
  `citation-lint: ${files.length} pages checked, ${referenceCount} inline citation${referenceCount === 1 ? '' : 's'}, clean`
)
