import type { ReactNode } from 'react'
import './CaseStudy.css'
import './CaseAgentLiquidity.css'

type Exchange = { label: string; title: string; description: string }

/** Compare the two sides of an agent exchange without client JavaScript. */
export default function CaseAgentLiquidity({ id, title, customerLabel, agentLabel, cashLabel, balanceLabel, cashIn, cashOut, children }: {
  id: string
  title: string
  customerLabel: string
  agentLabel: string
  cashLabel: string
  balanceLabel: string
  cashIn: Exchange
  cashOut: Exchange
  children: ReactNode
}) {
  return (
    <figure className="case-agent-liquidity case-theme--bkash">
      <fieldset>
        <legend>{title}</legend>
        <div className="case-agent-liquidity__choices">
          {[cashIn, cashOut].map((state, index) => (
            <label key={state.label}>
              <input type="radio" name={id} value={index} defaultChecked={index === 1} aria-describedby={`${id}-${index}`} />
              <span>{state.label}</span>
            </label>
          ))}
        </div>

        <div className="case-agent-liquidity__diagram" aria-hidden="true">
          <div className="case-agent-liquidity__actors">
            <div><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="16" cy="9" r="5" /><path d="M6 28v-4a10 10 0 0 1 20 0v4H6Z" /></svg><strong>{customerLabel}</strong></div>
            <div><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M5 14v14h22V14M3 9h26l-3-5H6l-3 5Zm0 0v3a3.25 3.25 0 0 0 6.5 0 3.25 3.25 0 0 0 6.5 0 3.25 3.25 0 0 0 6.5 0 3.25 3.25 0 0 0 6.5 0V9M10 28v-9h6v9" /></svg><strong>{agentLabel}</strong></div>
          </div>
          <div className="case-agent-liquidity__flow case-agent-liquidity__cash"><span>{cashLabel}</span><i /></div>
          <div className="case-agent-liquidity__flow case-agent-liquidity__balance"><span>{balanceLabel}</span><i /></div>
        </div>

        <div className="case-agent-liquidity__explanations">
          {[cashIn, cashOut].map((state, index) => (
            <div className="case-agent-liquidity__explanation" data-exchange={index} id={`${id}-${index}`} key={state.label}>
              <p className="case-agent-liquidity__finding"><strong>{state.title}</strong></p>
              <p>{state.description}</p>
            </div>
          ))}
        </div>
      </fieldset>
      <figcaption>{children}</figcaption>
    </figure>
  )
}
