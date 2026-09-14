import type { ReactNode } from 'react'
import './CaseStudy.css'
import './CaseGroupedDelivery.css'

type DeliveryStage = { title: string; description: string }

export type CaseGroupedDeliveryProps = {
  title: string
  orders: DeliveryStage
  factory: DeliveryStage
  home: DeliveryStage
  children: ReactNode
}

/** A schematic of grouped orders and workplace collection, with no measured counts. */
export default function CaseGroupedDelivery({ title, orders, factory, home, children }: CaseGroupedDeliveryProps) {
  return (
    <figure className="case-grouped-delivery case-theme--agroshift">
      <p className="case-grouped-delivery__title"><strong>{title}</strong></p>
      <ol className="case-grouped-delivery__stages" role="list">
        {[orders, factory, home].map((stage, index) => (
          <li key={index}>
            <div className="case-grouped-delivery__geometry" aria-hidden="true">
              <FlowGeometry stage={index} />
            </div>
            <div className="case-grouped-delivery__copy">
              <strong>{stage.title}</strong>
              <p>{stage.description}</p>
            </div>
          </li>
        ))}
      </ol>
      <figcaption>{children}</figcaption>
    </figure>
  )
}

function FlowGeometry({ stage }: { stage: number }) {
  return (
    <>
      <svg className="case-grouped-delivery__wide" viewBox="0 0 240 96" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1.5" focusable="false">
        {stage === 0 ? <>
          <path d="M38 16H74L144 48H240M38 48H144M38 80H74L144 48" />
          <rect x="24" y="10" width="14" height="12" /><rect x="24" y="42" width="14" height="12" /><rect x="24" y="74" width="14" height="12" />
          <path d="m216 42 8 6-8 6" />
        </> : stage === 1 ? <>
          <path d="M0 48H90m60 0h90m-24-6 8 6-8 6" />
          <rect className="case-grouped-delivery__collection" x="90" y="24" width="60" height="48" />
        </> : <>
          <path d="M0 48H86l72-32h44M86 48h116M86 48l72 32h44" />
          <rect x="202" y="10" width="14" height="12" /><rect x="202" y="42" width="14" height="12" /><rect x="202" y="74" width="14" height="12" />
        </>}
      </svg>
      <svg className="case-grouped-delivery__narrow" viewBox="0 0 72 96" fill="none" stroke="currentColor" strokeWidth="1.5" focusable="false">
        {stage === 0 ? <>
          <path d="M16 22v12l20 28v34M36 22v40M56 22v12L36 62m-5 20 5 6 5-6" />
          <rect x="10" y="10" width="12" height="12" /><rect x="30" y="10" width="12" height="12" /><rect x="50" y="10" width="12" height="12" />
        </> : stage === 1 ? <>
          <path d="M36 0v26m0 36v34m-5-14 5 6 5-6" />
          <rect className="case-grouped-delivery__collection" x="18" y="26" width="36" height="36" />
        </> : <>
          <path d="M36 0v28L16 60v14M36 28v46m0-46 20 32v14" />
          <rect x="10" y="74" width="12" height="12" /><rect x="30" y="74" width="12" height="12" /><rect x="50" y="74" width="12" height="12" />
        </>}
      </svg>
    </>
  )
}
