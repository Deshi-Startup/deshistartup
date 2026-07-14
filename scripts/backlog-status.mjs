#!/usr/bin/env node
/**
 * Cross-references plan/content-backlog.csv (the canonical content plan) against
 * app/generated/manifest.bn.json (what actually exists on the site) so the backlog
 * stays mechanically actionable instead of drifting silently.
 *
 * Slugify rule below was derived empirically, not guessed: every backlog row is
 * matched against real site slugs, with fuzzy fallback reported rather than
 * silently accepted.
 *
 * Output: plan/status-report.md
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else inQuotes = false
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field); field = ''
    } else if (ch === '\n') {
      row.push(field); rows.push(row); row = []; field = ''
    } else if (ch === '\r') {
      // skip, \n handles the line break
    } else {
      field += ch
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''))
}

function loadCsv(filePath) {
  const rows = parseCsv(fs.readFileSync(filePath, 'utf8'))
  const header = rows[0]
  return rows.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])))
}

// Derived from real pairs (see header comment): "&" -> "and"; "/" and "'" are
// dropped, not hyphenated; other punctuation is dropped; everything else -> "-".
function slugify(topic) {
  let s = topic.toLowerCase()
  s = s.replace(/&/g, ' and ')
  s = s.replace(/[/']/g, '')
  s = s.replace(/[(),.:?]/g, '')
  s = s.replace(/[^a-z0-9]+/g, '-')
  s = s.replace(/-+/g, '-').replace(/^-|-$/g, '')
  return s
}

function tokenize(slug) {
  return new Set(slug.split('-').filter(Boolean))
}

function tokenOverlapScore(a, b) {
  const ta = tokenize(a)
  const tb = tokenize(b)
  if (ta.size === 0 || tb.size === 0) return 0
  let intersection = 0
  for (const t of ta) if (tb.has(t)) intersection++
  return intersection / Math.max(ta.size, tb.size)
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'app', 'generated', 'manifest.bn.json'), 'utf8'))

const sitePages = []
for (const [dirSlug, section] of Object.entries(manifest.sections)) {
  if (section.index) {
    sitePages.push({
      slug: section.index.slug,
      basename: section.index.slug.split('/').pop(),
      dir: dirSlug,
      title: section.index.title,
      stub: section.index.stub
    })
  }
  for (const child of section.children) {
    sitePages.push({
      slug: child.slug,
      basename: child.slug.split('/').pop(),
      dir: dirSlug,
      title: child.title,
      stub: child.stub
    })
  }
}

const basenameMap = new Map()
for (const page of sitePages) {
  if (!basenameMap.has(page.basename)) basenameMap.set(page.basename, [])
  basenameMap.get(page.basename).push(page)
}
const bySlug = new Map(sitePages.map((page) => [page.slug, page]))

const FUZZY_THRESHOLD = 0.6
const backlogRows = loadCsv(path.join(root, 'plan', 'content-backlog.csv'))
const matchedSiteSlugs = new Set()

const results = backlogRows.map((row) => {
  // The Path column (added with the July 2026 topic-URL migration) is the
  // canonical registry: an explicit path always wins over title slugification.
  if (row.Path) {
    const slug = row.Path.replace(/^\//, '')
    const match = bySlug.get(slug) || null
    if (match) matchedSiteSlugs.add(match.slug)
    return { ...row, slug, match, matchType: match ? 'exact' : 'missing' }
  }

  const topic = row['Topic (English)']
  const slug = slugify(topic)
  const candidates = basenameMap.get(slug) || []
  let match = null
  let matchType = 'missing'

  if (candidates.length === 1) {
    match = candidates[0]
    matchType = 'exact'
  } else if (candidates.length > 1) {
    match = candidates[0]
    matchType = 'exact-ambiguous'
  } else {
    let best = null
    let bestScore = 0
    for (const [basename, pages] of basenameMap) {
      const score = tokenOverlapScore(slug, basename)
      if (score > bestScore) { bestScore = score; best = pages[0] }
    }
    if (best && bestScore >= FUZZY_THRESHOLD) {
      match = best
      matchType = 'fuzzy'
      match = { ...best, score: bestScore }
    }
  }

  if (match) matchedSiteSlugs.add(match.slug)
  return { ...row, slug, match, matchType }
})

// --- Aggregate: Section x Priority counts of written / stub / missing ---
const grid = new Map() // `${section}|${priority}` -> {written, stub, missing, fuzzy}
for (const r of results) {
  const key = `${r.Section}|${r.Priority}`
  if (!grid.has(key)) grid.set(key, { written: 0, stub: 0, missing: 0, fuzzy: 0 })
  const bucket = grid.get(key)
  if (r.matchType === 'missing') bucket.missing++
  else if (r.matchType === 'fuzzy') bucket.fuzzy++
  else if (r.match.stub) bucket.stub++
  else bucket.written++
}

const sectionOrder = [...new Set(backlogRows.map((r) => r.Section))]
const priorityOrder = ['High', 'Medium', 'Low']

const missingRows = results.filter((r) => r.matchType === 'missing')
const fuzzyRows = results.filter((r) => r.matchType === 'fuzzy')
const ambiguousRows = results.filter((r) => r.matchType === 'exact-ambiguous')
const orphanPages = sitePages.filter((p) => !matchedSiteSlugs.has(p.slug))

const totalWritten = results.filter((r) => r.matchType !== 'missing' && r.matchType !== 'fuzzy' && !r.match.stub).length
const totalStub = results.filter((r) => r.matchType !== 'missing' && r.matchType !== 'fuzzy' && r.match.stub).length

let md = '# Backlog status report\n\n'
md += 'Generated by `npm run backlog:status` — cross-references `plan/content-backlog.csv` against '
md += '`app/generated/manifest.bn.json`. Regenerate after editing the backlog or writing pages; '
md += 'do not hand-edit this file.\n\n'
md += `- Backlog rows: **${backlogRows.length}**\n`
md += `- Matched to a written page: **${totalWritten}**\n`
md += `- Matched to a stub: **${totalStub}**\n`
md += `- Fuzzy matches (needs manual check): **${fuzzyRows.length}**\n`
md += `- No matching page: **${missingRows.length}**\n`
md += `- Site pages with no backlog row: **${orphanPages.length}**\n\n`

md += '## Section × priority\n\n'
md += '| Section | Priority | Written | Stub | Fuzzy | Missing | Total |\n'
md += '|---|---|---|---|---|---|---|\n'
for (const section of sectionOrder) {
  for (const priority of priorityOrder) {
    const key = `${section}|${priority}`
    if (!grid.has(key)) continue
    const b = grid.get(key)
    const total = b.written + b.stub + b.fuzzy + b.missing
    md += `| ${section} | ${priority} | ${b.written} | ${b.stub} | ${b.fuzzy} | ${b.missing} | ${total} |\n`
  }
}

md += '\n## Backlog rows with no matching page\n\n'
if (missingRows.length === 0) {
  md += 'No backlog rows are missing a site page.\n'
} else {
  md += `${missingRows.length} rows. These usually indicate a missing stub, a renamed page, or a backlog row that needs an explicit slug mapping.\n\n`
  md += '| Section | Subsection | Topic (English) | Priority | Slug tried |\n'
  md += '|---|---|---|---|---|\n'
  for (const r of missingRows) {
    md += `| ${r.Section} | ${r.Subsection} | ${r['Topic (English)']} | ${r.Priority} | \`${r.slug}\` |\n`
  }
}

if (fuzzyRows.length) {
  md += '\n## Fuzzy matches (verify manually)\n\n'
  md += '| Topic (English) | Slug tried | Closest site page | Score |\n'
  md += '|---|---|---|---|\n'
  for (const r of fuzzyRows) {
    md += `| ${r['Topic (English)']} | \`${r.slug}\` | \`${r.match.slug}\` | ${r.match.score.toFixed(2)} |\n`
  }
}

if (ambiguousRows.length) {
  md += '\n## Ambiguous matches (basename shared by multiple pages, resolved by section)\n\n'
  md += '| Topic (English) | Slug tried | Resolved to |\n'
  md += '|---|---|---|\n'
  for (const r of ambiguousRows) {
    md += `| ${r['Topic (English)']} | \`${r.slug}\` | \`${r.match.slug}\` |\n`
  }
}

md += '\n## Site pages absent from the backlog\n\n'
md += `${orphanPages.length} pages exist on the site but no backlog row's slug points at them — `
md += 'usually section hubs, directory/tool/journey entrypoints, legacy top-level guides, or pages that need backlog rows.\n\n'
md += '| Slug | Title | Stub? |\n'
md += '|---|---|---|\n'
for (const p of orphanPages.sort((a, b) => a.slug.localeCompare(b.slug))) {
  md += `| \`${p.slug}\` | ${p.title} | ${p.stub ? 'yes' : 'no'} |\n`
}

fs.writeFileSync(path.join(root, 'plan', 'status-report.md'), md)
console.log(`plan/status-report.md written: ${backlogRows.length} backlog rows, ${missingRows.length} unmatched, ${orphanPages.length} orphan site pages`)
