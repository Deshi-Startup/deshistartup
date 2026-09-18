import type { Locale, OrganizationRole, WorkStage } from './ecosystem-types'
export const companyPath = (locale: Locale, slug = '') => `${locale === 'en' ? '/en' : ''}/companies${slug ? `/${slug}` : ''}`
export const organizationRoles: Record<OrganizationRole, Record<Locale, string>> = {
  startup: { en: 'Startup', bn: 'স্টার্টআপ' }, investor: { en: 'Investor', bn: 'বিনিয়োগকারী' },
  accelerator: { en: 'Accelerator', bn: 'অ্যাক্সিলারেটর' }, incubator: { en: 'Incubator', bn: 'ইনকিউবেটর' },
  community: { en: 'Community', bn: 'কমিউনিটি' }
}
export const workStages: Record<WorkStage, Record<Locale, string>> = {
  research: { en: 'Research', bn: 'গবেষণা' }, prototype: { en: 'Testing an early version', bn: 'প্রোটোটাইপ বা ছোট পরীক্ষা' }, live: { en: 'Up and running', bn: 'চালু আছে' }
}
export const domain = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url } }

export const sourceDate = (value: string, locale: Locale) => {
  const date = new Date(value.replace(/^Accessed /, ''))
  if (Number.isNaN(date.valueOf())) return value
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
}
