# Startup ideas

A small, bilingual catalogue of startup ideas for Bangladesh. Each idea has its own
page, save action, first test and prototype prompt. Problems supply shared context;
companies have independent profiles shared across Deshi Startup. See `companies.md` for the directory and profile contract.

## Routes and data

- `/startup-ideas` and `/en/startup-ideas`: researched ideas, search, sector/location
  and idea-type filters, plus a saved-only filter. Filters and sort use shareable URLs.
- `/startup-ideas/<slug>`: one idea, who it helps, how it works, a possible revenue
  model and numbered first steps. Relevant guides and alternative ideas for the
  same problem offer a next step. Upvote, Save and Share follow the title and summary.
  The detail page uses a single reading column, with the revenue model following
  the explanation before the first test. Long titles use the available column width.
  Research expands below. Related companies appear as small
  logo/name links; their profiles explain the specific work and source.
  **Edit this idea** opens a prefilled editor for a focused, reviewed change.
- `/companies/<slug>`: shared profiles linked from ideas, DS50 and case studies.
  The gallery index is directly reachable; a sidebar entry is deferred.
- `/startup-ideas/add-company`: suggest an existing or new company and its work.
  Google sign-in is required to submit; review precedes publication.
- `/startup-ideas/review`: private reviewer queue and decision history.
- `/startup-ideas/submissions`: private idea history and reviewer feedback for the submitter.
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

The collection spans software, finance, learning, farming, trade, logistics,
energy and other local opportunities. Each brief names a customer, a possible payer, a
small test and the result worth looking for.
Primary sources establish the problem; pricing, demand and proposed business models
remain hypotheses to test. Existing work is acknowledged. Sector importance alone
is not enough to qualify an idea.

Keep both languages concise. Include material safety or operational constraints in
the relevant step, and keep deeper questions and source notes in the disclosure.
Prefer one grounded source to a long reading list. Avoid fabricated market sizes,
funding interest, traction or financial forecasts.

When polishing a bilingual batch, preserve good draft phrasing and check meaning separately
from fluency. Keep stable IDs, sources, credits and publication dates. Save complete records
before combining batches; a colon inside a prototype description must not truncate the field.
English simplifications need the same fact check as new copy. Apply approved wording with a
forward text migration, then prepare and inspect both languages through the release pipeline.
Remove temporary working files only after the reviewed copy is preserved and verified.

Migration `0008` retires earlier preview problems with `active = 0`, preserving
records, submissions and frozen releases. Exports include only active problems and
their ideas and connections. Company identities remain available. New connections
to retired problems cannot be submitted or approved. Old preview idea links redirect
to the collection. To curate later, use a forward migration and prepare a new release;
do not edit a published snapshot or rewrite an applied migration.

## Idea submissions

Idea proposals reuse the private submissions table with `kind: "idea"`. Only a name,
a description and the intended user are required. Nothing becomes public on submit.
The form also offers optional public credit. If selected, the submitter enters the exact
name they want shown; this choice stays in the private proposal until an editor
publishes a researched idea. A credited idea uses a small “Suggested by” line on its
detail page. Do not add a name to `approaches.suggested_by_json` without the matching
submitter request, and do not treat suggestion credit as authorship, ownership or
endorsement. Multiple materially used submissions can each receive credit. If the
submitter opted out, leave the array empty. Idea credit does not automatically create
a contributor profile or leaderboard entry.
The reviewer queue accepts a proposal for editing or declines it with a note. An
accepted proposal still needs researched, bilingual editorial preparation before it
can become a public idea through the existing release process; acceptance does not
create or publish a catalogue record. This first version has no automatic publishing.
The owner-scoped API exposes submission status and review notes; the
form confirms receipt and links to the private submission history.

An existing idea can be improved from its detail page. The reader chooses one or
more visible sections, edits prefilled text, and may add context or a public source.
The browser keeps an unfinished draft locally. Google sign-in submits only changed
sections as a private `kind: "idea-edit"` proposal; the Worker supplies each
section's original text from the deployed public snapshot, so a client cannot
forge the before/after comparison. A stale page must be refreshed before submitting.
This editor does not open the generated MDX wrapper or change D1 directly.

Idea edits share the existing editorial alert, private submission history and
reviewer queue. Reviewers see the original and proposed copy side by side and
accept for editing or decline with a note. Acceptance does not publish anything.
An editor checks the evidence, the affected idea and any shared problem fields,
then prepares the English and Bangla update through a forward D1 migration and
normal frozen release. After the matching build is deployed and its release pointer
is live, the reviewer marks the update published. The server verifies that the
active release matches the deployed marker, is newer than the submitted base,
contains the idea and changed its idea/problem content. This records the link in
`idea_edit_publications`, without putting private notes in the public snapshot.
Rollback removes the current-published indicator. Decision/publication email still
depends on `IDEA_DECISION_EMAILS`; private history works without it.

