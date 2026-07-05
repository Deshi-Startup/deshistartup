'use client'

import { useEffect, useRef, useState } from 'react'

const REPO_URL = 'https://github.com/Deshi-Startup/deshistartup'
const TURNSTILE_SCRIPT_ID = 'deshi-turnstile-script'
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

const initialForm = {
  editMode: 'focused',
  editType: 'copyedit',
  currentText: '',
  section: '',
  proposedChange: '',
  proposedContent: '',
  sourceUrl: '',
  sourceType: 'official',
  contact: '',
  website: ''
}

function createGitHubIssueUrl({ kind, pageUrl, sourcePath, form }) {
  const urgent = kind === 'urgent'
  const title = urgent
    ? `Serious content issue: ${sourcePath}`
    : `Pending content edit: ${sourcePath}`
  const labels = urgent
    ? 'content-suggestion,pending-revision,needs-triage,urgent,risk: high'
    : 'content-suggestion,pending-revision,needs-triage'
  const sourceDraft = form.editMode === 'source'
    ? [
        '',
        'Draft source:',
        '```mdx',
        String(form.proposedContent || '').slice(0, 4000),
        '```',
        String(form.proposedContent || '').length > 4000 ? 'Draft was truncated in this fallback URL. Use the public queue Worker for full source drafts.' : ''
      ].join('\n')
    : ''

  const body = [
    `Page: ${pageUrl}`,
    `Source path: ${sourcePath}`,
    `Edit mode: ${form.editMode}`,
    `Edit type: ${form.editType}`,
    `Section: ${form.section || 'Not specified'}`,
    `Current text: ${form.currentText || 'Not provided'}`,
    `Source URL: ${form.sourceUrl || 'Not provided'}`,
    `Source type: ${form.sourceType}`,
    `Contributor contact: ${form.contact || 'Not provided'}`,
    '',
    'Suggested change or issue:',
    form.proposedChange || 'See draft source below.',
    sourceDraft
  ].join('\n')

  return `${REPO_URL}/issues/new?${new URLSearchParams({ title, labels, body }).toString()}`
}

