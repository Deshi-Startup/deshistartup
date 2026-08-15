import React from 'react'
import glossaryData from '../../data/glossary.json'
import contentIndex from '../generated/content-index.json'
import GlossaryControls from './GlossaryControls'

type Locale = 'bn' | 'en'

interface LocalText {
  bn: string
  en: string
}

export interface GlossaryEntry {
  /** Headword. Always the English term, in both editions: it is the word a
   *  founder actually hears in the meeting, and it is what they will look up. */
  head: string
  /** Bangla pronunciation gloss, shown under the headword in the Bangla edition. */
  bn: string
  expansion?: string
  aka?: string[]
  group: string
  starter?: boolean
  def: LocalText
  example?: LocalText
  watchOut?: LocalText
  /** Locale-neutral route of the guide that owns this concept. */
  guide?: string
  see?: string[]
  sourceUrl?: string
  verified?: string
}

const glossary = glossaryData as unknown as Record<string, GlossaryEntry>

const bengaliDigits = (value: number | string) =>
  String(value).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])

export const GLOSSARY_GROUPS: { key: string; label: LocalText }[] = [
  { key: 'product', label: { bn: 'আইডিয়া ও প্রোডাক্ট', en: 'Idea and product' } },
  { key: 'growth', label: { bn: 'কাস্টমার ও গ্রোথ', en: 'Customers and growth' } },
  { key: 'commerce', label: { bn: 'ই-কমার্স ও মার্কেটপ্লেস', en: 'E-commerce and marketplace' } },
  { key: 'money', label: { bn: 'টাকার হিসাব', en: 'Money maths' } },
  { key: 'funding', label: { bn: 'ফান্ডিং ও ইনভেস্টর', en: 'Funding and investors' } },
  { key: 'equity', label: { bn: 'ইকুইটি ও মালিকানা', en: 'Equity and ownership' } },
  { key: 'paperwork', label: { bn: 'রেজিস্ট্রেশন ও কাগজপত্র', en: 'Registration and paperwork' } }
]

const LABELS: Record<Locale, Record<string, string>> = {
  bn: {
    starterTitle: 'শুরুতে এই ১০টি শব্দ জেনে নিন',
    starterNote: 'পুরো তালিকা মুখস্থ করে ফেলার কোনো দরকার নেই। আগে শুধু এই কয়টা শব্দ বুঝে নিন, বাকিগুলো আপনার কাজের দরকারের সময় এমনিতেই শিখে যাবেন।',
    jump: 'অক্ষর ধরে যান',
    index: 'সূচি',
    example: 'উদাহরণ',
    watchOut: 'যেখানে ভুল হয়',
    guide: 'পুরো গাইড',
    see: 'আরও দেখুন',
    source: 'সরকারি উৎস',
    verified: 'যাচাই',
    xref: 'দেখুন'
  },
  en: {
    starterTitle: 'Start by learning these 10 terms',
    starterNote: 'There is absolutely no need to memorize the whole list. Just understand these core terms first, and pick up the rest naturally as you need them.',
    jump: 'Jump to a letter',
    index: 'Index',
    example: 'Example',
    watchOut: 'Watch out',
    guide: 'Full guide',
    see: 'See also',
    source: 'Official source',
    verified: 'Verified',
    xref: 'see'
  }
}

/** Flat route -> title map for every page the manifest knows about, so a guide
 *  link never carries a hand-copied title that can drift from the real one. */
function buildRouteTitles(locale: Locale): Map<string, string> {
  const map = new Map<string, string>()
  const sections = (contentIndex as any)[locale].sections as Record<string, any>
  for (const section of Object.values(sections)) {
    const [, , , index, groups] = section
    if (index) map.set(index[0], index[1])
    for (const [, items] of groups || []) {
      for (const [route, title] of items) map.set(route, title)
    }
  }
  return map
}

/** Titles are written to carry the whole promise of the page. As a link label
 *  beside a one-line definition, the part before the colon is the name of the
 *  thing and the rest is the subtitle, so the name is what gets shown. */
