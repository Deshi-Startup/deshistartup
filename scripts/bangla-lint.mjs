#!/usr/bin/env node
/**
 * bangla-lint.mjs — advisory linter for the Bangla style guide (STYLE.md).
 *
 * Scans Bengali content pages for the *mechanical* tells of translated Bangla:
 * banned calques, officialese, em dashes (hard), semicolons in Bangla prose, raw Latin-script English
 * words mid-sentence, stray Devanagari characters, English digits in Bangla prose,
 * formal suffixes (-সমূহ / -ীকরণ), self-description tics (চেষ্টা করি, "আপনার জন্য এর মানে" mold),
 * sentence-rhythm (over-long or drum-machine-uniform sentences),
 * and density of filler words (এবং / এটি / গুরুত্বপূর্ণ / -ভাবে / আপনার).
 *
 * IMPORTANT: this catches the *mechanical* tells only. A page can score zero here and still read
 * like translated English — the disease (English sentence architecture, non-idiomatic verbs, missing
 * discourse particles, wrong information order) is invisible to regex. The whole 454-page corpus
 * passed this linter while still sounding translated; that is exactly why the read-aloud test and a
 * native-reader pass by a person are the real gate, not this.
 *
 * Usage:
 *   node scripts/bangla-lint.mjs             # scan all bn pages
 *   node scripts/bangla-lint.mjs <file...>   # scan specific files
 *   node scripts/bangla-lint.mjs --strict    # exit 1 when hard findings exist
 *
 * The linter is advisory: it catches what a regex can catch. The read-aloud test
 * in STYLE.md catches the rest.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const fileArgs = args.filter((a) => !a.startsWith('--'))

const BN_ROOT = 'app/(contents)/(bn)'
const BANGLA = /[ঀ-৿]/

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

// Hard: banned calques and machine-translation artifacts.
const BANNED = [
  ['ব্যবসা-থেকে-ব্যবসা', 'বিটুবি (B2B) লিখুন'],
  ['ব্যবসা থেকে ব্যবসা', 'বিটুবি (B2B) লিখুন'],
  ['ক্রয়াদেশ', 'পারচেজ অর্ডার (PO) লিখুন'],
  ['নিশ্চিতকরণ', '"কনফার্ম করা" লিখুন'],
  ['গ্রাহক অর্জন', '"গ্রাহক পাওয়া/আনা" লিখুন'],
  ['শিক্ষিত কর', '"শেখানো/অভ্যস্ত করা" লিখুন'],
  ['পুনরাবৃত্তিযোগ্য', '"বারবার খাটানো যায় এমন" লিখুন'],
  ['যাইহোক', '"তবে" লিখুন'],
  ['অধিকন্তু', '"তাছাড়া/আর" লিখুন'],
  ['উপরন্তু', '"তাছাড়া/আর" লিখুন'],
  ['নিম্নলিখিত', '"নিচের" লিখুন'],
  ['করা হয়ে থাকে', 'সক্রিয় বাক্য লিখুন ("হয়")'],
  ['খোলা জ্ঞানভাণ্ডার', '"উন্মুক্ত জ্ঞানভাণ্ডার" লিখুন'],
  ['খোলা প্রজেক্ট', '"ওপেন-সোর্স প্রজেক্ট" লিখুন'],
]

// Soft: officialese that almost always wants the everyday word.
const OFFICIALESE = [
  ['প্রদান কর', 'দেওয়া'],
  ['সম্পন্ন কর', 'শেষ করা / সেরে ফেলা'],
  ['প্রয়োজন হবে', 'লাগবে'],
  ['ব্যতীত', 'ছাড়া'],
  ['অবহিত', 'জানানো'],
  ['বিদ্যমান', 'আছে / চালু'],
  ['অতিরিক্তভাবে', 'তাছাড়া / আর'],
  ['সুতরাং', 'তাই'],
  ['উক্ত ', 'ওই / সেই'],
  ['কথোপকথন', 'আলাপ / কথাবার্তা'],
  ['সক্ষম হবেন', 'পারবেন'],
  ['রয়েছে', 'আছে'],
  ['প্রেক্ষিতে', 'কারণে / দেখে'],
  ['প্রদর্শন', 'দেখানো'],
  ['সংশ্লিষ্ট', 'ওই / যে-সংক্রান্ত'],
  ['উল্লেখযোগ্য', 'চোখে পড়ার মতো / কম নয়'],
  ['যাচাইকরণ', 'যাচাই করা'],
  ['হালনাগাদকরণ', 'হালনাগাদ / আপডেট করা'],
]

// Soft: formal suffixes that usually want the everyday form. Regex, per line.
const SUFFIX = [
  [/[ঀ-৿]+সমূহ/, '-সমূহ', '"-গুলো" লিখুন'],
  [/[ঀ-৿]+ীকরণ/, '-ীকরণ', 'ক্রিয়ায় ভাঙুন: আধুনিকীকরণ→আধুনিক করা'],
]

// Latin-script tokens allowed inside Bangla prose.
const LATIN_ALLOW = new Set(
  [
    // metric/document acronyms & real-world spellings
    'MVP', 'SaaS', 'MRR', 'ARR', 'CAC', 'LTV', 'KPI', 'COD', 'B2B', 'B2C', 'PO', 'IP',
    'VAT', 'TIN', 'BIN', 'e-TIN', 'eTIN', 'e-BIN', 'NID', 'SME', 'FDI', 'NDA', 'ROI',
    'RJSC', 'NBR', 'BIDA', 'OSS', 'BASIS', 'BSCIC', 'BEZA', 'BEPZA', 'BTRC', 'DPDT',
    'DIFE', 'EPB', 'BFSA', 'DGDA', 'BSTI', 'DoE', 'e-CAB', 'eCAB', 'IT', 'ITES', 'ICT',
    'API', 'PDF', 'CSV', 'URL', 'QR', 'SSL', 'OTP', 'SEO', 'CEO', 'CTO', 'CFO', 'COO',
    'HR', 'PR', 'GB', 'MB', 'SMS', 'CRM', 'ERP', 'POS', 'GST', 'USD', 'BDT', 'EMI',
    'YC', 'VC', 'GP', 'LP', 'MoU', 'LC', 'IRC', 'ERC', 'CA', 'MFS', 'PSP', 'PSO',
    // brands and products commonly written in Latin
    'GitHub', 'Facebook', 'Messenger', 'WhatsApp', 'Google', 'Sheets', 'Excel', 'Docs',
    'YouTube', 'LinkedIn', 'Instagram', 'TikTok', 'Meta', 'Shopify', 'WooCommerce',
    'WordPress', 'Stripe', 'bKash', 'Nagad', 'Rocket', 'Upay', 'SSLCommerz', 'aamarPay',
    'ShurjoPay', 'PortWallet', 'Pathao', 'RedX', 'Steadfast', 'Paperfly', 'Daraz',
    'Chaldal', 'Startup', 'Bangladesh', 'Future', 'The', 'Business', 'Standard', 'Daily',
    'Star', 'Prothom', 'Alo', 'Tribune', 'LightCastle', 'Partners', 'Anchorless',
    'Techstars', 'BanglaBiz', 'Markdown', 'issue', 'Issue', 'fork', 'Submit', 'Propose',
    'Create', 'pull', 'request', 'new',
    // official body names & company suffixes legitimately written in Latin (§3.4 point 3)
    'Registrar', 'Joint', 'Stock', 'Companies', 'Firms', 'and', 'Ltd', 'Limited', 'com',
    'Canva', 'Wix', 'Framer', 'Notion', 'Trello', 'Slack', 'Zoom', 'Figma', 'Shikho',
    'Shorts', 'Shop', 'Grameenphone', 'Robi', 'Banglalink', 'Fashol', 'iFarmer',
  ].map((w) => w.toLowerCase()),
)

// Soft: coined collocations — near-idioms nobody says on the phone.
const COINED = [
  ['উত্তর সাজায়', '"তুলে ধরে" / "দেয়" লিখুন'],
  ['পর্যন্ত সাজায়', '"পর্যন্ত নিয়ে যাবে" লিখুন'],
  ['সাজিয়ে দেয়', 'অ্যাবস্ট্রাক্ট অর্থে হলে "নিয়ে যাবে" / "ধরে ধরে দেখাবে" লিখুন'],
  ['সেটা ধরে ব্যাখ্যা', '"সেটা বুঝিয়ে বলা" / "ভেঙে ব্যাখ্যা করা" লিখুন'],
]

// Density notices per page (soft)
const DENSITY = [
  [/এবং/g, 'এবং', 8, 'আর/ও ব্যবহার করুন বা বাক্য ভাঙুন'],
  [/এটি|এটা /g, 'এটি/এটা', 8, 'সর্বনাম ফেলে দিন যেখানে বোঝা যায়'],
  [/গুরুত্বপূর্ণ/g, 'গুরুত্বপূর্ণ', 2, 'জরুরি/দরকারি/কারণ বলুন'],
  [/[ঀ-৿]+ভাবে/g, '-ভাবে', 5, 'ক্রিয়া দিয়ে লিখুন'],
  [/ হলো /g, 'হলো', 6, '"X হলো Y" রিফ্লেক্স ভাঙুন'],
  [/মানে শুধু/g, 'মানে শুধু', 1, 'এক পাতায় একবারই – আর সারকথা-ওপেনার হিসেবে সাইটজুড়ে ছাঁচ বানাবেন না'],
  [/আপনার/g, 'আপনার', 12, 'ইংরেজি "your"-এর প্রতিধ্বনি – বেশির ভাগ ফেলে দিন'],
  [/চেষ্টা করি/g, 'চেষ্টা করি', 3, 'আত্ম-বর্ণনায় হেজ – অনুচ্ছেদে একবারই যথেষ্ট'],
  [/আপনার জন্য এর মানে/g, 'আপনার জন্য এর মানে', 1, 'ছাঁচ-বাক্য ঘুরিয়ে লিখুন (তাহলে দাঁড়াল / সোজা কথায় / মোদ্দা কথা…)'],
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectPages(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...collectPages(full))
    else if (entry === 'page.mdx') out.push(full)
  }
  return out
}

/** Strip regions where English/symbols are legitimate. */
/**
 * A component block in MDX is data, not prose: `value: 79` is a bar length and
 * `label`/`display` are prop names, so linting them as Bangla sentences only
 * produces noise. Keep the quoted strings that actually reach the reader.
 */
