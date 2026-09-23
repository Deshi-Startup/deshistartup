import type { Locale, IdeaProposal, IdeaEditProposal, ConnectionProposal } from './ecosystem-types'

export interface Submission {
  id: string; revision: number; status: 'pending' | 'approved' | 'rejected';
  created_at: string; decided_at: string | null; decision_note: string | null;
  payload: IdeaProposal | IdeaEditProposal | ConnectionProposal; published: number;
  idea_id: string | null;
  editorial_close_note: string | null; editorial_closed_at: string | null;
  /** Only returned by the allowlisted reviewer API. */
  contactEmail?: string;
  notifications?: { kind: string; state: string }[];
}
export function submissionStatus(item: Pick<Submission, 'status' | 'published' | 'payload'> & { idea_id?: string | null; editorial_closed_at?: string | null }, locale: Locale): string {
  const en = locale === 'en'
  if ('kind' in item.payload && item.payload.kind === 'idea-edit') {
    if (item.published) return en ? 'Update published' : 'বদল প্রকাশিত'
    if (item.idea_id) return en ? 'Update currently unpublished' : 'বদল এখন প্রকাশিত নেই'
    if (item.status === 'approved') return en ? 'Accepted' : 'গৃহীত'
    return item.status === 'rejected' ? (en ? 'Declined' : 'গ্রহণ করা হয়নি') : (en ? 'Awaiting review' : 'পর্যালোচনার অপেক্ষায়')
  }
  if (item.published) return en ? 'Published' : 'প্রকাশিত'
  if (item.idea_id) return en ? 'Currently unpublished' : 'এখন প্রকাশিত নেই'
  if (item.editorial_closed_at) return en ? 'Not publishing' : 'প্রকাশ করা হচ্ছে না'
  if (item.status === 'approved') return 'kind' in item.payload
    ? (en ? 'Accepted for editing' : 'সম্পাদনার জন্য গৃহীত')
    : (en ? 'Approved, awaiting publication' : 'অনুমোদিত, প্রকাশের অপেক্ষায়')
  return item.status === 'rejected' ? (en ? 'Declined' : 'গ্রহণ করা হয়নি') : (en ? 'Awaiting review' : 'পর্যালোচনার অপেক্ষায়')
}
export const submissionDate = (value: string, locale: Locale) => new Date(value).toLocaleDateString(locale === 'en' ? 'en-GB' : 'bn-BD', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' })
export const submissionPath = (locale: Locale, id = '') => `${locale === 'en' ? '/en' : ''}/startup-ideas/submissions${id ? `?submission=${encodeURIComponent(id)}` : ''}`
