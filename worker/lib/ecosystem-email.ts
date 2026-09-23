import type { ConnectionProposal, IdeaProposal, IdeaEditProposal } from '../../app/lib/ecosystem-types.ts'
import { submissionPath } from '../../app/lib/submission-status.ts'
import { ideaSlug } from '../../app/lib/idea-routes.mjs'
import { logError } from './logging.ts'

type EmailEnvironment = Pick<CloudflareEnv, 'CONTACT_EMAIL' | 'CONTACT_INBOX'> & { IDEA_DECISION_EMAILS?: string }
export const decisionEmailsEnabled = (env: EmailEnvironment) => env.IDEA_DECISION_EMAILS === 'true' && !!env.CONTACT_EMAIL
const origin = 'https://deshistartup.com'
const cleanTitle = (value: string) => value.replace(/[\u0000-\u001f\u007f\u2028\u2029]/g, ' ').trim().slice(0, 160)
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}
function send(env: EmailEnvironment, to: string, subject: string, paragraphs: string[], url: string, label: string) {
  if (!env.CONTACT_EMAIL || !to) throw new Error('email_configuration_unavailable')
  return env.CONTACT_EMAIL.send({
    from: { name: 'Deshi Startup', email: 'contact@deshistartup.com' }, to,
    replyTo: 'hello@deshistartup.com', subject,
    text: `${paragraphs.join('\n\n')}\n\n${label}: ${url}`,
    html: `${paragraphs.map(p => `<p style="white-space:pre-wrap">${escapeHtml(p)}</p>`).join('')}<p><a href="${escapeHtml(url)}">${escapeHtml(label)}</a></p>`
  })
}
export async function notifyEditorial(env: EmailEnvironment, db: D1Database, id: string, proposal: ConnectionProposal | IdeaProposal | IdeaEditProposal) {
  const idea = 'kind' in proposal
  const update = idea && proposal.kind === 'idea-edit'
  const company = !idea && !proposal.organization
    ? await db.prepare("SELECT name FROM organization_text WHERE organization_id = ? AND locale = 'en'").bind(proposal.organizationId).first<{ name: string }>() : null
  const title = cleanTitle(idea ? proposal.title : proposal.organization?.name || company?.name || 'Company')
  return send(env, env.CONTACT_INBOX, `[Deshi Startup] New ${update ? 'idea edit' : idea ? 'idea' : 'company submission'}: ${title}`,
    [`A new ${update ? 'idea edit' : idea ? 'idea' : 'company submission'} is waiting for review.`, title],
    `${origin}/en/startup-ideas/review?submission=${encodeURIComponent(id)}`, 'Review submission')
}
interface Notification {
  submission_id: string; kind: 'editorial' | 'decision' | 'published' | 'closed'; attempts: number;
  payload_json: string; status: string; decision_note: string | null; editorial_close_note: string | null; email: string | null; approach_id: string | null; published: number
}
async function sendNotification(env: EmailEnvironment, db: D1Database, row: Notification) {
  const p: IdeaProposal | IdeaEditProposal = JSON.parse(row.payload_json)
  if (row.kind === 'editorial') return notifyEditorial(env, db, row.submission_id, p)
  // A queued publication notice may outlive a rollback. Keep the job recoverable
  // through the reviewer retry action, but never send a link that is no longer live.
  if (row.kind === 'published' && !row.published) throw Object.assign(new Error('publication_unavailable'), { code: 'publication_unavailable' })
  if (!decisionEmailsEnabled(env) || !row.email) throw new Error('email_configuration_unavailable')
  const en = p.locale === 'en', published = row.kind === 'published', closed = row.kind === 'closed', accepted = row.status === 'approved'
  const update = p.kind === 'idea-edit'
  const status = update
    ? published ? (en ? 'Your idea edit is published' : 'আইডিয়ার বদল প্রকাশিত হয়েছে')
      : accepted ? (en ? 'Your idea edit was accepted' : 'আইডিয়ার বদল গ্রহণ করা হয়েছে')
        : (en ? 'An update on your idea edit' : 'আইডিয়ার বদল নিয়ে আমাদের সিদ্ধান্ত')
    : published ? (en ? 'Your idea is published' : 'আপনার আইডিয়া প্রকাশিত হয়েছে') : closed
      ? (en ? 'We won’t publish your idea' : 'আপনার আইডিয়াটি প্রকাশ করব না') : accepted
      ? (en ? 'Your idea was accepted for editing' : 'আপনার আইডিয়া সম্পাদনার জন্য গ্রহণ করেছি')
      : (en ? 'An update on your idea' : 'আপনার আইডিয়া নিয়ে আমাদের সিদ্ধান্ত')
  const explanation = update
    ? published ? (en ? 'The reviewed update is now on the idea page.' : 'যাচাই করা বদলটি এখন আইডিয়ার পাতায় আছে।')
      : accepted ? (en ? 'Our editors will prepare the update in English and Bangla before publication.' : 'প্রকাশের আগে সম্পাদকীয় দল বদলটি বাংলা ও ইংরেজিতে গুছিয়ে নেবে।')
        : (en ? 'We did not accept this edit. Here is the reviewer’s note.' : 'বদলটি আমরা নিচ্ছি না। নিচে পর্যালোচকের মন্তব্য আছে।')
    : published ? (en ? 'Your idea is now in the collection.' : 'আইডিয়াটি এখন তালিকায় আছে।') : closed
      ? (en ? 'After further research, we’ve decided not to publish it. Here’s why.' : 'আরও খোঁজ নিয়ে আমরা আইডিয়াটি প্রকাশ না করার সিদ্ধান্ত নিয়েছি। কারণটি নিচে লিখেছি।') : accepted
      ? (en ? 'Accepted ideas are edited in English and Bangla before publication.' : 'প্রকাশের আগে গ্রহণ করা আইডিয়া বাংলা ও ইংরেজিতে সম্পাদনা করা হয়।')
      : (en ? 'We haven’t accepted this idea for the collection. Here is the reviewer’s note.' : 'আইডিয়াটি এবার তালিকায় নিচ্ছি না। পর্যালোচকের মন্তব্য নিচে দেওয়া আছে।')
  const url = published && row.approach_id ? `${origin}${en ? '/en' : ''}/startup-ideas/${ideaSlug(row.approach_id)}` : `${origin}${submissionPath(p.locale, row.submission_id)}`
  return send(env, row.email, `[Deshi Startup] ${status}: ${cleanTitle(p.title)}`,
    [status, cleanTitle(p.title), explanation, ...(closed && row.editorial_close_note ? [row.editorial_close_note] : !published && row.decision_note ? [row.decision_note] : [])], url,
    published ? (en ? 'View idea' : 'আইডিয়া দেখুন') : (en ? 'View your submission' : 'জমা দেওয়া আইডিয়া দেখুন'))
}

