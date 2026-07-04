const sources = [
  ['সরকারি ও নিয়ন্ত্রক', 'BIDA, RJSC, NBR, VAT Online, Bangladesh Bank, সিটি কর্পোরেশন'],
  ['ইকোসিস্টেম ও বাজার', 'Startup Bangladesh, BASIS, e-CAB, LightCastle, World Bank, BBS'],
  ['অপারেশনাল বাস্তবতা', 'পেমেন্ট গেটওয়ে, MFS, কুরিয়ার, Facebook commerce, B2B procurement'],
  ['কমিউনিটি আপডেট', 'ফাউন্ডার, আইনজীবী, CA, অপারেটর ও কন্ট্রিবিউটরদের যাচাই করা সংশোধন']
]

const scopeCards = [
  {
    title: 'আইডিয়া ও যাচাই',
    body: 'সমস্যা খোঁজা, গ্রাহকের সাথে কথা বলা, MVP বানানো, প্রি-অর্ডার বা waitlist দিয়ে আগ্রহ মাপা।',
    href: '/idea-validation'
  },
  {
    title: 'আইন, কর ও নিবন্ধন',
    body: 'একক মালিকানা বনাম কোম্পানি, RJSC, ট্রেড লাইসেন্স, e-TIN, BIN/VAT এবং নিয়মিত কমপ্লায়েন্স।',
    href: '/legal-roadmap'
  },
  {
    title: 'পেমেন্ট ও অপারেশন',
    body: 'bKash, Nagad, ব্যাংক, পেমেন্ট গেটওয়ে, COD, কুরিয়ার, রিটার্ন, প্রতারণা ও হিসাব রাখা।',
    href: '/payments'
  },
  {
    title: 'গ্রাহক ও বিক্রি',
    body: 'Facebook, WhatsApp, Messenger, marketplace, মাঠে গিয়ে বিক্রি, B2B sales এবং প্রথম ১০০ গ্রাহক।',
    href: '/customers'
  },
  {
    title: 'টিম ও ফাউন্ডার লাইফ',
    body: 'সহ-প্রতিষ্ঠাতা, প্রথম কর্মী, freelancer/intern, family pressure, burnout এবং নিরাপদ কাজের অভ্যাস।',
    href: '/founder-life'
  },
  {
    title: 'ফান্ডিং ও গ্রোথ',
    body: 'angel, grant, VC, Startup Bangladesh, pitch deck, data room, Dhaka-র বাইরে স্কেল এবং regional expansion।',
    href: '/phase-three'
  }
]

const paths = [
  ['একদম নতুন', 'স্টার্টআপ কী, SME থেকে পার্থক্য, প্রথম ৩০ দিনের রোডম্যাপ।', '/start-here'],
  ['আইডিয়া আছে', 'সমস্যা যাচাই, customer interview, MVP test, pricing signal।', '/idea-validation'],
  ['ব্যবসা চালু করতে চাই', 'কোন entity, কী লাইসেন্স, কর/VAT, ব্যাংক ও পেমেন্ট সেটআপ।', '/legal-roadmap'],
  ['বিক্রি বাড়াতে চাই', 'প্রথম ১০০ গ্রাহক, Facebook commerce, Messenger sales, trust-building।', '/customers']
]

function localHref(href) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  if (!href.startsWith('/')) return href
  if (!basePath) return href
  if (href === '/') return basePath || '/'
  return `${basePath}${href}`
}

