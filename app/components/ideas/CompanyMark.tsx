import type { Locale, Organization } from '../../lib/ecosystem-types'
import { mediaSource } from '../../lib/media'
export default function CompanyMark({ company, locale }: { company: Organization; locale: Locale }) {
  return <span className="company-mark" aria-hidden="true">{company.logoPath ? <img src={mediaSource(company.logoPath)} alt="" role="presentation" width={64} height={64} loading="lazy" /> : company[locale].name.slice(0, 1)}</span>
}
