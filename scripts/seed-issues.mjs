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
 *   node scripts/seed-issues.mjs --create    # actually creates them via `gh`
 *   node scripts/seed-issues.mjs --skip-existing --create
 *
 * --skip-existing checks open issues once and skips topics already filed
 * (matched on the "গাইড লিখুন:" title), so re-running future waves is safe.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = 'Deshi-Startup/deshistartup'
const SITE = 'https://deshistartup.com'

const args = process.argv.slice(2)
const create = args.includes('--create')
const skipExisting = args.includes('--skip-existing')

// How many issues to seed per section (CSV order within each section).
const QUOTAS = {
  'Phase 1: Starting': 6,
  'Phase 3: Launching & Growing': 4,
  'Phase 2: Building': 3,
  'Case Studies': 3,
  'Phase 4: Ecosystem & Support': 2,
  'Founder Life': 2
}

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
      } else field += ch
    } else if (ch === '"') inQuotes = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (ch !== '\r') field += ch
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''))
}

const csvRows = parseCsv(fs.readFileSync(path.join(root, 'plan', 'content-backlog.csv'), 'utf8'))
const header = csvRows[0]
const backlog = csvRows.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])))

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'app', 'generated', 'manifest.bn.json'), 'utf8'))
const stubBySlug = new Map()
for (const section of Object.values(manifest.sections)) {
  for (const page of [section.index, ...section.children].filter(Boolean)) {
    if (page.stub) stubBySlug.set(page.slug, page)
  }
}

function stubSources(slug) {
  const file = path.join(root, 'app', '(contents)', '(bn)', slug, 'page.mdx')
  if (!fs.existsSync(file)) return []
  const source = fs.readFileSync(file, 'utf8')
  const links = [...source.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)]
  return links.slice(0, 6).map((m) => `- [${m[1]}](${m[2]})`)
}

// Editorial-planning rows (about the case-study category itself) are not writable
// guides — never seed them as contributor issues.
const META_TOPIC = /content category|case stud(y|ies)/i

const picked = []
const used = {}
for (const row of backlog) {
  const quota = QUOTAS[row.Section]
  if (!quota || row.Priority !== 'High') continue
  if (row.Section === 'Case Studies' && META_TOPIC.test(row['Topic (English)'])) continue
  if ((used[row.Section] || 0) >= quota) continue
  // The backlog's Path column is the canonical route registry (July 2026 migration).
  const slug = row.Path && stubBySlug.has(row.Path.replace(/^\//, '')) ? row.Path.replace(/^\//, '') : null
  if (!slug) continue
  used[row.Section] = (used[row.Section] || 0) + 1
  picked.push({ row, slug })
}

let existingTitles = new Set()
if (skipExisting) {
  const out = execFileSync('gh', ['issue', 'list', '--repo', REPO, '--state', 'open', '--limit', '200', '--json', 'title'], { encoding: 'utf8' })
  existingTitles = new Set(JSON.parse(out).map((i) => i.title))
}

const GOOD_FIRST = /template|checklist|script|worksheet|tracker|outline/i

let createdCount = 0
for (const { row, slug } of picked) {
  const bnTopic = row['Topic (Bangla)'].replace(/[।\s]+$/, '')
  const title = `গাইড লিখুন: ${bnTopic}`
  if (existingTitles.has(title)) continue

  const sources = stubSources(slug)
  const labels = ['নতুন গাইড', 'help wanted']
  if (GOOD_FIRST.test(row['Content type']) || GOOD_FIRST.test(row['Topic (English)'])) labels.push('good first issue')

  const body = [
    `**বিষয়:** ${row['Topic (Bangla)']} *(English: ${row['Topic (English)']})*`,
    `**সেকশন:** ${row.Section} · **অগ্রাধিকার:** High · **ধরন:** ${row['Content type'] || 'Guide'}`,
    `**স্টাব পাতা:** ${SITE}/${slug}`,
    '',
    row.Notes ? `**লেখার অ্যাঙ্গেল:** ${row.Notes}\n` : null,
    sources.length ? '### শুরু করার সূত্র\n\n' + sources.join('\n') + '\n' : null,
    '### কীভাবে লিখবেন',
    '',
    '1. এই ইস্যুতে **"আমি লিখছি"** মন্তব্য করুন – তাহলে আর কেউ একই বিষয়ে সময় দেবেন না।',
    `2. [স্টাব পাতাটি](${SITE}/${slug}) খুলে **"পাতাটি লিখুন"** বা **"সম্পাদনা"** লিংকে ক্লিক করুন – ব্রাউজারেই লেখা যায়। বিস্তারিত ধাপ: [CONTRIBUTING.md](https://github.com/${REPO}/blob/main/CONTRIBUTING.md)।`,
    '3. লেখার মান: [STYLE.md](https://github.com/' + REPO + '/blob/main/STYLE.md) (বাংলায় ভেবে বাংলায় লিখুন) আর [EDITORIAL.md](https://github.com/' + REPO + '/blob/main/EDITORIAL.md)। আইন/ফি/নিয়মের প্রতিটি দাবিতে সূত্র দিন, প্রতিটি সংখ্যায় সাল।',
    '4. পাতা পূর্ণাঙ্গ গাইড হলে শুরুর `<StubNotice ... />` লাইনটি মুছে PR দিন।',
    '',
    'ভাষা নিখুঁত না হলেও জমা দিন – রিভিউতে গুছিয়ে নেওয়া যাবে। প্রশ্ন থাকলে এখানেই করুন। **প্রথম জবাব ৪৮ ঘণ্টার মধ্যে।**'
  ].filter((line) => line !== null).join('\n')

  if (!create) {
    console.log(`--- [dry] ${title}`)
    console.log(`    slug: ${slug} · labels: ${labels.join(', ')}${sources.length ? ` · ${sources.length} sources` : ''}`)
    continue
  }

  const ghArgs = ['issue', 'create', '--repo', REPO, '--title', title, '--body', body]
  for (const label of labels) ghArgs.push('--label', label)
  const url = execFileSync('gh', ghArgs, { encoding: 'utf8' }).trim()
  createdCount++
  console.log(`created: ${url}  ${title}`)
}

console.log(create ? `\n${createdCount} issues created.` : `\n${picked.length} issues planned (dry run). Re-run with --create.`)
