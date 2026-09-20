import startup50 from '../../data/startup-50.json'
import investors from '../../data/directory/investors.json'
import sourceTitles from '../../data/startup-50-sources.json'
import contentIndex from '../generated/content-index.json'
import { ecosystem, identities } from './ecosystem'
import { startupCaseStudyRoutes } from './startup-case-studies.mjs'
import type { Organization, Locale } from './ecosystem-types'

// Editorial research stays with its original owner; resolve it through shared identity.
export function companyContext(company: Organization, locale: Locale) {
  const startup = startup50.entries.find(e => identities.organization('startup-50', e.slug)?.id === company.id)
  const investor = investors.find(e => identities.organization('directory', `investors/${e.id}`)?.id === company.id)
  const caseStudy = startup ? startupCaseStudyRoutes(contentIndex, locale).get(startup.slug) : null
  return { startup, investor, caseStudy: caseStudy || company.references.filter(r => r.kind === 'case-study').map(r => `${locale === 'en' ? '/en' : ''}/case-studies/${r.target}`)[0] || null }
}
export function companySummary(company: Organization, locale: Locale) {
  const { startup, investor, caseStudy } = companyContext(company, locale)
  const description = startup?.description[locale] || company[locale].description.split(/(?<=[.!?।])\s+/)[0]
  return { id: company.id, slug: company.slug, name: company[locale].name, description, roles: company.roles,
    website: company.website, logoPath: company.logoPath, sector: startup?.sectorKey || (investor ? 'investment' : ''),
    sectorLabel: startup?.sector[locale] || investor?.[locale].type || '', startup50: !!startup, caseStudy,
    search: [company.en.name, company.bn.name, company.en.description, company.bn.description, ...company.aliases, startup?.sector.en, startup?.sector.bn].filter(Boolean).join(' ') }
}
export const companySectors = { ...startup50.sectorGroups, investment: { en: 'Investment', bn: 'বিনিয়োগ' } }
export const companyResearchDate = startup50.lastResearched
export const companyEdition = startup50.edition
export const companySourceTitle = (url: string) => (sourceTitles as Record<string, string>)[url] || new URL(url).hostname.replace(/^www\./, '')
export const allCompanies = ecosystem.organizations
