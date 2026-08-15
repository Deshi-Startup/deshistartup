# Deployment architecture and growth budgets

Deshi Startup uses one Cloudflare Worker deployment with two deliberately separate payloads:

- `out/` contains the static Next.js/Nextra site, Pagefind index, fonts, and generated discovery
  files. Cloudflare Static Assets serve matching requests without running Worker code.
- `worker/` contains the small request-time application. It handles `/api/contact`, the
  contribution APIs, and redirects old `/contribute/review/:id` links to the static
  `/contribute/review?id=...` page.
- R2 continues to hold public media and private contributor quarantine objects. Article HTML and
  MDX do not belong in R2 because Static Assets already provide clean URLs, caching, compression,
  and atomic versioned deployment.

This boundary makes content growth independent of the Worker script-size limit. Adding Bangla or
English guides adds static assets; it does not compile the guide bodies into the Worker.

## Free-plan guardrails

Cloudflare's Free plan currently allows a 3 MiB compressed Worker, 20,000 Static Asset files per
Worker version, and 25 MiB per individual asset. The repository applies earlier project budgets:

- Worker bundle: 512 KiB gzip
- Static Asset upload entries: 18,000
- Static Asset warning: 15,000
- Individual asset: 25 MiB

`npm run check:worker` uses Wrangler's real dry-run bundle, measures its gzip size, counts the
static deployment conservatively, and fails before either project budget is crossed. At the
2026-07-30 migration baseline, the Worker was 77.98 KiB gzip and the static deployment used 4,860
upload entries, including 910 HTML files.

If the asset warning fires, inspect generated route and chunk growth before adding more pages.
Likely remedies are consolidating duplicated generated artifacts, reducing per-page export
sidecars, or moving non-page binary/data payloads to R2. Do not move article HTML to R2 merely to
silence the counter; preserve crawlable static pages and clean routing.

## Commands

```bash
npm run dev
npm run test:contact
npm run build:worker
npm run check:worker
npm run preview:worker
```

`npm run dev` runs Next.js and the local API Worker together. The browser keeps same-origin
`/api/*` requests; Next proxies them to Wrangler on port 8787. Local Worker secrets come from the
gitignored `.env.local`.

`CONTACT_INBOX` is the account-level verified Email Routing destination behind the public
`hello@deshistartup.com` alias. Keep that private destination in the Worker secret; do not put it in
`wrangler.jsonc` or other tracked files.

`npm run test:contact` exercises request admission, body and field limits, rate limiting, and email
composition with local mocks. It never sends a real email.
`npm run build:worker` creates the production `out/` directory and runs Pagefind and the SEO audit.
`npm run check:worker` regenerates Cloudflare types from `wrangler.jsonc`, typechecks the Worker,
packages a dry run, and checks both budgets. Deploy and upload commands build first and preserve
dashboard-managed variables and secrets.

## Runtime boundary

The generated `CloudflareEnv` type is the source of truth for R2, KV, rate-limit, asset, variable,
and required-secret bindings. Request handlers receive `env` explicitly. Do not reintroduce
`process.env`, framework runtime adapters, or request-scoped module globals into Worker code.

The following controls remain mandatory:

- verify the Google bearer token on every authenticated request;
- keep pending contributor media private and owner-bound;
- enforce byte, dimension, pixel, daily, global, and rate-limit ceilings;
- allow only configured reviewer accounts to inspect or decide images;
- update approved content and the media registry atomically before quarantine deletion; and
- keep unresolved pending markers as CI failures.
