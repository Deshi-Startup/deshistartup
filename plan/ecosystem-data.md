# Problems, ideas and company records

This owns the shared product model across startup-idea discovery, company profiles, Startup 50,
case studies and future contribution flows. Feature implementation details stay in
[`docs/startup-ideas.md`](../docs/startup-ideas.md); deployment rules stay in
[`deployment-architecture.md`](./deployment-architecture.md).

## Direction and decision status

**Implemented locally, 16 September 2026:** individual startup ideas are the public
browsing unit at `/startup-ideas`, mirrored in English. Problems remain shared
research underneath. Companies are supporting references with canonical
`/companies/<slug>` profiles, not a primary or secondary navigation destination.
The index has no company counts. Product scope and example research live in
[`startup-ideas-direction.md`](./startup-ideas-direction.md).

D1 stores problems, ideas, shared company identities and private submissions.
The current seed collection and editorial standard live in the feature documentation. The Worker supports authenticated submissions and reviewer decisions;
a frozen public snapshot supplies static pages. Investor firms, accelerators,
incubators and communities use company roles rather than separate route trees.
Individual people and programs remain separate future concepts.

The local slice includes DS50/case-study links and separate approval/publication.
Votes, general profile editing, representative verification, duplicate merges and
logo uploads are deferred. Production review ownership, correction/retention rules,
dataset reuse rights and recovery still need work. No remote database or deployment
is included.

## Product model

| Record | Job | Relationships |
|---|---|---|
| Problem | Describe a specific unmet need: who encounters it, in what context, with what consequence and evidence. | Has several ideas and company connections. |
| Idea | Describe one possible way to address a problem, its business model, assumptions and first test. | Has one primary problem. Company references currently come through that problem. |
| Company | Hold one stable venture identity, public names, website, logo and reviewed description. | Reused by problem connections, DS50 and case-study references. |
| Company–problem connection | Explain what a company is doing about this particular problem. | Joins a company and a problem. Exact idea-level matching is deferred. |
| Submission / revision | Hold a proposed change, evidence and review outcome. | Targets a new or existing record without overwriting its published version. |

An idea need not be software or have a company behind it. A company can connect directly to a
problem without pretending to follow one of our suggested ideas. Start with one primary problem
per idea; add cross-problem idea links only when real examples need them.

The connection owns the description of the work, supporting evidence, self-reported progress and
review date. These are not company-wide facts: a live company can still be researching a new
problem. Evidence about a sector is not proof that a customer needs a particular product.

For example, a problem could be “Growing online sellers cannot reliably reconcile courier
settlements.” A reconciliation service, spreadsheet workflow and integrated software product
would be separate ideas. These are illustrative hypotheses, not evidence of demand or
claims about named companies.

## One company identity across the product

- Use an immutable internal `company_id`; names, URL slugs and websites can change. IDs are
  shared by Bangla and English records. One identity can have two localized profile pages.
- Keep public trading name, optional legal name, aliases and previous names distinct. A venture
  need not be incorporated to be listed; do not imply legal registration from a profile.
- Give each company one canonical profile per locale. Use `/companies/<slug>` and
  `/en/companies/<slug>` because companies may outgrow the startup stage. Keep the directory's
  eligibility focused on Bangladesh's startup ecosystem rather than generic businesses.
- Company references use `company_id`, not string matching or a case-study slug. The company
  name in DS50 can open its profile, with an explicit website link still available. Keep direct
  “Read the case study” actions where that is the reader's task. Do not link every repeated name
  in an article automatically.
- Case studies remain independent editorial pages, with their existing URLs and sources.
  Structured references connect them to companies. Several studies can concern one company, and
  one study can discuss several companies. Only finished studies should appear as reading links.
  “Canonical company profile” means the shared identity destination; it does not make the profile
  replace the case study or its distinct page identity.
- DS50 remains a dated editorial selection. Its membership and selection rationale reference a
  company, but submitting or approving a company never adds it to DS50 automatically. Preserve
  edition-specific observations when a current profile changes.
