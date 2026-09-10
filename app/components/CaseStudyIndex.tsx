import SectionIndex, { type PageInfo } from './SectionIndex'
import { CaseLogo, type CaseLocale } from './CaseStudy'
import './CaseStudyIndex.css'

const covers = {
  pathao: {
    theme: 'pathao',
    sector: { en: 'Mobility & logistics', bn: 'যাতায়াত ও লজিস্টিকস' },
    title: { en: ['A small start.', 'A costly expansion.'], bn: ['ছোট করে শুরু।', 'দ্রুত বাড়ার ধাক্কা।'] },
    summary: {
      en: 'Manual delivery, the move into rides, and the cost of losing focus.',
      bn: 'ডেলিভারি দিয়ে শুরু, রাইডে বড় সাফল্য আর সুপার অ্যাপ বানাতে গিয়ে মূল ব্যবসায় ফোকাস হারানোর গল্প।'
    }
  },
  '10-minute-school': {
    theme: 'school',
    sector: { en: 'Education', bn: 'শিক্ষা' },
    title: { en: ['Free lessons.', 'A test of paid demand.'], bn: ['ফ্রি ক্লাস।', 'পেইড মডেলের পরীক্ষা।'] },
    summary: {
      en: 'Free teaching, fragile sponsorship and a small test of willingness to pay.',
      bn: 'স্পন্সরের টাকায় ফ্রি ক্লাস, স্পন্সরশিপ বন্ধের ধাক্কা আর বই বিক্রি করে পেইড মডেল যাচাইয়ের গল্প।'
    }
  },
  bkash: {
    theme: 'bkash',
    sector: { en: 'Payments', bn: 'পেমেন্ট' },
    title: { en: ['How trust travels', 'through a network.'], bn: ['এজেন্ট নেটওয়ার্কে', 'ভরসা এলো কীভাবে?'] },
    summary: {
      en: 'How agent networks and everyday small transactions built financial trust across Bangladesh.',
      bn: 'এজেন্ট নেটওয়ার্ক আর প্রতিদিনের ছোট লেনদেন দিয়ে দেশজুড়ে মানুষের ভরসা তৈরির গল্প।'
    }
  },
  'shopup-silq': {
    theme: 'shopup',
    sector: { en: 'B2B & logistics', bn: 'বিটুবি ও লজিস্টিকস' },
    title: { en: ['From local shops', 'to cross-border scale.'], bn: ['পাড়ার দোকান থেকে', 'সীমানা ছাড়িয়ে।'] },
    summary: {
      en: 'Retailer supply, MSME financing and the regional merger to form SILQ.',
      bn: 'মুদি দোকানে পাইকারি সাপ্লাই, ছোট ব্যবসায়ীদের লোন আর Sary-র সাথে মার্জার করে SILQ হয়ে ওঠার গল্প।'
    }
  },
  myalice: {
    theme: 'revora',
    logoSlug: 'revora',
    name: 'Revora',
    sector: { en: 'Commerce software', bn: 'ব্যবসার সফটওয়্যার' },
    title: { en: ['From scattered chats', 'to one shared inbox.'], bn: ['এলোমেলো চ্যাট থেকে', 'এক ইনবক্সে।'] },
    summary: {
      en: 'Customer conversations, merchant workflows and the move from MyAlice to Revora.',
      bn: 'কাস্টমার চ্যাট, সেলারদের কাজের ঝামেলা কমানো আর MyAlice থেকে Revora হয়ে ওঠার গল্প।'
    }
  },
  shikho: {
    theme: 'shikho',
    sector: { en: 'Education', bn: 'শিক্ষা' },
    title: { en: ['The classroom,', 'beyond its walls.'], bn: ['ক্লাসরুমের বাইরেও', 'পড়াশোনা।'] },
    summary: {
      en: 'Animated lessons, live coaching and scaling an edtech platform across Bangladesh.',
      bn: 'অ্যানিমেটেড ক্লাস, লাইভ কোচিং আর দেশজুড়ে এডটেক প্ল্যাটফর্ম বড় করার গল্প।'
    }
  },
  'truck-lagbe': {
    theme: 'truck-lagbe',
    sector: { en: 'Freight & logistics', bn: 'পণ্য পরিবহন' },
    title: { en: ['A truck to book.', 'A load to move.'], bn: ['পণ্য যাবে দূরে।', 'ট্রাক মিলবে সহজে।'] },
    summary: {
      en: 'Digitising freight, matching shippers with drivers and tackling empty return trips.',
      bn: 'ডিজিটাল ফ্রেইট প্ল্যাটফর্ম, পণ্যমালিকদের সাথে ট্রাক ড্রাইভার মেলানো আর ফিরতি ট্রিপে লোড পাওয়ার লড়াই।'
    }
  },
  chaldal: {
    theme: 'chaldal',
    sector: { en: 'Online grocery', bn: 'অনলাইন গ্রোসারি' },
    title: { en: ['Fresh groceries.', 'Dark-store speed.'], bn: ['তাজা বাজার।', 'দ্রুত ডেলিভারি।'] },
    summary: {
      en: 'Micro-warehouses, cold-chain operations and the daily race of grocery delivery.',
      bn: 'মাইক্রো-ওয়্যারহাউজ নেটওয়ার্ক, কোল্ড চেইন আর ঘরে ঘরে প্রতিদিনের বাজার পৌঁছে দেওয়ার লড়াই।'
    }
  },
  shohoz: {
    theme: 'shohoz',
    sector: { en: 'Travel & ticketing', bn: 'ভ্রমণ ও টিকিট' },
    title: { en: ['A ticket booked.', 'A journey started.'], bn: ['অনলাইনে টিকিট।', 'ঝামেলাহীন যাত্রা।'] },
    summary: {
      en: 'Bus ticketing scale, the battle in ride-hailing and operating railway reservations.',
      bn: 'বাসের টিকিটিংয়ে দাপট, রাইড-হেইলিংয়ের লড়াই আর ট্রেনের অনলাইন টিকিট সামলানোর গল্প।'
    }
  },
  dorik: {
    theme: 'dorik',
    sector: { en: 'Software', bn: 'সফটওয়্যার' },
    title: { en: ['Build in Sylhet.', 'Sell to the world.'], bn: ['সিলেটে তৈরি,', 'বিশ্বজুড়ে বিক্রি।'] },
    summary: {
      en: 'How a lean team in Sylhet built a global no-code website platform.',
      bn: 'সিলেটে বসে ছোট একটা টিম কীভাবে গ্লোবাল নো-কোড ওয়েবসাইট প্ল্যাটফর্ম গড়ে তুলল।'
    }
  },
  arogga: {
    theme: 'arogga',
    sector: { en: 'Health', bn: 'স্বাস্থ্য' },
    title: { en: ['Genuine medicine.', 'Doorstep care.'], bn: ['আসল ওষুধ।', 'ঘরে বসেই ভরসা।'] },
    summary: {
      en: 'Prescription verification, licensed supply chains and winning patient trust in healthcare.',
      bn: 'প্রেসক্রিপশন যাচাই, লাইসেন্সপ্রাপ্ত সাপ্লাই চেইন আর স্বাস্থ্যসেবায় রোগীদের ভরসা তৈরির গল্প।'
    }
  },
  ifarmer: {
    theme: 'ifarmer',
    sector: { en: 'Agriculture', bn: 'কৃষি' },
    title: { en: ['Where finance', 'meets the field.'], bn: ['পুঁজি থেকে', 'মাঠের ফসল।'] },
    summary: {
      en: 'Connecting retail capital with farm inputs, advisory and direct market access.',
      bn: 'খামারিদের জন্য পুঁজির ব্যবস্থা, কৃষি উপকরণ, পরামর্শ সেবা আর সরাসরি বাজারে ফসল বিক্রির মডেল।'
    }
  }
} as const



