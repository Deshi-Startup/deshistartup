import type { IdeaSummary, Locale, Place, Sector } from './types'

export const sectors: Record<Sector, Record<Locale, string>> = {
  commerce: { en: 'Commerce', bn: 'কমার্স' },
  circular: { en: 'Circular economy', bn: 'পুনর্ব্যবহার' },
  agriculture: { en: 'Food & agriculture', bn: 'খাদ্য ও কৃষি' },
  manufacturing: { en: 'Manufacturing', bn: 'উৎপাদন' },
  health: { en: 'Healthcare', bn: 'স্বাস্থ্যসেবা' },
  water: { en: 'Water', bn: 'পানি' },
  energy: { en: 'Energy', bn: 'জ্বালানি' },
  technology: { en: 'Technology', bn: 'প্রযুক্তি' }
}
export const places: Record<Place, Record<Locale, string>> = {
  anywhere: { en: 'Across Bangladesh', bn: 'সারা বাংলাদেশ' },
  dhaka: { en: 'Dhaka', bn: 'ঢাকা' },
  gazipur: { en: 'Gazipur', bn: 'গাজীপুর' },
  bogura: { en: 'Bogura', bn: 'বগুড়া' },
  chattogram: { en: 'Chattogram', bn: 'চট্টগ্রাম' },
  khulna: { en: 'Khulna', bn: 'খুলনা' },
  rajshahi: { en: 'Rajshahi', bn: 'রাজশাহী' }
}
export const kinds = {
  software: { en: 'Software', bn: 'সফটওয়্যার' },
  service: { en: 'Service', bn: 'সেবা' },
  marketplace: { en: 'Marketplace', bn: 'মার্কেটপ্লেস' },
  workflow: { en: 'Manual process', bn: 'কাজের পদ্ধতি' }
}
export const kindLabel = (kind: IdeaSummary['kind'], locale: Locale) => kinds[kind][locale]
export const forLabel = (locale: Locale) => locale === 'en' ? 'For:' : 'যাঁদের জন্য:'
export const kindFilters = [
  { value: '', label: { en: 'All types', bn: 'সব ধরন' } },
  ...Object.entries(kinds).map(([value, label]) => ({ value, label }))
]

export { ideaPath, ideaSlug } from '../../lib/idea-routes.mjs'
export const localPath = (locale: Locale, path: string) => `${locale === 'en' ? '/en' : ''}${path}`
export const number = (n: number, locale: Locale) => n.toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-GB')
export type IdeaSort = 'recommended' | 'votes' | 'newest'
export interface Filters { q: string; sector: string; place: string; kind: string; saved: boolean; problem: string; sort: IdeaSort }
export const defaultFilters: Filters = { q: '', sector: '', place: '', kind: '', saved: false, problem: '', sort: 'recommended' }
const kindValues = Object.keys(kinds)
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
    sort: params.get('sort') === 'votes' ? 'votes' : params.get('sort') === 'newest' ? 'newest' : 'recommended',
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
  if (filters.sort !== 'recommended') params.set('sort', filters.sort)
  const query = params.toString()
  return query ? `?${query}` : ''
}
export function sortIdeas(ideas: IdeaSummary[], sort: IdeaSort, counts: Record<string, number> = {}) {
  // Stable ties preserve the editorial order. Popularity never changes the default.
  return [...ideas].sort((a, b) => sort === 'votes' ? (counts[b.id] || 0) - (counts[a.id] || 0)
    : sort === 'newest' ? b.addedAt.localeCompare(a.addedAt)
    : Number(b.editorialPick) - Number(a.editorialPick))
}
export function matchingIdeas(ideas: IdeaSummary[], filters: Filters, saved: string[]) {
  const words = filters.q.toLocaleLowerCase().normalize('NFC').trim().split(/\s+/).filter(Boolean)
  return ideas.filter(idea =>
    (!filters.problem || idea.problemId === filters.problem) &&
    (!filters.sector || idea.sector === filters.sector) &&
    (!filters.place || idea.places.includes(filters.place as Place) || idea.places.includes('anywhere')) &&
    (!filters.kind || idea.kind === filters.kind) &&
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
export interface IdeaDraft { title: string; solution: string; customer: string; problem: string; place: string; evidence: string; test: string; creditRequested: boolean; creditName: string }
export const emptyDraft: IdeaDraft = { title: '', solution: '', customer: '', problem: '', place: '', evidence: '', test: '', creditRequested: false, creditName: '' }
export const draftLimits: Record<Exclude<keyof IdeaDraft, 'creditRequested'>, number> = { title: 100, solution: 2000, customer: 240, problem: 2000, place: 120, evidence: 2000, test: 1000, creditName: 80 }
export function parseDraft(raw: string | null): IdeaDraft {
  try {
    const value = JSON.parse(raw || '{}')
    if (!value || typeof value !== 'object') return { ...emptyDraft }
    const fields = Object.fromEntries(Object.entries(draftLimits).map(([key, limit]) => [key, typeof value[key] === 'string' ? value[key].slice(0, limit) : '']))
    return { ...fields, creditRequested: value.creditRequested === true, creditName: value.creditRequested === true ? fields.creditName : '' } as IdeaDraft
  } catch { return { ...emptyDraft } }
}
export function draftMarkdown(draft: IdeaDraft, locale: Locale) {
  const en = locale === 'en'
  const heading: Record<Exclude<keyof IdeaDraft, 'creditRequested' | 'creditName'>, string> = en
    ? { title: 'Idea', solution: 'The idea', customer: 'Who it helps', problem: 'The problem', place: 'Suggested pilot location', evidence: 'Evidence and sources', test: 'First test' }
    : { title: 'আইডিয়া', solution: 'যা বানাতে চান', customer: 'কাদের কাজে লাগবে', problem: 'সমস্যা', place: 'কোথায় পরীক্ষা করবেন', evidence: 'তথ্য ও সোর্স', test: 'প্রথম পরীক্ষা' }
  return `# ${draft.title || heading.title}\n\n${en ? 'Private draft · Not submitted or validated.' : 'নিজের খসড়া। জমা দেওয়া বা যাচাই করা হয়নি।'}\n\n` +
    (Object.keys(heading) as (keyof typeof heading)[]).filter(key => key !== 'title' && draft[key].trim()).map(key => `## ${heading[key]}\n\n${draft[key].trim()}`).join('\n\n') + '\n'
}
