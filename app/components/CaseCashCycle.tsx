import type { ReactNode } from 'react'
import './CaseStudy.css'
import './CaseCashCycle.css'

type Stage = { label: string; title: string; description: string }

/** A reader-controlled COD sequence. Native radios also work without JavaScript. */
export default function CaseCashCycle({ id, title, actors, parcelLabel, paymentLabel, stages, children }: {
  id: string
  title: string
  actors: [string, string, string]
  parcelLabel: string
  paymentLabel: string
  stages: [Stage, Stage, Stage]
  children: ReactNode
}) {
  return (
    <figure className="case-cash-cycle case-theme--shopup">
      <fieldset>
        <legend>{title}</legend>
        <div className="case-cash-cycle__choices">
          {stages.map((stage, index) => (
            <label key={stage.label}>
              <input type="radio" name={id} value={index} defaultChecked={index === 1} aria-describedby={`${id}-stage-${index}`} />
              <span>{stage.label}</span>
            </label>
          ))}
        </div>

        <div className="case-cash-cycle__diagram" aria-hidden="true">
          <div className="case-cash-cycle__actors">
            {actors.map((actor, index) => <div key={actor}><ActorIcon kind={index} /><span>{actor}</span></div>)}
          </div>
          <div className="case-cash-cycle__row">
            <strong>{parcelLabel}</strong>
            <div className="case-cash-cycle__track">
              <i /><i /><i />
              <span className="case-cash-cycle__marker case-cash-cycle__parcel"><ParcelIcon /></span>
            </div>
          </div>
          <div className="case-cash-cycle__row">
            <strong>{paymentLabel}</strong>
            <div className="case-cash-cycle__track">
              <i /><i /><i />
              <span className="case-cash-cycle__marker case-cash-cycle__payment"><PaymentIcon /></span>
            </div>
          </div>
        </div>

        <div className="case-cash-cycle__explanations">
          {stages.map((stage, index) => (
            <div className="case-cash-cycle__explanation" data-step={index} id={`${id}-stage-${index}`} key={stage.label}>
              <p className="case-cash-cycle__finding"><strong>{stage.title}</strong></p>
              <p>{stage.description}</p>
            </div>
          ))}
        </div>
      </fieldset>
      <figcaption>{children}</figcaption>
    </figure>
  )
}

function ActorIcon({ kind }: { kind: number }) {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {kind === 0 ? <><path d="M5 14v14h22V14M3 9h26l-3-5H6l-3 5Zm0 0v3a3.25 3.25 0 0 0 6.5 0 3.25 3.25 0 0 0 6.5 0 3.25 3.25 0 0 0 6.5 0 3.25 3.25 0 0 0 6.5 0V9M10 28v-9h6v9M21 19h2" /></> : kind === 1 ? <><path d="M3 8h16v16H3V8Zm16 6h6l4 5v5H19M20 15v5h8" /><circle cx="9" cy="25" r="3" /><circle cx="24" cy="25" r="3" /></> : <><circle cx="16" cy="9" r="5" /><path d="M6 28v-4a10 10 0 0 1 20 0v4H6Z" /></>}
  </svg>
}

function ParcelIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="m3 6 9-4 9 4v12l-9 4-9-4V6Zm0 0 9 4 9-4M12 10v12M7.5 4l9 4v5" /></svg>
}

function PaymentIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M2 5h20v14H2zM2 9a4 4 0 0 0 4-4m12 0a4 4 0 0 0 4 4M2 15a4 4 0 0 1 4 4m12 0a4 4 0 0 1 4-4" /><circle cx="12" cy="12" r="3" /></svg>
}
