'use client'

import { useEffect, useRef, useState } from 'react'

const REPO_URL = 'https://github.com/Deshi-Startup/deshistartup'
const TURNSTILE_SCRIPT_ID = 'deshi-turnstile-script'
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

const initialForm = {
  section: '',
  proposedChange: '',
  sourceUrl: '',
  sourceType: 'official',
  contact: '',
  website: ''
}

function createGitHubIssueUrl({ kind, pageUrl, sourcePath, form }) {
  const urgent = kind === 'urgent'
  const title = urgent
    ? `Serious content issue: ${sourcePath}`
    : `Content suggestion: ${sourcePath}`
  const labels = urgent
    ? 'content-suggestion,needs-triage,urgent,risk: high'
    : 'content-suggestion,needs-triage'

  const body = [
    `Page: ${pageUrl}`,
    `Source path: ${sourcePath}`,
    `Section: ${form.section || 'Not specified'}`,
    `Source URL: ${form.sourceUrl || 'Not provided'}`,
    `Source type: ${form.sourceType}`,
    `Contributor contact: ${form.contact || 'Not provided'}`,
    '',
    'Suggested change or issue:',
    form.proposedChange
  ].join('\n')

  return `${REPO_URL}/issues/new?${new URLSearchParams({ title, labels, body }).toString()}`
}

function getCopy(isEn, kind) {
  const urgent = kind === 'urgent'

  if (isEn) {
    return {
      suggest: 'Suggest edit',
      urgent: 'Report serious issue',
      edit: 'Editor edit',
      history: 'History',
      source: 'Source',
      title: urgent ? 'Report a serious issue' : 'Suggest an improvement',
      intro: urgent
        ? 'Use this for possible misinformation, legal/tax errors, outdated rules, or anything that could mislead founders.'
        : 'Send a focused correction, better wording, missing source, or practical improvement. You do not need a GitHub account.',
      section: 'Section or heading',
      sectionPlaceholder: 'Example: VAT threshold, registration checklist, sources',
      change: urgent ? 'What is wrong?' : 'What should change?',
      changePlaceholder: urgent
        ? 'Describe the issue, why it matters, and what should be checked.'
        : 'Write the correction or improvement as clearly as possible.',
      sourceUrl: 'Source URL',
      sourcePlaceholder: 'https://...',
      sourceType: 'Source type',
      contact: 'Email or phone (optional)',
      contactPlaceholder: 'Only if we may follow up',
      submit: urgent ? 'Submit urgent report' : 'Submit suggestion',
      submitting: 'Submitting...',
      close: 'Close',
      success: 'Submitted. An editor will triage it in the public review queue.',
      fallback: 'The public queue is not configured in this environment. Opening the GitHub issue fallback.',
      required: 'Please describe the change before submitting.',
      error: 'Submission failed. Please try again or use the GitHub issue fallback.',
      turnstile: 'Human check',
      options: [
        ['official', 'Official/government'],
        ['ecosystem', 'Ecosystem organization'],
        ['research', 'Research/report'],
        ['news', 'News/media'],
        ['experience', 'Founder experience'],
        ['other', 'Other']
      ]
    }
  }

  return {
    suggest: 'সংশোধন প্রস্তাব',
    urgent: 'গুরুতর ভুল জানান',
    edit: 'সম্পাদক সম্পাদনা',
    history: 'ইতিহাস',
    source: 'সোর্স',
    title: urgent ? 'গুরুতর সমস্যা জানান' : 'উন্নতির প্রস্তাব দিন',
    intro: urgent
      ? 'ভুল তথ্য, আইন/কর বিষয়ক ভুল, পুরোনো নিয়ম, বা উদ্যোক্তাদের বিভ্রান্ত করতে পারে এমন কিছু দেখলে এখানে জানান।'
      : 'বানান, ভাষা, সূত্র, বা বাস্তব পরামর্শের ছোট উন্নতি পাঠান। GitHub অ্যাকাউন্ট লাগবে না।',
    section: 'অংশ বা শিরোনাম',
    sectionPlaceholder: 'যেমন: ভ্যাট সীমা, রেজিস্ট্রেশন চেকলিস্ট, সূত্র',
    change: urgent ? 'কী ভুল আছে?' : 'কী পরিবর্তন দরকার?',
    changePlaceholder: urgent
      ? 'সমস্যাটি লিখুন, কেন গুরুত্বপূর্ণ, এবং কী যাচাই করা দরকার।'
      : 'যত পরিষ্কারভাবে সম্ভব সংশোধন বা উন্নতির প্রস্তাব লিখুন।',
    sourceUrl: 'সূত্রের লিংক',
    sourcePlaceholder: 'https://...',
    sourceType: 'সূত্রের ধরন',
    contact: 'ইমেইল বা ফোন (ঐচ্ছিক)',
    contactPlaceholder: 'ফলোআপ দরকার হলে',
    submit: urgent ? 'গুরুতর রিপোর্ট পাঠান' : 'প্রস্তাব পাঠান',
    submitting: 'পাঠানো হচ্ছে...',
    close: 'বন্ধ করুন',
    success: 'জমা হয়েছে। একজন সম্পাদক পাবলিক রিভিউ কিউতে এটি দেখবেন।',
    fallback: 'এই পরিবেশে পাবলিক কিউ কনফিগার করা নেই। GitHub issue fallback খোলা হচ্ছে।',
    required: 'পাঠানোর আগে পরিবর্তনের বিবরণ লিখুন।',
    error: 'জমা দেওয়া যায়নি। আবার চেষ্টা করুন অথবা GitHub issue fallback ব্যবহার করুন।',
    turnstile: 'মানব যাচাই',
    options: [
      ['official', 'সরকারি/অফিশিয়াল'],
      ['ecosystem', 'ইকোসিস্টেম সংগঠন'],
      ['research', 'রিসার্চ/রিপোর্ট'],
      ['news', 'সংবাদমাধ্যম'],
      ['experience', 'উদ্যোক্তার অভিজ্ঞতা'],
      ['other', 'অন্যান্য']
    ]
  }
}

