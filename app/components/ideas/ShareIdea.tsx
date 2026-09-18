'use client'
import { useState } from 'react'
import type { Locale } from './types'
import { forLabel } from './model'
import IdeaIcon from './IdeaIcon'

/** Ideas travel through WhatsApp, Messenger and Facebook, so the phone's own share sheet comes first. */
export default function ShareIdea({ locale, title, customer }: { locale: Locale; title: string; customer: string }) {
  const en = locale === 'en'
  const [message, setMessage] = useState('')
  async function share() {
    const url = window.location.href
    const text = `${title}\n${forLabel(locale)} ${customer}`
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return }
      catch (failure) { if ((failure as Error)?.name === 'AbortError') return }
    }
    try {
      await navigator.clipboard.writeText(url)
      setMessage(en ? 'Link copied.' : 'লিংক কপি হয়েছে।')
    } catch {
      setMessage(en ? 'Copy the link from the address bar.' : 'ঠিকানার ঘর থেকে লিংকটা কপি করুন।')
    }
  }
  return <div className="ideas-share">
    <button className="ideas-button ideas-button-secondary" type="button" onClick={share}>
      <IdeaIcon name="share" />{en ? 'Share' : 'শেয়ার করুন'}
    </button>
    <p className="ideas-feedback" role="status" aria-live="polite">{message}</p>
  </div>
}
