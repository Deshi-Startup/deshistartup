#!/usr/bin/env node
/**
 * Builds navigation manifests from the content tree so navigation,
 * section hubs, stub badges, and "last updated" dates never need
 * hand-maintenance. Contributors only add/edit page.mdx files.
 *
 * Outputs:
 *   app/generated/manifest.bn.json  – full tree for server components (hubs)
 *   app/generated/manifest.en.json
 *   public/page-dates.json          – route -> last git commit date (client meta bar)
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(root, 'app', '(contents)')

const LOCALES = [
  { key: 'bn', dir: path.join(contentRoot, '(bn)'), routePrefix: '', stubMarkers: ['<StubNotice', 'প্রাথমিক অগ্রাধিকার', 'এই পৃষ্ঠার উদ্দেশ্য'] },
  { key: 'en', dir: path.join(contentRoot, 'en'), routePrefix: '/en', stubMarkers: ['<StubNotice', 'Initial Priority', 'Purpose of this Page'] }
]

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const data = {}
  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const kv = line.match(/^(\w+):\s*(.*)$/)
      if (!kv) continue
      let value = kv[2].trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      data[kv[1]] = value
    }
  }
  return data
}

function firstHeading(source) {
  const match = source.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

// One git pass: newest commit date per content file.
function collectGitDates() {
  const dates = new Map()
  try {
    const log = execSync("git log --format='C%cs' --name-only -- 'app/(contents)'", {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024
    })
    let current = null
    for (const line of log.split('\n')) {
      if (line.startsWith('C')) current = line.slice(1).trim()
      else if (line.trim() && current && !dates.has(line.trim())) dates.set(line.trim(), current)
    }
  } catch {
    // No git available (fresh tarball) – dates stay empty, UI hides them.
  }
  return dates
}

function walkPages(dir, baseDir) {
  const pages = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      pages.push(...walkPages(full, baseDir))
    } else if (entry.name === 'page.mdx') {
      pages.push(path.relative(baseDir, dir).split(path.sep).join('/'))
    }
  }
  return pages
}

const gitDates = collectGitDates()
const generatedDir = path.join(root, 'app', 'generated')
fs.mkdirSync(generatedDir, { recursive: true })

const allDates = {}

for (const locale of LOCALES) {
  if (!fs.existsSync(locale.dir)) continue
  const relPages = walkPages(locale.dir, locale.dir)

  const pages = relPages.map((rel) => {
    const filePath = path.join(locale.dir, rel === '' ? '' : rel, 'page.mdx')
    const source = fs.readFileSync(filePath, 'utf8')
    const fm = parseFrontmatter(source)
    const title = fm.title || firstHeading(source) || rel
    const isStub = locale.stubMarkers.some((marker) => source.includes(marker))
    const route = rel === '' ? locale.routePrefix || '/' : `${locale.routePrefix}/${rel}`
    const repoPath = path.relative(root, filePath).split(path.sep).join('/')
    const date = gitDates.get(repoPath) || null
    if (date) allDates[route] = date
    return { route, slug: rel, title: title.split('–')[0].split('|')[0].trim(), fullTitle: title, description: fm.description || '', stub: isStub, date }
  })

  // Build a tree: sections are the first-level directories.
  const sections = {}
  for (const page of pages) {
    if (page.slug === '') continue
    const [head, ...rest] = page.slug.split('/')
    if (!sections[head]) sections[head] = { slug: head, index: null, children: [] }
    if (rest.length === 0) sections[head].index = page
    else sections[head].children.push(page)
  }
  for (const section of Object.values(sections)) {
    section.children.sort((a, b) => {
      if (a.stub !== b.stub) return a.stub ? 1 : -1
      return a.title.localeCompare(b.title, locale.key === 'bn' ? 'bn' : 'en')
    })
    section.title = section.index ? section.index.title : section.slug
    section.total = section.children.length
    section.written = section.children.filter((c) => !c.stub).length
  }

  const manifest = {
    locale: locale.key,
    generatedAt: null, // deliberately unset: avoids churn in git diffs
    counts: {
      pages: pages.length,
      written: pages.filter((p) => !p.stub).length,
      stubs: pages.filter((p) => p.stub).length
    },
    sections
  }

  fs.writeFileSync(path.join(generatedDir, `manifest.${locale.key}.json`), JSON.stringify(manifest, null, 1))
  console.log(`manifest.${locale.key}.json: ${pages.length} pages (${manifest.counts.written} written, ${manifest.counts.stubs} stubs)`)
}

fs.mkdirSync(path.join(root, 'public'), { recursive: true })
fs.writeFileSync(path.join(root, 'public', 'page-dates.json'), JSON.stringify(allDates))
console.log(`page-dates.json: ${Object.keys(allDates).length} routes`)

// Tiny client-safe map (section slug -> title) for breadcrumbs.
const lite = {}
for (const locale of LOCALES) {
  const manifestPath = path.join(generatedDir, `manifest.${locale.key}.json`)
  if (!fs.existsSync(manifestPath)) continue
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  lite[locale.key] = Object.fromEntries(
    Object.values(manifest.sections).map((s) => [s.slug, s.title])
  )
  lite[`${locale.key}Counts`] = manifest.counts
}
fs.writeFileSync(path.join(generatedDir, 'sections-lite.json'), JSON.stringify(lite, null, 1))
console.log('sections-lite.json written')
