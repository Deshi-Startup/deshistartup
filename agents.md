# deshistartup Agent Context

## Project Overview

This repository is a Next.js documentation site built with Nextra, focused on startup and SME guidance for Bangladesh. The content is primarily written in Bengali and is organized as a static site with a structured app directory.

## Key Technologies

- Next.js `^15.1.3` (using Turbopack for dev)
- Nextra docs theme (`nextra-theme-docs ^4.0.0`)
- React `18.3.1`
- Static export via Next.js (`output: 'export'`)
- Pagefind (`pagefind ^1.5.2`) for fast, static client-side search (runs automatically on `postbuild`)

## Important Files and Directories

- `app/` - Main site content and pages. Contains top-level documentation pages, journey phases, and subsections.
- `app/_meta.js` - Page metadata and sidebar structure. Controls the Nextra navigation hierarchy.
- `app/page.mdx` - Homepage content.
- `context/` - Research and planning resources (e.g., CSV backlogs, `phase-1-plan.md`). This is the "brain" of the project planning.
- `knowledge-bank/` - Curated source documents, reference material, and scraped data for legal and business content.
- `public/` - Static assets used by the site, including the built Pagefind search index.
- `scripts/scrape.js` - Scraping utility used to gather external ecosystem data.

## How to Use This Context

When assisting with this repository, focus on:

1. The `app/` directory first for site content and page structure.
2. `app/_meta.js` to understand navigation and the page hierarchy.
3. `context/` and `knowledge-bank/` for source data, research context, and planning documentation before writing or updating any guide.
4. `package.json` for build commands and dependency information.

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
- আইডিয়া যাচাই (`idea-validation`)
- ব্যবসা নিবন্ধন (`registration`)
- ট্রেড লাইসেন্স (`trade-license`)
- পেমেন্ট সিস্টেম (`payments`)
- গ্রাহক খোঁজা (`customers`)

## Content & Editorial Guidelines

When creating or editing content for this project, agents must adhere to the following rules:
- **Language:** Write in clear, accessible, and natural Bengali. Use common English startup jargon (e.g., MVP, Product-Market Fit, B2B) mixed in where appropriate, as is standard in the BD ecosystem.
- **Local Context:** Always tailor advice to the Bangladeshi market. Emphasize Mobile Financial Services (bKash/Nagad), Cash on Delivery (COD), Facebook-first growth strategies, and the realities of a low-trust market dynamic.
- **Accuracy:** Cross-reference local laws (e.g., RJSC fees, NBR VAT thresholds, Trade License processes) with current realities (e.g., VAT exemption up to 50 Lakh BDT turnover).
- **Formatting:** Use Nextra standard MDX. Include YAML frontmatter with `title` and `description` for every page.
- **Sources:** Always include a `## প্রাসঙ্গিক সূত্র` (Relevant sources) section at the bottom of guides. Use exact, deep-linked markdown URLs to official government portals or ecosystem resources (e.g., `[BIDA One Stop Service (OSS) Portal](https://ossbida.gov.bd)` instead of just `BIDA`).

## Build and Run Commands

- `npm run dev` - Start development server (uses Turbopack)
- `npm run build` - Build the static site (includes Pagefind indexing in the postbuild step)
- `npm start` - Start the production server
- `npm run scrape` - Run the scraping utility

## Notes for Agent Use

- Prefer content in `app/` and `knowledge-bank/` over inferred assumptions about standard startup processes, as Bangladesh has unique constraints.
- Use `context/` files for editorial planning, backlog details, and source references.
- The project is a static docs site, so changes should preserve the Nextra page layout and metadata structure. 
- After making structural or content changes, always run `npm run build` to verify Pagefind indexing and static export succeed without compilation errors.