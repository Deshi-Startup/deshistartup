'use client'
import { useEffect, useId, useRef, useState } from 'react'
import type { Locale } from './types'
import { downloadText } from './download'
import IdeaIcon from './IdeaIcon'

export default function IdeaActions({ id, locale, prompt, brief }: { id: string; locale: Locale; prompt: string; brief: string }) {
  const en = locale === 'en'
  const [message, setMessage] = useState('')
  const [fallback, setFallback] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const fieldId = useId()
  useEffect(() => { if (fallback) { textRef.current?.focus(); textRef.current?.select() } }, [fallback])
  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt)
      setFallback(false)
      setMessage(en ? 'AI prompt copied.' : 'এআই প্রম্পট কপি হয়েছে।')
    } catch {
      setFallback(true)
      setMessage(en ? 'Select and copy the prompt below.' : 'নিচের লেখা সিলেক্ট করে কপি করুন।')
      textRef.current?.focus(); textRef.current?.select()
    }
  }
  function download() {
    try { downloadText(`${id}-${locale}.md`, brief); setMessage(en ? 'Idea download started.' : 'আইডিয়া ডাউনলোড শুরু হয়েছে।') }
    catch { setMessage(en ? 'Download could not start. Try again.' : 'ডাউনলোড শুরু হয়নি। আবার চেষ্টা করুন।') }
  }
  return <div className="ideas-actions">
    <div className="ideas-action-buttons">
      <button type="button" className="ideas-button ideas-button-secondary" onClick={copy}>{en ? 'Copy AI prompt' : 'এআই প্রম্পট কপি করুন'}<IdeaIcon name="arrow" /></button>
      <button type="button" className="ideas-text-button" onClick={download}><IdeaIcon name="download" />{en ? 'Download idea' : 'আইডিয়া ডাউনলোড করুন'}</button>
      <p className="ideas-action-help">{en ? 'Paste it into ChatGPT, Claude or Gemini to sketch a first version.' : 'ChatGPT, Claude বা Gemini-তে পেস্ট করলে প্রথম খসড়াটা বানিয়ে দেখা যায়।'}</p>
    </div>
    <p className="ideas-feedback" role="status" aria-live="polite">{message}</p>
    {fallback && <div className="ideas-copy-fallback"><label htmlFor={fieldId}>{en ? 'AI prompt' : 'এআই প্রম্পট'}</label><textarea id={fieldId} ref={textRef} value={prompt} readOnly rows={9} /></div>}
  </div>
}
