# deshistartup Agent Context

## Project Overview

This repository is a Next.js documentation site built with Nextra, focused on startup and SME guidance for Bangladesh. The content is primarily written in Bengali and is organized as a static site with a structured app directory.

## Key Technologies

- Next.js `^15.1.3`
- Nextra docs theme (`nextra-theme-docs`)
- React `18.3.1`
- Static export via Next.js (`output: 'export'`)

## Important Files and Directories

- `app/` - Main site content and pages. Contains top-level documentation pages and subsections.
- `app/_meta.js` - Page metadata and sidebar structure.
- `app/page.mdx` - Homepage content.
- `pages/laws/` - Additional static law pages.
- `context/` - Research and planning resources, including content backlog and source references.
- `knowledge-bank/` - Curated source documents, reference material, and scraped data for legal and business content.
- `public/` - Static assets used by the site.
- `scripts/scrape.js` - Scraping utility used to gather external content.

## How to Use This Context

When assisting with this repository, focus on:

1. The `app/` directory first for site content and page structure.
2. `app/_meta.js` to understand navigation and the page hierarchy.
3. `context/` and `knowledge-bank/` for source data, research context, and planning documentation.
4. `package.json` for build commands and dependency information.

## Site Structure

The doc site includes the following major sections:

- শুরু করুন (`start-here`)
- স্টার্টআপ বনাম SME (`startup-vs-sme`)
- ইকোসিস্টেম ওভারভিউ (`ecosystem-overview`)
- আইনগত রোডম্যাপ (`legal-roadmap`)
- কোম্পানির ধরন (`company-types`)
- RJSC / নাম ক্লিয়ারেন্স (`rjsc-name-clearance`)
- ব্যবসা নিবন্ধন (`registration`)
- ট্রেড লাইসেন্স (`trade-license`)
- e-TIN ও VAT/BIN (`e-tin-vat-bin`)
- পেমেন্ট সিস্টেম (`payments`)
- আইডিয়া যাচাই (`idea-validation`)
- গ্রাহক খোঁজা (`customers`)

## Build and Run Commands

- `npm run dev` - Start development server
- `npm run build` - Build the site
- `npm start` - Start the production server
- `npm run scrape` - Run the scraping utility

## Notes for Agent Use

- Prefer content in `app/` and `knowledge-bank/` over inferred assumptions.
- Use `context/` files for editorial planning, backlog details, and source references.
- The project is a static docs site, so changes should preserve the Nextra page layout and metadata structure.
