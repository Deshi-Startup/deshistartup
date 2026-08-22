# Guide Playbook

This file owns **how** Deshi Startup produces and upgrades guides at the current quality bar. The
**what** — the quality standard itself — lives in [`EDITORIAL.md`](../EDITORIAL.md). Working
examples of the full bar: `/en/operations/cod-risk`, `/en/metrics/unit-economics` and
`/en/metrics/cashflow-vs-profit` for money pages, `/en/registration/private-limited` for a
process-and-fees page, and the hub `/start-here`.

## Canonical edition and translation

- **English is the canonical authoring edition.** Write, review, and finalise in English first.
- **The Bangla edition is a translation** of the finished English guide, produced with the
  `translate-bangla-guide` skill (which enforces `STYLE.md` and the `deshi-bangla` skill so the
  Bangla reads as if composed in Bangla, never as a word-for-word translation).
- **Both editions pass the same finish gates.**
- **Skip conditions:** never re-translate community-contributed guides or material adapted from
  expert contributors, for example, Shoumik Shahriar, **unless the English page has been substantially rewritten and re-translation is required to maintain parity.** (the skill documents how to check).
- **Citation parity:** `citation-lint` compares footnote identifiers *and* inline counts per
  route, so the two editions must always agree. Adding, removing or renaming a source is therefore
  never an English-only change: mirror that footnote into the Bangla page in the same commit, or
  fold the claim into an existing shared identifier until both pages are rewritten. Everything
  else — prose, structure, examples — can move ahead in English alone.
- **Route parity:** both editions share the same route depth and mirror each other;
  `lint:routes` enforces it. Every new topic exists in `plan/content-backlog.csv` first — the
  `Path` column owns the URL.

## Pipeline for a new guide

1. **Claim the topic.** Pick the route from `plan/content-backlog.csv`; note the claim on its
   GitHub issue.
2. **Create both route files** if the topic is not already a stub pair:
   `app/(contents)/en/<path>/page.mdx` and `app/(contents)/(bn)/<path>/page.mdx`. `lint:routes`
   fails the build when either side is missing, so the Bangla file exists from the start and
   carries only `<StubNotice />` until step 8.
3. **Write the page brief** (`EDITORIAL.md`): the reader's question, their starting knowledge,
   the page's single job, the expected output, the most dangerous misunderstanding, the evidence
   needed, candidate visuals, and freshness risk — the re-check cadence for that risk lives in
   [`maintenance-calendar.md`](./maintenance-calendar.md).
4. **Draft the English guide.** Four layers (orientation, minimum mental model, execution,
   verification), a worked Bangladesh-specific example, tables, and a checklist. Write in plain,
   natural English.
5. **Add visuals** from the toolkit below wherever the selector table in `EDITORIAL.md` says one
   earns its place. Every visual keeps its numbers in a table and a one-line takeaway in prose.
6. **Add a calculator** only when the page's whole job is the reader's own calculation (see the
   calculator pattern below).
7. **Review against the five gates** (`EDITORIAL.md`). For flagship guides, run the cold-reader
   test on a phone.
8. **Translate to Bangla** with `translate-bangla-guide`, then `npm run lint:bangla -- <file>`.
9. **Run the checks:** `npm run build`. Its `prebuild` runs `lint:routes`, `lint:media`,
   `lint:citations` and the manifest, so run those singly only for faster feedback while drafting.
   Citation parity can only pass once the Bangla page carries the same footnotes, which is why the
   full build comes after the translation, not before it.
10. **Review the Bangla for voice** against `STYLE.md` — the read-aloud test, not just a clean
    lint — then publish both editions in one commit.

**What ships together.** A new guide ships as both editions in one change. `citation-lint`
compares footnotes per route, so a finished English page sitting beside a Bangla stub fails the
build the moment the English carries a single citation — there is no publishable state in between.
Only an already-mirrored page whose source set does not change can ship English-first and be
re-translated later; that is the normal shape of an upgrade, not of a new guide.

## The visual toolkit

All components are registered in `mdx-components.tsx` and styled in `globals.css`. Everything is
zero-JS except the calculators.

### DataBars — comparing a few values

Horizontal bars for 3–7 categories; the mobile-safe comparison chart.

