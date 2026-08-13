import React from 'react'
import contentIndex from '../generated/content-index.json'

type PageInfo = [
  route: string,
  title: string,
  stub: 0 | 1,
  description: string | null
]
type GroupInfo = [title: string, items: PageInfo[]]
type SectionInfo = [
  title: string,
  total: number,
  written: number,
  index: PageInfo | null,
  groups: GroupInfo[]
]
interface ContentIndexLocale {
  sections: Record<string, SectionInfo>
}

const typedContentIndex = contentIndex as unknown as Record<'bn' | 'en', ContentIndexLocale>

const bengaliDigits = (value: number) => String(value).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])

interface SectionIndexProps {
  section: string
  locale?: 'bn' | 'en'
}

/**
 * Auto-generated hub listing for a content section. Reads the build-time
 * manifest, so it never needs hand-maintenance: adding a page.mdx under the
 * section automatically lists it here after the next build.
 */
export default function SectionIndex({ section, locale = 'bn' }: SectionIndexProps) {
  const isEn = locale === 'en'
  const data = typedContentIndex[locale].sections[section]
  if (!data) return null
  const [, total, written, , groups] = data

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const href = (route: string) => `${basePath}${route}`
  const num = (n: number) => (isEn ? String(n) : bengaliDigits(n))

  const renderItem = (page: PageInfo) => {
    const [route, title, stub, description] = page
    const pageIsWritten = !stub
    return (
      <li key={route}>
        {pageIsWritten ? (
          <>
            <a href={href(route)}>{title}</a>
            {description && !description.startsWith('>') && (
              <span className="index-desc">{description}</span>
            )}
          </>
        ) : (
          <>
            <a href={href(route)} className="is-stub-link" rel="nofollow">{title}</a>
            <span className="stub-chip">{isEn ? 'to be written' : 'লেখা বাকি'}</span>
          </>
        )}
      </li>
    )
  }

  const remaining = total - written

  return (
    <section className="section-index" data-pagefind-ignore>
      <h2 id={isEn ? 'all-guides-in-this-section' : 'এই-বিভাগের-সব-গাইড'}>
        {isEn ? 'All guides in this section' : 'এই বিভাগের সব গাইড'}
      </h2>
      <div className="section-stats">
        <span>
          {isEn ? 'Total topics' : 'মোট বিষয়'} <b>{num(total)}</b>
        </span>
        <span>
          {isEn ? 'Written' : 'লেখা হয়েছে'} <b>{num(written)}</b>
        </span>
        {/* A "0 to be written" pill is noise, and the invitation below it would
            be pointing at nothing. A finished section should just say so. */}
        {remaining > 0 && (
          <span>
            {isEn ? 'To be written' : 'লেখা বাকি'} <b>{num(remaining)}</b>
          </span>
        )}
      </div>
      <p className="index-desc section-index__note">
        {remaining > 0
          ? isEn
            ? 'Unwritten topics are marked – click one to see its sources and help write it.'
            : 'যে বিষয়গুলো এখনো লেখা হয়নি সেগুলো চিহ্নিত করা আছে – চাইলে যেকোনোটিতে ঢুকে সোর্স দেখে লেখায় হাত লাগাতে পারেন।'
          : isEn
            ? 'Every topic in this section is written. Spotted something out of date? The edit link at the bottom of each guide is open to you.'
            : 'এই বিভাগের সব বিষয়ই লেখা হয়েছে। কোথাও পুরোনো তথ্য চোখে পড়লে গাইডের নিচের এডিট অপশন থেকেই ঠিক করে দিতে পারেন।'}
      </p>

      {groups.map(([groupTitle, items]) => {
        const writtenItems = items.filter((page) => !page[2])
        const stubItems = items.filter((page) => page[2])
        return (
          <div key={groupTitle}>
            <h3>{groupTitle}</h3>
            {writtenItems.length > 0 && <ul>{writtenItems.map(renderItem)}</ul>}
            {stubItems.length > 0 &&
              (writtenItems.length > 0 ? (
                <details>
                  <summary>
                    {isEn
                      ? `To be written (${num(stubItems.length)})`
                      : `লেখা বাকি (${num(stubItems.length)})`}
                  </summary>
                  <ul>{stubItems.map(renderItem)}</ul>
                </details>
              ) : (
                <ul>{stubItems.map(renderItem)}</ul>
              ))}
          </div>
        )
      })}
    </section>
  )
}
