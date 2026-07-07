# Overhaul plan — July 2026

Created 2026-07-07 from a full project audit (Fable session). This file is written so that **any
capable model (Opus/Sonnet) can execute one task per session with zero extra context**. All
audit conclusions and decisions are embedded below — do not re-derive or re-litigate them.

**How to execute:** start a session, say *"Execute task T\<N\> from `plan/overhaul-2026-07.md`,
then stop."* Finish with a commit (suggested message given per task). **Do not push unless Shamir
says so — pushing `main` deploys the live site.** Mark the task's checkbox here in the same commit.

Recommended order: T1 → T2 → T3 → T4, then T5–T10 in any order. T11 is optional/later.

---

## Locked decisions (2026-07-07, by Shamir — do not re-open)

1. **Scope:** ALL business types in Bangladesh — startups are the wedge and tone-setter, but SMEs,
   trade/import-export, family businesses, and online sellers are equally in scope. Never narrow a
   guide to venture-backed startups when the process (license, tax, payments, hiring) applies to
   every business.
2. **Name:** "Deshi Startup" stays **for now**; it is a working title pending an internal poll.
   Don't invest in new name-dependent assets (logos, paid domains) until finalized.
3. **License:** MIT for code, **CC BY-SA 4.0 for content** (T3).
4. **Planning files** live publicly in `plan/`. The repo stays public for now; a possible future
   move to wiki software is deferred — do **not** architect for it.
5. **Contribution model:** GitHub-backed with review, exactly as `/contribute` describes (report →
   small edit → write a guide). Never unreviewed publishing on legal/tax/compliance pages.
6. **Editorial:** *adapt, don't translate* copyrighted third-party work (YC/Stripe/LightCastle —
   teach the ideas in our own Bangla, cite them). Government/official sources may be used freely
   with citation. Bengali content is the source of truth; English mirrors it.

## Facts you would otherwise re-derive

- Content scale: **374 bn pages / 372 en pages; 317 stubs per locale; ~57 written bn guides.**
  A stub = page containing `<StubNotice path=... locale=... />`. Deleting that line flips the page
  to "written" everywhere (manifest, badges, search rank).
- `plan/content-backlog.csv` (393 rows) is the canonical backlog. Its **"Case Studies" section
  (40 rows) has NO pages on the site yet** — that's task T5. Directory topics exist only as prose
  stubs — T6 builds the real data-backed directory.
- Stub "প্রাসঙ্গিক সূত্র" lists are mostly **boilerplate** (Bangladesh Bank / NBR / RJSC on every
  page, e.g. on `landing-page-template` where none is relevant) — T8 fixes this from `plan/sources.csv`.
- `public/page-dates.json` is **last-commit date**, not verification date. "Last verified" is a
  different, stronger claim — T7 adds it.
- The best style guidance currently lives on the `/contribute` page (its "লেখার নিয়মকানুন" table),
  not in agents.md — T1 lifts it into the steering doc.
- `context/` and `knowledge-bank/` are empty locally and gitignored; agents.md still calls them
  "the brain" — T1 fixes the reference (the brain is now `plan/`).
- Quality bar exemplar: `/start-here` (`app/(contents)/(bn)/start-here/page.mdx`) — সারকথা opener,
  decision tables, checklists, sourced links, natural spoken Bangla.

## Guardrails for every task

- Read `agents.md` (after T1: `AGENTS.md`) before touching anything; follow its routing/manifest/
  stub conventions.
- Never hand-edit `app/generated/*` or `public/page-dates.json` (build artifacts; regenerate with
  `npm run manifest`).
- **Do not redesign the shell.** Shamir explicitly chose the Wikipedia-clone look (paper background,
  white canvas, green top rule, no right ToC rail). No `_meta.js` under `app/`. No Google Fonts links.
- Internal links must work under the GitHub Pages basePath (`/deshistartup`) — use the existing
  `localHref()` / `NEXT_PUBLIC_BASE_PATH` mechanisms; bn pages link `/slug`, en pages `/en/slug`.
- Bangla style: সহজ প্রচলিত বাংলা, "আপনি" register, Bengali numerals (০-৯) in Bangla prose,
  English business terms transliterated (ট্রেড লাইসেন্স, ভ্যাট), explain each new term at first use,
  year-stamp every fee/number ("২০২৬ সালের হিসাবে…"), cite sources for legal/fee claims,
  no invented deep links — root/section URLs from `plan/sources.csv` only.
