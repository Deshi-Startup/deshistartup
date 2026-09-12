# BBS ICT 2024–25 Internet source transcription

This directory contains only checked Internet-use cells from the BBS **ICT Access
and Use by Households and Individuals Survey 2024–25, Annual Report**. The title
page identifies it as the Final Report. It supplies 64 district estimates, eight
division estimates and one national estimate. All values are percentages of
private-household members aged 5+ who used the Internet in the last three months.

The report's data may be used and published with source acknowledgment. Its
imprint restricts commercial reproduction of the book. The repository's MIT code
license and article content license do not replace those source terms. No report
pages or PDF binaries are committed here.

## Source and dates

- [Official PDF](https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/6/d3fd947e-bfbe-4d23-9a46-6436bc50f126.pdf)
- [BBS report landing page](https://bbs.gov.bd/pages/files/6a609418b859b8767ff841e0)
- [BBS ICT index](https://bbs.gov.bd/pages/static-pages/6922e012933eb65569e25543)
- [BBS publication register](https://bbs.gov.bd/pages/static-pages/6922e07a933eb65569e27407)
- Official PDF: **151,376,823 bytes, 324 pages**, SHA-256
  `478d66b66cc37c0cc81fe404f9a6636124819d8fb211ec8c8fb449a360783446`.
- Observations: survey year **2024–25**. The publication register lists an upload
  date of **20 April 2026**; the landing page states an update of **22 July 2026**.
  No report-publication date is stated on the inspected title/imprint pages, so
  `publication.reportDate` is null. Neither website date is an observation date.
- Report acquired, source pages inspected and transcription verified:
  **12 September 2026**. The importer preserves these recorded events; rebuilding
  locally does not claim a new retrieval or source verification.

## Exact tables

Page numbers below are one-based. `pdfPage` is the physical page in the complete
PDF; `printedPage` is the report's page label.

| Input | Published cells | PDF page | Printed page |
| --- | --- | --- | --- |
| `internet-estimates.csv` | Table 7.1.1, final Total column, all eight divisions plus Total | 133 | 97 |
| `internet-estimates.csv` | Annex I B-2, Internet use column, all 64 districts | 283–284 | 247–248 |
| `internet-uncertainty.csv` | Annex II SE.2, individual Internet use in last three months, national row | 285 | 249 |
| `internet-uncertainty.csv` | Annex II SE.4, Internet subsection, all 64 districts | 305–306 | 269–270 |

B-2's section heading is on PDF 282 / printed 246. The SE.4 Internet subsection
starts partway down PDF 305; the preceding rows belong to another indicator and
must not be imported. Definition: PDF 46 / printed 10. Universe: PDF 53 / printed
17. Weighting/limitations: PDF 58–59 / printed 22–23. Reuse: PDF 2.

Source names are preserved beside explicit canonical IDs. The report spelling
`Chapainababganj` maps to `district-chapainawabganj`. Division and district names
such as Dhaka identify different domains; the prefix is part of the join key.

## Verification and interpretation

The table pages and source definitions were rendered and visually inspected.
The main-table and statistical-annex district estimates were transcribed
separately in their published row order, then reconciled by canonical ID. All
64 estimates agree exactly. Each standard error and lower/upper limit was checked
against the page image. A separate high-resolution OCR pass agreed with all four
numeric cells in 63 district rows; the remaining Kushtia row was visually checked
because OCR lost the first row below the table header. Table 7.1.1's eight division
totals were also checked visually and against OCR. The national estimate agrees
between Table 7.1.1 and SE.2. There are **no unresolved imported cells**.

Point estimates are published to one decimal place; standard errors and 95%
confidence limits to three. CSV strings preserve that precision and generated
JSON preserves their numeric values. The importer **does not recalculate** limits
from rounded point estimates or standard errors. The division rows intentionally
omit SE/CI fields because the imported source tables do not supply them. Do not
average district rates to recreate division or national values.

The report contains unrelated narrative/indicator inconsistencies, including an
approximate national Internet benchmark elsewhere that differs from Table 7.1.1.
This import uses the mutually consistent Internet tables specified above and does
not certify every metric in the report. It excludes online-purchasing columns:
those require separate questionnaire-universe/recall checks. It also leaves the
historical Census 2022 dataset intact. The annual household survey should not be
presented as a seamless continuation of the Census population series.

## Reproduce

From the repository root, the checked CSVs and metadata regenerate `ict.json`
using only Python's standard library:

```sh
python3 scripts/import-map-ict.py
python3 scripts/import-map-ict.py --check
python3 scripts/test-import-map-ict.py
```

To verify the original acquisition as well, download the official PDF to a local
evidence directory outside Git and pass its path:

```sh
curl -fL --retry 2 'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/6/d3fd947e-bfbe-4d23-9a46-6436bc50f126.pdf' -o /path/to/evidence/ict-2024-25.pdf
python3 scripts/import-map-ict.py --check --pdf /path/to/evidence/ict-2024-25.pdf
```

`--pdf` verifies byte count and SHA-256; it does not run OCR or claim to perform
visual review. The generated artifact includes hashes of both transcriptions and
the source metadata. Changed reports require a new source/version review and
separate transcription checks, not merely a new retrieval date. Future imports
must preserve the distinction between source observation, publication/upload,
retrieval and transcription-verification dates.
