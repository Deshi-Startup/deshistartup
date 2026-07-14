#!/usr/bin/env node
/**
 * Enforces the URL policy adopted with the July 2026 topic-URL migration
 * (see AGENTS.md "URL policy"). Runs before every manifest build, so a
 * violating route fails the build instead of shipping.
 *
 * Errors (✖, exit 1):
 *   - more than 2 semantic path segments (excluding /en)
 *   - path longer than 75 characters
 *   - slug segment with characters outside [a-z0-9-], double/edge hyphens
 *   - bn and en content trees out of mirror (slug sets differ)
 *   - <StubNotice path> not matching the page's actual slug
 *
 * Warnings (⚠, reported only):
 *   - path longer than 60 characters (target is under 45)
 *   - slug token longer than 24 characters (often a malformed word-join)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(root, 'app', '(contents)')
const LOCALES = [
  { key: 'bn', dir: path.join(contentRoot, '(bn)') },
  { key: 'en', dir: path.join(contentRoot, 'en') }
]

const ERROR_LENGTH = 75
const WARN_LENGTH = 60
const MAX_SEGMENTS = 2
const MAX_TOKEN = 24

function walkPages(dir, base = dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkPages(full, base))
    else if (entry.name === 'page.mdx') out.push(path.relative(base, dir).split(path.sep).join('/'))
  }
  return out
}

const errors = []
const warnings = []
const slugSets = {}

for (const locale of LOCALES) {
  if (!fs.existsSync(locale.dir)) continue
  const slugs = walkPages(locale.dir)
  slugSets[locale.key] = new Set(slugs)
  if (locale.key === 'en') continue // policy checks once, on the bn tree

  for (const slug of slugs) {
    if (slug === '') continue
    const route = `/${slug}`
    const segments = slug.split('/')

    if (segments.length > MAX_SEGMENTS) {
      errors.push(`${route}: ${segments.length} path segments (max ${MAX_SEGMENTS})`)
    }
    if (route.length > ERROR_LENGTH) {
      errors.push(`${route}: ${route.length} characters (hard limit ${ERROR_LENGTH})`)
    } else if (route.length > WARN_LENGTH) {
      warnings.push(`${route}: ${route.length} characters (target < 45, warn > ${WARN_LENGTH})`)
    }
    for (const segment of segments) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(segment)) {
        errors.push(`${route}: segment "${segment}" breaks slug charset (lowercase a-z, 0-9, single hyphens)`)
      }
      for (const token of segment.split('-')) {
        if (token.length > MAX_TOKEN) {
          warnings.push(`${route}: token "${token}" is ${token.length} characters – possible malformed word-join`)
        }
      }
    }
  }
}

// bn/en mirror check
if (slugSets.bn && slugSets.en) {
  for (const slug of slugSets.bn) {
    if (!slugSets.en.has(slug)) errors.push(`/${slug}: missing English mirror (app/(contents)/en/${slug}/page.mdx)`)
  }
  for (const slug of slugSets.en) {
    if (!slugSets.bn.has(slug)) errors.push(`/en/${slug}: missing Bengali original (app/(contents)/(bn)/${slug}/page.mdx)`)
  }
}

// StubNotice path prop must match the page's real slug
for (const locale of LOCALES) {
  if (!fs.existsSync(locale.dir)) continue
  for (const slug of slugSets[locale.key]) {
    const file = path.join(locale.dir, slug === '' ? '' : slug, 'page.mdx')
    const source = fs.readFileSync(file, 'utf8')
    const match = source.match(/<StubNotice\s+path="([^"]+)"/)
    if (match && match[1] !== slug) {
      errors.push(`${locale.key}/${slug || '(home)'}: StubNotice path="${match[1]}" does not match the page slug`)
    }
  }
}

for (const warning of warnings) console.warn(`⚠ ${warning}`)
for (const error of errors) console.error(`✖ ${error}`)
console.log(
  `route-lint: ${slugSets.bn ? slugSets.bn.size : 0} routes checked, ${errors.length} errors, ${warnings.length} warnings`
)
if (errors.length > 0) process.exit(1)