- Article pages stay near-zero JS (~150 KB critical path). Calculators (future) and the directory
  (T6) are the sanctioned exceptions — still no heavy libraries.
- After content/structural changes: `npm run manifest`; before finishing: `npm run build`
  (CI uses Node 22 — if the local Node is too old, report that; don't assume your change broke it).

---

## Tasks

### ✅ T0 — Foundation: commit the brain + hygiene (DONE 2026-07-07)

Converted the Content Map xlsx → `plan/*.csv` + `plan/case-study-format.md` + `plan/README.md`
(9 sheets, 559 data rows; the Downloads xlsx is now superseded). Deleted 14 stale iCloud
"`* 2.*`" duplicate files. Removed the committed `git-filter-repo` binary.
**Note:** working tree also carries Shamir's earlier uncommitted improvements to `.gitignore`,
`README.md`, `agents.md`. First commit should include everything:
`git add -A && git commit -m "Commit planning brain (plan/), remove iCloud duplicates and git-filter-repo"`.

### ☐ T1 — Rename agents.md → AGENTS.md and rewrite it as map + manual (size M, model: Opus)

Today agents.md is a good *operations manual* but describes a 13-guide site; the repo is a
374-page universe with a 393-row backlog. Also `AGENTS.md` uppercase is the cross-tool standard
(Codex cloud runs case-sensitive Linux).

1. `git mv agents.md AGENTS.md`. Update the two README references and the pointer text in the
   (gitignored, local) `CLAUDE.md`.
2. Keep as-is: Key Technologies, build/deploy sections, Design System, route-group/localization/
   stub mechanics, the `_meta.js` warning.
3. **Project Overview** — replace with (verbatim, then adjust flow):
   > Deshi Startup is a free, open-source, Bangla-first knowledge base and practical operating
   > manual for building **any** business in Bangladesh — startups are the wedge and the
   > tone-setter, but SMEs, trade/import-export, family businesses, and online sellers are equally
   > in scope. Never narrow a guide to venture-backed startups when the underlying process applies
   > to all businesses. The name "Deshi Startup" is provisional (rebrand poll pending).
   > Scale: ~374 Bengali pages are planned (see `plan/content-backlog.csv`), ~57 written so far;
   > the rest are honest stubs. Bengali is the source of truth; English mirrors at `/en/...`.
4. **Important Files** — replace the `context/`/`knowledge-bank/` "brain" lines with: `plan/` is
   the committed planning brain (link `plan/README.md`); `knowledge-bank/` is optional local-only
   scraped source material (gitignored for copyright hygiene, may be absent); drop `context/`.
5. **Site Structure** — delete the hand-maintained page lists (they drift). Replace with: the list
   of section hubs (start-here, idea-validation…, phase-one…phase-four, founder-life, contribute)
   plus one rule: *the source of truth for what exists is `app/generated/manifest.*.json` and for
   what should exist is `plan/content-backlog.csv`; never hand-maintain page lists in docs.*
6. **New section "Choosing what to work on":** filter `plan/content-backlog.csv` for
   `Priority=High` rows whose page is still a stub; prefer topics whose Notes column gives an
   angle; write bn first, then the en mirror; delete the `StubNotice` line only when the page is a
   real guide; run `npm run manifest`.
7. **New section "Content types & page anatomy":**
   - *Guide* (default): frontmatter title/description → `#` title → `> **সারকথা:**` 3-4 lines →
     `##` sections (কার কখন দরকার / ধাপে ধাপে / খরচ ও সময় / সাধারণ ভুল) → checklist →
     `## প্রাসঙ্গিক সূত্র`. Exemplar: `/start-here`.
   - *Case study*: the 15 fields of `plan/case-study-format.md` (bn headings defined in T5).
   - *Directory page*: data-backed, see T6 — entries live in `data/directory/*.json`, never prose
     tables maintained by hand.
   - *Template/checklist/script pages*: copy-paste-ready blocks, minimal theory.
   - *Calculators*: client components allowed (the one exception to near-zero JS), keep dependency-free.
8. **New section "Style guide (Bangla)":** lift the 7-row "লেখার নিয়মকানুন" table from
   `app/(contents)/(bn)/contribute/page.mdx` verbatim, plus: adapt-don't-translate rule (decision
   #6 above), and name `/start-here` as the bar for depth and tone.
9. **New section "Licensing":** MIT (code) + CC BY-SA 4.0 (content); contributions are accepted
   under these.
10. `npm run build` to confirm nothing references the old filename.

Commit: `Rename agents.md to AGENTS.md; rewrite as project map + operations manual`

### ☐ T2 — Update README.md to match the real destination (size M, model: Opus or Sonnet)

Keep the existing structure and the moat line ("The moat is not content volume…"). Changes:

1. Identity paragraph (first lines) — replace with (verbatim, adjust flow):
   > Deshi Startup is a free, open-source, Bangla-first knowledge base and practical operating
   > manual for building a business in Bangladesh — startups first, but equally SMEs, online
   > sellers, importers/exporters, and family businesses. The destination is the country's most
   > trustworthy, practical business-knowledge repository: what to do next, how much it costs,
   > which office to visit, which law applies — in plain Bangla, with sources.
2. **Vision** list — add three bullets: a source-backed **Bangladeshi startup case-study library**
   (bKash, Pathao, Chaldal…, each following `plan/case-study-format.md`); a **structured ecosystem
   directory** (investors, accelerators, payment gateways, couriers — data files, filterable,
   machine-readable); a **freshness system** (tiered source registry + "last verified" dates +
   scheduled re-verification, `plan/research-ops.csv`).
3. **Content Architecture** — add rows: Case Studies; Directory; Industry & city playbooks
   (these exist in the backlog/site already — the README just doesn't say so).
4. Replace **MVP Scope** with **Current milestone**: ~57 of 374 planned Bengali pages written
   (recompute: `find "app/(contents)/(bn)" -name page.mdx | wc -l` minus
   `grep -rl StubNotice "app/(contents)/(bn)" --include=page.mdx | wc -l`).
   Milestone targets: 100 written pages including 10 case studies; directory v1 (investors +
   accelerators); `verified:` dates on all compliance pages; llms.txt. Keep the "Not yet" list
   (AI assistant, accounts, paid features) — honest sequencing is good.
5. **Source Strategy** — keep the prose lists but state that `plan/sources.csv` is the living,
   tiered registry agents/contributors must use.
6. **How to Contribute** — add a line linking `plan/content-backlog.csv` ("pick any লেখা বাকি
   topic — priorities are marked").
7. **License section** — MIT for code, CC BY-SA 4.0 for content (details in T3's files).

Commit: `Broaden README to all-business scope; add case studies, directory, freshness system`

### ☐ T3 — License files (size S, model: Sonnet)

1. `LICENSE` — standard MIT text, "Copyright (c) 2026 Deshi Startup contributors".
2. `LICENSE-content.md` — plain-language note: all content under `app/(contents)/` is
   CC BY-SA 4.0 (link the deed + legalcode); attribution format:
   "Deshi Startup — deshistartup, CC BY-SA 4.0"; code remains MIT.
3. One line on both contribute pages (bn: "এই সাইটের সব লেখা CC BY-SA 4.0 লাইসেন্সে প্রকাশিত —
   উৎস উল্লেখ করে যে কেউ ব্যবহার করতে পারে।" en equivalent).
4. Ensure README's License section (T2 step 7) matches.

Commit: `Add MIT (code) + CC BY-SA 4.0 (content) licensing`

### ☐ T4 — Backlog ↔ site status report (size M, model: Sonnet)

Goal: make the backlog mechanically actionable and expose drift.

1. `scripts/backlog-status.mjs`: for each `plan/content-backlog.csv` row, slugify
   `Topic (English)` and match against site pages / `manifest.bn.json`. Derive the slugify rules
   from real pairs first (e.g. "VAT/BIN guide" → `vatbin-guide` — slashes and apostrophes are
   *dropped*, not hyphenated; check "Import/export registration basics" →
   `importexport-registration-basics`, "&" → `and` or dropped — test, don't guess). Fuzzy-fallback
   (normalized Levenshtein or token overlap) and report unmatched rather than mis-matching.
2. Output `plan/status-report.md`: per section × priority counts of written/stub/missing; the list
   of backlog rows with no page (expect ≈40 case studies + a handful of merged topics); the list
   of site pages absent from the backlog.
3. Add `"backlog:status": "node scripts/backlog-status.mjs"` to package.json scripts.

Commit: `Add backlog status report script (plan/status-report.md)`

### ☐ T5 — Case Studies pillar (size L, model: Opus; needs web access for step 6)

The single biggest vision gap: 40 planned case studies, zero on the site.

1. Read one existing bn+en stub pair first to copy conventions exactly.
2. Create section hubs: `app/(contents)/(bn)/case-studies/page.mdx` (short intro: কেন কেস স্টাডি —
   জেনেরিক পরামর্শ যা মিস করে; + `<SectionIndex section="case-studies" locale="bn" />`) and the
   `/en/case-studies` mirror.
3. Create stubs (bn + en) for all 40 backlog rows where `Section == "Case Studies"`. Frontmatter
   title = Bangla topic from the backlog. Sources per stub: company official site + credible
   outlets from `plan/people-startups.csv` "Where to look" (Future Startup, The Daily Star, TBS…)
   — root/section URLs only, never invented deep links.
4. Navigation: add "কেস স্টাডি" / "Case Studies" groups to `app/nav.config.js` (link the hubs);
   add a `case-studies` entry to `app/nav-groups.json` grouping the 40 slugs by sector
   (e.g. রাইড ও লজিস্টিকস / কমার্স ও মার্কেটপ্লেস / ফিনটেক / এডটেক / এগ্রি ও হেলথ / ব্যর্থতা থেকে শিক্ষা).
5. Add the case-study page anatomy to AGENTS.md — suggested bn headings for the 15 fields:
   এক নজরে · সমস্যা · সমস্যাটি বাংলাদেশ-নির্দিষ্ট কেন · শুরুর ইনসাইট · প্রথম ওয়েজ · প্রথম গ্রাহক ·
   বিশ্বাস তৈরি · স্থানীয় শিক্ষা · বাধা ও সীমাবদ্ধতা · বিজনেস মডেল · মূলধন ও ফান্ডিং ·
   যা অনুকরণ করতে পারেন · যা অনুকরণ করবেন না · যা এখনো অজানা · সূত্র
6. Write ONE exemplar fully to set the bar: **Pathao** (richest public record). Web-research it;
   every factual claim cited; separate facts from anecdotes; no overclaiming (README quality rules
   apply). ~1,200–1,800 words bn + en mirror. Delete its StubNotice.
7. `npm run manifest && npm run build`.

Acceptance: hub lists 40 entries (39 stubs + 1 written Pathao study); nav shows the section; build green.
Commit: `Add Case Studies section: hubs, 40 stubs, Pathao exemplar`

### ☐ T6 — Directory as a data product (size L, model: Opus; splittable, needs web access)

Directory entries must be structured data — filterable, verifiable, and consumable by the future
AI/MCP layer — not prose tables.

1. Schema (concretize from `plan/directory-schema.csv`): entries in `data/directory/investors.json`
   and `data/directory/accelerators.json` with fields like `name, type, stage[], sectors[],
   chequeSize, notableInvestments[], applicationPath, website, sourceUrl, lastVerified`.
2. `app/components/DirectoryList.jsx` — statically imports the JSON (no client-side fetching;
   keep it server-renderable/zero-JS if possible), renders a responsive table/cards with bn/en
   labels via a `locale` prop.
3. Pages: `(bn)/directory/page.mdx` hub (what it is + how to add an entry by editing JSON on
   GitHub) + `directory/investors` + `directory/accelerators`, plus `/en` mirrors; add
   "ডিরেক্টরি" / "Directory" to `app/nav.config.js`.
4. Seed 15–25 web-verified entries (leads: Bangladesh Angels Network, Startup Bangladesh Ltd.,
   Anchorless Bangladesh, BD Venture, SBK Tech Ventures, IDLC VC; GP Accelerator, BYLC Ventures,
   NSU Startups Next, Founder Institute Dhaka…). Every entry needs `sourceUrl` + `lastVerified`;
   if you can't verify it on the web today, leave it out.
5. AGENTS.md: add the directory-entry contribution spec.

Acceptance: build green; both category pages render from JSON; invalid JSON fails loudly at build.
Commit: `Add data-backed ecosystem directory (investors, accelerators)`

### ☐ T7 — "Last verified" system (size M, model: Sonnet or Opus; needs web access for step 4)

1. Extend `scripts/build-manifest.mjs` to read optional `verified: YYYY-MM-DD` frontmatter into
   the manifests (inspect how title/description are parsed and mirror that).
2. `LocalizedLayout.jsx` meta bar: when present, show "সর্বশেষ যাচাই: <bn-BD date>" (bn) /
   "Last verified: …" (en) alongside the existing last-updated date.
3. AGENTS.md rule: legal/tax/fee pages must carry `verified:` and it may only be set/bumped after
   actually re-checking the official sources.
4. Backfill: re-verify against RJSC/NBR/BB portals, then stamp the 7 written compliance pages:
   `trade-license, e-tin-vat-bin, rjsc-name-clearance, registration, company-types, legal-roadmap,
   payments` (fix any drifted fees/thresholds while there, year-stamped).

Acceptance: stamped pages render the line; unstamped pages don't; build green.
Commit: `Add verified-date system; re-verify compliance pages`

### ☐ T8 — Fix boilerplate stub sources (size L but mechanical, model: Sonnet)

317 stubs mostly cite the same irrelevant triplet (Bangladesh Bank / NBR / RJSC).

1. `scripts/fix-stub-sources.mjs`: for each stub (bn + en), if the sources list is exactly the
   generic boilerplate, replace it with 3–5 relevant sources from `plan/sources.csv` keyed on the
   page's section/nav-group. Mapping (group-keyword → sources):
   - company/RJSC/legal/licenses → RJSC, BanglaBiz, BIDA OSS, city-corporation portals
   - tax/VAT/bookkeeping → NBR, VAT Online, income-tax eReturn
   - banking/payments → Bangladesh Bank, bKash/Nagad merchant pages, SSLCommerz/aamarPay docs
   - import/export/shipping → CCI&E, Bangladesh Trade Portal, Customs, EPB
   - hiring/labor → DIFE, Labour Act resources, MoLE
   - IP/trademark → DPDT, Copyright Office
   - marketing/commerce/online selling → e-CAB, Meta Business Help, DataReportal, BTRC
   - funding/investors → Startup Bangladesh, Bangladesh Angels, Bangladesh Bank circulars, LightCastle
   - sector guides → the sector regulator (BFSA food, DGDA pharma, BTRC telecom, DoE environment, BSTI standards)
2. Never invent deep links — root/section URLs from `plan/sources.csv` only. Curated (non-boilerplate)
   source lists must be left untouched.
3. Dry-run mode printing planned changes first; then apply; `npm run manifest`; manually spot-check 10 pages.

Commit: `Replace boilerplate stub sources with per-topic sources from plan/sources.csv`

### ☐ T9 — llms.txt (size S, model: Sonnet)

Generate `public/llms.txt` at manifest/build time: site name, one-line description, base URL
(respect the `/deshistartup` basePath), then one line per **written** (non-stub) page — title,
description, absolute URL — bn and en. Note at the bottom how many topics are planned-but-stub.
This makes the site legible to AI assistants, which is distribution, not cannibalization.

Commit: `Generate llms.txt for AI-assistant consumption`

### ☐ T10 — Maintenance calendar (size S, model: Sonnet)

Convert `plan/research-ops.csv` into `plan/maintenance-calendar.md` (June budget-speech mining;
monthly RJSC/NBR/VAT-circular check; quarterly directory re-verification; annual license-fee sweep)
and add a short "Keeping content current" section to AGENTS.md linking to it.

Commit: `Add maintenance calendar from research-ops`

### ☐ T11 — Founder-journey pages (optional, after T1–T5; size M, model: Opus)

The 12 journeys in `plan/workflow-maps.csv` ("I have an idea but no product" → step chain) as
guided-path pages: each = short intro + ordered steps linking existing guides + closing checklist.
Propose placement to Shamir in-session (a `journeys` section — "কোন পথে যাবেন" — vs. folding into
start-here) before building.

---

## After this plan (ongoing, not tasks here)

- Write the 317 stubs, High-priority first, using `plan/content-backlog.csv` Notes and
  `plan/bd-insights.csv` as angles. English mirrors for `company-types`, `e-tin-vat-bin`.
- Deferred from the July 2026 redesign (still valid): dark mode, `<html lang>` fix on /en static
  HTML, OG share images, license/fee infobox component, "দেশি স্টার্টআপ স্কুল" curated course page,
  service-worker offline caching, per-stub GitHub issue templates.
- Name poll → then domains (.com + .org; check DPDT trademark + Facebook page availability).
- Later: MCP server over the knowledge base; grant/partnership conversations (World Bank/UNDP/GIZ-type
  SME-enablement programs; LightCastle for Bangla report distribution).
