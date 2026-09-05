/**
 * Curated sidebar navigation. Section hub pages list their own children
 * automatically (see SectionIndex) – only top-level curation lives here.
 * Primary IA is five stable choices (Start Here, Guides, Tools, Case Studies,
 * Directory) plus the contributor group; /guides lists every
 * topic hub, so the sidebar only surfaces the most-used ones.
 */
import { REPOSITORY_URL, SOCIAL_PROFILE_URLS } from './seo.config.mjs'

export const REPO_URL = REPOSITORY_URL
export const DISCORD_URL = 'https://discord.gg/Wsgn3CaFyD'
export const FACEBOOK_GROUP_URL = 'https://www.facebook.com/groups/deshistartup/'
export const FACEBOOK_URL = SOCIAL_PROFILE_URLS.facebook
export const LINKEDIN_URL = SOCIAL_PROFILE_URLS.linkedin
export const YOUTUBE_URL = SOCIAL_PROFILE_URLS.youtube

export interface NavSection {
  label: string
  disclosureLabel?: string
  items: [string, string][]
}

export const bnNav: NavSection[] = [
  {
    label: 'শুরু করুন',
    items: [
      ['/start-here', 'প্রথমবার? শুরু করুন'],
      ['/roadmap', 'ধাপে ধাপে রোডম্যাপ'],
      ['/ecosystem', 'বাংলাদেশের স্টার্টআপ ইকোসিস্টেম']
    ]
  },
  {
    label: 'গাইড',
    disclosureLabel: 'বিষয় ধরে খুঁজুন',
    items: [
      ['/guides', 'সব টপিকের তালিকা'],
      ['/ideas', 'আইডিয়া ও মার্কেট রিসার্চ'],
      ['/validation', 'আইডিয়া ভ্যালিডেশন'],
      ['/registration', 'ব্যবসা রেজিস্ট্রেশন'],
      ['/tax', 'ট্যাক্স, ভ্যাট ও অ্যাকাউন্টিং'],
      ['/payments', 'পেমেন্ট'],
      ['/operations', 'ডেলিভারি ও অপারেশন'],
      ['/metrics', 'মেট্রিকস ও হিসাব'],
      ['/customers', 'কাস্টমার ও সেলস'],
      ['/team', 'টিম ও নিয়োগ'],
      ['/funding', 'ফান্ডিং ও স্কেলিং'],
      ['/founder-life', 'ফাউন্ডার লাইফ']
    ]
  },
  {
    label: 'রিসোর্স',
    items: [
      ['/tools', 'টেমপ্লেট ও টুলস'],
      ['/case-studies', 'কেস স্টাডি'],
      ['/directory', 'ইকোসিস্টেম ডিরেক্টরি'],
      ['/startup-50', 'দেশি স্টার্টআপ ৫০'],
      ['/start-here/glossary', 'স্টার্টআপ শব্দকোষ']
    ]
  },
  {
    label: 'আমাদের সম্পর্কে',
    disclosureLabel: 'যোগাযোগ ও কন্ট্রিবিউশন',
    items: [
      ['/about', 'দেশি স্টার্টআপ ও সম্পাদকীয় নীতি'],
      ['/contact', 'যোগাযোগ করুন'],
      ['/contribute', 'কন্ট্রিবিউট করুন'],
      ['/contributors', 'কন্ট্রিবিউটর'],
    ]
  }
]

export const enNav: NavSection[] = [
  {
    label: 'Start Here',
    items: [
      ['/en/start-here', 'Start here'],
      ['/en/roadmap', 'Step-by-step roadmap'],
      ['/en/ecosystem', 'Bangladesh ecosystem']
    ]
  },
  {
    label: 'Guides',
    disclosureLabel: 'Browse by topic',
    items: [
      ['/en/guides', 'All topics'],
      ['/en/ideas', 'Ideas & market research'],
      ['/en/validation', 'Idea validation'],
      ['/en/registration', 'Business registration'],
      ['/en/tax', 'Tax, VAT & accounting'],
      ['/en/payments', 'Payments'],
      ['/en/operations', 'Delivery & operations'],
      ['/en/metrics', 'Metrics & finances'],
      ['/en/customers', 'Customers & sales'],
      ['/en/team', 'Team & hiring'],
      ['/en/funding', 'Funding & scaling'],
      ['/en/founder-life', 'Founder life']
    ]
  },
  {
    label: 'Resources',
    items: [
      ['/en/tools', 'Templates & tools'],
      ['/en/case-studies', 'Case studies'],
      ['/en/directory', 'Ecosystem directory'],
      ['/en/startup-50', 'Deshi Startup 50'],
      ['/en/start-here/glossary', 'Startup glossary']
    ]
  },
  {
    label: 'About & Community',
    disclosureLabel: 'Contact & contribute',
    items: [
      ['/en/about', 'About & editorial policy'],
      ['/en/contact', 'Contact us'],
      ['/en/contribute', 'Contribute'],
      ['/en/contributors', 'Contributors'],
    ]
  }
]
