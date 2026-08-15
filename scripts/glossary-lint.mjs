/**
 * Glossary data checks.
 *
 * `data/glossary.json` is the single source for three surfaces at once: the
 * A–Z page at /start-here/glossary, the inline <Term> popovers, and the term
 * ids that scripts/apply-terms.mjs writes into content. Nothing else in the
 * repository can notice when one locale of an entry is missing, when a "full
 * guide" link points at a stub, or when a renamed id silently orphans every
 * <Term name="..."> already committed in the content tree. This does.
 *
 * Usage: node scripts/glossary-lint.mjs
 *
 * Run after `npm run manifest`, because the guide checks read the generated
 * manifests to confirm a target exists and is written in both locales.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')

const GROUPS = new Set(['product', 'growth', 'commerce', 'money', 'funding', 'equity', 'paperwork'])
const BENGALI = /[ঀ-৿]/
const LOCALE_FIELDS = ['def', 'example', 'watchOut']

const errors = []
const warnings = []
const fail = (message) => errors.push(message)
const warn = (message) => warnings.push(message)

const glossary = JSON.parse(read('data/glossary.json'))
const ids = Object.keys(glossary)

// ---------------------------------------------------------------- route index

function routeIndex(locale) {
  const manifest = JSON.parse(read(`app/generated/manifest.${locale}.json`))
  const index = new Map()
  for (const section of Object.values(manifest.sections)) {
    if (section.index) index.set(section.index.route, section.index)
    for (const child of section.children || []) index.set(child.route, child)
  }
  return index
}

const routes = { bn: routeIndex('bn'), en: routeIndex('en') }

// -------------------------------------------------------------------- entries

for (const id of ids) {
  const entry = glossary[id]
  const at = `${id}`

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    fail(`${at}: id is not lowercase kebab-case, and it is the URL fragment readers link to`)
  }

  if (!entry.head || !entry.head.trim()) fail(`${at}: no headword`)
  if (!entry.bn || !BENGALI.test(entry.bn)) fail(`${at}: no Bangla gloss for the headword`)
  if (!GROUPS.has(entry.group)) fail(`${at}: unknown group "${entry.group}"`)

  // A headword that starts with a Bengali letter would sort outside the Latin
  // A–Z spine the page is built on, and the reader heard the English word.
  if (entry.head && !/^[A-Za-z0-9]/.test(entry.head)) {
    fail(`${at}: headword "${entry.head}" must start with the English term`)
  }

  for (const field of LOCALE_FIELDS) {
    const value = entry[field]
    if (field === 'def' && !value) {
      fail(`${at}: no definition`)
      continue
    }
    if (!value) continue
    for (const locale of ['bn', 'en']) {
      if (!value[locale] || !value[locale].trim()) {
        fail(`${at}: ${field} is missing its ${locale} text, so one edition would show a gap`)
      }
    }
    if (value.bn && !BENGALI.test(value.bn)) fail(`${at}: ${field}.bn holds no Bangla`)
  }

  for (const alias of entry.aka || []) {
    if (!alias.trim()) fail(`${at}: empty alias`)
    if (alias.toLowerCase() === entry.head.toLowerCase()) {
      warn(`${at}: alias "${alias}" repeats the headword`)
    }
  }

  for (const target of entry.see || []) {
    if (target === id) fail(`${at}: see-also points at itself`)
    else if (!glossary[target]) fail(`${at}: see-also "${target}" is not a term`)
  }

  if (entry.guide) {
    if (!entry.guide.startsWith('/') || entry.guide.startsWith('/en/')) {
      fail(`${at}: guide "${entry.guide}" must be a locale-neutral route`)
    } else {
      for (const locale of ['bn', 'en']) {
        const route = locale === 'en' ? `/en${entry.guide}` : entry.guide
        const page = routes[locale].get(route)
        if (!page) fail(`${at}: guide "${route}" does not exist`)
        else if (page.stub) {
          fail(`${at}: guide "${route}" is still a stub, and a promised full guide must be written`)
        }
      }
    }
  }

  if (entry.verified && !/^\d{4}-\d{2}-\d{2}$/.test(entry.verified)) {
    fail(`${at}: verified date "${entry.verified}" is not YYYY-MM-DD`)
  }
  if (entry.sourceUrl && !/^https?:\/\//.test(entry.sourceUrl)) {
    fail(`${at}: sourceUrl is not an absolute URL`)
  }

  for (const [field, value] of Object.entries(entry)) {
    const strings =
      typeof value === 'string' ? [value] : Array.isArray(value) ? value : Object.values(value || {})
    for (const text of strings) {
      if (typeof text !== 'string') continue
      // DESIGN.md bans the em dash in reader-facing copy; bangla-lint enforces
      // it under app/(contents)/ and this is the same copy by another route.
      if (text.includes('—')) fail(`${at}: em dash in ${field}, use an en dash, a comma or two sentences`)
      if (/\s{2,}/.test(text)) warn(`${at}: doubled space in ${field}`)
    }
  }

  // Bengali numerals in the Bangla edition, except inside a Latin token where
  // "B2B" and "Series A" are the correct spelling.
  for (const field of LOCALE_FIELDS) {
    const text = entry[field]?.bn
    if (!text) continue
    const stripped = text.replace(/[A-Za-z][A-Za-z0-9.-]*/g, '')
    if (/\d/.test(stripped)) {
      fail(`${at}: ${field}.bn uses Latin digits; the Bangla edition takes ০-৯`)
    }
  }
}

// ------------------------------------------------------------------ term tags

// apply-terms.mjs writes <Term name="..."> into content from these ids. Dropping
// or renaming one leaves committed pages pointing at a definition that no longer
// resolves, and the popover silently degrades to plain text.
const tagged = read('scripts/apply-terms.mjs')
  .split('const termVariants = {')[1]
  ?.split('\n};')[0]
const taggedIds = [...(tagged || '').matchAll(/^\s*"([a-z0-9-]+)":/gm)].map((m) => m[1])
for (const id of taggedIds) {
  if (!glossary[id]) {
    fail(`apply-terms.mjs tags "${id}", which no longer exists in data/glossary.json`)
  }
}

// --------------------------------------------------------------------- pages

for (const [locale, file] of [
  ['bn', 'app/(contents)/(bn)/start-here/glossary/page.mdx'],
  ['en', 'app/(contents)/en/start-here/glossary/page.mdx']
]) {
  const source = read(file)
  if (!source.includes(`<Glossary locale="${locale}" />`)) {
    fail(`${file}: does not render <Glossary locale="${locale}" />`)
  }
  if (/^##\s/m.test(source)) {
    fail(`${file}: an h2 here produces a one-item "on this page" list; the letter strip is the index`)
  }
}

// --------------------------------------------------------------------- report

for (const message of errors) console.log(`  ✖ ${message}`)
for (const message of warnings) console.log(`  ⚠ ${message}`)

const withGuide = ids.filter((id) => glossary[id].guide).length
const starters = ids.filter((id) => glossary[id].starter).length
console.log(
  `\nglossary-lint: ${ids.length} terms, ${withGuide} linked to a written guide, ` +
    `${starters} marked as starters — ${errors.length} errors, ${warnings.length} advisory.`
)

if (errors.length) process.exit(1)
