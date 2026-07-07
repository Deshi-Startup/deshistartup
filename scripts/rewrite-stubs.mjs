#!/usr/bin/env node
/**
 * One-time migration: replaces auto-generated boilerplate stub pages
 * (which imitated real guides and leaked editorial metadata like
 * "অগ্রাধিকার: High") with honest Wikipedia-style stubs: a <StubNotice>
 * banner + the kept sources list. Skips any file whose body contains
 * sections beyond the known boilerplate, and reports what it skipped.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const LOCALES = [
  {
    key: 'bn',
    dir: path.join(root, 'app', '(contents)', '(bn)'),
    boilerplate: ['এই পৃষ্ঠার উদ্দেশ্য', 'মূল বিষয়', 'কীভাবে ব্যবহার করবেন'],
    sources: ['প্রাসঙ্গিক সূত্র'],
    sourcesHeading: 'প্রাসঙ্গিক সূত্র',
    description: (title) =>
      `${title} – বিষয়টি দেশি স্টার্টআপের তালিকায় আছে, কিন্তু গাইডটি এখনো লেখা হয়নি। আপনি লিখে সাহায্য করতে পারেন।`
  },
  {
    key: 'en',
    dir: path.join(root, 'app', '(contents)', 'en'),
    boilerplate: [
      'Purpose of this Page',
      'Purpose of This Page',
      'Key Points',
      'Key Topics',
      'Key Details',
      'Core Concepts',
      'Core Subject',
      'Core Subject Matter',
      'Core Topics',
      'Core Content',
      'Key Takeaways',
      'Key Concepts',
      'Key Information',
      'Usage Guide',
      'How to Use',
      'How to Use This Guide',
      'How to Use This Page'
    ],
    sources: ['Relevant Sources', 'Relevant Resources', 'Relevant References'],
    sourcesHeading: 'Relevant Sources',
    description: (title) =>
      `${title} – this topic is on the Deshi Startup list, but the guide has not been written yet. You can help write it.`
  }
]

function walk(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(full))
    else if (entry.name === 'page.mdx') files.push(full)
  }
  return files
}

let rewritten = 0
const skipped = []

for (const locale of LOCALES) {
  if (!fs.existsSync(locale.dir)) continue

  for (const file of walk(locale.dir)) {
    const source = fs.readFileSync(file, 'utf8')

    const fmMatch = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
    if (!fmMatch) continue
    const body = source.slice(fmMatch[0].length)

    // Split body into "## " sections; index 0 is the preamble (h1 + summary).
    const parts = body.split(/^## +/m)
    const sections = parts.slice(1).map((chunk) => {
      const nl = chunk.indexOf('\n')
      return {
        heading: (nl === -1 ? chunk : chunk.slice(0, nl)).trim().normalize('NFC'),
        content: nl === -1 ? '' : chunk.slice(nl + 1)
      }
    })

    if (sections.length === 0) continue

    // NFC-normalize known headings too: Bengali য়/ড়/ঢ় may be stored either
    // precomposed or as base char + nukta.
    const boilerplateSet = locale.boilerplate.map((h) => h.normalize('NFC'))
    const sourcesSet = locale.sources.map((h) => h.normalize('NFC'))

    const boilerplateCount = sections.filter((s) => boilerplateSet.includes(s.heading)).length
    const extraSections = sections.filter(
      (s) => !boilerplateSet.includes(s.heading) && !sourcesSet.includes(s.heading)
    )

    // Only rewrite unmistakable pure stubs.
    if (boilerplateCount < 2) continue
    if (extraSections.length > 0) {
      skipped.push(`${path.relative(root, file)} (extra: ${extraSections.map((s) => s.heading).join(', ')})`)
      continue
    }

    const titleLine = fmMatch[1].split(/\r?\n/).find((line) => line.startsWith('title:'))
    if (!titleLine) {
      skipped.push(`${path.relative(root, file)} (no title)`)
      continue
    }
    const title = titleLine
      .replace(/^title:\s*/, '')
      .trim()
      .replace(/^["']|["']$/g, '')

    const sourcesSection = sections.find((s) => sourcesSet.includes(s.heading))
    const sourcesBlock = sourcesSection ? sourcesSection.content.trim() : ''

    const relDir = path
      .relative(locale.dir, path.dirname(file))
      .split(path.sep)
      .join('/')

    const description = locale.description(title).replace(/"/g, '”')

    const next = `---
title: "${title}"
description: "${description}"
---

# ${title}

<StubNotice path="${relDir}" locale="${locale.key}" />
${sourcesBlock ? `\n## ${locale.sourcesHeading}\n\n${sourcesBlock}\n` : ''}`

    fs.writeFileSync(file, next)
    rewritten += 1
  }
}

console.log(`rewritten: ${rewritten}`)
if (skipped.length) {
  console.log(`skipped (${skipped.length}):`)
  for (const s of skipped) console.log('  -', s)
}
