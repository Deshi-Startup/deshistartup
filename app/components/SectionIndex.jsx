import manifestBn from '../generated/manifest.bn.json'
import manifestEn from '../generated/manifest.en.json'
import groupsConfig from '../nav-groups.json'

const bengaliDigits = (value) => String(value).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d])

/**
 * Auto-generated hub listing for a content section. Reads the build-time
 * manifest, so it never needs hand-maintenance: adding a page.mdx under the
 * section automatically lists it here after the next build.
 */
export default function SectionIndex({ section, locale = 'bn' }) {
  const isEn = locale === 'en'
  const manifest = isEn ? manifestEn : manifestBn
  const data = manifest.sections[section]
  if (!data) return null

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const href = (route) => `${basePath}${route}`
  const num = (n) => (isEn ? String(n) : bengaliDigits(n))

  const byChildSlug = new Map(
    data.children.map((child) => [child.slug.split('/').slice(1).join('/'), child])
  )

  const groups = (groupsConfig[section] || [])
    .map((group) => ({
      title: isEn ? group.en : group.bn,
      items: group.slugs.map((slug) => byChildSlug.get(slug)).filter(Boolean)
    }))
    .filter((group) => group.items.length > 0)

  // Fallback: pages not covered by the curated grouping (e.g. added later).
  const grouped = new Set(
    (groupsConfig[section] || []).flatMap((group) => group.slugs)
  )
  const leftovers = data.children.filter(
    (child) => !grouped.has(child.slug.split('/').slice(1).join('/'))
  )
  if (leftovers.length > 0) {
    groups.push({ title: isEn ? 'More guides' : 'আরও গাইড', items: leftovers })
  }

  const renderItem = (page) => {
    const written = !page.stub
    return (
      <li key={page.route}>
        {written ? (
          <>
            <a href={href(page.route)}>{page.title}</a>
            {page.description && !page.description.startsWith('>') && (
              <span className="index-desc">{page.description}</span>
            )}
          </>
        ) : (
          <>
            <a href={href(page.route)} className="is-stub-link">{page.title}</a>
            <span className="stub-chip">{isEn ? 'to be written' : 'লেখা বাকি'}</span>
          </>
        )}
      </li>
    )
  }

  return (
    <section className="section-index" data-pagefind-ignore>
      <h2 id={isEn ? 'all-guides-in-this-section' : 'এই-বিভাগের-সব-গাইড'}>
        {isEn ? 'All guides in this section' : 'এই বিভাগের সব গাইড'}
      </h2>
      <div className="section-stats">
        <span>
          {isEn ? 'Total topics' : 'মোট বিষয়'} <b>{num(data.total)}</b>
        </span>
        <span>
          {isEn ? 'Written' : 'লেখা হয়েছে'} <b>{num(data.written)}</b>
        </span>
        <span>
          {isEn ? 'To be written' : 'লেখা বাকি'} <b>{num(data.total - data.written)}</b>
        </span>
      </div>
      <p className="index-desc" style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>
        {isEn
          ? 'Unwritten topics are marked – click one to see its sources and help write it.'
          : 'যে বিষয়গুলো এখনো লেখা হয়নি সেগুলো চিহ্নিত করা আছে – চাইলে যেকোনোটিতে ঢুকে সূত্র দেখে লেখায় হাত লাগাতে পারেন।'}
      </p>

      {groups.map((group) => {
        const writtenItems = group.items.filter((page) => !page.stub)
        const stubItems = group.items.filter((page) => page.stub)
        return (
          <div key={group.title}>
            <h3>{group.title}</h3>
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
