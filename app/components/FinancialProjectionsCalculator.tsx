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
  step = 1,
  min = 0,
  max
}: {
  label: string
  value: number
  onChange: (n: number) => void
  hint?: string
  step?: number
  min?: number
  max?: number
}) {
  const update = (raw: string) => {
    const parsed = raw === '' ? min : Number(raw)
    const finite = Number.isFinite(parsed) ? parsed : min
    onChange(Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min, finite)))
  }

  return (
    <label className="calc__field">
      <span className="calc__label">{label}</span>
      <input
        className="calc__input"
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => update(e.target.value)}
      />
      {hint && <span className="calc__hint">{hint}</span>}
    </label>
  )
}

const SIMULATION_MONTHS = 120

interface ProjectionInputs {
  customers: number
  added: number
  churn: number
  price: number
  variable: number
  fixed: number
  cash: number
}

interface ProjectionResult {
  contribution: number
  firstMonthBurn: number
  cashOutMonth: number | null
  breakEvenMonth: number | null
  breakEvenLostMonth: number | null
  closingCustomers: number
}

export function simulateProjection(inputs: ProjectionInputs): ProjectionResult {
  const customers = Math.max(0, Number.isFinite(inputs.customers) ? inputs.customers : 0)
  const added = Math.max(0, Number.isFinite(inputs.added) ? inputs.added : 0)
  const churn = Math.min(100, Math.max(0, Number.isFinite(inputs.churn) ? inputs.churn : 0))
  const price = Math.max(0, Number.isFinite(inputs.price) ? inputs.price : 0)
  const variable = Math.max(0, Number.isFinite(inputs.variable) ? inputs.variable : 0)
  const fixed = Math.max(0, Number.isFinite(inputs.fixed) ? inputs.fixed : 0)
  const cash = Math.max(0, Number.isFinite(inputs.cash) ? inputs.cash : 0)
  const contribution = price - variable

  let closingCustomers = customers
  let balance = cash
  let cashOutMonth: number | null = null
  let breakEvenMonth: number | null = null
  let breakEvenLostMonth: number | null = null
  let firstMonthBurn = NaN

  for (let month = 1; month <= SIMULATION_MONTHS; month += 1) {
    closingCustomers = Math.max(
      0,
      Math.round(closingCustomers - closingCustomers * (churn / 100) + added)
    )
    const monthContribution = closingCustomers * contribution
    const monthBurn = fixed - monthContribution
    if (month === 1) firstMonthBurn = monthBurn
    balance -= monthBurn
    if (breakEvenMonth === null && monthContribution >= fixed) {
      breakEvenMonth = month
    } else if (
      breakEvenMonth !== null &&
      breakEvenLostMonth === null &&
      monthContribution < fixed
    ) {
      breakEvenLostMonth = month
    }
    if (cashOutMonth === null && balance < 0) cashOutMonth = month
  }

  return {
    contribution,
    firstMonthBurn,
    cashOutMonth,
    breakEvenMonth,
    breakEvenLostMonth,
    closingCustomers
  }
}

interface VerdictInputs {
  isEn: boolean
  contribution: number
  fixed: number
  cash: number
  cashOutMonth: number | null
  breakEvenMonth: number | null
  breakEvenLostMonth: number | null
  format: (value: number) => string
}