export default function ContributionWidget({ isEn, pageUrl, sourcePath, adminUrl, historyUrl, sourceFileUrl }) {
  const [isOpen, setIsOpen] = useState(false)
  const [kind, setKind] = useState('suggest')
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState(null)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const turnstileRef = useRef(null)
  const turnstileWidgetRef = useRef(null)

  const copy = getCopy(isEn, kind)
  const suggestionApiUrl = process.env.NEXT_PUBLIC_SUGGESTION_API_URL || ''
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

  useEffect(() => {
    if (!isOpen || !turnstileSiteKey || !turnstileRef.current) return undefined

    let cancelled = false

    const renderTurnstile = () => {
      if (cancelled || !window.turnstile || !turnstileRef.current || turnstileWidgetRef.current) return

      turnstileWidgetRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: turnstileSiteKey,
        callback: (token) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken('')
      })
    }

    if (window.turnstile) {
      renderTurnstile()
    } else {
      let script = document.getElementById(TURNSTILE_SCRIPT_ID)
      if (!script) {
        script = document.createElement('script')
        script.id = TURNSTILE_SCRIPT_ID
        script.src = TURNSTILE_SCRIPT_SRC
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
      script.addEventListener('load', renderTurnstile)

      return () => {
        cancelled = true
        script.removeEventListener('load', renderTurnstile)
      }
    }

    return () => {
      cancelled = true
      if (window.turnstile && turnstileWidgetRef.current) {
        window.turnstile.remove(turnstileWidgetRef.current)
        turnstileWidgetRef.current = null
      }
    }
  }, [isOpen, turnstileSiteKey])

  function openForm(nextKind) {
    setKind(nextKind)
    setIsOpen(true)
    setStatus(null)
  }

  function closeForm() {
    setIsOpen(false)
    setForm(initialForm)
    setStatus(null)
    setTurnstileToken('')
    setIsSubmitting(false)
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submitSuggestion(event) {
    event.preventDefault()

    if (!form.proposedChange.trim()) {
      setStatus({ type: 'error', message: copy.required })
      return
    }

    const payload = {
      kind,
      pageUrl,
      sourcePath,
      section: form.section.trim(),
      proposedChange: form.proposedChange.trim(),
      sourceUrl: form.sourceUrl.trim(),
      sourceType: form.sourceType,
      contact: form.contact.trim(),
      website: form.website,
      turnstileToken
    }

    if (!suggestionApiUrl) {
      window.open(createGitHubIssueUrl({ kind, pageUrl, sourcePath, form: payload }), '_blank', 'noopener,noreferrer')
      setStatus({ type: 'success', message: copy.fallback })
      return
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      const response = await fetch(suggestionApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || copy.error)
      }

      setStatus({ type: 'success', message: data.issueUrl ? `${copy.success} ${data.issueUrl}` : copy.success })
      setForm(initialForm)
      setTurnstileToken('')
      if (window.turnstile && turnstileWidgetRef.current) {
        window.turnstile.reset(turnstileWidgetRef.current)
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message || copy.error })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="article-actions contribution-actions" aria-label={isEn ? 'Contribution actions' : 'অবদান রাখার কাজ'}>
        <button className="link-button" type="button" onClick={() => openForm('suggest')}>{copy.suggest}</button>
        <button className="link-button link-button--urgent" type="button" onClick={() => openForm('urgent')}>{copy.urgent}</button>
        <a href={adminUrl}>{copy.edit}</a>
        <a href={historyUrl} target="_blank" rel="noopener noreferrer">{copy.history}</a>
        <a href={sourceFileUrl} target="_blank" rel="noopener noreferrer">{copy.source}</a>
      </div>

      {isOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeForm()
        }}>
          <section className="contribution-modal" role="dialog" aria-modal="true" aria-labelledby="contribution-title">
            <div className="contribution-modal__header">
              <div>
                <h2 id="contribution-title">{copy.title}</h2>
                <p>{copy.intro}</p>
              </div>
              <button className="modal-close" type="button" onClick={closeForm} aria-label={copy.close}>×</button>
            </div>

            <form className="contribution-form" onSubmit={submitSuggestion}>
              <label>
                <span>{copy.section}</span>
                <input name="section" value={form.section} onChange={updateField} placeholder={copy.sectionPlaceholder} />
              </label>

              <label>
                <span>{copy.change}</span>
                <textarea name="proposedChange" value={form.proposedChange} onChange={updateField} placeholder={copy.changePlaceholder} rows={7} required />
              </label>

              <div className="form-grid">
                <label>
                  <span>{copy.sourceUrl}</span>
                  <input name="sourceUrl" type="url" value={form.sourceUrl} onChange={updateField} placeholder={copy.sourcePlaceholder} />
                </label>

                <label>
                  <span>{copy.sourceType}</span>
                  <select name="sourceType" value={form.sourceType} onChange={updateField}>
                    {copy.options.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span>{copy.contact}</span>
                <input name="contact" value={form.contact} onChange={updateField} placeholder={copy.contactPlaceholder} />
              </label>

              <label className="honeypot" aria-hidden="true">
                Website
                <input name="website" value={form.website} onChange={updateField} tabIndex={-1} autoComplete="off" />
              </label>

              {turnstileSiteKey ? (
                <div className="turnstile-field">
                  <span>{copy.turnstile}</span>
                  <div ref={turnstileRef} />
                </div>
              ) : null}

              {status ? (
                <p className={status.type === 'error' ? 'form-status is-error' : 'form-status is-success'}>{status.message}</p>
              ) : null}

              <div className="contribution-form__footer">
                <button className="secondary-button" type="button" onClick={closeForm}>{copy.close}</button>
                <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? copy.submitting : copy.submit}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  )
}
