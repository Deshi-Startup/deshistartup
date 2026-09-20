# Shared organization and person identity

Organizations and people have stable identities independent of their roles, accounts,
editorial appearances and URLs. D1 is the intended owner of shared identity fields;
reviewed public snapshots keep site reading static. The gallery/profile design is a
separate consumer of this foundation, not another company database.

## Implementation and rollout boundary

Migration `0012_shared_identity.sql` is additive. It preserves existing organization
IDs, company URLs, submissions, votes and their account hashes. It adds people,
explicit source-record mappings, reviewed affiliations, organization relationships,
private account links and private maintenance events. Normal builds still accept
the existing frozen snapshot without an `identities` section. Applying the migration
is required before preparing a new snapshot with the updated exporter.

The repository contains the schema, importer, public exporter, resolver and isolated
D1 tests. It does not imply that the migration/import has run in production. There
is no new public people directory, profile-claim endpoint, merge UI or permission
grant. Existing contributor pages and recognition continue using their established
ledger and snapshot until a separately reviewed consumer cutover.

## Ownership

| Information | Owner |
|---|---|
| Organization identity | Existing D1 `organizations` and `organization_text` |
| Person identity | D1 `people`; private by default |
| Historical and current roles | D1 `person_organizations`, each with evidence and an as-of date |
| Parent, investor and support relationships | D1 `organization_relationships`, with explicit direction and kind |
| Source-record crosswalk | D1 `identity_references` |
| Login ownership | Private `person_accounts`; currently unpopulated |
| Maintenance provenance | Private `identity_events` |
| Accepted contribution events and credits | Existing contributor ledger and GitHub reconciliation |
| Startup 50 inclusion, lessons and dated editorial research | Existing editorial files |
| Directory application/comparison details | Existing category data |
| Guides and case-study narratives | MDX in Git |

Imported person fields are a one-time bootstrap, not continuous two-way sync. The
importer never updates an existing D1 person. Until the public identity consumer
cutover, the contributor ledger remains the live contributor-profile owner. At that
cutover, shared fields must be read from the identity snapshot and the ledger's
duplicate fields retired or explicitly checked for drift; do not leave both editable.
Contribution roles such as author/reviewer stay attached to accepted events, not
as permanent labels on a person.

## Stable IDs and references

Keep existing IDs, including name-shaped legacy IDs, unchanged after a rename.
Generate opaque IDs for new people; their editable display name and unique slug
are separate. Preserve old public URLs when a slug changes.

`identity_references` has a unique `(namespace, external_id)` key and exactly one
foreign key to either a person or organization:

- `contributor`: existing ledger profile ID -> person ID; these initially match.
- `contributor-organization`: ledger organization ID -> organization ID.
- `startup-50`: editorial entry slug -> organization ID.
- `directory`: `category/entry-id` -> organization ID.
- `legacy-person` / `legacy-organization`: explicitly reviewed old identifiers.

The migration moves existing Startup 50 links out of `organization_references`
into the identity crosswalk and prevents new writes to the retired location.
Case-study references stay in the original table. The exporter reconstructs the
existing public `organization.references` shape from these owners, so consumers and
old frozen snapshots remain compatible. The migration also explicitly maps the already
imported Bangladesh Angels Network investor entry. It does not equate Bangladesh
Women Investors Network with BAN just because their website domain matches.
Combined editorial entries must be resolved before assigning a single identity.

Use `sharedIdentityIndex(snapshot)` in `app/lib/shared-identity.ts` to resolve these
references. It supports older snapshots through their existing Startup 50 links.
`app/lib/ecosystem.ts` exposes the index as `identities`; Startup 50 already uses it
for profile destinations. Other surfaces can adopt it without querying D1.

## Relationships and evidence

An affiliation relates a person to an organization with a controlled role and an
optional localized title. Supported roles are founder, cofounder, executive,
employee, partner, adviser, board member and investor. One person can have multiple
roles and organizations. Do not infer any role from a contributor's organization
field; the importer reports those cases for separate review.

