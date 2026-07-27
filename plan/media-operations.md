# Media operations and zero-surprise-cost policy

Last platform review: **2026-07-27**

This is the operating policy for images and video posters served from the
`deshistartup-media` R2 bucket. The goal is to keep media fast while staying inside Cloudflare's
free allowances and making accidental or hostile use difficult.

## Cost envelope

Cloudflare's current R2 Standard free allowance is 10 GB-month of storage, 1 million Class A
operations, 10 million Class B operations, and free Internet egress per month. Usage above that is
metered. Deshi Startup therefore enforces a much smaller **500 MB active-plus-retired storage
ceiling** in code. A code review is required to raise it.

Cloudflare Images Free currently allows 5,000 unique transformations each month. Repeated requests
for the same source-plus-options combination count once in that calendar month. After the free
allowance, existing cached transformations continue to work and new transformations fail without
an overage charge on Images Free. Deshi Startup uses at most three responsive widths per raster
image and includes `onerror=redirect`, so a failed new transformation falls back to the original.
Do not purchase Images Paid without a separate cost review.

Official references:

- [R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [Cloudflare Images pricing](https://developers.cloudflare.com/images/pricing/)
- [R2 public buckets and caching](https://developers.cloudflare.com/r2/buckets/public-buckets/)
- [R2 object lifecycle rules](https://developers.cloudflare.com/r2/buckets/object-lifecycles/)
- [Cloudflare budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/)

## Trust boundary

- Contributors never receive an R2 credential or write to the public library. A verified Google
  token can send one bounded image through the same-origin Worker route only into the private
  `deshistartup-media-quarantine` bucket.
- The quarantine bucket has no custom domain, `r2.dev` URL, or CORS. Private previews are streamed
  only after the Worker re-verifies that the requester owns the image or is an allowlisted
  reviewer.
- Direct maintainer uploads still run only from an authenticated Wrangler session. No R2 access
  key is stored in the repository, browser, or GitHub Actions.
- Pull requests may reference only logical `/media/...` entries already present in the committed
  registry. A pending `/__pending-media/...` marker deliberately fails CI until a reviewer has
  explicitly approved or rejected that image.
- The R2 custom domain is public for reads. The `r2.dev` development URL must remain disabled and
  CORS must remain unset. Never expose bucket-write credentials to client code.
- Reviewer Google accounts come only from the runtime `CONTRIBUTION_REVIEWER_EMAILS` allowlist.
  Reviewers can mute for 7 or 30 days, ban, or restore a contributor. The moderation key is a
  one-way hash of the verified Google subject, not a browser/IP guess.

## Contributor quarantine gates

The Worker rejects a proposed image before writing bytes unless all of these pass:

- verified Google ID token; account is not muted or banned;
- Worker rate-limit bindings: 10 image attempts per account per minute, 60 total per point of
  presence per minute, and three contribution submissions per account per minute;
- PNG, JPEG, or WebP only, with MIME, extension, and file header agreeing;
- maximum 300 KB, 3,000 px wide, 6,000 px tall, and 12 million decoded pixels;
- maximum 5 images in one contribution, 15 images and 1.5 MB per account per UTC day;
- maximum 25 MB across the entire private quarantine.

The request gate runs before any R2 operation. After validation, one strongly consistent R2 list
enforces the daily and global storage ceilings; a paginated result fails closed because 1,000
pending objects is already outside the intended envelope. Quota races can overshoot by at most the
small number of simultaneously accepted 300 KB requests, not by an unbounded amount.

Submission binds every pending marker to the signed-in owner, page, private object, and required alt
text. The PR body links the private review page. A reviewer decision revalidates the bytes, checks
the 500 MB public-library ceiling, then writes one atomic Git tree containing both the article and
registry update. Only after that commit succeeds are the quarantine bytes deleted.

## Upload gates

`npm run media:upload` validates the whole batch before the first R2 write:

- PNG, JPEG, and WebP only. SVG and GIF are rejected because this project has no SVG sanitizer and
  no animation review pipeline.
- The file header must match the extension.
- Maximum 300 KB per file, 3,000 px wide, 6,000 px tall, and 12 million decoded pixels.
- Maximum 25 files and 5 MB per command.
- Symbolic links, paths outside `media/`, non-ASCII path punctuation, and duplicate logical paths
  are rejected.
- Active plus retired bytes may not cross the 500 MB project ceiling.
- Content hashes deduplicate unchanged uploads and make delivery URLs immutable.

Every image still needs editorial review: educational relevance, source and rights, privacy,
legible redaction of personal data, useful alt text, and credit where required. Uploading an image
does not approve it.

## Retention and deletion

Do not use an age-based lifecycle rule on the active object namespace. A correct screenshot may
remain in use for years, so a blanket "delete after 90 days" rule would eventually break live
pages.

Instead:

1. Replacing an image automatically records its previous immutable object in
   `app/generated/media-retired.json`.
2. `npm run media:prune` is always a dry run. It lists unreferenced active entries and retired
   objects old enough to delete.
3. After confirming that no page uses them, run
   `npm run media:prune -- --retire-unreferenced`. Commit and deploy the registry change.
4. Retired objects remain available for a 30-day rollback and cache-settling grace period.
5. Run `npm run media:prune -- --apply` to delete only grace-expired retired keys from R2.

For an illegal, privacy-breaching, or secret-bearing object, skip the grace period: remove the
reference and registry entry, delete the exact R2 key with Wrangler, and purge its custom-domain
cache immediately. Record what was removed in the incident/PR without reproducing the sensitive
content.

R2's default "abort incomplete multipart uploads after 7 days" rule should remain enabled. It is
safe because it affects unfinished uploads, not live media.

The quarantine bucket additionally has the scoped
`delete-quarantined-after-7-days` lifecycle rule on `pending/`. This is the final cleanup backstop
for abandoned drafts and undecided reviews. Rejected images are deleted immediately. Approved
images are copied into the content-addressed public namespace and then removed from quarantine.

## Cloudflare dashboard controls

These controls are outside the repository and must be checked after account, plan, or DNS changes:

1. **R2 bucket:** Standard storage; custom domain `media.deshistartup.com` active; `r2.dev`
   disabled; no CORS rule; no public write token; Data Catalog, SQL, event notifications, and local
   uploads off unless separately reviewed.
2. **Quarantine R2 bucket:** `deshistartup-media-quarantine`; Standard storage; no custom domain,
   no `r2.dev`, no CORS; only the seven-day `pending/` expiry lifecycle.
3. **Cache Rule for the media hostname:** cache eligible static media, respect the immutable origin
   header, and use a custom cache key that ignores query strings. The site emits no media query
   parameters, so ignoring them prevents random query strings from turning one object into
   unlimited cache misses.
4. **Tiered Cache:** enable Smart Tiered Cache. Cloudflare recommends it for R2 custom domains and
   currently makes it available on all plans without extra cost.
5. **Budget alerts:** create account-level alerts at **$1 and $5**. The default $10 alert is too
   late for a zero-cost goal. Alerts are informational, processed daily, and do **not** cap spend.
6. **Billable Usage:** check daily for the first week after enabling media or changing cache rules,
   then monthly. Investigate any non-zero R2 charge, sudden Class B growth, or storage that differs
   materially from the registry report.

If Cloudflare adds a hard spending cap, enable it at the lowest practical threshold. As of the last
review, budget alerts warn but do not stop service.

**Live verification (2026-07-27):** Billable Usage was $0.00; the $1 early-warning, $5 urgent, and
Cloudflare default $10 alerts were active; the `Media R2 cache guardrail` rule matched
`media.deshistartup.com`, made responses cache-eligible, and ignored query strings; Smart Tiered
Cache was active. The private `deshistartup-media-quarantine` bucket was created in WEUR with its
seven-day `pending/` lifecycle, and the `CONTRIBUTION_GUARDS` KV namespace was created for
short-lived review state and sparse moderation records.

**Cost kill switch:** if unexplained R2 operations are growing faster than they can be investigated,
disable `media.deshistartup.com` under the bucket's Custom Domains settings. Article text remains
available while images stop, and the public `r2.dev` bypass is already disabled. Re-enable the
domain only after the traffic and cache-key cause is understood.

## Monthly checklist

```bash
npm run lint:media
npm run media:prune
npx wrangler r2 bucket info deshistartup-media
npx wrangler r2 bucket dev-url get deshistartup-media
npx wrangler r2 bucket lifecycle list deshistartup-media
npx wrangler r2 bucket info deshistartup-media-quarantine
npx wrangler r2 bucket lifecycle list deshistartup-media-quarantine
```

Then compare the live object count/bytes with the active and retired counts printed by the local
tools, review R2 and Images usage in the dashboard, and apply eligible pruning after reading the dry
run. A live bucket larger than the tracked registry is an orphan signal and must be investigated.

## Why this borrows from Wikimedia without copying its scale

Wikimedia separates upload permissions and file metadata from delivery, restricts accepted types,
checks MIME/extension consistency, records where a file is used, and checks global usage before
deletion. It also keeps replacement history and uses deliberate deletion procedures rather than
blindly removing old files. Deshi Startup applies the same principles with a maintainer-only upload
boundary, a committed usage registry, preflight limits, and a recoverable retirement period.

- [Wikimedia Commons deletion policy](https://commons.wikimedia.org/wiki/Commons:Deletion_policy/en)
- [MediaWiki MIME type detection](https://www.mediawiki.org/wiki/Manual:MIME_type_detection)
- [MediaWiki image administration](https://www.mediawiki.org/wiki/Manual:Image_administration)
