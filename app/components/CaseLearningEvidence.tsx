import type { ReactNode } from 'react'
import './CaseStudy.css'
import './CaseLearningEvidence.css'

type EvidenceSource = { href: string; label: string }

export type CaseLearningEvidenceProps = {
  title: string
  practice: {
    title: string
    description: string
    results: { correct: string; incorrect: string; skipped: string }
    source: EvidenceSource
  }
  chapter: {
    title: string
    description: string
    attendanceLabel: string
    topicsLabel: string
    revisitLabel: string
    source: EvidenceSource
  }
  children: ReactNode
}

/** Original interpretation of published features, with no product UI or sample data. */
export default function CaseLearningEvidence({ title, practice, chapter, children }: CaseLearningEvidenceProps) {
  return (
    <figure className="case-learning-evidence case-theme--shikho">
      <p className="case-learning-evidence__title"><strong>{title}</strong></p>

      <div className="case-learning-evidence__panels">
        <section className="case-learning-evidence__panel">
          <h3 data-toc-ignore>{practice.title}</h3>
          <p className="case-learning-evidence__description">{practice.description}</p>
          <ul className="case-learning-evidence__results" role="list">
            {(['correct', 'incorrect', 'skipped'] as const).map((result) => (
              <li key={result}><ResultIcon kind={result} /><span>{practice.results[result]}</span></li>
            ))}
          </ul>
          <a className="case-learning-evidence__source" href={practice.source.href}>{practice.source.label}</a>
        </section>

        <section className="case-learning-evidence__panel">
          <h3 data-toc-ignore>{chapter.title}</h3>
          <p className="case-learning-evidence__description">{chapter.description}</p>
          <div className="case-learning-evidence__signals">
            <p className="case-learning-evidence__attendance"><AttendanceIcon /><span>{chapter.attendanceLabel}</span></p>
            <div className="case-learning-evidence__review">
              <p><TopicIcon /><strong>{chapter.topicsLabel}</strong></p>
              <p className="case-learning-evidence__revisit"><RevisitIcon /><span>{chapter.revisitLabel}</span></p>
            </div>
          </div>
          <a className="case-learning-evidence__source" href={chapter.source.href}>{chapter.source.label}</a>
        </section>
      </div>

      <figcaption>{children}</figcaption>
    </figure>
  )
}

function ResultIcon({ kind }: { kind: 'correct' | 'incorrect' | 'skipped' }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="9" />
    {kind === 'correct' ? <path d="m7.5 12 3 3 6-6" /> : kind === 'incorrect' ? <path d="m8.5 8.5 7 7m0-7-7 7" /> : <path d="M8 12h8" />}
  </svg>
}

function AttendanceIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M5 5h14v15H5zM8 3v4m8-4v4M5 10h14m-10 5 2 2 4-4" />
  </svg>
}

function TopicIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M4 4h7l2 2h7v14H4zM8 10h8m-8 4h5" />
  </svg>
}

function RevisitIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M6 3v10a4 4 0 0 0 4 4h9m-4-4 4 4-4 4" />
  </svg>
}
