# Startup ideas: local first version

A small, bilingual catalogue of startup ideas for Bangladesh. Each idea has its own
page, save action, first test and prototype prompt. Problems supply shared context;
companies are supporting references with one profile across Deshi Startup.

## Routes and data

- `/startup-ideas` and `/en/startup-ideas`: six researched ideas, search, sector/location
  and idea-type filters, plus a saved-only filter. Filters use shareable URLs.
- `/startup-ideas/<slug>`: one idea, who it helps, how it works, a possible revenue
  model and numbered first steps. Relevant guides and alternative ideas for the
  same problem offer a next step. Save and Share sit above the brief. Research expands below. Related companies appear as small
  logo/name links; their profiles explain the specific work and source.
- `/companies/<slug>`: shared profiles linked from ideas, DS50 and case studies.
  The existing company index is directly reachable but has no navigation entry.
- `/startup-ideas/add-company`: suggest an existing or new company and its work.
  Google sign-in is required to submit; review precedes publication.
- `/startup-ideas/review`: private reviewer queue.
- `/startup-ideas/add`: a three-field idea form, optional supporting details,
  browser draft recovery and download. Google sign-in submits it privately to D1
  for review. All forms are noindex.

English routes have `/en`; the default is Bangla. `/ideas` remains the manual's
existing guide section. Old `/problems` URLs redirect in development and the Worker.
A problem detail redirects to the related ideas using `?problem=<id>`, preserving
all alternatives. Clear filters returns to the full collection. Early
`/startup-ideas/add-startup`, `/startup-ideas/contribute` and
`/startup-ideas/draft` aliases also work. Old drafts open in the new form.

Idea slugs come from immutable record IDs, with the initial `-approach` suffix
omitted. The route generator checks uniqueness. `approaches` remains the internal
D1 table name; no data migration is needed to present individual ideas.

The saved list uses `deshi-startup:ideas:saved:v2`. On first use, each saved problem
in v1 becomes its related idea IDs. Unknown IDs and the v1 backup are retained. An
existing v2 list, even empty, is never remigrated. Private draft keys stay unchanged.

D1 owns records and private submissions. `data/ecosystem/public.json` is a generated,
versioned public snapshot; never edit it by hand. Thin bilingual MDX wrappers are
produced by `scripts/build-ecosystem-routes.mjs`. Public reading is static and needs
neither an account nor a database request. Normal builds need no D1 credentials.

Company connections currently refer to the shared problem, not a specific idea.
“Related companies” reflects that scope. Reverse Resources is linked through
published textile-recycling work. It is not presented as adopting our proposed
idea. Shared profiles retain source dates; DS50 membership remains independent.

## Seed standard

The first collection covers crop cooling, drinking-water maintenance, clinic
follow-up, workplace heat, textile recycling and rooftop-solar upkeep. Each brief
names a customer, a possible payer, a small test and the result worth looking for.
Primary sources establish the problem; pricing, demand and proposed business models
remain hypotheses to test. Existing work is acknowledged. Sector importance alone
is not enough to qualify an idea.

Keep both languages concise. Include material safety or operational constraints in
the relevant step, and keep deeper questions and source notes in the disclosure.
Prefer one grounded source to a long reading list. Avoid fabricated market sizes,
funding interest, traction or financial forecasts.

Migration `0008` retires earlier preview problems with `active = 0`, preserving
records, submissions and frozen releases. Exports include only active problems and
their ideas and connections. Company identities remain available. New connections
to retired problems cannot be submitted or approved. Old preview idea links redirect
to the collection. To curate later, use a forward migration and prepare a new release;
do not edit a published snapshot or rewrite an applied migration.

## Idea submissions

Idea proposals reuse the private submissions table with `kind: "idea"`. Only a name,
a description and the intended user are required. Nothing becomes public on submit.
The reviewer queue accepts a proposal for editing or declines it with a note. An
accepted proposal still needs researched, bilingual editorial preparation before it
can become a public idea through the existing release process; acceptance does not
create or publish a catalogue record. This first version has no automatic publishing
or idea editor. The owner-scoped API exposes submission status and review notes; the
form confirms receipt without adding an account dashboard.

