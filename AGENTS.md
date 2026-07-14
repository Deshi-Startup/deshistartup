# deshistartup Agent Context

This is the committed operations manual and project map for Deshi Startup. Read it before touching
anything. For *what to build and write next*, the planning brain is `plan/` — start at
[`plan/README.md`](./plan/README.md). `README.md` (Bangla, mirrored by `README.en.md`) is the
public, contributor-facing front door — keep it short and inviting; the long-form vision/spec
lives in [`plan/vision.md`](./plan/vision.md).

## Project Overview

Deshi Startup is a free, open-source, Bangla-first knowledge base and practical operating manual for
building a **startup** in Bangladesh. The audience is founders building something new and scalable, and
the lens, depth, and priorities are theirs. Much of the foundational process (registration, tax,
payments, hiring) also serves any small business, and it's fine when a guide is useful beyond startups —
but never dilute the startup focus to chase generic SME, family-business, import/export, or
online-seller audiences. The name **Deshi
Startup** is final and the domain **deshistartup.com** is registered — name-dependent assets (logo,
.com/.org, Facebook page) are now safe to build.

Scale: ~430 Bengali pages are planned (see `plan/content-backlog.csv`); most are still honest
stubs. Never count a page as written unless it is a real, finished guide — boilerplate template
pages do not count. Run `npm run backlog:status` for live written/stub counts. Bengali is the
source of truth; English mirrors it at `/en/...`.

The site is a Next.js documentation app built with Nextra, statically exported, wrapped in a custom
wiki-style shell (not the stock Nextra theme).

## Key Technologies

- Next.js `^15.1.3` (using Turbopack for dev)
- Nextra docs theme (`nextra-theme-docs ^4.0.0`)
- React `18.3.1`
- Static export via Next.js (`output: 'export'`)
- Pagefind (`pagefind ^1.5.2`) for fast, static client-side search (runs automatically on `postbuild`)

## Important Files and Directories

- `app/` - Shared Next.js app shell, layouts, global CSS, components, and route groups.
- `app/(contents)/(bn)/` - Bengali content. Route-group folders do not appear in public URLs, so these pages render at clean root paths like `/start-here`, `/registration/private-limited`, and `/e-tin-vat-bin`.
- `app/(contents)/en/` - English localized content. These pages render at `/en/...`, for example `/en/start-here`.
- `app/components/LocalizedLayout.jsx` - Localized Nextra layout, language detection, sidebar ordering, and route-group page-map normalization.
- `app/components/LanguageSwitcher.jsx` - Switches between clean Bengali URLs and `/en/...` URLs.
- `_meta.js` files are intentionally not used under `app/` because Nextra validation does not work cleanly with the current route-group localization structure. Sidebar order is controlled programmatically in `LocalizedLayout.jsx`.
- `plan/` - The committed planning brain: the canonical content backlog, tiered source registry, case-study format, directory schema, founder journeys, and research/freshness cadences. Treat it as the source of truth for *what to build and write next*. Start at [`plan/README.md`](./plan/README.md).
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `.github/ISSUE_TEMPLATE/` - The bilingual contributor surface. The site's per-page "ভুল জানান" links open the `report-mistake.yml` issue form with the page prefilled; `.github/workflows/pr-checks.yml` runs `lint:bangla --strict` + build on every PR. `scripts/seed-issues.mjs` generates "নতুন গাইড" issues from High-priority backlog stubs.
- `knowledge-bank/` - Optional, local-only scraped source material for legal/business content. It is gitignored for copyright hygiene and may be absent — never rely on it existing, and never commit it.
- `app/generated/` - Build artifacts produced by `scripts/build-manifest.mjs` (`manifest.bn.json`, `manifest.en.json`, `sections-lite.json`, `seo-pages.json`). They are committed to git but must never be hand-edited; run `npm run manifest` (or any dev/build) to regenerate after content changes.
- `app/nav.config.js` - Hand-curated top-level sidebar (`bnNav` / `enNav`). `app/nav-groups.json` - hand-curated thematic grouping of section-hub listings.
- `public/` - Static assets used by the site, including the built Pagefind search index (`public/_pagefind`) and generated SEO/discovery files (`sitemap.xml`, `robots.txt`, `llms.txt`, IndexNow key, and route date maps). Do not hand-edit generated files; run `npm run manifest`.
- `scripts/build-manifest.mjs` - regenerates the navigation manifests. `scripts/scrape.js` - scraping utility used to gather external ecosystem data.

## Site Structure