function shortTitle(title: string): string {
  const colon = title.indexOf(':')
  if (colon >= 6) return title.slice(0, colon)
  return title
}

/** Latin sort key: "e-TIN" files under E, "B2B / B2C" under B. */
function sortKey(head: string): string {
  return head.toLowerCase().replace(/[^a-z0-9ঀ-৿]+/g, '')
}

function letterOf(head: string): string {
  const match = head.match(/[A-Za-z]/)
  return match ? match[0].toUpperCase() : '#'
}

function normalise(value: string): string {
  return value
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^a-z0-9ঀ-৿]+/g, ' ')
    .trim()
}

interface Row {
  kind: 'entry' | 'xref'
  id: string
  head: string
  letter: string
  key: string
  group: string
  find: string
  /** xref only */
  targetId?: string
  targetHead?: string
}

function buildRows(locale: Locale): Row[] {
  const rows: Row[] = []

  for (const [id, entry] of Object.entries(glossary)) {
    const findParts = [
      entry.head,
      entry.bn,
      entry.expansion || '',
      ...(entry.aka || []),
      entry.def[locale]
    ]
    rows.push({
      kind: 'entry',
      id,
      head: entry.head,
      letter: letterOf(entry.head),
      key: sortKey(entry.head),
      group: entry.group,
      find: normalise(findParts.join(' '))
    })

    // A reader hunting "SAFE" should not have to know it is filed under
    // "SAFE / convertible note", and "TIN" should not hide inside "e-TIN".
    // Aliases that sort to a different letter get a one-line cross-reference
    // there, the way a printed dictionary does it.
    for (const alias of entry.aka || []) {
      if (!/^[A-Za-z]/.test(alias)) continue
      const aliasLetter = letterOf(alias)
      if (aliasLetter === letterOf(entry.head)) continue
      rows.push({
        kind: 'xref',
        id: `${id}--${sortKey(alias)}`,
        head: alias,
        letter: aliasLetter,
        key: sortKey(alias),
        group: entry.group,
        find: normalise(`${alias} ${entry.head}`),
        targetId: id,
        targetHead: entry.head
      })
    }
  }

  return rows.sort((a, b) => a.key.localeCompare(b.key, 'en'))
}

interface GlossaryProps {
  locale?: Locale
}

