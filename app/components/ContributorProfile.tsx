import sectionTitles from '../generated/sections-lite.json'
import { ROLE_LABELS } from '../lib/contributor-leaderboard.mjs'
import { contributorTopics } from '../lib/contributor-topics.mjs'
import { mediaUrl } from '../lib/media'
import type {
  ContributorLocale,
  ContributorOrganization,
  ContributorProfileView,
  ContributorTarget
} from '../lib/contributor-profile-data'
import { bnNav, enNav } from '../nav.config'

const copy = {
  bn: {
    back: 'সব কন্ট্রিবিউটর',
    publicLinks: 'পাবলিক লিংক',
    workUnit: (_count: number) => 'টি অবদান',
    pageUnit: (_count: number) => 'টি পাবলিশ হওয়া পেজ',
    roleCaption: (_count: number) => 'ভূমিকা',
    since: (date: string) => `${date} থেকে যুক্ত আছেন`,
    topicsTitle: 'যেসব বিষয়ে কাজ করেছেন',
    topicUnit: (_count: number) => 'টি পেজ',
    trailTitle: 'পাবলিশ হওয়া কাজের রেকর্ড',
    evidence: 'প্রমাণ দেখে নিন',
    pagesLabel: (_count: number) => 'পাবলিশ হওয়া পেজ',
    affiliation: 'সে সময়ের প্রতিষ্ঠান',
    reviewScope: 'রিভিউয়ের পরিধি',
    noPage: 'সাইটের প্রোডাক্ট বা ইনফ্রাস্ট্রাকচারের কাজ',
    refreshed: 'শেষ আপডেট',
    correctionText: 'এখানে নাম, ক্রেডিট বা পরিচয়ে ভুল থাকলে, কিংবা নামটা সরাতে চাইলে',
    correctionLink: 'যোগাযোগ করুন',
    stop: '।'
  },
  en: {
    back: 'All contributors',
    publicLinks: 'Public links',
    workUnit: (count: number) => (count === 1 ? 'contribution' : 'contributions'),
    pageUnit: (count: number) => (count === 1 ? 'published page' : 'published pages'),
    roleCaption: (count: number) => (count === 1 ? 'Role' : 'Roles'),
    since: (date: string) => `Contributing since ${date}`,
    topicsTitle: 'Topics worked on',
    topicUnit: (count: number) => (count === 1 ? 'page' : 'pages'),
    trailTitle: 'Contribution history',
    evidence: 'View evidence',
    pagesLabel: (count: number) => (count === 1 ? 'Published page' : 'Published pages'),
    affiliation: 'Affiliation at the time',
    reviewScope: 'Review scope',
    noPage: 'Product or infrastructure work on the site',
    refreshed: 'Data updated',
    correctionText: 'To correct a name, credit, or identity on this page, or to have it removed,',
    correctionLink: 'contact us',
    stop: '.'
  }
} as const

/* The sidebar already carries the short, spoken name for every topic the guide
   is organised by. Reusing it keeps one name per section across the site; the
   generated section title is the fallback for a topic the sidebar does not
   curate. */
const NAV_LABELS: Record<ContributorLocale, Map<string, string>> = {
  bn: new Map(bnNav.flatMap((group) => group.items.map(([href, label]) => [href, label]))),
  en: new Map(enNav.flatMap((group) => group.items.map(([href, label]) => [href.replace(/^\/en/, ''), label])))
}

const SECTION_TITLES = sectionTitles as Record<ContributorLocale, Record<string, string>>

function localHref(href: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  if (!href.startsWith('/') || !basePath) return href
  return href === '/' ? basePath : `${basePath}${href}`
}

function localeHref(path: string, locale: ContributorLocale) {
  return localHref(`${locale === 'en' ? '/en' : ''}${path}`)
}

function formatNumber(value: number, locale: ContributorLocale) {
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(value)
}

function formatDate(value: string | null, locale: ContributorLocale) {
  if (!value) return null
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(date.valueOf())) return null
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date)
}

function roleLabel(role: string, locale: ContributorLocale) {
  return ROLE_LABELS[role as keyof typeof ROLE_LABELS]?.[locale] || role
}

