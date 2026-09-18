import { ecosystem } from '../../lib/ecosystem'
import { sourceDate } from '../../lib/ecosystem-model'
import { ideaSlug, kinds, places, sectors } from './model'
import IdeaCatalogue from './IdeaCatalogue'
import type { Heartbeat, IdeaSummary, Locale, Place, Sector } from './types'

export default function Ideas({ locale }: { locale: Locale }) {
  const dates = ecosystem.approaches.map(idea => idea.addedAt).sort()
  const newest = dates[dates.length - 1]
  // Nothing is newer than anything else in a collection added on one day, so
  // the badge stays off until the collection actually grows.
  const marksNew = new Set(dates).size > 1
  const summaries: IdeaSummary[] = ecosystem.approaches.map(idea => {
    const problem = ecosystem.problems.find(p => p.id === idea.problemId)!
    return {
      id: idea.id, slug: ideaSlug(idea.id), problemId: problem.id, kind: idea.kind,
      sector: problem.sector as Sector, places: problem.places as Place[],
      title: idea[locale].title, summary: idea[locale].summary, customer: problem[locale].customer, steps: idea[locale].steps.length,
      isNew: marksNew && idea.addedAt === newest,
      search: [idea.en.title, idea.bn.title, idea.en.summary, idea.bn.summary, problem.en.title, problem.bn.title, problem.en.customer, problem.bn.customer, ...Object.values(sectors[problem.sector as Sector]), ...Object.values(kinds[idea.kind]), ...problem.places.flatMap(place => Object.values(places[place as Place]))].join(' ')
    }
  })
  const heartbeat: Heartbeat = {
    sectors: new Set(ecosystem.problems.map(problem => problem.sector)).size,
    newest: sourceDate(newest, locale)
  }
  return <IdeaCatalogue locale={locale} ideas={summaries} heartbeat={heartbeat} />
}
