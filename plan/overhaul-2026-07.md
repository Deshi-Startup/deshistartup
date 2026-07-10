# Overhaul plan — July 2026 (✅ completed — archived record)

**Status: every task T0–T12 is done** (T0–T11 on 2026-07-07/08, T12 on 2026-07-10). This file is
kept as the historical record of the July 2026 docs & systems overhaul; **there is no open work in
T1–T12**. Two parts are still live and referenced elsewhere: the **Locked decisions** below (scope,
name/domain, license — also stated in `AGENTS.md`) remain binding, and the **"After this plan
(ongoing)"** section at the very bottom holds the real forward-looking follow-ups (write the
remaining stubs, secure the `.org`/trademark/Facebook page, deferred redesign polish).

Created 2026-07-07 from a full project audit (Fable session), written so any capable model could
execute one task per session with zero extra context. *Historical execution note (no longer
active):* tasks were run one per session ("Execute task T\<N\>…"), each closed with its own commit,
and `main` was never pushed without Shamir's say-so, since pushing `main` deploys the live site.

---

## Locked decisions (2026-07-07, by Shamir — do not re-open)

> **Amendment (2026-07-08, by Shamir):** Decisions #1 (scope) and #2 (name/domain) were reopened and
> changed. The site now focuses **almost exclusively on startups** (not all business types); the name
> **Deshi Startup** is **final**; and **deshistartup.com** has been purchased. Decisions #3–#6 are
> unchanged. The updated wording is inline below, with the superseded 2026-07-07 text kept in
> parentheses for the record.

