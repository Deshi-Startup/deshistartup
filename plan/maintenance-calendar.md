# Maintenance calendar

Converted from `plan/research-ops.csv` (2026-07-07). This is the freshness cadence for Deshi
Startup: what to re-check, where, and how often, so the site does not silently go stale. Pair with
the [`verified:` frontmatter system](../AGENTS.md#keeping-content-current) — re-verifying a page
against this calendar is what earns it a bumped `verified:` date.

## Annual

| Action | Sources | Priority |
|---|---|---|
| Mine the national budget speech (delivered every June) for startup-relevant tax/VAT changes; update the regulatory changelog page and any fee tables it touches. | Finance Act, NBR circulars, budget speech | High |
| Sweep all license/registration fee tables site-wide for the new fiscal year and year-stamp every number found ("২০২৭ সালের হিসাবে…"). | RJSC, NBR, city corporation portals, BIDA | High |

## Monthly

| Action | Sources | Priority |
|---|---|---|
| Track RJSC/NBR fee notices, SROs, circulars, and portal process changes; update affected pages directly rather than waiting for the annual sweep. | RJSC, NBR, VAT Online | High |
| Refresh the opportunity/event calendar: demo days, grant application windows, accelerator cohort deadlines, pitch nights. | iDEA, BIG, Startup Bangladesh, BASIS, universities | Medium |

## Quarterly

| Action | Sources | Priority |
|---|---|---|
| Re-verify every directory entry (`data/directory/*.json`): confirm the organization is still active, refresh `lastVerified`, fix dead links. | Official sites, LinkedIn, public profiles | High |
| Reach out to university E-cells for founder interview leads and distribution; treat them as both a source and a channel. | BRAC, NSU, DU, IBA and other E-cells | Medium |

## Ongoing (no fixed cadence, but never skip before publishing)

| Action | Sources | Priority |
|---|---|---|
| Re-check legal/compliance pages against official sources before publishing or bumping `verified:`; have 1-2 practicing CAs/lawyers review where possible. | RJSC, NBR, VAT Online, Bangladesh Bank, BIDA, city corporations | High |
| Prioritize founder interviews for practical patterns: early wedge, trust-building tactics, and mistakes — this is what generic advice misses. | Future Startup, YouTube, podcasts, LinkedIn | High |
| Translate the insight, not the words, from English-language reports into practical Bangla guidance, with attribution (adapt, don't translate — see AGENTS.md style guide). | LightCastle, UNESCAP, World Bank, DataReportal | Medium |
| Evaluate public Bangla blogs, Facebook posts, videos, and legal explainers for source leads (not for copying). | Prothom Alo, LawDoors, Justice Corner, public groups | Medium |
| Summarize and synthesize third-party publications; never scrape or reproduce long passages. | All third-party publications | High (always) |

## How to use this calendar

- This file tells you *when* to re-check something; `plan/sources.csv` tells you *where*; the
  `verified:` frontmatter field (see AGENTS.md) records *that* it was actually re-checked.
- Treat missed cadences as backlog: if a quarterly directory re-verification is overdue, it's a
  higher-priority task than most unwritten stubs.
- When a check surfaces a real change (a fee moved, a portal URL changed, a program shut down),
  fix the content in the same pass — don't just note it here.