function topicLabel(slug: string, locale: ContributorLocale) {
  return NAV_LABELS[locale].get(`/${slug}`) || SECTION_TITLES[locale]?.[slug] || null
}

/* The Bangla classifier binds to the numeral, so the unit is a suffix rather
   than a separate word and carries its own space only in English. */
function Figure({ value, unit }: { value: string; unit: string }) {
  return (
    <span className="contributor-figure">
      <b>{value}</b>
      <span className="contributor-figure__unit">{unit}</span>
    </span>
  )
}

function TargetPages({
  targets,
  locale
}: {
  targets: ContributorTarget[]
  locale: ContributorLocale
}) {
  const text = copy[locale]
  if (!targets.length) return <p className="contributor-event__no-page">{text.noPage}</p>

  /* The published pages are the work itself, so they are read, not opened. A
     disclosure here hid the whole substance of a profile behind a count. One
     page names itself on the label's own line; a list of eleven earns its own
     block above them. */
  const pages = (
    <ul>
      {targets.map((target) => (
        <li key={target.path}>
          <a href={localeHref(target.path, locale)}>{target.title[locale]}</a>
        </li>
      ))}
    </ul>
  )

  if (targets.length === 1) {
    return (
      <p className="contributor-event__pages contributor-event__pages--one">
        <span className="contributor-event__pages-label">{text.pagesLabel(1)}:</span> {pages}
      </p>
    )
  }

  return (
    <div className="contributor-event__pages">
      <p className="contributor-event__pages-label">{text.pagesLabel(targets.length)}</p>
      {pages}
    </div>
  )
}

