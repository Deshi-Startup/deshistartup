# Startup ideas for Bangladesh

Approved direction and local implementation, 19 September 2026.

## Purpose

Help prospective founders find something worth building and take a useful first
step. Start with a small, useful collection. Its value is the customer conversations
and experiments it helps start, not the number of entries or page views.

## The product

**Startup ideas** is the public label; **Problems worth solving.** is the heading.
An idea is the browsable, saveable and shareable unit. Each page explains who it
helps, how it works and a first test. Readers do not need to learn the underlying
problem/idea/company model to use the product.

The catalogue has search, sector, location and idea-type filters, and saving. A detail page
contains one idea with practical next steps. Research and sources expand below;
companies remain small supporting references. Keep the main site's identity and
fonts. Use ordinary language, restrained spacing and visible, familiar controls.
Remove repeated explanations, empty sections, disclaimers and decorative UI.
Keep the type-filter pills, sharing, a few written guides and quiet links to
alternative ideas for the same problem. Use a stacked index introduction and
plain row metadata. Avoid collection statistics, freshness badges, progress bars
and recommendations based only on sharing a sector.

`/startup-ideas` lives on the main website, with one stable URL per idea and mirrored
English/Bangla routes. `/ideas` continues to hold the manual's guides. The old
problem catalogue and detail layouts are retired. Old links lead to the relevant
ideas; saved problems migrate to their related ideas without losing the backup.

The first collection has six researched ideas backed by six shared problem records. D1
already stores the useful relationships and reviewed submissions. Keep that model;
changing the public view requires no database rewrite. Public pages remain static.

## Companies

Keep one canonical `/companies/<slug>` profile per identity, shared with DS50 and
case studies. No Companies navigation or company counts on the idea index. The
unpromoted company index may remain directly reachable.

“Working on this?” opens the existing reviewed contribution flow. Search existing
identities before proposing a new company. Several teams can work on the same
problem; this is not an exclusive claim. A submission never grants profile control.

Current relationships describe work on the underlying problem, so the page says
**Related companies**. The company profile explains the actual work and source. Exact
idea matches can be added when records support them. A list is not a measure of
market saturation, and an empty list is not proof of an empty market.

## What the examples teach

Public pages were revisited on 16 September 2026. These are observations about
product structure, not independent verification of the sites' market claims,
revenue estimates or business outcomes. IdeaBrowser's homepage fetch returned 403;
its live public homepage, catalogue and a complete public idea report were inspected
in the browser instead. No paid or signed-in features were inspected.

| Example | Observed pattern | Useful for Deshi Startup | Restraint needed |
|---|---|---|---|
| [IdeaBrowser catalogue](https://www.ideabrowser.com/database) and [public example](https://www.ideabrowser.com/idea/a-marketplace-for-camera-gear-that-owners-have-not-listed-19cb2235) | Concrete ideas lead into research, scores, execution suggestions and build prompts. | Specific examples and a path from reading to trying. | Numerous scores, labels, frameworks and actions compete for attention. Its illustrative ratings and revenue ranges are not customer validation for Bangladesh. |
| [Zeph Idea Bank](https://zeph.vc/idea-bank) and [agrisolar example](https://zeph.vc/idea-bank/clean-energy/agrisolar-farms-for-farmers) | Local climate ventures, a stated business proposition, adjustable economics and investor interest. The example also lists businesses elsewhere. | Explain why the local context matters and show relevant existing work. | Zeph is sourcing investments. Deshi Startup should not imply backing, promise profit, or add calculators without maintained assumptions. |
| [YC Requests for Startups](https://www.ycombinator.com/rfs) | Authored requests describe areas founders could tackle; the page explains that they are only a subset of what YC funds. | A curated point of view can inspire action without specifying every solution. | Broad or ambitious themes still need a concrete customer and an accessible first test for a new founder. |
| [Starter Story ideas](https://www.starterstory.com/ideas) | Idea collections connect to business examples and case studies, often presented with revenue figures. | Connect inspiration to relevant Deshi Startup case studies and practical lessons. | Featured outcomes and collection medians are not a forecast for another founder or market. Keep the reader's constraints and local evidence visible. |

The shared lesson is a useful sequence: discover, understand, try. None of these
interfaces establishes demand for our own product. Paul Graham's
[How to Get Startup Ideas](https://paulgraham.com/startupideas.html) also argues for
noticing real unmet needs rather than inventing plausible solutions. That supports
the editorial approach; it is advice, not evidence that a problem catalogue will
produce successful companies.

## Discovery signals

Editorial picks lead the recommended order, with a short reason under each idea's
research disclosure. Prioritize an important local problem, a clear customer or
payer and a practical first test. Keep new ideas and less represented sectors in
the selection. Popularity does not determine editorial quality.

One optional upvote expresses interest in seeing an idea built. Reuse Google sign-in
and D1, keep account choices private, and count each account once per idea across
languages. Saving stays private and browser-local. A compact sort lets readers
choose Newest or, once votes exist, Most upvoted. No seeded engagement, public voter
lists, or numerical quality scores.

## What waits

Defer progress tracking, comments, trending, investor badges, dashboards, automatic
research imports and a standalone company-discovery product. Add a grant, investor
interest or research link only when useful, supported and maintainable. Do not
prebuild empty feature slots. Saved items remain browser-local for now.

A vote helps surface interest, but it must not masquerade as demand.
A founder liking an idea and a customer wanting a problem solved are different.

## Contributions

A small “Add an idea” action opens a three-field form: a name, the idea and who
would use it. Further context is optional. Drafts stay recoverable in the browser;
Google sign-in sends a private proposal to the existing D1 review queue. Accepted
proposals need editorial preparation before publication. This keeps submission
useful without introducing a separate account dashboard or publishing system.

## Learn before expanding

Try the collection with a small group of prospective founders, including people
outside Dhaka and people who do not code. Can they find a relevant idea, explain
the customer need and identify someone to talk to? Check what they tried a week
later. Use those observations to decide what to improve; no new tracking dashboard
is needed for this first test.

Implementation and local review/publication commands live in
[`docs/startup-ideas.md`](../docs/startup-ideas.md). The shared data model lives in
[`ecosystem-data.md`](./ecosystem-data.md).
