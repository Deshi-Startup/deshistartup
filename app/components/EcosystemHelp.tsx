import './EcosystemHelp.css'

type Locale = 'en' | 'bn'
type HelpLink = { label: string; path: string }
type Situation = {
  id: 'demand' | 'payment' | 'programme' | 'funding'
  label: string
  title: string
  who: string
  ask: string
  prepare: string
  outcome: string
  guide: HelpLink
  directory?: HelpLink
}

const situations: Record<Locale, Situation[]> = {
  en: [
    {
      id: 'demand',
      label: 'I have an untested idea',
      title: 'Start with potential customers',
      who: 'People who already face the problem you want to solve.',
      ask: '“Tell me about the last time this happened. What did you do?”',
      prepare: 'Write down the problem, what you are assuming, and a small offer you could test.',
      outcome: 'Learn how people handle the problem now and decide what to test next. Praise for the idea alone does not prove demand.',
      guide: { label: 'Plan a demand test', path: '/validation/demand-without-building' },
    },
    {
      id: 'payment',
      label: 'My payment setup is stuck',
      title: 'Start with the provider’s onboarding team',
      who: 'The team handling your account application. A mentor can help you understand the problem, but cannot approve the account.',
      ask: '“What is blocking this application, and what evidence would resolve it?”',
      prepare: 'Have your business activity, application reference and the exact rejection message ready. Share documents only through the provider’s secure process.',
      outcome: 'Get a clear checklist and the next contact. If a document needs correction, identify its issuing office.',
      guide: { label: 'Understand payment setup', path: '/payments' },
      directory: { label: 'Browse payment providers', path: '/directory/payment-gateways' },
    },
    {
      id: 'programme',
      label: 'I’m considering a programme',
      title: 'Check the fit with the programme team',
      who: 'The people running the current intake. Ask past participants about their experience too.',
      ask: '“How would this programme help with the specific problem we are facing?”',
      prepare: 'Explain your stage, the support you need, and the time your team can commit.',
      outcome: 'Compare current eligibility, dates, benefits, fees, ownership terms and reporting duties before applying. A programme’s name alone does not tell you what it includes.',
      guide: { label: 'Read about programmes', path: '/ecosystem#mentors-communities-and-programmes' },
      directory: { label: 'Find a founder programme', path: '/directory/accelerators' },
    },
    {
      id: 'funding',
      label: 'I need to fund the next step',
      title: 'Define the work the money would unlock',
      who: 'Relevant funding organisations, after comparing the funding routes that could fit that work.',
      ask: '“Does this type of funding fit our stage, intended use and constraints?”',
      prepare: 'Set out the work, amount, timing and evidence behind the need.',
      outcome: 'Identify a funding route worth investigating and understand its obligations. An introduction is a starting point, not a funding commitment.',
      guide: { label: 'Compare funding routes', path: '/funding' },
      directory: { label: 'Explore funding organisations', path: '/directory/investors' },
    },
  ],
  bn: [
    {
      id: 'demand',
      label: 'আইডিয়া আছে, এখনো যাচাই করিনি',
      title: 'আগে সম্ভাব্য কাস্টমারদের সাথে কথা বলুন',
      who: 'আপনি যে সমস্যার সমাধান করতে চান, বাস্তবে যাঁদের সেই সমস্যায় পড়তে হয়।',
      ask: '“শেষবার এমন সমস্যা হলে কী করেছিলেন? ঘটনাটা একটু বলবেন?”',
      prepare: 'সমস্যাটা কী আর কোন বিষয়গুলো আপনি ধরে নিচ্ছেন, লিখে ফেলুন। ছোট পরিসরে কী অফার দিয়ে টেস্ট করতে পারেন, সেটাও ভেবে রাখুন।',
      outcome: 'মানুষ এখন সমস্যাটা কীভাবে সামলান তা জেনে পরের টেস্ট ঠিক করুন। আইডিয়ার প্রশংসা শুনেই চাহিদা আছে ধরে নেওয়া যায় না।',
      guide: { label: 'চাহিদা যাচাইয়ের পরিকল্পনা করুন', path: '/validation/demand-without-building' },
    },
    {
      id: 'payment',
      label: 'পেমেন্ট অ্যাকাউন্ট খুলতে গিয়ে আটকে আছি',
      title: 'প্রোভাইডারের অনবোর্ডিং টিমের সাথে কথা বলুন',
      who: 'আপনার অ্যাকাউন্ট খোলার আবেদন যে টিম দেখছে, তাদের সাথে কথা বলুন। মেন্টর সমস্যাটা বুঝতে সাহায্য করতে পারেন, কিন্তু অ্যাকাউন্ট অনুমোদন করতে পারবেন না।',
      ask: '“আমার আবেদনটা কোথায় আটকে আছে? কোন কাগজ বা তথ্য দিলে সমাধান হবে?”',
      prepare: 'কী ব্যবসা করেন, আবেদনের রেফারেন্স নম্বর আর আবেদন ফেরত দেওয়ার কারণটা সাথে রাখুন। কাগজপত্র পাঠাতে প্রোভাইডারের নির্ধারিত নিরাপদ মাধ্যম ব্যবহার করুন।',
      outcome: 'কী কী লাগবে আর এরপর কার সাথে যোগাযোগ করতে হবে, জেনে নিন। কোনো কাগজে ভুল থাকলে সেটা যে অফিস দিয়েছে, সেখানে সংশোধনের নিয়ম জানতে হবে।',
      guide: { label: 'পেমেন্ট চালুর নিয়ম বুঝে নিন', path: '/payments' },
      directory: { label: 'পেমেন্ট প্রোভাইডার দেখুন', path: '/directory/payment-gateways' },
    },
    {
      id: 'programme',
      label: 'কোনো প্রোগ্রামে যোগ দেওয়ার কথা ভাবছি',
      title: 'প্রোগ্রামটা কাজে লাগবে কি না, টিমের সাথে কথা বলে নিশ্চিত হন',
      who: 'এবারের ব্যাচ যাঁরা চালাচ্ছেন, তাঁদের কাছে বিস্তারিত জানতে চান। আগের ব্যাচে যাঁরা ছিলেন, তাঁদের অভিজ্ঞতাও শুনে নিন।',
      ask: '“আমরা যে সমস্যায় আটকে আছি, এই প্রোগ্রাম থেকে তার জন্য সুনির্দিষ্ট কী সাহায্য পাব?”',
      prepare: 'ব্যবসা কোন পর্যায়ে আছে, কী সাহায্য দরকার আর আপনার টিম কতটা সময় দিতে পারবে, স্পষ্ট করে বলুন।',
      outcome: 'আবেদনের আগে বর্তমান যোগ্যতা, তারিখ, সুযোগ-সুবিধা, ফি, ইকুইটির শর্ত আর কী রিপোর্ট দিতে হবে, মিলিয়ে দেখুন। শুধু নাম শুনে প্রোগ্রামে কী আছে বোঝা যায় না।',
      guide: { label: 'প্রোগ্রাম সম্পর্কে পড়ুন', path: '/ecosystem#মেন্টর-কমিউনিটি-ও-প্রোগ্রাম' },
      directory: { label: 'ফাউন্ডার প্রোগ্রাম খুঁজুন', path: '/directory/accelerators' },
    },
    {
      id: 'funding',
      label: 'পরের কাজের জন্য টাকা দরকার',
      title: 'টাকাটা দিয়ে কী কাজ করবেন, আগে সেটা পরিষ্কার করুন',
      who: 'কাজটার জন্য কোন ধরনের ফান্ডিং মানাবে, আগে তুলনা করে দেখুন। তারপর সেই অনুযায়ী ফান্ড দেয় এমন প্রতিষ্ঠানের সাথে যোগাযোগ করুন।',
      ask: '“আমাদের বর্তমান স্টেজ, টাকার ব্যবহার আর সীমাবদ্ধতার সাথে এই ধরনের ফান্ডিং কি মানাবে?”',
      prepare: 'কী কাজ করবেন, কত টাকা কখন লাগবে আর প্রয়োজনটা কীভাবে বুঝলেন, গুছিয়ে লিখে রাখুন।',
      outcome: 'কোন ধরনের ফান্ডিং নিয়ে খোঁজ করবেন আর তার দায়দায়িত্ব কী, পরিষ্কার করুন। কারও সাথে পরিচয় হওয়া মানেই টাকা পাওয়ার নিশ্চয়তা নয়।',
      guide: { label: 'ফান্ডিংয়ের ধরন তুলনা করুন', path: '/funding' },
      directory: { label: 'ফান্ডিং প্রতিষ্ঠান খুঁজুন', path: '/directory/investors' },
    },
  ],
}