// Bounded D1 outbox: commits with the submission/decision, then delivers outside the response.
// A lease prevents concurrent workers from sending the same event. A crash after provider acceptance
// can still duplicate an email; provider acceptance is not proof of inbox delivery.
export async function deliverNotifications(env: EmailEnvironment & { ECOSYSTEM_DB?: D1Database }, at = new Date().toISOString(), id?: string) {
  const db = env.ECOSYSTEM_DB
  if (!db) return
  const rows = await db.prepare(`SELECT submission_id, kind FROM submission_notifications
    WHERE state IN ('pending','sending') AND available_at <= ? ${id ? 'AND submission_id = ?' : ''}
    ORDER BY available_at LIMIT 20`).bind(...(id ? [at, id] : [at])).all<{ submission_id: string; kind: string }>()
  for (const event of rows.results) {
    const lease = crypto.randomUUID()
    const expires = new Date(Date.parse(at) + 5 * 60_000).toISOString()
    const claim = await db.prepare(`UPDATE submission_notifications SET state = 'sending', attempts = attempts + 1, lease = ?, available_at = ?
      WHERE submission_id = ? AND kind = ? AND state IN ('pending','sending') AND available_at <= ? RETURNING attempts`).bind(lease, expires, event.submission_id, event.kind, at).first<{ attempts: number }>()
    if (!claim) continue
    if (claim.attempts > 5) {
      await db.prepare("UPDATE submission_notifications SET state = 'failed', lease = NULL, error_code = 'retry_limit' WHERE submission_id = ? AND kind = ? AND lease = ?").bind(event.submission_id, event.kind, lease).run()
      continue
    }
    try {
      const row = await db.prepare(`SELECT s.payload_json, s.status, s.decision_note, x.note AS editorial_close_note, c.email, COALESCE(l.approach_id, e.approach_id) AS approach_id,
        CASE WHEN e.submission_id IS NOT NULL THEN EXISTS (
          SELECT 1 FROM publication p JOIN releases r ON r.id = p.release_id
          JOIN releases linked ON linked.id = e.release_id, json_each(r.snapshot_json, '$.approaches') j
          WHERE (r.id = linked.id OR r.created_at > linked.created_at) AND json_extract(j.value, '$.id') = e.approach_id
        ) ELSE EXISTS (SELECT 1 FROM publication p JOIN releases r ON r.id = p.release_id,
          json_each(r.snapshot_json, '$.approaches') j WHERE json_extract(j.value, '$.id') = l.approach_id) END AS published
        FROM submissions s LEFT JOIN submission_contacts c ON c.submission_id = s.id
        LEFT JOIN idea_submission_links l ON l.submission_id = s.id
        LEFT JOIN idea_edit_publications e ON e.submission_id = s.id
        LEFT JOIN idea_editorial_closures x ON x.submission_id = s.id WHERE s.id = ?`).bind(event.submission_id).first<Omit<Notification, 'submission_id' | 'kind' | 'attempts'>>()
      if (!row) throw new Error('submission_unavailable')
      await sendNotification(env, db, { ...row, ...event, kind: event.kind as Notification['kind'], attempts: claim.attempts })
      await db.prepare("UPDATE submission_notifications SET state = 'sent', sent_at = ?, lease = NULL, error_code = NULL WHERE submission_id = ? AND kind = ? AND lease = ?")
        .bind(at, event.submission_id, event.kind, lease).run()
    } catch (error) {
      const rawCode = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
      const code = ['E_SENDER_NOT_VERIFIED','E_RECIPIENT_NOT_ALLOWED','E_RECIPIENT_SUPPRESSED','E_SENDER_DOMAIN_NOT_AVAILABLE','E_VALIDATION_ERROR','E_DAILY_LIMIT_EXCEEDED','E_RATE_LIMIT_EXCEEDED','publication_unavailable'].includes(rawCode) ? rawCode : 'email_send_failed'
      const permanent = ['E_SENDER_NOT_VERIFIED','E_RECIPIENT_NOT_ALLOWED','E_RECIPIENT_SUPPRESSED','E_SENDER_DOMAIN_NOT_AVAILABLE','E_VALIDATION_ERROR','publication_unavailable'].includes(code)
      const failed = permanent || claim.attempts >= 5
      const due = new Date(Date.parse(at) + [1, 5, 30, 120, 720][Math.min(claim.attempts - 1, 4)] * 60_000).toISOString()
      await db.prepare('UPDATE submission_notifications SET state = ?, available_at = ?, lease = NULL, error_code = ? WHERE submission_id = ? AND kind = ? AND lease = ?')
        .bind(failed ? 'failed' : 'pending', due, code, event.submission_id, event.kind, lease).run()
      logError('ecosystem', 'notification_failed', undefined, { submissionId: event.submission_id, kind: event.kind, code })
    }
  }
}