Organization relationships point from subject to object:

- `parent-of`: parent -> subsidiary; not a duplicate-identity merge.
- `invested-in`: investor organization -> actual recipient.
- `portfolio-mention`: network/organization -> listed company; no investment implied.
- `accelerated`, `grant-funded`, `sponsored`: supporting organization -> recipient.
- `partnered-with`: named organizations; neither is implicitly the parent or investor.

For every relationship, preserve these different dates:

- `startedOn` / `endedOn`: exact known relationship dates, otherwise null. Do not
  invent January 1 for a source that only gives a year.
- `asOf`: the date the claim describes. A null end date does not prove a current role.
- source `publishedOn`: publication date, or null if unknown.
- source `checkedAt`: actual source-check date.
- `reviewedAt`: when the relationship was approved for the public export.

Sources contain `title`, `url`, `publishedOn` and `checkedAt`. Proposed/retracted
relationships are excluded from public exports. Confirmation requires a review
timestamp, and export validation checks dates, source URLs and referenced entities.
Do not invent reviewed relationships while importing existing people.

This foundation does not represent funding amounts or rounds. The profile expansion
should add a separate funding-event model with recipient organization, instrument,
currency, amount/disclosure status, participants and event-specific evidence before
presenting structured funding totals. Group financing is not subsidiary financing;
a network portfolio mention is not proof that the network itself invested.

## Privacy and review

Only people explicitly marked public with confirmation evidence, their public
references and confirmed relationships enter the export. Public fields are selected
explicitly, including nested links and sources. Account bindings, maintenance notes
and private/withdrawn people never enter the published identity section. Person
avatars use the existing R2 media registry and are included in lint/retirement checks.

`person_accounts` is reserved for a future verified account-link flow. Its unique
provider/subject-hash pair cannot belong to two people. Do not populate it from names,
emails, a public GitHub URL or the contributor importer. The site's existing vote and
submission owner hashes remain unchanged. Linking an account or listing a founder
does not authorize company editing; permissions need their own reviewed workflow.

Maintainer changes should use reviewed forward SQL with an `identity_events` record
in the same transaction, including before/after values for corrections. Duplicate
merges remain a separate reviewed operation: inventory foreign keys, redirect legacy
references/URLs, preserve event history and support correction. Do not delete a person
or organization simply because it looks similar to another record. A `legacy-*`
reference is not by itself a complete merge workflow.

Withdrawals require updating D1 visibility/status and regenerating/deploying the
public snapshot. During transition also apply contributor opt-out policy; the two
publishing surfaces must agree. No live database lookup can retract already exported
HTML without a new deployment.

## Maintainer sequence

```sh
npm run ecosystem:init          # local migration, including 0012
npm run identities:import       # inspect the plan; no writes
npm run identities:import -- --apply
```

The importer validates the contributor ledger, respects exclusions and opt-outs,
preserves legacy IDs and confirmation dates, and creates new people as private.
It is idempotent and refuses conflicting source mappings transactionally. It does
not overwrite later D1 edits, undo a withdrawal, or create an affiliation/account.
Core-team identities derived only from GitHub reconciliation need an explicitly
reviewed stable mapping before import; they are not guessed from usernames.

Review and populate identities/relationships, then use the existing ecosystem
prepare -> build -> reviewed deployment -> publish process. `identities` is an
optional version-1 section within the frozen ecosystem snapshot, so old releases
remain readable. No schema or private data is needed for normal site builds.

Remote migration/import requires explicit `--remote`, a private backup and a local
rehearsal using the recovery steps in `startup-ideas.md`. A remote file import may
temporarily block database queries; schedule it deliberately. The commands here
never deploy the site or change the publication pointer.

`scripts/shared-identity.test.mjs` verifies migration constraints, concurrent import,
conflict rollback, preserved IDs and edits, withdrawal, private-field exclusion,
reviewed relationships, malformed references and old-snapshot compatibility.
