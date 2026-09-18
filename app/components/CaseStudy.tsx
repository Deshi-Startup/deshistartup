import { ecosystem, companyPath } from '../lib/ecosystem'
import type { ReactNode } from 'react'
import logos from '../../data/startup-50-logos.json'
import fullLogos from '../../data/case-study-logos.json'
import { mediaEntry, mediaUrl } from '../lib/media'
import './CaseStudy.css'

export type CaseLocale = 'bn' | 'en'

const companies = {
  '10-minute-school': {
    theme: 'school',
    sector: { en: 'Education', bn: 'শিক্ষা' }
  },
  pathao: {
    theme: 'pathao',
    sector: { en: 'Mobility & logistics', bn: 'যাতায়াত ও লজিস্টিকস' }
  },
  bkash: {
    theme: 'bkash',
    sector: { en: 'Mobile financial services & fintech', bn: 'মোবাইল আর্থিক সেবা ও ফিনটেক' }
  },
  ifarmer: {
    theme: 'ifarmer',
    sector: { en: 'Agriculture', bn: 'কৃষি' }
  },
  shikho: {
    theme: 'shikho',
    sector: { en: 'Education', bn: 'শিক্ষা' }
  },
  dorik: {
    theme: 'dorik',
    sector: { en: 'Software', bn: 'সফটওয়্যার' }
  },
  'shopup-silq': {
    theme: 'shopup',
    sector: { en: 'B2B & logistics', bn: 'বিটুবি ও লজিস্টিকস' }
  },
  'truck-lagbe': {
    theme: 'truck-lagbe',
    sector: { en: 'Freight & logistics', bn: 'পণ্য পরিবহন' }
  },
  arogga: {
    theme: 'arogga',
    sector: { en: 'Health', bn: 'স্বাস্থ্য' }
  },
  solshare: {
    theme: 'solshare',
    sector: { en: 'Energy', bn: 'জ্বালানি' }
  },
  agroshift: {
    theme: 'agroshift',
    sector: { en: 'Agriculture', bn: 'কৃষি' }
  }
} as const

export function CaseLogo({ slug, fallback }: { slug: string; fallback?: string }) {
  const logo = fullLogos.entries.find((entry) => entry.slug === slug)
    || logos.entries.find((entry) => entry.slug === slug)
  if (!logo) return fallback ? <span className="case-logo case-logo--text">{fallback}</span> : null
  const size = mediaEntry(logo.src)
  const background = 'background' in logo && typeof logo.background === 'string' ? logo.background : undefined
  return <span className="case-logo" style={background ? { background } : undefined}><img src={mediaUrl(logo.src)} width={size?.w} height={size?.h} alt={logo.name} decoding="async" /></span>
}

export function CaseCompany({ slug, locale = 'bn' }: { slug: keyof typeof companies; locale?: CaseLocale }) {
  const en = locale === 'en'
  const company = companies[slug]
  const profile = ecosystem.organizations.find(o => o.references.some(r => r.kind === 'case-study' && r.target === slug))
  return (
    <div className={`case-company case-theme--${company.theme}`}>
      <CaseLogo slug={slug} />
      <p>
        <span>{company.sector[locale]} · {en ? 'Bangladesh' : 'বাংলাদেশ'}</span>
        <span>{en ? 'Case study based on public sources' : 'পাবলিক তথ্যের ভিত্তিতে তৈরি কেস স্টাডি'}</span>
        {profile && <a href={companyPath(locale, profile.slug)}>{en ? 'Company profile' : 'কোম্পানির প্রোফাইল'}</a>}
      </p>
    </div>
  )
}

export function CaseTimeline({ children }: { children: ReactNode }) {
  return <ol className="case-timeline" role="list">{children}</ol>
}

export function CaseMilestone({ date, title, href, children }: { date: string; title: string; href?: string; children: ReactNode }) {
  return (
    <li>
      <span className="case-timeline__date">{date}</span>
      <div className="case-timeline__moment"><h3 data-toc-ignore>{href ? <a href={href}>{title}</a> : title}</h3>{children}</div>
    </li>
  )
}

export function CaseDetail({ title, children }: { title: string; children: ReactNode }) {
  return <section className="case-detail"><h3 data-toc-ignore>{title}</h3>{children}</section>
}

export function CaseProcess({ title, steps, children, locale = 'en' }: {
  title: string
  steps: { title: string; description: string }[]
  children: ReactNode
  locale?: CaseLocale
}) {
  return (
    <figure className="case-process">
      <p className="case-process__title"><strong>{title}</strong></p>
      <ol role="list">
        {steps.map((step, index) => (
          <li key={step.title}>
            <span className="case-process__number" aria-hidden="true">{(index + 1).toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-US')}</span>
            <strong>{step.title}</strong>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
      <figcaption>{children}</figcaption>
    </figure>
  )
}

export function CaseExchange({ title, lanes, children, company }: {
  title: string
  lanes: { label: string; stops: { title: string; detail: string; note?: string }[] }[]
  children: ReactNode
  company?: keyof typeof companies
}) {
  return (
    <figure className={`case-exchange${company ? ` case-theme--${companies[company].theme}` : ''}`}>
      <p className="case-exchange__title"><strong>{title}</strong></p>
      {lanes.map((lane) => (
        <div className="case-exchange__lane" key={lane.label}>
          <p className="case-exchange__label">{lane.label}</p>
          <ol role="list">
            {lane.stops.map((stop) => <li key={stop.title}><strong>{stop.title}</strong><p>{stop.detail}</p>{stop.note && <p className="case-exchange__note">{stop.note}</p>}</li>)}
          </ol>
        </div>
      ))}
      <figcaption>{children}</figcaption>
    </figure>
  )
}

export function CaseContrast({ title, sides, children }: {
  title: string
  sides: { title: string; points: string[] }[]
  children: ReactNode
}) {
  return (
    <figure className="case-contrast">
      <p className="case-contrast__title"><strong>{title}</strong></p>
      <div className="case-contrast__sides">
        {sides.map((side) => <div key={side.title}><h3 data-toc-ignore>{side.title}</h3><ul>{side.points.map((point) => <li key={point}>{point}</li>)}</ul></div>)}
      </div>
      <figcaption>{children}</figcaption>
    </figure>
  )
}
