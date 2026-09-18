import type { IdeaSummary, Locale, Place, Sector } from './types'

export const sectors: Record<Sector, Record<Locale, string>> = {
  commerce: { en: 'Commerce', bn: 'কমার্স' },
  circular: { en: 'Circular economy', bn: 'পুনর্ব্যবহার' },
  agriculture: { en: 'Food & agriculture', bn: 'খাদ্য ও কৃষি' },
  manufacturing: { en: 'Manufacturing', bn: 'উৎপাদন' }
}
export const places: Record<Place, Record<Locale, string>> = {
  anywhere: { en: 'Across Bangladesh', bn: 'সারা বাংলাদেশ' },
  dhaka: { en: 'Dhaka', bn: 'ঢাকা' },
  gazipur: { en: 'Gazipur', bn: 'গাজীপুর' },
  bogura: { en: 'Bogura', bn: 'বগুড়া' },
  chattogram: { en: 'Chattogram', bn: 'চট্টগ্রাম' }
}
export const kinds = {
  software: { en: 'Software', bn: 'সফটওয়্যার' },
  service: { en: 'Service', bn: 'সেবা' },
  marketplace: { en: 'Marketplace', bn: 'মার্কেটপ্লেস' },
  workflow: { en: 'Workflow', bn: 'কাজের পদ্ধতি' }
}
// Service and workflow ideas can be started with a phone and a notebook.
export const startsWithoutCode = (kind: IdeaSummary['kind']) => kind === 'service' || kind === 'workflow'
export const kindLabel = (kind: IdeaSummary['kind'], locale: Locale) =>
  startsWithoutCode(kind) ? (locale === 'en' ? 'No code needed' : 'কোড লাগবে না') : kinds[kind][locale]
export const forLabel = (locale: Locale) => locale === 'en' ? 'For:' : 'যাঁদের জন্য:'
// One honest choice for readers who do not code, beside the two build shapes.
export const kindFilters: { value: string; label: Record<Locale, string> }[] = [
  { value: '', label: { en: 'All ideas', bn: 'সব আইডিয়া' } },
  { value: 'nocode', label: { en: 'Start without code', bn: 'কোড ছাড়াই শুরু' } },
  { value: 'software', label: { en: 'Software', bn: 'সফটওয়্যার' } },
  { value: 'marketplace', label: { en: 'Marketplace', bn: 'মার্কেটপ্লেস' } }
]

export { ideaPath, ideaSlug } from '../../lib/idea-routes.mjs'
export const localPath = (locale: Locale, path: string) => `${locale === 'en' ? '/en' : ''}${path}`
export const number = (n: number, locale: Locale) => n.toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-GB')
export interface Filters { q: string; sector: string; place: string; kind: string; saved: boolean; problem: string }
export const defaultFilters: Filters = { q: '', sector: '', place: '', kind: '', saved: false, problem: '' }
const kindValues = ['nocode', ...Object.keys(kinds)]
export function parseFilters(search: string): Filters {
  const params = new URLSearchParams(search)
  const sector = params.get('sector') || ''
  const place = params.get('place') || ''
  return {
    q: (params.get('q') || '').slice(0, 120),
    sector: Object.hasOwn(sectors, sector) ? sector : '',
    place: Object.hasOwn(places, place) ? place : '',
    kind: kindValues.includes(params.get('kind') || '') ? params.get('kind')! : '',
    saved: params.get('view') === 'saved',
    problem: /^[a-z0-9-]{1,80}$/.test(params.get('problem') || '') ? params.get('problem')! : ''
  }
}
export function filterQuery(filters: Filters) {
  const params = new URLSearchParams()
  if (filters.q.trim()) params.set('q', filters.q.trim())
  if (filters.sector) params.set('sector', filters.sector)
  if (filters.place) params.set('place', filters.place)
  if (filters.kind) params.set('kind', filters.kind)
  if (filters.saved) params.set('view', 'saved')
  if (filters.problem) params.set('problem', filters.problem)
  const query = params.toString()
  return query ? `?${query}` : ''
}
export function matchingIdeas(ideas: IdeaSummary[], filters: Filters, saved: string[]) {
  const words = filters.q.toLocaleLowerCase().normalize('NFC').trim().split(/\s+/).filter(Boolean)
  return ideas.filter(idea =>
    (!filters.problem || idea.problemId === filters.problem) &&
    (!filters.sector || idea.sector === filters.sector) &&
    (!filters.place || idea.places.includes(filters.place as Place) || idea.places.includes('anywhere')) &&
    (!filters.kind || (filters.kind === 'nocode' ? startsWithoutCode(idea.kind) : idea.kind === filters.kind)) &&
    (!filters.saved || saved.includes(idea.id)) &&
    words.every(word => idea.search.toLocaleLowerCase().normalize('NFC').includes(word))
  )
}

