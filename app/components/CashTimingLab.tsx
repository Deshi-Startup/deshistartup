'use client'

import { useId, useState } from 'react'
import { CASH_DEFAULTS, CASH_SCENARIO, simulateCashTiming } from '../lib/cash-timing.mjs'
import './CashTimingLab.css'

const money = (value: number, isEn: boolean) => new Intl.NumberFormat(isEn ? 'en-BD' : 'bn-BD').format(value)
const getPresets = (isEn: boolean) => [
  { label: isEn ? 'Late customer payment' : 'কাস্টমারের দেরিতে পেমেন্ট', ...CASH_DEFAULTS },
  { label: isEn ? 'Customer pays on day 2' : 'কাস্টমার ২য় দিনে পেমেন্ট করে', ...CASH_DEFAULTS, receiptDay: 2 },
  { label: isEn ? 'Supplier agrees to day 9' : 'সাপ্লায়ার ৯ম দিনে পেমেন্ট নিতে রাজি', ...CASH_DEFAULTS, supplierDay: 9 }
]

export default function CashTimingLab({ locale = 'bn' }: { locale?: 'bn' | 'en' }) {
  const isEn = locale === 'en'
  const presets = getPresets(isEn)
  const id = useId()
  const [opening, setOpening] = useState(String(CASH_DEFAULTS.opening))
  const [receiptDay, setReceiptDay] = useState<number>(CASH_DEFAULTS.receiptDay)
  const [supplierDay, setSupplierDay] = useState<number>(CASH_DEFAULTS.supplierDay)
  const result = simulateCashTiming({ opening: opening.trim() === '' ? NaN : Number(opening), receiptDay, supplierDay })
  const low = result ? Math.min(0, result.lowest) : 0
  const high = result ? Math.max(1, Number(opening), ...result.days.map(day => day.balance)) : 1
  const x = (day: number) => 108 + day / 14 * 350
  const y = (value: number) => 20 + (high - value) / (high - low) * 140
  const points = result ? [{ day: 0, balance: Number(opening) }, ...result.days] : []
  const path = points.map((point, index) => `${index ? 'H' : 'M'}${x(point.day)}${index ? ' V' : ','}${y(point.balance)}`).join(' ')
  const events = [
    { day: receiptDay, label: isEn ? 'Customer pays' : 'কাস্টমারের পেমেন্ট', amount: CASH_SCENARIO.revenue },
    { day: supplierDay, label: isEn ? 'Supplier is paid' : 'সাপ্লায়ারকে পেমেন্ট', amount: -CASH_SCENARIO.supplier },
    { day: CASH_SCENARIO.overheadDay, label: isEn ? 'Other bills are paid' : 'অন্যান্য বিলের পেমেন্ট', amount: -CASH_SCENARIO.overhead }
  ].sort((a, b) => a.day - b.day || b.amount - a.amount)

  return (
    <section className="cash-lab" aria-label={isEn ? "Cash timing simulation" : "ক্যাশ টাইমিং সিমুলেশন"}>
      <p className="cash-lab__intro"><strong>{isEn ? 'Fictional project, all amounts in BDT.' : 'কাল্পনিক একটা প্রজেক্ট, সব হিসাব টাকায়।'}</strong> {isEn ? 'A service is completed on day 1.' : 'প্রথম দিনে কাজ শেষ হয়।'}
        {isEn ? ' Revenue is ' : ' রেভিনিউ '}{money(CASH_SCENARIO.revenue, isEn)}{isEn ? ', supplier cost is ' : ' টাকা, সাপ্লায়ারের খরচ '}{money(CASH_SCENARIO.supplier, isEn)}{isEn ? ', and other costs are ' : ' টাকা, আর অন্যান্য খরচ '}{money(CASH_SCENARIO.overhead, isEn)}{isEn ? '.' : ' টাকা।'}
        {isEn ? ' All costs belong to this project. Other costs are paid on day 5.' : ' সব খরচই এই প্রজেক্টের। অন্যান্য বিলগুলো ৫ম দিনে দেওয়া হয়।'}</p>
      <p>{isEn ? 'Before changing anything, predict: can a project earning BDT 10,000 cover its day-3 bill?' : 'কিছু বদলানোর আগে ভেবে দেখুন: ১০,০০০ টাকা প্রফিট করা একটা প্রজেক্ট কি তার ৩য় দিনের বিল দিতে পারবে?'}</p>
      <noscript><p>{isEn ? 'JavaScript is off. The worked result below remains readable. To compare by hand, move the receipt to day 2 and recalculate each balance.' : 'জাভাস্ক্রিপ্ট বন্ধ আছে। নিচের ফলাফলটি পড়া যাবে। নিজে হিসাব করে দেখতে, পেমেন্ট পাওয়ার দিন ২য় দিনে নিয়ে প্রতিটি ব্যালেন্স নতুন করে হিসাব করুন।'}</p></noscript>
      <div className="cash-lab__presets" aria-label={isEn ? "Compare payment arrangements" : "পেমেন্ট অ্যারেঞ্জমেন্ট তুলনা করুন"}>
        {presets.map(preset => (
          <button key={preset.label} type="button"
            aria-pressed={Number(opening) === preset.opening && receiptDay === preset.receiptDay && supplierDay === preset.supplierDay}
            onClick={() => { setOpening(String(preset.opening)); setReceiptDay(preset.receiptDay); setSupplierDay(preset.supplierDay) }}>
            {preset.label}
          </button>
        ))}
      </div>
      <div className="cash-lab__controls">
        <div>
          <label htmlFor={`${id}-opening`}>{isEn ? 'Opening cash (BDT)' : 'ওপেনিং ক্যাশ (টাকা)'}</label>
          <input id={`${id}-opening`} type="number" inputMode="numeric" min={0} max={1000000} step={1}
            value={opening} onChange={event => setOpening(event.target.value)}
            aria-invalid={!result} aria-describedby={!result ? `${id}-error` : undefined} />
        </div>
        <div>
          <label htmlFor={`${id}-receipt`}>{isEn ? 'Customer pays on' : 'কাস্টমার পেমেন্ট করে'}</label>
          <select id={`${id}-receipt`} value={receiptDay} onChange={event => setReceiptDay(Number(event.target.value))}>
            {Array.from({ length: 14 }, (_, n) => <option value={n + 1} key={n}>{isEn ? 'Day' : 'দিন'} {isEn ? n + 1 : new Intl.NumberFormat('bn-BD').format(n + 1)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-supplier`}>{isEn ? 'Supplier is paid on' : 'সাপ্লায়ার পেমেন্ট পায়'}</label>
          <select id={`${id}-supplier`} value={supplierDay} onChange={event => setSupplierDay(Number(event.target.value))}>
            {Array.from({ length: 14 }, (_, n) => <option value={n + 1} key={n}>{isEn ? 'Day' : 'দিন'} {isEn ? n + 1 : new Intl.NumberFormat('bn-BD').format(n + 1)}</option>)}
          </select>
        </div>
      </div>
      <div role="status">
        {!result ? <p id={`${id}-error`}>{isEn ? 'Enter opening cash as a whole number from 0 to 1,000,000 BDT to see the result.' : 'ফলাফল দেখতে ওপেনিং ক্যাশ হিসেবে ০ থেকে ১,০০০,০০০ টাকার মধ্যে একটা পূর্ণসংখ্যা দিন।'}</p> : (
          <p className="cash-lab__verdict">
            {result.shortfall > 0 && result.firstShortfallDay !== null
              ? (isEn
                  ? `The first shortfall is on day ${result.firstShortfallDay}. An extra BDT ${money(result.shortfall, isEn)} available from the start would cover every listed payment on these dates.`
                  : `প্রথম শর্টফল ${new Intl.NumberFormat('bn-BD').format(result.firstShortfallDay)}তম দিনে। শুরু থেকে অতিরিক্ত ${money(result.shortfall, isEn)} টাকা থাকলে এই তারিখে উল্লেখিত সব পেমেন্ট কভার করা যেত।`)
              : (isEn
                  ? `The listed payments are covered on these dates. The lowest projected balance is BDT ${money(result.lowest, isEn)}${result.lowest === 0 ? ', leaving no cushion at that point' : ''}.`
                  : `এই তারিখে উল্লেখিত পেমেন্টগুলো কভার করা সম্ভব হবে। সর্বনিম্ন সম্ভাব্য ব্যালেন্স ${money(result.lowest, isEn)} টাকা${result.lowest === 0 ? ', যার ফলে হাতে অতিরিক্ত কোনো ক্যাশ থাকছে না' : ''}।`)}
          </p>
        )}
      </div>
      {result && <>
        <dl className="cash-lab__results">
          <div><dt>{isEn ? 'Project profit' : 'প্রজেক্টের প্রফিট'}</dt><dd>{isEn ? 'BDT ' : ''}{money(result.profit, isEn)}{isEn ? '' : ' টাকা'}</dd></div>
          <div><dt>{isEn ? 'Additional cash needed' : 'অতিরিক্ত ক্যাশ প্রয়োজন'}</dt><dd>{isEn ? 'BDT ' : ''}{money(result.shortfall, isEn)}{isEn ? '' : ' টাকা'}</dd></div>
          <div><dt>{isEn ? 'Projected day-14 balance' : '১৪তম দিনে সম্ভাব্য ব্যালেন্স'}</dt><dd>{isEn ? 'BDT ' : ''}{money(result.ending, isEn)}{isEn ? '' : ' টাকা'}</dd></div>
        </dl>
        <p><strong>{isEn ? 'Profit stays BDT 10,000:' : 'প্রফিট ১০,০০০ টাকাই থাকছে:'}</strong> {isEn ? '45,000 − 30,000 − 5,000' : '৪৫,০০০ − ৩০,০০০ − ৫,০০০'}{isEn ? '. ' : '। '}{isEn ? "Moving payment dates changes cash timing, not this project's revenue or costs." : 'পেমেন্টের তারিখ পরিবর্তন করলে শুধু ক্যাশ টাইমিং পরিবর্তন হয়, প্রজেক্টের রেভিনিউ বা খরচ নয়।'}</p>
        <figure className="cash-lab__chart">
          <svg viewBox="0 0 480 195" role="img" aria-label={isEn ? "Projected cash across 14 days" : "১৪ দিনে সম্ভাব্য ক্যাশ"} aria-describedby={`${id}-chart-desc`}>
            <desc id={`${id}-chart-desc`}>{isEn ? `Amounts in BDT. Lowest balance ${money(result.lowest, isEn)}. Exact movements are in the table below. Below zero means uncovered obligations.` : `এমাউন্ট টাকায়। সর্বনিম্ন ব্যালেন্স ${money(result.lowest, isEn)}। প্রতিদিনের হিসাব নিচের টেবিলে দেওয়া আছে। শূন্যের নিচে মানে যে বিলগুলো দেওয়ার মতো ক্যাশ হাতে নেই।`}</desc>
            {low < 0 && <rect x="108" y={y(0)} width="350" height={160 - y(0)} className="cash-lab__shortfall-area" />}
            <line x1="108" x2="458" y1={y(0)} y2={y(0)} className="cash-lab__zero" />
            <text x="464" y={y(0) + 4}>{isEn ? '0' : '০'}</text>
            <text x="100" y={y(high) + 4} textAnchor="end">{money(high, isEn)}</text>
            {low < 0 && <text x="100" y={y(low) + 4} textAnchor="end">{money(low, isEn)}</text>}
            <text x="108" y="186">{isEn ? 'Start' : 'শুরু'}</text><text x="458" y="186" textAnchor="end">{isEn ? 'Day 14' : 'দিন ১৪'}</text>
            <path d={path} className="cash-lab__path" />
            {points.filter(point => point.day === 0 || point.day === 14 || (point.day > 0 && (result.days[point.day - 1].received || result.days[point.day - 1].paid))).map(point =>
              <circle key={point.day} cx={x(point.day)} cy={y(point.balance)} r="3" className={point.balance < 0 ? 'cash-lab__negative' : 'cash-lab__positive'} />)}
          </svg>
          <ol className="cash-lab__events">
            {events.map(event => <li key={event.label}>
              <span>{isEn ? 'Day ' : 'দিন '}{money(event.day, isEn)}</span>
              <strong>{event.label}</strong>
              <span className={event.amount > 0 ? 'cash-lab__in' : ''}>{event.amount > 0 ? '+' : '−'}{money(Math.abs(event.amount), isEn)} {isEn ? 'BDT' : 'টাকা'}</span>
            </li>)}
          </ol>
          <figcaption>{isEn ? 'The line shows the balance if all listed payments were made. Below zero is a cash shortfall, not an assumed overdraft.' : 'উল্লেখিত সব পেমেন্ট করা হলে ব্যালেন্স কেমন হবে তা লাইন দিয়ে দেখানো হয়েছে। শূন্যের নিচে মানে ক্যাশ শর্টফল, এটি কোনো অনুমোদিত ওভারড্রাফট নয়।'}</figcaption>
        </figure>
        <details className="cash-lab__table">
          <summary>{isEn ? 'See each balance' : 'প্রতিটি ব্যালেন্সের হিসাব দেখুন'}</summary>
          <table>
            <caption>{isEn ? 'Cash movements (BDT); days without movements are omitted.' : 'ক্যাশ মুভমেন্ট (টাকা) – লেনদেন ছাড়া দিনগুলো বাদ দেওয়া হয়েছে।'}</caption>
            <thead><tr><th scope="col">{isEn ? 'Day' : 'দিন'}</th><th scope="col">{isEn ? 'In' : 'ক্যাশ এল'}</th><th scope="col">{isEn ? 'Out' : 'ক্যাশ গেল'}</th><th scope="col">{isEn ? 'Balance' : 'ব্যালেন্স'}</th></tr></thead>
            <tbody>
              <tr><th scope="row">{isEn ? 'Start' : 'শুরু'}</th><td>–</td><td>–</td><td>{money(Number(opening), isEn)}</td></tr>
              {result.days.filter(day => day.received || day.paid || day.day === 14).map(day => (
                <tr key={day.day}><th scope="row">{isEn ? day.day : new Intl.NumberFormat('bn-BD').format(day.day)}</th><td>{money(day.received, isEn)}</td><td>{money(day.paid, isEn)}</td><td>{money(day.balance, isEn)}</td></tr>
              ))}
            </tbody>
          </table>
        <p>{isEn ? 'Each balance = previous balance + cash received − payments due. Day 14 includes every listed receipt and bill; it does not tell you whether earlier bills could be paid.' : 'প্রতিটি ব্যালেন্স = আগের ব্যালেন্স + পাওয়া ক্যাশ − যে পেমেন্টগুলো করতে হবে। ১৪তম দিনে উল্লেখিত সব রিসিট আর বিল অন্তর্ভুক্ত আছে – তবে আগের বিলগুলো সময়ে শোধ করা সম্ভব ছিল কি না, তা এখান থেকে জানা যায় না।'}</p>
        </details>
      </>}
      <details className="cash-lab__assumptions">
        <summary>{isEn ? 'Read the assumptions before applying this lesson' : 'বাস্তবে প্রয়োগ করার আগে শর্তগুলো জেনে নিন'}</summary>
        <p>{isEn ? 'This example assumes the full customer payment arrives on the selected day, before any same-day bills. Check clearing times in real life. It excludes taxes, interest, refunds, bad debts, and other business activity.' : 'এই উদাহরণে ধরে নেওয়া হয়েছে পুরো কাস্টমার পেমেন্ট নির্ধারিত দিনে, একই দিনের অন্য কোনো বিলের আগে চলে আসবে। বাস্তবে টাকা জমা হতে কত দিন লাগে (ক্লিয়ারিং টাইম) তা যাচাই করে নেবেন। এতে ট্যাক্স, সুদ, রিফান্ড বা অন্যান্য ব্যবসার খরচ ধরা হয়নি।'}</p>
        <p>{isEn ? 'Moving the supplier date assumes the supplier agrees beforehand. It is not permission to miss a due date. Additional cash needed describes the gap, not a recommendation to borrow.' : 'সাপ্লায়ারের পেমেন্ট পেছানোর মানে হলো সাপ্লায়ার আগে থেকেই এতে রাজি। এটি ডিউ ডেট পার করার কোনো লাইসেন্স নয়। "অতিরিক্ত ক্যাশ প্রয়োজন" দিয়ে স্রেফ ঘাটতির পরিমাণ বোঝানো হয়েছে, এটি লোন নেওয়ার কোনো সুপারিশ নয়।'}</p>
      </details>
    </section>
  )
}
