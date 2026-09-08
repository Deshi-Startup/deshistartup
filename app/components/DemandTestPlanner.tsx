'use client'

import { useId, useState } from 'react'
import { getDemandPlanFields, formatDemandPlan } from '../lib/demand-plan.mjs'
import './DemandTest.css'

interface DemandTestPlannerProps {
  locale?: 'bn' | 'en'
}

const bengaliDigits = (value: number | string) => String(value).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])

export default function DemandTestPlanner({ locale = 'bn' }: DemandTestPlannerProps) {
  const isEn = locale === 'en'
  const id = useId()
  const [values, setValues] = useState<Record<string, string>>({})

  const fields = getDemandPlanFields(locale)
  const filled = fields.filter(field => values[field.id]?.trim()).length
  const plan = formatDemandPlan(values, locale)

  return (
    <section className="demand-tool" aria-label={isEn ? "Your demand test plan" : "আপনার ডিমান্ড টেস্ট প্ল্যান"} data-pagefind-ignore>
      <p className="demand-tool__notice">
        {isEn
          ? "Write short answers. Your entries are not sent anywhere or saved by this page. Download your plan before leaving or reloading."
          : "সংক্ষিপ্ত উত্তর দিন। আপনার তথ্য কোথাও পাঠানো বা সেভ করা হয় না। পাতাটি বন্ধ বা রিলোড করার আগে প্ল্যানটি ডাউনলোড করে নিন।"}
      </p>
      <noscript>
        <p>{isEn
          ? "The planner needs JavaScript to include your answers in the download. You can still download the blank worksheet below and fill it in using a text editor or on paper."
          : "ডাউনলোডে আপনার উত্তর যোগ করার জন্য প্ল্যানারের জাভাস্ক্রিপ্ট প্রয়োজন। আপনি নিচের ফাঁকা ওয়ার্কশিটটি ডাউনলোড করে টেক্সট এডিটর বা কাগজে লিখে পূরণ করতে পারেন।"}</p>
      </noscript>
      <div className="demand-tool__fields">
        {fields.map((field, index) => (
          <div className="demand-tool__field" key={field.id}>
            <label htmlFor={`${id}-${field.id}`}>
              <span className="demand-tool__number" aria-hidden="true">{isEn ? index + 1 : bengaliDigits(index + 1)}</span>
              {field.label}
            </label>
            <p id={`${id}-${field.id}-hint`}>{field.hint}</p>
            <textarea
              id={`${id}-${field.id}`}
              aria-describedby={`${id}-${field.id}-hint`}
              value={values[field.id] || ''}
              onChange={event => setValues(current => ({ ...current, [field.id]: event.target.value }))}
              rows={3}
              maxLength={1200}
              autoComplete="off"
            />
          </div>
        ))}
      </div>
      <p role="status" className="demand-tool__status">
        {isEn
          ? `${filled} of ${fields.length} answers filled in.`
          : `${bengaliDigits(fields.length)} টির মধ্যে ${bengaliDigits(filled)} টি উত্তর দেওয়া হয়েছে।`}
        {filled === fields.length
          ? (isEn
              ? ' Review the checklist below before running your test. Filled answers have not been assessed for quality.'
              : ' টেস্ট শুরু করার আগে নিচের চেকলিস্টটি দেখুন। পূরণ করা উত্তরগুলোর মান যাচাই করা হয়নি।')
          : (isEn
              ? ' You can download an unfinished plan and complete it later.'
              : ' আপনি অসম্পূর্ণ প্ল্যান ডাউনলোড করে পরে পূরণ করতে পারেন।')}
      </p>
      <div className="demand-tool__actions">
        <a className="demand-tool__download" href={`data:text/plain;charset=utf-8,${encodeURIComponent(plan)}`}
          download="deshi-startup-demand-test.txt">
          {filled
            ? (isEn ? 'Download my plan (.txt)' : 'আমার প্ল্যান ডাউনলোড করুন (.txt)')
            : (isEn ? 'Download blank worksheet (.txt)' : 'ফাঁকা ওয়ার্কশিট ডাউনলোড করুন (.txt)')}
        </a>
      </div>
      <details className="demand-tool__preview">
        <summary>{isEn ? 'Preview the text to copy or print' : 'কপি বা প্রিন্ট করার জন্য লেখাটি দেখুন'}</summary>
        <pre>{plan}</pre>
      </details>
    </section>
  )
}
