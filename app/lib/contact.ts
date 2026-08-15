export const CONTACT_FIELD_LIMITS = {
  name: 100,
  email: 200,
  message: 5000
} as const

// Large enough for the maximum fields in UTF-8, but small enough to reject an
// abusive request before JSON parsing can consume meaningful Worker memory.
export const CONTACT_BODY_MAX_BYTES = 24 * 1024

export const CONTACT_TOPIC_KEYS = [
  'general',
  'correction',
  'contribute',
  'partnership',
  'other'
] as const

export type ContactTopic = (typeof CONTACT_TOPIC_KEYS)[number]

export const CONTACT_TOPIC_LABELS = {
  bn: {
    general: 'সাধারণ প্রশ্ন',
    correction: 'ভুল ধরিয়ে দেওয়া বা মতামত',
    contribute: 'লেখালেখিতে যোগ দেওয়া',
    partnership: 'পার্টনারশিপ বা সংবাদমাধ্যম',
    other: 'অন্য কিছু'
  },
  en: {
    general: 'General question',
    correction: 'Correction or feedback',
    contribute: 'Writing and contributing',
    partnership: 'Partnership or press',
    other: 'Something else'
  }
} as const satisfies Record<'bn' | 'en', Record<ContactTopic, string>>

export function isContactTopic(value: unknown): value is ContactTopic {
  return typeof value === 'string' && CONTACT_TOPIC_KEYS.some((topic) => topic === value)
}