- Company profiles show identity, what it does, reviewed problem connections, available case
  studies, sources and freshness. Show sections only when information exists. Defer speculative
  funding tables, employee counts, rankings and investor dashboards.

Aliases and domains help find potential duplicates; neither proves two records are the same
company. Products, brands, parent companies and legal entities sometimes differ. In particular,
do not blindly turn a combined editorial entry into a single legal-entity claim. Resolve identity
before import. A reviewed duplicate merge must preserve incoming references and old URLs, retain
an audit trail and support correction. A corporate merger is not merely a duplicate-record merge.

## Idea-first experience

Problems and ideas are separate records. Public copy says “ideas”; `approaches` is
only the internal table name. Browse individual ideas, filter or save them, then
open a focused page with the customer, solution, revenue model and first test.
Shared problem research and sources sit in one optional disclosure. Company rows
link to shared profiles that explain their work and evidence.

The Field Manual shell, typography and mobile reading remain. No separate Problems
or Companies navigation, repeated cautionary copy, market scores or dashboards.
The fuller UI contract belongs to [`startup-ideas-direction.md`](./startup-ideas-direction.md).

## Company selection and review

1. Search published companies by name, Bangla/English aliases or public website. Show name,
   domain and a short description to distinguish matches. Start with ordinary indexed search;
   no recommendation model or vector database is needed for this interaction.
2. If a match exists, select its ID and describe the company's work on this problem. Reuse its
   identity and logo. Suggest profile corrections separately instead of copying the whole form.
3. If no match exists, propose a company and its problem connection in one flow. Store a private
   submission, not a new public listing. Show possible duplicates again during review.
4. Review identity, connection evidence and any representative claim separately. Someone can
   suggest a publicly evidenced connection without claiming to represent the company. Signing
   in or adding a connection must never grant editing control over that company.
5. A reviewer can link to an existing company, approve a new one, request changes or reject the
   submission. Approval records the reviewer, decision, scope, evidence and date. Recheck
   duplicates at approval time, since two contributors may submit the same company concurrently.
6. Publish the approved revision through an explicit release step. Show “approved, awaiting
   publication” until the public page and references actually exist. A rejected connection does
   not necessarily invalidate an otherwise eligible company profile.

Keep submitter identity, private contact details and review notes outside public payloads.
Use authenticated writes, request limits, idempotency keys, scoped reviewer permissions and
optimistic revision checks. Company control requires a separate representative-verification
process. Reuse the existing authentication and media-security boundaries; contributor logos
must stay in private quarantine until approved for the company. Do not bypass ownership or media
review because an upload is “only a logo.”

Votes can follow after this loop works. Keep support for a problem distinct from support for a
particular idea. A vote is interest, not market validation. Company listings, verified
representatives, DS50 selection and investor interest are separate facts, not a universal
“verified” badge. Investor or accelerator offers require attributable scope and permission.

## Data and delivery architecture

The need for a database comes from concurrent writes, relationships and review history, not
from a particular number of JSON records. Static files are still suitable for editorial content,
fixtures, exports and generated public snapshots.

| Layer | Recommended responsibility |
|---|---|
| D1 | Authoritative company/problem/approach records, relationships, revisions, private submissions and review decisions. |
| Existing Worker | Authentication, authorized mutations, company lookup, review decisions and controlled public queries. Browsers never receive database credentials. |
| R2 | Approved image bytes and private quarantine, using the existing media pipeline. |
| Git / MDX | Guides, case-study narratives, source code, database migrations and editorial DS50 selection. |
| Static site | Crawlable, bilingual public profiles and problem pages built from an approved public snapshot. |

