/**
 * Curated sidebar navigation. Section hub pages list their own children
 * automatically (see SectionIndex) – only top-level curation lives here.
 */
export const REPO_URL = 'https://github.com/Deshi-Startup/deshistartup'

export const bnNav = [
  {
    label: 'শুরু করুন',
    items: [
      ['/start-here', 'শুরুর রোডম্যাপ'],
      ['/start-here/what-is-a-startup', 'স্টার্টআপ আসলে কী'],
      ['/ecosystem-overview', 'বাংলাদেশের ইকোসিস্টেম']
    ]
  },
  {
    label: 'কোন পথে যাবেন',
    items: [['/journeys', 'লক্ষ্য অনুযায়ী গাইডেড পথ']]
  },
  {
    label: 'টেমপ্লেট ও টুলস',
    items: [['/tools', 'চেকলিস্ট, স্ক্রিপ্ট ও ক্যালকুলেটর']]
  },
  {
    label: 'আইডিয়া ও যাচাই',
    items: [
      ['/idea-validation', 'আইডিয়া যাচাই'],
      ['/phase-one/how-to-find-startup-ideas-in-bangladesh', 'আইডিয়া খোঁজা']
    ]
  },
  {
    label: 'আইন, নিবন্ধন ও কর',
    items: [
      ['/legal-roadmap', 'আইনি রোডম্যাপ'],
      ['/company-types', 'কোম্পানির ধরন'],
      ['/registration', 'ব্যবসা নিবন্ধন'],
      ['/rjsc-name-clearance', 'RJSC ও নাম ছাড়পত্র'],
      ['/trade-license', 'ট্রেড লাইসেন্স'],
      ['/e-tin-vat-bin', 'e-TIN ও ভ্যাট/BIN']
    ]
  },
  {
    label: 'টাকা, গ্রাহক ও দল',
    items: [
      ['/payments', 'পেমেন্ট ব্যবস্থা'],
      ['/customers', 'গ্রাহক খোঁজা ও বিক্রি'],
      ['/founder-life', 'উদ্যোক্তার জীবন']
    ]
  },
  {
    label: 'ধাপে ধাপে রোডম্যাপ',
    items: [
      ['/phase-one', 'ধাপ ১ · আইডিয়া থেকে ভিত্তি'],
      ['/phase-two', 'ধাপ ২ · পণ্য, দল ও নিয়ম'],
      ['/phase-three', 'ধাপ ৩ · বিক্রি ও ফান্ডিং'],
      ['/phase-four', 'ধাপ ৪ · স্কেল ও সরকারি সুবিধা']
    ]
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
      ['/contribute', 'কীভাবে অবদান রাখবেন'],
      [REPO_URL, 'GitHub-এ দেখুন'],
      [`${REPO_URL}/issues/new`, 'ভুল জানান']
    ]
  }
]

export const enNav = [
  {
    label: 'Start Here',
    items: [
      ['/en/start-here', 'Starter roadmap'],
      ['/en/start-here/what-is-a-startup', 'What is a startup?'],
      ['/en/ecosystem-overview', 'Bangladesh ecosystem']
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
    label: 'Idea & Validation',
    items: [['/en/idea-validation', 'Idea validation']]
  },
  {
    label: 'Legal, Registration & Tax',
    items: [
      ['/en/legal-roadmap', 'Legal roadmap'],
      ['/en/company-types', 'Company types'],
      ['/en/registration', 'Business registration'],
      ['/en/rjsc-name-clearance', 'RJSC & name clearance'],
      ['/en/trade-license', 'Trade license'],
      ['/en/e-tin-vat-bin', 'e-TIN, VAT & BIN']
    ]
  },
  {
    label: 'Money, Customers & Team',
    items: [
      ['/en/payments', 'Payments'],
      ['/en/customers', 'Finding customers'],
      ['/en/founder-life', 'Founder life']
    ]
  },
  {
    label: 'Step-by-step Roadmap',
    items: [
      ['/en/phase-one', 'Phase 1 · Idea to foundation'],
      ['/en/phase-two', 'Phase 2 · Product, team & rules'],
      ['/en/phase-three', 'Phase 3 · Sales & funding'],
      ['/en/phase-four', 'Phase 4 · Scale & govt support']
    ]
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
      ['/en/contribute', 'How to contribute'],
      [REPO_URL, 'View on GitHub'],
      [`${REPO_URL}/issues/new`, 'Report a mistake']
    ]
  }
]
