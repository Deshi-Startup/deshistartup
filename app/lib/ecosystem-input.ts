import type { ConnectionProposal, ReviewDecision, IdeaProposal, IdeaDecision } from './ecosystem-types.ts'

const roles = ['startup', 'investor', 'accelerator', 'incubator', 'community']
const stages = ['research', 'prototype', 'live']
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const text = (value: unknown, max: number, min = 1): value is string => typeof value === 'string' && value.trim().length >= min && value.length <= max
export const validEntityId = (value: unknown): value is string => typeof value === 'string' && /^[a-z0-9][a-z0-9_-]{0,95}$/.test(value)
export function publicUrl(value: unknown): value is string {
  if (!text(value, 500)) return false
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password &&
      url.hostname.includes('.') && !/^(localhost|127\.|0\.|169\.254\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname)
  } catch { return false }
}
export function parseProposal(value: unknown): ConnectionProposal | null {
  if (!record(value) || value.kind !== undefined || value.version !== 1 || !['en', 'bn'].includes(String(value.locale)) ||
    !validEntityId(value.problemId) || !text(value.work, 2000, 20) ||
    !stages.includes(String(value.stage)) || !publicUrl(value.evidenceUrl)) return null
  const existing = validEntityId(value.organizationId)
  const org = value.organization
  if (existing && org !== null) return null
  if (!existing && !(value.organizationId === '' && record(org) && text(org.name, 100) &&
    text(org.description, 500, 20) && publicUrl(org.website) && roles.includes(String(org.role)))) return null
  return {
    version: 1, locale: value.locale as ConnectionProposal['locale'], problemId: value.problemId,
    organizationId: existing ? value.organizationId as string : '',
    organization: existing ? null : {
      name: (org as Record<string, string>).name.trim(), website: (org as Record<string, string>).website.trim(),
      description: (org as Record<string, string>).description.trim(), role: (org as Record<string, string>).role as NonNullable<ConnectionProposal['organization']>['role']
    },
    work: value.work.trim(), stage: value.stage as ConnectionProposal['stage'], evidenceUrl: value.evidenceUrl.trim()
  }
}
export function parseIdeaProposal(value: unknown): IdeaProposal | null {
  if (!record(value) || value.kind !== 'idea' || value.version !== 1 || !['en', 'bn'].includes(String(value.locale)) ||
    !text(value.title, 100) || !text(value.solution, 2000, 20) || !text(value.customer, 240) ||
    !text(value.problem, 2000, 0) || !text(value.place, 120, 0) || !text(value.evidence, 2000, 0) || !text(value.test, 1000, 0)) return null
  return { version: 1, kind: 'idea', locale: value.locale as IdeaProposal['locale'], title: value.title.trim(),
    solution: value.solution.trim(), customer: value.customer.trim(), problem: value.problem.trim(),
    place: value.place.trim(), evidence: value.evidence.trim(), test: value.test.trim() }
}
export function parseIdeaDecision(value: unknown): IdeaDecision | null {
  if (!record(value) || !Number.isSafeInteger(value.revision) || Number(value.revision) < 1 ||
    !['approved', 'rejected'].includes(String(value.decision)) || !text(value.note, 1000, 5)) return null
  return { revision: Number(value.revision), decision: value.decision as IdeaDecision['decision'], note: value.note.trim() }
}
export function parseDecision(value: unknown): ReviewDecision | null {
  if (!record(value) || !Number.isSafeInteger(value.revision) || Number(value.revision) < 1 ||
    !['approved', 'rejected'].includes(String(value.decision)) || !text(value.note, 1000, 5)) return null
  if (value.decision === 'rejected') return { revision: Number(value.revision), decision: 'rejected', note: value.note.trim(), organizationId: '', organization: null, work: { en: '', bn: '' } }
  if (!record(value.work) || !text(value.work.en, 2000, 20) || !text(value.work.bn, 2000, 20)) return null
  const existing = validEntityId(value.organizationId)
  const org = value.organization
  if (existing && org !== null) return null
  if (!existing && (!Number.isSafeInteger(value.organizationVersion) || Number(value.organizationVersion) < 0)) return null
  if (!existing && !(value.organizationId === '' && record(org) && text(org.slug, 80) &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(org.slug) && !['review', 'draft', 'contribute'].includes(org.slug) && record(org.en) && record(org.bn) &&
    text(org.en.name, 100) && text(org.bn.name, 100) && text(org.en.description, 500, 20) && text(org.bn.description, 500, 20))) return null
  return {
    revision: Number(value.revision), decision: 'approved', note: value.note.trim(),
    organizationId: existing ? value.organizationId as string : '',
    ...(!existing ? { organizationVersion: Number(value.organizationVersion) } : {}),
    organization: existing ? null : org as ReviewDecision['organization'],
    work: { en: value.work.en.trim(), bn: value.work.bn.trim() }
  }
}
