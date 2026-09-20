# Startup ideas

A small, bilingual catalogue of startup ideas for Bangladesh. Each idea has its own
page, save action, first test and prototype prompt. Problems supply shared context;
companies have independent profiles shared across Deshi Startup. See `companies.md` for the directory and profile contract.

## Routes and data

- `/startup-ideas` and `/en/startup-ideas`: six researched ideas, search, sector/location
  and idea-type filters, plus a saved-only filter. Filters and sort use shareable URLs.
- `/startup-ideas/<slug>`: one idea, who it helps, how it works, a possible revenue
  model and numbered first steps. Relevant guides and alternative ideas for the
  same problem offer a next step. Upvote, Save and Share sit above the brief. Research expands below. Related companies appear as small
  logo/name links; their profiles explain the specific work and source.
- `/companies/<slug>`: shared profiles linked from ideas, DS50 and case studies.
  The gallery index is directly reachable; a sidebar entry is deferred.
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
neither an account nor a working database. Optional live vote counts are fetched
separately; they never enter the static content snapshot. Normal builds need no D1 credentials.

Reading-page modification dates track the committed public release, including brief
or relationship changes that leave wrapper titles unchanged. These are release-level
update dates, not fresh source verification. Private submissions, votes and migrations
alone do not change them. Media lint and retirement also read company logo references
from this snapshot, including logos used nowhere else in the manual.

Company connections currently refer to the shared problem, not a specific idea.
“Related companies” reflects that scope. Reverse Resources is linked through
published textile-recycling work. It is not presented as adopting our proposed
idea. Shared profiles retain source dates; DS50 membership remains independent.

## Discovery

Recommended order puts editorial picks first and keeps the remaining release order.
Pick an idea for a significant local problem, a clear customer or payer, a useful gap
and a practical first test. A short, bilingual `editorial_note` explains each choice
under Research & sources; a quiet label identifies it in the catalogue. Keep the
selection small and review it as the collection grows, including new ideas and
underrepresented sectors. Votes never affect this default ordering.

One Google account can cast one active vote per canonical idea, shared across both
languages. Clicking again removes it. Saves remain browser-local and private;
existing saves are never uploaded or counted as votes. Votes express reader interest,
not customer validation or an investment assessment.

The compact sort offers Recommended and Newest. Most upvoted appears once the
collection has votes (or when opened through its `?sort=votes` URL). Ties retain
release order. No votes are seeded, and neither trending nor investor interest is
inferred from popularity.

`GET /api/ecosystem/votes` returns only aggregate counts, cached for 60 seconds in the
browser and in a shared Cache API entry per release and Cloudflare location. Client
query strings cannot create extra entries. Private reads and writes bypass this cache.
`GET /api/ecosystem/votes/mine` returns the signed-in account's active choices.
`POST /api/ecosystem/votes` accepts `{ id, voted }`, verifies sign-in, moderation and
rate limits, and atomically writes the explicit state and returns the new count.
Voting has its own 20-actions-per-minute limiter per account and Cloudflare location;
it does not consume the contribution endpoint's allowance.
Retries cannot create duplicate votes. Private responses are never cached. Counts
exclude retired ideas; an allowlist generated from the shipped snapshot prevents
unpublished records from becoming visible or receiving votes. D1 stores only the
account hash, idea ID, active state and first-vote date, with a composite primary key.
Migration `0011` creates this table and the initial editorial selections.

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

Manage reviewer access in Cloudflare: **Workers & Pages → deshistartup → Settings →
Variables and Secrets → CONTRIBUTION_REVIEWER_EMAILS**. This is a **Text** runtime
variable containing comma-separated Google-account email addresses. Its current
value is readable in the dashboard; it is not exposed to website visitors. Keep
the actual addresses out of Git. `keep_vars: true` preserves this dashboard-managed
setting on deployment. The local `.env.local` value is only a development copy.
Google token verification and reviewer matching still apply; a missing or empty
list grants nobody reviewer access.

