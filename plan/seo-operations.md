# SEO and AI-discovery operations

This is the operational source of truth for search discovery on `https://deshistartup.com`.
The canonical domain never includes a deployment base path.

Production is built from `main` by Cloudflare Workers Builds and served by the `deshistartup`
Worker at the apex domain. Next.js exports prerendered HTML to `out/`, Cloudflare Static Assets
serve matching files without invoking code, and the native Worker handles only contribution API
routes. `DESHI_DEPLOY_TARGET=cloudflare-worker` keeps canonical output at the root; the production
HTML is validated before Wrangler packages the deployment.

## Indexing policy

- Completed Bengali and English pages are indexable and appear in `sitemap.xml`.
- Honest content stubs remain accessible to contributors but emit `noindex, follow, noarchive`.
- Stubs are excluded from the XML and human-readable sitemaps. Links to stubs use `rel="nofollow"`.
- Every indexable locale pair self-canonicalizes and publishes reciprocal `bn-BD`, `en-BD`, and
  `x-default` alternates. The Bengali root route owns `x-default`.
- XML `<lastmod>` is the page's actual latest git commit date. Do not substitute the build date.

## Generated and postprocessed artifacts

`npm run manifest` creates:

- `app/generated/manifest.bn.json` and `manifest.en.json`
- `app/generated/seo-pages.json`
- `public/sitemap.xml`
- `public/robots.txt`
- `public/llms.txt`
- `public/llms-full.txt`
- page modified, published, and editorial-verification date maps
- the public IndexNow ownership key file

`npm run build` then enriches every prerendered HTML file with:

- the correct `html lang` value
- one self-referencing canonical URL
- reciprocal hreflang links for publishable locale pairs
- written/stub-specific robots directives
- page-specific Open Graph and Twitter cards
- resolvable `Organization` and `WebSite` JSON-LD on every published page
- accurate `Article`, `AboutPage`, `CollectionPage`, `ItemList`, and `BreadcrumbList` JSON-LD where applicable
- publication/modification dates and the CC BY-SA content license

The final `seo:audit` build step fails on missing or duplicate titles/descriptions, wrong
canonicals or languages, bad hreflang clusters, indexable stubs, invalid JSON-LD, sitemap drift,
broken internal links, or orphaned published pages.

## Crawl policy

The project explicitly prioritizes search and user-facing AI-answer discovery. Those uses are
allowed. Model training is a separate policy and is currently reserved, matching the canonical
domain's Cloudflare setting. The distinct agents matter:

- `OAI-SearchBot` controls eligibility for ChatGPT search discovery; `GPTBot` controls OpenAI
  model-training access. OpenAI documents these as independent choices. The first is allowed;
  the second is blocked.
- `PerplexityBot` powers Perplexity search discovery and is not its training crawler.
- `Claude-SearchBot` and `Claude-User` support Anthropic search/user retrieval; `ClaudeBot` is
  the model-development crawler. Search and user retrieval are allowed; `ClaudeBot` is blocked.
- `Googlebot`, not `Google-Extended`, controls Google Search and its AI features. Google-Extended
  controls some other Gemini training and grounding uses. Blocking `Google-Extended` does not
  remove a page from Google Search or Google's AI search features.
- `bingbot` supports Bing and Copilot discovery.

The wildcard group also publishes `search=yes`, `ai-input=yes`, `ai-train=no`, and
`use=reference` Content Signals. These signals are newer than the standard robots directives and
may appear as an unrecognized line in Search Console; Cloudflare documents no resulting search
crawl impact.

Keep Cloudflare's **Managed robots.txt** setting off. The repository-generated file is the
canonical crawler policy; enabling Cloudflare's setting prepends a second wildcard group and
creates two policy owners. If the project's policy changes, update the Content Signals and named
crawler groups in `scripts/build-manifest.mjs` together, without blocking search-specific agents.
Cloudflare's enforcement controls are separate from this publishing setting and may still be used
when an advisory `robots.txt` rule is not enough.

## Metadata policy

