export type Locale = 'en' | 'bn'
export type Sector = 'commerce' | 'circular' | 'agriculture' | 'manufacturing' | 'health' | 'water' | 'energy'
export type Place = 'anywhere' | 'dhaka' | 'gazipur' | 'bogura' | 'chattogram' | 'khulna' | 'rajshahi'
export interface IdeaSummary {
  id: string
  slug: string
  problemId: string
  kind: 'software' | 'service' | 'marketplace' | 'workflow'
  sector: Sector
  places: Place[]
  title: string
  summary: string
  search: string
}