export default function Glossary({ locale = 'bn' }: GlossaryProps) {
  const isEn = locale === 'en'
  const labels = LABELS[locale]
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const routeTitles = buildRouteTitles(locale)
  const href = (route: string) => `${basePath}${isEn ? `/en${route}` : route}`

  const rows = buildRows(locale)
  const entryCount = rows.filter((row) => row.kind === 'entry').length
  const groupLabel = new Map(GLOSSARY_GROUPS.map((g) => [g.key, g.label[locale]]))

  const letters: string[] = []
  const byLetter = new Map<string, Row[]>()
  for (const row of rows) {
    if (!byLetter.has(row.letter)) {
      byLetter.set(row.letter, [])
      letters.push(row.letter)
    }
    byLetter.get(row.letter)!.push(row)
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const starters = Object.entries(glossary).filter(([, entry]) => entry.starter)

  const renderEntry = (row: Row) => {
    const entry = glossary[row.id]
    const guideTitle = entry.guide ? routeTitles.get(isEn ? `/en${entry.guide}` : entry.guide) : undefined
    const seeAlso = (entry.see || []).filter((id) => glossary[id])

    return (
      <div
        className="glossary-entry"
        id={row.id}
        key={row.id}
        data-group={row.group}
        data-find={row.find}
      >
        <dt className="glossary-entry__term">
          <span className="glossary-entry__head">{entry.head}</span>
          {entry.expansion && (
            <span className="glossary-entry__expansion">{entry.expansion}</span>
          )}
          {!isEn && <span className="glossary-entry__gloss">{entry.bn}</span>}
          <span className="glossary-entry__group">{groupLabel.get(entry.group)}</span>
        </dt>
        <dd className="glossary-entry__body">
          <p className="glossary-entry__def">{entry.def[locale]}</p>
          {entry.example && (
            <p className="glossary-entry__note">
              <span className="glossary-entry__label">{labels.example}</span>
              {entry.example[locale]}
            </p>
          )}
          {entry.watchOut && (
            <p className="glossary-entry__note glossary-entry__note--warn">
              <span className="glossary-entry__label">{labels.watchOut}</span>
              {entry.watchOut[locale]}
            </p>
          )}
          {(guideTitle || seeAlso.length > 0) && (
            <p className="glossary-entry__links">
              {guideTitle && (
                <a className="glossary-entry__guide" href={href(entry.guide!)}>
                  {labels.guide}: {shortTitle(guideTitle)}
                </a>
              )}
              {seeAlso.length > 0 && (
                <span className="glossary-entry__see">
                  <span className="glossary-entry__label">{labels.see}</span>
                  {seeAlso.map((id, i) => (
                    <React.Fragment key={id}>
                      {i > 0 && <span aria-hidden="true"> · </span>}
                      <a href={`#${id}`}>{glossary[id].head}</a>
                    </React.Fragment>
                  ))}
                </span>
              )}
            </p>
          )}
          {(entry.sourceUrl || entry.verified) && (
            <p className="glossary-entry__source">
              {entry.sourceUrl && (
                <a href={entry.sourceUrl} target="_blank" rel="noreferrer">
                  {labels.source}
                </a>
              )}
              {entry.sourceUrl && entry.verified && <span aria-hidden="true"> · </span>}
              {entry.verified && (
                <span>
                  {labels.verified}: {isEn ? entry.verified : bengaliDigits(entry.verified)}
                </span>
              )}
            </p>
          )}
        </dd>
      </div>
    )
  }

  const renderXref = (row: Row) => (
    <div
      className="glossary-xref"
      key={row.id}
      data-group={row.group}
      data-find={row.find}
    >
      <dt className="glossary-entry__term">
        <span className="glossary-entry__head">{row.head}</span>
      </dt>
      <dd className="glossary-entry__body">
        <p className="glossary-xref__to">
          {labels.xref} <a href={`#${row.targetId}`}>{row.targetHead}</a>
        </p>
      </dd>
    </div>
  )

  return (
    <div className="glossary">
      <GlossaryControls
        locale={locale}
        total={entryCount}
        groups={GLOSSARY_GROUPS.map((g) => ({ key: g.key, label: g.label[locale] }))}
      />

      <nav className="glossary-alphabet" id="glossary-index" aria-label={labels.jump} data-pagefind-ignore>
        {alphabet.map((letter) =>
          byLetter.has(letter) ? (
            <a key={letter} href={`#letter-${letter}`} data-letter={letter}>
              {letter}
            </a>
          ) : (
            <span key={letter} aria-hidden="true">
              {letter}
            </span>
          )
        )}
      </nav>

      <div className="glossary-starters" data-glossary-starters>
        <p className="glossary-starters__title">{labels.starterTitle}</p>
        <p className="glossary-starters__list">
          {starters.map(([id, entry], i) => (
            <React.Fragment key={id}>
              {i > 0 && <span aria-hidden="true"> · </span>}
              <a href={`#${id}`}>{entry.head}</a>
            </React.Fragment>
          ))}
        </p>
        <p className="glossary-starters__note">{labels.starterNote}</p>
      </div>

      {letters.map((letter) => (
        <section
          className="glossary-letter-block"
          key={letter}
          data-letter={letter}
          aria-label={letter}
        >
          <p className="glossary-letter" id={`letter-${letter}`}>
            <span className="glossary-letter__mark" aria-hidden="true">
              {letter}
            </span>
            <a className="glossary-letter__back" href="#glossary-index" data-pagefind-ignore>
              {labels.index}
            </a>
          </p>
          <dl className="glossary-list">
            {byLetter.get(letter)!.map((row) => (row.kind === 'entry' ? renderEntry(row) : renderXref(row)))}
          </dl>
        </section>
      ))}
    </div>
  )
}
