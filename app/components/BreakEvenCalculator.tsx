'use client'

import { useId, useState } from 'react'
import { calculateBreakEven } from '../lib/break-even.mjs'
import './Calculator.css'
import './BreakEvenCalculator.css'

const defaults = { fixed: '30000', price: '1000', variable: '400', planned: '60' }
export default function BreakEvenCalculator({ locale = 'en' }: { locale?: 'en' | 'bn' }) {
  const id = useId()
  const [inputs, setInputs] = useState(defaults)
  const t = (en: string, bn: string) => locale === 'bn' ? bn : en
  const values = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, v.trim() === '' ? NaN : Number(v)])) as Record<keyof typeof defaults, number>
  const result = calculateBreakEven(values)
  const number = (n: number) => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { maximumFractionDigits: 2 }).format(n)
  const fields = [
    { key: 'fixed', label: t('Monthly fixed costs (BDT)', 'মাসের ফিক্সড খরচ (টাকা)'), hint: t('Costs that stay the same within this sales range.', 'যে পরিমাণ বিক্রি ধরছেন, তার মধ্যে একই থাকে এমন খরচ।') },
    { key: 'price', label: t('Price per unit (BDT)', 'প্রতি ইউনিটের দাম (টাকা)'), hint: t('After discounts, excluding VAT collected for the government.', 'ডিসকাউন্টের পরের দাম। সরকারের জন্য আদায় করা ভ্যাট বাদ দিন।') },
    { key: 'variable', label: t('Variable cost per unit (BDT)', 'প্রতি ইউনিটের ভ্যারিয়েবল খরচ (টাকা)'), hint: t('Costs that rise with each sale. Include fees and expected losses.', 'প্রতি বিক্রির সঙ্গে বাড়ে এমন খরচ। ফি ও সম্ভাব্য ক্ষতিও ধরুন।') },
    { key: 'planned', label: t('Planned units this month', 'মাসে বিক্রির পরিকল্পনা (ইউনিট)'), hint: t('Whole completed sales, using the same unit throughout.', 'শেষ হওয়া বিক্রি পূর্ণ সংখ্যায় দিন। সব ঘরে একই ইউনিট রাখুন।') }
  ] as const
  const invalid = (key: keyof typeof defaults) => !Number.isFinite(values[key]) || values[key] < 0 || (key === 'planned' && !Number.isSafeInteger(values[key]))
  return <section className="calc break-even" aria-label={t('Break-even calculator', 'ব্রেক ইভেন ক্যালকুলেটর')}>
    <p>{t('All money is in taka. Change one number to test a price or cost decision.', 'সব অঙ্ক টাকায় দিন। দাম বা খরচের সিদ্ধান্ত দেখতে একটি ঘর বদলান।')}</p>
    <div className="calc__grid">{fields.map(({ key, label, hint }) => <label className="calc__field" key={key}>
      <span className="calc__label">{label}</span>
      <input className="calc__input" type="number" inputMode={key === 'planned' ? 'numeric' : 'decimal'} min="0" step={key === 'planned' ? '1' : 'any'} value={inputs[key]} aria-invalid={invalid(key)} aria-describedby={`${id}-${key}${invalid(key) ? ` ${id}-error` : ''}`} onChange={e => setInputs(old => ({ ...old, [key]: e.target.value }))} />
      <span className="calc__hint" id={`${id}-${key}`}>{hint}</span>
    </label>)}</div>
    <button className="break-even__reset" type="button" onClick={() => setInputs(defaults)}>{t('Reset example', 'উদাহরণে ফিরুন')}</button>
    <div aria-live="polite" aria-atomic="true">
      {!result ? <p id={`${id}-error`}>{t('Fill every field with a number of zero or more. Planned units must be a whole number. Reduce numbers that are too large to calculate.', 'প্রতি ঘরে শূন্য বা তার চেয়ে বড় সংখ্যা দিন। বিক্রির ইউনিট পূর্ণ সংখ্যা হতে হবে। হিসাব করার জন্য সংখ্যা অতিরিক্ত বড় হলে তা কমিয়ে দিন।')}</p> : <>
        <dl className="calc__results">
          <div className="calc__result"><dt>{t('Contribution per unit (BDT)', 'প্রতি ইউনিটের কন্ট্রিবিউশন (টাকা)')}</dt><dd>{number(result.contribution)}</dd></div>
          {result.units !== null && <>
            <div className="calc__result calc__result--main"><dt>{t('Whole units to cover monthly costs', 'মাসের খরচ তুলতে যত ইউনিট লাগবে')}</dt><dd>{number(result.units)}</dd></div>
            <div className="calc__result"><dt>{t('Sales at that target (BDT)', 'ওই লক্ষ্যে মোট বিক্রি (টাকা)')}</dt><dd>{number(result.sales!)}</dd></div>
          </>}
          <div className="calc__result"><dt>{t('Profit / loss at planned sales (BDT)', 'পরিকল্পনামতো বিক্রিতে লাভ / ক্ষতি (টাকা)')}</dt><dd>{number(result.profit)}</dd></div>
        </dl>
        <p className="calc__verdict">{result.contribution <= 0
          ? t('No positive contribution per sale. More sales cannot cover fixed costs; review the price or cost first. With zero fixed costs, zero sales can still give a zero result.', 'প্রতি বিক্রিতে পজিটিভ কন্ট্রিবিউশন থাকছে না। বেশি বিক্রি করে ফিক্সড খরচ উঠবে না। আগে দাম বা খরচ দেখুন। ফিক্সড খরচ শূন্য হলে বিক্রি শূন্য রেখেও ফল শূন্য আসতে পারে।')
          : t('This covers only the costs entered. Compare the target with what you can sell and deliver. The result is not your bank balance or a tax calculation.', 'শুধু দেওয়া খরচগুলো ধরা হয়েছে। এতটা বিক্রি ও ডেলিভারি করতে পারবেন কি না মিলিয়ে নিন। ফলটা ব্যাংকের ব্যালান্স বা ট্যাক্সের হিসাব নয়।')}</p>
      </>}
    </div>
    <noscript>{t('JavaScript is off. The example is shown; use the worksheet below for your own calculation.', 'জাভাস্ক্রিপ্ট বন্ধ আছে। উদাহরণটি দেখা যাচ্ছে। নিজের হিসাবের জন্য নিচের ছকটি কাজে লাগান।')}</noscript>
  </section>
}