const copy = {
  en: {
    title: 'Find the right help',
    question: 'What are you working through?',
    hint: 'Choose a situation to see who to approach and what to ask.',
    who: 'Speak to',
    ask: 'Ask',
    prepare: 'Prepare',
    outcome: 'Useful outcome',
    other: 'Looking for another kind of help?',
    overview: 'See all the roles below',
  },
  bn: {
    title: 'কার কাছে সাহায্য চাইবেন',
    question: 'কোন জায়গায় আটকে আছেন?',
    hint: 'অবস্থাটা বেছে নিন। কার কাছে যাবেন আর কী জানতে চাইবেন, নিচে দেখুন।',
    who: 'কার সাথে কথা বলবেন',
    ask: 'কী জানতে চাইবেন',
    prepare: 'যা সাথে রাখবেন',
    outcome: 'যা জেনে ফিরবেন',
    other: 'অন্য কোনো সাহায্য দরকার?',
    overview: 'নিচে সবার ভূমিকা দেখুন',
  },
}

/** Native radios and CSS keep every path usable without hydration or a network request. */
export default function EcosystemHelp({ locale = 'bn' }: { locale?: Locale }) {
  const t = copy[locale]
  const items = situations[locale]
  const prefix = `ecosystem-help-${locale}`
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const href = (path: string) => `${basePath}${locale === 'en' ? '/en' : ''}${path}`

  return <section className="ecosystem-help" aria-labelledby={`${prefix}-title`}>
    <h2 id={`${prefix}-title`} data-toc-ignore>{t.title}</h2>
    <fieldset className="ecosystem-help__choices" aria-describedby={`${prefix}-hint`}>
      <legend>{t.question}</legend>
      <p id={`${prefix}-hint`} className="ecosystem-help__hint">{t.hint}</p>
      <div className="ecosystem-help__options">
        {items.map((item, index) => <label key={item.id}>
          <input type="radio" name={prefix} value={item.id} defaultChecked={index === 0} aria-controls={`${prefix}-${item.id}`} />
          <span>{item.label}</span>
        </label>)}
      </div>
    </fieldset>
    <div className="ecosystem-help__results" aria-live="polite" aria-atomic="true">
      {items.map(item => <section className="ecosystem-help__result" data-need={item.id} id={`${prefix}-${item.id}`} aria-labelledby={`${prefix}-${item.id}-title`} key={item.id}>
        <h3 id={`${prefix}-${item.id}-title`} data-toc-ignore>{item.title}</h3>
        <dl>
          <div><dt>{t.who}</dt><dd>{item.who}</dd></div>
          <div><dt>{t.ask}</dt><dd>{item.ask}</dd></div>
          <div><dt>{t.prepare}</dt><dd>{item.prepare}</dd></div>
          <div><dt>{t.outcome}</dt><dd>{item.outcome}</dd></div>
        </dl>
        <div className="ecosystem-help__links">
          <a href={href(item.guide.path)}>{item.guide.label}</a>
          {item.directory && <a href={href(item.directory.path)}>{item.directory.label}</a>}
        </div>
      </section>)}
    </div>
    <p className="ecosystem-help__other">{t.other} <a href="#ecosystem-map-title">{t.overview}</a>{locale === 'en' ? '.' : '।'}</p>
  </section>
}
