import React from 'react'
import contentIndex from '../generated/content-index.json'

export type PageInfo = [
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
  /** A page-specific listing title; the component owns the single heading. */
  heading?: string
  /** A gallery directly under the page title can supply its own heading hierarchy. */
  showHeader?: boolean
  /** Preserve an older authored heading's fragment when consolidating it. */
  id?: string
  /** A collection may present manifest-owned pages visually, retaining their stub status. */
  renderCollection?: (pages: PageInfo[]) => React.ReactNode
  /** Show only the planned-topic disclosure when written resources are presented elsewhere. */
  plannedOnly?: boolean
}

/**
 * Auto-generated hub listing for a content section. Reads the build-time
 * manifest, so it never needs hand-maintenance: adding a page.mdx under the
 * section automatically lists it here after the next build.
 */
export default function SectionIndex({ section, locale = 'bn', heading, id, renderCollection, plannedOnly = false, showHeader = true }: SectionIndexProps) {
  const isEn = locale === 'en'
  const isDirectory = section === 'directory'
  const isCaseStudy = section === 'case-studies'
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
            <span className="stub-chip">
              {isDirectory ? (isEn ? 'coming soon' : 'শিগগিরই আসছে') : (isEn ? 'to be written' : 'লেখা বাকি')}
            </span>
          </>
        )}
      </li>
    )
  }

  const remaining = total - written
  if (plannedOnly && remaining === 0) return null
  const writtenGroups = groups.filter(([, items]) => items.some((page) => !page[2]))
  const plannedGroups = groups.filter(([, items]) => items.some((page) => page[2]))
  const showGroupHeading = (title: string, groupCount: number) =>
    groupCount > 1 || (title !== heading && !['More guides', 'আরও গাইড'].includes(title))

  return (
    <section
      id={id}
      aria-label={!showHeader ? heading : undefined}
      className={isCaseStudy ? 'section-index section-index--case-studies' : 'section-index'}
      data-inline-edit-source="section-index"
      data-pagefind-ignore
    >
      {!plannedOnly && (
        <>
          {showHeader && <>
          <h2 id={isDirectory ? (isEn ? 'all-directories' : 'সব-ডিরেক্টরি') : (isEn ? 'all-guides-in-this-section' : 'এই-বিভাগের-সব-গাইড')}>
            {heading || (isDirectory ? (isEn ? 'All directories' : 'সব ডিরেক্টরি') : (isEn ? 'All guides in this section' : 'এই বিভাগের সব গাইড'))}
          </h2>
          <p className="section-stats">
            <span>
              <b>{num(written)}{!isEn && 'টি'}</b> {isDirectory
                ? (isEn ? `${written === 1 ? 'directory' : 'directories'} available` : 'ডিরেক্টরি প্রকাশিত')
                : isCaseStudy
                  ? (isEn ? `${written === 1 ? 'case study' : 'case studies'} published` : 'কেস স্টাডি প্রকাশিত')
                  : (isEn ? `${written === 1 ? 'guide' : 'guides'} available` : 'গাইড পড়তে পারবেন')}
            </span>
            {remaining > 0 && (
              <span>
                {isEn ? (
                  `${num(remaining)} ${isCaseStudy ? (remaining === 1 ? 'case study to be written' : 'case studies to be written') : 'to be written'}`
                ) : (
                  `${num(remaining)}টি ${isCaseStudy ? 'কেস স্টাডি লেখা বাকি' : 'বিষয় লেখা বাকি'}`
                )}
              </span>
            )}
          </p>
          </>}

          {written === 0 && (
            <p className="index-desc section-index__note">
              {isEn
                ? (isCaseStudy
                    ? 'The detailed case studies are still to be written. You can explore the planned companies and their starting sources below.'
                    : 'The detailed guides are still to be written. You can explore the planned topics and their starting sources below.')
                : (isCaseStudy
                    ? 'বিস্তারিত কেস স্টাডিগুলো এখনো লেখা হয়নি। নিচে পরিকল্পিত কোম্পানি ও সেগুলোর প্রাথমিক সোর্স দেখতে পারেন।'
                    : 'বিস্তারিত গাইডগুলো এখনো লেখা হয়নি। নিচে পরিকল্পিত বিষয় ও সেগুলোর প্রাথমিক সোর্স দেখতে পারেন।')}
            </p>
          )}

          {renderCollection ? renderCollection(groups.flatMap(([, items]) => items)) : writtenGroups.map(([groupTitle, items]) => {
            const writtenItems = items.filter((page) => !page[2])
            if (writtenItems.length === 0) return null
            return (
              <div key={groupTitle}>
                {showGroupHeading(groupTitle, writtenGroups.length) && <h3>{groupTitle}</h3>}
                <ul>{writtenItems.map(renderItem)}</ul>
              </div>
            )
          })}
        </>
      )}

      {remaining > 0 && (
        <details className="section-index__planned">
          <summary>
            {isEn
              ? (isCaseStudy ? `Case studies still to be written (${num(remaining)})` : `Topics still to be written (${num(remaining)})`)
              : (isCaseStudy ? `যে কেস স্টাডিগুলো লেখা বাকি (${num(remaining)})` : `যে বিষয়গুলো লেখা বাকি (${num(remaining)})`)}
          </summary>
          <p className="index-desc section-index__note">
            {isEn
              ? (isCaseStudy
                  ? 'These pages have starting sources, but no finished case study yet. Open a case study to help write it.'
                  : 'These pages have starting sources, but no finished guide yet. Open a topic to help write it.')
              : (isCaseStudy
                  ? 'এই পেজগুলোতে প্রাথমিক সোর্স আছে, তবে পূর্ণাঙ্গ কেস স্টাডি এখনো লেখা হয়নি। লিখতে সাহায্য করতে চাইলে কেস স্টাডিটি খুলে দেখুন।'
                  : 'এই পেজগুলোতে প্রাথমিক সোর্স আছে, পূর্ণাঙ্গ গাইড নেই। লিখতে সাহায্য করতে চাইলে বিষয়টি খুলে দেখুন।')}
          </p>
          {plannedGroups.map(([groupTitle, items]) => {
            const stubItems = items.filter((page) => page[2])
            if (stubItems.length === 0) return null
            return (
              <div key={groupTitle}>
                {showGroupHeading(groupTitle, plannedGroups.length) && <h3 data-toc-ignore>{groupTitle}</h3>}
                <ul>{stubItems.map(renderItem)}</ul>
              </div>
            )
          })}
        </details>
      )}
    </section>
  )
}
