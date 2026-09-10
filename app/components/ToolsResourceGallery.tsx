import type { ReactNode } from 'react'
import contentIndex from '../generated/content-index.json'
import './ToolsResourceGallery.css'

type Locale = 'en' | 'bn'
type Resource = {
  id: string
  route: string
  en: [title: string, description: string]
  bn: [title: string, description: string]
  fragments?: Record<Locale, string>
}

const resources: Resource[] = [
  {
    id: 'interview', route: '/validation/interview-scripts',
    en: ['Customer interview scripts', 'Practice questions and downloadable interview notes.'],
    bn: ['কাস্টমার ইন্টারভিউ স্ক্রিপ্ট', 'প্র্যাকটিসের প্রশ্ন ও ডাউনলোডেবল ইন্টারভিউ নোটস।']
  },
  {
    id: 'cash', route: '/metrics/cashflow-vs-profit',
    en: ['Cash flow versus profit', 'An interactive cash-timing example and a daily table.'],
    bn: ['ক্যাশ ফ্লো বনাম প্রফিট', 'টাকা আসা-যাওয়ার ইন্টারঅ্যাক্টিভ উদাহরণ ও প্রতিদিনের হিসাবের টেবিল।']
  },
  {
    id: 'hiring', route: '/team/hiring-scorecard',
    en: ['Hiring scorecard', 'A role-specific assessment template.'],
    bn: ['হায়ারিং স্কোরকার্ড', 'নির্দিষ্ট রোলের জন্য প্রার্থী যাচাইয়ের টেমপ্লেট।']
  },
  {
    id: 'cod', route: '/operations/cod-risk',
    en: ['Cash-on-delivery calculator', 'Work out what you keep per delivery and lose per return.'],
    bn: ['ক্যাশ অন ডেলিভারি ক্যালকুলেটর', 'প্রতি ডেলিভারিতে কত থাকে আর রিটার্নে কত ক্ষতি হয়, হিসাব করুন।'],
    fragments: { en: 'work-out-your-own-number', bn: 'আপনার-নিজের-হিসাবটা-বের-করে-নিন' }
  },
  {
    id: 'sales', route: '/customers/whatsapp-messenger-sales',
    en: ['WhatsApp and Messenger sales', 'Copy-ready replies, scenarios and a downloadable script pack.'],
    bn: ['হোয়াটসঅ্যাপ ও মেসেঞ্জার সেলস', 'রেডিমেড রিপ্লাই, বিভিন্ন সিনারিও ও ডাউনলোডেবল স্ক্রিপ্ট প্যাক।']
  },
  {
    id: 'folders', route: '/funding/data-room',
    en: ['Investor data room', 'A preparation checklist and document structure.'],
    bn: ['ইনভেস্টর ডেটা রুম', 'প্রস্তুতির চেকলিস্ট ও ডকুমেন্টের স্ট্রাকচার।'],
    fragments: { en: 'the-six-folders', bn: 'ছয়টি-ফোল্ডার' }
  }
]

