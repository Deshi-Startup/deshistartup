import snapshotData from '../generated/contributors.json'
import { prepareContributorSnapshot } from '../lib/contributor-leaderboard.mjs'

type Locale = 'bn' | 'en'

interface ProfileView {
  rank: number | null
  displayName: string
  monogram: string
  githubLogin: string | null
  profileUrl: string | null
  avatarUrl: string | null
  pullsUrl: string | null
  mergedPullRequestCount: number
  lastMergedAt: string | null
}

interface LeaderboardView {
  repository: string
  refreshedAt: string | null
  totals: { contributors: number; mergedPullRequests: number }
  rankedProfiles: ProfileView[]
  coreProfiles: ProfileView[]
  hasContributors: boolean
}

const copy = {
  bn: {
    countClassifier: 'টি',
    countUnit: 'সাইটে যোগ হওয়া কাজ',
    countTitle: (name: string) => `${name}-এর মার্জ হওয়া পুল রিকোয়েস্ট GitHub-এ দেখুন`,
    lastLabel: 'সর্বশেষ',
    summary: (people: string, pulls: string) => `${people} জন অবদানকারী · সাইটে যোগ হয়েছে ${pulls}টি কাজ`,
    refreshed: 'হালনাগাদ',
    coreTitle: 'কোর টিম',
    methodTitle: 'হিসাবটা কীভাবে হয়:',
    methodText:
      'রিভিউ পেরিয়ে সাইটে যোগ হওয়া কাজই আমরা গুনি। যাঁর কাজ বেশি, তিনি আগে থাকেন। সংখ্যা সমান হলে যাঁর কাজ সবচেয়ে নতুন তিনি আগে, তাতেও না মিললে নামের বর্ণানুক্রম ধরি। কোনো পয়েন্ট বা ওজন নেই, আর কোর টিমকে ক্রমে ধরা হয় না। নাম বদলাতে বা তালিকা থেকে সরাতে চাইলে',
    privacyLink: 'একটি ইস্যু খুলুন',
    stop: '।',
    emptyText: 'কমিউনিটির প্রথম কাজটা এখনো সাইটে যোগ হয়নি। আপনার নামই প্রথমে উঠতে পারে।'
  },
  en: {
    countClassifier: '',
    countUnit: 'merged',
    countTitle: (name: string) => `See ${name}'s merged pull requests on GitHub`,
    lastLabel: 'Latest',
    summary: (people: string, pulls: string) =>
      `${people} contributors · ${pulls} merged pull requests`,
    refreshed: 'Updated',
    coreTitle: 'Core team',
    methodTitle: 'How the count works:',
    methodText:
      'A contribution counts once a reviewer accepts it and it goes live on the site. More accepted work ranks higher, ties break on the most recent one, then on name. There are no points or weights, and the core team is not ranked. To rename or remove your entry,',
    privacyLink: 'open an issue',
    stop: '.',
    emptyText:
      'No community contribution has gone live yet. Yours could be the first name here.'
  }
} as const

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(value)
}

function formatDate(value: string | null, locale: Locale) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return null
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date)
}

function Avatar({ profile, locale }: { profile: ProfileView; locale: Locale }) {
  return (
    <span className="contributor-avatar">
      <span aria-hidden="true">{profile.monogram}</span>
      {profile.avatarUrl ? (
        <img
          src={profile.avatarUrl}
          alt={locale === 'bn' ? `${profile.displayName}-এর ছবি` : `${profile.displayName}'s photo`}
          width={72}
          height={72}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      ) : null}
    </span>
  )
}

function ContributorRow({ profile, locale }: { profile: ProfileView; locale: Locale }) {
  const text = copy[locale]
  const count = formatNumber(profile.mergedPullRequestCount, locale)
  const lastMerged = formatDate(profile.lastMergedAt, locale)

  return (
    <li className="contributor-row">
      <span className="contributor-row__rank" aria-hidden="true">
        {profile.rank ? formatNumber(profile.rank, locale) : ''}
      </span>
      <Avatar profile={profile} locale={locale} />
      <span className="contributor-row__identity">
        <strong>
          {profile.profileUrl ? (
            <a href={profile.profileUrl} rel="noopener noreferrer">
              {profile.displayName}
            </a>
          ) : (
            profile.displayName
          )}
        </strong>
        {profile.githubLogin ? <span>@{profile.githubLogin}</span> : null}
      </span>
      <span className="contributor-row__count">
        {profile.pullsUrl ? (
          <a href={profile.pullsUrl} rel="noopener noreferrer" title={text.countTitle(profile.displayName)}>
            <b>{count}{text.countClassifier}</b> {text.countUnit}
          </a>
        ) : (
          <span>
            <b>{count}{text.countClassifier}</b> {text.countUnit}
          </span>
        )}
        {lastMerged ? (
          <time dateTime={profile.lastMergedAt || undefined}>
            {text.lastLabel}: {lastMerged}
          </time>
        ) : null}
      </span>
    </li>
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
          <p className="contributor-summary">
            <span>
              {text.summary(
                formatNumber(view.totals.contributors, locale),
                formatNumber(view.totals.mergedPullRequests, locale)
              )}
            </span>
            {refreshed ? (
              <time dateTime={view.refreshedAt || undefined}>
                {text.refreshed}: {refreshed}
              </time>
            ) : null}
          </p>

          <ol className="contributor-list">
            {view.rankedProfiles.map((profile) => (
              <ContributorRow key={`${profile.rank}:${profile.displayName}`} profile={profile} locale={locale} />
            ))}
          </ol>
        </>
      ) : (
        <p className="contributor-empty">{text.emptyText}</p>
      )}

      {view.coreProfiles.length ? (
        <>
          {/* Rendered by a component, so rehype-slug never sees it. Without an
              id the shell's "on this page" link has no target, and the list is
              added after hydration instead of shipping in the HTML. */}
          <h2 id="core-team">{text.coreTitle}</h2>
          <ul className="contributor-list contributor-list--core">
            {view.coreProfiles.map((profile) => (
              <ContributorRow key={profile.displayName} profile={profile} locale={locale} />
            ))}
          </ul>
        </>
      ) : null}

      <p className="contributor-method">
        <strong>{text.methodTitle}</strong> {text.methodText}{' '}
        <a href={privacyIssueUrl}>{text.privacyLink}</a>
        {text.stop}
      </p>
    </section>
  )
}