**Topic-owned URLs (July 2026 migration).** Content lives at one canonical, topic-based URL of at
most two segments (`/{section}/{slug}`, mirrored at `/en/...`). The former `phase-one`…`phase-four`
stage sections were dissolved into topic sections; the staged path survives as curated *views* at
`/roadmap/{validate|build|grow|scale}`.

Each topic section hub lists its children automatically via
`<SectionIndex section="..." locale="..." />` (backed by the generated manifests). The sections:

- `start-here` — beginner roadmap and orientation
- `ideas`, `validation` — finding ideas/market research, and customer/demand validation
- `registration`, `licenses`, `tax`, `ip`, `trade` — paperwork: company setup, approvals, tax/VAT, IP, import-export
- `payments`, `customers`, `b2b`, `operations`, `metrics`, `funding` — money, sales, delivery, numbers
- `product`, `manufacturing`, `cofounders`, `team` — building the product and the people
- `growth`, `industries`, `ecosystem` — expansion, sector playbooks, government support/community
- `roadmap` — the four staged views; `guides` — the browse-all-topics page
- `journeys` — goal-based guided paths ("কোন পথে যাবেন") that stitch existing guides into an ordered path (source: `plan/workflow-maps.csv`)
- `case-studies`, `directory`, `founder-life`, `tools`, `contribute`
- Root cornerstones kept as short standalone URLs: `/company-types`, `/trade-license`,
  `/rjsc-name-clearance`, `/e-tin-vat-bin`, `/legal-roadmap`, `/about`, `/sitemap`

**URL policy (enforced by `npm run lint:routes`, which runs in `prebuild`):** max two semantic
segments (excluding `/en`); leaf slug normally 2–5 words; target path length under 45 characters,
warn above 60, hard-fail above 75; lowercase ASCII `a-z0-9-` only; no full-headline slugs, no brand
lists, no filler (`how-to`, `guide`, `step-by-step`) when context already carries it. Permanent URLs
are never derived from editable titles — the backlog's `Path` column and the content tree are the
registry. The bn and en trees must mirror exactly, and a `<StubNotice path>` must equal its page's
slug (both are lint errors).

**The source of truth for what exists is `app/generated/manifest.bn.json` / `manifest.en.json`; the
source of truth for what *should* exist is `plan/content-backlog.csv` (its `Path` column is the
canonical route registry). Never hand-maintain page lists in this doc — they drift.** To see the
current page inventory, read the manifests or run `npm run manifest` and inspect them.

## Choosing what to work on

1. Open `plan/content-backlog.csv` and filter for `Priority=High` rows whose site page is still a
   stub (a page containing a `<StubNotice ... />` line). Cross-check status against the manifests
   (run `npm run backlog:status` to generate the local, git-ignored `plan/status-report.md`).
2. Prefer topics whose `Notes` column gives you an angle to write from.
3. Write the Bengali page first, then create the English mirror at the matching `/en/...` slug.
4. Delete the `StubNotice` line **only** when the page is a real, finished guide — that single line
   is what flips the page to "written" everywhere (manifest, badges, search rank).
5. Run `npm run manifest` after content or structural changes.

## Content types & page anatomy

- **Guide** (the default): YAML frontmatter (`title`, `description`) → one `#` title →
  `> **সারকথা:**` 3–4 line summary → `##` sections (typically কার কখন দরকার / ধাপে ধাপে কী করবেন /
  খরচ ও সময় / সাধারণ ভুল) → a checklist → `## প্রাসঙ্গিক সূত্র`. Exemplar: `/start-here`
  (`app/(contents)/(bn)/start-here/page.mdx`) — সারকথা opener, decision tables, checklists, sourced
  links, natural spoken Bangla.
- **Case study**: follows the 15 fields of `plan/case-study-format.md`. Suggested Bengali headings for
  the 15 fields (used by the exemplar at `/case-studies/pathao`): এক নজরে · সমস্যা · সমস্যাটি
  বাংলাদেশ-নির্দিষ্ট কেন · শুরুর ইনসাইট · প্রথম ওয়েজ · প্রথম গ্রাহক · বিশ্বাস তৈরি · স্থানীয় শিক্ষা ·
  বাধা ও সীমাবদ্ধতা · বিজনেস মডেল · মূলধন ও ফান্ডিং · যা অনুকরণ করতে পারেন · যা অনুকরণ করবেন না ·
  যা এখনো অজানা · সূত্র. Source-backed only: separate facts from anecdotes, cite every factual claim,
  never overclaim.
