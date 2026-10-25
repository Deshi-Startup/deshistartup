'use client'
import { useEffect, useId, useState, type ReactNode } from 'react'
import './Workshop.css'
export type Locale = 'en' | 'bn'
export const words = (locale: Locale) => (en: string, bn: string) => locale === 'en' ? en : bn
export const number = (n: number, locale: Locale) => new Intl.NumberFormat(locale === 'en' ? 'en-BD' : 'bn-BD', { maximumFractionDigits: 2 }).format(n)
export const valuesOf = (values: Record<string, string>) => Object.fromEntries(Object.entries(values).map(([k,v]) => [k, v.trim() === '' ? NaN : Number(v)]))
export function Workshop({ title, locale, children }: { title: string; locale: Locale; children: ReactNode }) {
 const t=words(locale)
 const [interactive, setInteractive] = useState(false)
 useEffect(() => setInteractive(true), [])
 return <section className="founder-lab" aria-label={title} lang={locale} data-pagefind-ignore>
  <p className="founder-lab__eyebrow">{t('WORK IT OUT','নিজের হিসাব করুন')}</p><h3>{title}</h3>
  <p className="founder-lab__notice">{t('Illustrative defaults. Inputs stay in this page and are not saved or sent by this tool. Download your work before leaving.','শুরুর সংখ্যাগুলো শেখানোর উদাহরণ। এই টুল আপনার তথ্য সেভ করে না বা কোথাও পাঠায় না। পাতা বন্ধ করার আগে কাজটি ডাউনলোড করুন।')}</p>
  <noscript><p>{t('Editing needs JavaScript. The example, formulas and blank worksheets in the article remain usable.','ঘরগুলো বদলাতে জাভাস্ক্রিপ্ট লাগবে। লেখার উদাহরণ, সূত্র ও ফাঁকা ছক ব্যবহার করতে পারবেন।')}</p></noscript>
  <fieldset className="founder-lab__controls" disabled={!interactive}>
   <legend className="founder-lab__legend">{title}</legend>
   {children}
  </fieldset>
 </section>
}
export function Numeric({ label, value, onChange, min=0, max, step=1, slider=false, hint }: {label:string;value:string;onChange:(v:string)=>void;min?:number;max?:number;step?:number;slider?:boolean;hint?:string}) {
 const id=useId()
 const safeMax=typeof max === 'number' && Number.isFinite(max) && max >= 0 ? max : undefined
 return <div className="founder-lab__field"><label htmlFor={id}>{label}</label>
 <input id={id} type="number" inputMode="decimal" min={min} max={safeMax} step={step} value={value} onChange={e=>onChange(e.target.value)} aria-describedby={hint ? `${id}-hint` : undefined}/>
 {slider && <input type="range" min={min} max={safeMax ?? 100} step={step} value={Number.isFinite(Number(value)) ? Math.min(safeMax ?? 100,Math.max(min,Number(value))) : min} onChange={e=>onChange(e.target.value)} aria-label={label} />}
 {hint && <small id={`${id}-hint`}>{hint}</small>}</div>
}
export function Results({ rows, locale }: {rows: [string,string][];locale:Locale}) {
 const t=words(locale)
 return <div className="founder-lab__table"><table><caption>{t('Calculated results','হিসাবের ফল')}</caption><thead><tr><th scope="col">{t('Measure','কী মাপছি')}</th><th scope="col">{t('Value','ফল')}</th></tr></thead><tbody>{rows.map(([k,v])=><tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody></table></div>
}
export function Download({ text, name, locale }: {text:string;name:string;locale:Locale}) {
 const t=words(locale)
 return <div className="founder-lab__export"><a download={`${name}-${locale}.md`} href={`data:text/markdown;charset=utf-8,${encodeURIComponent(text)}`}>{t('Download this worksheet (.md)','এই ওয়ার্কশিট ডাউনলোড করুন (.md)')}</a><details><summary>{t('Preview / copy the worksheet','ওয়ার্কশিট দেখুন বা কপি করুন')}</summary><pre>{text}</pre></details></div>
}
export function ErrorMessage({locale}:{locale:Locale}) {return <p role="alert">{words(locale)('Enter valid non-negative numbers. Counts must be whole numbers; check the stated limits and relationships.','শূন্য বা তার বেশি বৈধ সংখ্যা দিন। গণনার ঘরে পূর্ণসংখ্যা লাগবে। ঘরগুলোর সীমা ও সম্পর্ক মিলিয়ে দেখুন।')}</p>}
export function Bars({rows,max,locale}:{rows:[string,number][];max:number;locale:Locale}) {
 return <ul className="founder-lab__bars">{rows.map(([label,value])=><li key={label}><span>{label}<strong>{number(value,locale)}</strong></span><div aria-hidden="true"><i style={{width:`${max>0?Math.min(100,Math.max(0,value/max*100)):0}%`}}/></div></li>)}</ul>
}
