export type Locale = 'en' | 'bn'
export type Localized<T> = Record<Locale, T>
export type OrganizationRole = 'startup' | 'investor' | 'accelerator' | 'incubator' | 'community'
export type ApproachKind = 'software' | 'service' | 'marketplace' | 'workflow'
export type WorkStage = 'research' | 'prototype' | 'live'
export interface EvidenceSource { title: string; url: string; date: string; en: string; bn: string }
export interface ProblemCopy { title: string; summary: string; customer: string; context: string; unknown: string }
export interface Problem extends Localized<ProblemCopy> {
  id: string; slug: string; sector: string; places: string[]; sources: EvidenceSource[]
}
export interface ApproachCopy {
  title: string; summary: string; description: string; businessModel: string;
  steps: string[]; signal: string; prototype: string
}
export interface Approach extends Localized<ApproachCopy> {
  id: string; problemId: string; kind: ApproachKind; position: number;
  /** The date this idea entered the public collection, as YYYY-MM-DD. */
  addedAt: string;
  /** Manual slugs whose written guides support this idea's first test, in step order. */
  guides: string[]
}
export interface Organization extends Localized<{ name: string; description: string }> {
  id: string; slug: string; website: string; logoPath: string | null;
  roles: OrganizationRole[]; aliases: string[]; sourceUrls: string[]; sourceDate: string | null;
  origin: 'editorial-import' | 'reviewed-submission';
  references: { kind: 'case-study' | 'startup-50'; target: string }[]
}
export interface Connection {
  id: string; organizationId: string; problemId: string; stage: WorkStage;
  en: string; bn: string; evidenceUrl: string; reviewScope: string; reviewedAt: string
}
export interface EcosystemSnapshot {
  version: 1; releaseId: string; createdAt: string;
  problems: Problem[]; approaches: Approach[]; organizations: Organization[]; connections: Connection[]
}
export interface ConnectionProposal {
  version: 1; locale: Locale; problemId: string; organizationId: string;
  organization: { name: string; website: string; description: string; role: OrganizationRole } | null;
  work: string; stage: WorkStage; evidenceUrl: string
}
export interface ReviewDecision {
  revision: number; decision: 'approved' | 'rejected'; note: string;
  organizationId: string;
  organization: { slug: string; en: { name: string; description: string }; bn: { name: string; description: string } } | null;
  work: Localized<string>
}
export interface IdeaProposal {
  version: 1; kind: 'idea'; locale: Locale;
  title: string; solution: string; customer: string; problem: string;
  place: string; evidence: string; test: string
}
export interface IdeaDecision {
  revision: number; decision: 'approved' | 'rejected'; note: string
}
