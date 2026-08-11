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
  counts: [written: number, stubs: number]
  sections: Record<string, SectionInfo>
}

const typedContentIndex = contentIndex as unknown as Record<'bn' | 'en', ContentIndexLocale>

const bengaliDigits = (value: number) => String(value).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)])

interface SiteMapProps {
  locale?: 'bn' | 'en'
}

export default function SiteMap({ locale = 'bn' }: SiteMapProps) {
  const isEn = locale === 'en'
  const index = typedContentIndex[locale]
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const href = (route: string) => `${basePath}${route}`
  const currentRoute = isEn ? '/en/sitemap' : '/sitemap'

  const sections = Object.entries(index.sections)
    .map(([slug, section]) => {
      const [title, , , sectionIndex, groups] = section
      const children = groups
        .flatMap(([, items]) => items)
        .filter(([route, , stub]) => !stub && route !== currentRoute)
        .sort(([, titleA], [, titleB]) => titleA.localeCompare(titleB, isEn ? 'en' : 'bn'))
      return {
        slug,
        title,
        index: sectionIndex && !sectionIndex[2] ? sectionIndex : null,
        children
      }
    })
    .filter((section) => section.index || section.children.length > 0)

  const standalone = sections
    .filter((section) => section.index && section.children.length === 0 && section.index[0] !== currentRoute)
    .map((section) => section.index as PageInfo)
  const clusters = sections.filter((section) => section.children.length > 0)
  const total = index.counts[0]

  return (
    <div className="section-index sitemap-list" data-pagefind-ignore>
      <p className="section-stats">
        <span>
          {isEn ? 'Published pages' : 'প্রকাশিত পাতা'}{' '}
          <b>{isEn ? total : bengaliDigits(total)}</b>
        </span>
      </p>

      {standalone.length > 0 && (
        <section>
          {/* MDX headings get their id from rehype-slug; these are rendered by a
              component, so they need one here. Without it the shell's "on this
              page" list has nowhere to link, and it is built after hydration
              instead of shipping in the HTML. */}
          <h2 id="core-guides">{isEn ? 'Core guides' : 'মূল গাইড'}</h2>
          <ul>
            {standalone.map(([route, title, , description]) => (
              <li key={route}>
                <a href={href(route)}>{title}</a>
                {description && <span className="index-desc">{description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {clusters.map((section) => (
        <section key={section.slug}>
          <h2 id={section.slug}>
            {section.index ? <a href={href(section.index[0])}>{section.index[1]}</a> : section.title}
          </h2>
          <ul>
            {section.children.map(([route, title, , description]) => (
              <li key={route}>
                <a href={href(route)}>{title}</a>
                {description && <span className="index-desc">{description}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