- Titles must be unique, descriptive, concise, and in the page's own language. There is no fixed
  Google character limit; the audit warns on unusually long titles rather than enforcing an
  invented 60-character rule.
- Descriptions must be page-specific and useful. Google has no fixed description length limit;
  snippets are truncated to fit the result surface.
- Do not add meta-keywords or repeat keyword variants.
- Do not generate FAQ or HowTo markup unless the visible page genuinely has that structure.
  Structured data describes content; it is never added only to chase a rich result.
- The shared social card is `public/og-default.png` (1200×630). Replace it only with another
  crawlable image of the same dimensions and update `app/seo.config.mjs` if the path changes.

## AI-search policy

Google says AI Overviews and AI Mode have no extra technical requirements beyond being indexed
and eligible for a normal Search snippet. For all answer engines, the durable work remains:

- write direct, self-contained answers under descriptive headings;
- cite primary sources close to load-bearing claims;
- show real updated/verified dates;
- keep the visible text consistent with structured data;
- connect guides through crawlable hubs, journeys, breadcrumbs, and the human sitemap;
- maintain the experimental, curated `llms.txt` as a concise orientation document and keep the
  exhaustive published-page inventory in `llms-full.txt`; never treat either file as a ranking
  guarantee or a substitute for crawlable HTML and a standard XML sitemap;
- publish `rel="describedby"` links from indexable HTML pages to the root `llms.txt`, while keeping
  stubs out of both LLM-facing indexes.

## Release checklist

1. Run `npm run manifest`.
2. Run `npm run lint:bangla`.
3. Run `npm run build:worker`; the build includes the static export and final SEO audit.
4. Run `npm run check:worker`; this enforces the Worker and Static Assets growth budgets.
5. Run `npm run preview:worker` when runtime-facing code changed, then deploy the generated Worker.
6. Confirm `https://deshistartup.com/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, the IndexNow key,
   and one Bengali/English page pair all return HTTP 200. The live robots file must contain exactly
   one `User-agent: *` group, no `# BEGIN Cloudflare Managed content`, the canonical Content
   Signals and `Sitemap:` line, and must allow every search/answer agent listed above.
7. Inspect one guide in Google Rich Results Test and Schema.org Validator.
8. Run `npm run seo:indexnow` only after the new URLs are live.

The canonical production deployment must build the branch that contains these generators and
artifacts. Before releasing, compare the deployment branch with `main`; never assume an older
provider-specific branch contains current content or SEO work. A release is not complete until the
canonical-domain endpoint checks in step 6 pass.

## One-time external setup

These actions require the domain owner's accounts and cannot be completed by a repository build:

1. Verify the `deshistartup.com` domain property in Google Search Console by DNS.
2. Submit `https://deshistartup.com/sitemap.xml` in Search Console.
3. Inspect the home page and one recently published Bengali guide, then request indexing.
4. Add the site to Bing Webmaster Tools, import from Search Console if useful, and submit the same
   sitemap.
5. Set `GOOGLE_SITE_VERIFICATION` and/or `BING_SITE_VERIFICATION` at build time only when HTML-token
   verification is preferred to DNS. The root metadata emits those tokens when present.
6. Check Search Console Page Indexing, Core Web Vitals, Enhancements, and manual actions monthly.
7. Check Bing Site Scan, URL Inspection, crawl errors, and IndexNow status monthly.
8. Track a fixed set of Bangla and English founder questions monthly in Google, ChatGPT,
   Perplexity, and Copilot. Record which Deshi Startup URL, if any, is cited.
9. Keep **AI Crawl Control → Signals → Managed robots.txt** off in Cloudflare. The generated
   `public/robots.txt` is the only crawler-policy source.

## Primary documentation

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: localized versions and hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: snippets and meta descriptions](https://developers.google.com/search/docs/appearance/snippet)
- [Google: structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots)
- [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- [Anthropic crawler documentation](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)
- [IndexNow protocol](https://www.indexnow.org/documentation)
- [Schema.org](https://schema.org/)
- [llms.txt proposal](https://llmstxt.org/)
- [Cloudflare: managed robots.txt](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/)
