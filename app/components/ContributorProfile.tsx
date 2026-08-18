import { SITE_URL } from '../seo.config.mjs'
import { ROLE_LABELS, contributorProfilePath } from '../lib/contributor-leaderboard.mjs'
import { mediaUrl } from '../lib/media'
import type {
  ContributorLocale,
  ContributorOrganization,
  ContributorProfileView,
  ContributorTarget
} from '../lib/contributor-profile-data'
import ContributorShareActions from './ContributorShareActions'

const copy = {
  bn: {
    back: 'সব কন্ট্রিবিউটর',
    publicLinks: 'পাবলিক লিংক',
    workCount: (count: string) => `${count}টি অবদান`,
    roleCaption: (_count: number) => 'ভূমিকা',
    since: (date: string) => `${date} থেকে যুক্ত আছেন`,
    cardTitle: 'শেয়ার করার কার্ড',
    cardText: 'কার্ডটি এই পাবলিক রেকর্ডের সাথে যুক্ত। এতে কোনো র‍্যাঙ্ক দেওয়া নেই, তাই লিডারবোর্ডের সিরিয়াল বদলালেও কার্ডের তথ্য ঠিক থাকে।',
    cardAlt: (name: string) => `${name}-এর দেশি স্টার্টআপ কন্ট্রিবিউটর কার্ড`,
    trailTitle: 'পাবলিশ হওয়া কাজের রেকর্ড',
    evidence: 'প্রমাণ দেখে নিন',
    pages: (count: string) => `${count}টি পাবলিশ হওয়া পেজ`,
    page: 'পাবলিশ হওয়া পেজ',
    affiliation: 'সে সময়ের প্রতিষ্ঠান',
    reviewScope: 'রিভিউয়ের পরিধি',
    noPage: 'সাইটের প্রোডাক্ট বা ইনফ্রাস্ট্রাকচারের কাজ'
  },
  en: {
    back: 'All contributors',
    publicLinks: 'Public links',
    workCount: (count: string) => `${count} ${count === '1' ? 'contribution' : 'contributions'}`,
    roleCaption: (count: number) => (count === 1 ? 'Role' : 'Roles'),
    since: (date: string) => `Contributing since ${date}`,
    cardTitle: 'Shareable proof card',
    cardText: 'The card links back to this public record. It omits rank, so it stays accurate as the order changes.',
    cardAlt: (name: string) => `${name}'s Deshi Startup contributor proof card`,
    trailTitle: 'Published contribution trail',
    evidence: 'View evidence',
    pages: (count: string) => `${count} published pages`,
    page: 'Published page',
    affiliation: 'Affiliation at the time',
    reviewScope: 'Review scope',
    noPage: 'Product or infrastructure work on the site'
  }
} as const

function localHref(href: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  if (!href.startsWith('/') || !basePath) return href
  return href === '/' ? basePath : `${basePath}${href}`
}

function formatNumber(value: number, locale: ContributorLocale) {
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(value)
}

function formatDate(value: string | null, locale: ContributorLocale) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00Z`)
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

function TargetLinks({
  targets,
  locale
}: {
  targets: ContributorTarget[]
  locale: ContributorLocale
}) {
  const text = copy[locale]
  if (!targets.length) return <p className="contributor-event__no-page">{text.noPage}</p>

  const links = (
    <ul className="contributor-event__targets">
      {targets.map((target) => {
        const href = `${locale === 'en' ? '/en' : ''}${target.path}`
        return (
          <li key={target.path}>
            <a href={localHref(href)}>{target.title[locale]}</a>
          </li>
        )
      })}
    </ul>
  )

  if (targets.length === 1) {
    return (
      <div className="contributor-event__single-target">
        <span>{text.page}</span>
        {links}
      </div>
    )
  }

  return (
    <details className="contributor-event__pages">
      <summary>{text.pages(formatNumber(targets.length, locale))}</summary>
      {links}
    </details>
  )
}

export default function ContributorProfile({
  profile,
  organizations,
  locale
}: {
  profile: ContributorProfileView
  organizations: ContributorOrganization[]
  locale: ContributorLocale
}) {
  const text = copy[locale]
  const profilePath = contributorProfilePath(profile.slug, locale) || '/contributors'
  const canonicalProfileUrl = `${SITE_URL}${profilePath}`
  const cardPath = `/contributor-cards/${profile.slug}.png`
  const organizationById = new Map(organizations.map((organization) => [organization.id, organization]))
  const avatarSrc = profile.avatarUrl ? mediaUrl(profile.avatarUrl, 192) : null
  const since = formatDate(profile.contributorSince, locale)
  // The standing line is what the roles section used to be: the same facts,
  // read as one sentence instead of a two-column grid with one entry in it.
  const roleSummary = profile.roles.map((role) => roleLabel(role, locale)).join(' · ')
  const standing = [
    roleSummary ? `${text.roleCaption(profile.roles.length)}: ${roleSummary}` : null,
    text.workCount(formatNumber(profile.acceptedEventCount, locale)),
    since ? text.since(since) : null
  ].filter(Boolean).join(' · ')
  // The green line is what the person told us about themselves, so it appears
  // only when a headline or affiliation has actually been confirmed. Without
  // one it would just restate the page title back at the reader.
  const designation = [profile.headline, profile.organization?.name].filter(Boolean).join(' · ')

  return (
    <div className="contributor-profile" data-pagefind-ignore="all">
      <a className="contributor-profile__back" href={localHref(locale === 'en' ? '/en/contributors' : '/contributors')}>
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
          <p className="contributor-profile__standing">{standing}</p>
          {profile.links.length ? (
            <nav className="contributor-profile__links" aria-label={text.publicLinks}>
              {profile.links.map((link) => (
                <a href={link.url} key={link.url} rel="me noopener noreferrer">{link.label}</a>
              ))}
            </nav>
          ) : null}
        </div>
      </header>

      <section className="contributor-proof" aria-labelledby="contributor-proof-title">
        <a className="contributor-proof__card" href={localHref(cardPath)} aria-label={text.cardAlt(profile.displayName)}>
          <img
            src={localHref(cardPath)}
            alt={text.cardAlt(profile.displayName)}
            width="1200"
            height="630"
            loading="lazy"
            decoding="async"
          />
        </a>
        <div className="contributor-proof__copy">
          <h2 id="contributor-proof-title">{text.cardTitle}</h2>
          <p>{text.cardText}</p>
          <ContributorShareActions
            locale={locale}
            profileUrl={canonicalProfileUrl}
            cardHref={localHref(cardPath)}
            downloadName={`deshi-startup-contributor-${profile.slug}.png`}
          />
        </div>
      </section>

      <section className="contributor-trail" aria-labelledby="contributor-trail-title">
        <h2 id="contributor-trail-title">{text.trailTitle}</h2>
        {/* A chronology, so the date hangs in the margin against a continuous
            rule and the work itself owns the reading column. */}
        <ol>
          {profile.contributions.map(({ event, credit }) => {
            const affiliation = credit.organizationId
              ? organizationById.get(credit.organizationId) || null
              : null
            const acceptedAt = formatDate(event.acceptedAt, locale)
            return (
              <li key={event.id} className="contributor-event">
                <p className="contributor-event__date">
                  {acceptedAt ? <time dateTime={event.acceptedAt}>{acceptedAt}</time> : null}
                </p>
                <div className="contributor-event__body">
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
                  <TargetLinks targets={event.targets} locale={locale} />
                </div>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
