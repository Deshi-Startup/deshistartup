# Contributor recognition policy

Deshi Startup publishes an evidence-backed record of work that has passed review. The record is
for attribution and discoverability; it is not a credential, endorsement, expert directory, or
measure of impact.

## Counting rule

One accepted event counts once for every credited person. An event is one reviewed bundle that
either goes live on Deshi Startup or materially validates a defined part of published content.
Related micro-edits, one working session, multiple roles in the same work, and Bengali-English
mirror pages stay in one event.

Work an outside writer already published elsewhere counts when they give permission to adapt it,
because the permission and the writing are the contribution. Each granted piece adapted into its
own published guide is its own event, and the writer is credited as `author` on it. A bare source
citation is not the same thing and still counts for nothing.

The controlled roles are `author`, `editor`, `translator`, `researcher`,
`operational-insight`, `reviewer`, and `product`. A reviewer credit also needs a public scope and
review date. Work that was not accepted, meeting attendance, introductions, promotion, and an
uncleared source citation do not count.

The leaderboard is ordered by lifetime accepted-event count, then newest accepted event, then
display name. There are no points or weights. Core maintainers are shown separately and are never
ranked.

## Identity, organizations, and privacy

Credit can be `person`, `person+organization`, or `anonymous`. Organization credit describes the
affiliation at that event; it does not imply endorsement or partnership. Anonymous events remain
in aggregate totals and page credits but produce no profile or ranked identity.

Do not add a headline, affiliation, photo, or external profile link without confirming it with the
person. The three migrated contributors retain only GitHub identity details that were already
public on the previous contributor page. Keep consent conversations, email addresses, and private
evidence outside the repository; `confirmedAt` records only the date a new public detail was
confirmed.

An opt-out removes the profile and ranked identity. The generator converts the person's retained
events to anonymous credit and the next card build removes stale proof-card assets. Renames keep
the stable profile ID and slug unless there is a safety reason to replace the slug.

## Canonical ledger schema

`data/contributor-ledger.json` is the authored source of truth. Its top level contains:

- `schemaVersion`: ledger schema version.
- `profiles`: stable ID and ASCII slug, public display fields, optional confirmed organization,
  public links, avatar/monogram choice, confirmation date, and visibility. V1 proof cards always
  use a monogram so builds never fetch a contributor image from a third-party host.
- `organizations`: normalized public ID, name, and optional HTTPS URL.
- `events`: stable ID, acceptance date, source type and reference, public evidence URL, bilingual
  summary, locale-neutral target paths, and one or more credits.

Each credit contains a mode, controlled roles, and, unless anonymous, a profile reference.
`person+organization` also contains an organization reference. A reviewer credit additionally
contains bilingual `review.scope` and `review.reviewedAt`.

The executable schema in `scripts/contributor-data.mjs` rejects duplicate identities and slugs,
unknown roles, broken references, unsafe or private URLs, malformed dates, control characters,
emails, phone numbers, direct-messaging links, tokens, raw consent fields, and unconfirmed
high-trust profile claims. The generated
`app/generated/contributors.json` snapshot is schema v3 and must never be edited by hand.

## Recording accepted work

1. Confirm that the work is accepted and that its evidence URL is public.
2. Decide the event boundary and roles. Record the exact published target paths.
3. Confirm any new public identity or organization detail with the contributor.
4. Add or update the ledger entry. Put the current GitHub login on the profile; reserve identity
   aliases in `data/contributors-policy.json` for a historical login or another identity that the
   profile itself cannot represent. Core-team membership and opt-outs also stay there.
5. Run `npm run contributors:refresh`, `npm run contributors:cards`, and
   `npm run test:contributors`.
6. Run the production build. Check the index, both profile locales, affected page credits,
   proof card, and structured data before release.

An accepted contribution should be recorded within two working days. If evidence, naming
permission, or organization permission is unresolved, keep the identity private until it is
resolved rather than publishing a provisional claim.
