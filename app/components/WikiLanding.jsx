import { REPO_URL } from '../nav.config'
import manifestBn from '../generated/manifest.bn.json'
import manifestEn from '../generated/manifest.en.json'

const bengaliDigits = (value) => String(value).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d])

function localHref(href) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  if (!href.startsWith('/')) return href
  if (!basePath) return href
  return href === '/' ? basePath || '/' : `${basePath}${href}`
}

const bn = {
  kicker: 'বাংলাদেশে স্টার্টআপ গড়ার বাংলা গাইড',
  title: 'দেশি স্টার্টআপ',
  subtitle:
    'আইডিয়া থেকে প্রথম গ্রাহক, ট্রেড লাইসেন্স থেকে পেমেন্ট, ফান্ডিং থেকে স্কেল। কী করবেন, ধাপে ধাপে সহজ বাংলায়।',
  pill: 'বাংলা',
  lead: (
    <>
      মাথায় একটা স্টার্টআপ আইডিয়া আছে, কিন্তু বুঝতে পারছেন না আগে গ্রাহক খুঁজবেন, পণ্য বানাবেন,
      ট্রেড লাইসেন্স করবেন, নাকি কোম্পানি খুলবেন? দেশি স্টার্টআপ সেই “এখন কী করব?” প্রশ্নের সহজ
      বাংলা উত্তর সাজায়। অনুপ্রেরণার গল্প নয়, করার মতো কাজ।
    </>
  ),
  lead2:
    'বাংলাদেশের বাস্তবতা আলাদা। গ্রাহকের ভরসা পেতে সময় লাগে, ক্যাশ অন ডেলিভারি এখনো জরুরি, ফেসবুক/মেসেঞ্জার বড় বিক্রির চ্যানেল। সরকারি কাগজপত্রও বুঝে করতে হয়। তাই এই সাইট বিদেশি পরামর্শ কপি করে না। বাংলাদেশে কীভাবে কাজ হয়, সেটা ধরে ব্যাখ্যা করে।',
  notice:
    'আইন, কর, ভ্যাট, ব্যাংকিং বা লাইসেন্স নিয়ে লেখা সিদ্ধান্ত নিতে সাহায্য করবে। আইনি বা কর পরামর্শ নয়। ফি, ফর্ম ও প্রক্রিয়া বদলাতে পারে। কাজ করার আগে সরকারি উৎস দেখে নিন। দরকার হলে চার্টার্ড অ্যাকাউন্ট্যান্ট বা আইনজীবীর সঙ্গে মিলিয়ে নিন।',
  infoboxTitle: 'এক নজরে',
  infoboxName: 'দেশি স্টার্টআপ',
  infoboxTagline: 'বাংলাদেশে স্টার্টআপ গড়ার বাংলা গাইড',
  infobox: (written, stubs) => [
    ['যাদের জন্য', 'নতুন ফাউন্ডার, শিক্ষার্থী ও নারী উদ্যোক্তা, স্টার্টআপ টিম, প্রবাসী ফাউন্ডার'],
    ['যা পাবেন', 'আইডিয়া যাচাই, নিবন্ধন, পেমেন্ট, বিক্রি, নিয়োগ, ফান্ডিং'],
    ['ভাষা', 'সহজ বাংলা, দরকারি ইংরেজি টার্ম ব্যাখ্যাসহ'],
    ['মূল্য', 'সম্পূর্ণ ফ্রি ও ওপেন সোর্স'],
    ['গাইড', `${bengaliDigits(written)}টি লেখা হয়েছে · ${bengaliDigits(stubs)}টি লেখার অপেক্ষায়`]
  ],
  stageTitle: 'আপনি এখন কোন অবস্থায় আছেন?',
  stageSub:
    'সবাই একই জায়গা থেকে শুরু করে না। কেউ আইডিয়া পর্যায়ে, কেউ ফেসবুক পেজ খুলে ফেলেছেন, কেউ নিবন্ধন নিয়ে আটকে আছেন। নিজের অবস্থার ঘরটা বেছে নিন, অথবা ওপরের সার্চে নিজের প্রশ্নটা লিখুন।',
  stages: [
    ['আমি একদম নতুন', 'শুরুর পুরো পথটা আগে এক নজরে বুঝে নিন। কী আগে, কী পরে।', 'শুরু করুন', '/start-here'],
    ['আমার একটা আইডিয়া আছে', 'বানানোর আগে দেখুন মানুষ সমস্যাটা সত্যি অনুভব করে কি না, টাকা দিতে রাজি কি না।', 'আইডিয়া যাচাই করুন', '/idea-validation'],
    ['স্টার্টআপ চালু করতে চাই', 'ট্রেড লাইসেন্স, কোম্পানি, টিআইএন, ভ্যাট, ব্যাংক। কোন কাগজ কখন লাগে, ধাপে ধাপে।', 'আইনি পথ দেখুন', '/legal-roadmap'],
    ['গ্রাহক আর বিক্রি চাই', 'ফেসবুক, মেসেঞ্জার, হোয়াটসঅ্যাপ, রেফারেল – প্রথম ১০০ গ্রাহক পাওয়ার বাস্তব পথ।', 'বিক্রি শুরু করুন', '/customers'],
    ['লক্ষ্য জানি, পথ চাই', 'আপনার কাজ বেছে নিয়ে ধাপে ধাপে কোন গাইড পড়বেন তা দেখে নিন।', 'গাইডেড পথ দেখুন', '/journeys']
  ],
  topicTitle: 'বিষয় ধরে খুঁজুন',
  topicSub: 'যে কাজটা এখন করতে চাইছেন, সেই বিষয়ের গাইডে ঢুকে পড়ুন। প্রতিটি বিভাগের পাতায় সেই বিষয়ের সব গাইডের তালিকা আছে।',
  topics: [
    ['আইডিয়া ও যাচাই', 'গ্রাহকের সঙ্গে আলাপ · এমভিপি পরীক্ষা · বাজার বোঝা · প্রতিযোগী', '/idea-validation'],
    ['আইন, কর ও নিবন্ধন', 'ট্রেড লাইসেন্স · কোম্পানি · RJSC · e-TIN · ভ্যাট/BIN', '/legal-roadmap'],
    ['পেমেন্ট ও অপারেশন', 'বিকাশ/নগদ · গেটওয়ে · ক্যাশ অন ডেলিভারি · কুরিয়ার · রিফান্ড', '/payments'],
    ['গ্রাহক ও বিক্রি', 'ফেসবুক কমার্স · মেসেঞ্জার/হোয়াটসঅ্যাপ · B2B বিক্রি · প্রথম ১০০ গ্রাহক', '/customers'],
    ['টিম ও উদ্যোক্তার জীবন', 'কো-ফাউন্ডার · প্রথম নিয়োগ · পারিবারিক চাপ · বার্নআউট', '/founder-life'],
    ['ফান্ডিং ও বড় হওয়া', 'গ্র্যান্ট · অ্যাঞ্জেল · ভিসি · পিচ ডেক · সরকারি সুবিধা', '/funding-roadmap'],
    ['টেমপ্লেট ও টুলস', 'চেকলিস্ট · স্ক্রিপ্ট · ক্যালকুলেটর · ট্র্যাকার', '/tools'],
    ['ডিরেক্টরি', 'ইনভেস্টর · অ্যাক্সেলারেটর · প্রোগ্রাম · ইকোসিস্টেম', '/directory']
  ],
  faqTitle: 'নতুনদের সাধারণ প্রশ্ন',
  faqSub: 'শুরুতে সবকিছু জরুরি মনে হয়। কিন্তু সব কাজ একই দিনে করতে হয় না। এই উত্তরগুলো প্রথম সিদ্ধান্তগুলো নিতে সাহায্য করবে।',
  faq: [
    ['শুরুতেই কি কোম্পানি খুলতে হবে?', 'সবসময় না। অনেক ক্ষেত্রে আগে গ্রাহকের চাহিদা যাচাই করা, পেমেন্ট নেওয়ার সহজ পথ ঠিক করা আর প্রাথমিক হিসাব রাখা বেশি জরুরি। বিস্তারিত আইনি রোডম্যাপ গাইডে।'],
    ['শুধু ফেসবুক পেজ দিয়ে শুরু করা কি ভুল?', 'না। বাংলাদেশে অনেক ব্যবসা ফেসবুক/মেসেঞ্জার থেকেই শুরু হয়। তবে অর্ডার, পেমেন্ট, ডেলিভারি ও রিফান্ডের হিসাব গুছিয়ে না রাখলে পরে সমস্যা হয়।'],
    ['ফান্ডিং ছাড়া স্টার্টআপ করা যায়?', 'অনেক ক্ষেত্রেই যায়। আগে ছোট পরীক্ষা, টাকা-দেওয়া গ্রাহক আর রিপিট অর্ডারের প্রমাণ জোগাড় করুন – তখন ফান্ডিংয়ের আলোচনাও সহজ হবে।'],
    ['আইন/কর না বুঝলে কী করব?', 'ভয়ে থেমে যাবেন না। কোন কাজ এখন দরকার আর কোনটা পরে করা যায়, সেটা আগে বুঝুন। বড় সিদ্ধান্তে সরকারি উৎস ও পেশাদার পরামর্শ মিলিয়ে নিন।'],
    ['এই সাইট কি সত্যিই ফ্রি?', 'হ্যাঁ, সম্পূর্ণ ফ্রি ও ওপেন সোর্স। কোনো কোর্স বিক্রি নেই, লগইন লাগে না। পুরো সাইটের লেখা GitHub-এ খোলা আছে।'],
    ['এই লেখাগুলো কারা লেখে?', 'কমিউনিটি: ফাউন্ডার, ছাত্র, পেশাজীবী। প্রতিটি পাতার “সম্পাদনা” লিংক থেকে যে কেউ সংশোধন বা নতুন লেখা যোগ করতে পারেন। রিভিউয়াররা যাচাই করে যুক্ত করেন।']
  ],
  govTitle: 'দরকারি সরকারি লিংক',
  govSub: 'নিবন্ধন, কর, ভ্যাট বা ব্যাংকিং নিয়ে কাজ করার সময় শেষ সিদ্ধান্ত সরকারি পোর্টাল দেখে নিন। এই লিংকগুলো নতুন উদ্যোক্তা হিসেবে বারবার কাজে লাগবে।',
  gov: [
    ['RJSC', 'কোম্পানি, অংশীদারি ব্যবসা বা সোসাইটি নিবন্ধন', 'https://roc.gov.bd'],
    ['NBR e-TIN', 'ব্যক্তি বা প্রতিষ্ঠানের টিআইএন সংক্রান্ত কাজ', 'https://secure.incometax.gov.bd'],
    ['ভ্যাট অনলাইন', 'BIN/ভ্যাট নিবন্ধন ও ভ্যাট রিটার্ন', 'https://vat.gov.bd'],
    ['BIDA OSS', 'বিনিয়োগ, অনুমোদন ও সরকারি সেবার আবেদন', 'https://ossbida.gov.bd'],
    ['বাংলাদেশ ব্যাংক', 'ব্যাংকিং, পেমেন্ট ও বৈদেশিক মুদ্রার নিয়ম', 'https://www.bb.org.bd']
  ],
  bandTitle: 'এই গাইড সবাই মিলে লিখছি',
  bandBody:
    'নিয়ম বদলায়, ফি বদলায়, নতুন প্রশ্ন আসে। এত বড় জ্ঞানভাণ্ডার একা ঠিক রাখা যায় না। আপনি যা জানেন, সেটাই কারও পরের ধাপ। বানান বা ভাষা নিয়ে ভাববেন না। রিভিউয়াররা গুছিয়ে দেবেন।',
  bandStats: (written, stubs) => [
    [bengaliDigits(written), 'গাইড লেখা হয়েছে'],
    [bengaliDigits(stubs), 'বিষয় লেখার অপেক্ষায়']
  ],
  bandCta: 'কীভাবে অবদান রাখবেন',
  bandGh: 'GitHub-এ দেখুন',
  contribute: '/contribute',
  recentTitle: 'সম্প্রতি হালনাগাদ হয়েছে'
}

