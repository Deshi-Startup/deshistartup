import type { Locale, IdeaProposal, ConnectionProposal } from './ecosystem-types'

export interface Submission {
  id: string; revision: number; status: 'pending' | 'approved' | 'rejected';
  created_at: string; decided_at: string | null; decision_note: string | null;
  payload: IdeaProposal | ConnectionProposal; published: number;
  idea_id: string | null;
  notifications?: { kind: string; state: string }[];
}
export function submissionStatus(item: Pick<Submission, 'status' | 'published' | 'payload'> & { idea_id?: string | null }, locale: Locale): string {
  const en = locale === 'en'
  if (item.published) return en ? 'Published' : 'প্রকাশিত'
  if (item.idea_id) return en ? 'Currently unpublished' : 'এখন প্রকাশিত নেই'
  if (item.status === 'approved') return 'kind' in item.payload
    ? (en ? 'Accepted for editing' : 'সম্পাদনার জন্য গৃহীত')
    : (en ? 'Approved, awaiting publication' : 'অনুমোদিত, প্রকাশের অপেক্ষায়')
  return item.status === 'rejected' ? (en ? 'Declined' : 'গ্রহণ করা হয়নি') : (en ? 'Awaiting review' : 'পর্যালোচনার অপেক্ষায়')
}
export const submissionDate = (value: string, locale: Locale) => new Date(value).toLocaleDateString(locale === 'en' ? 'en-GB' : 'bn-BD', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' })
export const submissionPath = (locale: Locale, id = '') => `${locale === 'en' ? '/en' : ''}/startup-ideas/submissions${id ? `?submission=${encodeURIComponent(id)}` : ''}`
