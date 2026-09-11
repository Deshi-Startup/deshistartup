import './EcosystemMap.css'

type Locale = 'en' | 'bn'

const copy = {
  en: {
    title: 'Who does what',
    customers: ['Customers', 'People with the problem you aim to solve', '#customers'],
    startup: ['Your startup', 'Co-founders and the team building the product', '#co-founders-and-team'],
    toCustomers: 'Product or service',
    toStartup: 'Use, payment, feedback',
    roles: [
      ['Services', 'Payments, delivery, suppliers and accounting', '#services-and-day-to-day-operations'],
      ['Advice & programmes', 'Mentors, communities, incubators and accelerators', '#mentors-communities-and-programmes'],
      ['Funding', 'Investors, lenders and grant programmes', '#funding'],
      ['Public bodies', 'Registration, rules and specific approvals', '#government-offices'],
    ],
    note: 'Choose a role to read more below. Looking for organisations?',
    directory: 'Browse the directory',
  },
  bn: {
    title: 'কে কী করেন',
    customers: ['কাস্টমার', 'যাঁদের সমস্যার সমাধান করতে চান', '#কাস্টমার'],
    startup: ['আপনার স্টার্টআপ', 'কো-ফাউন্ডার আর প্রোডাক্ট তৈরির টিম', '#কো-ফাউন্ডার-ও-টিম'],
    toCustomers: 'প্রোডাক্ট বা সার্ভিস',
    toStartup: 'ব্যবহার, পেমেন্ট, ফিডব্যাক',
    roles: [
      ['ব্যবসা চালানোর সেবা', 'পেমেন্ট, ডেলিভারি, সাপ্লায়ার ও হিসাবরক্ষণ', '#ব্যবসা-চালানোর-সেবা'],
      ['পরামর্শ ও প্রোগ্রাম', 'মেন্টর, কমিউনিটি, ইনকিউবেটর ও অ্যাক্সিলারেটর', '#মেন্টর-কমিউনিটি-ও-প্রোগ্রাম'],
      ['ফান্ডিং', 'ইনভেস্টর, ঋণদাতা ও অনুদান প্রোগ্রাম', '#ফান্ডিং'],
      ['সরকারি দপ্তর', 'রেজিস্ট্রেশন, নিয়মকানুন ও নির্দিষ্ট অনুমোদন', '#সরকারি-দপ্তর'],
    ],
    note: 'বিস্তারিত জানতে নিচের যেকোনো টপিকে ক্লিক করুন। প্রতিষ্ঠান খুঁজছেন?',
    directory: 'ডিরেক্টরি দেখুন',
  },
}

export default function EcosystemMap({ locale = 'bn' }: { locale?: Locale }) {
  const t = copy[locale]
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return <section className="ecosystem-map" aria-labelledby="ecosystem-map-title">
    <h2 id="ecosystem-map-title" data-toc-ignore>{t.title}</h2>
    <nav aria-label={t.title}>
      <div className="ecosystem-map__core">
        <a className="ecosystem-map__customer" href={t.customers[2]}>
          <strong>{t.customers[0]}</strong>
          <span>{t.customers[1]}</span>
        </a>
        <div className="ecosystem-map__exchange">
          <span><span className="ecosystem-map__direction">{locale === 'en' ? 'From your startup to customers: ' : 'স্টার্টআপ থেকে কাস্টমারের কাছে: '}</span>{t.toCustomers}</span>
          <svg aria-hidden="true" viewBox="0 0 100 28" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M96 7H4l6-5M4 7l6 5M4 21h92l-6-5m6 5-6 5" /></svg>
          <span><span className="ecosystem-map__direction">{locale === 'en' ? 'From customers to your startup: ' : 'কাস্টমারের কাছ থেকে স্টার্টআপে: '}</span>{t.toStartup}</span>
        </div>
        <a className="ecosystem-map__startup" href={t.startup[2]}>
          <strong>{t.startup[0]}</strong>
          <span>{t.startup[1]}</span>
        </a>
      </div>
      <div className="ecosystem-map__support">
        {t.roles.map(([title, description, anchor]) => <a href={anchor} key={anchor}>
          <strong>{title}<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4v15m-6-6 6 6 6-6" /></svg></strong>
          <span>{description}</span>
        </a>)}
      </div>
    </nav>
    <p className="ecosystem-map__caption">{t.note} <a href={`${basePath}${locale === 'en' ? '/en' : ''}/directory`}>{t.directory}</a>{locale === 'en' ? '.' : '।'}</p>
  </section>
}
