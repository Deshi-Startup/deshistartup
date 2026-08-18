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

A headline is durable professional context, not evidence of expertise. Prefer a broad practice area
such as “Data & AI Professional” or “Management Consultant” over a promotion-sensitive internal
title. Ask the contributor to approve the exact public wording and store it without expansion or
embellishment. Record the employer through the separate organization field so the public line does
not repeat it. A LinkedIn page, company biography, or search result can help frame the question,
but cannot replace confirmation. Reconfirm the headline or organization before a material change
goes live; never infer a credential or an “expert” label from a job title.

### Avatar sources and media lifecycle

Every public profile makes one explicit avatar choice:

- `monogram` is the default. It has no external dependency and needs no image permission.
- `github` is available only for a confirmed profile with a matching `githubLogin`. An explicit
  `npm run contributors:refresh` uses GitHub's supported user API, checks that the returned login
  and avatar host match the expected account, and writes a 160-pixel GitHub avatar URL into the
  static snapshot. Ordinary builds and page views never call the GitHub API. A changed GitHub photo
  is not reflected until the next successful refresh; the browser still requests the resulting
  image from GitHub's avatar host. A failed lookup, mismatched login, or unsafe/missing avatar fails
  the refresh before writing and preserves the last-good snapshot; it never silently changes the
  contributor to a monogram.
- `media` points to the exact logical path `/media/contributors/{slug}.webp`. Its bytes live in R2,
  and the logical path must exist in `app/generated/media.json`. Media lint and prune treat this
  ledger reference exactly like an article image, so an active avatar cannot be reported or
  retired as unused. The public contributor snapshot keeps this logical path; the shared media
  resolver turns it into the current content-addressed delivery URL when the static page renders.
- `url` is a migration-only exception for the two GitHub avatar URLs that appeared on the previous
  contributor page. Each exact profile-to-URL pair is listed in
  `data/contributors-policy.json#legacyAvatarUrls`. The validator rejects every other `url`, even
  when a contributor has a confirmation date. Do not add new entries to this allowlist; use
  `github`, `media`, or `monogram` for all new and updated profiles.

For a LinkedIn, company-site, publication, or personal-site photo, the contributor must provide an
approved copy or expressly authorize a specific copy they have the right to share. Ingest it once:
stage the reviewed WebP at `media/contributors/{slug}.webp`, run `npm run media:upload`, and record
the logical path as `kind: "media"`. Keep the permission evidence outside the repository. Never
scrape LinkedIn or another website, never discover photos on an automated schedule, and never
hotlink an arbitrary third-party image. Public availability is not publication permission.

Replacing a `media` avatar keeps the logical path and uploads new content-addressed bytes; the media
registry records the superseded object for the normal retirement grace period. Reconfirm the new
photo before replacement. On photo withdrawal or profile opt-out, remove the media choice (use a
monogram if the profile remains public), refresh the contributor snapshot, then use the existing
dry-run-first media prune process to retire and eventually delete the now-unreferenced R2 object.

An opt-out removes the profile and ranked identity. The generator converts the person's retained
events to anonymous credit and the next card build removes stale proof-card assets. Renames keep
the stable profile ID and slug unless there is a safety reason to replace the slug.

## Canonical ledger schema

`data/contributor-ledger.json` is the authored source of truth. Its top level contains:

- `schemaVersion`: ledger schema version.
- `profiles`: stable ID and ASCII slug, public display fields, optional confirmed organization,
  public links, one of the `monogram`, `github`, or `media` avatar choices, confirmation date, and
  visibility. The migration-only `url` form is controlled by the policy allowlist and is not a
  supported choice for new profiles. V1 proof cards always use a monogram so card builds never
  fetch a contributor image from a third-party host.
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
3. Confirm the exact wording of any new public headline or organization detail, every public link,
   and the selected avatar with the contributor.
4. Add or update the ledger entry. Put the current GitHub login on the profile; reserve identity
   aliases in `data/contributors-policy.json` for a historical login or another identity that the
   profile itself cannot represent. Core-team membership and opt-outs also stay there.
5. For a `media` avatar, upload the approved WebP through the normal media workflow before
   refreshing contributors. Run `npm run contributors:refresh`, `npm run contributors:cards`,
   `npm run lint:media`, and `npm run test:contributors`.
6. Run the production build. Check the index, both profile locales, affected page credits,
   proof card, and structured data before release.

An accepted contribution should be recorded within two working days. If evidence, naming
permission, or organization permission is unresolved, keep the identity private until it is
resolved rather than publishing a provisional claim.
