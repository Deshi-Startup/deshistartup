export type Locale = 'en' | 'bn'
export type Sector = 'commerce' | 'circular' | 'agriculture' | 'manufacturing'
export type Place = 'anywhere' | 'dhaka' | 'gazipur' | 'bogura' | 'chattogram'
export interface IdeaSummary {
  id: string
  slug: string
  problemId: string
  kind: 'software' | 'service' | 'marketplace' | 'workflow'
  sector: Sector
  places: Place[]
  title: string
  summary: string
  customer: string
  steps: number
  search: string
}