function getCopy(isEn, kind) {
  const urgent = kind === 'urgent'

  if (isEn) {
    return {
      suggest: 'Edit this page',
      urgent: 'Report serious issue',
      edit: 'Editor dashboard',
      history: 'History',
      source: 'Source',
      title: urgent ? 'Report a serious issue' : 'Submit a pending edit',
      intro: urgent
        ? 'Use this for possible misinformation, legal/tax errors, outdated rules, or anything that could mislead founders.'
        : 'Edit in the browser and send it for review. It becomes a pending revision; nothing publishes until an editor approves it.',
      editMode: 'Edit mode',
      focusedMode: 'Focused fix',
      sourceMode: 'Edit source',
      modeHint: 'Focused fixes are best for typos, citations, and small factual corrections. Source edits are for larger page drafts.',
      editType: 'Change type',
      currentText: 'Current text',
      currentTextPlaceholder: 'Paste the sentence, paragraph, or link being replaced.',
      currentTextRequired: 'Please paste the current text so editors can review a clear diff.',
      section: 'Section or heading',
      sectionPlaceholder: 'Example: VAT threshold, registration checklist, sources',
      change: urgent ? 'What is wrong?' : 'What should change?',
      changePlaceholder: urgent
        ? 'Describe the issue, why it matters, and what should be checked.'
        : 'Write the correction, replacement wording, or improvement as clearly as possible.',
      sourceDraft: 'Page source draft',
      sourceDraftPlaceholder: 'The current MDX source will load here. Edit it and submit the draft for review.',
      loadSource: 'Reload source',
      loadingSource: 'Loading source...',
      sourceLoaded: 'Source loaded. Your edits will be reviewed as a pending revision.',
      sourceLoadError: 'Could not load the source automatically. You can still paste an edited draft here.',
      sourceFallback: 'Full-page source drafts require the public review queue Worker in this environment.',
      noChanges: 'No changes detected in the source draft.',
      sourceUrl: 'Source URL',
      sourcePlaceholder: 'https://...',
      sourceType: 'Source type',
      contact: 'Email or phone (optional)',
      contactPlaceholder: 'Only if we may follow up',
      submit: urgent ? 'Submit urgent report' : 'Submit pending edit',
      submitting: 'Submitting...',
      close: 'Close',
      success: 'Submitted as a pending revision. An editor will review the diff before anything changes on the site.',
      fallback: 'The public queue is not configured in this environment. Opening the GitHub issue fallback.',
      required: 'Please describe the change before submitting.',
      error: 'Submission failed. Please try again or use the GitHub issue fallback.',
      turnstile: 'Human check',
      editTypes: [
        ['copyedit', 'Typo, grammar, clarity'],
        ['broken_link', 'Broken or better link'],
        ['source', 'Add or update source'],
        ['factual', 'Factual correction'],
        ['rewrite', 'Larger rewrite']
      ],
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
    suggest: 'এই পাতা সম্পাদনা',
    urgent: 'গুরুতর ভুল জানান',
    edit: 'সম্পাদক ড্যাশবোর্ড',
    history: 'ইতিহাস',
    source: 'সোর্স',
    title: urgent ? 'গুরুতর সমস্যা জানান' : 'রিভিউর জন্য সম্পাদনা পাঠান',
    intro: urgent
      ? 'ভুল তথ্য, আইন/কর বিষয়ক ভুল, পুরোনো নিয়ম, বা উদ্যোক্তাদের বিভ্রান্ত করতে পারে এমন কিছু দেখলে এখানে জানান।'
      : 'ব্রাউজারেই পরিবর্তন লিখে রিভিউতে পাঠান। এটি pending revision হবে; সম্পাদক অনুমোদন না দিলে প্রকাশিত পাতা বদলাবে না।',
    editMode: 'সম্পাদনার ধরন',
    focusedMode: 'ছোট সংশোধন',
    sourceMode: 'সোর্স সম্পাদনা',
    modeHint: 'বানান, সূত্র, বা ছোট factual correction-এর জন্য ছোট সংশোধন ব্যবহার করুন। বড় page draft-এর জন্য সোর্স সম্পাদনা ব্যবহার করুন।',
    editType: 'পরিবর্তনের ধরন',
    currentText: 'বর্তমান লেখা',
    currentTextPlaceholder: 'যে বাক্য, অনুচ্ছেদ, বা link বদলাতে চান সেটি পেস্ট করুন।',
    currentTextRequired: 'স্পষ্ট diff দেখানোর জন্য বর্তমান লেখাটি পেস্ট করুন।',
    section: 'অংশ বা শিরোনাম',
    sectionPlaceholder: 'যেমন: ভ্যাট সীমা, রেজিস্ট্রেশন চেকলিস্ট, সূত্র',
    change: urgent ? 'কী ভুল আছে?' : 'কী পরিবর্তন দরকার?',
    changePlaceholder: urgent
      ? 'সমস্যাটি লিখুন, কেন গুরুত্বপূর্ণ, এবং কী যাচাই করা দরকার।'
      : 'সংশোধন, replacement wording, বা উন্নতির প্রস্তাব যত পরিষ্কারভাবে সম্ভব লিখুন।',
    sourceDraft: 'পাতার সোর্স ড্রাফট',
    sourceDraftPlaceholder: 'বর্তমান MDX সোর্স এখানে লোড হবে। পরিবর্তন করে রিভিউতে পাঠান।',
    loadSource: 'সোর্স আবার লোড করুন',
    loadingSource: 'সোর্স লোড হচ্ছে...',
    sourceLoaded: 'সোর্স লোড হয়েছে। আপনার পরিবর্তন pending revision হিসেবে রিভিউ হবে।',
    sourceLoadError: 'সোর্স স্বয়ংক্রিয়ভাবে লোড করা যায়নি। চাইলে edited draft এখানে পেস্ট করতে পারেন।',
    sourceFallback: 'Full-page source draft পাঠাতে এই পরিবেশে public review queue Worker দরকার।',
    noChanges: 'সোর্স ড্রাফটে কোনো পরিবর্তন পাওয়া যায়নি।',
    sourceUrl: 'সূত্রের লিংক',
    sourcePlaceholder: 'https://...',
    sourceType: 'সূত্রের ধরন',
    contact: 'ইমেইল বা ফোন (ঐচ্ছিক)',
    contactPlaceholder: 'ফলোআপ দরকার হলে',
    submit: urgent ? 'গুরুতর রিপোর্ট পাঠান' : 'রিভিউতে পাঠান',
    submitting: 'পাঠানো হচ্ছে...',
    close: 'বন্ধ করুন',
    success: 'Pending revision হিসেবে জমা হয়েছে। প্রকাশিত পাতায় কিছু বদলানোর আগে সম্পাদক diff রিভিউ করবেন।',
    fallback: 'এই পরিবেশে পাবলিক কিউ কনফিগার করা নেই। GitHub issue fallback খোলা হচ্ছে।',
    required: 'পাঠানোর আগে পরিবর্তনের বিবরণ লিখুন।',
    error: 'জমা দেওয়া যায়নি। আবার চেষ্টা করুন অথবা GitHub issue fallback ব্যবহার করুন।',
    turnstile: 'মানব যাচাই',
    editTypes: [
      ['copyedit', 'বানান, grammar, clarity'],
      ['broken_link', 'ভাঙা বা ভালো লিংক'],
      ['source', 'সূত্র যোগ/আপডেট'],
      ['factual', 'তথ্য সংশোধন'],
      ['rewrite', 'বড় rewrite']
    ],
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

export default function ContributionWidget({ isEn, pageUrl, sourcePath, adminUrl, historyUrl, sourceFileUrl, rawSourceUrl }) {
  const [isOpen, setIsOpen] = useState(false)
  const [kind, setKind] = useState('suggest')
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState(null)
  const [sourceLoadStatus, setSourceLoadStatus] = useState('idle')
  const [loadedSourceText, setLoadedSourceText] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const turnstileRef = useRef(null)
  const turnstileWidgetRef = useRef(null)

  const copy = getCopy(isEn, kind)
  const suggestionApiUrl = process.env.NEXT_PUBLIC_SUGGESTION_API_URL || ''
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

  useEffect(() => {
    const handleOpenEditor = () => openForm('suggest')

    window.addEventListener('deshi:open-contribution-editor', handleOpenEditor)
    return () => window.removeEventListener('deshi:open-contribution-editor', handleOpenEditor)
  }, [])

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
    setForm({ ...initialForm, editType: nextKind === 'urgent' ? 'factual' : 'copyedit' })
    setIsOpen(true)
    setStatus(null)
    setSourceLoadStatus('idle')
    setLoadedSourceText('')
  }

  function closeForm() {
    setIsOpen(false)
    setForm(initialForm)
    setStatus(null)
    setSourceLoadStatus('idle')
    setLoadedSourceText('')
    setTurnstileToken('')
    setIsSubmitting(false)
  }

  async function loadSourceDraft() {
    if (!rawSourceUrl) {
      setSourceLoadStatus('error')
      setStatus({ type: 'error', message: copy.sourceLoadError })
      return
    }

    setSourceLoadStatus('loading')
    setStatus(null)

    try {
      const response = await fetch(rawSourceUrl, { cache: 'no-store' })
      if (!response.ok) throw new Error(`Source returned ${response.status}`)

      const text = await response.text()
      setLoadedSourceText(text)
      setForm((current) => ({
        ...current,
        proposedContent: current.proposedContent || text
      }))
      setSourceLoadStatus('loaded')
      setStatus({ type: 'success', message: copy.sourceLoaded })
    } catch {
      setSourceLoadStatus('error')
      setStatus({ type: 'error', message: copy.sourceLoadError })
    }
  }

  function selectEditMode(editMode) {
    setStatus(null)
    setForm((current) => ({
      ...current,
      editMode,
      editType: editMode === 'source' ? 'full_source' : current.editType === 'full_source' ? 'copyedit' : current.editType
    }))

    if (editMode === 'source' && sourceLoadStatus === 'idle') {
      loadSourceDraft()
    }
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submitSuggestion(event) {
    event.preventDefault()

    const isSourceEdit = form.editMode === 'source'
    const proposedText = isSourceEdit ? form.proposedContent : form.proposedChange

    if (!proposedText.trim()) {
      setStatus({ type: 'error', message: copy.required })
      return
    }

    if (!isSourceEdit && kind === 'suggest' && !form.currentText.trim()) {
      setStatus({ type: 'error', message: copy.currentTextRequired })
      return
    }

    if (isSourceEdit && loadedSourceText && form.proposedContent.trim() === loadedSourceText.trim()) {
      setStatus({ type: 'error', message: copy.noChanges })
      return
    }

    const payload = {
      kind,
      pageUrl,
      sourcePath,
      editMode: form.editMode,
      editType: isSourceEdit ? 'full_source' : form.editType,
      currentText: form.currentText.trim(),
      section: form.section.trim(),
      proposedChange: isSourceEdit ? '' : form.proposedChange.trim(),
      proposedContent: isSourceEdit ? form.proposedContent : '',
      sourceUrl: form.sourceUrl.trim(),
      sourceType: form.sourceType,
      contact: form.contact.trim(),
      website: form.website,
      turnstileToken
    }

    if (!suggestionApiUrl) {
      if (isSourceEdit) {
        setStatus({ type: 'error', message: copy.sourceFallback })
        return
      }

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
      setSourceLoadStatus('idle')
      setLoadedSourceText('')
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
      <div id="contribution-actions" className="article-actions contribution-actions" aria-label={isEn ? 'Contribution actions' : 'অবদান রাখার কাজ'}>
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
              {kind === 'suggest' ? (
                <fieldset className="edit-mode-field">
                  <legend>{copy.editMode}</legend>
                  <div className="edit-mode-options" role="group" aria-label={copy.editMode}>
                    <button
                      className={form.editMode === 'focused' ? 'mode-option is-active' : 'mode-option'}
                      type="button"
                      onClick={() => selectEditMode('focused')}
                    >
                      {copy.focusedMode}
                    </button>
                    <button
                      className={form.editMode === 'source' ? 'mode-option is-active' : 'mode-option'}
                      type="button"
                      onClick={() => selectEditMode('source')}
                    >
                      {copy.sourceMode}
                    </button>
                  </div>
                  <p className="field-hint">{copy.modeHint}</p>
                </fieldset>
              ) : null}

              {form.editMode === 'focused' ? (
                <>
                  {kind === 'suggest' ? (
                    <label>
                      <span>{copy.editType}</span>
                      <select name="editType" value={form.editType} onChange={updateField}>
                        {copy.editTypes.map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </label>
                  ) : null}

                  <label>
                    <span>{copy.section}</span>
                    <input name="section" value={form.section} onChange={updateField} placeholder={copy.sectionPlaceholder} />
                  </label>

                  <label>
                    <span>{copy.currentText}</span>
                    <textarea
                      name="currentText"
                      value={form.currentText}
                      onChange={updateField}
                      placeholder={copy.currentTextPlaceholder}
                      rows={3}
                      required={kind === 'suggest'}
                    />
                  </label>

                  <label>
                    <span>{copy.change}</span>
                    <textarea name="proposedChange" value={form.proposedChange} onChange={updateField} placeholder={copy.changePlaceholder} rows={7} required />
                  </label>
                </>
              ) : (
                <label>
                  <span>{copy.sourceDraft}</span>
                  <div className="source-draft-tools">
                    <button className="secondary-button secondary-button--compact" type="button" onClick={loadSourceDraft} disabled={sourceLoadStatus === 'loading'}>
                      {sourceLoadStatus === 'loading' ? copy.loadingSource : copy.loadSource}
                    </button>
                  </div>
                  <textarea
                    className="source-textarea"
                    name="proposedContent"
                    value={form.proposedContent}
                    onChange={updateField}
                    placeholder={copy.sourceDraftPlaceholder}
                    rows={16}
                    required
                    spellCheck={false}
                  />
                </label>
              )}

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