Each new idea or company submission sends an editorial alert to the verified
destination behind `hello@deshistartup.com`, using the existing `CONTACT_INBOX`
secret and `CONTACT_EMAIL` binding. Sending to that verified destination works on
the free plan; the public routing alias itself is not a verified destination.
The sender is `contact@deshistartup.com`. The email contains the title or company name, a reference
ID and a link to the private review queue. It includes no Google identity or full
submission text. Retried requests for the same submission do not send another alert.
Sending runs after the database write, in the Worker's background execution context.
Email is best effort: a failed send logs `editorial_alert_failed` with the submission
ID, while the submission remains available in the queue. There is no automatic mail
retry or alert backfill. Local development uses Wrangler's simulated email binding;
no new credentials, database migration or mail provider are needed.

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
until its connection appears in the published release. A failed build or mismatched
marker cannot advance the pointer. Frozen releases remain in the selected D1 database.

## Production D1 and publication

`wrangler.jsonc` binds `ECOSYSTEM_DB` to `deshistartup-ecosystem` in the Deshi Startup
account. The primary is in APAC; read replication is disabled. There is no replica
consistency/session machinery to maintain. Local development uses a different config
and database identity. Normal builds read the committed public snapshot, not D1.
The first eleven migrations were applied for the initial remote database. The
additive shared-identity migration `0012` must also be applied before preparing a
release with the updated exporter; its presence in Git does not mean it has run
remotely. See [`shared-identity.md`](./shared-identity.md) for the import and identity
publication boundaries. No production Worker deployment is performed by these commands.

Use explicit remote commands only when preparing a production release:

```sh
npm run ecosystem:init -- --remote
npm run ecosystem:prepare -- --remote
npm run build:worker
# Review and commit the generated snapshot, marker and route wrappers.
# Deploy that reviewed commit through the normal main-branch release process.
npm run ecosystem:publish -- <release-id> --remote
```

The final command checks the built marker, frozen D1 release and the marker actually
served by `https://deshistartup.com` before advancing the publication pointer. Run it
after the deployment succeeds; it cannot publish an unbuilt or undeployed snapshot.
A local run cannot mark a remote release published. Never prepare from local test data
for a production release. Approval and publication remain separate steps.

### Recovery and performance

Before a schema or data migration, save a private SQL export outside tracked paths:

```sh
mkdir -p .wrangler/backups
(umask 077; npx wrangler d1 export deshistartup-ecosystem --remote --output .wrangler/backups/ecosystem.sql)
node scripts/ecosystem.mjs prepare-restore .wrangler/backups/ecosystem.sql .wrangler/backups/restore.sql
# Rehearse restore into a fresh local emulator, never over the working development DB:
npx wrangler d1 execute deshi-ecosystem-local --config wrangler.ecosystem-local.jsonc --local --persist-to .wrangler/restore-check --file .wrangler/backups/restore.sql
```

The preparation step moves table definitions before row inserts because deferred
foreign keys cannot reference a table that has not been created yet. It refuses to
overwrite an existing output file.

