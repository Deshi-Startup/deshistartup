import type { ReactNode } from 'react'
import './LearningPath.css'

export function RoadmapPath({ children }: { children: ReactNode }) {
  return <ol className="roadmap-path">{children}</ol>
}

export function RoadmapStage({ number, title, href, children }: {
  number: string; title: string; href: string; children: ReactNode
}) {
  return <li className="roadmap-stage">
    <span className="roadmap-stage__number" aria-hidden="true">{number}</span>
    <div className="roadmap-stage__body">
      <h3><a href={href}>{title}<span aria-hidden="true"> →</span></a></h3>
      {children}
    </div>
  </li>
}

const stages = [
  { slug: 'validate', en: 'Validate', bn: 'যাচাই' },
  { slug: 'build', en: 'Build', bn: 'গড়ে তোলা' },
  { slug: 'grow', en: 'Grow', bn: 'বিক্রি বাড়ানো' },
  { slug: 'scale', en: 'Scale', bn: 'বড় পরিসরে চালানো' }
] as const

export function RoadmapNav({ current, locale = 'bn' }: {
  current: typeof stages[number]['slug']; locale?: 'bn' | 'en'
}) {
  return <nav className="roadmap-nav" aria-label={locale === 'en' ? 'Roadmap stages' : 'রোডম্যাপের ধাপ'}>
    <ol>{stages.map((stage, index) => <li key={stage.slug}>
      <a href={`${locale === 'en' ? '/en' : ''}/roadmap/${stage.slug}`} aria-current={stage.slug === current ? 'page' : undefined}>
        <span aria-hidden="true">{new Intl.NumberFormat(locale === 'en' ? 'en' : 'bn').format(index + 1)}</span>{stage[locale]}
      </a>
    </li>)}</ol>
  </nav>
}

/** Authored Markdown steps remain the only source and stay editable in Crepe. */
export function JourneySteps({ children, locale = 'bn' }: { children: ReactNode; locale?: 'bn' | 'en' }) {
  return <div className="journey-steps" lang={locale}>{children}</div>
}
