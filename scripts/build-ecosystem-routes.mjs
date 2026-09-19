#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { ideaSlug } from '../app/lib/idea-routes.mjs'
import { parseCsv } from './csv.mjs'
import { snapshotDigest, validateEcosystemSnapshot } from './lib/ecosystem-snapshot.mjs'

const root = path.resolve(import.meta.dirname, '..')
const read = p => fs.readFileSync(path.join(root, p), 'utf8')
const data = validateEcosystemSnapshot(JSON.parse(read('data/ecosystem/public.json')))
const marker = JSON.parse(read('public/ecosystem-release.json'))
if (marker.releaseId !== data.releaseId || marker.digest !== snapshotDigest(data)) throw new Error('Public snapshot was edited outside the release exporter. Prepare it from local D1.')
const routes = [
  { route: 'startup-ideas', component: 'Ideas', en: ['Startup ideas for Bangladesh', 'Explore startup ideas for Bangladesh. Find who each idea helps, how it could work and a practical first step.'], bn: ['বাংলাদেশের জন্য স্টার্টআপ আইডিয়া', 'স্টার্টআপ আইডিয়া খুঁজুন। কাদের কাজে লাগবে, কীভাবে কাজ করবে ও কীভাবে শুরু করবেন, দেখুন।'] },
  { route: 'companies', component: 'Companies', en: ['Companies in Bangladesh’s startup ecosystem', 'Find startups and investors. See what they do and which problems they work on.'], bn: ['বাংলাদেশের স্টার্টআপ ও বিনিয়োগকারী', 'স্টার্টআপ ও বিনিয়োগকারীদের কাজ এবং সংশ্লিষ্ট সমস্যার তথ্য দেখুন।'] },
  { route: 'startup-ideas/add-company', component: 'ContributeConnection', en: ['Add a company working on a problem', 'Choose an existing company or suggest a new one. Add its work and a public source for review.'], bn: ['সমস্যা নিয়ে কাজ করা কোম্পানির তথ্য দিন', 'কোম্পানি বেছে নিন বা নতুন তথ্য দিন। প্রকাশের আগে পর্যালোচনা করা হবে।'] },
  { route: 'startup-ideas/review', component: 'ConnectionReview', en: ['Review submissions', 'Private review queue for Deshi Startup reviewers.'], bn: ['জমা দেওয়া তথ্য পর্যালোচনা', 'Deshi Startup-এর পর্যালোচকদের জন্য জমা দেওয়া তথ্য।'] },
  { route: 'startup-ideas/add', component: 'ContributeIdea', en: ['Add a startup idea', 'Share a startup idea for Bangladesh. Describe what you would build and who it would help.'], bn: ['স্টার্টআপ আইডিয়া দিন', 'বাংলাদেশের জন্য স্টার্টআপ আইডিয়া জানান। কী বানাতে চান আর কাদের কাজে লাগবে, লিখুন।'] },
  ...data.approaches.map(p => ({ route: `startup-ideas/${ideaSlug(p.id)}`, id: p.id, component: 'IdeaDetail', en: [p.en.title, p.en.summary], bn: [p.bn.title, p.bn.summary] })),
  ...data.organizations.map(o => ({ route: `companies/${o.slug}`, id: o.id, component: 'CompanyProfile', en: [`${o.en.name} company profile`, o.en.description], bn: [`${o.bn.name} সম্পর্কে`, o.bn.description] }))
]
if (new Set(routes.map(r => r.route)).size !== routes.length) throw new Error('Duplicate ecosystem route')
const generatedMark = '{/* Generated from the approved ecosystem snapshot by scripts/build-ecosystem-routes.mjs. */}'
for (const locale of ['en', 'bn']) {
  const content = path.join(root, 'app/(contents)', locale === 'en' ? 'en' : '(bn)')
  for (const r of routes) {
    const file = path.join(content, r.route, 'page.mdx')
    const relative = r.route.includes('/') ? '../../../../' : '../../../'
    const body = `---\ntitle: ${JSON.stringify(r[locale][0])}\ndescription: ${JSON.stringify(r[locale][1])}\n---\n\n${generatedMark}\n\nimport ${r.component} from '${relative}components/ideas/${r.component}'\n\n<${r.component} locale="${locale}"${r.id ? ` id="${r.id}"` : ''} />\n`
    fs.mkdirSync(path.dirname(file), { recursive: true })
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== body) fs.writeFileSync(file, body)
  }
  // Retire only generated wrappers. Authored content is never removed.
  for (const family of ['problems', 'startup-ideas', 'companies']) {
    const directory = path.join(content, family)
    if (!fs.existsSync(directory)) continue
    const candidates = [family, ...fs.readdirSync(directory, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => `${family}/${entry.name}`)]
    for (const route of candidates) {
      if (routes.some(r => r.route === route)) continue
      const file = path.join(content, route, 'page.mdx')
      if (fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes(generatedMark)) fs.unlinkSync(file)
      const folder = path.dirname(file)
      if (fs.readdirSync(folder).length === 0) fs.rmdirSync(folder)
    }
    if (fs.existsSync(directory) && fs.readdirSync(directory).length === 0) fs.rmdirSync(directory)
  }
}
// Reviewed slugs become permanent routes; the public registry retains older entries.
const backlogPath = path.join(root, 'plan/content-backlog.csv')
const backlog = fs.readFileSync(backlogPath, 'utf8')
const registered = new Set(parseCsv(backlog).slice(1).map(row => row[4]))
const csv = value => /[,"\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
const added = routes.filter(r => !registered.has(`/${r.route}`)).map(r => ['Resources', 'Startup ideas', r.bn[0], r.en[0], `/${r.route}`, 'Tool', 'Medium', 'Reviewed ecosystem record; static public snapshot.'].map(csv).join(','))
if (added.length) fs.writeFileSync(backlogPath, backlog.trimEnd() + '\n' + added.join('\n') + '\n')
console.log(`Ecosystem: ${routes.length * 2} bilingual routes from ${data.releaseId}.`)
