# Deshi Startup repository guide

Read this before changing the project. For priorities and planned content, start at
[`plan/README.md`](./plan/README.md). For human contribution steps, use
[`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Mission and scope

Deshi Startup is a free, open-source operating manual for founders building new, scalable
businesses in Bangladesh, written in English with a Bangla translation of every guide.
Registration, tax, payments and hiring guides may also help small businesses, but the project
does not broaden its scope to become a generic SME, family-business, import/export or online-seller
portal.

English is the canonical authoring edition; the Bangla edition is translated from the finished
English guide with the `translate-bangla-guide` skill. A page counts as written only when it is a
real guide without `<StubNotice />`; run `npm run backlog:status` for current counts.

## Architecture

- Next.js + Nextra render mostly static MDX content.
- Next.js exports the site to `out/`; Cloudflare Static Assets serve it without invoking the Worker.
- A small native Worker handles only contribution APIs and legacy review-link redirects.
- Pagefind supplies client-side static search.
- Milkdown Crepe powers the inline editor.
- `jose` verifies Google ID tokens on every contribution request.

Key paths:

- `app/(contents)/(bn)/` – Bengali pages at clean root URLs.
- `app/(contents)/en/` – matching English pages under `/en`.
- `app/components/LocalizedLayout.tsx` – shell, navigation, page chrome and editor entry.
- `app/components/ContributionEditor.tsx` – browser editor and draft recovery.
- `worker/api/` and `worker/lib/` – contribution, authentication, GitHub and media-review logic.
- `worker/index.ts` – explicit API router and static-asset fallback.
- `data/directory/` – structured directory entries.
- `plan/content-backlog.csv` – canonical planned-topic and route registry.
- `app/nav.config.ts` – curated top-level navigation.
- `app/nav-groups.json` – section-hub groups.
- `app/generated/` and generated files in `public/` – build outputs; never hand-edit them.

## Routes and content trees

Content URLs have at most two semantic segments, mirrored exactly in both locales. The
`Path` column in `plan/content-backlog.csv` owns permanent planned URLs. Internal content links are
always root-relative:

- Bengali: `/registration/private-limited`
- English: `/en/registration/private-limited`

Do not derive a URL from an editable title. Do not use relative links such as `../page`.
`npm run lint:routes` enforces depth, charset, mirror parity and `<StubNotice path>`.

Section hubs use `<SectionIndex section="..." locale="..." />`; do not maintain page lists in MDX.
Add a new top-level destination to `app/nav.config.ts`, and a new section child to the appropriate
group in `app/nav-groups.json`.

## Writing a page

Before writing or editing any Bangla anywhere in the repository, including public documentation,
metadata and UI copy, read [`STYLE.md`](./STYLE.md).

Before writing content, read:

- [`EDITORIAL.md`](./EDITORIAL.md) for the quality standard: standalone pages, sources, visuals,
  and the five finish gates;
- [`plan/guide-playbook.md`](./plan/guide-playbook.md) for the English-first pipeline and the
  visual toolkit (`DataBars`, `Waterfall`, `Timeline`, `Figure`, `YouTube`, calculators);
- [`STYLE.md`](./STYLE.md) for natural Bangladeshi Bangla, used when translating; and
- the finished `/en/operations/cod-risk`, `/en/metrics/unit-economics` and
  `/en/metrics/cashflow-vs-profit` pages for working examples of the full standard.

Write the English guide first and finalise it against the five gates before translating to
Bangla.

Default guide shape:

1. frontmatter with `title` and `description`;
2. one `#` heading;
3. `> **সারকথা:**` / `> **In short:**`;
4. the decision, steps, cost/time, mistakes and checklist the topic actually needs; and
5. `## প্রাসঙ্গিক সোর্স` / `## Relevant Sources`.

Use official sources for legal, tax, fee, registration and regulatory claims. Date changeable
numbers. Never fabricate a statistic, quote, example or anecdote. Do not bump `verified:` unless
the relevant claims were re-checked against official sources.

Use GFM footnotes for inline citations: put `[^source-name]` beside the claim and define the same
identifier under the sources heading as `[^source-name]: [Source title](https://example.com)`.
Identifiers use lowercase ASCII words separated by hyphens. Numbering and backlinks are generated.

Page types with separate rules:

- Case studies use [`plan/case-study-format.md`](./plan/case-study-format.md).
- Journeys order existing guides and must not link missing routes.
- Directory pages render `data/directory/*.json`; do not hand-maintain prose tables.
- Templates and scripts put the copy-ready material first.
- A stub contains `<StubNotice />` and starting sources, not guide-shaped filler.

After content changes, run `npm run manifest`, `npm run lint:bangla` and
`npm run lint:citations`. Before finishing a full guide, run `npm run build`.

## Public contribution flow

The public editor is a supported product feature:

1. A reader presses **Edit** and signs in with Google.
2. The browser sends the Google ID token as a bearer token; the server verifies it on every request.
3. `GET /api/content` resolves the URL through generated `contributable.json` and returns source MDX.
4. Crepe edits the body while locked MDX components survive as protected fenced blocks.
5. `POST /api/contribute` creates or updates a deterministic contributor/page branch and pull request
   through the GitHub App.
6. Local drafts protect unsent work; the public GitHub PR remains the review and audit record.

Contributor image upload is also supported and must retain its security boundary:

- uploads go only to the private quarantine R2 bucket;
- file type, header, size, dimensions, pixel count and quotas are checked before acceptance;
- pending media is private and bound to its owner and page;
- an allowlisted reviewer approves or rejects each image;
- approval atomically updates the article and media registry before quarantine deletion;
- unresolved pending markers fail CI; and
- abandoned quarantine objects expire after seven days.

Do not weaken these controls as a side effect of UI or refactoring work. The threat model, limits,
cost controls and recovery procedure live in
[`plan/media-operations.md`](./plan/media-operations.md).

Contribution environment variables are documented in `.env.local.example`. The GitHub App private
key is the only GitHub secret. Never expose credentials in client code.

## Media

Image bytes live in R2 and are addressed in content as `/media/...`; binaries do not belong in git.
`app/generated/media.json` is the committed registry. `app/lib/media.ts` is the only delivery-URL
resolver.

Maintainer flow:

1. stage approved PNG, JPEG or WebP files under the gitignored `media/` directory;
2. run `npm run media:upload`;
3. reference the logical `/media/...` path and commit the registry change.

Use `<Figure>` or Markdown images for images, `<YouTube>` for YouTube facades and
`<FacebookVideo>` for supported public Facebook-video facades. Browser contributors should only
need to paste a standalone video URL into an empty editor paragraph; the editor owns the component
syntax and metadata fields. Never add raw media embeds or platform iframes. Run
`npm run lint:media`. Retire and prune objects only through the dry-run-first process in
`plan/media-operations.md`.

## Generated files

`npm run manifest` derives navigation, contribution maps, SEO inputs, route date maps, sitemap,
robots, `llms.txt` and `llms-full.txt` from the content tree and git history. These are outputs, not additional
sources of truth. Do not edit or review their contents as authored files; regenerate them.

The authored media registries are the exception:

- `app/generated/media.json`
- `app/generated/media-retired.json`

`app/generated/contributors.json` is committed too, but comes from its own command. It is a
snapshot of merged pull requests read at build time, so the site never calls the GitHub API during
a build or at runtime. Refresh it with `npm run contributors:refresh` when someone new lands work;
a failed refresh leaves the previous snapshot in place. Who counts as core team, and any renames or
opt-outs, live in `data/contributors-policy.json`.

## Commands

```bash
npm run dev                 # local Next site + API Worker; regenerates manifests first
npm run manifest            # regenerate content and SEO outputs
npm run contributors:refresh # re-read merged PRs into app/generated/contributors.json
npm run backlog:status      # write the local planning status report
npm run lint:bangla         # Bangla/content mechanical checks
npm run lint:citations      # inline citation definitions, parity and IDs
npm run lint:routes         # URL and locale-tree checks
npm run lint:media          # media references and limits
npm run test:contribute     # editor/contribution helpers
npm run test:contributors   # contributor snapshot and leaderboard helpers
npm run test:media          # media pipeline helpers
npm run build               # production Next build + Pagefind + SEO audit
npm run build:worker        # production static export + Pagefind + SEO audit
npm run check:worker        # typecheck, dry-run package, and enforce growth budgets
npm run preview:worker      # local Worker preview
```

## Deployment and safety

Production is the `deshistartup` Cloudflare Worker at `deshistartup.com`. Workers Builds runs
`npm run build:worker` from `main`, then Wrangler deploys `out/` with the native API Worker.
Runtime variables and secrets are documented in `.env.local.example` and `wrangler.jsonc`.
Deployment architecture and size budgets are documented in
[`plan/deployment-architecture.md`](./plan/deployment-architecture.md).

`public/_headers` (copied to `out/_headers`) carries the asset response headers: the site-wide
`Strict-Transport-Security` rule, then the cache policy. Only hash-named files are marked
immutable; HTML stays revalidating so a corrected fee goes live on deploy. Add a rule there
rather than in the Worker when a new asset directory needs its own policy — static assets are
served without running Worker code, so a header set in `worker/index.ts` never reaches a page load.

The http -> https redirect is **not** in this repository. It is the zone-level "Always Use HTTPS"
setting in the Cloudflare dashboard; the Worker cannot stand in for it, for the same reason.

Pushing `main` deploys production. Never push unless Shamir asks.

Preserve these constraints:

- article critical path stays small and near-zero-JS;
- self-hosted Bengali fonts remain;
- content remains available without login;
- contribution changes always go through review;
- legal/tax content is general guidance, not professional advice;
- code is MIT and content under `app/(contents)/` is CC BY-SA 4.0.

## Agent skills

Per-repo configuration the installed engineering skills read before they act. Edit the files under
`docs/agents/` directly when a convention changes; re-running the setup skill is only needed to
switch issue trackers.

### Issue tracker

Issues and specs live as GitHub issues on `Deshi-Startup/deshistartup`, driven by the `gh` CLI.
External PRs are not treated as a triage surface. See [`docs/agents/issue-tracker.md`](./docs/agents/issue-tracker.md).

### Triage labels

The five canonical roles, each label string equal to its name: `needs-triage`, `needs-info`,
`ready-for-agent`, `ready-for-human`, `wontfix`. See [`docs/agents/triage-labels.md`](./docs/agents/triage-labels.md).

### Domain docs

Single-context: one `CONTEXT.md` plus `docs/adr/` at the repo root, both created lazily — neither
exists yet, and their absence is not a problem to flag. See [`docs/agents/domain.md`](./docs/agents/domain.md).
