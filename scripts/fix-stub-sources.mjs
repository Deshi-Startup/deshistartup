#!/usr/bin/env node
/**
 * Replaces the old generic stub source triplet with topic-relevant sources.
 *
 * Default mode is a dry run:
 *   node scripts/fix-stub-sources.mjs
 *
 * Apply mode:
 *   node scripts/fix-stub-sources.mjs --apply
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const apply = process.argv.includes('--apply')

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
    } else if (ch !== '\r') {
      field += ch
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''))
}

function loadSources() {
  const rows = parseCsv(fs.readFileSync(path.join(root, 'plan', 'sources.csv'), 'utf8'))
  const header = rows[0]
  const byName = new Map()
  for (const row of rows.slice(1)) {
    const item = Object.fromEntries(header.map((h, i) => [h, (row[i] || '').trim()]))
    if (item.Source && item.URL) byName.set(item.Source, item)
  }
  return byName
}

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.name === 'page.mdx') out.push(full)
  }
  return out
}

function frontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const data = {}
  if (!match) return data
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, '')
  }
  return data
}

const sources = loadSources()
const pick = (...names) =>
  names
    .map((name) => sources.get(name))
    .filter(Boolean)
    .slice(0, 5)
    .map((source) => `- [${source.Source}](${source.URL})`)
    .join('\n')

const sourceSets = {
  legal: pick(
    'Office of the Registrar of Joint Stock Companies and Firms (RJSC)',
    'BanglaBiz Business Starter Package',
    'Bangladesh Investment Development Authority (BIDA)',
    'Dhaka North City Corporation',
    'Dhaka South City Corporation'
  ),
  tax: pick(
    'National Board of Revenue (NBR)',
    'VAT Online',
    'BanglaBiz Business Starter Package',
    'Office of the Registrar of Joint Stock Companies and Firms (RJSC)'
  ),
  payments: pick(
    'Bangladesh Bank',
    'GSMA',
    'BTRC',
    'e-CAB',
    'DataReportal Bangladesh'
  ),
  trade: pick(
    'Chief Controller of Imports and Exports',
    'Bangladesh Trade Portal',
    'Export Promotion Bureau',
    'BEZA',
    'BEPZA'
  ),
  labor: pick(
    'Department of Inspection for Factories and Establishments',
    'Bangladesh Bureau of Statistics',
    'DCCI',
    'FBCCI',
    'BSCIC'
  ),
  ip: pick(
    'Department of Patents, Designs and Trademarks',
    'Bangladesh Copyright Office',
    'BanglaBiz Business Starter Package',
    'Bangladesh Investment Development Authority (BIDA)'
  ),
  marketing: pick(
    'e-CAB',
    'DataReportal Bangladesh',
    'BTRC',
    'Future Startup',
    'The Daily Star Tech & Startup'
  ),
  funding: pick(
    'Startup Bangladesh Limited',
    'Bangladesh Angels Network',
    'Anchorless Bangladesh',
    'LightCastle Partners',
    'Bangladesh Bank'
  ),
  market: pick(
    'Bangladesh Bureau of Statistics',
    'World Bank / IFC / ADB',
    'DataReportal Bangladesh',
    'BTRC',
    'LightCastle Partners'
  ),
  sector: pick(
    'Department of Environment',
    'BSCIC',
    'BASIS',
    'e-CAB',
    'BTRC'
  ),
  startup: pick(
    'Future Startup',
    'The Daily Star Tech & Startup',
    'The Business Standard',
    'LightCastle Partners',
    'Bangladesh Angels Network'
  ),
  default: pick(
    'BanglaBiz Business Starter Package',
    'Bangladesh Investment Development Authority (BIDA)',
    'Future Startup',
    'LightCastle Partners'
  )
}

const RULES = [
  { key: 'trade', words: ['import', 'export', 'shipping', 'customs', 'freight', 'lc-', 'lcaf', 'erc', 'irc', 'hs-code', 'supplier', 'alibaba', 'saas-export', 'foreign-exchange'] },
  { key: 'payments', words: ['payment', 'bank', 'bkash', 'nagad', 'rocket', 'gateway', 'sslcommerz', 'aamarpay', 'cod', 'refund', 'subscription', 'cash-on-delivery'] },
  { key: 'tax', words: ['tax', 'vat', 'bin', 'tin', 'tds', 'vds', 'mushak', 'return', 'audit', 'accounts', 'bookkeeping', 'budget', 'nbr'] },
  { key: 'legal', words: ['company', 'rjsc', 'license', 'licence', 'registration', 'name-clearance', 'trade-license', 'bida', 'branch', 'liaison', 'representative-office', 'closing'] },
  { key: 'labor', words: ['hiring', 'employee', 'employment', 'labor', 'labour', 'salary', 'payroll', 'intern', 'freelancer', 'termination', 'gratuity', 'leave-policy', 'talent'] },
  { key: 'ip', words: ['trademark', 'patent', 'copyright', 'ip-', 'intellectual-property', 'design', 'assignment', 'nda'] },
  { key: 'funding', words: ['investor', 'funding', 'fundraise', 'angel', 'vc', 'valuation', 'term-sheet', 'cap-table', 'grant', 'startup-bangladesh', 'bangabandhu', 'loan', 'bootstrapping'] },
  { key: 'marketing', words: ['facebook', 'commerce', 'marketing', 'customer', 'sales', 'landing-page', 'seo', 'ad-', 'influencer', 'referral', 'community', 'marketplace', 'daraz', 'whatsapp', 'messenger'] },
  { key: 'sector', words: ['food', 'agritech', 'health', 'fintech', 'edtech', 'logistics', 'tourism', 'rmg', 'garment', 'factory', 'manufacturing', 'environment', 'btrc', 'dgda', 'bfsa', 'bsti', 'courier'] },
  { key: 'market', words: ['market', 'demographics', 'internet', 'datareportal', 'bbs', 'world-bank', 'research', 'competitor', 'city', 'rural', 'urban'] }
]

const genericBn = `## প্রাসঙ্গিক সূত্র\n\n- [Bangladesh Bank](https://www.bb.org.bd)\n- [NBR](https://nbr.gov.bd)\n- [RJSC](https://roc.gov.bd)`
const genericEn = `## Relevant Sources\n\n- [Bangladesh Bank](https://www.bb.org.bd)\n- [NBR](https://nbr.gov.bd)\n- [RJSC](https://roc.gov.bd)`

function chooseSet(file, source) {
  const fm = frontmatter(source)
  const haystack = `${path.relative(root, file)} ${fm.title || ''} ${fm.description || ''}`.toLowerCase()
  for (const rule of RULES) {
    if (rule.words.some((word) => haystack.includes(word))) return rule.key
  }
  return haystack.includes('startup') || haystack.includes('founder') ? 'startup' : 'default'
}

const pages = [
  ...walk(path.join(root, 'app', '(contents)', '(bn)')),
  ...walk(path.join(root, 'app', '(contents)', 'en'))
]

const changes = []
for (const file of pages) {
  const source = fs.readFileSync(file, 'utf8')
  if (!source.includes('<StubNotice')) continue
  const generic = source.includes(genericBn) ? genericBn : source.includes(genericEn) ? genericEn : null
  if (!generic) continue

  const key = chooseSet(file, source)
  const heading = generic.startsWith('## Relevant') ? '## Relevant Sources' : '## প্রাসঙ্গিক সূত্র'
  const replacement = `${heading}\n\n${sourceSets[key] || sourceSets.default}`
  changes.push({ file, key, next: source.replace(generic, replacement) })
}

console.log(`${apply ? 'Applying' : 'Dry run:'} ${changes.length} generic stub source lists`)
for (const change of changes.slice(0, 30)) {
  console.log(`${path.relative(root, change.file)} -> ${change.key}`)
}
if (changes.length > 30) console.log(`...and ${changes.length - 30} more`)

if (apply) {
  for (const change of changes) fs.writeFileSync(change.file, change.next)
}