export function projectionVerdict({
  isEn,
  contribution,
  fixed,
  cash,
  cashOutMonth,
  breakEvenMonth,
  breakEvenLostMonth,
  format
}: VerdictInputs): string {
  if (!Number.isFinite(contribution) || contribution < 0) {
    return isEn
      ? 'Each customer costs more to serve than they pay. No amount of growth fixes this. Change the price or the cost first.'
      : 'একজন কাস্টমার থেকে যত আয় হয়, তাঁকে সেবা দিতে সেই আয়ের চেয়ে বেশি খরচ হয়। কাস্টমার বাড়িয়ে এই সমস্যার সমাধান হবে না। আগে দাম বা খরচ ঠিক করুন।'
  }

  if (contribution === 0 && fixed > 0) {
    return isEn
      ? 'Each customer contributes nothing toward fixed cost, so no customer count reaches break-even. Raise the price or lower variable cost first.'
      : 'প্রতি কাস্টমার থেকে ফিক্সড খরচের জন্য কোনো টাকা থাকছে না, তাই কাস্টমার বাড়ালেও ব্রেক-ইভেন হবে না। আগে দাম বাড়ান বা ভ্যারিয়েবল খরচ কমান।'
  }

  if (cash <= 0) {
    if (breakEvenMonth === 1 && breakEvenLostMonth === null) {
      return isEn
        ? 'You start with no cash, but monthly contribution covers fixed cost from month 1. Confirm when customers actually pay before treating that as workable.'
        : 'শুরুতে ব্যাংকে কোনো ক্যাশ নেই, তবে ১ নম্বর মাস থেকেই মাসিক কন্ট্রিবিউশন ফিক্সড খরচ তুলছে। এটাকে কার্যকর ধরে নেওয়ার আগে কাস্টমারের টাকা কখন হাতে আসে, তা মিলিয়ে দেখুন।'
    }
    if (breakEvenMonth === 1 && breakEvenLostMonth !== null && cashOutMonth !== null) {
      return isEn
        ? `You start with no cash and cover fixed cost in month 1, but churn pulls contribution back below fixed cost in month ${format(breakEvenLostMonth)}. Cash runs out in month ${format(cashOutMonth)}, so the early break-even does not hold.`
        : `শুরুতে ব্যাংকে কোনো ক্যাশ না থাকলেও ১ নম্বর মাসে ফিক্সড খরচ উঠে আসে। ${format(breakEvenLostMonth)} নম্বর মাসে চার্নের কারণে কন্ট্রিবিউশন আবার ফিক্সড খরচের নিচে নেমে যায় এবং ${format(cashOutMonth)} নম্বর মাসে ক্যাশ ফুরিয়ে যায়। তাই শুরুর ব্রেক-ইভেন ধরে রাখা যায় না।`
    }
    if (breakEvenMonth === 1 && breakEvenLostMonth !== null) {
      return isEn
        ? `You start with no cash and cover fixed cost in month 1, but churn pulls contribution back below fixed cost in month ${format(breakEvenLostMonth)}. Cash stays above zero for ${SIMULATION_MONTHS} months, but the early break-even does not hold.`
        : `শুরুতে ব্যাংকে কোনো ক্যাশ না থাকলেও ১ নম্বর মাসে ফিক্সড খরচ উঠে আসে। ${format(breakEvenLostMonth)} নম্বর মাসে চার্নের কারণে কন্ট্রিবিউশন আবার ফিক্সড খরচের নিচে নেমে যায়। ${format(SIMULATION_MONTHS)} মাস পর্যন্ত ক্যাশ শূন্যের ওপরে থাকলেও শুরুর ব্রেক-ইভেন ধরে রাখা যায় না।`
    }
    if (breakEvenMonth !== null) {
      return isEn
        ? `You start with no cash. Monthly break-even arrives in month ${format(breakEvenMonth)}, but the model cannot fund the losses before then.`
        : `শুরুতে ব্যাংকে কোনো ক্যাশ নেই। মাসিক ব্রেক-ইভেন আসবে ${format(breakEvenMonth)} নম্বর মাসে, কিন্তু তার আগের লোকসান চালানোর টাকা এই মডেলে নেই।`
    }
    return isEn
      ? `You start with no cash, and monthly break-even does not arrive within ${SIMULATION_MONTHS} months. Add opening cash or funding before relying on this plan.`
      : `শুরুতে ব্যাংকে কোনো ক্যাশ নেই, আর ${format(SIMULATION_MONTHS)} মাসের মধ্যেও মাসিক ব্রেক-ইভেন আসবে না। এই প্ল্যানের ওপর ভরসা করার আগে শুরুর ক্যাশ বা ফান্ডিং যোগ করুন।`
  }

  if (cashOutMonth !== null) {
    if (breakEvenMonth !== null) {
      if (breakEvenMonth < cashOutMonth && breakEvenLostMonth !== null) {
        return isEn
          ? `You reach monthly break-even in month ${format(breakEvenMonth)}, but churn pulls contribution back below fixed cost in month ${format(breakEvenLostMonth)}. Cash runs out in month ${format(cashOutMonth)}, so the early break-even does not hold.`
          : `${format(breakEvenMonth)} নম্বর মাসে মাসিক ব্রেক-ইভেন হলেও ${format(breakEvenLostMonth)} নম্বর মাসে চার্নের কারণে কন্ট্রিবিউশন আবার ফিক্সড খরচের নিচে নেমে যায়। ${format(cashOutMonth)} নম্বর মাসে ক্যাশ ফুরিয়ে যাবে। তাই শুরুর ব্রেক-ইভেন ধরে রাখা যায় না।`
      }
      if (breakEvenMonth === cashOutMonth) {
        return isEn
          ? `Monthly break-even arrives in month ${format(breakEvenMonth)}, the same month the cash runs out. It comes too late to protect the cash balance.`
          : `${format(breakEvenMonth)} নম্বর মাসেই মাসিক ব্রেক-ইভেন হবে এবং ক্যাশও ফুরিয়ে যাবে। ক্যাশ ব্যালেন্স বাঁচানোর জন্য এই ব্রেক-ইভেন অনেক দেরিতে আসে।`
      }
      return isEn
        ? `Cash runs out in month ${format(cashOutMonth)}. Monthly break-even arrives in month ${format(breakEvenMonth)}, too late to fund the gap. Raise money, raise the price, cut fixed cost, or add customers faster.`
        : `${format(cashOutMonth)} নম্বর মাসে ক্যাশ ফুরিয়ে যাবে। মাসিক ব্রেক-ইভেন আসবে ${format(breakEvenMonth)} নম্বর মাসে, তাই মাঝের ঘাটতি চালানোর টাকা থাকবে না। ফান্ড রেইজ করুন, দাম বাড়ান, ফিক্সড খরচ কমান, অথবা আরও দ্রুত কাস্টমার আনুন।`
    }
    return isEn
      ? `Cash runs out in month ${format(cashOutMonth)}, and the model does not reach monthly break-even within ${SIMULATION_MONTHS} months. Raise money, raise the price, cut fixed cost, or add customers faster.`
      : `${format(cashOutMonth)} নম্বর মাসে ক্যাশ ফুরিয়ে যাবে, আর ${format(SIMULATION_MONTHS)} মাসের মধ্যেও মাসিক ব্রেক-ইভেন আসবে না। ফান্ড রেইজ করুন, দাম বাড়ান, ফিক্সড খরচ কমান, অথবা আরও দ্রুত কাস্টমার আনুন।`
  }

  if (breakEvenMonth !== null) {
    if (breakEvenLostMonth !== null) {
      return isEn
        ? `You reach monthly break-even in month ${format(breakEvenMonth)}, but lose it in month ${format(breakEvenLostMonth)} as churn pulls contribution below fixed cost. Cash stays above zero for ${SIMULATION_MONTHS} months, but the break-even is not sustained.`
        : `${format(breakEvenMonth)} নম্বর মাসে মাসিক ব্রেক-ইভেনে পৌঁছালেও ${format(breakEvenLostMonth)} নম্বর মাসে চার্নের কারণে কন্ট্রিবিউশন ফিক্সড খরচের নিচে নেমে যায়। ${format(SIMULATION_MONTHS)} মাস পর্যন্ত ক্যাশ শূন্যের ওপরে থাকলেও ব্রেক-ইভেন ধরে রাখা যায় না।`
    }
    return isEn
      ? `You reach monthly break-even in month ${format(breakEvenMonth)}, before the cash runs out. Keep watching churn because it decides whether that month arrives.`
      : `ক্যাশ ফুরানোর আগেই ${format(breakEvenMonth)} নম্বর মাসে মাসিক ব্রেক-ইভেনে পৌঁছাবেন। চার্নের দিকে নজর রাখুন, কারণ ওই মাসটি আসবে কি না তা চার্নের ওপর নির্ভর করে।`
  }

  return isEn
    ? `Cash remains above zero for ${SIMULATION_MONTHS} months, but the model does not reach monthly break-even in that period. Extend the model before making a longer-term claim.`
    : `${format(SIMULATION_MONTHS)} মাস পর্যন্ত ক্যাশ শূন্যের ওপরে থাকে, কিন্তু এই সময়ের মধ্যে মাসিক ব্রেক-ইভেন আসে না। এর চেয়ে দীর্ঘ সময় নিয়ে কোনো সিদ্ধান্ত দেওয়ার আগে মডেলটি আরও সামনে পর্যন্ত চালান।`
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
 * Every reader-facing string has an English and Bangla version. The two guide
 * pages import this client island locally so unrelated MDX routes do not ship
 * its JavaScript.
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

  const {
    contribution,
    firstMonthBurn,
    cashOutMonth,
    breakEvenMonth,
    breakEvenLostMonth
  } = simulateProjection({
    customers,
    added,
    churn,
    price,
    variable,
    fixed,
    cash
  })
  const breakEvenCustomers =
    contribution > 0 ? Math.ceil(fixed / contribution) : contribution === 0 && fixed === 0 ? 0 : NaN
  const modelledRunway = cashOutMonth === null ? null : Math.max(0, cashOutMonth - 1)
  // The page divides cash by the first month's burn, so the widget must too,
  // or the reader sees one number in the prose and a different one here.
  const naiveRunway =
    Number.isFinite(firstMonthBurn) && firstMonthBurn > 0 ? Math.round(cash / firstMonthBurn) : null

  const verdict = projectionVerdict({
    isEn,
    contribution,
    fixed,
    cash,
    cashOutMonth,
    breakEvenMonth,
    breakEvenLostMonth,
    format
  })

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
          max={100}
        />
        <Field
          label={isEn ? 'Price per customer (BDT)' : 'কাস্টমার-প্রতি দাম (টাকা)'}
          value={price}
          onChange={setPrice}
        />
        <Field
          label={
            isEn
              ? 'Variable cost per customer (BDT)'
              : 'কাস্টমার-প্রতি ভ্যারিয়েবল খরচ (টাকা)'
          }
          value={variable}
          onChange={setVariable}
          hint={isEn ? 'Hosting, SMS, gateway fees' : 'হোস্টিং, এসএমএস, গেটওয়ে ফি'}
        />
        <Field
          label={isEn ? 'Fixed cost per month (BDT)' : 'মাসে ফিক্সড খরচ (টাকা)'}
          value={fixed}
          onChange={setFixed}
          hint={isEn ? 'Payroll, bonus set-aside, rent' : 'বেতন, বোনাস ফান্ড, ভাড়া'}
        />
        <Field
          label={isEn ? 'Cash in the bank (BDT)' : 'ব্যাংকে ক্যাশ (টাকা)'}
          value={cash}
          onChange={setCash}
        />
      </div>

      <dl className="calc__results">
        <div className="calc__result">
          <dt>
            {isEn ? 'Contribution per customer (BDT)' : 'কাস্টমার-প্রতি কন্ট্রিবিউশন (টাকা)'}
          </dt>
          <dd>{Number.isFinite(contribution) ? format(contribution) : isEn ? 'not available' : 'পাওয়া যায়নি'}</dd>
        </div>
        <div className="calc__result">
          <dt>{isEn ? 'Customers to cover fixed cost' : 'ফিক্সড খরচ ওঠাতে কত কাস্টমার লাগবে'}</dt>
          <dd>
            {Number.isFinite(breakEvenCustomers)
              ? format(breakEvenCustomers)
              : isEn
                ? 'not available'
                : 'পাওয়া যায়নি'}
          </dd>
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
            {cashOutMonth === null
              ? isEn
                ? `${SIMULATION_MONTHS}+ months`
                : `${format(SIMULATION_MONTHS)}+ মাস`
              : `${format(modelledRunway as number)} ${isEn ? 'months' : 'মাস'}`}
          </dd>
        </div>
      </dl>

      <p className="calc__verdict" aria-live="polite" aria-atomic="true">
        {verdict}
      </p>
    </div>
  )
}
