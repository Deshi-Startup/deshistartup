/**
 * Curated sidebar navigation. Section hub pages list their own children
 * automatically (see SectionIndex) – only top-level curation lives here.
 * Primary IA is six stable choices (Start Here, Guides, Journeys, Tools,
 * Case Studies, Directory) plus the contributor group; /guides lists every
 * topic hub, so the sidebar only surfaces the most-used ones.
 */
export const REPO_URL = 'https://github.com/Deshi-Startup/deshistartup'

export const bnNav = [
  {
    label: 'শুরু করুন',
    items: [
      ['/start-here', 'শুরুর রোডম্যাপ'],
      ['/roadmap', 'ধাপে ধাপে রোডম্যাপ'],
      ['/ecosystem', 'বাংলাদেশের ইকোসিস্টেম']
    ]
  },
  {
    label: 'গাইড',
    items: [
      ['/guides', 'সব বিষয়ের তালিকা'],
      ['/ideas', 'আইডিয়া ও বাজার গবেষণা'],
      ['/validation', 'আইডিয়া যাচাই'],
      ['/registration', 'ব্যবসা রেজিস্ট্রেশন'],
      ['/tax', 'কর, ভ্যাট ও হিসাবরক্ষণ'],
      ['/payments', 'পেমেন্ট ব্যবস্থা'],
      ['/customers', 'গ্রাহক খোঁজা ও বিক্রি'],
      ['/team', 'টিম ও নিয়োগ'],
      ['/funding', 'ফান্ডিং'],
      ['/founder-life', 'উদ্যোক্তার জীবন']
    ]
  },
  {
    label: 'কোন পথে যাবেন',
    items: [['/journeys', 'লক্ষ্য ধরে সাজানো পথ']]
  },
  {
    label: 'টেমপ্লেট ও টুলস',
    items: [['/tools', 'চেকলিস্ট, স্ক্রিপ্ট ও ক্যালকুলেটর']]
  },
  {
    label: 'কেস স্টাডি',
    items: [['/case-studies', 'বাংলাদেশি স্টার্টআপের গল্প']]
  },
  {
    label: 'ডিরেক্টরি',
    items: [['/directory', 'ইকোসিস্টেম ডিরেক্টরি']]
  },
  {
    label: 'অংশ নিন',
    items: [
      ['/about', 'পরিচিতি ও সম্পাদকীয় নীতি'],
      ['/contribute', 'কীভাবে অবদান রাখবেন'],
      [REPO_URL, 'GitHub-এ দেখুন'],
      [`${REPO_URL}/issues/new?template=report-mistake.yml`, 'ভুল জানান']
    ]
  }
]

export const enNav = [
  {
    label: 'Start Here',
    items: [
      ['/en/start-here', 'Starter roadmap'],
      ['/en/roadmap', 'Step-by-step roadmap'],
      ['/en/ecosystem', 'Bangladesh ecosystem']
    ]
  },
  {
    label: 'Guides',
    items: [
      ['/en/guides', 'All topics'],
      ['/en/ideas', 'Ideas & market research'],
      ['/en/validation', 'Idea validation'],
      ['/en/registration', 'Business registration'],
      ['/en/tax', 'Tax, VAT & bookkeeping'],
      ['/en/payments', 'Payments'],
      ['/en/customers', 'Finding customers'],
      ['/en/team', 'Team & hiring'],
      ['/en/funding', 'Funding'],
      ['/en/founder-life', 'Founder life']
    ]
  },
  {
    label: 'Journeys',
    items: [['/en/journeys', 'Guided paths by goal']]
  },
  {
    label: 'Templates & Tools',
    items: [['/en/tools', 'Checklists, scripts & calculators']]
  },
  {
    label: 'Case Studies',
    items: [['/en/case-studies', 'Bangladeshi startup stories']]
  },
  {
    label: 'Directory',
    items: [['/en/directory', 'Ecosystem directory']]
  },
  {
    label: 'Take Part',
    items: [
      ['/en/about', 'About & editorial policy'],
      ['/en/contribute', 'How to contribute'],
      [REPO_URL, 'View on GitHub'],
      [`${REPO_URL}/issues/new?template=report-mistake.yml`, 'Report a mistake']
    ]
  }
]