function jsxProse(line) {
  return [...line.matchAll(/"([^"]*)"/g)]
    .map((match) => match[1])
    .filter((text) => BANGLA.test(text))
    .join(' ')
}

function preprocess(source) {
  const lines = source.split('\n')
  const keep = []
  let inFrontmatter = false
  let inCode = false
  let inJsx = false
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    if (i === 0 && line.trim() === '---') { inFrontmatter = true; keep.push(''); continue }
    if (inFrontmatter) { if (line.trim() === '---') inFrontmatter = false; keep.push(''); continue }
    if (line.trim().startsWith('```')) { inCode = !inCode; keep.push(''); continue }
    if (inCode) { keep.push(''); continue }
    if (/^\s*(import|export)\s/.test(line)) { keep.push(''); continue }
    if (inJsx) {
      if (/\/>\s*$/.test(line)) inJsx = false
      keep.push(jsxProse(line))
      continue
    }
    if (/^\s*<[A-Z]/.test(line)) {
      inJsx = !/\/>\s*$/.test(line)
      keep.push(jsxProse(line))
      continue
    }
    if (/^\s*<[A-Za-z]/.test(line) && !BANGLA.test(line)) { keep.push(''); continue }
    line = line
      .replace(/`[^`]*`/g, ' ')             // inline code
      .replace(/\[\^[a-z0-9-]+\]:?/g, ' ')  // GFM footnote references and definition labels
      .replace(/[“"]([A-Za-z][A-Za-z0-9 .&/+()'-]{1,80})[”"]/g, ' ') // quoted official portal/form labels
      .replace(/\]\([^)]*\)/g, '](url)')     // link targets
      .replace(/https?:\/\/\S+/g, ' ')       // bare URLs
      .replace(/\(([A-Za-z][^)ঀ-৿]{0,40})\)/g, ' ') // (english gloss) after a term
    keep.push(line)
  }
  return keep
}

/**
 * Translationese often runs at one uniform medium-long sentence length;
 * billboard-Bangla runs at uniform short. Human Bangla breathes — varied length. We flag
 * over-long prose and drum-machine uniformity. Calibrated so the site's best pages
 * (unit-economics: mean≈12, sd≈6) stay clean while pages that run hot get a nudge.
 */
function sentenceRhythm(raw) {
  const out = []
  const lines = raw.split('\n')
  const kept = []
  let fm = false
  let code = false
  let jsx = false
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if (i === 0 && t === '---') { fm = true; continue }
    if (fm) { if (t === '---') fm = false; continue }
    if (t.startsWith('```')) { code = !code; continue }
    if (code || !t) continue
    // Component props are labels, not sentences — they have no rhythm to judge.
    if (jsx) { if (/\/>$/.test(t)) jsx = false; continue }
    if (/^<[A-Z]/.test(t)) { jsx = !/\/>$/.test(t); continue }
    if (t.startsWith('#') || t.startsWith('|') || /^[-*]\s/.test(t) || /^\d+[.)]\s/.test(t)) continue
    if (/^(import|export)\s/.test(t)) continue
    if (/^<[A-Za-z]/.test(t) && !BANGLA.test(t)) continue
    const clean = t
      .replace(/^>+\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/`[^`]*`/g, ' ')
      .replace(/\[\^[a-z0-9-]+\]:?/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    if (BANGLA.test(clean)) kept.push(clean)
  }
  const sents = kept
    .join(' ')
    .split(/[।?]/)
    .map((s) => s.trim())
    .filter((s) => BANGLA.test(s) && s.split(/\s+/).filter(Boolean).length > 1)
  if (sents.length < 12) return out // too little prose to judge rhythm
  const lens = sents.map((s) => s.split(/\s+/).filter(Boolean).length)
  const mean = lens.reduce((a, b) => a + b, 0) / lens.length
  const sd = Math.sqrt(lens.map((x) => (x - mean) ** 2).reduce((a, b) => a + b, 0) / lens.length)
  const veryLong = lens.filter((x) => x > 26).length
  const long = lens.filter((x) => x > 22).length
  if (mean > 18) out.push([0, `বাক্য গড়ে ${mean.toFixed(0)} শব্দ (লক্ষ্য ~১২-১৫) — বড় বাক্য ভাঙুন`])
  if (veryLong >= 3) out.push([0, `২৬+ শব্দের বাক্য ${veryLong}টি — জোরে পড়লে শ্বাস আটকায়, ভাঙুন`])
  else if (long >= 10) out.push([0, `২২+ শব্দের বাক্য ${long}টি — কিছু ভাঙলে লেখা শ্বাস নেবে`])
  if (sd < 3.5 && mean < 10)
    out.push([0, `বাক্যের দৈর্ঘ্যে বৈচিত্র্য কম (sd≈${sd.toFixed(1)}) — একটানা খাটো বাক্য বিজ্ঞাপনী ড্রামের মতো`])
  return out
}

function lintFile(file) {
  const raw = readFileSync(file, 'utf8')
  const lines = preprocess(raw)
  const hard = []
  const soft = []

  // Em dash is banned in all content, both locales — checked on the raw file so
  // Frontmatter titles and descriptions are covered too.
  raw.split('\n').forEach((l, i) => {
    if (l.includes('—')) hard.push([i + 1, 'এম-ড্যাশ (—) নিষিদ্ধ — স্পেসসহ এন-ড্যাশ ( – ), কমা বা দুই বাক্য'])
  })

  lines.forEach((line, idx) => {
    if (!line) return
    const no = idx + 1
    const hasBangla = BANGLA.test(line)

    // Devanagari contamination — always hard, anywhere.
    // NB: দাঁড়ি (। U+0964) and ॥ live in the Devanagari block but are correct Bangla — excluded.
    const dev = line.match(/[ऀ-ॣ०-ॿ]+/)
    if (dev) hard.push([no, `দেবনাগরী অক্ষর "${dev[0]}" — MT artifact, ঠিক করুন`])

    if (!hasBangla) return

    for (const [needle, fix] of BANNED) {
      if (line.includes(needle)) hard.push([no, `"${needle}" — ${fix}`])
    }
    for (const [needle, fix] of OFFICIALESE) {
      if (line.includes(needle)) soft.push([no, `"${needle.trim()}" → ${fix}`])
    }
    for (const [needle, fix] of COINED) {
      if (line.includes(needle)) soft.push([no, `"${needle}" – বানানো কোলোকেশন, ফোন-টেস্টে ফেল → ${fix}`])
    }
    for (const [re, label, fix] of SUFFIX) {
      const m = line.match(re)
      if (m) soft.push([no, `"${m[0]}" (${label}) → ${fix}`])
    }

    // semicolon inside Bangla prose
    if (line.includes(';')) soft.push([no, 'বাংলা বাক্যে সেমিকোলন — দুই বাক্যে ভাঙুন'])

    // English digits in Bangla prose (dates in frontmatter/links already stripped)
    const digits = line.match(/[ঀ-৿][^\n]*?\b(\d[\d,.]*)\b/)
    if (digits) soft.push([no, `ইংরেজি সংখ্যা "${digits[1]}" বাংলা প্রসে — বাংলা সংখ্যা লিখুন (§4.4)`])

    // lowercase Latin words sandwiched in Bangla text
    if (/[ঀ-৿]/.test(line)) {
      for (const m of line.matchAll(/\b([A-Za-z][A-Za-z-]{2,})\b/g)) {
        const word = m[1]
        if (/^[A-Z0-9-]+$/.test(word)) continue // all-caps acronym
        if ((word.match(/[A-Z]/g) || []).length >= 2) continue // MoA, AoA, WooCommerce…
        if (LATIN_ALLOW.has(word.toLowerCase())) continue
        const at = m.index ?? 0
        const before = line.slice(0, at)
        const after = line.slice(at + word.length)
        if (BANGLA.test(before) && BANGLA.test(after)) {
          soft.push([no, `বাংলা বাক্যের মাঝে ইংরেজি শব্দ "${word}" — বাংলা হরফে লিখুন (§3.4)`])
        }
      }
    }
  })

  // Density notices over the whole page
  const prose = lines.join('\n')
  for (const [re, label, max, fix] of DENSITY) {
    const count = (prose.match(re) || []).length
    if (count > max) soft.push([0, `"${label}" ${count} বার (সীমা ~${max}) — ${fix}`])
  }
  const kintu = (prose.match(/কিন্তু/g) || []).length
  const tobe = (prose.match(/তবে/g) || []).length
  if (kintu >= 8 && tobe === 0) soft.push([0, `কিন্তু ${kintu} বার, তবে ০ বার — বৈচিত্র্য আনুন (§2.8)`])

  // Rhythm only makes sense on flowing prose pages, not on files of concatenated UI strings.
  if (file.endsWith('.mdx')) for (const finding of sentenceRhythm(raw)) soft.push(finding)

  return { hard, soft }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

// Bangla UI copy that lives outside app/(contents)/ — the homepage strings escaped every
// sweep until reader feedback caught billboard-style Bangla there.
const EXTRA_BN_SOURCES = [
  'app/components/WikiLanding.tsx',
  'app/nav.config.ts',
  // The glossary moved out of prose and into structured data, and its Bangla
  // definitions are the same reader-facing copy they were as MDX bullets.
  'data/glossary.json',
  'app/components/Glossary.tsx',
  'app/components/GlossaryControls.tsx',
]

const targets = fileArgs.length
  ? fileArgs
  : [...collectPages(BN_ROOT), ...EXTRA_BN_SOURCES.filter((f) => existsSync(f))]
let hardTotal = 0
let softTotal = 0
let flaggedFiles = 0

for (const file of targets) {
  const { hard, soft } = lintFile(file)
  if (!hard.length && !soft.length) continue
  flaggedFiles++
  hardTotal += hard.length
  softTotal += soft.length
  console.log(`\n${file}`)
  for (const [no, msg] of hard) console.log(`  ✖ ${no ? `L${no}: ` : ''}${msg}`)
  for (const [no, msg] of soft) console.log(`  ⚠ ${no ? `L${no}: ` : ''}${msg}`)
}

console.log(
  `\nbangla-lint: ${targets.length} pages scanned, ${flaggedFiles} flagged — ` +
    `${hardTotal} hard, ${softTotal} advisory.`,
)
console.log(
  'A clean pass means the MECHANICAL tells are gone — not that the Bangla reads natural. Architecture-level\n' +
    'translationese is invisible to regex. Before publishing, run the read-aloud test in STYLE.md and have\n' +
    'a native reader go through the page sentence by sentence.',
)

if (strict && hardTotal > 0) process.exit(1)
