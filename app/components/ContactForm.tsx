'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CONTACT_FIELD_LIMITS,
  CONTACT_TOPIC_KEYS,
  CONTACT_TOPIC_LABELS,
  type ContactTopic
} from '../lib/contact'

/**
 * The site's one contact form. It posts to the native Worker at /api/contact,
 * which mails the message to the Deshi Startup inbox through the Cloudflare
 * send_email binding. Everything a reader needs to reach us is also on the page
 * as a plain address, so this island is a convenience and never the only route.
 *
 * Spam is handled without a third-party widget: a hidden honeypot field plus
 * per-IP and per-Cloudflare-location rate limits in the Worker. The endpoint
 * can only ever mail one runtime-secret inbox, so it is not usable as a relay.
 */

const CONTACT_EMAIL = 'hello@deshistartup.com'
const MESSAGE_MIN = 10
type Field = 'name' | 'email' | 'message'

interface ContactFormProps {
  locale?: 'bn' | 'en'
}

const copy = {
  bn: {
    name: 'নাম',
    email: 'ইমেইল',
    topic: 'বিষয়',
    message: 'মেসেজ',
    messageHint: 'বিস্তারিত লিখলে উত্তর দেওয়া সহজ হয়। (সর্বোচ্চ ৫,০০০ অক্ষর)',
    submit: 'পাঠিয়ে দিন',
    sending: 'পাঠানো হচ্ছে…',
    honeypot: 'এই ঘরটা খালি রাখুন',
    sentTitle: 'মেসেজ পেয়েছি',
    sentBody: (email: string) =>
      `উত্তর যাবে ${email} ঠিকানায়। খুব জরুরি কিছু হলে সরাসরি ${CONTACT_EMAIL}-এ মেইল করুন।`,
    again: 'আরেকটা মেসেজ পাঠান',
    errors: {
      name: 'নাম লিখুন।',
      email: 'ইমেইল দিন।',
      emailFormat: 'ইমেইল ঠিক নেই, আবার দেখুন।',
      message: 'মেসেজ ফাঁকা রাখা যাবে না।',
      messageTooShort: 'আরেকটু বিস্তারিত লিখুন, অন্তত ১০ অক্ষর।',
      messageTooLong: 'মেসেজ ৫,০০০ অক্ষরের বেশি হয়ে গেছে।',
      rateLimited: `অনেক বেশি মেসেজ পাঠানো হয়েছে। একটু পর আবার চেষ্টা করুন, অথবা সরাসরি ${CONTACT_EMAIL}-এ মেইল করুন।`,
      failed: `মেসেজ পাঠানো যায়নি। সরাসরি ${CONTACT_EMAIL}-এ মেইল করে দিন।`
    }
  },
  en: {
    name: 'Name',
    email: 'Email',
    topic: 'Topic',
    message: 'Message',
    messageHint: 'The more detail you give, the easier it is to reply. (5,000 characters max)',
    submit: 'Send message',
    sending: 'Sending…',
    honeypot: 'Leave this field empty',
    sentTitle: 'Message received',
    sentBody: (email: string) =>
      `The reply goes to ${email}. If it is urgent, email ${CONTACT_EMAIL} directly.`,
    again: 'Send another message',
    errors: {
      name: 'Add your name.',
      email: 'Add your email address.',
      emailFormat: 'That email address does not look right. Check it again.',
      message: 'The message cannot be empty.',
      messageTooShort: 'Add a little more detail, at least 10 characters.',
      messageTooLong: 'The message is longer than 5,000 characters.',
      rateLimited: `Too many messages from here just now. Try again in a few minutes, or email ${CONTACT_EMAIL}.`,
      failed: `The message did not send. Email ${CONTACT_EMAIL} instead and we will get it.`
    }
  }
} as const