export default function ContributorProfile({
  profile,
  organizations,
  refreshedAt,
  locale
}: {
  profile: ContributorProfileView
  organizations: ContributorOrganization[]
  refreshedAt: string | null
  locale: ContributorLocale
}) {
  const text = copy[locale]
  const organizationById = new Map(organizations.map((organization) => [organization.id, organization]))
  const avatarSrc = profile.avatarUrl ? mediaUrl(profile.avatarUrl, 192) : null
  const since = formatDate(profile.contributorSince, locale)
  const refreshed = formatDate(refreshedAt, locale)
  const roleSummary = profile.roles.map((role) => roleLabel(role, locale)).join(' · ')
  // The green line is what the person told us about themselves, so it appears
  // only when a headline or affiliation has actually been confirmed. Without
  // one it would just restate the page title back at the reader.
  const designation = [profile.headline, profile.organization?.name].filter(Boolean).join(' · ')
  const { pageCount, topics } = contributorTopics(profile.contributions)
  const namedTopics = topics
    .map((topic) => ({ ...topic, label: topicLabel(topic.slug, locale) }))
    .filter((topic): topic is typeof topic & { label: string } => Boolean(topic.label))

  // A chronology, so the acceptance date hangs once in the margin against a
  // continuous rule and the work itself owns the reading column. Seven guides
  // accepted on one day are one dateline, not the same date printed seven times.
  const dateGroups: Array<{ key: string; date: string | null; label: string | null; items: typeof profile.contributions }> = []
  for (const contribution of profile.contributions) {
    const key = contribution.event.acceptedAt || 'undated'
    const current = dateGroups[dateGroups.length - 1]
    if (current && current.key === key) {
      current.items.push(contribution)
      continue
    }
    dateGroups.push({
      key,
      date: contribution.event.acceptedAt || null,
      label: formatDate(contribution.event.acceptedAt, locale),
      items: [contribution]
    })
  }

  return (
    <div className="contributor-profile" data-pagefind-ignore="all">
      <a className="contributor-profile__back" href={localeHref('/contributors', locale)}>
        ← {text.back}
      </a>

      <header className="contributor-profile__header">
        <span className={`contributor-profile__avatar${avatarSrc ? '' : ' contributor-avatar--monogram'}`}>
          <span aria-hidden="true">{profile.monogram}</span>
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt=""
              aria-hidden="true"
              width="96"
              height="96"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          ) : null}
        </span>
        <div>
          <h1 dir="auto"><bdi>{profile.displayName}</bdi></h1>
          {designation ? (
            <p className="contributor-profile__designation">{designation}</p>
          ) : null}
          {/* The count is what is actually being measured, so it is read as a
              figure here rather than buried mid-sentence in a meta line. */}
          <p className="contributor-profile__standing">
            <Figure
              value={formatNumber(profile.acceptedEventCount, locale)}
              unit={text.workUnit(profile.acceptedEventCount)}
            />
            {pageCount ? (
              <Figure
                value={formatNumber(pageCount, locale)}
                unit={text.pageUnit(pageCount)}
              />
            ) : null}
            {since ? <span>{text.since(since)}</span> : null}
          </p>
          {roleSummary ? (
            <p className="contributor-profile__roles">
              {text.roleCaption(profile.roles.length)}: {roleSummary}
            </p>
          ) : null}
          {profile.links.length ? (
            <nav className="contributor-profile__links" aria-label={text.publicLinks}>
              {profile.links.map((link) => (
                <a href={link.url} key={link.url} rel="me noopener noreferrer">{link.label}</a>
              ))}
            </nav>
          ) : null}
        </div>
      </header>

      {namedTopics.length ? (
        /* Where the work landed. The chronology below answers when and with
           what proof; this answers which parts of the guide exist because of
           this person, which no row can say on its own. */
        <section className="contributor-topics" aria-labelledby="contributor-topics-title">
          <h2 id="contributor-topics-title">{text.topicsTitle}</h2>
          <ul>
            {namedTopics.map((topic) => (
              <li key={topic.slug}>
                <a href={localeHref(`/${topic.slug}`, locale)}>{topic.label}</a>
                <Figure
                  value={formatNumber(topic.count, locale)}
                  unit={text.topicUnit(topic.count)}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="contributor-trail" aria-labelledby="contributor-trail-title">
        <h2 id="contributor-trail-title">{text.trailTitle}</h2>
        <ol>
          {dateGroups.map((group) => (
            <li key={group.key} className="contributor-trail__group">
              <p className="contributor-trail__date">
                {group.label ? <time dateTime={group.date || undefined}>{group.label}</time> : null}
              </p>
              <ol className="contributor-trail__entries">
                {group.items.map(({ event, credit }) => {
                  const affiliation = credit.organizationId
                    ? organizationById.get(credit.organizationId) || null
                    : null
                  return (
                    <li key={event.id} className="contributor-event">
                      <h3>{event.summary[locale]}</h3>
                      <p className="contributor-event__meta">
                        <span className="contributor-event__roles">
                          {credit.roles.map((role) => roleLabel(role, locale)).join(' · ')}
                        </span>
                        <a href={event.evidenceUrl} rel="noopener noreferrer">{text.evidence}</a>
                      </p>
                      {affiliation ? (
                        <p className="contributor-event__affiliation">
                          {text.affiliation}:{' '}
                          {affiliation.url ? (
                            <a href={affiliation.url} rel="noopener noreferrer">{affiliation.name}</a>
                          ) : affiliation.name}
                        </p>
                      ) : null}
                      {credit.review ? (
                        <p className="contributor-event__review">
                          <strong>{text.reviewScope}:</strong> {credit.review.scope[locale]} ·{' '}
                          <time dateTime={credit.review.reviewedAt}>{formatDate(credit.review.reviewedAt, locale)}</time>
                        </p>
                      ) : null}
                      <TargetPages targets={event.targets} locale={locale} />
                    </li>
                  )
                })}
              </ol>
            </li>
          ))}
        </ol>
      </section>

      {/* A public record carries its own date and its own correction route.
          Anyone named here has to be able to fix or remove that naming without
          hunting for the page that explains how. */}
      <footer className="contributor-record-note">
        {refreshed ? (
          <p>
            {text.refreshed}: <time dateTime={refreshedAt || undefined}>{refreshed}</time>
          </p>
        ) : null}
        <p>
          {text.correctionText}{' '}
          <a href={localeHref('/contact', locale)}>{text.correctionLink}</a>
          {text.stop}
        </p>
      </footer>
    </div>
  )
}
