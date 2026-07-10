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
  { key: 'bn', dir: path.join(contentRoot, '(bn)'), routePrefix: '' },
  { key: 'en', dir: path.join(contentRoot, 'en'), routePrefix: '/en' }
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
const allVerified = {}
const llmsPages = {}
const localeCounts = {}

for (const locale of LOCALES) {
  if (!fs.existsSync(locale.dir)) continue
  const relPages = walkPages(locale.dir, locale.dir)

  const pages = relPages.map((rel) => {
    const filePath = path.join(locale.dir, rel === '' ? '' : rel, 'page.mdx')
    const source = fs.readFileSync(filePath, 'utf8')
    const fm = parseFrontmatter(source)
    const title = fm.title || firstHeading(source) || rel
    const isStub = source.includes('<StubNotice')
    const route = rel === '' ? locale.routePrefix || '/' : `${locale.routePrefix}/${rel}`
    const repoPath = path.relative(root, filePath).split(path.sep).join('/')
    const date = gitDates.get(repoPath) || null
    if (date) allDates[route] = date
    const verified = fm.verified || null
    if (verified) allVerified[route] = verified
    return { route, slug: rel, repoPath, title: title.split('–')[0].split('|')[0].trim(), fullTitle: title, description: fm.description || '', stub: isStub, date, verified }
  })
  llmsPages[locale.key] = pages

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
  localeCounts[locale.key] = manifest.counts

  fs.writeFileSync(path.join(generatedDir, `manifest.${locale.key}.json`), JSON.stringify(manifest, null, 1))
  console.log(`manifest.${locale.key}.json: ${pages.length} pages (${manifest.counts.written} written, ${manifest.counts.stubs} stubs)`)
}

// URL -> repo path map for the inline contribution editor. Lets the
// /api/content endpoint resolve a public URL to its source MDX file.
// Landing pages ("/" and "/en") are excluded — they are hubs, not articles.
{
  const contributable = {}
  for (const locale of LOCALES) {
    for (const page of llmsPages[locale.key] || []) {
      if (page.route === '/' || page.route === '/en') continue
      contributable[page.route] = {
        repoPath: page.repoPath,
        title: page.fullTitle || page.title,
        locale: locale.key,
        stub: !!page.stub
      }
    }
  }
  fs.writeFileSync(path.join(generatedDir, 'contributable.json'), JSON.stringify(contributable, null, 1))
  console.log(`contributable.json: ${Object.keys(contributable).length} editable routes`)
}

fs.mkdirSync(path.join(root, 'public'), { recursive: true })
fs.writeFileSync(path.join(root, 'public', 'page-dates.json'), JSON.stringify(allDates))
console.log(`page-dates.json: ${Object.keys(allDates).length} routes`)

fs.writeFileSync(path.join(root, 'public', 'page-verified.json'), JSON.stringify(allVerified))
console.log(`page-verified.json: ${Object.keys(allVerified).length} routes`)

// llms.txt – legible site map for AI assistants (distribution, not cannibalization).
// Absolute URLs use the canonical domain plus the deploy target's basePath, matching
// how localHref()/NEXT_PUBLIC_BASE_PATH build links in the deployed site: empty on the
// root-domain Cloudflare build (CF_PAGES=1), /deshistartup on the GitHub Pages mirror.
{
  const SITE_URL = 'https://deshistartup.com'
  const BASE_PATH =
    process.env.DEPLOY_BASE_PATH ?? (process.env.CF_PAGES === '1' ? '' : '/deshistartup')
  const abs = (route) => `${SITE_URL}${BASE_PATH}${route === '/' ? '' : route}`
  const oneLine = (value) => value.replace(/\s+/g, ' ').trim()

  const lines = []
  lines.push('# Deshi Startup')
  lines.push('')
  lines.push(
    '> Deshi Startup is a free, open-source, Bangla-first knowledge base and practical operating ' +
      'manual for founders building startups in Bangladesh. Some startup basics also help small ' +
      'businesses, but the focus is scalable new ventures. Bengali is the source of truth; English ' +
      'mirrors it at /en/...'
  )
  lines.push('')
  lines.push(`Base URL: ${SITE_URL}${BASE_PATH}`)

  const localeSections = [
    { key: 'bn', heading: '## বাংলা (Bengali)' },
    { key: 'en', heading: '## English' }
  ]

  let totalStubs = 0
  for (const { key, heading } of localeSections) {
    const pages = (llmsPages[key] || []).filter((p) => !p.stub && p.slug !== '')
    totalStubs += localeCounts[key]?.stubs || 0
    lines.push('')
    lines.push(heading)
    for (const page of pages) {
      const desc = page.description ? oneLine(page.description) : ''
      lines.push(`- [${oneLine(page.title)}](${abs(page.route)})${desc ? `: ${desc}` : ''}`)
    }
  }

  lines.push('')
  lines.push('---')
  lines.push(
    `${totalStubs} additional topics are planned but not yet written (stubs) across both languages. ` +
      `See ${abs('/contribute')} to help write one.`
  )

  fs.writeFileSync(path.join(root, 'public', 'llms.txt'), lines.join('\n') + '\n')
  console.log(`llms.txt: ${(llmsPages.bn?.filter((p) => !p.stub).length || 0) + (llmsPages.en?.filter((p) => !p.stub).length || 0)} written pages listed`)
}

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
