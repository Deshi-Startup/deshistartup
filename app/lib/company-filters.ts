export interface CompanyFilters { q: string; type: string; sector: string; ds50: boolean; caseStudy: boolean }
export const emptyCompanyFilters: CompanyFilters = { q:'', type:'', sector:'', ds50:false, caseStudy:false }
export function readCompanyFilters(search: string): CompanyFilters {
  const p = new URLSearchParams(search)
  return { q:(p.get('q') || '').slice(0,120), type:p.get('type') || '', sector:p.get('sector') || '', ds50:p.get('ds50') === '1', caseStudy:p.get('case') === '1' }
}
export function companyFilterQuery(f: CompanyFilters) {
  const p = new URLSearchParams()
  if(f.q) p.set('q', f.q)
  if(f.type) p.set('type', f.type)
  if(f.sector) p.set('sector', f.sector)
  if(f.ds50) p.set('ds50','1')
  if(f.caseStudy) p.set('case','1')
  return p.size ? `?${p}` : ''
}
export function matchesCompany(company: { name:string; search:string; website:string; roles:string[]; sector:string; startup50:boolean; caseStudy:string|null }, f:CompanyFilters) {
  const words = f.q.toLocaleLowerCase().normalize('NFC').trim().split(/\s+/).filter(Boolean)
  return (!f.type || company.roles.includes(f.type)) && (!f.sector || company.sector === f.sector) && (!f.ds50 || company.startup50) && (!f.caseStudy || !!company.caseStudy) && words.every(w => `${company.name} ${company.search} ${company.website}`.toLocaleLowerCase().normalize('NFC').includes(w))
}
