'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

interface CiteProps {
  id?: string | number
  href?: string
  title?: string
  children?: React.ReactNode
}

const bengaliDigits = (val: string | number) => String(val).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])

export default function Cite({ id = '1', href, title, children }: CiteProps) {
  const pathname = usePathname() || ''
  const isEn = pathname.startsWith('/en/') || pathname === '/en'

  const displayNum = children || (isEn ? String(id) : bengaliDigits(id))
  const targetHref = href || `#ref-${id}`

  return (
    <sup className="cite-footnote">
      <a
        href={targetHref}
        className="cite-link"
        title={title || (isEn ? `See reference [${id}]` : `সূত্র দ্রষ্টব্য [${displayNum}]`)}
        aria-label={title || (isEn ? `Reference ${id}` : `সূত্র ${displayNum}`)}
      >
        [{displayNum}]
      </a>
    </sup>
  )
}
