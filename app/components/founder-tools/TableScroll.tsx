import type { ReactNode } from 'react'
import './Workshop.css'

export default function TableScroll({ label, children }: { label: string; children: ReactNode }) {
  return <div className="founder-lab__table" role="region" aria-label={label} tabIndex={0}>
    {children}
  </div>
}