- **Directory page**: data-backed, not prose. Entries live in `data/directory/*.json` and are
  rendered by a component — never hand-maintained prose tables. Directory entries must include
  `name`, `type`, `stage`, `sectors`, `website`, `sourceUrl`, and `lastVerified`; use `null` or
  "Not publicly stated" for cheque size, cohort timing, deadlines, or equity terms you cannot
  verify from public sources. Re-check directory entries quarterly against official websites or
  reliable public profiles before bumping `lastVerified`.
- **Journey / guided-path page**: a short, goal-based wayfinding page that stitches existing guides
  into an ordered path — frontmatter → `#` title → `> **সারকথা:**` → a short intro → an ordered
  `## ধাপে ধাপে পথ` list where each step links an existing guide → `## এই পথের চেকলিস্ট` →
  `## এরপর কোন পথে` cross-links to sibling journeys. Lives under the `journeys` section
  (`/journeys/...`, mirror at `/en/journeys/...`). Because it links internal guides, it needs no
  external `## প্রাসঙ্গিক সূত্র`. The 12 journeys come from `plan/workflow-maps.csv`; add a new one
  there first, then register its slug in `app/nav-groups.json` under `journeys`. Never link a route
  that does not exist — check against `app/generated/manifest.bn.json`.
- **Template / checklist / script pages**: copy-paste-ready blocks with minimal theory.
- **Calculators**: client components are allowed here — the one sanctioned exception to the
  near-zero-JS budget. Keep them dependency-free (no heavy libraries).

## Style guide (Bangla)

**[`STYLE.md`](./STYLE.md) is the binding Bangla style standard — read it before writing or
editing any Bengali content.** It exists because a 2026-07 language audit found content that was
thought in English and rendered in Bangla; the guide defines the natural Bangladeshi register
(the way founders actually write on Facebook/LinkedIn and in good Bangla blogs) and bans the
translationese patterns found on this site. The essentials:

- **Think in Bangla.** Never draft in English and translate. If a sentence back-translates
  word-for-word into fluent English, restructure it. Read the page aloud before finishing.
- সহজ, প্রচলিত বাংলা; "আপনি" register ("আপনি আবেদন করবেন" – "আবেদন করা হইবে" নয়).
- Natural skeletons: "-লে" conditionals over যদি…তাহলে; verbs over verbal nouns
  (কনফার্ম করুন, not নিশ্চিতকরণ); আর/ও + short sentences over এবং-chains; drop এটি/আপনার
  where context carries it; no semicolons in Bangla prose; vary sentence length; direct
  questions and "ধরুন…" scenarios are encouraged.
- Banned calques (full table in STYLE.md §3.1): ব্যবসা-থেকে-ব্যবসা → বিটুবি (B2B); ক্রয়াদেশ →
  পারচেজ অর্ডার (PO); গ্রাহক অর্জন → গ্রাহক পাওয়া; রূপান্তর → কনভার্শন; নিশ্চিতকরণ → কনফার্ম করা।
- প্রচলিত ইংরেজি টার্ম বাংলা হরফে (ট্রেড লাইসেন্স, ভ্যাট, ফাউন্ডার, এমভিপি); explain each new
  term at first use ("ইকুইটি (equity) মানে কোম্পানির মালিকানার ভাগ"); Latin script only for
  metric/document acronyms (MRR, SaaS, e-TIN), portal/form names, and non-Bangla brands.
  Never leave ordinary English words untransliterated mid-sentence.
- বাংলা বাক্যে বাংলা সংখ্যা ("ফি ৫০০ টাকা", "ধাপ ৩"); টাকা লাখ/কোটিতে; year-stamp every
  fee/number ("২০২৬ সালের হিসাবে ফি ৩,০০০ টাকা").
- আইন, ফি ও নিয়মের দাবিতে সূত্র দিন (সরকারি পোর্টাল সবচেয়ে ভালো); যা নিশ্চিত নন, লিখবেন না —
  অনুমান লিখলে "যাচাই প্রয়োজন" বলে দিন।
- **Adapt, don't translate.** Copyrighted third-party work (YC, Stripe, LightCastle and similar) must
  be *adapted* — teach the ideas in our own Bangla and cite the source; never translate or copy it.
  Government/official sources may be used freely with citation.
- Use `## প্রাসঙ্গিক সূত্র` (Bangla) / `## Relevant Sources` (English) for source lists, with
  root/section URLs from `plan/sources.csv`. For a load-bearing data claim or figure, a stable exact
  report/dataset link is allowed only after it has been verified and recorded in that registry.
  Never guess or invent deep links. See `EDITORIAL.md` §8.3.
