'use client'

import { useId, useState } from 'react'
import { calculateCodRisk } from '../lib/cod-risk.mjs'
import './CodRiskCalculator.css'

const defaults = { price: '1200', cogs: '800', delivery: '60', packaging: '20', returnFreight: '0', codPct: '1' }
type InputKey = keyof typeof defaults

export default function CodRiskCalculator({ locale = 'bn' }: { locale?: 'bn' | 'en' }) {
  const en = locale === 'en'
  const id = useId()
  const [inputs, setInputs] = useState(defaults)
  const values = Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, value.trim() === '' ? NaN : Number(value)])) as Record<InputKey, number>
  const result = calculateCodRisk(values)
  const number = new Intl.NumberFormat(en ? 'en-BD' : 'bn-BD', { maximumFractionDigits: 2 }).format
  const money = (amount: number) => en ? `BDT ${number(amount)}` : `${number(amount)} টাকা`
  const fields: { key: InputKey; label: string; hint?: string }[] = [
    { key: 'price', label: en ? 'Selling price' : 'বিক্রির দাম' },
    { key: 'cogs', label: en ? 'Cost of goods' : 'পণ্যের কেনা দাম' },
    { key: 'delivery', label: en ? 'Delivery charge' : 'ডেলিভারি চার্জ' },
    { key: 'packaging', label: en ? 'Packaging' : 'প্যাকেজিং' },
    { key: 'returnFreight', label: en ? 'Return freight' : 'রিটার্ন ফ্রেইট', hint: en ? 'Additional courier charge for a returned parcel.' : 'পার্সেল ফেরত এলে কুরিয়ারের অতিরিক্ত চার্জ।' },
    { key: 'codPct', label: en ? 'COD charge (%)' : 'COD চার্জ (%)' }
  ]
  const receipt = result ? [
    { key: 'goods', label: en ? 'Cost of goods' : 'পণ্যের কেনা দাম', value: values.cogs },
    { key: 'delivery', label: en ? 'Delivery' : 'ডেলিভারি', value: values.delivery },
    { key: 'packaging', label: en ? 'Packaging' : 'প্যাকেজিং', value: values.packaging },
    { key: 'cod', label: en ? 'COD fee' : 'COD ফি', value: result.codFee }
  ] : []

  return <section className="cod-calculator" aria-label={en ? 'COD cost calculator' : 'ক্যাশ অন ডেলিভারির খরচের হিসাব'}>
    <div className="cod-calculator__inputs">
      <p className="cod-calculator__heading">{en ? 'Your order' : 'আপনার অর্ডার'}</p>
      <p className="cod-calculator__units">{en ? 'All amounts in BDT.' : 'সব অঙ্ক টাকায়।'}</p>
      <div className="cod-calculator__fields">
        {fields.map(({ key, label, hint }) => {
          const invalid = !Number.isFinite(values[key]) || values[key] < 0 || (key === 'codPct' && values[key] > 100)
          return <label key={key}>
            <span>{label}</span>
            <input type="number" inputMode="decimal" min={0} max={key === 'codPct' ? 100 : undefined} step="any"
              value={inputs[key]} aria-invalid={invalid} aria-describedby={invalid ? `${id}-error` : hint ? `${id}-${key}-hint` : undefined}
              onChange={event => setInputs(current => ({ ...current, [key]: event.target.value }))} />
            {hint && <small id={`${id}-${key}-hint`}>{hint}</small>}
          </label>
        })}
      </div>
    </div>
    {result ? <div className="cod-receipt">
      <p className="cod-calculator__heading">{en ? 'If the customer keeps it' : 'কাস্টমার পার্সেল নিলে'}</p>
      <dl className="cod-receipt__lines">
        <div className="cod-receipt__sale"><dt>{en ? 'Selling price' : 'বিক্রির দাম'}</dt><dd>{money(values.price)}</dd></div>
        {receipt.map(item => <div key={item.key}>
          <dt><span className={`cod-receipt__swatch cod-receipt__swatch--${item.key}`} aria-hidden="true" />{item.label}</dt><dd>−{number(item.value)}</dd>
        </div>)}
        <div className="cod-receipt__total" data-loss={result.kept < 0 || undefined}><dt>{result.kept < 0 ? (en ? 'Loss per delivery' : 'প্রতি ডেলিভারিতে লোকসান') : (en ? 'Left per delivery' : 'প্রতি ডেলিভারিতে থাকে')}</dt><dd>{money(Math.abs(result.kept))}</dd></div>
      </dl>
      {values.price > 0 && result.kept >= 0 && <div className="cod-receipt__allocation" aria-hidden="true">
        {receipt.map(item => <span key={item.key} className={`cod-receipt__swatch--${item.key}`} style={{ flex: item.value }} />)}
        <span className="cod-receipt__remaining" style={{ flex: result.kept }} />
      </div>}
      <div className="cod-receipt__return">
        <p><strong>{en ? 'If it comes back' : 'পার্সেল ফেরত এলে'}</strong><span>{money(result.lost)} {en ? 'lost' : 'লোকসান'}</span></p>
        <p>{en ? 'Delivery + packaging + return freight. The goods are assumed to be saleable again.' : 'ডেলিভারি + প্যাকেজিং + রিটার্ন ফ্রেইট। ফেরত আসা পণ্য আবার বিক্রি করা যাবে ধরে নেওয়া হয়েছে।'}</p>
      </div>
      <div className="cod-receipt__breakeven">
        <p><strong>{en ? 'Break-even return rate' : 'ব্রেক-ইভেন রিটার্ন রেট'}</strong><span>{result.breakEven === null ? '–' : `${number(result.breakEven)}%`}</span></p>
        <p>{result.kept < 0
          ? (en ? 'Even with no returns, the listed costs exceed the selling price.' : 'কোনো পার্সেল ফেরত না এলেও এই খরচগুলো বিক্রির দামের চেয়ে বেশি।')
          : result.breakEven === null
            ? (en ? 'Both outcomes are zero, so there is no single break-even return rate.' : 'দুই ক্ষেত্রেই লাভ-লোকসান শূন্য, তাই একটামাত্র ব্রেক-ইভেন রিটার্ন রেট নেই।')
            : (en ? 'At this rate, delivered orders just cover the losses from returns in this model.' : 'এই হারে পার্সেল ফেরত এলে, হিসাব অনুযায়ী ডেলিভারিতে যা থাকে তা দিয়েই রিটার্নের লোকসান মেটে।')}
        </p>
      </div>
    </div> : <p className="cod-calculator__error" id={`${id}-error`} role="alert">{en ? 'Enter a valid amount of zero or more in each field. The COD percentage must be between 0 and 100.' : 'প্রতিটি ঘরে শূন্য বা তার বেশি অঙ্ক দিন। ক্যাশ অন ডেলিভারি চার্জ ০ থেকে ১০০ শতাংশের মধ্যে হতে হবে।'}</p>}
    <span className="cod-calculator__status" role="status">{result && (en ? `Left per delivery: ${money(result.kept)}. Lost per return: ${money(result.lost)}.` : `প্রতি ডেলিভারিতে থাকে ${money(result.kept)}। প্রতি রিটার্নে লোকসান ${money(result.lost)}।`)}</span>
  </section>
}
