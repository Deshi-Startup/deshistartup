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
  return (
    <div className={`case-company case-theme--${company.theme}`}>
      <CaseLogo slug={slug} />
      <p>
        <span>{company.sector[locale]} · {en ? 'Bangladesh' : 'বাংলাদেশ'}</span>
        <span>{en ? 'Case study based on public sources' : 'পাবলিক তথ্যের ভিত্তিতে তৈরি কেস স্টাডি'}</span>
      </p>
    </div>
  )
}

export function CaseTimeline({ children }: { children: ReactNode }) {
  return <ol className="case-timeline" role="list">{children}</ol>
}

export function CaseMilestone({ date, title, children }: { date: string; title: string; children: ReactNode }) {
  return (
    <li>
      <span className="case-timeline__date">{date}</span>
      <div className="case-timeline__moment"><h3 data-toc-ignore>{title}</h3>{children}</div>
    </li>
  )
}

export function CaseDetail({ title, children }: { title: string; children: ReactNode }) {
  return <section className="case-detail"><h3 data-toc-ignore>{title}</h3>{children}</section>
}