const en = {
  kicker: 'The Bangla-first startup guide for Bangladesh',
  title: 'Deshi Startup',
  subtitle:
    'Step-by-step guidance in plain language – from idea to first customer, trade license to payments, funding to scale.',
  pill: 'English',
  lead: (
    <>
      You have a startup idea, but can&apos;t tell what comes first – finding customers, building the
      product, getting a trade license, or opening a company? <strong>Deshi Startup</strong> organizes
      plain answers to that “what do I do now?” question – actionable work, not motivational stories.
    </>
  ),
  lead2:
    'Bangladesh works differently: customer trust takes time, cash on delivery still matters, Facebook/Messenger are major sales channels, and government paperwork needs care. So this site doesn\'t copy foreign advice; it explains how things actually work in Bangladesh.',
  notice:
    'Articles about law, tax, VAT, banking or licensing help you decide, but they are not legal or tax advice. Fees, forms and processes change; confirm with official sources and, where needed, a chartered accountant or lawyer before acting.',
  infoboxTitle: 'At a glance',
  infoboxName: 'Deshi Startup',
  infoboxTagline: 'The Bangla-first startup guide for Bangladesh',
  infobox: (written, stubs) => [
    ['For', 'New and women founders, student founders, startup teams, diaspora founders'],
    ['Covers', 'Idea validation, registration, payments, sales, hiring, funding'],
    ['Language', 'Simple Bangla; English terms explained'],
    ['Price', 'Completely free; open source'],
    ['Guides', `${written} written · ${stubs} waiting for writers`]
  ],
  stageTitle: 'Where are you right now?',
  stageSub:
    'Nobody starts from the same place. Some are at the idea stage, some already run a Facebook page, some are stuck on registration. Pick the card that matches your situation, or type your question in the search above.',
  stages: [
    ['I\'m completely new', 'See the whole journey first – what comes first, what can wait.', 'Start here', '/en/start-here'],
    ['I have an idea', 'Before building, check people truly feel the problem and will pay.', 'Validate your idea', '/en/idea-validation'],
    ['I want to launch', 'Trade license, company, TIN, VAT, bank – which paper when, step by step.', 'See the legal path', '/en/legal-roadmap'],
    ['I need customers', 'Facebook, Messenger, WhatsApp, referrals – real paths to your first 100 customers.', 'Start selling', '/en/customers'],
    ['I know the goal', 'Pick the job you are trying to do and follow the guides in order.', 'See guided paths', '/en/journeys']
  ],
  topicTitle: 'Browse by topic',
  topicSub: 'Jump into the guide for the job you\'re doing right now. Every section page lists all of its guides.',
  topics: [
    ['Idea & validation', 'Customer interviews · MVP tests · market research · competitors', '/en/idea-validation'],
    ['Legal, tax & registration', 'Trade license · company · RJSC · e-TIN · VAT/BIN', '/en/legal-roadmap'],
    ['Payments & operations', 'bKash/Nagad · gateways · cash on delivery · couriers · refunds', '/en/payments'],
    ['Customers & sales', 'Facebook commerce · Messenger/WhatsApp · B2B sales · first 100 customers', '/en/customers'],
    ['Team & founder life', 'Co-founders · first hires · family pressure · burnout', '/en/founder-life'],
    ['Funding & scale', 'Grants · angels · VC · pitch decks · government support', '/en/funding-roadmap'],
    ['Templates & tools', 'Checklists · scripts · calculators · trackers', '/en/tools'],
    ['Directory', 'Investors · accelerators · programs · ecosystem', '/en/directory']
  ],
  faqTitle: 'Common beginner questions',
  faqSub: 'Everything feels urgent at the start, but not everything happens on day one – these answers help with the first decisions.',
  faq: [
    ['Do I need a company from day one?', 'Not always. Often it matters more to validate demand, set up a simple way to take payments, and keep basic records first. Details in the legal roadmap.'],
    ['Is starting with just a Facebook page wrong?', 'No. Many Bangladeshi businesses start on Facebook/Messenger. But keep orders, payments, delivery and refunds organized from the start.'],
    ['Can I build a startup without funding?', 'Very often, yes. Gather proof first – small tests, paying customers, repeat orders – and funding conversations get much easier.'],
    ['What if I don\'t understand law/tax?', 'Don\'t freeze. First understand what\'s needed now versus later. For big decisions, combine official sources with professional advice.'],
    ['Is this site really free?', 'Yes – completely free and open source. No courses for sale, no login. All the writing is open on GitHub.'],
    ['Who writes these guides?', 'The community – founders, students, professionals. Anyone can improve any page via its “Edit” link; reviewers check every change.']
  ],
  govTitle: 'Essential government links',
  govSub: 'When working on registration, tax, VAT or banking, make the final call from the official portals. You\'ll come back to these often.',
  gov: [
    ['RJSC', 'Company, partnership and society registration', 'https://roc.gov.bd'],
    ['NBR e-TIN', 'Personal and company TIN services', 'https://secure.incometax.gov.bd'],
    ['VAT Online', 'BIN/VAT registration and VAT returns', 'https://vat.gov.bd'],
    ['BIDA OSS', 'Investment approvals and government services', 'https://ossbida.gov.bd'],
    ['Bangladesh Bank', 'Banking, payments and foreign exchange rules', 'https://www.bb.org.bd']
  ],
  bandTitle: 'We are writing this manual together',
  bandBody:
    'Rules change, fees change, new questions appear – a knowledge base this size stays accurate only with many hands. What you already know is someone else\'s next step. Don\'t worry about polish – reviewers will help.',
  bandStats: (written, stubs) => [
    [String(written), 'guides written'],
    [String(stubs), 'topics waiting for a writer']
  ],
  bandCta: 'How to contribute',
  bandGh: 'View on GitHub',
  contribute: '/en/contribute',
  recentTitle: 'Recently updated'
}

