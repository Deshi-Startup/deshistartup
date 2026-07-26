export const SITE_URL = 'https://deshistartup.com'
export const SITE_NAME = 'Deshi Startup'
export const SITE_NAME_BN = 'দেশি স্টার্টআপ'
export const REPOSITORY_URL = 'https://github.com/Deshi-Startup/deshistartup'
export const CONTENT_LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`
export const INDEXNOW_KEY = 'e9aed4bed68feea1a2f4ffa5e9deddbc'

export const DEFAULT_DESCRIPTIONS = {
  bn: 'বাংলাদেশে স্টার্টআপ শুরু, চালু ও বড় করার ফ্রি, ওপেন সোর্স বাংলা গাইড: আইডিয়া যাচাই, রেজিস্ট্রেশন, কর/ভ্যাট, পেমেন্ট, গ্রাহক, টিম ও ফান্ডিং।',
  en: 'A free, open-source operating manual for building a startup in Bangladesh, covering validation, registration, tax, payments, customers, teams and funding.'
}

export function canonicalUrl(route = '/') {
  return `${SITE_URL}${route === '/' ? '/' : route}`
}
