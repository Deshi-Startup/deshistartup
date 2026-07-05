# Deshi Startup Suggestion Worker

This Worker receives public no-login content suggestions from the site and creates labeled GitHub issues for editorial triage.

## Required Configuration

Copy `wrangler.toml.example` to `wrangler.toml` outside this PR or in deployment infrastructure, then set:

- `GITHUB_REPO`: `Deshi-Startup/deshistartup`
- `ALLOWED_ORIGINS`: comma-separated site origins, not paths
- `REQUIRE_TURNSTILE`: `true` in production
- `GITHUB_TOKEN`: encrypted secret with permission to create issues
- `TURNSTILE_SECRET_KEY`: encrypted Turnstile secret

Optional:

- `RATE_LIMITER`: Cloudflare Rate Limiting binding

## Local Verification

```bash
npm run worker:test
```

## Production Flow

1. The website posts to `POST /suggestions`.
2. The Worker validates origin, size, honeypot, Turnstile, and rate limit.
3. The Worker creates a GitHub issue labeled `content-suggestion` and `needs-triage`.
4. Serious reports also receive `urgent` and `risk: high`.
