# Company directory and profiles

`/companies` and `/en/companies` provide a logo-led gallery, search, organization
and sector filters, Startup 50 and case-study filters, and an alphabetical order.
Filters use query parameters and survive profile return, Back and reload. All
profile content and the unfiltered gallery are present in static HTML.

## Visual integration

The directory extends the Field Manual recorded in `../DESIGN.md`: the existing
white canvas, green structure, blue source links, quiet borders and self-hosted
Bangla/platform Latin typography remain. `CompanyCatalogue.tsx`,
`CompanyProfile.tsx` and `companies.css` own this surface. Logo-led cards use modest
3px corners and a three-column gallery, reducing to two columns at 1000px and one
at 700px. Profiles put the organization and its work first; the desktop facts and
contents column follows the main reading content on phones.

These are scoped collection patterns, not a replacement theme. The implementation
introduces no font or motion dependency and reuses company marks through the
existing media registry and resolver. The system comparison required no changes
to `DESIGN.md` or `.impeccable/design.json`.

## Data ownership

D1 owns company identity, localized summaries, optional profile sections and official
contact details. `organization_profiles` is added by migration 0013. Its public JSON
has bilingual sections, links and claim-specific sources; no arbitrary HTML is
accepted. Export explicitly selects public fields. People, affiliations and typed
organization relationships use the shared identity model in `shared-identity.md`.
A public professional biography does not grant account ownership or edit access.

Startup 50 owns its selection, sector, background, financing narrative and lesson.
The investor directory owns comparison fields and application details. Profiles
resolve these records through explicit shared identity references; they do not copy
that research into a second authored file. Case studies resolve from finished content
in the manifest. Existing IDs and company slugs are preserved.

Migration 0013 bootstraps all 50 Startup 50 identities and all 10 investor-directory
identities, preserving Reverse Resources and adding SILQ as a separate group. The
ShopUp profile retains its original editorial slug. BAN portfolio mentions are not
investment claims; BWIN retains a separate identity despite sharing BAN's domain.

Three profiles have additional researched sections and contacts: 10 Minute School,
BAN and ShopUp. Roles and relationships show their as-of dates and evidence. The
other profiles use existing dated editorial research. Their publication does not
claim that every fact was freshly checked. Funding remains sourced narrative, with
no inferred total or valuation; structured funding events require a separate model.

## Release and verification

Apply forward migrations locally, then use `npm run ecosystem:prepare` to export a
frozen snapshot. Never hand-edit public JSON or generated company MDX. Normal
builds need no database access. The release writer stores drafts in bounded SQL
chunks to stay below D1's statement limit, verifies the stored JSON, then seals the
digest. A failed draft remains unpublished and cannot pass publication checks.

Remote migrations and the publication pointer are separate release operations.
Preparing this feature locally does not apply either to production. Follow the
backup, rehearsal and deployment sequence in `startup-ideas.md` before release.

Tests cover complete identity coverage, bilingual profile validation, safe links,
private-field exclusion, filters and migration/export behavior. Validate the actual
English and Bangla gallery/profile render at desktop and narrow phone sizes, plus
static links and metadata in the production export.

The 20 September 2026 local integration passed 458 repository tests, 11 targeted
release/identity tests, 12 company unit tests, and a production build with its SEO
audit. The export contained 126 company pages across both locales; 1,624 local
links and anchors passed validation. Seven advisory metadata-length findings were
retained rather than padded with invented copy. The visual detector reported six
typography advisories and no hard failures. These observations do not establish a
production release or replace the final rendered finish verdict.

## Discovery direction

A dedicated Companies sidebar item is deferred. The directory remains the existing
entry point for choosing and comparing ecosystem organizations. Each mapped
directory entry has a profile link alongside its official
website and comparison controls. Company profiles already link back to the investor
comparison directory. Resolve links through the shared identity crosswalk; do not
infer matches from names or domains or create duplicate profile records.

The 10 mapped investor records have profile links in both locales. Other categories
gain links only when their organization identities are mapped in the published
snapshot. The directory hub links to the full company gallery and retains Startup 50.
The crosswalk is resolved on the server; only the profile path reaches the directory client.

The final local pre-commit check on 20 September 2026 passed all 459 repository
tests. The production export passed its SEO audit, with the seven metadata-length
advisories noted above. All 126 company pages and 1,622 internal links and anchors
validated, along with all 20 investor profile links and both directory hub links.
Rendered checks covered 320px, 390px, 768px and 1440px layouts, English and Bangla,
directory comparison, gallery filters, empty-state recovery, keyboard activation
and filtered profile return. No functional errors or spacing defects were found
in these checks. Production publication remains a separate operation.
