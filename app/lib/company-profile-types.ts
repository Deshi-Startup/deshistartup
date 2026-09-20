import type { Localized } from './ecosystem-types'
import type { IdentitySource } from './shared-identity'
export interface CompanySection {
  id: string; title: Localized<string>; body: Localized<string>; sources: IdentitySource[];
  links: { label: Localized<string>; url: string }[]
}
export interface CompanyProfileContent {
  sections: CompanySection[];
  contact: { address: Localized<string> | null; email: string | null; phone: string | null; sources: IdentitySource[] };
}
