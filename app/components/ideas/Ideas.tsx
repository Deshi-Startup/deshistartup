import { ecosystem } from '../../lib/ecosystem'
import { ideaSlug, kinds, places, sectors } from './model'
import IdeaCatalogue from './IdeaCatalogue'
import type { IdeaSummary, Locale, Place, Sector } from './types'

export default function Ideas({ locale }: { locale: Locale }) {
  const summaries: IdeaSummary[] = ecosystem.approaches.map(idea => {
    const problem = ecosystem.problems.find(p => p.id === idea.problemId)!
    return {
      id: idea.id, slug: ideaSlug(idea.id), problemId: problem.id, kind: idea.kind,
      sector: problem.sector as Sector, places: problem.places as Place[],
      title: idea[locale].title, summary: idea[locale].summary, customer: problem[locale].customer, steps: idea[locale].steps.length,
      search: [idea.en.title, idea.bn.title, idea.en.summary, idea.bn.summary, problem.en.title, problem.bn.title, problem.en.customer, problem.bn.customer, ...Object.values(sectors[problem.sector as Sector]), ...Object.values(kinds[idea.kind]), ...problem.places.flatMap(place => Object.values(places[place as Place]))].join(' ')
    }
  })
  return <IdeaCatalogue locale={locale} ideas={summaries} />
}