## Run locally

```sh
npm run ecosystem:init
npm run ecosystem:prepare
npm run dev:ecosystem -- --port 3100
```

The dedicated `wrangler.ecosystem-local.jsonc` binds a local database and applies
`worker/migrations/ecosystem/`. It does not create a remote D1 database. The dev
launcher runs the API on port 8787. Use the existing `.env.local` Google client ID and
reviewer allowlist described in `.env.local.example`; never commit credentials.
A missing database fails closed, while the public reading pages continue to work.

After approving company records locally (or preparing new bilingual ideas in D1):

```sh
npm run ecosystem:prepare
npm run build
npm run ecosystem:publish -- <release-id>
```

Preparation freezes approved records into a release. The build checks the snapshot,
route output and release marker. Publication accepts only that exact built release
and changes the local publication pointer. An approval remains “awaiting publication”
until its connection appears in the published release. These commands are local only;
production publication and deployment are not wired up in this slice. A failed build
or mismatched marker cannot advance the pointer. Frozen releases remain in local D1.

## Boundaries

Every write verifies a Google ID token, applies moderation and rate limits, validates
bounded input and uses prepared SQL. Submission retries use an owner-scoped idempotency
key. Review requires the allowlist, an expected revision and an atomic D1 batch. A stale
review or duplicate company/problem connection rolls back the entire decision.

Contributors see only their own submissions; only reviewers can read the queue.
Public exports omit submitter identity, review notes and request keys. Submitting
information never grants profile control or proves that someone represents a company.
Review checks identity and relevance, not investment quality or business success.

Possible duplicate identities are shown during review; slugs and company/problem
pairs are unique. Domain or name similarity is a hint, not proof that two brands are
one company. General editing, identity merges, representative verification and logo
uploads remain outside this first slice.

Votes, partner-interest badges, automatic research imports and additional dashboards
are deferred. A Moncho.ai or other integration needs its own source, permission and
scope. Before public submissions launch, assign review ownership, define correction,
retention and removal rules, decide dataset reuse rights, and rehearse production
backup/restore and deployment rollback. Code licensing does not grant rights to
company marks, private submissions or third-party research.

## Verification

`npm run test:ecosystem` exercises real local D1 transactions, concurrent retries,
stale review, duplicate rollback, shared identities, private-field exclusion and
frozen publication. Idea intake tests also verify required fields, owner isolation,
concurrent retries, revision checks and that acceptance never changes public data.
The idea model tests cover filters, bilingual routes, saved-list
migration and draft recovery. Run the repository tests, Worker checks and production
build, then check desktop/mobile reading and keyboard use in both languages.

`LocalizedLayout` owns the shared header, fonts, search, language switch, sidebar
and footer. `IdeaShell` adds spacing without a second navigation layer. The index
contains no company names or counts. A single-column introduction leads into one
shared search/filter bar and a row of idea-type pills. A Saved toggle narrows the
current filters. Ruled rows separate sectors from idea titles; metadata stays plain.
Service, software, marketplace and manual-process types describe the idea, without
inferring coding requirements. Customers remain searchable and appear on detail
pages. Each row links to its idea, with the save button remaining independent.
On phones, filters stack so selected labels stay readable. Idea briefs give the
first test a pale green surface; supporting facts follow the main content on
small screens. These layouts use the existing font and CSS without new assets,
packages or animation code. Progress tracking, freshness badges, collection
statistics, repeated customer paragraphs and broad related-idea recommendations
are omitted. Publication dates and guide relationships remain in the data.
Obsolete problem-page wrappers and styles are
removed by their owning generator or source edit, never by deleting research.

Signed-in submission/reviewer screens still need visual acceptance before launch.
Backend tests use isolated identities, never a production auth bypass. Product
scope and research are recorded in [`plan/startup-ideas-direction.md`](../plan/startup-ideas-direction.md).
