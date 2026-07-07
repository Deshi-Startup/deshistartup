# deshistartup Agent Context

This is the committed operations manual and project map for Deshi Startup. Read it before touching
anything. For *what to build and write next*, the planning brain is `plan/` — start at
[`plan/README.md`](./plan/README.md). `README.md` covers project vision and scope.

## Project Overview

Deshi Startup is a free, open-source, Bangla-first knowledge base and practical operating manual for
building **any** business in Bangladesh — startups are the wedge and the tone-setter, but SMEs,
trade/import-export, family businesses, and online sellers are equally in scope. Never narrow a guide
to venture-backed startups when the underlying process (license, tax, payments, hiring) applies to
all businesses. The name "Deshi Startup" is provisional (rebrand poll pending) — don't invest in new
name-dependent assets (logos, paid domains) until it's finalized.

Scale: ~374 Bengali pages are planned (see `plan/content-backlog.csv`), ~57 written so far; the rest
are honest stubs. Bengali is the source of truth; English mirrors it at `/en/...`.

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
- `app/(contents)/(bn)/` - Bengali content. Route-group folders do not appear in public URLs, so these pages render at clean root paths like `/start-here`, `/phase-one`, and `/e-tin-vat-bin`.
- `app/(contents)/en/` - English localized content. These pages render at `/en/...`, for example `/en/start-here`.
- `app/components/LocalizedLayout.jsx` - Localized Nextra layout, language detection, sidebar ordering, and route-group page-map normalization.
- `app/components/LanguageSwitcher.jsx` - Switches between clean Bengali URLs and `/en/...` URLs.
- `_meta.js` files are intentionally not used under `app/` because Nextra validation does not work cleanly with the current route-group localization structure. Sidebar order is controlled programmatically in `LocalizedLayout.jsx`.
- `plan/` - The committed planning brain: the canonical content backlog, tiered source registry, case-study format, directory schema, founder journeys, and research/freshness cadences. Treat it as the source of truth for *what to build and write next*. Start at [`plan/README.md`](./plan/README.md).
- `knowledge-bank/` - Optional, local-only scraped source material for legal/business content. It is gitignored for copyright hygiene and may be absent — never rely on it existing, and never commit it.
- `app/generated/` - Build artifacts produced by `scripts/build-manifest.mjs` (`manifest.bn.json`, `manifest.en.json`, `sections-lite.json`). They are committed to git but must never be hand-edited; run `npm run manifest` (or any dev/build) to regenerate after content changes.
- `app/nav.config.js` - Hand-curated top-level sidebar (`bnNav` / `enNav`). `app/nav-groups.json` - hand-curated thematic grouping of section-hub listings.
- `public/` - Static assets used by the site, including the built Pagefind search index (`public/_pagefind`) and `page-dates.json` (route → last commit date).
- `scripts/build-manifest.mjs` - regenerates the navigation manifests. `scripts/scrape.js` - scraping utility used to gather external ecosystem data. `scripts/rewrite-stubs.mjs` - one-time stub-migration helper.

## Site Structure

The site is organized into section hubs, each of which lists its children automatically via
`<SectionIndex section="..." locale="..." />` (backed by the generated manifests). The main hubs are:

- `start-here` — beginner roadmap and orientation
- `idea-validation` — customer discovery, market sizing, MVP tests
- `phase-one` → `phase-four` — the staged founder roadmap (idea → foundation → product/team/rules → sell & fund → scale & policy)
- `journeys` — goal-based guided paths ("কোন পথে যাবেন") that stitch existing guides into an ordered path (source: `plan/workflow-maps.csv`)
- `case-studies` — source-backed stories of Bangladeshi startups
- `directory` — data-backed ecosystem directory (investors, accelerators)
- `founder-life` — mental health, family constraints, solo-founder realities
- `contribute` — how to report, edit, and write guides

**The source of truth for what exists is `app/generated/manifest.bn.json` / `manifest.en.json`; the
source of truth for what *should* exist is `plan/content-backlog.csv`. Never hand-maintain page lists
in this doc — they drift.** To see the current page inventory, read the manifests or run
`npm run manifest` and inspect them.