export default function WikiLanding({ locale = 'bn' }) {
  const isEn = locale === 'en'
  const t = isEn ? en : bn
  const manifest = isEn ? manifestEn : manifestBn
  const { written, stubs } = manifest.counts

  const recent = Object.values(manifest.sections)
    .flatMap((section) => [section.index, ...section.children])
    .filter((page) => page && !page.stub && page.date)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5)

  const formatDate = (iso) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString(isEn ? 'en-GB' : 'bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    })

  return (
    <div className="wiki-landing">
      <section className="wiki-hero" aria-labelledby="wiki-title">
        <div className="wiki-hero__main">
          <div className="wiki-title-row">
            <div>
              <p className="wiki-kicker">{t.kicker}</p>
              <h1 id="wiki-title">{t.title}</h1>
              <p className="wiki-subtitle">{t.subtitle}</p>
            </div>
            <span className="wiki-language-pill">{t.pill}</span>
          </div>

          <p className="wiki-lead">{t.lead}</p>
          <p>{t.lead2}</p>

          <aside className="wiki-notice" role="note">
            <span aria-hidden="true">i</span>
            <p>{t.notice}</p>
          </aside>
        </div>

        <aside className="wiki-infobox" aria-label={isEn ? 'Deshi Startup infobox' : 'দেশি স্টার্টআপ তথ্যছক'}>
          <p className="wiki-infobox-title">{t.infoboxTitle}</p>
          <img src={localHref('/deshi-mark.svg')} alt="" />
          <strong>{t.infoboxName}</strong>
          <p>{t.infoboxTagline}</p>
          <dl>
            {t.infobox(written, stubs).map(([dt, dd]) => (
              <div key={dt}>
                <dt>{dt}</dt>
                <dd>{dd}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <section id="learning-paths" className="wiki-section">
        <h2>{t.stageTitle}</h2>
        <p>{t.stageSub}</p>
        <div className="wiki-path-grid">
          {t.stages.map(([title, body, cta, href]) => (
            <a className="wiki-path-card" href={localHref(href)} key={title}>
              <strong>{title}</strong>
              <span>{body}</span>
              <em>{cta}</em>
            </a>
          ))}
        </div>
      </section>

      <section id="guide-scope" className="wiki-section">
        <h2>{t.topicTitle}</h2>
        <p>{t.topicSub}</p>
        <div className="wiki-scope-grid">
          {t.topics.map(([title, body, href]) => (
            <a className="wiki-scope-card" href={localHref(href)} key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="beginner-questions" className="wiki-section">
        <h2>{t.faqTitle}</h2>
        <p>{t.faqSub}</p>
        <div className="home-faq">
          {t.faq.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="wiki-section">
        <h2>{t.govTitle}</h2>
        <p>{t.govSub}</p>
        <div className="wiki-source-list">
          {t.gov.map(([label, body, href]) => (
            <article key={href}>
              <h3>
                <a href={href} target="_blank" rel="noopener noreferrer">{label}</a>
              </h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contribute" className="wiki-section">
        <h2>{t.bandTitle}</h2>
        <div className="contrib-section">
          <p>{t.bandBody}</p>
          <div className="contrib-stats">
            {t.bandStats(written, stubs).map(([value, label]) => (
              <span key={label}>
                <b>{value}</b>
                {label}
              </span>
            ))}
          </div>
          <div className="contrib-row">
            <a href={localHref(t.contribute)}>{t.bandCta}</a>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">{t.bandGh}</a>
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="wiki-section" aria-labelledby="recent-title">
          <h2 id="recent-title">{t.recentTitle}</h2>
          <ul className="recent-list">
            {recent.map((page) => (
              <li key={page.route}>
                <a href={localHref(page.route)}>{page.title}</a>
                <time dateTime={page.date}>{formatDate(page.date)}</time>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
