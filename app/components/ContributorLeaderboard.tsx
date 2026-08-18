import snapshotData from '../generated/contributors.json'
import {
  ROLE_LABELS,
  contributorProfilePath,
  prepareContributorSnapshot
} from '../lib/contributor-leaderboard.mjs'

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
    standing: (pages: string) => `এখন পর্যন্ত ${pages}টি পেজে অবদান যোগ হয়েছে।`,
    refreshed: 'শেষ আপডেট',
    countCaption: 'অবদান',
    latestLabel: 'সর্বশেষ',
    profileLabel: (name: string) => `${name}-এর অবদানের বিস্তারিত দেখুন`,
    coreTitle: 'কোর টিম',
    coreText: 'তাঁরা প্রজেক্টের রিভিউ, প্রকাশনা আর রক্ষণাবেক্ষণের দায়িত্বে আছেন। এই তালিকাটা র‍্যাঙ্ক করা নয়।',
    methodTitle: 'হিসাবটা কীভাবে হয়',
    methodText:
      'এখানে শুধু সেই কাজই গোনা হয়, যেটা রিভিউ পেরিয়ে সাইটে যোগ হয়েছে। একই কাজে কেউ কয়েকটা ভূমিকা রাখলে, বা কাজটা বাংলা আর ইংরেজি দুই পেজে গেলেও, গোনা হয় একবারই। যাঁর অবদান বেশি, তাঁর নাম আগে থাকে। সংখ্যা মিলে গেলে নতুন কাজ আগে, তারপর নাম ধরে সাজানো হয়। ক্রম দেখে কারও দক্ষতা বা কাজের মান বোঝা যায় না।',
    correctionText: 'নাম, ক্রেডিট বা পরিচয়ে কোনো ভুল থাকলে বা নাম সরাতে চাইলে',
    correctionLink: 'সংশোধনের অনুরোধ করুন',
    cta: 'দেশি স্টার্টআপে আপনার কাজও যোগ করুন',
    emptyText: 'কমিউনিটির প্রথম কাজটা এখনো সাইটে যোগ হয়নি। এখানে প্রথম নামটা কিন্তু আপনারই হতে পারে।'
  },
  en: {
    standing: (pages: string) => `${pages} pages have been improved so far.`,
    refreshed: 'Data updated',
    countCaption: 'Contributions',
    latestLabel: 'Latest',
    profileLabel: (name: string) => `View ${name}'s published contribution trail`,
    coreTitle: 'Core team',
    coreText: 'Responsible for reviewing, publishing, and maintaining the project. This list is not ranked.',
    methodTitle: 'How the count works',
    methodText:
      'Only work that passes review and goes live on the site is counted here. One piece of work counts once, however many roles someone took in it, and even when it lands on both the Bengali and the English page. More contributions put a name higher up. When two counts tie, the newer work comes first, then the name. The order does not tell you how skilled someone is or how good the work was.',
    correctionText: 'If a name, credit, or identity is wrong,',
    correctionLink: 'request a correction or opt out',
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
  return count === 1 ? ' contribution' : ' contributions'
}

function roleLabel(role: string, locale: Locale) {
  return ROLE_LABELS[role as keyof typeof ROLE_LABELS]?.[locale] || role
}

function Avatar({ profile, small = false }: { profile: ProfileView; small?: boolean }) {
  const size = small ? 40 : 56
  return (
    <span
      className={`contributor-avatar${small ? ' contributor-avatar--small' : ''}${
        profile.avatarUrl ? '' : ' contributor-avatar--monogram'
      }`}
    >
      <span aria-hidden="true">{profile.monogram}</span>
      {profile.avatarUrl ? (
        <img
          src={profile.avatarUrl}
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

/* One middot line carries what the person did and, when it is public, where
   they did it from. The bordered role chips it replaces put three outlined
   boxes on every row, which read as controls rather than as a description. */
function identityMeta(profile: ProfileView, locale: Locale) {
  const parts = (profile.roles || []).map((role) => roleLabel(role, locale))
  if (profile.organization) parts.push(profile.organization.name)
  else if (profile.githubLogin) parts.push(`@${profile.githubLogin}`)
  return parts.join(' · ')
}

function ContributorRow({ profile, locale }: { profile: ProfileView; locale: Locale }) {
  const text = copy[locale]
  const profilePath = profile.slug ? contributorProfilePath(profile.slug, locale) : null
  const count = formatNumber(profile.acceptedEventCount || 0, locale)
  const lastAccepted = formatDate(profile.lastAcceptedAt, locale)
  const latestSummary = profile.latestContribution?.summary?.[locale]
  const meta = identityMeta(profile, locale)

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
        {meta ? <span className="contributor-row__meta">{meta}</span> : null}
        {latestSummary ? (
          <span className="contributor-row__latest">
            <span>{text.latestLabel}</span>
            <a href={profile.latestContribution?.evidenceUrl} rel="noopener noreferrer">
              {latestSummary}
            </a>
          </span>
        ) : null}
      </span>
      <span className="contributor-row__count">
        <b>{count}</b>
        <span className="contributor-row__unit">{countUnit(profile.acceptedEventCount || 0, locale)}</span>
        {lastAccepted ? (
          <time dateTime={profile.lastAcceptedAt || undefined}>{lastAccepted}</time>
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

export default function ContributorLeaderboard({ locale = 'bn' }: { locale?: Locale }) {
  const text = copy[locale]
  const view = prepareContributorSnapshot(snapshotData) as LeaderboardView
  const refreshed = formatDate(view.refreshedAt, locale)
  const privacyIssueUrl =
    'https://github.com/Deshi-Startup/deshistartup/issues/new?title=Contributor%20listing%20request'

  return (
    <section className="contributor-board">
      {view.hasContributors ? (
        <>
          {/* One line, and only the fact the rows cannot give you: how far the
              work has reached. The per-role tally that sat here repeated what
              every row already says beside the name. */}
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

          {/* The caption labels the numeric column once instead of repeating a
              unit on every row, which is what keeps the column readable as a
              column rather than as a row of stat tiles. */}
          <p className="contributor-register-caption">{text.countCaption}</p>
          <ol className="contributor-list contributor-list--ranked">
            {view.rankedProfiles.map((profile) => (
              <ContributorRow key={profile.slug || profile.displayName} profile={profile} locale={locale} />
            ))}
          </ol>
        </>
      ) : (
        <p className="contributor-empty">{text.emptyText}</p>
      )}

      <CoreTeam profiles={view.coreProfiles} locale={locale} />

      <p className="contributor-cta">
        <a href={localHref(locale === 'en' ? '/en/contribute' : '/contribute')}>{text.cta}</a>
      </p>

      <section className="contributor-method" aria-labelledby="contributor-method-title">
        <h2 id="contributor-method-title">{text.methodTitle}</h2>
        <p>{text.methodText}</p>
        <p>
          {text.correctionText}{' '}
          <a href={privacyIssueUrl}>{text.correctionLink}</a>.
        </p>
      </section>
    </section>
  )
}