const additionalArtwork = {
  shopup: (
    <svg viewBox="0 0 330 200" fill="none" focusable="false">
      <path d="M165 76v30M57 132v-26h216v26M165 106v26" stroke="#b1d8ef" strokeWidth="2" />
      <rect x="129" y="22" width="72" height="54" rx="3" fill="#fff0d1" />
      <path d="M153 22v19h24V22M143 62h17" stroke="#307594" strokeWidth="2" />
      {[29, 137, 245].map((x) => <g key={x}>
        <rect x={x} y="141" width="56" height="39" fill="#fff0d1" />
        <path d={`M${x - 5} 141l6-17h54l6 17z`} fill="#f49c62" />
        <path d={`M${x + 19} 180v-24h18v24`} stroke="#307594" strokeWidth="2" />
      </g>)}
    </svg>
  ),
  revora: (
    <svg viewBox="0 0 330 200" fill="none" focusable="false">
      <path d="M105 43h53v57m-49 52h49v-52m-47-3h71" stroke="#99a889" strokeWidth="2" />
      <path d="M28 23h77v40H45L28 76z" fill="#dbed91" />
      <path d="M39 80h72v34H54l-15 12z" fill="#b9d17b" />
      <path d="M32 132h77v40H49l-17 13z" fill="#f3ebc8" />
      <path d="M43 37h46m-46 12h29M53 95h43m-49 51h47m-47 12h27" stroke="#3c4b28" strokeWidth="2" />
      <rect x="183" y="48" width="120" height="111" rx="5" fill="#f8f6e9" />
      <path d="M199 67h54M199 91h88m-88 25h88m-88 25h88" stroke="#b5bba6" strokeWidth="2" />
      <path d="m266 67 5 5 10-11" stroke="#4c692e" strokeWidth="2" />
      <circle cx="205" cy="103" r="4" fill="#a0ba5c" /><path d="M217 103h53m-53 26h62" stroke="#526242" strokeWidth="3" />
    </svg>
  ),
  shikho: (
    <svg viewBox="0 0 330 200" fill="none" focusable="false">
      <rect x="31" y="29" width="212" height="141" rx="4" fill="#eee9ff" />
      <path d="M31 52h212M47 42h24" stroke="#b4a4d9" strokeWidth="2" />
      <path d="M59 143V76h151" stroke="#b4a4d9" strokeWidth="1.5" />
      <path d="m64 138 62-55 57 55H64Z" stroke="#69518f" strokeWidth="2" />
      <path d="M126 83v55" stroke="#a38abb" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M115 138v-11h11" stroke="#69518f" strokeWidth="1.5" />
      <circle cx="259" cy="113" r="43" fill="#f18a9b" />
      <path d="m249 94 27 19-27 19z" fill="#542963" />
    </svg>
  ),
  'truck-lagbe': (
    <svg viewBox="0 0 330 200" fill="none" focusable="false">
      <path d="M24 174h282M39 42h60m-40 15h40" stroke="#ebb68f" strokeWidth="2" />
      <rect x="46" y="74" width="158" height="69" rx="3" fill="#f7ead3" />
      <path d="M204 94h41l34 29v20h-75z" fill="#e8b454" />
      <path d="M219 105h21l21 18h-42z" fill="#8a4030" />
      <path d="M62 89v37m18-37v37m18-37v37m18-37v37m18-37v37m18-37v37m18-37v37m18-37v37" stroke="#c79674" strokeWidth="2" />
      <path d="M39 147h247" stroke="#f7ead3" strokeWidth="4" />
      <circle cx="82" cy="151" r="17" fill="#f7ead3" /><circle cx="82" cy="151" r="7" fill="#622a24" />
      <circle cx="246" cy="151" r="17" fill="#f7ead3" /><circle cx="246" cy="151" r="7" fill="#622a24" />
      <path d="M228 47h57m-11-11 11 11-11 11" stroke="#e8b454" strokeWidth="3" />
    </svg>
  ),
  chaldal: (
    <svg viewBox="0 0 330 200" fill="none" focusable="false">
      <path d="M31 33v132m113-132v132M27 94h125M27 151h125" stroke="#93662f" strokeWidth="2" />
      <rect x="45" y="50" width="39" height="44" rx="2" fill="#c36c43" /><path d="M58 50v12h13V50" stroke="#fae8bc" strokeWidth="2" />
      <rect x="97" y="68" width="29" height="26" rx="2" fill="#6b7851" />
      <rect x="45" y="112" width="80" height="39" rx="2" fill="#6b7851" /><path d="M58 127h52m-52 10h37" stroke="#fae8bc" strokeWidth="2" />
      <path d="M201 77V58a22 22 0 0 1 44 0v19" stroke="#785328" strokeWidth="3" />
      <path d="m181 74 8 88h89l8-88z" fill="#fff6de" />
      <path d="m199 126 16 12 31-31" stroke="#76894b" strokeWidth="3" />
      <path d="M166 104h39m-8-8 8 8-8 8" stroke="#ba6940" strokeWidth="2" />
    </svg>
  ),
  shohoz: (
    <svg viewBox="0 0 330 200" fill="none" focusable="false">
      <g transform="rotate(-8 165 100)">
        <path d="M38 44h254v42a15 15 0 0 0 0 30v42H38v-42a15 15 0 0 0 0-30z" fill="#f2f2d8" />
        <path d="M228 44v114" stroke="#90a98a" strokeWidth="2" strokeDasharray="4 5" />
        <circle cx="65" cy="76" r="5" fill="#366d50" /><circle cx="198" cy="76" r="5" fill="#366d50" />
        <path d="M76 76h110m-8-6 8 6-8 6" stroke="#366d50" strokeWidth="2" />
        <path d="M61 112h71m-71 16h103" stroke="#8d9e73" strokeWidth="3" />
        <path d="M245 70v62m7-62v62m5-62v62m9-62v62m6-62v62" stroke="#366d50" strokeWidth="2" />
      </g>
    </svg>
  ),
  bkash: (<svg viewBox="0 0 330 200" fill="none" focusable="false"><g stroke="#f5afca" strokeWidth="2"><path d="M165 100 45 45m120 55L285 45M165 100 45 160m120-60 120 60M165 100V20m0 80v80"/></g><g fill="#ffd6e8"><circle cx="45" cy="45" r="11"/><circle cx="285" cy="45" r="11"/><circle cx="45" cy="160" r="11"/><circle cx="285" cy="160" r="11"/><circle cx="165" cy="20" r="11"/><circle cx="165" cy="180" r="11"/></g><circle cx="165" cy="100" r="37" fill="#fff5ec"/><path d="m151 100 10 10 20-22" stroke="#a50950" strokeWidth="3"/></svg>),
  dorik: (<svg viewBox="0 0 330 200" fill="none" focusable="false"><rect x="30" y="25" width="270" height="154" rx="5" fill="#f7f4ff"/><path d="M30 49h270" stroke="#bbb3da"/><circle cx="43" cy="37" r="3" fill="#807696"/><rect x="48" y="68" width="106" height="10" rx="2" fill="#3c3267"/><rect x="48" y="88" width="86" height="5" rx="2" fill="#b1a5ce"/><rect x="48" y="101" width="96" height="5" rx="2" fill="#b1a5ce"/><rect x="48" y="126" width="63" height="27" rx="3" fill="#8c78d1"/><rect x="176" y="67" width="102" height="93" rx="3" fill="#d9d0ed"/><path d="m242 135 38 18-16 4-6 16z" fill="#fff" stroke="#302753" strokeWidth="2"/></svg>),
  arogga: (<svg viewBox="0 0 330 200" fill="none" focusable="false"><path d="M45 100h240" stroke="#88d1bc" strokeWidth="2" strokeDasharray="4 5"/><rect x="39" y="53" width="69" height="95" rx="5" fill="#e5f4d8"/><path d="M53 71h39m-39 13h31m-31 13h36" stroke="#497b69" strokeWidth="2"/><circle cx="167" cy="101" r="26" fill="#b9e1b0"/><path d="m156 101 8 8 15-17" stroke="#13554c" strokeWidth="3"/><path d="m232 75 29-15 29 15v54l-29 15-29-15z" fill="#e5f4d8"/><path d="m232 75 29 15 29-15m-29 15v54" stroke="#497b69" strokeWidth="2"/></svg>),
  ifarmer: (<svg viewBox="0 0 330 200" fill="none" focusable="false"><path d="M0 150q75-55 165 0t165 0M0 170q75-55 165 0t165 0M0 190q75-55 165 0t165 0" stroke="#8a954e" strokeWidth="2"/><path d="M165 137V49" stroke="#2c513d" strokeWidth="3"/><path d="M165 83q-52 0-46-37 42 0 46 37m0 29q52 0 46-37-42 0-46 37" fill="#426849"/><circle cx="262" cy="39" r="21" fill="#ba7842"/></svg>)
}

