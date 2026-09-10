import type { ReactNode } from 'react'
import logos from '../../data/startup-50-logos.json'
import fullLogos from '../../data/case-study-logos.json'
import { mediaEntry, mediaUrl } from '../lib/media'
import './CaseStudy.css'

export type CaseLocale = 'bn' | 'en'

export function CaseLogo({ slug, fallback }: { slug: string; fallback?: string }) {
  const logo = fullLogos.entries.find((entry) => entry.slug === slug)
    || logos.entries.find((entry) => entry.slug === slug)
  if (!logo) return fallback ? <span className="case-logo case-logo--text">{fallback}</span> : null
  const size = mediaEntry(logo.src)
  const background = 'background' in logo && typeof logo.background === 'string' ? logo.background : undefined
  return <span className="case-logo" style={background ? { background } : undefined}><img src={mediaUrl(logo.src)} width={size?.w} height={size?.h} alt={logo.name} decoding="async" /></span>
}

export function CaseCompany({ slug, locale = 'bn' }: { slug: string; locale?: CaseLocale }) {
  const en = locale === 'en'
  const education = slug === '10-minute-school'
  return (
    <div className={`case-company case-theme--${education ? 'school' : 'pathao'}`}>
      <CaseLogo slug={slug} />
      <p>
        <span>{education ? (en ? 'Education' : 'শিক্ষা') : (en ? 'Mobility & logistics' : 'যাতায়াত ও লজিস্টিকস')} · {en ? 'Bangladesh' : 'বাংলাদেশ'}</span>
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