## Choosing what to work on

1. Open `plan/content-backlog.csv` and filter for `Priority=High` rows whose site page is still a
   stub (a page containing a `<StubNotice ... />` line). Cross-check status against the manifests
   (see also T4's `plan/status-report.md` once it exists).
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

Write in সহজ, প্রচলিত বাংলা with the "আপনি" register. The core rules (lifted from the `/contribute`
page's লেখার নিয়মকানুন table):

| নিয়ম | উদাহরণ |
|---|---|
| সহজ, প্রচলিত বাংলা; "আপনি" সম্বোধন | "আপনি আবেদন করবেন" – "আবেদন করা হইবে" নয় |
| প্রচলিত ইংরেজি টার্ম বাংলা হরফে রাখুন | ট্রেড লাইসেন্স, ভ্যাট, ব্যাংক অ্যাকাউন্ট, মার্কেটিং |
| নতুন টার্মের প্রথম ব্যবহারে ব্যাখ্যা দিন | "ইকুইটি (equity) মানে কোম্পানির মালিকানার ভাগ" |
| বাংলা বাক্যে বাংলা সংখ্যা | "ফি ৫০০ টাকা", "ধাপ ৩" |
| আইন, ফি ও নিয়মের দাবিতে সূত্র দিন | সরকারি পোর্টাল (RJSC, NBR, বাংলাদেশ ব্যাংক) সবচেয়ে ভালো |
| ফি/তারিখ লিখলে সাল উল্লেখ করুন | "২০২৬ সালের হিসাবে ফি ৩,০০০ টাকা" |
| যা নিশ্চিত নন, লিখবেন না | অনুমান লিখলে "যাচাই প্রয়োজন" বলে দিন |

- **Adapt, don't translate.** Copyrighted third-party work (YC, Stripe, LightCastle and similar) must
  be *adapted* — teach the ideas in our own Bangla and cite the source; never translate or copy it.
  Government/official sources may be used freely with citation.
- Use `## প্রাসঙ্গিক সূত্র` (Bangla) / `## Relevant Sources` (English) for source lists. Use only
  root/section URLs from `plan/sources.csv` — never invent deep links.
- `/start-here` is the bar for depth and tone. Match it.

## Content & Editorial Guidelines

- **Language:** For Bengali pages, write in clear, natural, spoken Bangla; keep common English
  startup/legal terms (MVP, VAT, Product-Market Fit) transliterated where founders will meet them in
  real documents, and explain each on first use. For English pages, use clear English and leave no
  Bengali text behind.
- **Localization:** Do not replace Bengali content when localizing — create/update the matching page
  under `app/(contents)/en/...`, keeping slugs and folder structure aligned across locales.
- **Routing:** Bengali pages link to clean root URLs such as `/customers`; English pages link to
  `/en/...` URLs such as `/en/customers`. Internal links must go through `localHref()` /
  `NEXT_PUBLIC_BASE_PATH` so they survive the GitHub Pages `/deshistartup` basePath.
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
  processes) with current realities, and year-stamp every fee/number.
- **Formatting:** Standard Nextra MDX with `title`/`description` frontmatter on every page.

## Licensing

- **Code:** MIT.
- **Content** (everything under `app/(contents)/`): Creative Commons Attribution-ShareAlike 4.0
  (CC BY-SA 4.0).
- Contributions are accepted under these licenses. See `LICENSE` and `LICENSE-content.md` (added by
  task T3) for the authoritative text and attribution format.

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
- `npm start` - Start the production server
- `npm run scrape` - Run the scraping utility

## Deployment

- **Primary (`main` branch → GitHub Pages):** `.github/workflows/deploy.yml` runs `npm run build` and publishes `out/`. Because it is a GitHub Pages *project* site, production builds set `basePath` and `NEXT_PUBLIC_BASE_PATH` to `/deshistartup` (see `next.config.mjs`). All internal links must go through `localHref()` / `NEXT_PUBLIC_BASE_PATH`, or they break in production.
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
