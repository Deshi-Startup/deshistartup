# Economic Census 2024 source extraction

These checked source tables produce `data/maps/economy.json`. They cover 64
districts, eight divisions and the national total. The JSON exposes each geographic
total; CSVs retain its rural/urban partition so the importer can check every sum.
This is factual extraction from final BBS publications, not synthetic estimates.

## Sources and dates

- [BBS Economic Census index](https://bbs.gov.bd/pages/static-pages/695b97c8c4774958d7b702b7)
- [Final Volume I PDF](https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/3/5c074dc0-09bd-41a5-9068-308e67afe931.pdf): published **March 2026**, uploaded **7 April 2026**.
- [Volume I detail XLSX](https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/806d8a74-5bcf-4c06-bc1f-1aaf7dea3a1d.xlsx) and [overview XLSX](https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/4/e13d7929-4912-444c-a176-c9342a6f4c2c.xlsx): index upload date **18 May 2026**.
- [Final Volume II PDF](https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/6/c349ddf7-fe70-4c4e-8062-7cc1c468f84b.pdf), [landing page](https://bbs.gov.bd/pages/files/6a6205046668036aac00fc43): published **June 2026**, uploaded **23 July 2026**.
- Observations: census enumeration **10–26 December 2024**, excluding 16 and
  25 December. Retrieval and verification: **12 September 2026**.

`metadata.json` records exact byte counts and SHA-256 hashes for both official
PDFs, both official XLSX files and both derived PDF-text files. Publication months
come from title pages; upload dates come from the BBS index. Rebuilding does not
claim a new source retrieval or verification. No source binaries are committed.

## Tables and derivation

Page references are one-based: `pdfPage` is the physical page in the complete PDF,
while `printedPage` is the report's printed label.

| Source file | Report table and cells | Location | Rows |
| --- | --- | --- | --- |
| `totals.csv` | Volume I S2: economic units, permanent/temporary establishments, economic households, and the corresponding four TPE counts | Detail XLSX `Table S2`, rows 5–223; PDF 143–147 / printed 119–123 | 219 |
| `regional-checks.csv` | Volume I S3: total economic units and TPE; overview 3.3: national/division unit-type counts | Detail XLSX `Table S3`, rows 6–78; overview XLSX `Table 3.3`, national and eight division rows | 73 |
| `permanent-sector-establishments.csv` | Volume II S4: all-sector total and the 18 BSIC B–S columns | PDF 58–67 / printed 44–53 | 219 |
| `permanent-sector-persons.csv` | Volume II S5: permanent-establishment TPE, all-sector total and the same 18 sectors | PDF 67–77 / printed 53–63 | 219 |

The source CSVs preserve report names and exact physical pages. Internal IDs use
the existing geographic crosswalk, not official BBS geographic codes. The report
spellings `Chapainababganj` and `Chapainawabganj` map to the same canonical district.
Division suffixes distinguish divisions from districts with the same name. Some
PDF division names wrap onto a separate line; extraction handles that explicitly.
S4 ends and S5 begins on physical page 67; the parser separates them at the table
heading before reading cells.

All eight numbers in every S2 XLSX locality row are matched to an identical row in
the final Volume I PDF. S3 totals independently match S2 for all 73 geographic
domains. The nine national/division overview rows match S2, and the S3 size-category
partitions also reconcile during original extraction. Every S4 and S5 row sums to
its published total, which matches S2's permanent-establishment or permanent-TPE
total respectively. Every rural+urban partition, district-to-division sum and
district/division-to-national sum matches for all eight aggregate measures and
all 18 sector measures. **No unresolved imported cells remain.**

The title/imprint, scope and definition pages and selected first, middle and final
table pages were visually inspected. Volume I S2 inspected pages: 143, 145, 147.
Volume II inspected table pages: 58, 61, 64, 67, 70, 74, 77. This combines complete
programmatic cell/sum reconciliation with selected visual checks; it does not
claim independent manual transcription of every cell.

## Interpretation and source defects

- Use **economic units counted by the 2024 Census**, not registered companies or
  distinct corporate customers. Government and non-profit/community-service
  establishments are included, and multi-establishment enterprises can contribute
  multiple units.
- The report includes specified farm-based livestock, poultry, fishery and nursery
  establishments but excludes agricultural production households (Volume I PDF 27 /
  printed 3). An unqualified “all non-agricultural businesses” label loses that
  distinction. All sector-table totals nevertheless reconcile exactly with the
  permanent-establishment totals in S2.
- Sector counts and shares cover **permanent establishments only**. Divide a
  sector's establishment count by `permanentEstablishments`, never `economicUnits`.
  Sector `personsEngaged` refers only to those permanent establishments and sums
  to `permanentPersonsEngaged`, not the all-unit TPE count.
- TPE includes working owners, unpaid family workers, full-time and part-time
  workers, casual workers and apprentices. It is not salaries, wage employment or
  full-time-equivalent jobs. The imported S2/S5 totals preserve all reported sex
  categories, including hijra persons.
- **Do not use Volume I S4**: district labels are misaligned, and its male-plus-
  female totals omit hijra persons. This import uses S2, S3 and Volume II S4/S5.
- These counts do not measure revenue, GDP, spending, business survival or current
  customers. No derived market value, district wages or sampling CIs are invented.

## Reproduce and verify

Default regeneration uses checked CSVs and Python's standard library:

```sh
python3 scripts/import-map-economy.py
python3 scripts/import-map-economy.py --check
python3 scripts/test-import-map-economy.py
```

To recreate the source CSVs, download the four official files linked above into
an evidence directory outside Git, naming them `economic-final.pdf`,
`economic-vol2.pdf`, `economic-detail.xlsx`, and `economic-overview.xlsx`. Create
the two text inputs with Poppler's `pdftotext -layout` (version 26.03.0 was used
for this reviewed extraction):

```sh
pdftotext -layout economic-final.pdf economic-final.txt
pdftotext -layout economic-vol2.pdf economic-vol2.txt
```

Then run the extractor with a Python environment containing `openpyxl`:

```sh
python3 scripts/import-map-economy.py --extract-from /path/to/evidence
python3 scripts/import-map-economy.py --check
```

Extraction first verifies all six input hashes and validates the complete tables
before writing CSVs. If a different PDF-text tool version changes whitespace or
encoding, its text hash may differ: inspect the difference and document a new
reviewed input version instead of bypassing the check. A genuinely changed report
requires a new release review. `--check` is read-only; it cannot be combined with
`--extract-from`.

## Reuse

The report permits research or experimental use/publication with proper source
citation and restricts commercial copying or republication of the report. Its
Bengali edition prevails if the two language versions disagree. Preserve those
terms and BBS attribution; do not apply the repository's code/article licenses to
the source data. See Volume I PDF 6 and Volume II PDF 2.
