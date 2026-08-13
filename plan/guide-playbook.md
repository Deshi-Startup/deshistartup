# Guide Playbook

This file owns **how** Deshi Startup produces and upgrades guides at the current quality bar. The
**what** — the quality standard itself — lives in [`EDITORIAL.md`](../EDITORIAL.md). Working
examples of the full bar: `/en/operations/cod-risk`, `/en/metrics/unit-economics`,
`/en/metrics/cashflow-vs-profit`, and the hub `/start-here`.

## Canonical edition and translation

- **English is the canonical authoring edition.** Write, review, and finalise in English first.
- **The Bangla edition is a translation** of the finished English guide, produced with the
  `translate-bangla-guide` skill (which enforces `STYLE.md` and the `deshi-bangla` skill so the
  Bangla reads as if composed in Bangla, never as a word-for-word translation).
- **Skip conditions:** never re-translate community-contributed guides or material adapted from
  expert contributors, for example, Shoumik Shahriar (the skill documents how to check).
- **Citation parity:** `citation-lint` requires identical footnote identifiers and inline counts
  in both editions. When the English guide adds a source, add it to the Bangla page in the same
  change, or fold it into an existing shared identifier until both pages are touched.
- **Route parity:** both editions share the same route depth and mirror each other;
  `lint:routes` enforces it. Every new topic exists in `plan/content-backlog.csv` first — the
  `Path` column owns the URL.

## Pipeline for a new guide

1. **Claim the topic.** Pick the route from `plan/content-backlog.csv`; note the claim on its
   GitHub issue.
2. **Write the page brief** (`EDITORIAL.md`): the reader's question, their starting knowledge,
   the page's single job, the expected output, the most dangerous misunderstanding, the evidence
   needed, candidate visuals, and freshness risk.
3. **Draft the English guide.** Four layers (orientation, minimum mental model, execution,
   verification), a worked Bangladesh-specific example, tables, and a checklist. Write in plain,
   natural English.
4. **Add visuals** from the toolkit below wherever the selector table in `EDITORIAL.md` says one
   earns its place. Every visual keeps its numbers in a table and a one-line takeaway in prose.
5. **Add a calculator** only when the page's whole job is the reader's own calculation (see the
   calculator pattern below).
6. **Review against the five gates** (`EDITORIAL.md`). For flagship guides, run the cold-reader
   test on a phone.
7. **Run the checks:** `npm run lint:citations`, `npm run lint:media`, `npm run lint:routes`, and
   `npm run build`.
8. **Publish the English guide.**
9. **Translate to Bangla** with `translate-bangla-guide`, then `npm run lint:bangla -- <file>`.
10. **Re-check parity** (`npm run lint:citations`) and review the Bangla for voice against
    `STYLE.md`.

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
- [ ] Terms defined at first use on the page
- [ ] Worked example plus a blank, copy-ready version
- [ ] Toolkit visual added wherever the selector table applies
- [ ] Sources re-checked against official pages; stale numbers corrected; `verified:` bumped only
      after an actual re-check
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
(7) keep citation identifiers and counts identical to the Bangla page; and (8) finish with
lint:citations, lint:media, lint:routes, and npm run build. English only — do not touch the
Bangla page; it will be re-translated later with the translate-bangla-guide skill.
```

For a new guide from the backlog, swap the first sentence: "Create a new English guide at the
backlog route <path>…". Give the agent one page at a time, with the route and (if known) the
page's single job; the playbook and EDITORIAL.md supply the rest of the judgement.

## Definition of done

A guide is done when:

- it passes the five gates in `EDITORIAL.md`;
- its visuals use the toolkit components and keep their numbers in tables;
- its sources are checked, dated, and mirrored in both editions;
- both editions pass `lint:citations`, `lint:routes`, `lint:media`, `lint:bangla`, and the build.