type CoverTheme = (typeof covers)[keyof typeof covers]['theme']

function CoverArt({ theme, locale }: { theme: CoverTheme; locale: CaseLocale }) {
  if (theme !== 'school' && theme !== 'pathao') {
    return <div className="case-cover__art" aria-hidden="true">{additionalArtwork[theme]}</div>
  }
  return (
    <div className="case-cover__art" aria-hidden="true">
      {theme === 'school' ? (
        <svg viewBox="0 0 330 200" focusable="false">
          <g transform="rotate(-10 156 100)">
            <rect x="83" y="25" width="137" height="160" rx="3" fill="#aab797" />
            <rect x="72" y="18" width="137" height="160" rx="3" fill="#d7d3ad" />
            <rect x="61" y="11" width="137" height="160" rx="3" fill="#fff5d6" />
            <path d="M77 40h72M77 50h45M77 119h100M77 131h85M77 143h95" fill="none" stroke="#7d8c6c" strokeWidth="2" />
            <path d="m99 70 32 19-32 19z" fill="#cb392f" />
          </g>
          <circle cx="241" cy="115" r="39" fill="#efc86a" />
          <text x="241" y="112" textAnchor="middle" fontSize="11" fill="#153e32">{locale === 'en' ? 'PAID TEST' : 'বিক্রির পরীক্ষা'}</text>
          <path d="M224 124h33m-9-8 9 8-9 8" fill="none" stroke="#153e32" strokeWidth="2" />
        </svg>
      ) : (
        <svg viewBox="0 0 330 200" fill="none" focusable="false">
          <g stroke="#ffdbbd" strokeWidth="1" opacity=".32"><path d="M-20 165 90 55h250M-20 110l60-60h275M65 205 200 70h145M138 200l80-80h135M-10 22h360M5 0l200 200M94 0l200 200" /></g>
          <path d="m38 152 71-71h96l58 58" stroke="#fff6df" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="38" cy="152" r="11" fill="#fff6df" /><circle cx="38" cy="152" r="4" fill="#c82c25" />
          <circle cx="249" cy="125" r="12" fill="#f7c948" />
          <path d="M208 25v37M190 43h37" stroke="#ffbca4" strokeWidth="1.3" />
        </svg>
      )}
    </div>
  )
}

