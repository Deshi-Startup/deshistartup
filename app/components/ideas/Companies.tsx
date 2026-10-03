import { allCompanies, companySummary, companySectors } from '../../lib/company-directory'
import { mediaSource } from '../../lib/media'
import type { Locale } from './types'
import CompanyCatalogue from './CompanyCatalogue'
export default function Companies({ locale }: { locale: Locale }) {
  const companies = allCompanies.map(o => {
    const { logoPath, ...company } = companySummary(o, locale)
    // The client needs the delivered image URL, not the source registry path.
    // Keeping both would expose non-serving /media URLs in the HTML payload.
    return { ...company, logo: logoPath ? mediaSource(logoPath) : null }
  }).sort((a,b) => a.name.localeCompare(b.name, 'en', {numeric:true}))
  return <CompanyCatalogue locale={locale} companies={companies} sectors={Object.entries(companySectors).filter(([id]) => companies.some(c => c.sector === id)).map(([id, label]) => ({id, label:label[locale]}))} />
}
