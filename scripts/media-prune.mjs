#!/usr/bin/env node
/**
 * Repository-aware R2 cleanup.
 *
 * A blanket age-based lifecycle rule is unsafe for a reference work: a valid
 * screenshot may be unchanged and in use for years. Instead, replacements are
 * recorded in media-retired.json, and unreferenced logical entries can be
 * deliberately moved there. Remote deletion is a separate step after a grace
 * period, and is dry-run by default.
 *
 *   npm run media:prune
 *   npm run media:prune -- --retire-unreferenced
 *   npm run media:prune -- --apply
 */
import fs from 'node:fs'
import path from 'node:path'
import { classifyContributorMediaAvatars } from './lib/contributor-media.mjs'
import {
  deleteObject,
  objectKeyMatchesLogicalPath,
  readRegistry,
  readRetired,
  RETIREMENT_GRACE_DAYS,
  root,
  validLogicalPath,
  writeRegistry,
  writeRetired
} from './lib/media-lib.mjs'

const contentRoot = path.join(root, 'app', '(contents)')
const contributorLedgerFile = path.join(root, 'data', 'contributor-ledger.json')
const contributorPolicyFile = path.join(root, 'data', 'contributors-policy.json')
const apply = process.argv.includes('--apply')
const retireUnreferenced = process.argv.includes('--retire-unreferenced')
const unknown = process.argv
  .slice(2)
  .filter((arg) => !['--apply', '--retire-unreferenced'].includes(arg))

if (unknown.length) {
  console.error(`✖ unknown option${unknown.length === 1 ? '' : 's'}: ${unknown.join(', ')}`)
  process.exit(1)
}

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
  for (const match of raw.matchAll(/([A-Za-z][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    out[match[1]] = match[2] ?? match[3] ?? ''
  }
  return out
}

function references() {
  const used = new Set()
  for (const file of walk(contentRoot)) {
    const source = fs.readFileSync(file, 'utf8')
    for (const match of source.matchAll(/!\[[^\]]*\]\(\s*(\/media\/[^)\s]+)/g)) {
      used.add(match[1])
    }
    for (const match of source.matchAll(/<Figure\b([\s\S]*?)\/>/g)) {
      const src = attributes(match[1]).src
      if (src?.startsWith('/media/')) used.add(src)
    }
    for (const match of source.matchAll(/<YouTube\b([\s\S]*?)\/>/g)) {
      const id = attributes(match[1]).id
      if (!id) continue
      for (const ext of ['.jpg', '.jpeg', '.webp', '.png']) {
        used.add(`/media/youtube/${id}${ext}`)
      }
    }
  }

  const ledger = JSON.parse(fs.readFileSync(contributorLedgerFile, 'utf8'))
  const policy = JSON.parse(fs.readFileSync(contributorPolicyFile, 'utf8'))
  const avatars = classifyContributorMediaAvatars(ledger, policy)
  for (const avatar of avatars.active) {
    const logicalPath = avatar.path
    if (!validLogicalPath(logicalPath || '')) {
      throw new Error(
        `${path.relative(root, contributorLedgerFile)} profile ${avatar.profileId} has an invalid media avatar path`
      )
    }
    used.add(logicalPath)
  }

  return used
}

function ageInDays(iso, now = Date.now()) {
  const value = Date.parse(iso)
  return Number.isFinite(value) ? (now - value) / 86_400_000 : -1
}

const registry = readRegistry()
let retired = readRetired()
const invalidRetired = retired.filter(
  (entry) =>
    !entry ||
    !objectKeyMatchesLogicalPath(entry.logicalPath, entry.key) ||
    !['superseded', 'unreferenced'].includes(entry.reason) ||
    !Number.isFinite(Date.parse(entry.retiredAt)) ||
    !Number.isSafeInteger(entry.bytes) ||
    entry.bytes < 0
)
if (invalidRetired.length) {
  console.error(
    `✖ ${invalidRetired.length} invalid retirement entr${invalidRetired.length === 1 ? 'y' : 'ies'}; refusing to plan or delete R2 objects`
  )
  process.exit(1)
}
const used = references()
const unreferenced = Object.keys(registry).filter((key) => !used.has(key)).sort()

if (retireUnreferenced && unreferenced.length) {
  const retiredAt = new Date().toISOString()
  for (const logicalPath of unreferenced) {
    const entry = registry[logicalPath]
    if (entry.key && !retired.some((candidate) => candidate.key === entry.key)) {
      retired.push({
        logicalPath,
        key: entry.key,
        bytes: entry.bytes || 0,
        retiredAt,
        reason: 'unreferenced'
      })
    }
    delete registry[logicalPath]
    console.log(`  ↘ retired ${logicalPath}`)
  }
  // The remote bytes deliberately remain available while the registry/page
  // change deploys and settles. A later --apply run performs actual deletion.
  writeRetired(retired)
  writeRegistry(registry)
}

const activeKeys = new Set(Object.values(registry).map((entry) => entry.key).filter(Boolean))
const eligible = retired.filter(
  (entry) =>
    entry.key &&
    !activeKeys.has(entry.key) &&
    ageInDays(entry.retiredAt) >= RETIREMENT_GRACE_DAYS
)

let deleted = 0
const failures = []
if (apply) {
  for (const entry of eligible) {
    try {
      deleteObject(entry.key)
      retired = retired.filter((candidate) => candidate.key !== entry.key)
      deleted++
      console.log(`  ↓ deleted ${entry.key}`)
    } catch (error) {
      const detail = (error.stderr?.toString() || error.message || '')
        .trim()
        .split('\n')
        .slice(-6)
        .join('\n')
      failures.push({ key: entry.key, error: detail })
    }
  }
  writeRetired(retired)
}

const retainedBytes = retired.reduce((sum, entry) => sum + (entry.bytes || 0), 0)
const stillUnreferenced = Object.keys(registry).filter((key) => !used.has(key)).sort()

console.log(
  `media prune: ${Object.keys(registry).length} active, ${retired.length} retired ` +
    `(${(retainedBytes / 1024 / 1024).toFixed(1)} MB), ${eligible.length} old enough to delete`
)

if (stillUnreferenced.length) {
  console.log('\nUnreferenced active entries:')
  for (const key of stillUnreferenced) console.log(`  • ${key}`)
  console.log('Run `npm run media:prune -- --retire-unreferenced` after confirming they are unused.')
}

if (eligible.length && !apply) {
  console.log('\nEligible retired objects (dry run):')
  for (const entry of eligible) console.log(`  • ${entry.key}`)
  console.log('Run `npm run media:prune -- --apply` to delete these R2 objects.')
}

if (apply) console.log(`${deleted} retired object${deleted === 1 ? '' : 's'} deleted from R2.`)

if (failures.length) {
  console.error('\n✖ deletion failed:')
  for (const failure of failures) {
    console.error(`  ${failure.key}\n    ${failure.error.replace(/\n/g, '\n    ')}`)
  }
  process.exit(1)
}
