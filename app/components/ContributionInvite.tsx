const CONTRIBUTION_EMAIL = 'hello@deshistartup.com'

interface ContributionInviteProps {
  locale?: 'bn' | 'en'
  kind?: 'team' | 'share'
}

const copy = {
  bn: {
    team: {
      action: 'কন্ট্রিবিউটর টিমের ফর্ম পূরণ করুন',
      note: 'ছোট ফর্মটিতে আপনার কাজ, দক্ষতা ও কতটা সময় দিতে পারবেন, তা জানতে চাওয়া হবে।',
      href: 'https://forms.gle/PfaiTxBQSVzciZQU9'
    },
    share: {
      action: 'কাজ বা রিসোর্স শেয়ার করুন',
      note: 'ইমেইল খুলবে। লিংক বা ফাইল, কেন কাজে লাগতে পারে, আর ক্রেডিট কীভাবে চান, এই তিনটা কথা লিখলেই হবে।',
      subject: 'দেশি স্টার্টআপে কাজ বা রিসোর্স',
      body: 'আমি যা শেয়ার করতে চাই:\n\nলিংক বা ফাইল:\n\nএটি কেন কাজে লাগতে পারে:\n\nআমাকে যেভাবে ক্রেডিট দিতে পারেন:'
    }
  },
  en: {
    team: {
      action: 'Complete the contributor-team form',
      note: 'The short form asks about your work, skills, and availability.',
      href: 'https://forms.gle/PfaiTxBQSVzciZQU9'
    },
    share: {
      action: 'Share your work or resources',
      note: 'This opens an email. Add the link or file, why it may help, and how you would like to be credited.',
      subject: 'Work or resource for Deshi Startup',
      body: 'What I would like to share:\n\nLink or file:\n\nWhy it may help:\n\nHow I would like to be credited:'
    }
  }
} as const

export default function ContributionInvite({ locale = 'bn', kind = 'share' }: ContributionInviteProps) {
  const t = copy[locale][kind]
  const href = 'href' in t
    ? t.href
    : `mailto:${CONTRIBUTION_EMAIL}?subject=${encodeURIComponent(t.subject)}&body=${encodeURIComponent(t.body)}`

  return (
    <div className="contribution-invite">
      <a className="contribution-invite__action" href={href}>
        {t.action}
      </a>
      <p>
        {t.note}
        {kind === 'share' && (
          <>
            {' '}
            <a href={`mailto:${CONTRIBUTION_EMAIL}`}>{CONTRIBUTION_EMAIL}</a>
          </>
        )}
      </p>
    </div>
  )
}
