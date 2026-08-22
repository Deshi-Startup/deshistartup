'use client'

import React, { useState } from 'react'

interface FinancialProjectionsCalculatorProps {
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
 * Runway and break-even for the bottom-up projections guide. A small client
 * island: the server renders Sadia's worked example as static HTML, and
 * hydration only enables editing, so the numbers stay in the DOM with
 * JavaScript disabled.
 *
 * The simulation is deliberately the same arithmetic the page prints, rounding
 * the customer count to a whole number each month and carrying it forward, so
 * a reader who rebuilds it in a spreadsheet gets the same answer.
 *
 * Bangla copy is not written yet. Until it is, this component is used on the
 * English page only; `locale="bn"` falls back to the English strings rather
 * than shipping a half-translated widget, so do not add it to the Bangla page
 * until the strings below have a Bangla pair.
 */
export default function FinancialProjectionsCalculator({
  locale = 'en'
}: FinancialProjectionsCalculatorProps) {
  const isEn = locale === 'en'
  const [customers, setCustomers] = useState(40)
  const [added, setAdded] = useState(8)
  const [churn, setChurn] = useState(3)
  const [price, setPrice] = useState(2000)
  const [variable, setVariable] = useState(180)
  const [fixed, setFixed] = useState(413417)
  const [cash, setCash] = useState(4200000)

  // bn-BD gives Bengali digits with lakh grouping; en-IN keeps lakh grouping in Latin.
  const format = new Intl.NumberFormat(isEn ? 'en-IN' : 'bn-BD').format

  const contribution = price - variable
  const breakEvenCustomers = contribution > 0 ? Math.ceil(fixed / contribution) : NaN

  // Walk the model month by month, exactly as the worked example does.
  let c = customers
  let balance = cash
  let runway: number | null = null
  let breakEvenMonth: number | null = null
  let firstMonthBurn = NaN
  const LIMIT = 120
  for (let month = 1; month <= LIMIT; month += 1) {
    c = Math.round(c - c * (churn / 100) + added)
    const monthContribution = c * contribution
    if (month === 1) firstMonthBurn = fixed - monthContribution
    balance -= fixed - monthContribution
    if (breakEvenMonth === null && monthContribution >= fixed) breakEvenMonth = month
    if (balance < 0) {
      runway = month - 1
      break
    }
    if (breakEvenMonth !== null) break
  }

  const survives = runway === null
  // The page divides cash by the first month's burn, so the widget must too,
  // or the reader sees one number in the prose and a different one here.
  const naiveRunway =
    Number.isFinite(firstMonthBurn) && firstMonthBurn > 0 ? Math.round(cash / firstMonthBurn) : null

  let verdict = ''
  if (!Number.isFinite(contribution) || contribution <= 0) {
    verdict = isEn
      ? 'Each customer costs more to serve than they pay. No amount of growth fixes this — change the price or the cost first.'
      : 'একজন কাস্টমার থেকে যা আয় হয়, তাকে সার্ভিস দিতে খরচ তার চেয়ে বেশি। কাস্টমার বাড়িয়ে এই সমস্যার সমাধান হবে না—আগে দাম বা খরচ ঠিক করুন।'
  } else if (survives && breakEvenMonth !== null) {
    verdict = isEn
      ? `You reach break-even in month ${format(breakEvenMonth as number)}, before the cash runs out. Keep watching churn: it decides whether that month arrives.`
      : `ক্যাশ ফুরানোর আগেই, ${format(breakEvenMonth as number)} নম্বর মাসে আপনারা ব্রেক-ইভেনে পৌঁছাবেন। চার্নের দিকে নজর রাখুন: এই মাসটা আসলেই আসবে কি না তা চার্নের ওপর নির্ভর করে।`
  } else if (runway !== null) {
    verdict = isEn
      ? `The cash runs out in month ${format((runway as number) + 1)}, before you cover fixed cost. Raise money, raise the price, cut fixed cost, or add customers faster.`
      : `ফিক্সড খরচ ওঠানোর আগেই ${format((runway as number) + 1)} নম্বর মাসে ক্যাশ ফুরিয়ে যাবে। ফান্ড রেইজ করুন, দাম বাড়ান, ফিক্সড খরচ কমান, অথবা আরও দ্রুত কাস্টমার আনুন।`
  } else {
    verdict = isEn
      ? 'On these numbers the cash lasts beyond ten years. Check the churn and growth figures — a model that never runs out is usually a model with a wrong driver.'
      : 'এই হিসাব অনুযায়ী দশ বছরেও ক্যাশ ফুরোবে না। চার্ন আর গ্রোথের ডেটা আবার মিলিয়ে দেখুন—যে মডেলে ক্যাশ কখনো ফুরোয় না, সেই মডেলে সাধারণত কোনো ভুল ড্রাইভার বসানো থাকে।'
  }

  return (
    <div className="calc">
      <div className="calc__grid">
        <Field
          label={isEn ? 'Customers now' : 'বর্তমান কাস্টমার সংখ্যা'}
          value={customers}
          onChange={setCustomers}
        />
        <Field
          label={isEn ? 'New customers per month' : 'মাসে নতুন কাস্টমার'}
          value={added}
          onChange={setAdded}
        />
        <Field
          label={isEn ? 'Monthly churn (%)' : 'মাসে চার্ন (%)'}
          value={churn}
          onChange={setChurn}
          step={0.1}
        />
        <Field
          label={isEn ? 'Price per customer' : 'কাস্টমার-প্রতি দাম'}
          value={price}
          onChange={setPrice}
        />
        <Field
          label={isEn ? 'Variable cost per customer' : 'কাস্টমার-প্রতি ভ্যারিয়েবল খরচ'}
          value={variable}
          onChange={setVariable}
          hint={isEn ? 'Hosting, SMS, gateway fees' : 'হোস্টিং, এসএমএস, গেটওয়ে ফি'}
        />
        <Field
          label={isEn ? 'Fixed cost per month' : 'মাসে ফিক্সড খরচ'}
          value={fixed}
          onChange={setFixed}
          hint={isEn ? 'Payroll, bonus set-aside, rent' : 'বেতন, বোনাস ফান্ড, ভাড়া'}
        />
        <Field label={isEn ? 'Cash in the bank' : 'ব্যাংকে ক্যাশ'} value={cash} onChange={setCash} />
      </div>

      <dl className="calc__results" aria-live="polite">
        <div className="calc__result">
          <dt>{isEn ? 'Contribution per customer' : 'কাস্টমার-প্রতি কন্ট্রিবিউশন'}</dt>
          <dd>{Number.isFinite(contribution) ? format(contribution) : '—'}</dd>
        </div>
        <div className="calc__result">
          <dt>{isEn ? 'Customers to cover fixed cost' : 'ফিক্সড খরচ ওঠাতে কত কাস্টমার লাগবে'}</dt>
          <dd>{Number.isFinite(breakEvenCustomers) ? format(breakEvenCustomers) : '—'}</dd>
        </div>
        <div className="calc__result">
          <dt>{isEn ? 'Runway, cash ÷ this month’s burn' : 'রানওয়ে (ক্যাশ ÷ এই মাসের বার্ন)'}</dt>
          <dd>
            {naiveRunway === null
              ? isEn
                ? 'no burn'
                : 'বার্ন নেই'
              : `${format(naiveRunway)} ${isEn ? 'months' : 'মাস'}`}
          </dd>
        </div>
        <div className="calc__result calc__result--main">
          <dt>{isEn ? 'Runway, modelled' : 'রানওয়ে (মডেলড)'}</dt>
          <dd>
            {survives
              ? isEn
                ? 'cash holds'
                : 'ক্যাশ ফুরোবে না'
              : `${format(runway as number)} ${isEn ? 'months' : 'মাস'}`}
          </dd>
        </div>
      </dl>

      <p className="calc__verdict">{verdict}</p>
    </div>
  )
}
