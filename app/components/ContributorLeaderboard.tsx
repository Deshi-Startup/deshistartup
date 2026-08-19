import snapshotData from '../generated/contributors.json'
import {
  ROLE_LABELS,
  contributorProfilePath,
  prepareContributorSnapshot
} from '../lib/contributor-leaderboard.mjs'
import { mediaUrl } from '../lib/media'

type Locale = 'bn' | 'en'

interface OrganizationView {
  id: string
  name: string
  url: string | null
}

interface ProfileView {
  rank: number | null
  slug?: string
  displayName: string
  headline?: string | null
  monogram: string
  githubLogin: string | null
  profileUrl?: string | null
  avatarUrl: string | null
  acceptedEventCount?: number
  lastAcceptedAt?: string | null
  organization?: OrganizationView | null
  roles?: string[]
  latestContribution?: {
    summary: { bn: string; en: string }
    evidenceUrl: string
  } | null
}

interface LeaderboardView {
  refreshedAt: string | null
  totals: {
    contributors: number
    acceptedEvents: number
    pagesImproved: number
    roleCategories: Record<string, number>
  }
  rankedProfiles: ProfileView[]
  coreProfiles: ProfileView[]
  hasContributors: boolean
}

const copy = {
  bn: {
    standing: (pages: string) => `এ পর্যন্ত ${pages}টি পেজে কন্ট্রিবিউটররা কাজ করেছেন।`,
    refreshed: 'শেষ আপডেট',
    countCaption: 'অবদান',
    roleCaption: (_count: number) => 'ভূমিকা',
    latestLabel: 'সর্বশেষ',
    profileLabel: (name: string) => `${name}-এর কাজগুলো দেখুন`,
    coreTitle: 'কোর টিম',
    coreText: 'প্রজেক্ট রিভিউ, সাইটে পাবলিশ আর মেনটেইন্যান্সের দায়িত্ব এঁদের। এখানকার নামগুলো র‍্যাঙ্ক করা নয়।',
    methodTitle: 'হিসাবটা যেভাবে হয়',
    methodText:
      'রিভিউ পেরিয়ে যেসব কাজ সাইটে লাইভ হয়, আমরা শুধু সেগুলোরই হিসাব রাখি। একটা লেখায় কারো একাধিক ভূমিকা থাকলেও কাউন্ট হবে একবারই – এমনকি কাজটা বাংলা-ইংরেজি দুই ভার্সনেই গেলেও। যাঁর কন্ট্রিবিউশন বেশি, তাঁর নাম তত উপরে থাকবে। সংখ্যা মিলে গেলে নতুন কাজ আগে, এরপর নাম অনুযায়ী সাজানো হয়। এখানকার সিরিয়াল দেখে কার দক্ষতা কতটা বা কাজের মান কেমন, সেটা বোঝার উপায় নেই।',
    correctionText: 'কন্ট্রিবিউটরের নাম, ক্রেডিট বা পরিচয় সংশোধন করতে কিংবা নাম সরাতে চাইলে',
    correctionLink: 'যোগাযোগ করুন',
    cta: 'দেশি স্টার্টআপে আপনার কাজও যোগ করুন',
    emptyText: 'কমিউনিটির প্রথম কাজটা এখনো সাইটে যোগ হয়নি। এখানে প্রথম নামটা কিন্তু আপনারই হতে পারে।'
  },
  en: {
    standing: (pages: string) => `${pages} pages have been improved so far.`,
    refreshed: 'Data updated',
    countCaption: 'Contributions',
    roleCaption: (count: number) => (count === 1 ? 'Role' : 'Roles'),
    latestLabel: 'Latest',
    profileLabel: (name: string) => `View ${name}'s contribution history`,
    coreTitle: 'Core team',
    coreText: 'Responsible for reviewing, publishing, and maintaining the project. This list is not ranked.',
    methodTitle: 'How the count works',
    methodText:
      'Only work that passes review and goes live on the site is counted here. One piece of work counts once, however many roles someone took in it, and even when it lands on both the Bengali and the English page. More contributions put a name higher up. When two counts tie, the newer work comes first, then the name. The order does not tell you how skilled someone is or how good the work was.',
    correctionText: 'To correct or remove a contributor name, credit, or identity,',
    correctionLink: 'contact us',
    cta: 'Add your work to Deshi Startup',
    emptyText: 'No community contribution has gone live yet. Yours could be the first name here.'
  }
} as const

function localHref(href: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  if (!href.startsWith('/') || !basePath) return href
  return href === '/' ? basePath : `${basePath}${href}`
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(value)
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) return null
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value)
  if (Number.isNaN(date.valueOf())) return null
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date)
}

/* The Bangla classifier binds to the numeral with no space, so the unit is a
   suffix rather than a separate word. */
function countUnit(count: number, locale: Locale) {
  if (locale === 'bn') return 'টি অবদান'
  return count === 1 ? '\u00a0contribution' : '\u00a0contributions'
}

function roleLabel(role: string, locale: Locale) {
  return ROLE_LABELS[role as keyof typeof ROLE_LABELS]?.[locale] || role
}

function Avatar({ profile, small = false }: { profile: ProfileView; small?: boolean }) {
  const size = small ? 40 : 56
  const avatarSrc = profile.avatarUrl ? mediaUrl(profile.avatarUrl, size * 2) : null
  return (
    <span
      className={`contributor-avatar${small ? ' contributor-avatar--small' : ''}${
        avatarSrc ? '' : ' contributor-avatar--monogram'
      }`}
    >
      <span aria-hidden="true">{profile.monogram}</span>
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt=""
          aria-hidden="true"
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      ) : null}
    </span>
  )
}

