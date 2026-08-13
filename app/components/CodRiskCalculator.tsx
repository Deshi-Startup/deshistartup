'use client'

import React, { useState } from 'react'

interface CodRiskCalculatorProps {
  locale?: 'bn' | 'en'
}

function Field({
  label,
  value,
  onChange,
  hint,
  step = 1
}: {
  label: string
  value: number
  onChange: (n: number) => void
  hint?: string
  step?: number
}) {
  return (
    <label className="calc__field">
      <span className="calc__label">{label}</span>
      <input
        className="calc__input"
        type="number"
        inputMode="decimal"
        step={step}
        min={0}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      />
      {hint && <span className="calc__hint">{hint}</span>}
    </label>
  )
}

/**
 * The break-even RTO calculator for the cash-on-delivery guide. A small client
 * island: the server renders the worked example as static HTML, and hydration
 * only enables editing. Every output is real text, so the numbers remain in
 * the DOM even with JavaScript disabled.
 *
 * All copy is chosen by `locale`, the way StubNotice does it, so the Bangla
 * page never renders an English widget. The input boxes stay in Western
 * numerals because `type="number"` only accepts those; the results do not.
 */
export default function CodRiskCalculator({ locale = 'bn' }: CodRiskCalculatorProps) {
  const isEn = locale === 'en'
  const [price, setPrice] = useState(1200)
  const [cogs, setCogs] = useState(800)
  const [delivery, setDelivery] = useState(60)
  const [packaging, setPackaging] = useState(20)
  const [returnFreight, setReturnFreight] = useState(0)
  const [codPct, setCodPct] = useState(1)

  const format = new Intl.NumberFormat(isEn ? 'en-BD' : 'bn-BD').format

  const kept = price - cogs - delivery - packaging - (codPct / 100) * price
  const lost = delivery + packaging + returnFreight
  const denom = kept + lost
  const breakEven = denom > 0 ? (kept / denom) * 100 : NaN

  let verdict = ''
  if (!Number.isFinite(kept)) verdict = ''
  else if (kept <= 0)
    verdict = isEn
      ? 'Every order already loses money before any return — do not sell this on COD.'
      : 'একটি পার্সেলও ফেরত আসার আগেই প্রতিটি অর্ডারে লোকসান হচ্ছে। এই পণ্যটি ক্যাশ অন ডেলিভারিতে বেচবেন না।'
  else if (breakEven < 30)
    verdict = isEn
      ? 'Break-even is under 30% — require a deposit before dispatch.'
      : 'ব্রেক-ইভেন ৩০ শতাংশের নিচে। পার্সেল পাঠানোর আগে অ্যাডভান্স নিন।'
  else
    verdict = isEn
      ? 'COD can work here, but watch your actual return rate against this break-even.'
      : 'এখানে ক্যাশ অন ডেলিভারি চলতে পারে। তবে নিজের আসল রিটার্ন রেট এই ব্রেক-ইভেনের সঙ্গে মিলিয়ে দেখতে থাকুন।'

  return (
    <div className="calc">
      <div className="calc__grid">
        <Field
          label={isEn ? 'Selling price' : 'বিক্রির দাম'}
          value={price}
          onChange={setPrice}
        />
        <Field
          label={isEn ? 'Cost of goods (COGS)' : 'পণ্যের কেনা দাম (COGS)'}
          value={cogs}
          onChange={setCogs}
        />
        <Field
          label={isEn ? 'Delivery charge' : 'ডেলিভারি চার্জ'}
          value={delivery}
          onChange={setDelivery}
        />
        <Field
          label={isEn ? 'Packaging' : 'প্যাকেজিং'}
          value={packaging}
          onChange={setPackaging}
        />
        <Field
          label={isEn ? 'Return freight' : 'রিটার্ন ফ্রেইট'}
          value={returnFreight}
          onChange={setReturnFreight}
          hint={
            isEn
              ? 'Steadfast charges 0; some couriers add a charge'
              : 'স্টেডফাস্ট এর জন্য কিছু নেয় না, কিছু কুরিয়ার নেয়'
          }
        />
        <Field
          label={isEn ? 'COD charge (%)' : 'ক্যাশ অন ডেলিভারি চার্জ (%)'}
          value={codPct}
          onChange={setCodPct}
          step={0.1}
        />
      </div>

      <dl className="calc__results" aria-live="polite">
        <div className="calc__result">
          <dt>{isEn ? 'Kept per delivery' : 'প্রতি ডেলিভারিতে থাকে'}</dt>
          <dd>{Number.isFinite(kept) ? format(Math.round(kept)) : '—'}</dd>
        </div>
        <div className="calc__result">
          <dt>{isEn ? 'Lost per return' : 'প্রতি রিটার্নে যায়'}</dt>
          <dd>{Number.isFinite(lost) ? format(Math.round(lost)) : '—'}</dd>
        </div>
        <div className="calc__result calc__result--main">
          <dt>{isEn ? 'Break-even RTO' : 'ব্রেক-ইভেন আরটিও'}</dt>
          <dd>{Number.isFinite(breakEven) ? `${format(Math.round(breakEven))}%` : '—'}</dd>
        </div>
      </dl>

      <p className="calc__verdict">{verdict}</p>
    </div>
  )
}
