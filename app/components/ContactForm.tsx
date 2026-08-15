'use client'

import { useRef, useState } from 'react'
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
type Field = 'name' | 'email' | 'message'

interface ContactFormProps {
  locale?: 'bn' | 'en'
}

const copy = {
  bn: {
    name: 'আপনার নাম',
    email: 'ইমেইল ঠিকানা',
    emailHint: 'উত্তর এই ঠিকানাতেই যাবে।',
    topic: 'কী নিয়ে লিখছেন',
    message: 'মেসেজ',
    messageHint: 'মেসেজটি ৫,০০০ অক্ষরের মধ্যে রাখুন। যত পরিষ্কার করে লিখবেন, উত্তর তত কাজে লাগবে।',
    submit: 'মেসেজ পাঠান',
    sending: 'পাঠানো হচ্ছে…',
    honeypot: 'এই ঘরটা খালি রাখুন',
    sentTitle: 'মেসেজ পৌঁছে গেছে',
    sentBody: (email: string) =>
      `উত্তর যাবে ${email} ঠিকানায়। জরুরি হলে সরাসরি ${CONTACT_EMAIL}-এ মেইল করুন।`,
    again: 'আরেকটা মেসেজ পাঠান',
    errors: {
      name: 'আপনার নামটা লিখুন।',
      email: 'ইমেইল ঠিকানাটা দিন, উত্তর পাঠাতে লাগবে।',
      emailFormat: 'ইমেইল ঠিকানাটা ঠিক দেখাচ্ছে না। আরেকবার দেখে নিন।',
      message: 'কী দরকার, সেটা লিখুন।',
      messageTooLong: 'মেসেজটি ৫,০০০ অক্ষরের মধ্যে রাখুন।',
      rateLimited: `একটু বেশি মেসেজ চলে এসেছে। কয়েক মিনিট পরে আবার চেষ্টা করুন, নয়তো ${CONTACT_EMAIL}-এ মেইল করুন।`,
      failed: `মেসেজটা পাঠানো গেল না। ${CONTACT_EMAIL} ঠিকানায় মেইল করে দিন, আমরা পেয়ে যাব।`
    }
  },
  en: {
    name: 'Your name',
    email: 'Email address',
    emailHint: 'The reply goes to this address.',
    topic: 'What is this about',
    message: 'Message',
    messageHint: 'Keep it within 5,000 characters. The clearer the detail, the more useful the reply.',
    submit: 'Send message',
    sending: 'Sending…',
    honeypot: 'Leave this field empty',
    sentTitle: 'Message sent',
    sentBody: (email: string) =>
      `The reply goes to ${email}. If it is urgent, email ${CONTACT_EMAIL} directly.`,
    again: 'Send another message',
    errors: {
      name: 'Add your name.',
      email: 'Add your email address so we can reply.',
      emailFormat: 'That email address does not look right. Check it once more.',
      message: 'Write what you need, so we know how to help.',
      messageTooLong: 'Keep the message within 5,000 characters.',
      rateLimited: `Too many messages from here just now. Try again in a few minutes, or email ${CONTACT_EMAIL}.`,
      failed: `The message did not send. Email ${CONTACT_EMAIL} instead and we will get it.`
    }
  }
} as const

export default function ContactForm({ locale = 'bn' }: ContactFormProps) {
  const t = copy[locale]
  const isEn = locale === 'en'
  const topicLabels = CONTACT_TOPIC_LABELS[locale]

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState<ContactTopic>('general')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')
  const [invalid, setInvalid] = useState<Field | null>(null)
  const [sentTo, setSentTo] = useState('')

  const fields = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null)
  }

  /** An error that names a field should also take the reader to it. */
  function fail(field: Field, text: string) {
    setInvalid(field)
    setError(text)
    fields[field].current?.focus()
  }

  function reset() {
    setName('')
    setEmail('')
    setTopic('general')
    setMessage('')
    setWebsite('')
    setError('')
    setInvalid(null)
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
    if (trimmed.message.length < 10) return fail('message', t.errors.message)
    if (trimmed.message.length > CONTACT_FIELD_LIMITS.message) {
      return fail('message', t.errors.messageTooLong)
    }

    setError('')
    setInvalid(null)
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
        setError(body.error === 'rate_limited' ? t.errors.rateLimited : t.errors.failed)
        return
      }
      setSentTo(trimmed.email)
      setStatus('sent')
    } catch {
      setStatus('idle')
      setError(t.errors.failed)
    }
  }

  if (status === 'sent') {
    return (
      <div className="contact-form contact-form--sent" role="status">
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
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={CONTACT_FIELD_LIMITS.name}
            required
          />
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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-describedby="contact-email-hint"
            maxLength={CONTACT_FIELD_LIMITS.email}
            required
          />
          <p className="contact-form__hint" id="contact-email-hint">
            {t.emailHint}
          </p>
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
        <textarea
          id="contact-message"
          className="contact-form__input contact-form__textarea"
          name="message"
          rows={6}
          ref={fields.message}
          aria-invalid={invalid === 'message' || undefined}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-describedby="contact-message-hint"
          maxLength={CONTACT_FIELD_LIMITS.message}
          required
        />
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

      {error && (
        <p className="contact-form__error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="contact-form__submit" disabled={sending}>
        {sending ? t.sending : t.submit}
      </button>
      <p className="contact-form__note">
        {isEn
          ? 'Your name, email, topic and message reach the Deshi Startup inbox, and are used only to reply.'
          : 'আপনার নাম, ইমেইল, বিষয় আর মেসেজ দেশি স্টার্টআপের ইনবক্সে যায়, আর উত্তর দেওয়া ছাড়া অন্য কিছুতে লাগে না।'}
      </p>
    </form>
  )
}