Manage reviewer access in Cloudflare: **Workers & Pages → deshistartup → Settings →
Variables and Secrets → CONTRIBUTION_REVIEWER_EMAILS**. This is a **Text** runtime
variable containing comma-separated Google-account email addresses. Its current
value is readable in the dashboard; it is not exposed to website visitors. Keep
the actual addresses out of Git. `keep_vars: true` preserves this dashboard-managed
setting on deployment. The local `.env.local` value is only a development copy.
Google token verification and reviewer matching still apply; a missing or empty
list grants nobody reviewer access.

Each new idea, idea edit or company submission creates a private email job in the same D1
transaction. The existing `CONTACT_EMAIL` binding sends an editorial alert to
`CONTACT_INBOX`, with a link to the specific submission. Use the verified destination
behind hello@; the routing alias is not itself a verified destination.

`/startup-ideas/submissions` is the sign-in-only idea history. Reviewers have Awaiting
review, Accepted and Declined views with cursor-paginated history. Selecting a record
keeps the loaded list and pagination position. Unsaved review fields survive switching
between records in the same tab; they are not stored after a full page reload. The
account control lets a reader or reviewer switch Google accounts without clearing
their browser. Notes are messages
to the submitter, not internal-only comments. Acceptance starts editorial preparation.
If research changes the decision, a reviewer can close an accepted idea with a
reason. The submitter sees that private update, and the idea cannot be linked to a
public page. Migration `0021_idea_editorial_closures.sql` stores this outcome.
When decision emails are enabled, closure also queues an email.
After the bilingual idea ships, a reviewer links it to its published record. This
private relationship verifies the actual publication snapshot and never changes it.
Publication emails check that snapshot again before delivery. If a release is rolled
back, the email is held and the history shows “Currently unpublished”; a reviewer
can retry delivery after the idea is restored.

The verified Google address is saved privately for new idea and idea-edit submissions,
whether or not automated email is enabled. Only allowlisted reviewers can see it in the
review queue for direct follow-up; it is never in the public release or contributor
credit. `IDEA_DECISION_EMAILS=true` additionally enables decision, closure and publication
emails. Enable only after Email Sending onboarding and a controlled delivery test.
The default is off; no decision or publication email job is queued while it is off.
The presence of a binding does not establish Email Sending availability. Existing
submissions without contacts remain in history; never guess or backfill addresses.

Migration `0018_submission_followup.sql` adds private contacts, publication links and
an email outbox. Apply it before deploying the updated Worker. Existing submissions do not receive
retroactive alerts. The outbox dispatches promptly through `waitUntil`; a 15-minute
Worker schedule retries at most 20 due messages per run, up to five attempts per event.
Leases prevent concurrent dispatch. A crash after provider acceptance but before saving
success can duplicate mail; acceptance is not proof of inbox delivery. Failed messages
show a reviewer retry action. Correct permanent provider configuration errors first.
Provider exception text and recipient addresses are never logged or publicly exported.

Migration `0024_idea_credit.sql` adds the public `suggested_by_json` field to ideas.
It was applied to production D1 on 24 September 2026. Apply it in other environments
before preparing a snapshot with the updated exporter. Existing ideas have
no named credit. The first submitted ideas published before private contact collection
cannot be credited by guessing who submitted them; verify a claim before adding a name.

Local tests use simulated delivery and isolated D1. Never enable remote sending for
test fixtures. No GitHub issues are created for private submissions.

### Editorial routine

The editorial team checks Awaiting review and Accepted weekly. Accept an idea for
editing or decline it with a useful note; there is no promised response time.
For each accepted idea, check the customer, existing providers, evidence and a
small first test. Prepare a short English brief and Bangla edition for a second
editor to check. Publish through the normal D1 release, then link the live page
from Accepted. If it does not hold up, close it with a reason for the submitter.
Keep private proposals in D1; use a GitHub PR for publishable content and code.

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
Before preparing a release, check the target database's migration history and apply
the reviewed pending migrations. The database history owns applied status; Git
contains the forward migration files. Back up production first and rehearse the
update in isolation, checking that private records and the publication pointer stay intact.
See [`shared-identity.md`](./shared-identity.md) for the import and identity
publication boundaries. These database steps do not deploy the Worker or publish
the prepared snapshot.

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

Large frozen release rows can exceed D1's SQL statement-length limit in an export.
If the local import reports `SQLITE_TOOBIG`, replay those inserts with prepared
statements and bound values in an isolated D1 emulator. Keep every frozen release
and verify its digest; never omit large rows to make a restore pass.

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

Backend tests use isolated identities, never a production auth bypass. Check the
live status endpoint and bilingual edit form after deployment; real contributor
edits go through the ordinary reviewer queue. Confirm the live release marker
before advancing a publication pointer. Product scope and research are recorded
in [`plan/startup-ideas-direction.md`](../plan/startup-ideas-direction.md).