Check `PRAGMA foreign_key_check`, `PRAGMA quick_check`, record counts and the frozen
release digest after restoring. Treat all exports as private, even if today's seed
database has no submissions. Keep only the backup needed for the operation.
Cloudflare [Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
provides a second recovery path; inspect the available bookmark before any restore.
Do not restore production during routine checks.

For a site rollback, redeploy the previous known-good commit with its snapshot and
Worker, then run `ecosystem:publish` from a build of that release after its live marker
matches. Do not reverse schema migrations or discard subsequent submissions/votes.

Public catalogue/detail reading makes no D1 query. The indexed vote aggregation only
reads shipped, active ideas; private votes use an owner index. Mutations are bounded,
parameterized and batched atomically. Keep the existing indexes and measure query plans
before adding counters, replicas or an ORM. Public Cache API failures fall back to D1;
private responses always use `no-store`.

## Boundaries

Every write verifies a Google ID token, applies moderation and rate limits, validates
bounded input and uses prepared SQL. Submission retries use an owner-scoped idempotency
key. Review requires the allowlist, an expected revision and an atomic D1 batch. A stale
review or duplicate company/problem connection rolls back the entire decision. Creating
a company also requires the current catalogue version, checked inside that transaction:
if another reviewer just added a company, refresh the list and check it first. Company
identities are retained, so the largest row ID is a monotonic catalogue version.
Reviewer fields stay mounted but hidden during sign-in expiry, preserving edits on
reauthentication. Network requests time out so an interrupted connection can be retried.

Contributors see only their own submissions; only reviewers can read the queue.
Public exports omit submitter identity, review notes and request keys. Submitting
information never grants profile control or proves that someone represents a company.
Review checks identity and relevance, not investment quality or business success.

Possible duplicate identities are shown during review; slugs and company/problem
pairs are unique. Domain or name similarity is a hint, not proof that two brands are
one company. General editing, identity merges, representative verification and logo
uploads remain outside this first slice.

Trending, partner-interest badges, automatic research imports and additional dashboards
are deferred. A Moncho.ai or other integration needs its own source, permission and
scope. The existing Deshi Startup editorial team owns the submission queue, through
the existing reviewer allowlist. No response time is promised. Corrections and private
removal requests use the contact form; they are reviewed before changing public records.
Privacy documents the actual storage and manual removal route; private records do not
currently auto-expire. Original editorial snapshot text uses the existing content licence
(`LICENSE-content.md`); company marks, private submissions and linked research are excluded.

## Verification

`npm run test:ecosystem` exercises real local D1 transactions, concurrent retries,
stale review, duplicate rollback, shared identities, private-field exclusion and
frozen publication. Idea intake tests also verify required fields, owner isolation,
concurrent retries, revision checks and that acceptance never changes public data.
Vote tests cover concurrent retries, removal, owner isolation, unpublished/retired
ideas and exclusion from static releases. The idea model tests cover sorting,
filters, bilingual routes, saved-list
migration and draft recovery. Run the repository tests, Worker checks and production
build, then check desktop/mobile reading and keyboard use in both languages.

`LocalizedLayout` owns the shared header, fonts, search, language switch, sidebar
and footer. `IdeaShell` adds spacing without a second navigation layer. The index
contains no company names or counts. A single-column introduction leads into one
shared search/filter bar and a row of idea-type pills. A Saved toggle narrows the
current filters. Ruled rows separate sectors from idea titles; metadata stays plain.
Service, software, marketplace and manual-process types describe the idea, without
inferring coding requirements. Customers remain searchable and appear on detail
pages. Each row links to its idea, with upvote and save buttons remaining independent.
On phones, filters stack so selected labels stay readable. Idea briefs give the
first test a pale green surface; supporting facts follow the main content on
small screens. These layouts use the existing font and CSS without new assets,
packages or animation code. Progress tracking, freshness badges, collection
statistics, repeated customer paragraphs and broad related-idea recommendations
are omitted. Publication dates and guide relationships remain in the data.
Obsolete problem-page wrappers and styles are
removed by their owning generator or source edit, never by deleting research.

The 20 September 2026 audit checked desktop and narrow-phone reading in both languages,
saved-state and draft recovery, company lookup and cross-links, all 40 legacy redirect
spellings against the built Worker, private API boundaries, fresh migrations, and a
remote SQL export restored to a fresh local D1 database. The restored integrity checks,
record counts and frozen release digest matched.

One real Google-account submission, review and vote/unvote cycle is still required before
launch. Backend tests use isolated identities, never a production auth bypass. After
deployment, confirm the live release marker before advancing the publication pointer. Product
scope and research are recorded in [`plan/startup-ideas-direction.md`](../plan/startup-ideas-direction.md).
