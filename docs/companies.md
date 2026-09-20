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

The initial release added researched sections and contacts for 10 Minute School,
BAN and ShopUp. Later enrichment batches are recorded below. Roles and relationships show their as-of dates and evidence. Profiles also
retain existing dated editorial research. Their publication does not
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

## First enrichment batch - 21 September 2026

Migration `0015_company_profile_batch_one.sql` expands five existing profiles:
Pathao, PriyoShop, Dorik, iFarmer and Startup Bangladesh Limited. This batch adds
14 bilingual sections, seven public professional identities with dated roles, and
two Startup Bangladesh portfolio mentions (Pathao and iFarmer). It adds no routes,
account bindings or new schema. Existing case studies and editorial research remain
linked with their original dates.

Evidence comes from the organizations' official product, team and contact pages;
each new claim carries its source and check date in the profile. Pathao Commerce
uses the dated 10 September 2026 announcement. Startup Bangladesh's current contact
page takes precedence over the older FAQ's email domain. The portfolio entries are
explicitly mentions, not assertions of round size, ownership or investment terms.

Gaps deliberately remain: Dorik has a verified support email but no office address
confirmed in this batch; Pathao's protected email was not guessed, so the profile
uses its public telephone and contact page. The founders listed are not claimed to
be exhaustive. iFarmer's ambiguous combined Singapore address was omitted in favour
of its clearly published Bangladesh office. No funding total or valuation was added.
Chaldal was researched but deferred because it is not an existing company record.

The migration and snapshot are prepared locally. Production migration, deployment
and publication-pointer advancement remain separate authorized release steps.

Validation: all 460 tests and the production build passed. The static export check
covered 126 company pages and 1,746 internal links and anchors; all 28 localized
new sections and contact emails were present. Browser checks covered all ten
enriched pages at 320px, plus representative 390px and 1440px layouts. A long
contact email overflow was fixed with wrapping; no horizontal overflow or browser
errors remained. The SEO audit retained seven existing metadata-length advisories.

## Catalogue enrichment - 21 September 2026

Migration `0016_company_catalogue_enrichment.sql` adds bilingual product/service
sections to the remaining 54 existing organizations, 38 public professional
identities with sourced roles, and 11 typed portfolio mentions. It preserves the
eight earlier expanded profiles and every existing company ID, slug, crosswalk,
relationship and editorial research date. No account bindings or new company
routes are introduced.

`data/research/company-coverage.json` records a disposition, evidence URLs and
remaining gaps for all 62 organizations. Of this pass's 54 profiles, 51 have useful
current primary-source enrichment; Loop Freight, Shuttle and BVCL are explicitly
source-limited. The other eight retain their earlier research dates. No existing
organization is left unreviewed, but this is not a complete founder, funding or
office registry. The coverage file is an editorial record, not a runtime input or
a promise that absent details do not exist.

Source limitations are recorded per organization. In particular, inaccessible
official pages sometimes required indexed official text; Bimafy's conflicting
addresses were omitted; placeholder team members, phone numbers and email links
were excluded. Startise's group executives were not assigned to WPDeveloper.
BAN and BWIN remain separate, and investor portfolio listings are not converted
into investment amounts or ownership claims. IDLC's application closure is dated
to the observed page, and its planned second fund is not described as launched.

Bangla copy was reviewed against the English facts and through a written
back-translation pass. Source qualifications, planned services and group/company
distinctions remain in both editions. Contact sections render only when at least
one verified contact field exists; phone links use a general phone label because
some published numbers are office contacts rather than support hotlines.

The migration was rehearsed against all preceding migrations with foreign-key
and integrity checks. Every pre-existing row was preserved, and only profiles,
people, affiliations, organization relationships and editorial review events
gained rows. The local snapshot was prepared without advancing a publication
pointer. Production migration, deployment and publication remain separate steps.

The rendered review also corrected Anchorless's older directory application and
cheque-size fields using the official site's linked application form. The new
field-level check date is explicit; the record's overall verification date is
retained because this was not a complete directory-record refresh.

Final validation: 461 repository tests passed, followed by seven focused profile
and directory tests after the application-field correction. The production build,
route/media/citation/glossary checks and SEO audit passed; seven existing
metadata-length advisories remain. All 126 company routes and 2,354 internal links
and anchors validated. Export checks confirmed all 124 localized profiles, 146
localized sections, 102 rendered professional roles and 90 contact sections.
All 124 profiles passed a 320px overflow check, with representative visual checks
at 390px, 768px and 1440px. Investor filtering and filtered profile return worked;
no browser errors or broken images were observed. The corrected Anchorless fields
were checked in both company and directory editions. Bangla checks reported no
hard findings; advisory wording checks received editorial review.
