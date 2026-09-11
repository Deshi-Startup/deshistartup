import './ConceptIllustration.css'

type Concept = 'dilution' | 'runway' | 'vesting' | 'break-even' | 'funnel' | 'tam-sam-som'

/** Static geometry illustrating the examples already taught in the dictionary. */
export default function ConceptIllustration({ concept, locale = 'bn' }: { concept: Concept; locale?: 'bn' | 'en' }) {
  const en = locale === 'en'
  const number = new Intl.NumberFormat(en ? 'en-BD' : 'bn-BD').format
  if (concept === 'funnel') {
    const stages = [
      { label: en ? 'See the ad' : 'অ্যাড দেখলেন', people: 1000 },
      { label: en ? 'Visit the website' : 'ওয়েবসাইটে এলেন', people: 100 },
      { label: en ? 'Add to cart' : 'কার্টে পণ্য নিলেন', people: 10 },
      { label: en ? 'Pay' : 'টাকা দিয়ে কিনলেন', people: 2 },
    ]
    return <figure className="concept-figure concept-funnel">
      <table>
        <caption>{en ? 'From 1,000 viewers to 2 buyers' : '১,০০০ দর্শক থেকে ২ জন ক্রেতা'}</caption>
        <thead><tr><th scope="col">{en ? 'Step' : 'ধাপ'}</th><th scope="col">{en ? 'People' : 'মানুষের সংখ্যা'}</th></tr></thead>
        <tbody>{stages.map(stage => <tr key={stage.people}>
          <th scope="row">{stage.label}</th>
          <td><span>{number(stage.people)}</span><span className="concept-funnel__track" aria-hidden="true"><span style={{ width: `${stage.people / 1000 * 100}%` }} /></span></td>
        </tr>)}</tbody>
      </table>
      <figcaption>{en ? 'Illustrative example: 2 ÷ 1,000 × 100 = 0.2% buy. Every bar uses the same scale. The counts show where people leave, not why.' : 'এই উদাহরণে ২ ÷ ১,০০০ × ১০০ = ০.২% মানুষ কেনেন। সব বারে একই স্কেল রাখা হয়েছে। কোন ধাপে মানুষ চলে যাচ্ছেন তা দেখা যায়, তবে কেন যাচ্ছেন তা জানতে আরও খোঁজ নিতে হবে।'}</figcaption>
    </figure>
  }
  if (concept === 'tam-sam-som') return <figure className="concept-figure concept-market">
    <p className="concept-figure__title">{en ? 'Each market sits inside the previous one' : 'একই বাজারকে ধাপে ধাপে ছোট করে দেখা'}</p>
    <div className="concept-market__scope">
      <p><strong>TAM</strong><span>{en ? 'Demand for the bakery’s relevant products' : 'বেকারির উপযোগী পণ্যের মোট সম্ভাব্য চাহিদা'}</span></p>
      <div className="concept-market__scope">
        <p><strong>SAM</strong><span>{en ? 'The part its products, prices and delivery area can serve' : 'পণ্য, দাম ও ডেলিভারি এলাকা মিলিয়ে যে অংশে সেবা দেওয়া সম্ভব'}</span></p>
        <div className="concept-market__scope">
          <p><strong>SOM</strong><span>{en ? 'The share it could realistically win in a stated period' : 'নির্দিষ্ট সময়ে বাস্তবে যতটুকু বাজার পাওয়া সম্ভব'}</span></p>
        </div>
      </div>
    </div>
    <figcaption>{en ? 'Bakery example. Areas show how the markets fit together, not measured sizes. SOM is an estimate to support with evidence, not guaranteed sales.' : 'বেকারির উদাহরণ। কোন বাজার কোনটির অংশ, তা বোঝানো হয়েছে। জায়গার মাপ বাজারের আকার বোঝায় না। SOM-এর হিসাবের পক্ষে প্রমাণ দরকার, বিক্রির নিশ্চয়তা ধরে নেওয়া যাবে না।'}</figcaption>
  </figure>
  if (concept === 'break-even') {
    // The dictionary's example: price 300, variable cost 200, fixed costs 50,000.
    const sales = [0, 250, 500, 750]
    const x = (units: number) => 80 + units / 750 * 320
    const y = (amount: number) => 250 - amount / 250000 * 220
    return <figure className="concept-figure concept-break-even">
      <p className="concept-figure__title">{en ? '500 sales cover the month’s costs' : '৫০০টি পণ্য বিক্রি হলে মাসের খরচ উঠে আসে'}</p>
      <svg viewBox="0 0 520 305" role="img" aria-label={en ? 'Sales revenue and total costs meet at 500 items: BDT 150,000 each. Costs start at BDT 50,000 and keep rising with each sale.' : '৫০০টি পণ্যে বিক্রির আয় ও মোট খরচ সমান: দুটোই ১ লাখ ৫০ হাজার টাকা। বিক্রি শূন্য হলেও খরচ ৫০ হাজার টাকা। প্রতিটি বিক্রিতে খরচ আরও বাড়ে।'}>
        <text x="72" y="22" textAnchor="end">{en ? 'BDT' : 'টাকা'}</text>
        {[0, 100000, 200000].map(amount => <g key={amount}>
          <path d={`M80,${y(amount)} H400`} className="concept-break-even__grid" />
          <text x="72" y={y(amount) + 6} textAnchor="end">{amount ? number(amount / 100000) + (en ? ' lakh' : ' লাখ') : number(0)}</text>
        </g>)}
        <path d={`M80,${y(0)} L400,${y(750 * 300)}`} className="concept-break-even__revenue" />
        <path d={`M80,${y(50000)} L400,${y(50000 + 750 * 200)}`} className="concept-break-even__cost" />
        <text x="412" y={y(750 * 300) - 5}>{en ? 'Revenue' : 'আয়'}</text>
        <text x="412" y={y(50000 + 750 * 200) + 16}>{en ? 'Total cost' : 'মোট খরচ'}</text>
        <path d={`M${x(500)},${y(150000)} V250`} className="concept-break-even__marker" />
        <circle cx={x(500)} cy={y(150000)} r="5" />
        {sales.map(units => <text key={units} x={x(units)} y="274" textAnchor="middle">{number(units)}</text>)}
        <text x="240" y="299" textAnchor="middle">{en ? 'Items sold in a month' : 'মাসে বিক্রি হওয়া পণ্য'}</text>
      </svg>
      <figcaption>{en ? 'Example: BDT 50,000 fixed costs ÷ BDT 100 contribution per item = 500 items.' : 'উদাহরণ: ৫০,০০০ টাকা স্থায়ী খরচ ÷ পণ্যপ্রতি ১০০ টাকা কন্ট্রিবিউশন = ৫০০টি পণ্য।'}</figcaption>
      <details className="concept-break-even__data">
        <summary>{en ? 'See the figures' : 'হিসাব দেখুন'}</summary>
        <table><caption>{en ? 'Monthly amounts in BDT' : 'মাসের হিসাব, টাকায়'}</caption>
          <thead><tr><th scope="col">{en ? 'Items sold' : 'বিক্রি'}</th><th scope="col">{en ? 'Revenue' : 'আয়'}</th><th scope="col">{en ? 'Total cost' : 'মোট খরচ'}</th></tr></thead>
          <tbody>{sales.map(units => <tr key={units}><th scope="row">{number(units)}</th><td>{number(units * 300)}</td><td>{number(50000 + units * 200)}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  }
  if (concept === 'dilution') return <figure className="concept-figure concept-ownership">
    <div className="concept-ownership__row">
      <p>{en ? 'Before: 100 shares' : 'আগে: ১০০টি শেয়ার'}</p>
      <div className="concept-ownership__bar">
        <span style={{ flex: 50 }} className="concept-ownership__you">{en ? 'You' : 'আপনি'}<strong>{number(50)}%</strong></span>
        <span style={{ flex: 50 }} className="concept-ownership__others">{en ? 'Others' : 'অন্যরা'}<strong>{number(50)}%</strong></span>
      </div>
    </div>
    <div className="concept-ownership__row">
      <p>{en ? 'After: 125 shares' : 'পরে: ১২৫টি শেয়ার'}</p>
      <div className="concept-ownership__bar">
        <span style={{ flex: 40 }} className="concept-ownership__you">{en ? 'You' : 'আপনি'}<strong>{number(40)}%</strong></span>
        <span style={{ flex: 40 }} className="concept-ownership__others">{en ? 'Others' : 'অন্যরা'}<strong>{number(40)}%</strong></span>
        <span style={{ flex: 20 }} className="concept-ownership__new">{en ? 'Investor' : 'ইনভেস্টর'}<strong>{number(20)}%</strong></span>
      </div>
    </div>
    <figcaption>{en ? 'Your 50 shares stay the same.' : 'আপনার ৫০টি শেয়ার আগের মতোই আছে।'}</figcaption>
  </figure>

  if (concept === 'runway') return <figure className="concept-figure concept-runway">
    <p className="concept-figure__title">{en ? 'Five months until the cash runs out' : 'পাঁচ মাস পরে ক্যাশ শেষ'}</p>
    <ol className="concept-runway__months">
      {[10, 8, 6, 4, 2, 0].map((lakh, month) => <li key={month}>
        <span className="concept-runway__amount">{lakh === 0 ? number(0) : number(lakh) + (en ? ' lakh' : ' লাখ')}</span>
        <span className="concept-runway__track" aria-hidden="true"><span style={{ height: `${lakh * 10}%` }} /></span>
        <span className="concept-runway__month">{month === 0 ? (en ? 'Start' : 'শুরু') : (en ? 'Month ' : 'মাস ') + number(month)}</span>
      </li>)}
    </ol>
    <figcaption>{en ? 'Example, BDT: 10 lakh ÷ 2 lakh net burn per month = 5 months.' : 'উদাহরণ: ১০ লাখ টাকা ÷ মাসে ২ লাখ টাকা নেট বার্ন = ৫ মাস।'}</figcaption>
  </figure>

  // One-year cliff, followed by 36 equal monthly instalments. The line is a
  // staircase so it does not suggest shares accrue before the cliff.
  const x = (month: number) => 30 + month / 48 * 400
  const y = (percent: number) => 132 - percent
  const path = `M30,132 H${x(12)} V${y(25)} ` + Array.from({ length: 36 }, (_, n) => `H${x(n + 13)} V${y(25 + (n + 1) * 75 / 36)}`).join(' ')
  return <figure className="concept-figure concept-vesting">
    <p className="concept-figure__title">{en ? 'The grant is earned over four years' : 'চার বছরে পুরো শেয়ার অর্জিত হয়'}</p>
    <svg viewBox="0 0 460 175" role="img" aria-label={en ? 'Vested grant: 0% before one year, 25% at one year, then monthly to 100% at four years.' : 'এক বছর হওয়ার আগে কিছুই অর্জিত হয় না। এক বছরে ২৫%, তারপর প্রতি মাসে কিছু অংশ করে চার বছরে ১০০% অর্জিত হয়।'}>
      <path d="M30,32 V132 H430" className="concept-vesting__axis" />
      <path d={path} className="concept-vesting__line" />
      {[0, 1, 2, 3, 4].map(year => <g key={year}>
        <circle cx={x(year * 12)} cy={y(year * 25)} r="4" />
        <text x={x(year * 12)} y={y(year * 25) - 12} textAnchor="middle">{number(year * 25)}%</text>
        <text x={x(year * 12)} y="160" textAnchor="middle">{year === 0 ? (en ? 'Start' : 'শুরু') : number(year) + (en ? ' yr' : ' বছর')}</text>
      </g>)}
    </svg>
    <figcaption>{en ? 'Example: a one-year cliff, then monthly vesting. Percentages refer to the grant, not the whole company.' : 'এই উদাহরণে এক বছরের ক্লিফ, তারপর প্রতি মাসে ভেস্টিং। শতাংশগুলো মোট বরাদ্দের অংশ, পুরো কোম্পানির নয়।'}</figcaption>
  </figure>
}