export default function WikiLanding() {
  return (
    <div className="wiki-landing">
      <section className="wiki-hero" aria-labelledby="wiki-title">
        <div className="wiki-hero__main">
          <div className="wiki-title-row">
            <div>
              <p className="wiki-kicker">বাংলা-প্রথম ওপেন জ্ঞানভান্ডার</p>
              <h1 id="wiki-title">দেশি স্টার্টআপ</h1>
              <p className="wiki-subtitle">
                বাংলাদেশে স্টার্টআপ শুরু, গড়া ও বড় করার জন্য বাস্তবভিত্তিক প্রতিষ্ঠাতা ম্যানুয়াল।
              </p>
            </div>
            <span className="wiki-language-pill">বাংলা</span>
          </div>

          <p className="wiki-lead">
            <strong>দেশি স্টার্টআপ</strong> কোনো মোটিভেশনাল ব্লগ না। এটি এমন একটি ব্যবহারিক গাইড যেখানে
            একজন প্রতিষ্ঠাতা আইডিয়া যাচাই থেকে শুরু করে ব্যবসা নিবন্ধন, ট্রেড লাইসেন্স, e-TIN, VAT/BIN,
            পেমেন্ট, কুরিয়ার, প্রথম গ্রাহক, টিম, ফান্ডিং এবং গ্রোথ পর্যন্ত ধাপে ধাপে কাজের পথ পাবেন।
          </p>

          <p>
            বৈশ্বিক startup content অনেক ভালো, কিন্তু বাংলাদেশের বাজারে একই নিয়ম সরাসরি খাটে না। এখানে
            trust কম, COD বেশি, card usage সীমিত, Facebook/Messenger এখনো বড় sales channel, সরকারি
            প্রক্রিয়া আলাদা, এবং Dhaka-র বাইরে distribution পরিকল্পনা আলাদা করে ভাবতে হয়। এই গাইড সেই
            local বাস্তবতাকে সামনে রেখে লেখা।
          </p>

          <aside className="wiki-notice" role="note">
            <span aria-hidden="true">i</span>
            <p>
              আইন, কর, VAT, ব্যাংকিং বা লাইসেন্স সংক্রান্ত কোনো লেখা পড়লে সিদ্ধান্ত নেওয়ার আগে সর্বশেষ
              সরকারি সূত্র এবং প্রয়োজনে CA/আইনজীবীর সাথে মিলিয়ে নিন। এই প্রকল্প গাইড দেয়, আইনি পরামর্শ নয়।
            </p>
          </aside>

          <nav className="wiki-toc" aria-label="সূচিপত্র">
            <strong>সূচিপত্র</strong>
            <ol>
              <li><a href="#why-this-exists">কেন এই গাইড দরকার</a></li>
              <li><a href="#who-this-is-for">কাদের জন্য</a></li>
              <li><a href="#learning-paths">কীভাবে শুরু করবেন</a></li>
              <li><a href="#guide-scope">বিষয়ভিত্তিক পরিসর</a></li>
              <li><a href="#quality-standard">কনটেন্ট স্ট্যান্ডার্ড</a></li>
              <li><a href="#start-reading">শুরু করার পাতা</a></li>
            </ol>
          </nav>
        </div>

        <aside className="wiki-infobox" aria-label="দেশি স্টার্টআপ তথ্যছক">
          <h2>দেশি স্টার্টআপ</h2>
          <img src={localHref('/deshi-mark.svg')} alt="" />
          <strong>Deshi Startup</strong>
          <p>বাংলাদেশি প্রতিষ্ঠাতাদের জন্য ওপেন startup playbook</p>
          <dl>
            <div><dt>ধরন</dt><dd>ওপেন-সোর্স জ্ঞানভান্ডার</dd></div>
            <div><dt>ভাষা</dt><dd>বাংলা-প্রথম, দরকার হলে ইংরেজি term</dd></div>
            <div><dt>কেন্দ্র</dt><dd>বাংলাদেশের আইন, বাজার, পেমেন্ট, অপারেশন</dd></div>
            <div><dt>পাঠক</dt><dd>ছাত্র, প্রথমবারের founder, SME owner, diaspora founder</dd></div>
            <div><dt>লাইসেন্স</dt><dd>MIT</dd></div>
          </dl>
        </aside>
      </section>

      <section id="why-this-exists" className="wiki-section">
        <h2>কেন এই গাইড দরকার</h2>
        <p>
          বাংলাদেশে startup করার তথ্য আছে, কিন্তু সেটি ছড়িয়ে আছে সরকারি portal, PDF, blog, YouTube,
          Facebook group, পরিচিত মানুষের অভিজ্ঞতা আর পুরনো পোস্টে। একজন নতুন founder-এর জন্য সবচেয়ে
          কঠিন কাজ হলো কোন তথ্য এখনো valid, কোনটা শুধু opinion, আর কোনটা তার business stage-এর জন্য
          জরুরি তা বোঝা।
        </p>
        <div className="wiki-table-wrap">
          <table>
            <thead>
              <tr>
                <th>যেখানে founder আটকে যায়</th>
                <th>এই গাইড কীভাবে সাহায্য করবে</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>আইডিয়া আছে, কিন্তু কেউ কিনবে কিনা বোঝা যাচ্ছে না</td>
                <td>Interview script, MVP test, pre-order, pricing signal এবং validation checklist</td>
              </tr>
              <tr>
                <td>কোম্পানি করব, নাকি trade license দিয়েই শুরু করব?</td>
                <td>Business structure comparison, legal roadmap, cost/timeline expectation</td>
              </tr>
              <tr>
                <td>পেমেন্ট, COD, কুরিয়ার, refund ও fraud সামলানো কঠিন</td>
                <td>অপারেশন playbook, reconciliation template, delivery risk checklist</td>
              </tr>
              <tr>
                <td>বাংলাদেশে customer acquisition শুধু ads দিয়ে হচ্ছে না</td>
                <td>Facebook/Messenger sales, trust-building, field sales, community seeding</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="who-this-is-for" className="wiki-section">
        <h2>কাদের জন্য</h2>
        <ul className="wiki-plain-list">
          <li><strong>ছাত্র founder:</strong> কম বাজেটে সমস্যা যাচাই করে বাস্তব customer signal দেখতে চান।</li>
          <li><strong>প্রথমবারের founder:</strong> registration, payment, sales, compliance সব একসাথে বুঝতে চান।</li>
          <li><strong>Technical founder:</strong> product বানাতে পারেন, কিন্তু বাজার, আইন ও বিক্রির practical পথ চান।</li>
          <li><strong>SME owner:</strong> নিজের ব্যবসাকে tech-enabled, trackable এবং scalable করতে চান।</li>
          <li><strong>নারী founder ও ছোট শহরের উদ্যোক্তা:</strong> safety, trust, distribution ও social constraint মাথায় রেখে শুরু করতে চান।</li>
          <li><strong>Diaspora founder:</strong> বাইরে থেকে Bangladesh market, local operator ও compliance বুঝতে চান।</li>
        </ul>
      </section>

      <section id="learning-paths" className="wiki-section">
        <h2>কীভাবে শুরু করবেন</h2>
        <div className="wiki-path-grid">
          {paths.map(([title, body, href]) => (
            <a className="wiki-path-card" href={localHref(href)} key={title}>
              <strong>{title}</strong>
              <span>{body}</span>
            </a>
          ))}
        </div>
      </section>

      <section id="guide-scope" className="wiki-section">
        <h2>বিষয়ভিত্তিক পরিসর</h2>
        <div className="wiki-scope-grid">
          {scopeCards.map((card) => (
            <a className="wiki-scope-card" href={localHref(card.href)} key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="quality-standard" className="wiki-section">
        <h2>কনটেন্ট স্ট্যান্ডার্ড</h2>
        <p>
          এই প্রজেক্টের লক্ষ্য হলো এমন guide বানানো যা একজন নতুন মানুষও বুঝবে, আবার serious founder-ও
          কাজে লাগাতে পারবে। তাই ভালো লেখার মানে শুধু বেশি লেখা নয়; লেখাটি actionable, source-backed,
          stage-aware এবং Bangladesh-specific হতে হবে।
        </p>
        <div className="wiki-table-wrap">
          <table>
            <thead>
              <tr>
                <th>স্ট্যান্ডার্ড</th>
                <th>প্রতিটি গুরুত্বপূর্ণ পাতায় যা থাকা উচিত</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>সারকথা</td><td>পাতাটি কাকে সাহায্য করছে এবং কোন সিদ্ধান্তে সাহায্য করবে</td></tr>
              <tr><td>ধাপে ধাপে কাজ</td><td>কী করবেন, কোন order-এ করবেন, কোন document/লোক/টুল লাগবে</td></tr>
              <tr><td>বাংলাদেশ context</td><td>payment, trust, family pressure, logistics, regulation, Dhaka vs outside-Dhaka reality</td></tr>
              <tr><td>সতর্কতা</td><td>আইন/কর/ফি বদলাতে পারে, কোথায় official source যাচাই করতে হবে</td></tr>
              <tr><td>চেকলিস্ট</td><td>পড়ার পর founder কী action নেবে তার practical list</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="wiki-section">
        <h2>তথ্যসূত্রের ধরন</h2>
        <div className="wiki-source-list">
          {sources.map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="start-reading" className="wiki-section">
        <h2>শুরু করার পাতা</h2>
        <div className="wiki-link-columns">
          <div>
            <h3>প্রথমে পড়ুন</h3>
            <ul>
              <li><a href={localHref('/start-here')}>শুরু করুন: বাংলাদেশে স্টার্টআপ গড়ার রোডম্যাপ</a></li>
              <li><a href={localHref('/startup-vs-sme')}>স্টার্টআপ বনাম SME</a></li>
              <li><a href={localHref('/ecosystem-overview')}>বাংলাদেশ startup ecosystem overview</a></li>
              <li><a href={localHref('/idea-validation')}>আইডিয়া যাচাই</a></li>
            </ul>
          </div>
          <div>
            <h3>চালু করার আগে</h3>
            <ul>
              <li><a href={localHref('/legal-roadmap')}>আইনগত রোডম্যাপ</a></li>
              <li><a href={localHref('/company-types')}>কোম্পানির ধরন</a></li>
              <li><a href={localHref('/trade-license')}>ট্রেড লাইসেন্স</a></li>
              <li><a href={localHref('/e-tin-vat-bin')}>e-TIN ও VAT/BIN</a></li>
            </ul>
          </div>
          <div>
            <h3>বাজারে যাওয়ার সময়</h3>
            <ul>
              <li><a href={localHref('/payments')}>পেমেন্ট সিস্টেম</a></li>
              <li><a href={localHref('/customers')}>গ্রাহক খোঁজা</a></li>
              <li><a href={localHref('/phase-three/cod-and-delivery-risk')}>COD ও delivery risk</a></li>
              <li><a href={localHref('/phase-three/facebook-commerce-playbook')}>Facebook commerce playbook</a></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