export default function ContactForm({ locale = 'bn' }: ContactFormProps) {
  const t = copy[locale]
  const topicLabels = CONTACT_TOPIC_LABELS[locale]

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState<ContactTopic>('general')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [invalid, setInvalid] = useState<Field | null>(null)
  const [fieldError, setFieldError] = useState('')
  const [formError, setFormError] = useState('')
  const [sentTo, setSentTo] = useState('')

  const fields = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null)
  }
  const panel = useRef<HTMLDivElement>(null)
  const returning = useRef(false)

  /* Submitting removes the button the reader was standing on, and returning to
     the form removes the panel. Without this the caret lands on <body> and a
     keyboard or screen-reader user is dropped back at the top of the document.
     The refs are stable, so only a status change moves focus. */
  useEffect(() => {
    if (status === 'sent') {
      panel.current?.focus()
    } else if (returning.current) {
      returning.current = false
      fields.name.current?.focus()
    }
  }, [status])

  /** An error that names a field should also take the reader to it. */
  function fail(field: Field, text: string) {
    setInvalid(field)
    setFieldError(text)
    setFormError('')
    fields[field].current?.focus()
  }

  /** A field stops being wrong the moment the reader starts fixing it. */
  function clearError(field: Field) {
    if (invalid !== field) return
    setInvalid(null)
    setFieldError('')
  }

  function errorId(field: Field) {
    return invalid === field ? `contact-${field}-error` : undefined
  }

  function reset() {
    returning.current = true
    setName('')
    setEmail('')
    setTopic('general')
    setMessage('')
    setWebsite('')
    setInvalid(null)
    setFieldError('')
    setFormError('')
    setStatus('idle')
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return

    const trimmed = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim()
    }

    if (!trimmed.name) return fail('name', t.errors.name)
    if (!trimmed.email) return fail('email', t.errors.email)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed.email)) {
      return fail('email', t.errors.emailFormat)
    }
    if (!trimmed.message) return fail('message', t.errors.message)
    if (trimmed.message.length < MESSAGE_MIN) {
      return fail('message', t.errors.messageTooShort)
    }
    if (trimmed.message.length > CONTACT_FIELD_LIMITS.message) {
      return fail('message', t.errors.messageTooLong)
    }

    setInvalid(null)
    setFieldError('')
    setFormError('')
    setStatus('sending')

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    try {
      const res = await fetch(`${basePath}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...trimmed,
          topic,
          website
        })
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setStatus('idle')
        setFormError(body.error === 'rate_limited' ? t.errors.rateLimited : t.errors.failed)
        return
      }
      setSentTo(trimmed.email)
      setStatus('sent')
    } catch {
      setStatus('idle')
      setFormError(t.errors.failed)
    }
  }

  if (status === 'sent') {
    return (
      <div
        className="contact-form contact-form--sent"
        role="status"
        ref={panel}
        tabIndex={-1}
      >
        <p className="contact-form__sent-title">{t.sentTitle}</p>
        <p className="contact-form__sent-body">{t.sentBody(sentTo)}</p>
        <button type="button" className="contact-form__again" onClick={reset}>
          {t.again}
        </button>
      </div>
    )
  }

  const sending = status === 'sending'

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <div className="contact-form__grid">
        <div className="contact-form__field">
          <label className="contact-form__label" htmlFor="contact-name">
            {t.name}
          </label>
          <input
            id="contact-name"
            className="contact-form__input"
            name="name"
            type="text"
            autoComplete="name"
            ref={fields.name}
            aria-invalid={invalid === 'name' || undefined}
            aria-describedby={errorId('name')}
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              clearError('name')
            }}
            maxLength={CONTACT_FIELD_LIMITS.name}
            required
          />
          {invalid === 'name' && (
            <p className="contact-form__field-error" id="contact-name-error" role="alert">
              {fieldError}
            </p>
          )}
        </div>
        <div className="contact-form__field">
          <label className="contact-form__label" htmlFor="contact-email">
            {t.email}
          </label>
          <input
            id="contact-email"
            className="contact-form__input"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            ref={fields.email}
            aria-invalid={invalid === 'email' || undefined}
            aria-describedby={errorId('email')}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              clearError('email')
            }}
            maxLength={CONTACT_FIELD_LIMITS.email}
            required
          />
          {invalid === 'email' && (
            <p className="contact-form__field-error" id="contact-email-error" role="alert">
              {fieldError}
            </p>
          )}
        </div>
      </div>

      <div className="contact-form__field">
        <label className="contact-form__label" htmlFor="contact-topic">
          {t.topic}
        </label>
        <select
          id="contact-topic"
          className="contact-form__input contact-form__select"
          name="topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value as ContactTopic)}
        >
          {CONTACT_TOPIC_KEYS.map((value) => (
            <option key={value} value={value}>
              {topicLabels[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="contact-form__field">
        <label className="contact-form__label" htmlFor="contact-message">
          {t.message}
        </label>
        {/* No maxLength: a pasted 6,000-character message would be silently
            truncated, and the reader would send something they did not write.
            The length check below names the problem instead. */}
        <textarea
          id="contact-message"
          className="contact-form__input contact-form__textarea"
          name="message"
          rows={6}
          ref={fields.message}
          aria-invalid={invalid === 'message' || undefined}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            clearError('message')
          }}
          aria-describedby={
            invalid === 'message'
              ? 'contact-message-error contact-message-hint'
              : 'contact-message-hint'
          }
          required
        />
        {invalid === 'message' && (
          <p className="contact-form__field-error" id="contact-message-error" role="alert">
            {fieldError}
          </p>
        )}
        <p className="contact-form__hint" id="contact-message-hint">
          {t.messageHint}
        </p>
      </div>

      {/* inert removes this trap from focus and the accessibility tree while
          leaving it in the DOM for scripts that indiscriminately fill fields. */}
      <div className="contact-form__trap" inert>
        <label htmlFor="contact-website">{t.honeypot}</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <div className="contact-form__actions">
        {formError && (
          <p className="contact-form__error" role="alert">
            {formError}
          </p>
        )}
        <button type="submit" className="contact-form__submit" disabled={sending}>
          {sending ? t.sending : t.submit}
        </button>
      </div>
    </form>
  )
}