export const LEGACY_SAVED_KEY = 'deshi-startup:ideas:saved:v1'
export const SAVED_KEY = 'deshi-startup:ideas:saved:v2'
export const DRAFT_KEY = 'deshi-startup:ideas:draft:v1'
export function parseSaved(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw || '[]')
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && /^[a-z0-9-]{1,80}$/.test(id)))].slice(0, 300) : []
  } catch { return [] }
}
export interface SavedIdea { id: string; problemId: string }
export function readSaved(storage: Pick<Storage, 'getItem' | 'setItem'>, ideas: SavedIdea[]): string[] {
  const current = storage.getItem(SAVED_KEY)
  if (current !== null) return parseSaved(current)
  const legacy = storage.getItem(LEGACY_SAVED_KEY)
  if (legacy === null) return []
  const migrated = [...new Set(parseSaved(legacy).flatMap(id => {
    const related = ideas.filter(idea => idea.problemId === id)
    return related.length ? related.map(idea => idea.id) : [id]
  }))]
  // Write once, retaining the old value as a backup. An empty v2 list is final.
  storage.setItem(SAVED_KEY, JSON.stringify(migrated))
  return migrated
}
export const STEPS_KEY = 'deshi-startup:ideas:steps:v1'
export type StepProgress = Record<string, number[]>
/** Ticked steps are stored per idea as step numbers, so re-edited steps cannot silently inherit a tick. */
export function parseSteps(raw: string | null): StepProgress {
  try {
    const value: unknown = JSON.parse(raw || '{}')
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .filter(([id]) => /^[a-z0-9-]{1,80}$/.test(id))
      .slice(0, 300)
      .map(([id, steps]) => [id, Array.isArray(steps)
        ? [...new Set(steps.filter((n): n is number => Number.isInteger(n) && n >= 0 && n < 20))].sort((x, y) => x - y)
        : []])
      .filter(([, steps]) => (steps as number[]).length))
  } catch { return {} }
}
export const stepsDone = (progress: StepProgress, id: string, total: number) => (progress[id] || []).filter(step => step < total).length
export function toggleStep(storage: Pick<Storage, 'getItem' | 'setItem'>, id: string, step: number): StepProgress {
  const current = parseSteps(storage.getItem(STEPS_KEY))
  const ticked = current[id] || []
  const next = { ...current, [id]: ticked.includes(step) ? ticked.filter(item => item !== step) : [...ticked, step].sort((x, y) => x - y) }
  if (!next[id].length) delete next[id]
  storage.setItem(STEPS_KEY, JSON.stringify(next))
  return next
}
export function stepProgressLabel(done: number, total: number, locale: Locale) {
  if (!done) return locale === 'en' ? 'Not started' : 'এখনো শুরু হয়নি'
  if (done >= total) return locale === 'en' ? 'All steps done' : 'সব ধাপ শেষ'
  return locale === 'en' ? `${done} of ${total} steps done` : `${number(total, locale)}টির মধ্যে ${number(done, locale)}টি ধাপ শেষ`
}

export interface IdeaDraft { title: string; solution: string; customer: string; problem: string; place: string; evidence: string; test: string }
export const emptyDraft: IdeaDraft = { title: '', solution: '', customer: '', problem: '', place: '', evidence: '', test: '' }
export const draftLimits: Record<keyof IdeaDraft, number> = { title: 100, solution: 2000, customer: 240, problem: 2000, place: 120, evidence: 2000, test: 1000 }
export function parseDraft(raw: string | null): IdeaDraft {
  try {
    const value = JSON.parse(raw || '{}')
    if (!value || typeof value !== 'object') return { ...emptyDraft }
    return Object.fromEntries(Object.entries(draftLimits).map(([key, limit]) => [key, typeof value[key] === 'string' ? value[key].slice(0, limit) : ''])) as unknown as IdeaDraft
  } catch { return { ...emptyDraft } }
}
export function draftMarkdown(draft: IdeaDraft, locale: Locale) {
  const en = locale === 'en'
  const heading: Record<keyof IdeaDraft, string> = en
    ? { title: 'Idea', solution: 'The idea', customer: 'Who it helps', problem: 'The problem', place: 'Suggested pilot location', evidence: 'Evidence and sources', test: 'First test' }
    : { title: 'আইডিয়া', solution: 'যা বানাতে চান', customer: 'কাদের কাজে লাগবে', problem: 'সমস্যা', place: 'কোথায় পরীক্ষা করবেন', evidence: 'তথ্য ও সোর্স', test: 'প্রথম পরীক্ষা' }
  return `# ${draft.title || heading.title}\n\n${en ? 'Private draft · Not submitted or validated.' : 'নিজের খসড়া। জমা দেওয়া বা যাচাই করা হয়নি।'}\n\n` +
    (Object.keys(heading) as (keyof IdeaDraft)[]).filter(key => key !== 'title' && draft[key].trim()).map(key => `## ${heading[key]}\n\n${draft[key].trim()}`).join('\n\n') + '\n'
}
