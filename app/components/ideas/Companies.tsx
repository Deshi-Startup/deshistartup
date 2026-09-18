import { ecosystem } from '../../lib/ecosystem'
import { mediaSource } from '../../lib/media'
import type { Locale } from './types'
import CompanyCatalogue from './CompanyCatalogue'
export default function Companies({ locale }: { locale: Locale }) {
  const companies = ecosystem.organizations.map(o => ({ id: o.id, slug: o.slug, name: o[locale].name, description: o[locale].description, roles: o.roles, website: o.website, logo: o.logoPath ? mediaSource(o.logoPath) : null, search: [o.en.name, o.bn.name, o.en.description, o.bn.description, o.website, ...o.aliases].join(' ').toLocaleLowerCase() }))
  return <CompanyCatalogue locale={locale} companies={companies} />
}
