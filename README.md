# Deshi Startup

[![Star on GitHub](https://img.shields.io/github/stars/Deshi-Startup/deshistartup.svg?style=social)](https://github.com/Deshi-Startup/deshistartup)

Deshi Startup is a free, open-source, Bangla-first startup knowledge base and practical operating manual for founders building in Bangladesh.

The goal is not to become a shallow motivational blog. The goal is to help a founder understand what to do next: validate an idea, register a business, handle tax/VAT basics, accept payments, manage delivery risk, find customers, hire carefully, raise funding, and grow with Bangladesh-specific constraints in mind.

## Purpose

Most startup education is too generic, too Silicon Valley-centric, too English-heavy, or scattered across government portals, blog posts, PDFs, YouTube videos, founder interviews, and Facebook groups.

Bangladeshi founders need practical answers to questions like:

- How do I validate an idea before building a product?
- Should I start as a sole proprietor, partnership, or private limited company?
- How do I think about trade license, e-TIN, VAT/BIN, and business bank accounts?
- How do I accept payments through bKash, Nagad, cards, payment gateways, bank transfer, or COD?
- How do I sell through Facebook, WhatsApp, Messenger, marketplaces, and my own website?
- How do I handle courier reliability, failed delivery, refunds, fraud, and customer trust?
- How do I hire my first employee, freelancer, intern, or co-founder?
- How do I raise money from angels, grants, Startup Bangladesh, local VCs, diaspora investors, or accelerators?
- How do I build ethically and legally in a difficult operating environment?

The content should be accessible enough that an SSC/HSC student can follow it, but detailed enough that a serious founder can use it as a working checklist.

## Content Principles

1. **Bangladesh-specific over generic**
   Advice must reflect how Bangladesh actually works: trust, family pressure, mobile wallets, Facebook commerce, low card usage, COD, courier issues, Dhaka vs outside-Dhaka distribution, regulatory friction, and local investor scarcity.

2. **Bangla-first, bilingual when useful**
   Use clear, casual Bangla. Keep English startup/legal terms when founders are likely to encounter them in real documents, but explain them plainly.

3. **Source-backed**
   Legal, tax, registration, compliance, funding, and policy content should cite official or credible sources. Compliance-heavy pages should show verification notes or direct official links where possible.

4. **Practical, not theoretical**
   Every guide should help a founder take action: checklist, documents needed, decision framework, common mistakes, next steps, templates, and source links.

5. **Ethical and lawful**
   Explain real-world constraints without normalizing bribery, tax evasion, fake documentation, or shortcuts that harm founders later.

6. **Maintainable**
   Regulations, fees, forms, tax rules, and government processes change. Avoid hard-coding unstable numbers unless they are sourced and dated.

## Target Readers

Primary readers:

- Student founders in Bangladesh
- First-time startup founders
- Non-technical founders
- Technical founders who need business/compliance guidance
- Small business owners becoming tech-enabled
- Women founders navigating extra safety and social constraints
- Diaspora founders building for Bangladesh

Secondary readers:

- Startup employees
- University entrepreneurship clubs
- Incubators and accelerators
- Local investors and angels
- Journalists and researchers
- Lawyers, CAs, agencies, and service providers serving startups

## Content Architecture

The site is organized as a hybrid documentation wiki:

- **Start Here:** beginner roadmap and glossary
- **Idea and Validation:** customer discovery, market sizing, MVP tests
- **Legal and Registration:** entity choice, RJSC, trade license, e-TIN, VAT/BIN
- **Payments and Operations:** MFS, gateways, COD, reconciliation, logistics
- **Customers and Growth:** first customers, Facebook commerce, B2B sales, distribution
- **Team and Founder Life:** co-founders, hiring, contracts, family pressure, burnout
- **Funding and Scale:** angel, grants, VC, data room, metrics, regional growth
- **Templates and Checklists:** practical worksheets founders can use immediately

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) App Router
- **Documentation:** [Nextra](https://nextra.site/) with MDX
- **Search:** Pagefind static search index

## Local Development

```bash
npm install
npm run dev
```

Then open the local URL printed by Next.js.

## How to Contribute

1. Fork the repository.
2. Clone your fork locally.
3. Install dependencies with `npm install`.
4. Run the development server with `npm run dev`.
5. Make changes in the `app/` directory.
6. Submit a pull request.

Good contributions include:

- Fixing unclear Bangla
- Updating outdated official links or policy details
- Adding source-backed checklists
- Expanding a thin page into a practical guide
- Adding founder scripts, templates, calculators, or examples
- Flagging legal/tax pages that need professional review

## License

MIT
