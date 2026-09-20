import type { ConnectionProposal, IdeaProposal } from '../../app/lib/ecosystem-types.ts'
import { logError } from './logging.ts'

const REVIEW_URL = 'https://deshistartup.com/en/startup-ideas/review'

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}

/** Alert only after saving a new submission. Mail failure must never lose the work. */
export async function notifyEditorial(
  env: Pick<CloudflareEnv, 'CONTACT_EMAIL' | 'CONTACT_INBOX'>,
  db: D1Database,
  id: string,
  proposal: ConnectionProposal | IdeaProposal
): Promise<void> {
  try {
    if (!env.CONTACT_EMAIL || !env.CONTACT_INBOX) throw new Error('email_configuration_unavailable')
    const idea = 'kind' in proposal
    const company = !idea && !proposal.organization
      ? await db.prepare("SELECT name FROM organization_text WHERE organization_id = ? AND locale = 'en'").bind(proposal.organizationId).first<{ name: string }>()
      : null
    const title = (idea ? proposal.title : proposal.organization?.name || company?.name || 'Company')
      .replace(/[\u0000-\u001f\u007f\u2028\u2029]/g, ' ').trim().slice(0, 160)
    const subject = `[Deshi Startup] New ${idea ? 'idea' : 'company submission'}: ${title}`
    const message = `A new ${idea ? 'idea' : 'company submission'} is waiting for review.`
    await env.CONTACT_EMAIL.send({
      from: { name: 'Deshi Startup', email: 'contact@deshistartup.com' },
      // Send to the verified destination behind hello@, as the contact form does.
      // The public alias itself is not a verified Email Routing destination.
      to: env.CONTACT_INBOX,
      subject,
      text: `${message}\n\n${title}\n\nReview submissions: ${REVIEW_URL}\n\nReference: ${id}`,
      html: `<p>${message}</p><p><strong>${escapeHtml(title)}</strong></p><p><a href="${REVIEW_URL}">Review submissions</a></p><p>Reference: ${escapeHtml(id)}</p>`
    })
  } catch {
    // Provider errors can contain addresses or message text. Log only the internal ID.
    logError('ecosystem', 'editorial_alert_failed', undefined, { submissionId: id })
  }
}
