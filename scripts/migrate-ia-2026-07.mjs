#!/usr/bin/env node
/**
 * One-off executor for the July 2026 URL/IA migration (plan/url-map-2026-07.csv).
 *
 * - Moves page.mdx files (both locales) from phase-owned to topic-owned routes via `git mv`
 * - Deletes routes consolidated into an existing cornerstone (map value `-`)
 * - Rewrites <StubNotice path="..."> to the new slug
 * - Rewrites every internal markdown link in the content tree to the root-relative
 *   canonical path (`/registration/private-limited`, `/en/...` for English pages),
 *   resolving old relative forms against the page's pre-move route first
 *
 * Run with --dry-run to preview. Kept in the repo as the migration record.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(root, 'app', '(contents)')
const LOCALES = [
  { key: 'bn', dir: path.join(contentRoot, '(bn)'), prefix: '' },
  { key: 'en', dir: path.join(contentRoot, 'en'), prefix: '/en' }
]
const dryRun = process.argv.includes('--dry-run')

// ---------- load map ----------
const mapCsv = fs.readFileSync(path.join(root, 'plan', 'url-map-2026-07.csv'), 'utf8')
const moves = new Map() // old slug -> new slug
const deletes = new Map() // old slug -> covering slug (from note "covered by /x")
for (const line of mapCsv.split('\n').slice(1)) {
  if (!line.trim()) continue
  const [oldSlug, newSlug, note = ''] = line.split(',')
  if (newSlug === '-') {
    const covered = note.match(/covered by (\/[a-z0-9/-]+)/)
    deletes.set(oldSlug, covered ? covered[1].slice(1) : '')
  } else {
    moves.set(oldSlug, newSlug)
  }
}

// ---------- inventory ----------
function walkPages(dir, base = dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkPages(full, base))
    else if (entry.name === 'page.mdx') out.push(path.relative(base, dir).split(path.sep).join('/'))
  }
  return out
}
const bnSlugs = walkPages(LOCALES[0].dir)
const known = new Set(bnSlugs) // '' is the landing page

// ---------- validate ----------
const errors = []
for (const oldSlug of [...moves.keys(), ...deletes.keys()]) {
  if (!known.has(oldSlug)) errors.push(`map references missing page: ${oldSlug}`)
}
const targets = new Map()
for (const [oldSlug, newSlug] of moves) {
  if (targets.has(newSlug)) errors.push(`duplicate target ${newSlug} (${oldSlug} and ${targets.get(newSlug)})`)
  targets.set(newSlug, oldSlug)
}
for (const slug of known) {
  if (!moves.has(slug) && !deletes.has(slug) && targets.has(slug)) {
    errors.push(`target collides with unchanged page: ${slug}`)
  }
}
for (const covering of deletes.values()) {
  const finalSet = new Set([...[...known].filter((s) => !moves.has(s) && !deletes.has(s)), ...targets.keys()])
  if (covering && !finalSet.has(covering)) errors.push(`delete covering page will not exist: ${covering}`)
}
if (errors.length) {
  console.error('Map validation failed:\n' + errors.map((e) => `  ✖ ${e}`).join('\n'))
  process.exit(1)
}
console.log(`map ok: ${moves.size} moves, ${deletes.size} deletes, ${known.size} bn pages`)

// slug (old) -> slug (new) for every page, deletes resolve to covering page
const finalSlug = (slug) => (moves.has(slug) ? moves.get(slug) : deletes.has(slug) ? deletes.get(slug) : slug)

// ---------- git mv / git rm ----------
const run = (cmd) => {
  if (dryRun) return console.log(`  $ ${cmd}`)
  execSync(cmd, { cwd: root, stdio: 'pipe' })
}
const q = (p) => `'${p}'`

for (const locale of LOCALES) {
  for (const [oldSlug, newSlug] of moves) {
    const from = path.join(locale.dir, oldSlug, 'page.mdx')
    if (!fs.existsSync(from)) {
      console.warn(`  ! missing in ${locale.key}: ${oldSlug}`)
      continue
    }
    const toDir = path.join(locale.dir, newSlug)
    if (!dryRun) fs.mkdirSync(toDir, { recursive: true })
    run(`git mv ${q(path.relative(root, from))} ${q(path.relative(root, path.join(toDir, 'page.mdx')))}`)
  }
  for (const oldSlug of deletes.keys()) {
    const from = path.join(locale.dir, oldSlug, 'page.mdx')
    if (fs.existsSync(from)) run(`git rm -q ${q(path.relative(root, from))}`)
  }
}
// prune now-empty directories
if (!dryRun) {
  const pruneEmpty = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) pruneEmpty(path.join(dir, entry.name))
    }
    if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir)
  }
  for (const locale of LOCALES) pruneEmpty(locale.dir)
}

// ---------- rewrite StubNotice paths + internal links ----------
// Every page is processed at its NEW location, but its links were written against
// its OLD route, so resolve relative targets against the old route.
const oldByNew = new Map([...moves].map(([o, n]) => [n, o]))
const warnings = []

function canonicalize(source, pageNewSlug, locale) {
  const pageOldSlug = oldByNew.get(pageNewSlug) ?? pageNewSlug
  const oldRoute = pageOldSlug === '' ? '/' : `/${pageOldSlug}`

  let out = source.replace(/<StubNotice\s+path="([^"]+)"/g, (m, p) => {
    const next = finalSlug(p)
    return `<StubNotice path="${next}"`
  })

  out = out.replace(/\]\(([^)\s]+)\)/g, (match, target) => {
    if (/^(https?:|mailto:|#|\/\/)/.test(target)) return match
    const [pathPart, hash] = target.split('#')
    if (!pathPart) return match
    let resolved
    try {
      resolved = new URL(pathPart, `https://x${locale.prefix}${oldRoute}`).pathname
    } catch {
      return match
    }
    let slugPart = resolved.replace(/\/+$/, '').replace(/^\//, '')
    if (locale.key === 'en') {
      if (slugPart === 'en') slugPart = ''
      else if (slugPart.startsWith('en/')) slugPart = slugPart.slice(3)
    }
    if (slugPart !== '' && !known.has(slugPart)) {
      warnings.push(`${locale.key}/${pageNewSlug || '(home)'} -> unknown link target "${target}" (resolved ${resolved})`)
      return match
    }
    const next = finalSlug(slugPart)
    const canonical = `${locale.prefix}${next === '' ? (locale.prefix ? '' : '/') : `/${next}`}` || '/'
    return `](${canonical}${hash ? `#${hash}` : ''})`
  })
  return out
}

if (!dryRun) {
  let rewritten = 0
  for (const locale of LOCALES) {
    for (const slug of walkPages(locale.dir)) {
      const file = path.join(locale.dir, slug, 'page.mdx')
      const source = fs.readFileSync(file, 'utf8')
      const next = canonicalize(source, slug, locale)
      if (next !== source) {
        fs.writeFileSync(file, next)
        rewritten++
      }
    }
  }
  console.log(`links canonicalized in ${rewritten} files`)
}
if (warnings.length) {
  console.warn(`\n${warnings.length} link warnings:`)
  for (const w of [...new Set(warnings)]) console.warn(`  ! ${w}`)
}
console.log(dryRun ? 'dry run complete' : 'migration complete')