```mdx
<DataBars
  unit="%"
  max={100}
  data={[
    { label: "BDT 1,200 product", value: 79 },
    { label: "BDT 800 product", value: 58 },
  ]}
/>
```

Props: `data` (`label`, `value`, optional `display`), `unit` (suffix), `max` (defaults to the
largest value; use 100 for percentages). Always pair with a table of the exact numbers.

### Waterfall — money that erodes or builds step by step

Horizontal waterfall: anchored start/end bars, floating red (out) and green (in) segments.

```mdx
<Waterfall
  digits="en"
  steps={[
    { label: "Sale", delta: 1200, total: true },
    { label: "Shirt cost (COGS)", delta: -800 },
    { label: "Courier", delta: -120 },
    { label: "Contribution margin", total: true },
  ]}
/>
```

Props: `steps` (`label`, signed `delta`, `total` for anchored bars — an opening total
takes `delta`, a closing total omits it and the component sums the steps itself),
`digits` (`"en"` on English pages, `"bn"` default).

### Timeline — what happens when

Band timeline on a shared tick axis, with a hollow amber `gap` span for risk windows.

```mdx
<Timeline
  ticks={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"]}
  rows={[
    { label: "On the ledger", spans: [{ start: 0, end: 8, label: "45,000 taka booked Monday" }] },
    {
      label: "In the bank",
      spans: [
        { start: 0, end: 7, tone: "gap", label: "no cash yet — the gap" },
        { start: 7, end: 8, label: "45,000" },
      ],
    },
  ]}
/>
```

Props: `ticks` (axis labels), `rows` (`label`, `spans` with `start`, exclusive `end`, optional
`label`, optional `tone: "gap"`).

### Figure — screenshots and photos

```mdx
<Figure
  src="/media/registration/rjsc-query.png"
  alt="The RJSC application page with the query notification open"
  caption="A query on your application lands here; answer it within the deadline."
  source="RJSC portal"
  checked="2026-08-13"
/>
```

Requires staging the PNG under `media/` and running `npm run media:upload` (policy:
[`media-operations.md`](./media-operations.md)). Markdown images `![alt](/media/...)` get the same
rendering.

When the screenshot is not captured yet, leave the media brief where the image will go instead of
a bare TODO:

```mdx
{/* Screenshot slot: the RJSC online-services application screen — mark where to start the
application and where the generated challan appears. source "RJSC portal"; add a checked date
when captured. */}
```

The comment says what the image must teach and what to stamp on it, mirrors into the Bangla page
like any other structure, and does not trip `media-lint`, which only checks `/media/...` paths a
page actually references.

### Term — a definition without leaving the sentence

```mdx
<Term name="rjsc-name-clearance">RJSC name clearance</Term>
```

Props: `name` (a key in `data/glossary.json`), optional `def` (an inline definition for a term the
glossary does not carry), and the children — the words as they read in the sentence. A glossary
entry holds `bn`, `en`, and optional `sourceUrl` and `verified`; both languages ship in the markup
and CSS shows the reader's one, so the same `name` works in both editions and needs no translation.
Zero-JS: it is the native popover API.

Add the term to `data/glossary.json` first, and keep `/start-here/glossary` as its home. The
popover never replaces defining the term on the page — `EDITORIAL.md` still requires the plain
meaning at first use; `Term` is the reminder for a reader who forgot it two screens later.

### YouTube / FacebookVideo — video facades

```mdx
<YouTube id="dQw4w9WgXcQ" title="..." caption="..." date="2026-01-01" />
```

Facades only; the player loads on click. Videos are the last resort — use only when movement is
the message (`EDITORIAL.md`).

### Calculators — small client islands

Pattern (`app/components/CodRiskCalculator.tsx` is the reference):

- `'use client'` component with `useState` defaults set to the page's worked example.
- The server renders that default result as static HTML, so the numbers exist even with
  JavaScript disabled; hydration only enables editing.
- Plain `<input type="number">` fields with visible labels; results as real text with
  `aria-live="polite"` on the verdict line.
- Verdicts reference the page's rule of thumb rather than inventing new thresholds.
- No dependencies, no shared state, isolated to the one page that needs it. Articles that do not
  calculate stay zero-JS.

