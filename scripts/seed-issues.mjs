#!/usr/bin/env node
/**
 * Seeds "নতুন গাইড" GitHub issues from High-priority backlog stubs so contributors
 * always have claimable, well-scoped work (part of T12, the open-source front door).
 *
 * Selection: High-priority backlog rows whose site page is still a stub, spread
 * across sections via per-section quotas (CSV order within a section). Each issue
 * body carries the topic, the writing angle from the backlog Notes column, the
 * stub's pre-listed sources, and claim/how-to instructions.
 *
 * Usage:
 *   node scripts/seed-issues.mjs             # dry run: prints planned issues
 *   node scripts/seed-issues.mjs --skip-existing # dry run: omits open issues
 *   node scripts/seed-issues.mjs --create    # actually creates them via `gh`
 *
 * Creation always checks open issues first. Matching the canonical content route
 * in the body keeps re-runs safe even when an issue title has been edited.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { parseCsv } from './csv.mjs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = 'Deshi-Startup/deshistartup'
const SITE = 'https://deshistartup.com'

// How many issues to seed per section (CSV order within each section).
const QUOTAS = {
  'Phase 1: Starting': 6,
  'Phase 3: Launching & Growing': 4,
  'Phase 2: Building': 3,
  'Case Studies': 3,
  'Phase 4: Ecosystem & Support': 2,
  'Founder Life': 2
}


function stubSources(slug) {
  const file = path.join(root, 'app', '(contents)', 'en', slug, 'page.mdx')
  if (!fs.existsSync(file)) return []
  const source = fs.readFileSync(file, 'utf8')
  const links = [...source.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)]
  return links.slice(0, 6).map((m) => `- [${m[1]}](${m[2]})`)
}

// Editorial-planning rows (about the case-study category itself) are not writable
// guides; never seed them as contributor issues.
const META_TOPIC = /content category|case stud(y|ies)/i
const SEEDED_ROUTE = /https:\/\/deshistartup\.com\/(?:en\/)?([a-z0-9][a-z0-9/-]*)/gi

export function issueRouteSlugs(body = '') {
  return [...String(body).matchAll(SEEDED_ROUTE)]
    .map((match) => match[1].replace(/\/+$/, ''))
    .filter(Boolean)
}

export function indexOpenIssues(issues) {
  const titles = new Set()
  const slugs = new Set()
  for (const issue of issues) {
    if (issue?.title) titles.add(issue.title)
    for (const slug of issueRouteSlugs(issue?.body)) slugs.add(slug)
  }
  return { titles, slugs }
}

function main() {
  const args = process.argv.slice(2)
  const create = args.includes('--create')
  const skipExisting = args.includes('--skip-existing')

  const csvRows = parseCsv(fs.readFileSync(path.join(root, 'plan', 'content-backlog.csv'), 'utf8'))
  const header = csvRows[0]
  const backlog = csvRows.slice(1).map((row) =>
    Object.fromEntries(header.map((column, index) => [column, (row[index] ?? '').trim()]))
  )

  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, 'app', 'generated', 'manifest.en.json'), 'utf8')
  )
  const stubBySlug = new Map()
  for (const section of Object.values(manifest.sections)) {
    for (const page of [section.index, ...section.children].filter(Boolean)) {
      if (page.stub) stubBySlug.set(page.slug, page)
    }
  }

  const picked = []
  const used = {}
  for (const row of backlog) {
    const quota = QUOTAS[row.Section]
    if (!quota || row.Priority !== 'High') continue
    if (row.Section === 'Case Studies' && META_TOPIC.test(row['Topic (English)'])) continue
    if ((used[row.Section] || 0) >= quota) continue
    // The backlog's Path column is the canonical route registry (July 2026 migration).
    const candidate = row.Path?.replace(/^\//, '')
    const slug = candidate && stubBySlug.has(candidate) ? candidate : null
    if (!slug) continue
    used[row.Section] = (used[row.Section] || 0) + 1
    picked.push({ row, slug })
  }

  let existing = { titles: new Set(), slugs: new Set() }
  if (skipExisting || create) {
    const out = execFileSync(
      'gh',
      ['issue', 'list', '--repo', REPO, '--state', 'open', '--limit', '200', '--json', 'title,body'],
      { encoding: 'utf8' }
    )
    existing = indexOpenIssues(JSON.parse(out))
  }

  const GOOD_FIRST = /template|checklist|script|worksheet|tracker|outline/i

  let createdCount = 0
  let plannedCount = 0
  let skippedCount = 0
  for (const { row, slug } of picked) {
    const bnTopic = row['Topic (Bangla)'].replace(/[।\s]+$/, '')
    const title = `গাইড লিখুন: ${bnTopic}`
    if (existing.titles.has(title) || existing.slugs.has(slug)) {
      skippedCount++
      continue
    }

    const sources = stubSources(slug)
    const labels = ['নতুন গাইড', 'help wanted']
    if (GOOD_FIRST.test(row['Content type']) || GOOD_FIRST.test(row['Topic (English)'])) {
      labels.push('good first issue')
    }

    const body = [
      `**বিষয়:** ${row['Topic (Bangla)']} *(English: ${row['Topic (English)']})*`,
      `**সেকশন:** ${row.Section} · **অগ্রাধিকার:** High · **ধরন:** ${row['Content type'] || 'Guide'}`,
      `**ইংরেজি স্টাব পেজ:** ${SITE}/en/${slug}`,
      '',
      row.Notes ? `**লেখার অ্যাঙ্গেল:** ${row.Notes}\n` : null,
      sources.length ? '### শুরু করার সূত্র\n\n' + sources.join('\n') + '\n' : null,
      '### কীভাবে লিখবেন',
      '',
      '1. এই ইস্যুতে **"আমি লিখছি"** মন্তব্য করুন – তাহলে আর কেউ একই বিষয়ে সময় দেবেন না।',
      `2. [ইংরেজি স্টাব পেজটি](${SITE}/en/${slug}) খুলে **"Write this page"** বা **"Edit"** অপশনে ক্লিক করুন – ব্রাউজারেই লেখা যায়। বিস্তারিত ধাপ: [CONTRIBUTING.md](https://github.com/${REPO}/blob/main/CONTRIBUTING.md)।`,
      '3. সম্পাদনার কাজ ইংরেজি গাইড দিয়ে শুরু হয়। আগে সেটি পূর্ণ করে রিভিউয়ের জন্য পাঠান। আইন, ফি ও নিয়মের দাবিতে সূত্র দিন, আর বদলাতে পারে এমন সংখ্যার সঙ্গে সাল লিখুন। গবেষণা ও শেখানোর মানের জন্য [EDITORIAL.md](https://github.com/' + REPO + '/blob/main/EDITORIAL.md) দেখে নিন। ইংরেজি গাইডের রিভিউ শেষ হলে [STYLE.md](https://github.com/' + REPO + '/blob/main/STYLE.md) মেনে বাংলা সংস্করণ অনুবাদ করুন।',
      '4. পেজ পূর্ণাঙ্গ গাইড হলে শুরুর `<StubNotice ... />` লাইনটি মুছে PR দিন।',
      '',
      'ভাষা নিখুঁত না হলেও জমা দিন – রিভিউতে গুছিয়ে নেওয়া যাবে। প্রশ্ন থাকলে এখানেই করুন।'
    ].filter((line) => line !== null).join('\n')

    if (!create) {
      plannedCount++
      console.log(`--- [dry] ${title}`)
      console.log(
        `    slug: ${slug} · labels: ${labels.join(', ')}${sources.length ? ` · ${sources.length} sources` : ''}`
      )
      continue
    }

    const ghArgs = ['issue', 'create', '--repo', REPO, '--title', title, '--body', body]
    for (const label of labels) ghArgs.push('--label', label)
    const url = execFileSync('gh', ghArgs, { encoding: 'utf8' }).trim()
    createdCount++
    console.log(`created: ${url}  ${title}`)
  }

  const skipped = skippedCount ? ` ${skippedCount} existing issues skipped.` : ''
  console.log(
    create
      ? `\n${createdCount} issues created.${skipped}`
      : `\n${plannedCount} issues planned (dry run).${skipped} Re-run with --create.`
  )
}

const entry = process.argv[1]
if (entry && import.meta.url === pathToFileURL(path.resolve(entry)).href) main()
