# deshistartup Agent Context

## Project Overview

This repository is a Next.js documentation site built with Nextra, focused on startup and SME guidance for Bangladesh. The site is being localized into Bengali and English. Bengali content is the source of truth, and English pages should live in the matching English route tree.

## Key Technologies

- Next.js `^15.1.3` (using Turbopack for dev)
- Nextra docs theme (`nextra-theme-docs ^4.0.0`)
- React `18.3.1`
- Static export via Next.js (`output: 'export'`)
- Pagefind (`pagefind ^1.5.2`) for fast, static client-side search (runs automatically on `postbuild`)

## Important Files and Directories

- `app/` - Shared Next.js app shell, layouts, global CSS, components, and route groups.
- `app/(contents)/(bn)/` - Bengali content. Route-group folders do not appear in public URLs, so these pages render at clean root paths like `/start-here`, `/phase-one`, and `/e-tin-vat-bin`.
- `app/(contents)/en/` - English localized content. These pages render at `/en/...`, for example `/en/start-here`.
- `app/components/LocalizedLayout.jsx` - Localized Nextra layout, language detection, sidebar ordering, and route-group page-map normalization.
- `app/components/LanguageSwitcher.jsx` - Switches between clean Bengali URLs and `/en/...` URLs.
- `_meta.js` files are intentionally not used under `app/` because Nextra validation does not work cleanly with the current route-group localization structure. Sidebar order is controlled programmatically in `LocalizedLayout.jsx`.
- `context/` - Research and planning resources (e.g., CSV backlogs, `phase-1-plan.md`). This is the "brain" of the project planning.
- `knowledge-bank/` - Curated source documents, reference material, and scraped data for legal and business content.
- `public/` - Static assets used by the site, including the built Pagefind search index.
- `scripts/scrape.js` - Scraping utility used to gather external ecosystem data.

## How to Use This Context

When assisting with this repository, focus on:

1. `app/(contents)/(bn)/` first for Bengali source content and page structure.
2. `app/(contents)/en/` for English localized pages. Keep folder slugs aligned with the Bengali tree.
3. `app/components/LocalizedLayout.jsx` to understand navigation order and page-map localization. Do not reintroduce `_meta.js` unless the route-group validation issue has been solved.
4. `context/` and `knowledge-bank/` for source data, research context, and planning documentation before writing or updating any guide.
5. `package.json` for build commands and dependency information.

## Site Structure

The documentation site is organized by founder journey phases and core actionable guides:

**Phases:**
- Phase 1 রোডম্যাপ (`phase-one`): Ideation, validation, and registration
- Phase 2 রোডম্যাপ (`phase-two`): Product, hiring, and basic compliance
- Phase 3 রোডম্যাপ (`phase-three`): Growth, marketing, and funding
- Phase 4 রোডম্যাপ (`phase-four`): Scaling, advanced compliance, and government policy
- Founder Life (`founder-life`): Mental health, family constraints, and solo founder realities

**Core Initial Guides:**
- শুরু করুন (`start-here`)
- স্টার্টআপ বনাম SME (`startup-vs-sme`)
- ইকোসিস্টেম ওভারভিউ (`ecosystem-overview`)
- Founder Life (`founder-life`)
- আইডিয়া যাচাই (`idea-validation`)
- গ্রাহক খোঁজা (`customers`)
- আইনগত রোডম্যাপ (`legal-roadmap`)
- RJSC / নাম ক্লিয়ারেন্স (`rjsc-name-clearance`)
- ব্যবসা নিবন্ধন (`registration`)
- ট্রেড লাইসেন্স (`trade-license`)
- পেমেন্ট সিস্টেম (`payments`)

**Current English Localization Coverage:**
- `start-here`
- `startup-vs-sme`
- `ecosystem-overview`
- `founder-life`
- `idea-validation`
- `customers`
- `legal-roadmap`
- `rjsc-name-clearance`
- `registration`
- `trade-license`
- `payments`

## Content & Editorial Guidelines

When creating or editing content for this project, agents must adhere to the following rules:
- **Language:** For Bengali pages, write in clear, accessible, and natural Bengali. Use common English startup jargon (e.g., MVP, Product-Market Fit, B2B) mixed in where appropriate, as is standard in the BD ecosystem. For English pages, use clear English and do not leave Bengali text behind.
- **Localization:** Do not replace Bengali content when localizing. Create or update the matching page under `app/(contents)/en/...`. Keep slugs and folder structure aligned across locales whenever possible.
- **Routing:** Bengali pages should link to clean root URLs such as `/customers`. English pages should link to `/en/...` URLs such as `/en/customers`.
- **Navigation:** Update `app/components/LocalizedLayout.jsx` when adding an English page that should appear in the sidebar. Avoid `_meta.js` in `app/` unless the validation behavior is intentionally changed.
- **Local Context:** Always tailor advice to the Bangladeshi market. Emphasize Mobile Financial Services (bKash/Nagad), Cash on Delivery (COD), Facebook-first growth strategies, and the realities of a low-trust market dynamic.
- **Accuracy:** Cross-reference local laws (e.g., RJSC fees, NBR VAT thresholds, Trade License processes) with current realities (e.g., VAT exemption up to 50 Lakh BDT turnover).
- **Formatting:** Use Nextra standard MDX. Include YAML frontmatter with `title` and `description` for every page.
- **Sources:** For Bengali pages, include a `## প্রাসঙ্গিক সূত্র` section where appropriate. For English pages, use `## Relevant Sources`. Use exact, deep-linked markdown URLs to official government portals or ecosystem resources (e.g., `[BIDA One Stop Service (OSS) Portal](https://ossbida.gov.bd)` instead of just `BIDA`).

## Build and Run Commands

- `npm run dev` - Start development server (uses Turbopack)
- `npm run build` - Build the static site (includes Pagefind indexing in the postbuild step)
- `npm start` - Start the production server
- `npm run scrape` - Run the scraping utility

## Notes for Agent Use

- Prefer content in `app/` and `knowledge-bank/` over inferred assumptions about standard startup processes, as Bangladesh has unique constraints.
- Use `context/` files for editorial planning, backlog details, and source references.
- The project is a static docs site, so changes should preserve the Nextra page layout and route-group structure.
- Route groups are used intentionally: `(contents)` and `(bn)` organize files without changing public URLs.
- Smooth scrolling is enabled globally in `app/globals.css`.
- After making structural or content changes, run `npm run build` when the local Node version supports the installed Next.js version. If build fails because the local Node runtime is too old, report that clearly instead of assuming the content change is broken.
