import {
  CONTACT_BODY_MAX_BYTES,
  CONTACT_FIELD_LIMITS,
  CONTACT_TOPIC_LABELS,
  isContactTopic
} from '../../app/lib/contact.ts'
import { isRecord, readBoundedText } from '../lib/request-body.ts'
import { logError } from '../lib/logging.ts'

/**
 * The contact endpoint accepts only same-origin JSON and always sends to the
 * runtime-secret destination. The request never supplies a recipient, so the
 * unrestricted send_email binding cannot turn this route into a mail relay.
 *
 * There is no CAPTCHA on purpose. The form uses a honeypot plus per-IP and
 * per-Cloudflare-location rate limits, while admission and byte-size checks
 * keep rejected traffic cheap before the body is parsed.
 */

const SENDER = 'contact@deshistartup.com'
const SENDER_NAME = 'Deshi Startup contact form'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function json(data: Record<string, unknown>, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'private, no-store' }
  })
}

function fieldText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/** Header fields must stay on one line; a name is the only free text that reaches one. */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

function isLoopback(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

/**
 * Browsers control Origin, so this blocks another site from distributing form
 * submissions through a visitor's browser. Loopback ports may differ because
 * Next proxies local /api requests to Wrangler.
 */
function isAllowedOrigin(request: Request): boolean {
  const value = request.headers.get('Origin')
  if (!value) return false

  try {
    const origin = new URL(value)
    const target = new URL(request.url)
    if (origin.origin === target.origin) return true
    return (
      origin.protocol === 'http:' &&
      target.protocol === 'http:' &&
      isLoopback(origin.hostname) &&
      isLoopback(target.hostname)
    )
  } catch {
    return false
  }
}

function isJsonRequest(request: Request): boolean {
  return (
    request.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase() ===
    'application/json'
  )
}

export async function POST(request: Request, env: CloudflareEnv): Promise<Response> {
  if (!isAllowedOrigin(request)) return json({ error: 'forbidden_origin' }, 403)
  if (!isJsonRequest(request)) return json({ error: 'unsupported_media_type' }, 415)

  const declaredLength = request.headers.get('Content-Length')
  if (declaredLength && Number(declaredLength) > CONTACT_BODY_MAX_BYTES) {
    return json({ error: 'body_too_large' }, 413)
  }

  if (!env.CONTACT_EMAIL || !env.CONTACT_INBOX) {
    logError('contact', 'configuration_unavailable')
    return json({ error: 'contact_unavailable' }, 503)
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const perIp = await env.CONTACT_IP_RATE.limit({ key: ip })
  if (!perIp.success) {
    return json({ error: 'rate_limited' }, 429)
  }

  const body = await readBoundedText(request, CONTACT_BODY_MAX_BYTES)
  if (!body.ok) {
    return json({ error: body.error }, body.error === 'body_too_large' ? 413 : 400)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(body.value)
  } catch {
    return json({ error: 'invalid_body' }, 400)
  }
  if (!isRecord(parsed)) return json({ error: 'invalid_body' }, 400)

  // Silent success for the honeypot. A script that learns which check failed
  // just fixes that check on the next run.
  if (fieldText(parsed.website)) return json({ ok: true })

  const rawName = fieldText(parsed.name)
  const email = fieldText(parsed.email)
  const message = fieldText(parsed.message)
  const name = singleLine(rawName)

  if (
    !name ||
    rawName.length > CONTACT_FIELD_LIMITS.name ||
    !EMAIL_PATTERN.test(email) ||
    email.length > CONTACT_FIELD_LIMITS.email ||
    message.length < 10 ||
    message.length > CONTACT_FIELD_LIMITS.message ||
    !isContactTopic(parsed.topic)
  ) {
    return json({ error: 'invalid_fields' }, 400)
  }

  const perLocation = await env.CONTACT_REGION_RATE.limit({ key: 'contact' })
  if (!perLocation.success) {
    return json({ error: 'rate_limited' }, 429)
  }

  const topicLabel = CONTACT_TOPIC_LABELS.en[parsed.topic]
  const emailBody = [
    `From: ${name} <${email}>`,
    `Topic: ${topicLabel}`,
    '',
    message,
    '',
    '--',
    'Reply to this message and the answer goes straight back to the sender.'
  ].join('\n')

  try {
    await env.CONTACT_EMAIL.send({
      from: { name: SENDER_NAME, email: SENDER },
      to: env.CONTACT_INBOX,
      replyTo: { name, email },
      subject: `[Contact] ${topicLabel} - ${name}`,
      text: emailBody
    })
  } catch (error) {
    logError('contact', 'send_failed', error)
    return json({ error: 'send_failed' }, 502)
  }

  return json({ ok: true })
}