- `/start-here` is the bar for depth and tone. Match it.
- Before finishing any Bangla page, run `npm run lint:bangla` (`scripts/bangla-lint.mjs`) and
  clear the hard (✖) findings; then run the STYLE.md §7 read-aloud checklist — the linter only
  catches the mechanical tells.

## Editorial guide (pedagogy)

**[`EDITORIAL.md`](./EDITORIAL.md) is the binding editorial/teaching standard — read it together
with STYLE.md before writing any content page (both locales).** STYLE.md governs how the Bangla
reads; EDITORIAL.md governs what a page teaches and how: write for a non-technical
first-generation founder, run every hard concept through the five-step teaching loop (name →
plain definition → one দেশি metaphor → worked টাকা example → so-what), no naked abstractions
(named people, real cities, worked arithmetic), signalled "ধরুন…" scenarios and micro-stories,
legal rules translated into "আপনার জন্য এর মানে" decision language, a concrete next action with
কোথায়/কী লাগবে/খরচ/সময়, one memorable থাম্ব রুল per page, inline source attribution, and an
absolute ban on fabricated facts, statistics, or anecdotes. Every page must pass the EDITORIAL.md
§12 checklist alongside STYLE.md §7 before it is done.

## Content & Editorial Guidelines

- **Language & pedagogy:** Bengali pages follow the Style guide (Bangla) section above —
  `STYLE.md` is binding, don't restate its rules here. `EDITORIAL.md` (Editorial guide section
  above) is equally binding for *both* locales — it defines how pages teach, not just how they
  read. English pages: use clear English, leave no Bengali text behind.
- **Localization:** Do not replace Bengali content when localizing — create/update the matching page
  under `app/(contents)/en/...`, keeping slugs and folder structure aligned across locales.
- **Routing / internal links:** Always write internal links as **root-relative canonical paths** —
  `/registration/private-limited` in Bengali pages, `/en/registration/private-limited` in English
  pages. Never use relative forms (`../section/slug`, `sibling-slug`): they depend on the linking
  page's depth and broke silently before the July 2026 migration canonicalized all 800+ files. The
  MDX anchor wrapper (`mdx-components.js`) and `localHref()` add the deployment basePath for the
  GitHub Pages mirror, so content never hard-codes it.
- **Punctuation in page content:** Never use an em dash in page copy, titles, or descriptions
  under `app/(contents)/` (this doc and other meta files are exempt). Use an en dash (–), a comma,
  or split into two sentences instead. The full dash rule lives in STYLE.md §4.3 and
  `npm run lint:bangla` enforces it as a hard (✖) finding, both locales; the content tree is
  already em-dash-free.
- **Writing a stub into a real guide:** research the topic properly (web search, official portals,
  the relevant Act/NBR/RJSC text) rather than relying on assumptions. Before publishing, check
  `app/nav-groups.json` and sibling stub titles in the same section for topic overlap — if two
  slugs cover the same ground, scope the new guide to its unique angle and cross-link to the other
  slug instead of duplicating content. Verify the stub's pre-listed sources are actually relevant;
  drop irrelevant ones. Run `npm run build` after writing to confirm it compiles and is grouped
  correctly.
- **Navigation:** Section hub pages list their children automatically via `<SectionIndex ... />`.
  Only the curated top-level sidebar lives in `app/nav.config.js` — update it when adding a new
  top-level guide. Thematic grouping of hub lists lives in `app/nav-groups.json` (hand-curated) —
  add a brand-new page's slug to the right group; unlisted pages fall back to an "আরও গাইড" group.
- **Stub pages:** Unwritten topics contain a `<StubNotice path="section/slug" locale="bn|en" />`
  banner plus a sources list — nothing else. Never imitate a finished guide on a stub. When writing
  the real guide, delete the `StubNotice` line.
- **Local Context:** Always tailor advice to the Bangladeshi market — Mobile Financial Services
  (bKash/Nagad), Cash on Delivery (COD), Facebook-first growth, and low-trust market dynamics.
- **Accuracy:** Cross-reference local laws and fees (RJSC fees, NBR VAT thresholds, trade license
  processes) with current realities (year-stamping is covered in the Style guide section above).
- **Formatting:** Standard Nextra MDX with `title`/`description` frontmatter on every page.

## Licensing

- **Code:** MIT.
- **Content** (everything under `app/(contents)/`): Creative Commons Attribution-ShareAlike 4.0
  (CC BY-SA 4.0).
- Contributions are accepted under these licenses. See `LICENSE` and `LICENSE-content.md` for the
  authoritative text and attribution format.