Use one small relational database initially, with explicit tables and foreign keys. Likely groups
are companies and translations/aliases; problems and translations; approaches and translations;
company–problem links; sources/evidence references; submissions/revisions and review events.
Add a company-membership table only when representative editing is introduced. Keep the entity
schema concrete; avoid a generic “everything is a node” platform or one unvalidated JSON blob
per company. Submission payloads may be versioned JSON, but approval validates and normalizes them.
Keep local development, staging and production data separate. Version SQL migrations alongside
the code and rehearse imports and recovery locally before any production change.

D1 supports foreign keys and atomic batches. Use database constraints and short atomic approval
operations, including the review event, rather than unrelated read-then-write requests. A
conditional update affecting zero rows is not automatically a transaction failure: detect stale
decisions explicitly and ensure dependent writes cannot publish a stale revision. Index identity
lookups, relationships and review queues. D1 is not an unrestricted Postgres replacement;
benchmark the real lookup and approval paths before a public launch. See Cloudflare's
[foreign-key documentation](https://developers.cloudflare.com/d1/sql-api/foreign-keys/),
[batch semantics](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch),
[index guidance](https://developers.cloudflare.com/d1/best-practices/use-indexes/) and
[current limits](https://developers.cloudflare.com/d1/platform/limits/).

For the first connected release, export a versioned, validated snapshot containing only approved
public fields. The normal static build consumes that exact snapshot, generates the bilingual
routes and discovery files, and verifies its links before deployment. After successful deployment,
mark that snapshot published; public lookup returns companies from the published version.
Approval alone does not make a static page appear. A controlled publication action must produce
the snapshot and run the release pipeline; it is not a browser request that pushes `main`.

The published snapshot must pin reviewed revisions so later pending edits cannot leak into a
build. A failed build leaves the previous published version available and the new one pending.
Generated JSON is an output, not a second editable source. After cutover, stop hand-maintaining
the same company identity in D1 and DS50 files. Guide authors should not need database credentials
to build or contribute to the manual.

Measure publication delay and static-asset growth before changing delivery. If company volume or
update frequency later warrants request-time rendering, change that surface deliberately while
keeping crawlable HTML, language parity and the existing article performance budgets. Do not
rewrite the whole site to introduce the database.

## Build sequence and acceptance

1. **Separate the model locally.** Split the six combined briefs into problems and ideas.
   Preserve IDs through an explicit mapping, then adapt the catalogue, detail and prompt flows.
   Finalize route names and record them in `content-backlog.csv` before exposing new destinations.
2. **Establish shared company identity.** Inventory DS50 and case-study references, reconcile
   aliases and ambiguous identities, and create stable IDs. Import a small reviewed set into
   local D1 with repeatable migrations; preserve source dates and logo provenance. A data import
   is not fresh verification. Generate initial profiles and link DS50 and case studies to them.
3. **Complete one contribution loop.** Select or propose a company, add a problem connection,
   review it, publish it, and show the same company on both surfaces. Add a small review queue
   with clear decisions; a general CMS is outside this slice.
4. **Prove reliability before expansion.** Test duplicate concurrent submissions, stale approvals,
   retries, correction/merge behavior, unauthorized access and private-field exclusion. Exercise
   publication failure/rollback, logo review and database backup/restore. Verify both locales,
   keyboard interaction, mobile reading and public pages without login.
5. **Expand from observed use.** Add more sourced problems, ideas and companies. Add shared
   votes and verified partner offers only when their moderation and meaning are defined. Keep
   Maps as a linked geographic research surface; a pilot location is not company presence or
   measured demand. Connect Skills only to actual published resources.

Success means that a founder can compare ideas and choose a first test, while another
reader can discover relevant companies with clear evidence. Two problem connections must reuse
one company profile. Count successful next actions, correction quality and review burden before
optimizing for profile volume or votes.

Before public participation, name the maintainer responsible for reviews, set a realistic response
expectation, document removal/correction and retention rules, and decide the public dataset's
reuse license. Open-source code does not grant rights to private submissions, company trademarks
or third-party research. Do not promise an open database export until field-level provenance and
reuse rights support it.
