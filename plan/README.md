# Planning

This folder holds the authored decisions about what to build and maintain. Site content lives in
`app/(contents)/`; generated status and manifests are outputs, not planning documents.

| File | What it is |
|---|---|
| `vision.md` | Durable mission, principles, product shape and success criteria. |
| `content-backlog.csv` | Canonical planned topics and permanent routes. `Path` is the route registry. |
| `sources.csv` | Tiered source registry (63 sources): who to trust for what, with URLs. Use when adding sources to any page. |
| `case-study-format.md` | The 15-field format every startup case study must follow. |
| `directory-schema.csv` | Categories + suggested data fields for the ecosystem directory. |
| `workflow-maps.csv` | Founder journeys and their ordered paths. |
| `bd-insights.csv` | Bangladesh-specific research questions that should shape playbooks. |
| `templates-tools.csv` | Planned templates, checklists, and calculators. |
| `people-startups.csv` | Founders/startups to research for case studies, and where to look. |
| `maintenance-calendar.md` | What to re-check, where and how often. |
| `seo-operations.md` | Canonical SEO/GEO architecture, crawler policy, generated artifacts, validation and search-console release checklist. |
| `media-operations.md` | R2 cost envelope, upload trust boundary, retention/pruning policy, and Cloudflare dashboard checklist. |

Conventions:

- CSVs are UTF-8, comma-separated, quoted where needed. Keep them machine-readable — no merged
  prose blocks.
- Do not repeat live counts or priority lists in prose. Run `npm run backlog:status`.
- When a planning decision changes, update its one owning file in the same PR.
- Raw scraped source material stays out of the public repo (`knowledge-bank/` is gitignored on
  purpose — copyright hygiene). Everything in `plan/` is our own work.
