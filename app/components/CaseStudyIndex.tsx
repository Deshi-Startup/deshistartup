import SectionIndex, { type PageInfo } from './SectionIndex'
import { CaseLogo, type CaseLocale } from './CaseStudy'
import coverData from '../../data/case-study-covers.json'
import artwork from '../../data/case-study-artwork.json'
import './CaseStudyIndex.css'

const covers = coverData as Record<keyof typeof coverData, {
  theme: keyof typeof artwork
  logoSlug?: string
  name?: string
  sector: Record<CaseLocale, string>
  title: Record<CaseLocale, string[]>
  summary: Record<CaseLocale, string>
}>

type CoverTheme = keyof typeof artwork

function CoverArt({ theme, locale }: { theme: CoverTheme; locale: CaseLocale }) {
  const art = artwork[theme]
  const svg = 'locales' in art ? art.locales[locale] : art.svg
  // Authored local SVG shared with social images; no reader-supplied markup.
  return <div className="case-cover__art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
}

function CaseCover({ page, locale }: { page: PageInfo; locale: CaseLocale }) {
  const [route, title, stub, description] = page
  const action = stub
    ? (locale === 'en' ? 'To be written' : 'লেখা বাকি')
    : (locale === 'en' ? 'Read the case study' : 'কেস স্টাডি পড়ুন')
  const slug = route.split('/').filter(Boolean).at(-1) || ''
  const cover = covers[slug as keyof typeof covers]
  const copy = cover ? { theme: cover.theme, sector: cover.sector[locale], title: cover.title[locale], summary: cover.summary[locale] } : undefined
  const company = cover?.name || title.replace(/(?: case study| কেস স্টাডি)$/, '')
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  // A newly finished study remains discoverable before custom artwork is commissioned.
  if (!copy) return (
    <a className="case-cover case-theme--school case-cover--plain" href={`${basePath}${route}`}>
      <CaseLogo slug={slug} />
      <h3>{company}</h3>
      {description && <p>{description}</p>}
      <span className="case-cover__bottom">{action}<Arrow /></span>
    </a>
  )
  return (
    <a className={`case-cover case-theme--${copy.theme}`} href={`${basePath}${route}`} rel={stub ? 'nofollow' : undefined} data-case-status={stub ? 'planned' : 'published'}
      aria-label={`${company}: ${copy.title.join(' ')}${stub ? (locale === 'en' ? ' Case study to be written. View starting sources.' : ' কেস স্টাডি লেখা বাকি। প্রাথমিক সোর্স দেখুন।') : ''}`}>
      <div className="case-cover__head"><CaseLogo slug={cover?.logoSlug || slug} fallback={company} /><span>{copy.sector}</span></div>
      <CoverArt theme={copy.theme} locale={locale} />
      <div className="case-cover__copy">
        <p className="case-cover__company">{company}</p>
        <h3>{copy.title.map((line) => <span key={line}>{line}</span>)}</h3>
        <p className="case-cover__summary">{copy.summary}</p>
      </div>
      <span className="case-cover__bottom">{action}<Arrow /></span>
    </a>
  )
}

function Arrow() {
  return <svg className="case-cover__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
}

export default function CaseStudyIndex({ locale = 'bn' }: { locale?: CaseLocale }) {
  return (
    <SectionIndex section="case-studies" locale={locale} heading={locale === 'en' ? 'Explore case studies' : 'কেস স্টাডিগুলো দেখুন'}
      renderCollection={(pages) => {
        const featuredSlugs = Object.keys(covers)
        const featured = featuredSlugs.flatMap((slug) => pages.filter((page) => page[0].endsWith(`/${slug}`)))
        const otherWritten = pages.filter((page) => !page[2] && !featured.includes(page))
        // Put completed studies first, preserving the curated order within each group.
        const galleryPages = [...featured, ...otherWritten].sort((a, b) => a[2] - b[2])
        return <div className="case-gallery">{galleryPages.map((page) => <CaseCover key={page[0]} page={page} locale={locale} />)}</div>
      }}
    />
  )
}
