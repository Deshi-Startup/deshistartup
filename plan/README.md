# plan/ — the project's planning brain

This folder is the **committed, canonical planning layer** of Deshi Startup. It was converted on
2026-07-07 from the working spreadsheet ("Deshi Startup Content Map.xlsx"), which is now
**superseded** — edit these files, not the spreadsheet.

Agents (Claude Code, Codex) and human contributors should treat these files as the source of truth
for *what to build and write next*. The site content itself lives in `app/(contents)/`.

| File | What it is |
|---|---|
| `overhaul-2026-07.md` | **Active task plan** — docs & systems overhaul. Execute tasks in order. |
| `vision.md` | Long-form vision & content spec: purpose, principles, audiences, quality rules, AI direction (moved out of `README.md` 2026-07-10 when the README became the contributor front door). |
| `content-backlog.csv` | Canonical content backlog: 393 topics with section, Bangla/English titles, content type, priority, notes. A topic is "written" when its site page exists without a `<StubNotice />`. |
| `sources.csv` | Tiered source registry (63 sources): who to trust for what, with URLs. Use when adding sources to any page. |
| `case-study-format.md` | The 15-field format every startup case study must follow. |
| `directory-schema.csv` | Categories + suggested data fields for the ecosystem directory. |
| `workflow-maps.csv` | 12 founder journeys ("I have an idea but no product" …) to become guided paths. |
| `bd-insights.csv` | 27 Bangladesh-specific research questions that should shape playbooks. |
| `templates-tools.csv` | Planned templates, checklists, and calculators. |
| `people-startups.csv` | Founders/startups to research for case studies, and where to look. |
| `research-ops.csv` | Freshness cadences: what to re-check, where, how often (budget speech, RJSC/NBR notices…). |
| `seo-operations.md` | Canonical SEO/GEO architecture, crawler policy, generated artifacts, validation and search-console release checklist. |

Conventions:

- CSVs are UTF-8, comma-separated, quoted where needed. Keep them machine-readable — no merged
  prose blocks.
- When a planning decision changes, update the relevant file in the same PR as the content change.
- Raw scraped source material stays out of the public repo (`knowledge-bank/` is gitignored on
  purpose — copyright hygiene). Everything in `plan/` is our own work.
