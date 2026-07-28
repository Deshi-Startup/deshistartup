import React from 'react'

interface CiteProps {
  id?: string | number
  href?: string
  title?: string
  children?: React.ReactNode
}

const bengaliDigits = (value: string | number) =>
  String(value).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)])

export default function Cite({ id = '1', href, title, children }: CiteProps) {
  const targetHref = href || `#ref-${id}`

  return (
    <sup className="cite-footnote">
      <a href={targetHref} className="cite-link" title={title}>
        [
        {children || (
          <>
            <span className="cite-number cite-number--bn">{bengaliDigits(id)}</span>
            <span className="cite-number cite-number--en">{id}</span>
          </>
        )}
        ]
        <span className="sr-only">
          <span className="cite-label cite-label--bn"> নম্বর সূত্র দেখুন</span>
          <span className="cite-label cite-label--en"> See reference</span>
        </span>
      </a>
    </sup>
  )
}
