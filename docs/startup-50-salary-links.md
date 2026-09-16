# DS50 salary links

`data/startup-50-salary-links.json` maps DS50 slugs to reviewed Beton Kemon company profiles.
The expanded company details link to `/bn/c/{companySlug}` or `/en/c/{companySlug}`, matching
the DS50 page language. Companies without a mapping show no salary link.
The link sits in a compact footer below the company facts. The company name links to its official
website, so the expanded view does not repeat that link.

Before adding or refreshing a match, confirm the company identity and open both language URLs.
Check that the profile has salary entries. Record the profile's displayed company name and
update `reviewedAt` after checking all mapped profiles. Do not infer a match from similar spelling
alone, or link a parent, subsidiary or unrelated namesake as if it were the listed employer.

Recheck these links during the monthly DS50 review. Remove a mapping if the profile disappears
or no longer matches. Missing mappings can be checked again as Beton Kemon's coverage grows.
This is a link-only feature: no API calls, salary figures, ratings or report counts are copied.
Profile coverage does not affect DS50 selection or imply a partnership or employer endorsement.

Run `npm run test:startup-50` and check mapped and unmapped entries in both languages.