// These are excerpts and worked examples from the linked guides, not live inputs.
function ResourcePreview({ id, locale }: { id: string; locale: Locale }) {
  const t = (en: string, bn: string) => locale === 'en' ? en : bn
  const n = (value: string | number) => locale === 'en' ? String(value) : String(value).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])

  if (id === 'interview') return (
    <>
      <div className="tools-sheet tools-sheet--back"><div className="tools-sheet-heading">{t('Interview notes', 'ইন্টারভিউ নোটস')}</div>{[1, 2, 3].map((i) => <span key={i} className="tools-writing-line" />)}</div>
      <div className="tools-sheet tools-sheet--questions">
        <div className="tools-sheet-heading">{t('Customer interview', 'কাস্টমার ইন্টারভিউ')}<span>{t('Script excerpt', 'স্ক্রিপ্টের অংশ')}</span></div>
        {[
          t('When did [the problem] last happen? Can you walk me through it?', 'শেষ কবে [সমস্যাটা] হয়েছিল? কী হয়েছিল, একটু বলবেন?'),
          t('What did you do then? Whose help did you need?', 'তখন কী করলেন? কার সাহায্য নিতে হয়েছিল?'),
          t('How much time did that take? Did it cost you anything?', 'এতে কত সময় গেল? টাকা কিছু গিয়েছিল?')
        ].map((question, i) => <div key={i} className={`tools-question${i === 2 ? ' tools-question--last' : ''}`}><span>{n(`0${i + 2}`)}</span><p>{question}</p></div>)}
      </div>
    </>
  )

  if (id === 'cash') return (
    <>
      <div className="tools-cash-caption"><span>{t('Cash timing', 'টাকা কখন আসছে, কখন যাচ্ছে')}</span><span>{t('Example · BDT', 'উদাহরণ · টাকা')}</span></div>
      <div className="tools-cash-chart">
        <svg viewBox="0 0 420 190" preserveAspectRatio="xMidYMid meet">
          <line className="tools-chart-rule" x1="20" y1="86" x2="400" y2="86" /><text x="5" y="80">{n(0)}</text>
          <path className="tools-cash-area" d="M30 56H126V146H221V161H315V26H393V86H30Z" />
          <path className="tools-cash-line" d="M30 56H126V146H221V161H315V26H393" />
          <g className="tools-chart-points"><circle cx="30" cy="56" r="4" /><circle cx="126" cy="146" r="4" /><circle cx="221" cy="161" r="4" /><circle cx="315" cy="26" r="4" /></g>
          <text x="31" y="41">{n('10,000')}</text><text x="126" y="132">{n('−20,000')}</text><text x="212" y="184">{n('−25,000')}</text><text x="324" y="20">{n('20,000')}</text>
        </svg>
      </div>
      <div className="tools-cash-dates">
        {[[1, t('Opening cash', 'শুরুর টাকা')], [3, t('Supplier bill', 'সাপ্লায়ারের বিল')], [5, t('Other costs', 'অন্য খরচ')], [8, t('Customer pays', 'কাস্টমারের পেমেন্ট')]].map(([day, label]) => <span key={day}>{t(`Day ${day}`, `দিন ${n(day)}`)}<br /><strong>{label}</strong></span>)}
      </div>
    </>
  )

  if (id === 'hiring') return (
    <div className="tools-score-sheet">
      <div className="tools-sheet-heading">{t('Hiring scorecard', 'হায়ারিং স্কোরকার্ড')}<span>{t('Template excerpt', 'টেমপ্লেটের অংশ')}</span></div>
      <div className="tools-score-role">{t('Role and main outcomes', 'রোল ও প্রধান কাজ')}<span /></div>
      <div className="tools-score-head"><span>{t('Skill to check', 'যে স্কিল যাচাই করবেন')}</span><span>{t('Rating', 'স্কোর')}</span></div>
      {[t('Accuracy', 'নির্ভুলতা'), t('Judgment', 'জাজমেন্ট'), t('Communication', 'কমিউনিকেশন')].map((skill) => <div className="tools-score-row" key={skill}><strong>{skill}</strong><span>{[1, 2, 3, 4].map((score) => <i key={score}>{n(score)}</i>)}</span></div>)}
      <div className="tools-score-footer">{t('Observed behavior or work', 'যে আচরণ বা কাজ দেখেছেন')}<span /></div>
    </div>
  )

  if (id === 'cod') return (
    <>
      <div className="tools-receipt">
        <div className="tools-receipt-title">{t('One delivered order', 'ডেলিভারি হওয়া একটা অর্ডার')}<span>{t('Worked example · BDT', 'হিসাবের উদাহরণ · টাকা')}</span></div>
        <dl>{[[t('Selling price', 'বিক্রির দাম'), '1,200'], [t('Cost of goods', 'পণ্যের খরচ'), '−800'], [t('Delivery', 'ডেলিভারি'), '−60'], [t('Packaging', 'প্যাকেজিং'), '−20'], [t('COD charge', 'সিওডি চার্জ'), '−12']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{n(value)}</dd></div>)}</dl>
        <div className="tools-receipt-result"><span>{t('Kept per delivery', 'প্রতি ডেলিভারিতে থাকে')}</span><strong>{n(308)}</strong></div>
        <p>{t('Before other business costs', 'ব্যবসার অন্য খরচ বাদ দেওয়ার আগে')}</p>
      </div>
      <div className="tools-cost-strip"><span className="tools-cost-product" /><span className="tools-cost-delivery" /><span className="tools-cost-kept" /></div>
    </>
  )

  if (id === 'sales') return (
    <div className="tools-message-page">
      <div className="tools-message-top"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9H13a8.5 8.5 0 0 1 8 8v.5Z" /></svg><span>{t('First sales conversation', 'বিক্রির প্রথম আলাপ')}</span></div>
      <div className="tools-message-bubble">
        <p>{t("Hi [name], I'm [your name] from [business].", 'হ্যালো [নাম], আমি [ব্যবসার নাম] থেকে [আপনার নাম] বলছি।')}</p>
        <p>{t('We help [customer group] with [specific task].', 'আমরা [কোন ধরনের কাস্টমার]-কে [নির্দিষ্ট কাজ]-এ সাহায্য করি।')}</p>
        <p>{t('Would you like a short explanation of what we do and what it costs?', 'কী কাজ করি আর খরচ কত, একটু জানাতে পারি?')}</p>
      </div>
      <div className="tools-message-note">{t('Script excerpt · replace the brackets', 'স্ক্রিপ্টের অংশ · ব্র্যাকেটে নিজের তথ্য বসান')}</div>
    </div>
  )

  return (
    <>
      <div className="tools-folder-back" />
      <div className="tools-folder">
        <div className="tools-folder-tab">{t('Data room', 'ডেটা রুম')}</div>
        <div className="tools-folder-content">
          <div className="tools-folder-heading">{t('The six folders', 'ছয়টি ফোল্ডার')}</div>
          {[
            t('Corporate & Registry Documents', 'কর্পোরেট ও রেজিস্ট্রি ডকুমেন্টস'),
            t('Financial Statements & Tax Compliance', 'ফিন্যান্সিয়াল স্টেটমেন্টস ও ট্যাক্স কমপ্লায়েন্স'),
            t('Legal & Commercial Contracts', 'লিগ্যাল ও কমার্শিয়াল কন্ট্রাক্টস'),
            t('Technology & Intellectual Property', 'টেকনোলজি ও ইন্টেলেকচুয়াল প্রোপার্টি'),
            t('Human Resources & Employment', 'হিউম্যান রিসোর্সেস ও এমপ্লয়মেন্ট'),
            t('Cap Table & Prior Investment', 'ক্যাপ টেবিল ও আগের ইনভেস্টমেন্ট')
          ].map((folder, i) => <div key={i}><span>{n(`0${i + 1}`)}</span>{folder}</div>)}
        </div>
      </div>
    </>
  )
}

