const url = value => { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password } catch { return false } }
const localized = value => value && ['en', 'bn'].every(l => typeof value[l] === 'string' && value[l].trim())
const date = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value))
export function validateCompanyProfile(profile) {
  const sources = rows => Array.isArray(rows) && rows.length > 0 && rows.every(s => typeof s.title === 'string' && s.title.trim() && url(s.url) && date(s.checkedAt) && (s.publishedOn === null || date(s.publishedOn)))
  if (!profile || !Array.isArray(profile.sections) || profile.sections.length > 12) throw new Error('Invalid company sections')
  const ids = new Set()
  for (const s of profile.sections) {
    if (!/^[a-z][a-z0-9-]*$/.test(s.id) || ['people','contact','sources','learn','background','funding','related-work','relationships'].includes(s.id) || ids.has(s.id) || !localized(s.title) || !localized(s.body) || !sources(s.sources) || !Array.isArray(s.links) || s.links.some(l => !localized(l.label) || !url(l.url))) throw new Error('Invalid company section')
    ids.add(s.id)
  }
  const c = profile.contact
  if (!c || (c.address !== null && !localized(c.address)) || (c.email !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) || (c.phone !== null && !/^\+?[0-9 ()-]{3,30}$/.test(c.phone)) || !sources(c.sources)) throw new Error('Invalid company contact')
  return profile
}

// Select every public field explicitly; maintenance notes never reach the browser.
export function publicCompanyProfile(value) {
  const text = t => ({en:t.en,bn:t.bn})
  const sources = rows => rows.map(s => ({title:s.title,url:s.url,publishedOn:s.publishedOn,checkedAt:s.checkedAt}))
  const profile = {sections:value.sections.map(s=>({id:s.id,title:text(s.title),body:text(s.body),sources:sources(s.sources),links:s.links.map(l=>({label:text(l.label),url:l.url}))})),contact:{address:value.contact.address ? text(value.contact.address) : null,email:value.contact.email,phone:value.contact.phone,sources:sources(value.contact.sources)}}
  return validateCompanyProfile(profile)
}