/* Professional identity and contribution role answer different questions.
   Keep them on separate lines so a title, an organization, and the work done
   for Deshi Startup never read as one malformed credential. */
function professionalMeta(profile: ProfileView) {
  const confirmedIdentity = [profile.headline, profile.organization?.name].filter(Boolean)
  if (confirmedIdentity.length) return confirmedIdentity.join(' · ')
  return profile.githubLogin ? `@${profile.githubLogin}` : ''
}

function ContributorRow({ profile, locale }: { profile: ProfileView; locale: Locale }) {
  const text = copy[locale]
  const profilePath = profile.slug ? contributorProfilePath(profile.slug, locale) : null
  const count = formatNumber(profile.acceptedEventCount || 0, locale)
  const lastAccepted = formatDate(profile.lastAcceptedAt, locale)
  const latestSummary = profile.latestContribution?.summary?.[locale]
  const professional = professionalMeta(profile)
  const roles = (profile.roles || []).map((role) => roleLabel(role, locale))

  return (
    <li className="contributor-row" data-contributor-profile={profile.slug}>
      <span className="contributor-row__rank" aria-hidden="true">
        {profile.rank ? formatNumber(profile.rank, locale) : ''}
      </span>
      <Avatar profile={profile} />
      <span className="contributor-row__identity">
        <strong dir="auto">
          {profilePath ? (
            <a href={localHref(profilePath)} aria-label={text.profileLabel(profile.displayName)}>
              <bdi>{profile.displayName}</bdi>
            </a>
          ) : (
            <bdi>{profile.displayName}</bdi>
          )}
        </strong>
        {professional ? <span className="contributor-row__meta" dir="auto">{professional}</span> : null}
        {roles.length ? (
          <span className="contributor-row__roles">
            <span>{text.roleCaption(roles.length)}:</span>
            {' '}
            <span>{roles.join(' · ')}</span>
          </span>
        ) : null}
        {latestSummary ? (
          <span className="contributor-row__latest">
            <span>{text.latestLabel}:</span>
            <span className="contributor-row__latest-summary">{latestSummary}</span>
          </span>
        ) : null}
      </span>
      <span className="contributor-row__count">
        <span className="contributor-row__value">
          <b>{count}</b>
          <span className="contributor-row__unit">{countUnit(profile.acceptedEventCount || 0, locale)}</span>
        </span>
        {lastAccepted ? (
          <>
            {' '}
            <span className="contributor-row__date">
              <span>{text.latestLabel}: </span>
              <time dateTime={profile.lastAcceptedAt || undefined}>{lastAccepted}</time>
            </span>
          </>
        ) : null}
      </span>
    </li>
  )
}

function CoreTeam({ profiles, locale }: { profiles: ProfileView[]; locale: Locale }) {
  if (!profiles.length) return null
  const text = copy[locale]
  return (
    <section className="contributor-core" aria-labelledby="core-team">
      <h2 id="core-team">{text.coreTitle}</h2>
      <p>{text.coreText}</p>
      <ul className="contributor-core-list">
        {profiles.map((profile, index) => (
          <li key={profile.githubLogin || `${profile.displayName}:${index}`}>
            <Avatar profile={profile} small />
            <span>
              <strong dir="auto"><bdi>{profile.displayName}</bdi></strong>
              {profile.githubLogin ? (
                <a href={profile.profileUrl || `https://github.com/${profile.githubLogin}`} rel="noopener noreferrer">
                  @{profile.githubLogin}
                </a>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function ContributorLeaderboard({
  locale = 'bn',
  scopeClassName = ''
}: {
  locale?: Locale
  scopeClassName?: string
}) {
  const text = copy[locale]
  const view = prepareContributorSnapshot(snapshotData) as LeaderboardView
  const refreshed = formatDate(view.refreshedAt, locale)
  const correctionHref = localHref(locale === 'en' ? '/en/contact' : '/contact')

  return (
    <section className={`${scopeClassName} contributor-board`.trim()}>
      {view.hasContributors ? (
        <div className="contributor-register">
          {/* One line, and only the fact the rows cannot give you: how far the
              work has reached. The per-role tally that sat here repeated what
              every row already says beside the name. */}
          <div className="contributor-register__head">
            <div className="contributor-standing">
              <p className="contributor-standing__line">
                {text.standing(formatNumber(view.totals.pagesImproved, locale))}
              </p>
              {refreshed ? (
                <p className="contributor-standing__refreshed">
                  {text.refreshed}:{' '}
                  <time dateTime={view.refreshedAt || undefined}>{refreshed}</time>
                </p>
              ) : null}
            </div>

            {/* The caption labels the numeric column once instead of repeating
                a unit on every wide-screen row. */}
            <p className="contributor-register-caption">{text.countCaption}</p>
          </div>
          <ol className="contributor-list contributor-list--ranked">
            {view.rankedProfiles.map((profile) => (
              <ContributorRow key={profile.slug || profile.displayName} profile={profile} locale={locale} />
            ))}
          </ol>
        </div>
      ) : (
        <p className="contributor-empty">{text.emptyText}</p>
      )}

      <p className="contributor-cta">
        <a href={localHref(locale === 'en' ? '/en/contribute' : '/contribute')}>{text.cta}</a>
      </p>

      <CoreTeam profiles={view.coreProfiles} locale={locale} />

      <section className="contributor-method" aria-labelledby="contributor-method-title">
        <h2 id="contributor-method-title">{text.methodTitle}</h2>
        <p>{text.methodText}</p>
        <p>
          {text.correctionText}{' '}
          <a href={correctionHref}>{text.correctionLink}</a>
          {locale === 'bn' ? '\u0964' : '.'}
        </p>
      </section>
    </section>
  )
}
