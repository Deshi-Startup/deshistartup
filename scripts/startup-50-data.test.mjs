import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'))
const data = readJson('data/startup-50.json')
const sourceTitles = readJson('data/startup-50-sources.json')
const logos = readJson('data/startup-50-logos.json')
const salaryLinks = readJson('data/startup-50-salary-links.json')
const media = readJson('app/generated/media.json')
const workerSource = fs.readFileSync(path.join(root, 'worker', 'index.ts'), 'utf8')
const wranglerConfig = fs.readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8')
const componentSource = fs.readFileSync(path.join(root, 'app', 'components', 'Startup50.tsx'), 'utf8')
const componentStyles = fs.readFileSync(path.join(root, 'app', 'components', 'Startup50.css'), 'utf8')
const filtersSource = fs.readFileSync(path.join(root, 'app', 'components', 'Startup50Filters.tsx'), 'utf8')

test('salary links are a reviewed, optional subset of the current roster', () => {
  assert.match(salaryLinks.reviewedAt, /^\d{4}-\d{2}-\d{2}$/)
  assert.equal(new Date(salaryLinks.reviewedAt).toISOString().slice(0, 10), salaryLinks.reviewedAt)
  const slugs = new Set(data.entries.map(entry => entry.slug))
  assert.equal(new Set(salaryLinks.entries.map(entry => entry.slug)).size, salaryLinks.entries.length)
  assert.equal(new Set(salaryLinks.entries.map(entry => entry.companySlug)).size, salaryLinks.entries.length)
  for (const profile of salaryLinks.entries) {
    assert.ok(slugs.has(profile.slug), 'Salary link is not on the roster: ' + profile.slug)
    assert.match(profile.companySlug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    assert.ok(profile.companyName.trim(), 'Missing reviewed company name: ' + profile.slug)
    assert.deepEqual(Object.keys(profile).sort(), ['companyName', 'companySlug', 'slug'])
  }
})

test('salary links stay in native details and use the current page language', () => {
  const details = componentSource.slice(componentSource.indexOf('<details className="startup50-details">'), componentSource.indexOf('</details>'))
  assert.match(details, /\{salaryProfile && \(/)
  assert.match(details, /https:\/\/www\.betonkemon\.com\/\$\{locale\}\/c\/\$\{salaryProfile\.companySlug\}/)
  assert.match(details, /className="startup50-salary__link"[\s\S]*?target="_blank"[\s\S]*?rel="noopener noreferrer"/)
  assert.match(details, /Explore salaries on Beton Kemon/)
  assert.match(details, /বেতন কেমন-এ বেতনের তথ্য দেখুন/)
  assert.match(details, /className="sr-only">\{isEn \? ' for ' \+ entry\.name/)
  assert.doesNotMatch(componentSource, /betonkemon\.com\/api\//)
})

test('the open state preserves responsive details padding and margins', () => {
  // A base [open] shorthand outranks the container rules, removing their
  // side and bottom padding. Open-state adjustments should stay top-only.
  for (const [, selectors, declarations] of componentStyles.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selectors.includes('.startup50-details[open]')) continue
    assert.doesNotMatch(declarations, /(?:^|;)\s*(?:padding|margin)\s*:/, selectors.trim())
  }
})

test('the watchlist has exactly fifty unique companies in alphabetical order', () => {
  assert.equal(data.entries.length, 50)
  assert.equal(new Set(data.entries.map((entry) => entry.slug)).size, 50)
  assert.equal(new Set(data.entries.map((entry) => entry.name)).size, 50)

  const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true })
  const names = data.entries.map((entry) => entry.sortName)
  assert.deepEqual(names, [...names].sort(collator.compare))
})

test('the activity window covers exactly the previous twelve months', () => {
  const lastResearched = new Date(`${data.lastResearched}T00:00:00Z`)
  const expectedStart = new Date(lastResearched)
  expectedStart.setUTCFullYear(expectedStart.getUTCFullYear() - 1)

  assert.equal(data.activityWindowStart, expectedStart.toISOString().slice(0, 10))
})

test('every company has useful bilingual details and a dated evidence item in the research window', () => {
  for (const entry of data.entries) {
    assert.match(entry.website, /^https:\/\//, entry.name + ' website')
    assert.match(entry.activity.url, /^https:\/\//, entry.name + ' latest update')
    assert.ok(entry.activity.date >= data.activityWindowStart, entry.name + ' update is too old')
    assert.ok(entry.activity.date <= data.lastResearched, entry.name + ' update is in the future')
    assert.match(entry.activity.date, /^\d{4}-\d{2}(?:-\d{2})?$/, entry.name + ' date precision')

    for (const field of ['sector', 'description', 'lesson', 'background', 'activity', 'financing']) {
      assert.ok(entry[field].en?.trim(), entry.name + ' ' + field + '.en')
      assert.ok(entry[field].bn?.trim(), entry.name + ' ' + field + '.bn')
    }

    assert.ok(Array.isArray(entry.background.sources), entry.name + ' background sources')
    assert.ok(entry.background.sources.length >= 1, entry.name + ' background source count')
    for (const source of entry.background.sources) {
      assert.match(source, /^https:\/\//, entry.name + ' background source')
    }
    for (const detail of [entry.activity, entry.financing]) {
      for (const source of detail.sources || []) {
        assert.match(source, /^https:\/\//, entry.name + ' detail source')
      }
    }

    assert.doesNotMatch(
      entry.background.en,
      /(?:Bangladesh-founded|Bangladesh-built|founded in Bangladesh|founded by (?:a )?Bangladesh(?:i)? team)/i,
      entry.name + ' still has a generic background'
    )
  }
})

test('every broad sector key has one clear bilingual filter label', () => {
  const usedKeys = [...new Set(data.entries.map((entry) => entry.sectorKey))].sort()
  assert.deepEqual(Object.keys(data.sectorGroups).sort(), usedKeys)

  for (const key of usedKeys) {
    assert.ok(data.sectorGroups[key].en?.trim(), key + ' sector group en')
    assert.ok(data.sectorGroups[key].bn?.trim(), key + ' sector group bn')
  }
})

test('DIGIBOX is identified as parcel-locker infrastructure', () => {
  const digibox = data.entries.find((entry) => entry.slug === 'digibox')
  assert.ok(digibox)
  assert.match(digibox.sector.en, /parcel-locker/i)
  assert.match(digibox.description.en, /parcel lockers/i)
  assert.doesNotMatch(digibox.description.en, /advertising|out-of-home|screens/i)
  assert.match(digibox.sector.bn, /পার্সেল লকার/)
  assert.match(digibox.description.bn, /পার্সেল লকার/)
  assert.doesNotMatch(
    [digibox.sector.bn, digibox.description.bn, digibox.lesson.bn].join(' '),
    /ডিজিটাল মিডিয়া|বিজ্ঞাপন|স্ক্রিন/
  )
})

test('Bangla fields do not contain known translation corruption', () => {
  const bangla = data.entries.flatMap((entry) => [
    entry.sector.bn,
    entry.description.bn,
    entry.lesson.bn,
    entry.background.bn,
    entry.activity.bn,
    entry.financing.bn
  ]).join('\n')

  assert.doesNotMatch(bangla, /[\u0B80-\u0BFF]/u, 'Tamil characters found in Bangla copy')
  assert.doesNotMatch(bangla, /—/, 'em dash found in Bangla copy')
  assert.doesNotMatch(bangla, /গোজায়ান|সক্রিয়-র/, 'known company-name corruption found')
})

test('company names link to their official websites without a duplicate details link', () => {
  assert.match(componentSource, /function displayDomain\(value: string\)/)
  assert.match(componentSource, /<a href=\{entry\.website\} target="_blank" rel="noopener noreferrer">\{entry\.name\}<\/a>/)
  assert.equal((componentSource.match(/href=\{entry\.website\}/g) || []).length, 1)
  assert.doesNotMatch(componentSource, /Visit the company website|কোম্পানির ওয়েবসাইট দেখুন/)

  for (const entry of data.entries) {
    const domain = new URL(entry.website).hostname.replace(/^www\./, '')
    assert.ok(domain.includes('.'), entry.name + ' root domain')
  }
})

test('search, empty results and accessible row controls match the interface copy', () => {
  assert.match(componentSource, /data-search=\{searchText\}/)
  assert.match(filtersSource, /entry\.dataset\.search/)
  assert.doesNotMatch(filtersSource, /entry\.textContent/)
  assert.match(filtersSource, /No startups match those filters/)
  assert.match(filtersSource, /এই খোঁজে কোনো স্টার্টআপ পাওয়া যায়নি/)
  assert.match(componentSource, /alt=\{entry\.name \+ ' logo'\}/)
  assert.match(componentSource, /aria-hidden="true"/)
  assert.match(componentSource, /className="sr-only"/)
  assert.match(componentSource, /See details for/)
})

test('the company data cannot silently become a ranking', () => {
  for (const entry of data.entries) {
    for (const prohibited of ['rank', 'score', 'position', 'valuation']) {
      assert.equal(Object.hasOwn(entry, prohibited), false, entry.name + ' has prohibited ' + prohibited)
    }
  }
})

test('every selected company has multiple labelled sources; editorial independence needs human review', () => {
  const used = new Set()
  for (const entry of data.entries) {
    const urls = [entry.background, entry.activity, entry.financing].flatMap((item) => item.sources?.length ? item.sources : [item.url])
    assert.ok(new Set(urls).size >= 2, entry.name + ' needs at least two public sources')
    for (const url of urls) {
      used.add(url)
      const title = sourceTitles[url]
      assert.ok(typeof title === 'string' && title.trim().length > 5, url + ' needs a readable title')
      assert.doesNotMatch(title, /Just a moment|Access Denied|searchclose|Forbidden/)
    }
  }
  assert.deepEqual(Object.keys(sourceTitles).sort(), [...used].sort(), 'remove unused source labels')
})

test('audited funding and activity corrections retain their qualifications', () => {
  const bySlug = new Map(data.entries.map((entry) => [entry.slug, entry]))
  assert.equal(bySlug.get('pulsetech').activity.date, '2026-08-05')
  assert.equal(bySlug.get('jatri').activity.date, '2026-01-16')
  assert.match(bySlug.get('jatri').financing.en, /\$5.25 million in cumulative funding/)
  assert.match(bySlug.get('aunkur').financing.en, /do not reconcile/)
  assert.match(bySlug.get('gozayaan').financing.en, /estimated.*\$4.6 million/)
  assert.match(bySlug.get('gozayaan').financing.en, /did not include company confirmation/)
  assert.match(bySlug.get('ifarmer').financing.en, /\$2.1 million.*Separately, \$1.5 million in working-capital/)
  assert.match(bySlug.get('sharetrip').financing.en, /second investment.*November 2023/)
  assert.match(bySlug.get('digibox').financing.en, /June 2026/)
  assert.match(bySlug.get('zatiq').activity.en, /confirms a product release, not the transaction totals/)
  assert.equal(bySlug.get('cassetex').activity.date, '2026-03')
  assert.doesNotMatch(JSON.stringify(data), /Investor-Dealbook_Feb-2025-low\.pdf/)
})

test('the refreshed selection includes the reviewed product businesses with five labelled sources each', () => {
  const bySlug = new Map(data.entries.map((entry) => [entry.slug, entry]))
  for (const slug of ['appscode', 'bongo', 'tipsoi', 'wedevs', 'wpdeveloper']) {
    const entry = bySlug.get(slug)
    assert.ok(entry, slug + ' is missing')
    const urls = [entry.background, entry.activity, entry.financing].flatMap((item) => item.sources?.length ? item.sources : [item.url])
    assert.ok(new Set(urls).size >= 5, slug + ' needs five reviewed source documents')
  }
  for (const slug of ['apploye', 'brain-craft', 'doctorkoi', 'nodes-digital', 'palki-motors', 'togumogu']) {
    assert.equal(bySlug.has(slug), false, slug + ' remains in the selection')
  }
  assert.match(bySlug.get('tipsoi').financing.en, /Accelerating Asia and Orbit Ventures/)
  assert.match(bySlug.get('tipsoi').financing.en, /not been independently confirmed/)
  assert.match(bySlug.get('appscode').background.en, /In April 2025.*100 commercial customers/)
  assert.match(bySlug.get('appscode').activity.en, /Red Hat OpenShift operator certification/)
  assert.match(bySlug.get('bongo').activity.en, /2026\/27 English Premier League.*Myco/)
  assert.equal(bySlug.get('bongo').sectorKey, 'entertainment')
  assert.match(bySlug.get('bongo').financing.en, /BDT 5 crore investment agreement.*August 2023/)
  assert.match(bySlug.get('nuport').financing.en, /separate \$250,000 investment from Iterative.*March 2023/)
  assert.match(bySlug.get('ostad').financing.en, /announced a BDT 1 crore investment deal/)
  assert.doesNotMatch(bySlug.get('ostad').financing.en, /received.*1 crore/)
  assert.match(bySlug.get('wedevs').activity.en, /30,000\+ active installations of its free plugin/)
  assert.match(bySlug.get('wpdeveloper').activity.en, /one million active installations of the free plugin/)
  assert.match(bySlug.get('wpdeveloper').background.en, /part of Startise/)
  assert.doesNotMatch(bySlug.get('wpdeveloper').financing.en, /acquisition|valuation/i)
})

test('the audited founder and funding corrections cannot regress', () => {
  const bySlug = new Map(data.entries.map((entry) => [entry.slug, entry]))

  assert.match(bySlug.get('ezycourse').background.en, /founder Md Sadek Hossain/)
  assert.doesNotMatch(bySlug.get('ezycourse').background.en, /Zakir Hossain/)
  assert.match(bySlug.get('aunkur').financing.en, /\$342,000/)
  assert.match(bySlug.get('barikoi').financing.en, /BDT 2 crore/)
  assert.match(bySlug.get('ostad').financing.en, /\$277,000/)
  assert.match(bySlug.get('priyoshop').financing.en, /\$5 million pre-Series A/)
  assert.match(bySlug.get('sharetrip').financing.en, /BDT 5 crore/)
  assert.match(bySlug.get('tallykhata').financing.en, /\$7 million/)
  assert.match(bySlug.get('wegro').financing.en, /\$100,000 in non-repayable matching funding/)

  assert.match(bySlug.get('agroshift').financing.en, /\$1.8 million pre-seed/)
  assert.match(bySlug.get('arogga').financing.en, /\$5.5 million seed/)
  assert.match(bySlug.get('loop-freight').financing.en, /\$600,000 in initial funding/)
  assert.match(bySlug.get('medeasy').financing.en, /about \$1.3 million/)
  assert.match(bySlug.get('nuport').financing.en, /\$125,000 from ODX Flexport/)
  assert.match(bySlug.get('hishabee').financing.en, /2022 Accelerating Asia investment/)
  assert.match(bySlug.get('shikho').financing.en, /total funding past \$8 million/)
  assert.match(bySlug.get('shopup-silq').financing.en, /both equity investment and a financing facility/)
})

test('every evidence category renders explicit source links', () => {
  assert.match(componentSource, /function SourceLinks/)
  assert.match(componentSource, /<SourceLinks urls=\{sourceUrls\(entry\.background\)\}/)
  assert.match(componentSource, /<SourceLinks urls=\{sourceUrls\(entry\.activity\)\}/)
  assert.match(componentSource, /<SourceLinks urls=\{sourceUrls\(entry\.financing\)\}/)
  assert.match(componentSource, /Recent public activity/)
  assert.doesNotMatch(componentSource, /Latest update|সর্বশেষ খবর/)
})

test('every company has one reviewed logo in the R2 media registry', () => {
  assert.match(logos.reviewedAt, /^\d{4}-\d{2}-\d{2}$/)
  assert.equal(logos.entries.length, 50)
  assert.equal(new Set(logos.entries.map((entry) => entry.slug)).size, 50)
  assert.equal(new Set(logos.entries.map((entry) => entry.src)).size, 50)

  const logoBySlug = new Map(logos.entries.map((entry) => [entry.slug, entry]))
  for (const company of data.entries) {
    const logo = logoBySlug.get(company.slug)
    assert.ok(logo, company.name + ' logo')
    assert.equal(logo.name, company.name)
    assert.match(logo.src, /^\/media\/startup-50\/[a-z0-9-]+\.webp$/)
    assert.match(logo.source, /^https?:\/\//)
    assert.ok(logo.sourceKind?.trim(), company.name + ' logo source kind')
    assert.equal(media[logo.src]?.remote, true, company.name + ' logo is not marked remote')
    assert.match(media[logo.src]?.key || '', /^startup-50\/.+\.[a-f0-9]{12}\.webp$/)
  }

  assert.equal(
    logoBySlug.get('airwork')?.source,
    'https://framerusercontent.com/images/fgjDgpjChrJQt0wUvMb3hLOvd9A.svg'
  )
  assert.equal(logoBySlug.get('airwork')?.sourceKind, 'official-site header logo')

  const licensed = logos.entries.filter((entry) => entry.license)
  for (const logo of licensed) {
    assert.ok(logo.credit?.trim(), logo.name + ' licensed logo credit')
  }
})

test('Bongo uses its official wordmark instead of the square app icon', () => {
  const logo = logos.entries.find(entry => entry.slug === 'bongo')
  assert.equal(logo.source, 'https://bongoholdings.com/images/logo-nav.png')
  assert.equal(logo.sourceKind, 'official company-site header wordmark')
  assert.ok(media[logo.src].w > media[logo.src].h * 2, 'Bongo should retain the wide wordmark proportions')
})

test('both language pages and the public suggestion form are present', () => {
  for (const relative of [
    'app/(contents)/(bn)/startup-50/page.mdx',
    'app/(contents)/en/startup-50/page.mdx',
    '.github/ISSUE_TEMPLATE/nominate-startup-50.yml'
  ]) {
    assert.equal(fs.existsSync(path.join(root, relative)), true, relative)
  }
})

test('the permanent shortcuts reach the Worker before Static Assets', () => {
  for (const route of ['/50', '/50/', '/en/50', '/en/50/']) {
    assert.ok(wranglerConfig.includes(JSON.stringify(route)), route + ' is missing from run_worker_first')
  }
  assert.match(workerSource, /startup50Alias/)
  assert.match(workerSource, /Response\.redirect\(destination\.toString\(\), 308\)/)
})
