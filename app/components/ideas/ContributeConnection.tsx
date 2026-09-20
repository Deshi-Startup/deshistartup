import { ecosystem } from '../../lib/ecosystem'
import type { Locale } from './types'
import IdeaShell from './IdeaShell'
import ConnectionForm from './ConnectionForm'
export default function ContributeConnection({ locale }: { locale: Locale }) {
  const companies = ecosystem.organizations.map(o => ({ id: o.id, name: o[locale].name, website: o.website, description: o[locale].description, search: [o.en.name, o.bn.name, o.website, ...o.aliases].join(' ').toLocaleLowerCase() }))
  return <IdeaShell locale={locale}><ConnectionForm locale={locale} companies={companies} problems={ecosystem.problems.map(p => ({ id: p.id, slug: p.slug, title: p[locale].title }))} /></IdeaShell>
}
