import type { Approach, Problem } from './ecosystem-types'

export const ideaEditFields = ['title', 'summary', 'customer', 'description', 'businessModel', 'steps', 'signal', 'context', 'unknown'] as const
export type IdeaEditField = typeof ideaEditFields[number]

export const ideaEditLimits: Record<IdeaEditField, number> = {
  title: 100, summary: 500, customer: 500, description: 2500,
  businessModel: 1500, steps: 2500, signal: 750, context: 2500, unknown: 1500
}
export const ideaEditLabels: Record<IdeaEditField, { en: string; bn: string }> = {
  title: { en: 'Name', bn: 'নাম' }, summary: { en: 'Short description', bn: 'সংক্ষেপে' },
  customer: { en: 'Who it helps', bn: 'কাদের কাজে লাগবে' }, description: { en: 'How it works', bn: 'যেভাবে কাজ করবে' },
  businessModel: { en: 'Ways to earn', bn: 'আয়ের উপায়' }, steps: { en: 'Try this first', bn: 'আগে এভাবে পরীক্ষা করুন' },
  signal: { en: 'Look for', bn: 'যে ফল খুঁজবেন' }, context: { en: 'The problem', bn: 'সমস্যাটি' },
  unknown: { en: 'What to find out', bn: 'যা জেনে নেওয়া দরকার' }
}

export function ideaEditValue(idea: Approach, problem: Problem, locale: 'en' | 'bn', field: IdeaEditField): string {
  if (field === 'steps') return idea[locale].steps.join('\n')
  if (field === 'customer' || field === 'context' || field === 'unknown') return problem[locale][field]
  return idea[locale][field]
}

export function ideaEditValues(idea: Approach, problem: Problem, locale: 'en' | 'bn'): Record<IdeaEditField, string> {
  return Object.fromEntries(ideaEditFields.map(field => [field, ideaEditValue(idea, problem, locale, field)])) as Record<IdeaEditField, string>
}

export function validIdeaEditValue(field: IdeaEditField, value: string): boolean {
  if (!value.trim() || value.length > ideaEditLimits[field]) return false
  if (field === 'steps') {
    const steps = value.split('\n').map(step => step.trim()).filter(Boolean)
    return steps.length > 0 && steps.length <= 6 && steps.every(step => step.length <= 500)
  }
  return true
}
