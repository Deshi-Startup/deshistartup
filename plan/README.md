# Planning

This folder records durable, public decisions about Deshi Startup. It is not a task tracker or a
second copy of the website.

## One home for each kind of work

| Information | Owner |
|---|---|
| Mission, principles and boundaries | [`vision.md`](./vision.md) |
| Current six-month outcomes and priorities | [`roadmap.md`](./roadmap.md) |
| Planned topics and permanent routes | [`content-backlog.csv`](./content-backlog.csv) |
| Current task, owner and status | GitHub Issues; add a project view only if the issue list becomes hard to follow |
| Public source policy and starting sources | [`sources.csv`](./sources.csv) |
| Research leads, interviews, outreach, consent and attribution | Notion's Research & Source Library |
| Decisions made in chat or meetings | The relevant owning file above |

Do not create a GitHub wiki or duplicate the roadmap in Notion. Chat is useful for discussion, but
an agreed decision should be moved to its owner so it can be found later.

## Files

| File | What it owns |
|---|---|
| `vision.md` | Durable mission, principles, boundaries and definition of success. |
| `roadmap.md` | The current six-month focus, immediate priorities and outcome measures. |
| `content-backlog.csv` | Canonical planned topics and routes. The `Path` column owns permanent URLs. |
| `sources.csv` | Public, tiered starting sources for research and citations. |
| `case-study-format.md` | The required structure for startup case studies. |
| `maintenance-calendar.md` | What must be re-checked and how often. |
| `seo-operations.md` | Search, crawler and generated SEO operations. |
| `media-operations.md` | Media security, review, retention and cost controls. |
| `deployment-architecture.md` | Deployment boundaries, checks and size budgets. |

The live content tree owns journeys, directories and tools. Their pages and structured data should
not be copied into planning spreadsheets.

## Rules

- Keep one owner for each fact. Link to it instead of copying it.
- Keep live counts and task status out of prose. Run `npm run backlog:status` for current content
  progress and use GitHub for current work.
- Add a planning document only when no existing file can own the decision clearly.
- Keep CSVs UTF-8 and machine-readable.
- Keep raw source material, private contact details and unpublished interviews out of the public
  repository. Record permission and attribution before reusing a person's contribution.
- Change the owning file in the same pull request as the decision it records.
