import manifestBn from '../generated/manifest.bn.json'
import manifestEn from '../generated/manifest.en.json'

const bengaliDigits = (value) => String(value).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[digit])

export default function SiteMap({ locale = 'bn' }) {
  const isEn = locale === 'en'
  const manifest = isEn ? manifestEn : manifestBn
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const href = (route) => `${basePath}${route}`
  const currentRoute = isEn ? '/en/sitemap' : '/sitemap'

  const sections = Object.values(manifest.sections)
    .map((section) => ({
      ...section,
      index: section.index && !section.index.stub ? section.index : null,
      children: section.children.filter((page) => !page.stub && page.route !== currentRoute)
    }))
    .filter((section) => section.index || section.children.length > 0)

  const standalone = sections
    .filter((section) => section.index && section.children.length === 0 && section.index.route !== currentRoute)
    .map((section) => section.index)
  const clusters = sections.filter((section) => section.children.length > 0)
  const total = manifest.counts.written

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
          <h2>{isEn ? 'Core guides' : 'মূল গাইড'}</h2>
          <ul>
            {standalone.map((page) => (
              <li key={page.route}>
                <a href={href(page.route)}>{page.title}</a>
                {page.description && <span className="index-desc">{page.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {clusters.map((section) => (
        <section key={section.slug}>
          <h2>
            {section.index ? <a href={href(section.index.route)}>{section.index.title}</a> : section.title}
          </h2>
          <ul>
            {section.children.map((page) => (
              <li key={page.route}>
                <a href={href(page.route)}>{page.title}</a>
                {page.description && <span className="index-desc">{page.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
