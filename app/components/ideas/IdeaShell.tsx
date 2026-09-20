import type { ReactNode } from 'react'
import type { Locale } from './types'
import './ideas.css'

export default function IdeaShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <div className="ideas-shell" lang={locale}>
    <div className="ideas-content">{children}</div>
  </div>
}