### Highlight boxes

Blockquotes with bold labels: `**Warning:**`, `**Rule:**`, `**Example:**`, `**Keep in mind:**`,
plus the page-opening `**In short:**`. The fixed set is documented in `EDITORIAL.md`.

### Two selector rows have no component

`EDITORIAL.md` starts a "which path applies to me?" reader on a decision tree and a "what happens
in what order?" reader on a process diagram. Neither has a component, and neither needs one:

- **Decision tree:** a branching list — "if you only sell services → …; if you import stock → …" —
  or a two-column table of condition and consequence. `/en/registration/structure-decision-tree`
  is the worked shape.
- **Process diagram:** `<Timeline>` when the steps sit on a time or deadline axis, otherwise a
  numbered list where each step names its own finished state.

Do not draw either as a raster. Text is searchable, translatable, readable at 320 px, and survives
a blocked image.

## Upgrading existing guides

Work in this order:

1. **Flagship journey pages** (idea-to-evidence, set-up, first customers, team and funding
   readiness) — they carry the most readers.
2. **High-risk pages** (registration, tax, payments) — evidence re-check and freshness first,
   visuals second.
3. **Calculation-heavy pages** (metrics, tools) — charts and calculators.
4. **Everything else**, on demand or when a reader report arrives.

Per-page upgrade checklist:

- [ ] Page brief written (retroactively is fine)
- [ ] Cold-entry opening with "who needs this, and when"
- [ ] Terms defined at first use on the page, `<Term>` used for the ones a reader forgets
- [ ] Worked example plus a blank, copy-ready version
- [ ] Toolkit visual added wherever the selector table applies
- [ ] Sources re-checked against official pages; stale numbers corrected; `verified:` bumped only
      after an actual re-check, on the cadence in [`maintenance-calendar.md`](./maintenance-calendar.md)
- [ ] Five gates pass (cold-reader test included for flagships)

A useful upgrade habit from the cod-risk pass: when re-checking sources, read the full terms, not
just the pricing table — the return-policy correction came from a sentence buried in the terms
page.

## Running this playbook with an agent

Any agent in this repo picks the playbook up automatically from `AGENTS.md`. To make the intent
unambiguous in a fresh session — yours or another agent's — prompt like this:

```text
Upgrade the English guide at <route, e.g. /en/registration/private-limited> to the current
quality bar, following plan/guide-playbook.md and EDITORIAL.md. Work in order: (1) write the
retroactive page brief; (2) apply the four-layer structure with a cold-entry "Who needs this,
and when" section; (3) add toolkit visuals (DataBars, Waterfall, Timeline, Figure) wherever the
selector table says they earn their place; (4) add a calculator only if the page's whole job is
the reader's own calculation; (5) re-check every source against the official page and correct
stale numbers, bumping verified: only after an actual re-check; (6) pass the five finish gates;
and (7) finish with npm run build, whose prebuild runs lint:routes, lint:media and lint:citations.
Bangla prose is out of scope — that page will be re-translated later with the
translate-bangla-guide skill. The one exception: if the pass adds, removes or renames a source,
mirror that footnote into the Bangla page in the same change, because citation-lint compares
footnote identifiers and counts per route and the build fails when the two editions disagree.
```

For a new guide from the backlog, swap the first sentence: "Create a new English guide at the
backlog route <path>…", and drop the Bangla exclusion — a new guide has no Bangla page to protect,
so it is written, translated and published as one change (see "What ships together"). Give the
agent one page at a time, with the route and (if known) the page's single job; the playbook and
EDITORIAL.md supply the rest of the judgement.

## Definition of done

A guide is done when:

- it passes the five gates in `EDITORIAL.md`;
- its visuals use the toolkit components and keep their numbers in tables;
- its sources are checked, dated, and mirrored in both editions;
- both editions pass `lint:citations`, `lint:routes`, `lint:media`, `lint:bangla`, and the build;
- the GitHub issue claimed in step 1 is closed; and
- `npm run backlog:status` has been re-run when a stub became a guide, so
  [`status-report.md`](./status-report.md) counts it — that file is generated, never hand-edited.
