<div align="center">

<a href="https://deshistartup.com/en"><img src=".github/assets/social-preview.png" alt="Deshi Startup – the open-source manual for building a startup in Bangladesh" width="720" /></a>

# Deshi Startup

**The open-source manual for building a startup in Bangladesh**

From idea validation to company registration, payments, first customers, and fundraising –
practical, source-backed guides for every step, written Bangla-first with a full English mirror.

**[বাংলা সংস্করণ →](./README.md)**

### 📖 [Read it at deshistartup.com →](https://deshistartup.com/en)

[![GitHub stars](https://img.shields.io/github/stars/Deshi-Startup/deshistartup?style=social)](https://github.com/Deshi-Startup/deshistartup/stargazers)
[![Progress](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FDeshi-Startup%2Fdeshistartup%2Fmain%2Fpublic%2Fprogress.en.json&style=flat-square)](https://deshistartup.com/en/sitemap)
[![Contributors](https://img.shields.io/github/contributors/Deshi-Startup/deshistartup?style=flat-square&color=047857)](https://github.com/Deshi-Startup/deshistartup/graphs/contributors)
[![Content: CC BY-SA 4.0](https://img.shields.io/badge/content-CC_BY--SA_4.0-047857?style=flat-square)](./LICENSE-content.md)
[![Code: MIT](https://img.shields.io/badge/code-MIT-2f6f8f?style=flat-square)](./LICENSE)

</div>

---

## Why this exists

Wikipedia gave every language an encyclopedia. Bangladesh's founders still learn from scattered
Facebook posts, expensive consultants, and Silicon Valley advice that stops working the moment
you walk into an RJSC office.

Deshi Startup fills that gap: **what to do next, which office to visit, how much it costs, which
law applies** – in one place, cited to official sources, in the language founders actually think
in. Accessible enough for a student, detailed enough to use as a working checklist. Bengali is
the source of truth; every page has an English mirror under `/en/...`.

## Progress

**68 of 440+ planned pages are written** (the badge above is live). The remaining 370+ topics are
honestly marked as stubs on the site – no fake pages. Each one is waiting for someone who has done
the thing themselves, or knows how to research it properly.

**Could the next guide be yours?** [Browse open topics →](https://github.com/Deshi-Startup/deshistartup/issues)

## How to contribute

No coding required – a GitHub account and a browser are enough.

| Time | What | How |
|---|---|---|
| 2 min | Report wrong or outdated info | Click **"Report a mistake"** on any page, or [open an issue](https://github.com/Deshi-Startup/deshistartup/issues/new?template=report-mistake.yml) |
| 5–10 min | Fix a typo, link, or sentence | Click **"Edit"** on the page – it all happens in the browser |
| A few hours | Write a stub into a full guide | [Pick an open issue](https://github.com/Deshi-Startup/deshistartup/issues?q=is%3Aissue+is%3Aopen+label%3A%22নতুন+গাইড%22) or [browse the backlog](./plan/content-backlog.csv) |

Step-by-step instructions: the site's [contribute page](https://deshistartup.com/en/contribute)
and [CONTRIBUTING.md](./CONTRIBUTING.md).

Quality is anchored by two binding documents: [STYLE.md](./STYLE.md) (so the Bangla reads like
Bangla, never like translated English) and [EDITORIAL.md](./EDITORIAL.md) (so every page actually
teaches). `npm run lint:bangla` catches the mechanical issues automatically – imperfect language
is fine, review will polish it.

**Our promise:** first response to every issue and pull request within 48 hours.

## What's inside

- 🧭 **[Start Here](https://deshistartup.com/en/start-here)** – the full roadmap and glossary
- 🛤️ **[Journeys](https://deshistartup.com/en/journeys)** – 12 goal-based guided paths ("I have an idea but no product"…)
- ✅ **[Idea Validation](https://deshistartup.com/en/validation)** – customer interviews, market sizing, MVPs
- 🏛️ **[Topic guides](https://deshistartup.com/en/guides)** – registration, tax, payments, customers, team, funding – every topic has its own hub
- 🪜 **[Step-by-step roadmap](https://deshistartup.com/en/roadmap)** – validate & set up → product & team → selling & funding → scale & ecosystem
- 📚 **[Case Studies](https://deshistartup.com/en/case-studies)** – Pathao, bKash, Chaldal… source-backed local stories
- 🗂️ **[Directory](https://deshistartup.com/en/directory)** – investors and accelerators as verified, structured data
- 🌙 **[Founder Life](https://deshistartup.com/en/founder-life)** – family pressure, mental health, solo-founder reality

## Why trust it

This is a reference manual, not a motivational blog. The quality system:

- Every legal/fee/rule claim **cites a source** – official portals (RJSC, NBR, Bangladesh Bank) first
- Every fee and number is **year-stamped** ("as of 2026…") so stale data reads as stale
- Compliance pages carry a separate **"last verified"** date, re-checked on a [maintenance calendar](./plan/maintenance-calendar.md)
- **Binding standards:** [STYLE.md](./STYLE.md) + [EDITORIAL.md](./EDITORIAL.md) + an automated linter; legal/tax pages never publish without review
- We use AI to help draft; humans set the bar – the process, backlog, and source registry are all public ([plan/](./plan/))

Still: this site is general guidance, not legal or tax advice. Verify with official sources or a
professional before big decisions.

## Built by

<a href="https://github.com/Deshi-Startup/deshistartup/graphs/contributors"><img src="https://contrib.rocks/image?repo=Deshi-Startup/deshistartup" alt="Contributors" /></a>

Your avatar belongs here – make your first contribution today.

## Plans & governance

The entire plan is public – what gets written, which sources to trust, what gets re-verified when:

- [plan/](./plan/) – the content backlog (390+ topics), tiered source registry, maintenance calendar
- [plan/vision.md](./plan/vision.md) – full vision, content principles, definition of success
- [AGENTS.md](./AGENTS.md) – site architecture and conventions (for developers and AI agents)
- [Discussions](https://github.com/Deshi-Startup/deshistartup/discussions) – questions, ideas, conversation

## For developers

```bash
npm install
npm run dev
```

Stack: [Next.js](https://nextjs.org/) (static export) + [Nextra](https://nextra.site/) +
[Pagefind](https://pagefind.app/) search, custom wiki shell. Architecture and conventions:
[AGENTS.md](./AGENTS.md). Remember – contributing content needs none of this; a browser is enough.

## License

- **Content** (all guides, case studies, directory data): [CC BY-SA 4.0](./LICENSE-content.md) –
  Wikipedia's license. Anyone may copy, translate, and republish with attribution, under the same license.
- **Code:** [MIT](./LICENSE).

Attribution format: *"Deshi Startup – deshistartup.com, CC BY-SA 4.0"*

---

<div align="center">

⭐ **If this is useful, star the repo** – one click helps this knowledge reach more founders.

*Knowledge in our mother tongue, for everyone, free forever.*

</div>