function CaseCover({ page, locale }: { page: PageInfo; locale: CaseLocale }) {
  const [route, title, stub, description] = page
  const action = stub
    ? (locale === 'en' ? 'To be written' : 'লেখা বাকি')
    : (locale === 'en' ? 'Read the case study' : 'কেস স্টাডি পড়ুন')
  const slug = route.split('/').filter(Boolean).at(-1) || ''
  const cover = covers[slug as keyof typeof covers]
  const company = cover && 'name' in cover ? cover.name : title.replace(/(?: case study| কেস স্টাডি)$/, '')
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  // A newly finished study remains discoverable before custom artwork is commissioned.
  if (!cover) return (
    <a className="case-cover case-theme--school case-cover--plain" href={`${basePath}${route}`}>
      <CaseLogo slug={slug} />
      <h3>{company}</h3>
      {description && <p>{description}</p>}
      <span className="case-cover__bottom">{action}<Arrow /></span>
    </a>
  )
  return (
    <a className={`case-cover case-theme--${cover.theme}`} href={`${basePath}${route}`} rel={stub ? 'nofollow' : undefined} data-case-status={stub ? 'planned' : 'published'}
      aria-label={`${company}: ${cover.title[locale].join(' ')}${stub ? (locale === 'en' ? ' Case study to be written. View starting sources.' : ' কেস স্টাডি লেখা বাকি। প্রাথমিক সোর্স দেখুন।') : ''}`}>
      <div className="case-cover__head"><CaseLogo slug={'logoSlug' in cover ? cover.logoSlug : slug} fallback={company} /><span>{cover.sector[locale]}</span></div>
      <CoverArt theme={cover.theme} locale={locale} />
      <div className="case-cover__copy">
        <p className="case-cover__company">{company}</p>
        <h3>{cover.title[locale].map((line) => <span key={line}>{line}</span>)}</h3>
        <p className="case-cover__summary">{cover.summary[locale]}</p>
      </div>
      <span className="case-cover__bottom">{action}<Arrow /></span>
    </a>
  )
}

function Arrow() {
  return <svg className="case-cover__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
}

export default function CaseStudyIndex({ locale = 'bn' }: { locale?: CaseLocale }) {
  return (
    <SectionIndex section="case-studies" locale={locale} heading={locale === 'en' ? 'Explore case studies' : 'কেস স্টাডিগুলো দেখুন'}
      renderCollection={(pages) => {
        const featured = Object.keys(covers).flatMap((slug) => pages.filter((page) => page[0].endsWith(`/${slug}`)))
        const otherWritten = pages.filter((page) => !page[2] && !featured.includes(page))
        // Keep the curated rows stable as planned studies become finished articles.
        const galleryPages = [...featured, ...otherWritten]
        return <div className="case-gallery">{galleryPages.map((page) => <CaseCover key={page[0]} page={page} locale={locale} />)}</div>
      }}
    />
  )
}
