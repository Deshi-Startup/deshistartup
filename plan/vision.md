# Vision

Deshi Startup is the Bangla-first operating manual for building a startup in Bangladesh. It turns
scattered government portals, reports, founder experience and generic startup advice into practical,
source-backed guidance a first-time founder can use.

The live site is the product. This file records the durable direction; the backlog records the work.

## Who it serves

The primary reader is a first-time founder in Bangladesh, including students, non-technical
founders, technical founders learning business and compliance, women founders facing extra safety
or social constraints, and diaspora founders building locally.

Assume intelligence, not prior knowledge. A student should be able to follow the explanation, while
an active founder should be able to use its checklist.

## What makes it useful

1. **Bangladesh-specific:** advice accounts for Facebook-first sales, bKash and Nagad, COD,
   low-trust markets, courier failures, family pressure, limited capital and regulatory friction.
2. **Bangla-first:** Bengali is the source edition and must sound written in Bangla, not translated.
3. **Source-backed:** consequential claims use official or primary sources first and show when
   changeable information was checked.
4. **Actionable:** a guide ends in a decision, concrete steps or a usable tool.
5. **Honest:** unknowns, company claims and lived experience are labelled; stubs do not pretend to
   be finished pages.
6. **Open and maintainable:** the plan, sources, history, licenses and contribution process are public.

The project explains difficult operating realities without normalizing bribery, tax evasion, fake
documents or harmful shortcuts.

## Product shape

The knowledge base includes:

- topic guides for validation, registration, tax, payments, customers, operations, product, team,
  funding and growth;
- goal-based journeys that order existing guides;
- source-backed Bangladeshi startup case studies;
- structured directories with verification dates;
- copy-ready templates, scripts, checklists and lightweight calculators; and
- a public editor that turns proposed text and approved images into reviewable GitHub pull requests.

The information architecture and implementation live in `AGENTS.md`. Canonical planned routes live
in `plan/content-backlog.csv`.

## Quality and trust

The moat is not page count. It is trust, local relevance, source quality and upkeep.

- [`STYLE.md`](../STYLE.md) defines natural Bangladeshi Bangla.
- [`EDITORIAL.md`](../EDITORIAL.md) defines teaching, evidence and review.
- [`sources.csv`](./sources.csv) records trusted starting sources.
- [`maintenance-calendar.md`](./maintenance-calendar.md) records what must be re-checked.
- `verified:` identifies an actual regulatory/compliance re-check, not a routine edit.

Legal, tax, registration, labor, payment-regulation and fundraising content receives maintainer
review and expert review when the decision risk warrants it.

## Near-term priorities

1. Turn high-priority stubs into complete Bengali guides.
2. Maintain English mirrors without delaying valuable Bengali contributions.
3. Keep legal, fee and directory information current.
4. Improve contribution review and human onboarding without weakening security.
5. Add media and tools only when they materially improve understanding.

Run `npm run backlog:status` for current progress and missing planned pages. Use
`plan/content-backlog.csv` rather than copying priority lists into this file.

## Deliberately later

Do not build a broad AI assistant, complex admin dashboard, paid marketplace or legal automation
before the knowledge base is mature. A future assistant should answer only from reviewed content,
cite sources, show verification dates and admit uncertainty.

Do not architect for a hypothetical migration away from the public GitHub-backed repository.

## Success

The project is working when:

- a founder can move from a question to a safe next action without getting lost;
- Bangladesh-specific payment, sales, hiring and logistics realities are easier to navigate;
- compliance pages are cited, dated and corrected when rules change;
- Bengali explanations feel native and useful;
- founders and experts are willing to correct and contribute; and
- the site remains free, fast and credible as the corpus grows.
