import React from 'react'
import './Startup50.css'
import startup50Data from '../../data/startup-50.json'
import startup50Logos from '../../data/startup-50-logos.json'
import startup50SourceTitles from '../../data/startup-50-sources.json'
import { mediaSource } from '../lib/media'
import { REPO_URL } from '../nav.config'
import Startup50Filters from './Startup50Filters'

type Locale = 'bn' | 'en'

interface LocalText {
  bn: string
  en: string
}

interface DetailItem extends LocalText {
  url?: string
  sources?: string[]
}

interface BackgroundItem extends LocalText {
  sources: string[]
}

interface ActivityItem extends DetailItem {
  date: string
}

interface StartupEntry {
  slug: string
  name: string
  sortName: string
  monogram: string
  website: string
  sectorKey: string
  sector: LocalText
  description: LocalText
  lesson: LocalText
  background: BackgroundItem
  activity: ActivityItem
  financing: DetailItem
}

interface Startup50Data {
  edition: number
  lastResearched: string
  activityWindowStart: string
  sectorGroups: Record<string, LocalText>
  entries: StartupEntry[]
}

interface StartupLogo {
  slug: string
  name: string
  src: string
  source: string
  sourceKind: string
  license?: string
  credit?: string
}

interface StartupLogoData {
  reviewedAt: string
  entries: StartupLogo[]
}

const data = startup50Data as Startup50Data
const logos = startup50Logos as StartupLogoData
const sourceTitles: Record<string, string> = startup50SourceTitles
const logoBySlug = new Map(logos.entries.map((logo) => [logo.slug, logo]))

function assertData(value: Startup50Data) {
  if (value.entries.length !== 50) {
    throw new Error('The Deshi Startup 50 must contain exactly 50 entries; found ' + value.entries.length + '.')
  }

  const slugs = new Set<string>()
  const names = new Set<string>()
  const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true })

  value.entries.forEach((entry, index) => {
    if (slugs.has(entry.slug) || names.has(entry.name)) {
      throw new Error('Duplicate Startup 50 entry: ' + entry.name)
    }
    slugs.add(entry.slug)
    names.add(entry.name)

    if (index > 0 && collator.compare(value.entries[index - 1].sortName, entry.sortName) > 0) {
      throw new Error('Startup 50 entries are not alphabetical at ' + entry.name + '.')
    }
    if (entry.activity.date < value.activityWindowStart || entry.activity.date > value.lastResearched) {
      throw new Error('Activity date outside the research window for ' + entry.name + '.')
    }
    for (const url of [
      entry.website,
      entry.activity.url,
      entry.financing.url,
      ...entry.background.sources,
      ...(entry.activity.sources || []),
      ...(entry.financing.sources || [])
    ].filter(Boolean)) {
      if (!/^https:\/\//.test(url || '')) throw new Error('Non-HTTPS source for ' + entry.name + ': ' + url)
    }
    if (entry.background.sources.length === 0) {
      throw new Error('Missing background source for ' + entry.name + '.')
    }
    if (!value.sectorGroups[entry.sectorKey]) {
      throw new Error('Missing Startup 50 sector group for ' + entry.name + ': ' + entry.sectorKey)
    }
    for (const copy of [entry.sector, entry.description, entry.lesson, entry.background, entry.activity, entry.financing]) {
      if (!copy.en?.trim() || !copy.bn?.trim()) throw new Error('Missing bilingual field for ' + entry.name + '.')
    }

    const logo = logoBySlug.get(entry.slug)
    if (!logo || logo.name !== entry.name || !logo.src.startsWith('/media/startup-50/')) {
      throw new Error('Missing reviewed Startup 50 logo for ' + entry.name + '.')
    }
  })

  if (logos.entries.length !== value.entries.length || logoBySlug.size !== value.entries.length) {
    throw new Error('The Startup 50 logo manifest must contain one reviewed logo per company.')
  }
}

assertData(data)

function local(value: LocalText, locale: Locale) {
  return value[locale]
}

