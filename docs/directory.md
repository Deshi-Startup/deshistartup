# Directory records

Each `data/directory/<category>.json` file contains one array of bilingual records.
`DirectoryList` selects the requested language on the server before passing rows
to the interactive table.

- `id` is a stable identifier within the category. Keep it when a name changes.
- `website`, `sourceUrls` and `lastVerified` belong to the shared record.
- `en` and `bn` contain the same copy fields, including `name` and `notes`.
- A genuinely language-specific website can use `{ "en": "…", "bn": "…" }`.
  Evidence links remain shared, even when a source is available in one language.

Edit and verify the English facts first, then reconcile the Bangla copy. A link
correction or translation repair alone does not refresh `lastVerified`: change
that date only after checking the record's relevant claims against its sources.
Keep qualifications, fees, eligibility and application instructions equivalent.

Run `npm test` to check IDs, shared evidence and locale field parity, then
`npm run lint:bangla -- data/directory/<category>.json`. Review both rendered
editions, including filters, source links and comparison, before releasing.
Schema checks cannot prove that translations convey equivalent facts.

The September 2026 consolidation reconciled the RJSC, environment, DPDT and
Copyright Office application instructions using the official [RJSC service
menu](https://app.roc.gov.bd/psp/homeframe), [RJSC name-clearance
process](https://app1.roc.gov.bd/Guidlines/RJSC_bus_pro_NC.htm), [environment
application steps](https://ecc-beta.doe.gov.bd/how-to-apply), [DPDT electronic
filing instructions](https://dpdt.gov.bd/pages/static-pages/6922e011933eb65569e25501)
and [Copyright Office service
charter](https://copyrightoffice.gov.bd/site/charter_of_duties/c4a8e52c-787c-484f-9a22-b921a08b5f43/Citizen).
Existing verification dates were retained; this was not a full directory refresh.
