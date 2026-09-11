import SectionIndex from './SectionIndex'
import './DirectoryIndex.css'

type Locale = 'bn' | 'en'
type CategoryCopy = { title: Record<Locale, string>; description: Record<Locale, string>; icon: string }

// Presentation copy only. SectionIndex owns the available routes and their status.
const categories: Record<string, CategoryCopy> = {
  investors: {
    title: { en: 'Investors', bn: 'ইনভেস্টর' },
    description: { en: 'Compare investors by stage, sector, cheque size and contact route.', bn: 'স্টেজ, খাত, চেক সাইজ আর যোগাযোগের উপায় মিলিয়ে ইনভেস্টর শর্টলিস্ট করুন।' },
    icon: 'M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4 18.4 5.6',
  },
  accelerators: {
    title: { en: 'Accelerators', bn: 'অ্যাক্সিলারেটর' },
    description: { en: 'Find accelerators, incubators and support programmes by stage, sector and benefits.', bn: 'স্টেজ, খাত ও সুযোগ-সুবিধা মিলিয়ে অ্যাক্সিলারেটর, ইনকিউবেটর আর সাপোর্ট প্রোগ্রাম বাছুন।' },
    icon: 'm5 18 5-6-5-6m9 12 5-6-5-6',
  },
  'government-funding': {
    title: { en: 'Government funding', bn: 'সরকারি ফান্ডিং' },
    description: { en: 'Compare grants, investment and financing programmes by eligibility, stage, amount and deadline.', bn: 'যোগ্যতা, স্টেজ, ফান্ডের পরিমাণ আর ডেডলাইন মিলিয়ে সরকারি অনুদান, ইনভেস্টমেন্ট ও ফান্ডিং প্রোগ্রাম খুঁজুন।' },
    icon: 'm3 8 9-5 9 5H3Zm3 3v7m6-7v7m6-7v7M3 21h18',
  },
  'payment-gateways': {
    title: { en: 'Payment gateways', bn: 'পেমেন্ট গেটওয়ে' },
    description: { en: 'Compare fees, settlement, payment methods and documents needed for a merchant account.', bn: 'ফি, সেটেলমেন্ট, পেমেন্টের মাধ্যম আর মার্চেন্ট অ্যাকাউন্টের ডকুমেন্ট মিলিয়ে পেমেন্ট গেটওয়ে বাছুন।' },
    icon: 'M3 5h18v14H3V5Zm0 5h18M6 15h4',
  },
  couriers: {
    title: { en: 'Couriers', bn: 'কুরিয়ার' },
    description: { en: 'Compare coverage, COD charges, delivery rates, returns and API support for your routes.', bn: 'নিজের রুটের জন্য কভারেজ, COD চার্জ, ডেলিভারি রেট, রিটার্ন পলিসি আর API সাপোর্ট মিলিয়ে কুরিয়ার শর্টলিস্ট করুন।' },
    icon: 'm3 7 9-4 9 4v10l-9 4-9-4V7Zm0 0 9 4 9-4m-9 4v10M7.5 5l9 4v4',
  },
  'legal-accounting': {
    title: { en: 'Legal & accounting', bn: 'লিগ্যাল ও অ্যাকাউন্টিং' },
    description: { en: 'Find law and accountancy firms by services, specialty, languages and fee model.', bn: 'সার্ভিস, বিশেষত্ব, ভাষা আর ফি মডেল মিলিয়ে লিগ্যাল ও অ্যাকাউন্টিং ফার্ম খুঁজুন।' },
    icon: 'M5 3h10l4 4v14H5V3Zm10 0v5h4M8 12h8m-8 4h6',
  },
  'government-services': {
    title: { en: 'Government services', bn: 'সরকারি সেবা' },
    description: { en: 'Find official portals for company registration, e-TIN, VAT, trade licences and investment services.', bn: 'কোম্পানি রেজিস্ট্রেশন, e-TIN, ভ্যাট, ট্রেড লাইসেন্স ও ইনভেস্টমেন্ট সার্ভিসের অফিশিয়াল পোর্টাল খুঁজে নিন।' },
    icon: 'M3 3h18v18H3V3Zm0 5h18M7 13l3 3 7-5',
  },
  coworking: {
    title: { en: 'Coworking', bn: 'কোওয়ার্কিং' },
    description: { en: 'Compare Dhaka workspaces by location, hours, facilities and published prices.', bn: 'লোকেশন, সময়, সুযোগ-সুবিধা আর পাবলিশ করা প্রাইস মিলিয়ে ঢাকার কোওয়ার্কিং স্পেস শর্টলিস্ট করুন।' },
    icon: 'M3 11h18M5 11v10m14-10v10M7 3h10v5H7V3ZM2 17h6m8 0h6',
  },
}

export default function DirectoryIndex({ locale = 'bn' }: { locale?: Locale }) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return <div className="directory-index">
    <SectionIndex section="directory" locale={locale} showHeader={false}
      id={locale === 'en' ? 'directory-categories' : 'ডিরেক্টরি-ক্যাটাগরি'}
      heading={locale === 'en' ? 'Directory categories' : 'ডিরেক্টরি ক্যাটাগরি'}
      renderCollection={pages => <ul className="directory-gallery">
        {pages.filter(page => !page[2]).map(([route, title, , description]) => {
          const category = categories[route.split('/').pop()!]
          return <li key={route}>
            <a className="directory-category" href={`${basePath}${route}`}>
              <span className="directory-category__symbols" aria-hidden="true">
                <svg className="directory-category__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d={category?.icon || 'M4 4h16v16H4V4Zm4 5h8m-8 6h8'} /></svg>
                <svg className="directory-category__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
              </span>
              <h2 data-toc-ignore>{category?.title[locale] || title}</h2>
              <p>{category?.description[locale] || description}</p>
            </a>
          </li>
        })}
      </ul>} />
  </div>
}