export function ToolsResourceGroups({ children }: { children: ReactNode }) {
  return <div className="tools-resource-lists">{children}</div>
}

export function ToolsResourceGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="tools-resource-list">
      <summary>
        <span>{title}</span>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12" /><path className="tools-resource-list__plus" d="M10 4v12" /></svg>
      </summary>
      <div className="tools-resource-list__content">{children}</div>
    </details>
  )
}

export function ToolsSoftwareSpotlight({ locale = 'bn' }: { locale?: Locale }) {
  const isEn = locale === 'en'
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return (
    <a className="tools-software-spotlight" lang={locale} href={`${base}${isEn ? '/en' : ''}/tools/affordable-tools`} aria-labelledby="software-guide" aria-describedby="software-guide-description">
      <div>
        <h2 id="software-guide">{isEn ? 'Choosing software for your startup?' : 'ব্যবসার জন্য সফটওয়্যার খুঁজছেন?'}</h2>
        <p id="software-guide-description">{isEn ? 'Compare tools for email, websites, payments, bookkeeping and more.' : 'ইমেইল, ওয়েবসাইট, পেমেন্ট ও হিসাব রাখার টুলগুলো তুলনা করে দেখুন।'}</p>
      </div>
      <span>{isEn ? 'Read the guide' : 'গাইড দেখুন'}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg></span>
    </a>
  )
}

export default function ToolsResourceGallery({ locale = 'bn' }: { locale?: Locale }) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const prefix = locale === 'en' ? '/en' : ''
  const sections = (contentIndex as unknown as Record<Locale, {
    sections: Record<string, [string, number, number, unknown, [string, [string, string, number, unknown][]][]]>
  }>)[locale].sections
  const written = new Set(Object.values(sections).flatMap((section) => section[4].flatMap((group) => group[1].filter((page) => !page[2]).map((page) => page[0]))))
  const available = resources.filter((resource) => written.has(`${prefix}${resource.route}`))

  return (
    <div className="tools-gallery" lang={locale} data-inline-edit-source="tools-resource-gallery">
      <div className="tools-resource-grid" id="tools-resource-grid">
        {available.map((resource) => {
          const [title, description] = resource[locale]
          const id = `tools-${resource.id}-title`
          return (
            <a key={resource.id} className={`tools-resource tools-resource--${resource.id}`} href={`${base}${prefix}${resource.route}${resource.fragments ? `#${resource.fragments[locale]}` : ''}`} aria-labelledby={id} aria-describedby={`${id}-description`}>
              <div className={`tools-preview tools-preview--${resource.id}`} aria-hidden="true" data-pagefind-ignore><ResourcePreview id={resource.id} locale={locale} /></div>
              <div className="tools-resource-info">
                <h3 id={id} data-toc-ignore>{title}</h3>
                <p id={`${id}-description`}>{description}</p>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
