'use client'

import { useId, useState } from 'react'
import { calculateWorkingCapital } from '../lib/working-capital.mjs'
import './Calculator.css'
import './WorkingCapitalCalculator.css'

const defaults = { creditSales: '600000', cogs: '360000', creditPurchases: '360000', inventoryDays: '30', collectionDays: '20', paymentDays: '15' }
type Key = keyof typeof defaults

export default function WorkingCapitalCalculator({ locale = 'en' }: { locale?: 'en' | 'bn' }) {
  const en = locale === 'en'
  const t = (english: string, bangla: string) => en ? english : bangla
  const id = useId()
  const [inputs, setInputs] = useState(defaults)
  const number = new Intl.NumberFormat(locale === 'en' ? 'en-IN' : 'bn-BD', { maximumFractionDigits: 2 }).format
  const values = Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, value.trim() === '' ? NaN : Number(value)])) as Record<Key, number>
  const result = calculateWorkingCapital(values)
  const fields: { key: Key; label: string; hint: string; base?: Key }[] = [
    { key: 'creditSales', label: t('Monthly credit sales (BDT)', 'মাসে বাকিতে বিক্রি (টাকা)'), hint: t('Sales made on credit. Use their invoice totals, not payments received this month.', 'যে বিক্রির টাকা পরে আসবে। এই মাসে হাতে পাওয়া টাকা নয়।') },
    { key: 'cogs', label: t('Monthly cost of goods sold (BDT)', 'মাসে বিক্রি হওয়া পণ্যের খরচ (টাকা)'), hint: t('Cost of the goods sold, including cash sales. Not their selling price.', 'নগদে বিক্রি হওয়া পণ্যও ধরুন। বিক্রির দাম নয়, পণ্যের খরচ দিন।') },
    { key: 'creditPurchases', label: t('Monthly credit purchases (BDT)', 'মাসে বাকিতে কেনাকাটা (টাকা)'), hint: t('What you bought from suppliers to pay for later. Leave out cash purchases; do not just copy the cost of goods sold.', 'সাপ্লায়ারের কাছ থেকে বাকিতে কেনা। নগদে কেনা বাদ দিন, আর বিক্রি হওয়া পণ্যের খরচের অঙ্ক কপি করে বসাবেন না।') },
    { key: 'inventoryDays', label: t('Inventory days', 'স্টক বিক্রি হতে যত দিন'), hint: t('Average stock at cost ÷ (monthly cost of goods sold ÷ 30).', 'গড় স্টকের খরচ ÷ (মাসে বিক্রি হওয়া পণ্যের খরচ ÷ ৩০)।'), base: 'cogs' },
    { key: 'collectionDays', label: t('Customer collection days', 'কাস্টমারের টাকা পেতে যত দিন'), hint: t('Average money customers owe you ÷ (monthly credit sales ÷ 30).', 'কাস্টমারের কাছে গড় পাওনা ÷ (মাসে বাকিতে বিক্রি ÷ ৩০)।'), base: 'creditSales' },
    { key: 'paymentDays', label: t('Supplier payment days', 'সাপ্লায়ারকে টাকা দিতে যত দিন'), hint: t('Average unpaid supplier bills ÷ (monthly credit purchases ÷ 30).', 'সাপ্লায়ারের কাছে গড় দেনা ÷ (মাসে বাকিতে কেনাকাটা ÷ ৩০)।'), base: 'creditPurchases' }
  ]
  const invalid = (key: Key, base?: Key) => !Number.isFinite(values[key]) || values[key] < 0 || (base !== undefined && values[base] === 0 && values[key] !== 0)
  const rows = result ? [
    [t('Estimated stock at cost (BDT)', 'আনুমানিক স্টক, খরচের হিসাবে (টাকা)'), result.inventory],
    [t('Estimated money customers owe you (BDT)', 'কাস্টমারের কাছে আনুমানিক পাওনা (টাকা)'), result.receivables],
    [t('Less: estimated unpaid supplier bills (BDT)', 'বাদ: সাপ্লায়ারের কাছে আনুমানিক দেনা (টাকা)'), result.payables],
    [t('Estimated cash tied up (BDT)', 'এই হিসাবে আটকে থাকা টাকা'), result.tiedUp],
    [t('Cash conversion cycle (days)', 'ক্যাশ কনভার্সন সাইকেল (দিন)'), result.cycle]
  ] as const : []

  return <section className="calc working-capital" aria-label={t("Working capital calculator", "ওয়ার্কিং ক্যাপিটাল ক্যালকুলেটর")}>
    <p>{t('Use a 30-day month and exclude VAT. Change one input to try a scenario.', '৩০ দিনের মাস ধরে ভ্যাট ছাড়া অঙ্ক দিন। একটি ঘর বদলে ফলটা মিলিয়ে দেখুন।')}</p>
    <div className="calc__grid">
      {fields.map(({ key, label, hint, base }) => <label key={key} className="calc__field">
        <span className="calc__label">{label}</span>
        <input className="calc__input" type="number" inputMode="decimal" min={0} step="any"
          value={inputs[key]} aria-invalid={invalid(key, base)}
          aria-describedby={`${id}-${key}-hint${invalid(key, base) ? ` ${id}-error` : ''}`}
          onChange={event => setInputs(current => ({ ...current, [key]: event.target.value }))} />
        <span className="calc__hint" id={`${id}-${key}-hint`}>{hint}</span>
      </label>)}
    </div>
    <button type="button" className="working-capital__reset" onClick={() => setInputs(defaults)}>{t('Reset example', 'উদাহরণে ফিরুন')}</button>
    <div aria-live="polite" aria-atomic="true">
      {!result ? <p className="calc__verdict" id={`${id}-error`}>{t('Enter zero or a positive number in every field. If a monthly amount is zero, set its matching days to zero. If the numbers are too large to calculate, reduce them. No estimate is shown until the inputs are valid.', 'প্রতিটি ঘরে শূন্য বা তার চেয়ে বড় সংখ্যা দিন। মাসের অঙ্ক শূন্য হলে তার সঙ্গে মেলা দিনের ঘরেও শূন্য দিন। সংখ্যা এত বড় হলে যে হিসাব করা যাচ্ছে না, তা কমিয়ে দিন। ঘরগুলো ঠিক না হওয়া পর্যন্ত ফল দেখানো হবে না।')}</p> : <>
        <dl className="calc__results">
          {rows.map(([label, value], index) => <div key={label} className={`calc__result${index === 3 ? ' calc__result--main' : ''}`}>
            <dt>{label}</dt><dd>{number(value)}</dd>
          </div>)}
        </dl>
        <p className="calc__verdict">{result.tiedUp < 0
          ? t('In this estimate, supplier bills are larger than the stock value plus money customers owe you. This is not spare cash: supplier bills still need paying.', 'এই হিসাবে স্টক ও পাওনার চেয়ে সাপ্লায়ারের দেনা বেশি। টাকাটা বাড়তি ক্যাশ নয়, সাপ্লায়ারের বিল তো দিতেই হবে।')
          : result.tiedUp === 0
            ? t('In this estimate, subtracting supplier bills leaves zero. This does not mean the business needs no cash.', 'এই হিসাবে দেনা বাদ দিয়ে শূন্য থাকে। তার মানে ব্যবসা চালাতে আর ক্যাশ লাগবে না, এমন নয়।')
            : t('This estimates stock and unpaid invoices, less supplier credit. It is not your bank balance or all the money your business needs.', 'স্টক ও কাস্টমারের পাওনা থেকে সাপ্লায়ারের দেনা বাদ দেওয়া হয়েছে। ব্যাংকে কত টাকা আছে বা মোট কত ফান্ডিং লাগবে, এটা সেই হিসাব নয়।')}</p>
        {result.cycle < 0 && <p>{t('The cycle is negative: this model puts customer payments before supplier payments. This does not guarantee a negative taka balance or cash available to spend.', 'সাইকেল ঋণাত্মক। এই হিসাবে সাপ্লায়ারকে দেওয়ার আগেই বিক্রির টাকা আসে। তবে টাকার ফলও ঋণাত্মক হবে বা হাতে খরচ করার ক্যাশ থাকবে, এমন নিশ্চয়তা নেই।')}</p>}
        {(values.creditSales === 0 || values.cogs === 0 || values.creditPurchases === 0) && <p>{t('A zero monthly amount counts as zero money in that part of the calculation. Old stock, unpaid invoices and existing supplier bills still need a separate cash schedule.', 'মাসের অঙ্ক শূন্য হলে এই হিসাবে সেই খাতে কোনো টাকা ধরা হয় না। পুরোনো স্টক, বকেয়া ইনভয়েস ও সাপ্লায়ারের বিলের জন্য আলাদা করে টাকা আসা-যাওয়ার তারিখ লিখে রাখুন।')}</p>}
      </>}
    </div>
    <noscript>{t('JavaScript is off. The worked example is shown; use the formulas below to calculate your own numbers.', 'জাভাস্ক্রিপ্ট বন্ধ আছে। এখানে উদাহরণের হিসাব দেখা যাচ্ছে। নিজের অঙ্কের জন্য নিচের সূত্রগুলো কাজে লাগান।')}</noscript>
  </section>
}
