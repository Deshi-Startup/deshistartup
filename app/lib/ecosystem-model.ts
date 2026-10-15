import type { EvidenceSource, Locale, OrganizationRole, WorkStage } from './ecosystem-types'
export const companyPath = (locale: Locale, slug = '') => `${locale === 'en' ? '/en' : ''}/companies${slug ? `/${slug}` : ''}`
export const organizationRoles: Record<OrganizationRole, Record<Locale, string>> = {
  startup: { en: 'Startup', bn: 'স্টার্টআপ' }, investor: { en: 'Investor', bn: 'বিনিয়োগকারী' },
  accelerator: { en: 'Accelerator', bn: 'অ্যাক্সিলারেটর' }, incubator: { en: 'Incubator', bn: 'ইনকিউবেটর' },
  community: { en: 'Community', bn: 'কমিউনিটি' }
}
export const workStages: Record<WorkStage, Record<Locale, string>> = {
  research: { en: 'Research', bn: 'গবেষণা' }, prototype: { en: 'Testing an early version', bn: 'প্রোটোটাইপ বা ছোট পরীক্ষা' }, live: { en: 'Up and running', bn: 'চালু আছে' }
}
export const domain = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url } }

export const sourceDate = (value: string, locale: Locale) => {
  const raw = value.replace(/^Accessed /, '').trim()
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.valueOf())) return value
  // Only ISO dates parse as UTC. A written date parses as local midnight, which
  // printed a day early east of Greenwich, so re-anchor it before formatting.
  const date = /^\d{4}-\d{2}-\d{2}/.test(raw) ? parsed : new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()))
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
}

export function partitionSources(sources: EvidenceSource[]) {
  return {
    other: sources.filter(source => !source.section),
    facts: sources.filter(source => source.section === 'facts'),
    maps: sources.filter(source => source.section === 'maps'),
    size: sources.filter(source => source.section === 'size')
  }
}

function bulletLines(block: string) {
  return block.split('\n').map(line => line.replace(/^[-•]\s*/, '').trim()).filter(Boolean)
}

export function parseSourceLine(item: string) {
  const match = item.match(/^(.*?)\s+(https:\/\/\S+)$/)
  if (!match) return { label: item, url: '' }
  return { label: match[1], url: match[2] }
}

export function splitSizeNote(text: string) {
  const en = '\n\nAssumptions\n'
  const bn = '\n\nঅনুমান\n'
  const marker = text.includes(en) ? en : text.includes(bn) ? bn : null
  if (!marker) return null
  const [head, rest] = text.split(marker)
  const sourceMark = rest.includes('\n\nSources\n') ? '\n\nSources\n' : rest.includes('\n\nউৎস\n') ? '\n\nউৎস\n' : ''
  const [assumptionBlock, sourceBlock] = sourceMark ? rest.split(sourceMark) : [rest, '']
  const factorMark = head.includes('\n\nWhat went into it\n')
    ? '\n\nWhat went into it\n'
    : head.includes('\n\nহিসাবের অংশ\n')
      ? '\n\nহিসাবের অংশ\n'
      : ''
  const [resultBlock, factorBlock] = factorMark ? head.split(factorMark) : [head, '']
  const results = resultBlock.split('\n\n').map(block => {
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean)
    return { value: lines[0] || '', caption: lines.slice(1).join(' · ') }
  }).filter(row => row.value)
  const factorLines = factorBlock.split('\n').map(line => line.trim()).filter(Boolean)
  const factors: { value: string; metric: string }[] = []
  for (let i = 0; i < factorLines.length; i += 2) {
    factors.push({ value: factorLines[i], metric: factorLines[i + 1] || '' })
  }
  return {
    results,
    factors,
    assumptions: bulletLines(assumptionBlock),
    sources: bulletLines(sourceBlock)
  }
}