function formatDate(value: string, locale: Locale) {
  const monthOnly = value.length === 7
  return new Date(value + (monthOnly ? '-01' : '') + 'T00:00:00Z').toLocaleDateString(locale === 'en' ? 'en-GB' : 'bn-BD', {
    day: monthOnly ? undefined : 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

function displayDomain(value: string) {
  return new URL(value).hostname.replace(/^www\./, '')
}

function sourceUrls(value: DetailItem | BackgroundItem) {
  const fallback = 'url' in value && value.url ? [value.url] : []
  const urls = value.sources?.length ? value.sources : fallback
  return [...new Set(urls)]
}

function SourceLinks({ urls, locale }: { urls: string[]; locale: Locale }) {
  if (urls.length === 0) return null

  return (
    <span className="startup50-sources">
      <span>{locale === 'en' ? 'Sources' : 'সোর্স'}</span>
      {urls.map((url, index) => (
        <a key={url} href={url} title={sourceTitles[url]} target="_blank" rel="noopener noreferrer">
          {index + 1}. {displayDomain(url)}
        </a>
      ))}
    </span>
  )
}

function sectorOptions(value: Startup50Data, locale: Locale) {
  return Object.entries(value.sectorGroups).map(([key, label]) => ({
    key,
    label: local(label, locale)
  })).sort((a, b) =>
    a.label.localeCompare(b.label, locale === 'en' ? 'en' : 'bn-BD')
  )
}

interface Startup50Props {
  locale?: Locale
}

export default function Startup50({ locale = 'bn' }: Startup50Props) {
  const isEn = locale === 'en'
  const edition = isEn ? String(data.edition) : '২০২৬'
  const fifty = isEn ? '50' : '৫০'
  const suggestUrl = REPO_URL + '/issues/new?template=nominate-startup-50.yml'
  const correctionUrl = REPO_URL + '/issues/new?template=report-mistake.yml&title=' + encodeURIComponent(
    isEn ? '[Correction] Deshi Startup 50: ' : '[সংশোধন] দেশি স্টার্টআপ ৫০: '
  )
  const sectors = sectorOptions(data, locale)

  return (
    <div className="startup50" data-startup50-edition={data.edition}>
      <header className="startup50-hero">
        <div className="startup50-hero__folio" aria-hidden="true">
          <strong>{fifty}</strong>
        </div>
        <div className="startup50-hero__copy">
          <h1>{isEn ? 'The Deshi Startup 50' : 'দেশি স্টার্টআপ ৫০'}</h1>
          <p className="startup50-hero__promise">
            {isEn
              ? '50 Bangladeshi startups to watch in 2026.'
              : '২০২৬ সালে নজরে রাখার মতো ৫০টি বাংলাদেশি স্টার্টআপ।'}
          </p>
          <p className="startup50-hero__description">
            {isEn
              ? 'An unranked editorial watchlist of 50 startups built in Bangladesh. See what each company is building, why it matters and what founders can learn from it.'
              : 'বাংলাদেশ থেকে গড়ে ওঠা ৫০টি স্টার্টআপের তালিকা এটি। কোনো র‍্যাঙ্কিং নয়, বরং কোন কোম্পানি কী বানাচ্ছে, কেন কাজটি জরুরি আর অন্য ফাউন্ডারদের এখান থেকে কী শেখার আছে – দেখে নিন।'}
          </p>
          <nav className="startup50-hero__actions" aria-label={isEn ? 'Startup 50 actions' : 'স্টার্টআপ ৫০-এর কাজ'}>
            <a className="startup50-action startup50-action--primary" href="#the-50">
              {isEn ? 'Browse the 50' : '৫০টি দেখুন'}
            </a>
            <a className="startup50-action" href={suggestUrl} target="_blank" rel="noopener noreferrer">
              {isEn ? 'Suggest a startup' : 'স্টার্টআপের নাম দিন'}
            </a>
          </nav>
        </div>
      </header>

      <section className="startup50-register-section" id="the-50" aria-labelledby="startup50-register-title">
        <div className="startup50-register-heading">
          <div className="startup50-register-heading__rail">
            <h2 id="startup50-register-title">{edition} {isEn ? 'Edition' : 'সংস্করণ'}</h2>
            <p className="startup50-register-heading__updated">
              {isEn ? 'Last updated: ' + formatDate(data.lastResearched, locale) : 'সর্বশেষ আপডেট: ' + formatDate(data.lastResearched, locale)}
            </p>
          </div>
          <p>
            {isEn
              ? 'Search by name or sector. Open any company to see its background, recent public activity and funding evidence.'
              : 'নাম বা খাত লিখে খুঁজুন। কোনো কোম্পানির পেছনের গল্প, সাম্প্রতিক কাজ আর ফান্ডিংয়ের প্রমাণ দেখতে সেটি খুলুন।'}
          </p>
        </div>

        <Startup50Filters locale={locale} sectors={sectors} total={data.entries.length} />

        <ul className="startup50-register" id="startup-50-register">
          {data.entries.map((entry) => {
            const logo = logoBySlug.get(entry.slug) as StartupLogo
            const searchText = [
              entry.name,
              local(entry.sector, locale),
              local(data.sectorGroups[entry.sectorKey], locale)
            ].join(' ')
            return (
              <li key={entry.slug} data-startup-entry="" data-sector={entry.sectorKey} data-search={searchText}>
                <article className="startup50-entry" id={entry.slug}>
                  <div className="startup50-entry__mark">
                    <img
                      src={mediaSource(logo.src)}
                      alt={entry.name + ' logo'}
                      aria-hidden="true"
                      width="88"
                      height="52"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="startup50-entry__identity">
                    <h2 data-toc-ignore="">
                      <a href={entry.website} target="_blank" rel="noopener noreferrer">{entry.name}</a>
                    </h2>
                    <p>{local(entry.sector, locale)}</p>
                  </div>
                  <p className="startup50-entry__description">{local(entry.description, locale)}</p>
                  <div className="startup50-entry__lesson">
                    <span>{isEn ? 'What founders can learn' : 'ফাউন্ডারদের যা শেখার আছে'}</span>
                    <p>{local(entry.lesson, locale)}</p>
                  </div>
                  <details className="startup50-details">
                    <summary>
                      <span aria-hidden="true">{isEn ? 'See details' : 'আরও দেখুন'}</span>
                      <span className="sr-only">
                        {isEn ? 'See details for ' + entry.name : entry.name + ' নিয়ে বিস্তারিত দেখুন'}
                      </span>
                    </summary>
                    <dl>
                      <div>
                        <dt>{isEn ? 'Background' : 'পেছনের গল্প'}</dt>
                        <dd>
                          <span>{local(entry.background, locale)}</span>
                          <SourceLinks urls={sourceUrls(entry.background)} locale={locale} />
                        </dd>
                      </div>
                      <div>
                        <dt>{isEn ? 'Recent public activity' : 'সাম্প্রতিক কাজ'}</dt>
                        <dd>
                          <span>{local(entry.activity, locale)} ({formatDate(entry.activity.date, locale)})</span>
                          <SourceLinks urls={sourceUrls(entry.activity)} locale={locale} />
                        </dd>
                      </div>
                      <div>
                        <dt>{isEn ? 'Funding' : 'ফান্ডিং'}</dt>
                        <dd>
                          <span>{local(entry.financing, locale)}</span>
                          <SourceLinks urls={sourceUrls(entry.financing)} locale={locale} />
                        </dd>
                      </div>
                      <div>
                        <dt>{isEn ? 'Official website' : 'অফিশিয়াল ওয়েবসাইট'}</dt>
                        <dd>
                          <a href={entry.website} target="_blank" rel="noopener noreferrer">
                            {displayDomain(entry.website)}
                          </a>
                        </dd>
                      </div>
                    </dl>
                  </details>
                </article>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="startup50-methodology" id="method" aria-labelledby="startup50-method-title">
        <h2 id="startup50-method-title">{isEn ? 'How startups make the list' : 'কোন স্টার্টআপ তালিকায় আসে'}</h2>
        <p className="startup50-methodology__lede">
          {isEn
            ? 'This is an unranked editorial watchlist, not a scorecard. Every company must meet the requirements below. We use traction, recent growth, market reach and funding as editorial signals rather than a numeric score.'
            : 'এটি সম্পাদকীয় বাছাই, কোনো সংখ্যাভিত্তিক স্কোর বা র‍্যাঙ্কিং নয়। প্রতিটি কোম্পানিকেই নিচের শর্তগুলো পূরণ করতে হয়। ট্র্যাকশন (traction), সাম্প্রতিক গ্রোথ, মার্কেটে কাজের পরিসর আর ফান্ডিংকে আমরা সম্পাদকীয় সিদ্ধান্তের সূত্র হিসেবে দেখি, কোনো সংখ্যাভিত্তিক স্কোর হিসেবে নয়।'}
        </p>

        <div className="startup50-methodology__body">
          <section>
            <h3>{isEn ? 'What we look for' : 'আমরা যা দেখি'}</h3>
            <ul>
              <li>{isEn ? 'Founded in Bangladesh or primarily built and operated from Bangladesh' : 'বাংলাদেশে প্রতিষ্ঠিত, অথবা মূল ডেভেলপমেন্ট আর কার্যক্রম বাংলাদেশ থেকে পরিচালিত'}</li>
              <li>{isEn ? 'An active startup or private scaleup, not mainly an agency, consultancy or traditional service business' : 'চালু কোনো স্টার্টআপ বা প্রাইভেট স্কেলআপ। প্রধানত এজেন্সি, কনসালটেন্সি বা সাধারণ সেবাভিত্তিক ব্যবসা হলে হবে না'}</li>
              <li>{isEn ? 'A live product or platform with real customers or active deployments' : 'বাস্তব কাস্টমার বা অ্যাকটিভ ডিপ্লয়মেন্ট (deployment) আছে, এমন চালু প্রডাক্ট বা প্ল্যাটফর্ম'}</li>
              <li>{isEn ? 'Verifiable activity within the past 12 months' : 'গত ১২ মাসের ভেতর কাজ এগোনোর যাচাইযোগ্য প্রমাণ'}</li>
              <li>{isEn ? 'Clear evidence of traction, such as customers, users, revenue, transactions, contracts or meaningful partnerships' : 'ট্র্যাকশনের (traction) স্পষ্ট প্রমাণ: যেমন কাস্টমার, ইউজার, রেভিনিউ, ট্রানজ্যাকশন, চুক্তি বা বড় কোনো পার্টনারশিপ'}</li>
              <li>{isEn ? 'At least two reliable public sources, including one editorial or institutional source with no financial stake in the company' : 'অন্তত দুটি নির্ভরযোগ্য পাবলিক সোর্স। এর একটি এমন সম্পাদকীয় বা প্রাতিষ্ঠানিক সোর্স হতে হবে, যাদের কোম্পানিটিতে কোনো আর্থিক স্বার্থ নেই'}</li>
              <li>{isEn ? 'Company and investor claims are attributed. They do not count as independent confirmation' : 'কোম্পানি ও ইনভেস্টরের দাবি কার বক্তব্য, তা স্পষ্ট করে লেখা হয়। এগুলোকে স্বাধীন প্রমাণ হিসেবে ধরা হয় না'}</li>
            </ul>
            <p>{isEn ? 'Funding notes preserve older disclosed amounts when a newer transaction is undisclosed, and distinguish equity, grants and financing facilities when the sources allow it.' : 'নতুন কোনো বিনিয়োগের পরিমাণ গোপন থাকলে আগের প্রকাশিত অঙ্ক বাদ দেওয়া হয় না। সোর্সে তথ্য থাকলে ইকুইটি, গ্র্যান্ট আর অর্থায়ন সুবিধাও আলাদা করে লেখা হয়।'}</p>
            <p>{isEn ? 'Meeting these requirements does not guarantee a place on the list.' : 'এই শর্তগুলো পূরণ করলেই তালিকায় জায়গা নিশ্চিত হয় না।'}</p>
            <p>{isEn ? 'Evidence gap: DoctorKoi remains a provisional inclusion. Its profile records a website check, not a dated operating milestone within the past 12 months. That recent-activity criterion has not been confirmed.' : 'প্রমাণের ঘাটতি: DoctorKoi-কে আপাতত তালিকায় রাখা হয়েছে। প্রোফাইলে ওয়েবসাইট দেখে নেওয়ার কথা আছে, গত ১২ মাসে কাজ এগোনোর তারিখসহ প্রমাণ নেই। সাম্প্রতিক কাজের শর্তটি তাই এখনো নিশ্চিত করা যায়নি।'}</p>
          </section>
          <section>
            <h3>{isEn ? 'Keeping it current' : 'তালিকা যেভাবে আপডেট হয়'}</h3>
            <p>
              {isEn
                ? 'We review the list throughout the year. We aim to review it monthly and do so at least once a quarter. Startups may be added or removed as their work changes.'
                : 'আমরা সারা বছর ধরেই তালিকাটি রিভিউ করি। লক্ষ্য থাকে প্রতি মাসে করার, তবে অন্তত তিন মাসে একবার রিভিউ করা হয়ই। কাজ কীভাবে এগোচ্ছে, তার ওপর ভিত্তি করে স্টার্টআপ যোগ বা বাদ পড়তে পারে।'}
            </p>
            <p>{isEn ? 'A company cannot pay to be included.' : 'টাকা দিয়ে এই তালিকায় জায়গা কেনা যায় না।'}</p>
            <p>{isEn ? 'Company names and logos identify the companies. Inclusion does not imply endorsement or a commercial relationship.' : 'কোম্পানির নাম ও লোগো শুধু পরিচয় বোঝাতে ব্যবহার করা হয়েছে। তালিকায় থাকা মানেই দেশি স্টার্টআপের অনুমোদন বা কোনো বাণিজ্যিক সম্পর্ক নয়।'}</p>
          </section>
        </div>

        <div className="startup50-methodology__actions">
          <a className="startup50-action startup50-action--primary" href={suggestUrl} target="_blank" rel="noopener noreferrer">
            {isEn ? 'Suggest a startup' : 'স্টার্টআপের নাম দিন'}
          </a>
          <a className="startup50-action" href={correctionUrl} target="_blank" rel="noopener noreferrer">
            {isEn ? 'Report a mistake' : 'ভুল তথ্য জানান'}
          </a>
        </div>
      </section>
    </div>
  )
}