## Keeping content current

- Legal, tax, and fee pages carry an optional `verified: YYYY-MM-DD` frontmatter field, separate
  from the automatic "last updated" (last-commit) date. Only set or bump `verified:` after actually
  re-checking the page's claims against official sources — never as a drive-by edit.
- `plan/maintenance-calendar.md` is the freshness cadence: what to re-check, where, and how often
  (annual budget-speech mining, monthly RJSC/NBR/VAT-circular checks, quarterly directory
  re-verification, and ongoing rules for legal pages and source attribution). Treat an overdue item
  on that calendar as higher-priority than most unwritten stubs.
- `plan/sources.csv` is the tiered source registry to re-check against; `plan/research-ops.csv` is
  the raw cadence data the calendar was generated from.

## Build and Run Commands

- `npm run dev` - Start development server (uses Turbopack; `predev` regenerates the content manifest first)
- `npm run build` - Build the static site (`prebuild` regenerates the manifest; postbuild runs Pagefind indexing)
- `npm run manifest` - Regenerate `app/generated/manifest.*.json`, `sections-lite.json` and `public/page-dates.json` from the content tree + git dates
- `npm run lint:routes` - Enforce the URL policy (segment depth, path length, slug charset, bn/en mirror, StubNotice paths); also runs automatically in `prebuild`
- `npm run seo:audit` - Validate the built HTML, canonicals, hreflang, indexability, metadata, JSON-LD, sitemap, robots, and internal links
- `npm run seo:indexnow:dry` - Preview the canonical URL batch for IndexNow; use `npm run seo:indexnow` only after a deployment is live
- `npm start` - Start the production server
- `npm run scrape` - Run the scraping utility

## Deployment

- **Production (`main` branch → Cloudflare Pages → `deshistartup.com`):** the live, canonical site
  is the apex domain, built by Cloudflare Pages from `main`. Cloudflare's build sets `CF_PAGES=1`,
  which drops the basePath (see `next.config.mjs`), so canonical URLs are generated at the root.
  `plan/seo-operations.md` is the operational source of truth for search discovery.
- **Mirror (`main` branch → GitHub Pages):** `.github/workflows/deploy.yml` runs `npm run build`
  and publishes `out/` under the `/deshistartup` project basePath. This is why internal links must
  stay basePath-agnostic (root-relative in content; `localHref()` / `NEXT_PUBLIC_BASE_PATH` in
  components) — do **not** remove that mechanism while the mirror exists.
- **Secondary (`vinext` branch → Cloudflare Workers):** `.github/workflows/deploy-cloudflare.yml` deploys production and per-PR previews using `vinext`-only tooling (not present on `main`).
- CI uses Node 22. `images.unoptimized` is required for static export. **Pushing `main` deploys the live site — never push unless Shamir asks.**

## Design System (July 2026 redesign)

- All styling lives in `app/globals.css` as a token-based design system ("national reference work" aesthetic: Bangladesh-green structure, warm paper, serif Bangla display headings, wiki-blue links).
- **Do not redesign the shell.** The Wikipedia-clone look (paper background, white canvas, green top rule, no right ToC rail) is a deliberate choice.
- Fonts are self-hosted in `app/fonts/` (Noto Sans Bengali variable + Noto Serif Bengali 700, Bengali subset, `local()`-first so most Android devices download nothing). Do not add render-blocking Google Fonts links.
- Bangla UI text uses Bengali numerals (০-৯); dates render via `toLocaleDateString('bn-BD')`.
- Per-page chrome (breadcrumbs, last-updated meta bar, edit/history/report links, ToC rail, article footer) is generated in `app/components/LocalizedLayout.jsx` from the pathname – content pages need no extra markup.
- Performance budget: article critical path (HTML+CSS) under ~150 KB; keep article pages near-zero JS and never add autoplaying/heavy embeds. Calculators and the directory are the sanctioned exceptions — still no heavy libraries.

## Notes for Agent Use

- Prefer content already in `app/` and the planning brain in `plan/` over inferred assumptions about "standard" startup processes — Bangladesh has unique constraints.
- The project is a static docs site, so changes should preserve the Nextra page layout and route-group structure. Route groups are used intentionally: `(contents)` and `(bn)` organize files without changing public URLs.
- Do not reintroduce `_meta.js` under `app/` unless the route-group validation issue has actually been solved.
- After making structural or content changes, run `npm run manifest`, then `npm run build` before finishing. CI uses Node 22 — if the local Node runtime is too old for the build, report that clearly instead of assuming the content change is broken.