1. **Scope (amended 2026-07-08):** **Startups in Bangladesh — almost exclusively.** The audience is
   founders building something new and scalable. Foundational processes (license, tax, payments,
   hiring) are covered *for founders* and may incidentally help any small business, but do **not**
   broaden scope to chase generic SME, family-business, import/export, or online-seller audiences.
   *(Superseded 2026-07-07 wording: "ALL business types in Bangladesh — startups are the wedge and
   tone-setter, but SMEs, trade/import-export, family businesses, and online sellers are equally in
   scope.")*
2. **Name & domain (amended 2026-07-08):** The name **Deshi Startup** is **final**, and
   **deshistartup.com** is registered. Name-dependent assets (logo, .com/.org, Facebook page) are now
   safe to build. *(Superseded 2026-07-07 wording: "'Deshi Startup' stays for now; it is a working
   title pending an internal poll. Don't invest in new name-dependent assets until finalized.")*
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
  year-stamp every fee/number ("২০২৬ সালের হিসাবে…"), cite sources for legal/fee claims. Source
  lists use root/section URLs from `plan/sources.csv`; load-bearing data may link an exact stable
  report/dataset only after that link is verified and recorded in the registry. Never invent one.
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

### ✅ T1 — Rename agents.md → AGENTS.md and rewrite it as map + manual (DONE 2026-07-07)

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

### ✅ T2 — Update README.md to match the real destination (DONE 2026-07-07)

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

### ✅ T3 — License files (DONE 2026-07-07)

1. `LICENSE` — standard MIT text, "Copyright (c) 2026 Deshi Startup contributors".
2. `LICENSE-content.md` — plain-language note: all content under `app/(contents)/` is
   CC BY-SA 4.0 (link the deed + legalcode); attribution format:
   "Deshi Startup — deshistartup, CC BY-SA 4.0"; code remains MIT.
3. One line on both contribute pages (bn: "এই সাইটের সব লেখা CC BY-SA 4.0 লাইসেন্সে প্রকাশিত —
   উৎস উল্লেখ করে যে কেউ ব্যবহার করতে পারে।" en equivalent).
4. Ensure README's License section (T2 step 7) matches.

Commit: `Add MIT (code) + CC BY-SA 4.0 (content) licensing`

### ✅ T4 — Backlog ↔ site status report (DONE 2026-07-07)

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

### ✅ T5 — Case Studies pillar (DONE 2026-07-07)

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

### ✅ T6 — Directory as a data product (DONE 2026-07-07)

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

### ✅ T7 — "Last verified" system (DONE 2026-07-07)

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

### ✅ T8 — Fix boilerplate stub sources (DONE 2026-07-07)

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

### ✅ T9 — llms.txt (DONE 2026-07-07)

Generate `public/llms.txt` at manifest/build time: site name, one-line description, base URL
(respect the `/deshistartup` basePath), then one line per **written** (non-stub) page — title,
description, absolute URL — bn and en. Note at the bottom how many topics are planned-but-stub.
This makes the site legible to AI assistants, which is distribution, not cannibalization.

Commit: `Generate llms.txt for AI-assistant consumption`

### ✅ T10 — Maintenance calendar (DONE 2026-07-07)

Convert `plan/research-ops.csv` into `plan/maintenance-calendar.md` (June budget-speech mining;
monthly RJSC/NBR/VAT-circular check; quarterly directory re-verification; annual license-fee sweep)
and add a short "Keeping content current" section to AGENTS.md linking to it.

Commit: `Add maintenance calendar from research-ops`

### ✅ T11 — Founder-journey pages (DONE 2026-07-08)

The 12 journeys in `plan/workflow-maps.csv` ("I have an idea but no product" → step chain) as
guided-path pages: each = short intro + ordered steps linking existing guides + closing checklist.

**Placement decision (Shamir, in-session):** a dedicated `journeys` section — "কোন পথে যাবেন" — not
folded into start-here (parallel to case-studies/directory; keeps start-here lean; journeys get clean
`/journeys/<slug>` URLs).

**Done:** Built the `journeys` section hub (`/journeys` + `/en/journeys`) with `<SectionIndex>`, and
all 12 guided-path pages (bn + en, all written/non-stub). Each page: `> **সারকথা:**` → intro →
`## ধাপে ধাপে পথ` (ordered steps, every step links a *verified-existing* internal guide) →
`## এই পথের চেকলিস্ট` → `## এরপর কোন পথে` sibling cross-links. Added "কোন পথে যাবেন"/"Journeys" to
`app/nav.config.js` (right after Start Here), a 5-group `journeys` block to `app/nav-groups.json`, and
a cross-link into both start-here hubs. Documented the section hub + a new "Journey / guided-path
page" content type in AGENTS.md. `npm run manifest` + `npm run build` green (journeys: 12/12 written
per locale; all 26 pages emit to `out/`).

Commit: `Add Founder Journeys section: goal-based guided paths (12 journeys, bn+en)`

### ✅ T12 — Open-source front door (DONE 2026-07-10)

Goal (decided 2026-07-10): make the repo succeed as an open source project — contributor-acquiring
front door instead of internal spec. Context: the top Bangla-content repos
(bangla-programming-resources ~2,000★, system-design-bangla ~1,237★) prove "serious knowledge in
Bangla" is GitHub's most rewarded BD category, and the startup niche is empty. Realistic targets:
300–500★ within 90 days of a proper launch; ~1,000★ in 12 months.

Done in this task:

1. **README.md rewritten** as a Bangla-first front door (mission, live-site link, progress badge,
   3-path contribute table, trust section, contributors wall, star CTA) + full English mirror
   `README.en.md`. The old spec prose moved intact to `plan/vision.md`.
2. **CONTRIBUTING.md** (bn + en: 3 paths, guide-writing rules, review SLA, license agreement) and
   **CODE_OF_CONDUCT.md** (Contributor Covenant 2.1 + বাংলা সারকথা; contact conduct@deshistartup.com).
3. **`.github/ISSUE_TEMPLATE/`**: `report-mistake.yml` / `write-guide.yml` / `new-topic.yml`
   bilingual issue forms + `config.yml` (Discussions + site-contribute contact links), and a
   bilingual **PR template**.
4. **PR CI** (`.github/workflows/pr-checks.yml`): `lint:bangla --strict` + `next build` on every PR.
5. **Progress badges**: `build-manifest.mjs` now emits `public/progress.json` (Bengali digits) and
   `progress.en.json` (shields.io endpoint schema), consumed by the READMEs via raw.githubusercontent.
6. **Site links wired to the forms**: per-page "ভুল জানান" (LocalizedLayout `issueUrl`) and both
   sidebar report links now open the prefilled `report-mistake` form.
7. **Repo merchandising via API**: description, topics, Discussions enabled, bilingual label set.
8. **Seeded "নতুন গাইড" issues** from High-priority backlog stubs (spread across sections,
   template/checklist topics labeled `good first issue`) + a pinned bilingual welcome issue.
   `scripts/seed-issues.mjs` generates future waves.
9. **Org profile**: `Deshi-Startup/.github` repo with a bilingual profile README.
10. **Assets**: `.github/assets/social-preview.png` (Bengali-typography social card; must be
    uploaded manually in repo Settings → Social preview) and a site screenshot for the README.
11. Hygiene: removed the stray tracked `git-filter-repo` binary.

Still open (launch phase, not this task): soft launch to personal network → staggered BD community
posts (LinkedIn, FB dev/startup groups, university E-clubs, BD tech media/YouTubers) → Hacktoberfest
(October) and একুশে ফেব্রুয়ারি write-a-thon campaigns → recruit 3–5 named expert reviewers
(lawyers/CAs — review credit on pages is their lead-gen) → promote first repeat contributors to
co-maintainers. Keep the 48h first-response SLA. Never star-beg; claim-first rule for Hacktoberfest.

Commit: `T12: open-source front door — README rework, contributor surface, PR CI, seeded issues`

---

## After this plan (ongoing, not tasks here)

- Write the 317 stubs, High-priority first, using `plan/content-backlog.csv` Notes and
  `plan/bd-insights.csv` as angles. English mirrors for `company-types`, `e-tin-vat-bin`.
- Deferred from the July 2026 redesign (still valid): dark mode, `<html lang>` fix on /en static
  HTML, OG share images, license/fee infobox component, "দেশি স্টার্টআপ স্কুল" curated course page,
  service-worker offline caching, per-stub GitHub issue templates.
- ~~Name poll → then domains~~ **Done (2026-07-08):** name finalized as **Deshi Startup**;
  **deshistartup.com** purchased. Still open: secure the `.org`, check the DPDT trademark, and claim
  the Facebook page. Custom-domain deployment (dropping the `/deshistartup` basePath) is deferred.
- **Scope pivot follow-ups (2026-07-08):**
  - ✅ **Done:** docs (README, AGENTS, this plan); homepage/`WikiLanding` scope copy in both
    locales (kicker, `whoBody`, infobox tagline/audience, `who` list — "SME owner" audience removed;
    "small/family business" language dropped) + homepage `<title>`/description; and the standalone
    **Startup-vs-SME guide was dropped** (bn+en deleted, inbound links repointed to the surviving
    "Startup, SME, agency & e-commerce" 4-way comparison, removed from top nav).
  - ⬜ **Still open:** re-examine the pure-SME / family-business / import-export rows in
    `plan/content-backlog.csv` and the sector guides under `phase-four/` for whether they still fit a
    startup-only remit; secure the `.org` domain, check the DPDT trademark, and claim the Facebook
    page; eventually point the site at the `deshistartup.com` apex domain.
- **Bangla-first language overhaul (2026-07-08, Fable session):** a language audit found much of
  the Bangla content was English-skeleton writing (calques like "ব্যবসা-থেকে-ব্যবসা", এবং/কিন্তু
  overuse, semicolons, "X হলো Y" reflex) plus 32 bn + 32 en `phase-four/` pages that were
  *identical topic-name-swapped boilerplate* — fake guides violating the honest-stub rule.
  Done in that session: **`STYLE.md`** created as the binding Bangla style standard
  (think-in-Bangla workflow, banned-calque table, loanword policy, register definition);
  **`npm run lint:bangla`** (`scripts/bangla-lint.mjs`) added as the mechanical check;
  AGENTS.md / README / both contribute pages now point to it; the 64 boilerplate pages were
  demoted back to honest stubs; the real written pages were rewritten to the new standard.
  Ongoing rule: every new/edited Bangla page must pass `lint:bangla` hard findings + the
  STYLE.md §7 read-aloud checklist before commit.
- Later: MCP server over the knowledge base; grant/partnership conversations (World Bank/UNDP/GIZ-type
  SME-enablement programs; LightCastle for Bangla report distribution).
