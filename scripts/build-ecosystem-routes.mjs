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
if (marker.releaseId !== data.releaseId || marker.digest !== snapshotDigest(data)) throw new Error('Public snapshot was edited outside the release exporter. Prepare it from D1.')
// Keep the API aligned with the shipped catalogue without bundling full briefs.
const voteIdsPath = path.join(root, 'app/generated/idea-ids.json')
const voteIds = JSON.stringify(data.approaches.map(idea => idea.id)) + '\n'
if (!fs.existsSync(voteIdsPath) || fs.readFileSync(voteIdsPath, 'utf8') !== voteIds) fs.writeFileSync(voteIdsPath, voteIds)
const profileDescription = text => text.length > 250 ? text.split(/(?<=[.!?।])\s+/)[0] : text
// Search metadata is separate from the short, reader-facing idea titles.
// Keep the business-idea intent clear: these pages do not sell the services.
const ideaSearchCopy = {
  'garment-offcuts-approach': {
    en: ['Garment Waste Recycling: A Startup Idea for Bangladesh', 'Explore a garment waste recycling business idea in Bangladesh. Connect factories with recyclers, plan how to earn, and test one small batch.'],
    bn: ['ঝুট কাপড় রিসাইক্লিং: বাংলাদেশে ব্যবসার আইডিয়া', 'কারখানার ঝুট কাপড় রিসাইক্লিং মিলে বিক্রির ব্যবসার আইডিয়া দেখুন। কাদের সঙ্গে কাজ করবেন, আয় কীভাবে হবে আর ছোট করে কীভাবে পরীক্ষা করবেন, জানুন।']
  },
  'harvest-cooling': {
    en: ['Cold Storage Rental: A Startup Idea for Bangladesh', 'Explore a cold storage rental business idea for farmers in Bangladesh. See who could pay, what to check, and how to test storage by the crate.'],
    bn: ['ফসলের জন্য হিমাগার ভাড়া: বাংলাদেশে ব্যবসার আইডিয়া', 'কৃষকদের ক্রেট হিসেবে হিমাগারের জায়গা ভাড়া দেওয়ার ব্যবসার আইডিয়া দেখুন। কারা টাকা দেবেন আর ছোট করে কীভাবে পরীক্ষা করবেন, জেনে নিন।']
  },
  'reliable-water': {
    en: ['Water Filter Maintenance: A Startup Idea for Bangladesh', 'Explore a water filter maintenance business idea for schools and clinics in Bangladesh. Plan regular checks, repairs, pricing, and a small first test.'],
    bn: ['পানির ফিল্টার মেরামত: বাংলাদেশে ব্যবসার আইডিয়া', 'স্কুল ও ক্লিনিকের পানির ফিল্টার পরীক্ষা ও মেরামতের ব্যবসার আইডিয়া দেখুন। নিয়মিত সার্ভিস, আয়ের উপায় আর শুরুতে কী পরীক্ষা করবেন, জানুন।']
  },
  'clinic-follow-up': {
    en: ['Patient Follow-Up Software: A Startup Idea for Bangladesh', 'Explore a patient follow-up software idea for small clinics in Bangladesh. Help staff arrange missed visits and test the idea before building an app.'],
    bn: ['ক্লিনিকের ফলোআপ সফটওয়্যার: স্টার্টআপ আইডিয়া', 'ছোট ক্লিনিকে রোগীদের ফলোআপে ডাকার সফটওয়্যার আইডিয়া দেখুন। অ্যাপ বানানোর আগে ক্লিনিকের কর্মীদের সঙ্গে কীভাবে পরীক্ষা করবেন, জেনে নিন।']
  },
  'cooler-workplaces': {
    en: ['Factory Cooling Services: A Startup Idea for Bangladesh', 'Explore a factory cooling business idea in Bangladesh. See who could pay for heat-reducing changes and how to test a small area before taking on more work.'],
    bn: ['কারখানার গরম কমানোর সার্ভিস: ব্যবসার আইডিয়া', 'বাংলাদেশে কারখানার গরম কমানোর ব্যবসার আইডিয়া দেখুন। কারা এই কাজের খরচ দেবেন আর ছোট একটি জায়গায় কীভাবে পরীক্ষা করবেন, জেনে নিন।']
  },
  'solar-upkeep': {
    en: ['Solar Panel Cleaning: A Startup Idea for Bangladesh', 'Explore a solar panel cleaning and maintenance business idea in Bangladesh. See who could pay, what trained technicians do, and how to test the service.'],
    bn: ['সোলার প্যানেল পরিষ্কার: বাংলাদেশে ব্যবসার আইডিয়া', 'ছাদের সোলার প্যানেল পরিষ্কার ও মেরামতের ব্যবসার আইডিয়া দেখুন। কাদের সার্ভিস দেবেন, আয় কীভাবে হবে আর ছোট করে কীভাবে পরীক্ষা করবেন, জানুন।']
  }
}
const routes = [
  { route: 'startup-ideas', component: 'Ideas', seo: { en: 'Startup and New Business Ideas in Bangladesh', bn: 'বাংলাদেশে স্টার্টআপ ও নতুন ব্যবসার আইডিয়া' }, en: ['Startup ideas for Bangladesh', 'Explore startup and new business ideas for Bangladesh. See who each idea helps, ways to earn, and a small test to try before you build.'], bn: ['বাংলাদেশের জন্য স্টার্টআপ আইডিয়া', 'বাংলাদেশের জন্য স্টার্টআপ আইডিয়া খুঁজে নিন। কাদের কাজে লাগবে, আয়ের উপায় কী আর ছোট করে কীভাবে পরীক্ষা করবেন, জেনে নিন।'] },
  { route: 'companies', component: 'Companies', en: ['Companies in Bangladesh’s startup ecosystem', 'Explore companies and investors in Bangladesh. Discover products, people, funding context, case studies and research sources.'], bn: ['বাংলাদেশের স্টার্টআপ ও বিনিয়োগকারী', 'বাংলাদেশের কোম্পানি ও বিনিয়োগকারীদের কাজ, প্রোডাক্ট, মানুষ, অর্থায়ন ও কেস স্টাডি সম্পর্কে জানুন।'] },
  { route: 'startup-ideas/add-company', component: 'ContributeConnection', en: ['Add a company working on a problem', 'Choose an existing company or suggest a new one. Add its work and a public source for review.'], bn: ['সমস্যা নিয়ে কাজ করা কোম্পানির তথ্য দিন', 'কোম্পানি বেছে নিন বা নতুন তথ্য দিন। প্রকাশের আগে যাচাই করা হবে।'] },
  { route: 'startup-ideas/review', component: 'ConnectionReview', en: ['Review submissions', 'Private review queue for Deshi Startup reviewers.'], bn: ['জমা দেওয়া তথ্য পর্যালোচনা', 'Deshi Startup-এর পর্যালোচকদের জন্য জমা দেওয়া তথ্য।'] },
  { route: 'startup-ideas/submissions', component: 'IdeaSubmissions', en: ['Your submitted ideas', 'View your private idea submissions and reviewer feedback.'], bn: ['আপনার জমা দেওয়া আইডিয়া', 'জমা দেওয়া আইডিয়ার অবস্থা ও পর্যালোচকের মন্তব্য দেখুন।'] },
  { route: 'startup-ideas/add', component: 'ContributeIdea', en: ['Add a startup idea', 'Share a startup idea for Bangladesh. Describe what you would build and who it would help.'], bn: ['স্টার্টআপ আইডিয়া দিন', 'বাংলাদেশের জন্য আপনার স্টার্টআপ আইডিয়া জানান। কী বানাতে চান আর কাদের কাজে লাগবে, লিখুন।'] },
  ...data.approaches.map(p => ({ route: `startup-ideas/${ideaSlug(p.id)}`, id: p.id, component: 'IdeaDetail', seo: { en: ideaSearchCopy[p.id]?.en[0], bn: ideaSearchCopy[p.id]?.bn[0] }, en: [p.en.title, ideaSearchCopy[p.id]?.en[1] || p.en.summary], bn: [p.bn.title, ideaSearchCopy[p.id]?.bn[1] || p.bn.summary] })),
  ...data.organizations.map(o => ({ route: `companies/${o.slug}`, id: o.id, component: 'CompanyProfile', en: [`${o.en.name} company profile`, profileDescription(o.en.description)], bn: [`${o.bn.name} সম্পর্কে`, profileDescription(o.bn.description)] }))
]
if (new Set(routes.map(r => r.route)).size !== routes.length) throw new Error('Duplicate ecosystem route')
const generatedMark = '{/* Generated from the approved ecosystem snapshot by scripts/build-ecosystem-routes.mjs. */}'
for (const locale of ['en', 'bn']) {
  const content = path.join(root, 'app/(contents)', locale === 'en' ? 'en' : '(bn)')
  for (const r of routes) {
    const file = path.join(content, r.route, 'page.mdx')
    const relative = r.route.includes('/') ? '../../../../' : '../../../'
    const body = `---\ntitle: ${JSON.stringify(r[locale][0])}\n${r.seo?.[locale] ? `seoTitle: ${JSON.stringify(r.seo[locale])}\n` : ''}description: ${JSON.stringify(r[locale][1])}\n---\n\n${generatedMark}\n\nimport ${r.component} from '${relative}components/ideas/${r.component}'\n\n<${r.component} locale="${locale}"${r.id ? ` id="${r.id}"` : ''} />\n`
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
