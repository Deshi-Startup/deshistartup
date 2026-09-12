# Deshi Startup Maps

Deshi Startup Maps supports preliminary regional comparison for founders building
in Bangladesh. It combines population, household conditions, access and economic
activity with optional infrastructure context. Regions are screening areas;
statistics do not establish customer demand, competition or willingness to pay.

Routes: `/maps` (Bangla) and `/en/maps` (English). Data checked **12 September 2026**;
observation periods differ by measure and remain visible in the interface.

## Experience and architecture

The full-viewport map uses the site's shared `SiteBrand` header. It starts with
district population density, all Bangladesh in view, context overlays off and
panels closed. Search supports Bangla, English and geographic aliases. Layer and
insight controls open panels on desktop and bottom sheets on phones. Opening a
panel or changing a measure at the same geographic level preserves the camera;
region selection, division focus, geographic-level changes and reset navigate
explicitly. Initial bounds are applied before revealing the map.

People & markets and Education & access contain 12 analytical measures. Trade &
connections contains optional major roads/railways, 28 selected industrial sites,
nine selected ports and eight passenger airports. Regional business profiles show census unit types
and permanent-establishment sector composition. Comparison presents up to five
distinct measures, with parent-division household budgets identified separately.
The map/data switch provides a keyboard-accessible table. Share and locale links
preserve meaningful state. Sources and definitions accompany each measure;
field questions link to the manual's customer-interview guidance.

The implementation separates these responsibilities:

| Path | Responsibility |
| --- | --- |
| `scripts/import-map-*.py`, `scripts/import-maps.mjs` | Source extraction, normalization and validation |
| `data/maps/` | Portable statistics, canonical IDs, source transcriptions and provenance |
| `public/maps/` | Local geometry and contextual style; generated worker modules are ignored |
| `app/components/maps/Maps.tsx`, `evidence.ts` | Server-side dataset joins and client-ready evidence |
| `app/components/maps/layers.ts` | Metric definitions, periods, formatting and classification |
| `app/components/maps/MapCanvas.tsx` | Rendering, camera and map interactions |
| `app/components/maps/MapsExperience.tsx` | UI state, search, comparison and panels |
| `app/components/maps/maps.css`, Maps section in `DESIGN.md` | Responsive presentation and design contract |

## Renderer and hosted context

**MapLibre GL JS 6.9.0** renders local analytical GeoJSON over **OpenFreeMap** vector
tiles. The customized OpenMapTiles/Maputnik style lives in
`public/maps/basemap.json`. No API credentials are required. The renderer loads
only on Maps, and transport geometry loads only when requested. There is no
runtime Overpass request or external statistics API.

Geographic data rights and hosting permissions are separate. OpenStreetMap data
requires [ODbL attribution](https://www.openstreetmap.org/copyright). Context uses
the [OpenFreeMap endpoint](https://openfreemap.org/quick_start/), whose
[terms](https://openfreemap.org/tos/) provide a free, as-is service without an
uptime guarantee. This does not authorize use of OSM's public raster tile service.
MapLibre is BSD-3-Clause; preserve its licence and all data/provider attribution.

`scripts/prepare-map-assets.mjs` copies the worker, its shared module and licence
from the locked MapLibre dependency to ignored `public/maps/worker/`. Both
`prebuild` and `predev` prepare these assets. Serve `.mjs` as JavaScript; do not
hand-edit or commit generated vendor modules.

Local outlines and data remain available over a neutral background if hosted
tiles fail, with an explanatory notice. WebGL, worker or boundary failures show
Retry and retain the data table. Our place labels use the site's self-hosted
Bangla font; deeper provider labels are not guaranteed bilingual. Map credits
start collapsed with a visible OpenStreetMap attribution link.

## Cartography and interpretation

Count symbols use proportional area, sharing the renderer's radius scale with
the legend at every viewport. Rate and mean layers use fixed bands defined in
`layers.ts`; filtering never reclassifies them. Changing geographic level changes
the count scale, reflected in the legend. Null values remain missing, never zero.
Source period, units, geographic level and source links stay with each measure.

Education & access uses azure for Internet use, ochre for Students, violet for
Literacy, berry for Mobile banking and jade for Financial accounts. Rate ramps
are light-to-dark, following [ColorBrewer's ordered-data guidance](https://colorbrewer2.org/learnmore/schemes.html).
Layer controls preview the corresponding ramp or count symbol. Colors identify
measures; matching shades across measures do not imply equivalent values.

The national perimeter is dissolved from the same district topology. Its muted
green outline fades at deeper zoom; selected and compared regions use stronger
solid and dashed outlines. Roads and water render above analytical fills, whose
opacity decreases with zoom. These generalized boundaries provide orientation,
not surveyed land limits or authoritative area measurements.

## Census and household-budget data register

These observations are **2022**. The active internet measure uses the final **2024–25 ICT survey**, and economic activity uses **Economic Census 2024**, documented below. All are historical measures. Re-fetch and compare source files, table headers and reuse conditions before updating an extraction.

- **BBS Population and Housing Census 2022, National Report Volume I:** [official PDF](https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2024/12/ad6c94d02722448f92690a27c4313ec9.pdf). First published November 2023, revised January 2024 (PDF page 4). Checked 12 September 2026. District and division rows are joined through the explicit canonical-name crosswalk; internal IDs are not official BBS codes. Published division values are used rather than averaging district rates.
- **BBS HIES 2022 final report:** [official PDF](https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2024/12/22b6e770f6a84cd9a48ff636ae506818.pdf), published 14 December 2023; checked 12 September 2026. Table 4.5, PDF page 72 / printed 38. Nominal monthly **mean per household**, BDT; income and consumption are separate. Only eight divisions are supported, drawn as eight merged shapes. Means are not medians, household distributions, purchasing power, wealth or per-person amounts.
- **Reuse:** BBS retains copyright. Both reports permit publication of their data with source acknowledgement while restricting commercial reproduction of the publications. Report-derived data is not relicensed as site code or CC BY-SA content.

| Layer | Definition and units | Census PDF pages | Main interpretation risk |
|---|---|---|---|
| Density | Enumerated people per administrative km², as published | 191–192, Table 01 | Generalized map polygons must not be used to recompute official area. Density is not built-up density. |
| Population | Total enumerated people: general, institutional and floating | 199–200, P02 | Not the post-enumeration adjusted total, and not a customer count. |
| Urban share | Urban population / total enumerated population × 100 | 199–200, P02 | Administrative urban classification, not affluence. Derived to 4 decimals, displayed to 1. |
| Literacy | % of people aged 7+ | 313–314, P14 | Not job-specific skills. |
| Students | Current students aged 5–29; male + female columns | 317–318, P16 | Not paid education demand. |
| Historical internet (not the active layer) | % of people aged 5+ reporting internet use | 404–405, P25 | Not network coverage/speed. Stop extraction before the adjacent age-15+ table. |
| Financial accounts | % aged 15+ with accounts at bank/insurance/microcredit/post etc. | 407–408, P26 | Not solely bank accounts, balances or active use. |
| Mobile banking | % aged 15+ with a mobile banking account | 409–410, P27 | Not transaction volume, active customers or agent coverage. |

`data/maps/census.json` contains all 72 region rows with per-metric PDF pages, source periods/publication dates and input text SHA-256. National population reconciles to **165,158,616**, urban population to **52,049,459**, and students to **41,518,866**. Every division count reconciles with its constituent districts. For example, the historical Bandarban age-5+ internet use figure is 23.06%, distinct from the adjacent age-15+ figure 29.54%.

Count layers use proportional circles with area tied to count and the exact same radius scale in the legend. Rate/mean layers use fixed, documented bands in `layers.ts`. Filtering does not reclassify values. Region type changes the circle scale; the legend recalculates explicitly. Missing values remain null/gray, never zero. Source notes and practical field questions accompany each active layer; they do not assert measured product demand.

## Current internet and business evidence

**Verified 12 September 2026.** `Maps.tsx` joins datasets by canonical region ID through `evidence.ts`. Historical `census.json` remains a separate source. Missing ICT or economic values become null rather than falling back to another observation period. Each active measure owns its observation period, national benchmark and source-page link.

### Internet use, 2024–25

`data/maps/ict.json` imports the [BBS final annual ICT survey](https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/6/d3fd947e-bfbe-4d23-9a46-6436bc50f126.pdf). It measures people **aged 5+ in private households who used the internet in the preceding three months**, not household subscription or mobile banking. The national estimate is **53.4%**. All 64 district estimates reconcile independently between B-2 and SE.4; eight division estimates use the published total column. Published SE/95% bounds are preserved for districts and the national estimate; division intervals are unavailable in the imported tables. UI values/intervals round to one decimal for display. No interval is reconstructed from a rounded survey estimate.

The report is final; its inspected title/imprint pages do not state a publication date. The official register says **20 April 2026 upload**; the landing page was updated **22 July 2026**. Neither is the observation date. The metadata retains these events separately, full PDF hash/bytes, source pages, denominator, sampling method and exclusions. Fixed map bands are 30/40/50/60/70 percent, not a time-comparison scale with Census 2022. Small differences may reflect sampling error. Do not multiply these rates by Census 2022 populations or present census/survey comparisons as a seamless series.

Reproduce with `python3 scripts/import-map-ict.py`; run `python3 scripts/test-import-map-ict.py`. Source transcriptions, independent reconciliation and the full-PDF verification option are documented in [`data/maps/sources/ict-2024-25/README.md`](../data/maps/sources/ict-2024-25/README.md). BBS permits data publication with acknowledgement while restricting commercial reproduction of the report. Source terms remain separate from code/content licences.

### Economic units and regional activity, 2024

`data/maps/economy.json` uses **final Economic Census 2024**, [Volume I](https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/3/5c074dc0-09bd-41a5-9068-308e67afe931.pdf) and [Volume II](https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/6/c349ddf7-fe70-4c4e-8062-7cc1c468f84b.pdf), published **March and June 2026**. Upload dates are recorded separately: 7 April and 23 July 2026; the supporting Volume I workbook was listed on 18 May 2026. Enumeration was 10–26 December 2024, excluding 16 and 25 December.

The national total is **11,702,792 economic units**: permanent establishments, temporary establishments and economic households. This is a base of economic activity for preliminary B2B investigation, **not monetary market size, GDP, registered companies or paying customers**. Public/nonprofit establishments and household economic work are included. Ordinary household crop farming is excluded, while farm-based livestock, poultry, fishery and nursery establishments are included. People engaged includes working owners, unpaid family helpers, casual and part-time workers; it is not a salaried workforce count.

The Economic units layer uses proportional circles in People & markets and comparison. Every district/division profile has a collapsed Business activity disclosure. It shows the three unit categories and the three largest BSIC activities **by number of permanent establishments**. Shares use permanent establishments as the denominator, not all economic units. A deeper table exposes all 18 sections and their permanent-establishment people-engaged counts. The factual ordering is not an opportunity ranking. Establishment sector, export origin, exporter address, imports and trade through a local port remain separate concepts; no regional GDP/trade totals are inferred.

Volume I S2 totals are reconciled against S3 and division overview 3.3. Volume II S4/S5 sector totals reconcile with S2 permanent totals, including district/division/national sums. Each row retains exact table and PDF page references. Reproduce with `python3 scripts/import-map-economy.py` and run `python3 scripts/test-import-map-economy.py`; see [`data/maps/sources/economic-2024/README.md`](../data/maps/sources/economic-2024/README.md) for extraction and verification. Report-derived facts retain BBS reuse conditions and attribution; no PDFs, microdata or full-report reproductions are committed.

### Airports and acquisition provenance

`data/maps/airports.json` adds **eight passenger-airport reference locations** to the existing Ports & airports context toggle, which remains off by default. OSM aerodrome-area centres are approximate overview positions, never entrances or official aerodrome reference points. Every airport retains its authority identity link, canonical district/division, IATA code and exact OSM feature. The recorded Overpass request/hash binds the coordinate snapshot to **12 September 2026, 11:51:36 UTC**. Coordinates are ODbL.

The [CAAB airport list](https://ops.caab.gov.bd/group-menu-content/12/105) is older (page update May 2022; body July 2018). Its eight-airport passenger selection was cross-checked against [24 April 2026 reporting](https://www.tbsnews.net/economy/aviation/how-many-domestic-airports-does-bangladesh-have-how-many-are-operational-1420191). [BSS reported an August 2026 airline announcement](https://www.bssnews.net/others/418015); a scheduled resumption is not evidence a particular flight operated. Passenger/cargo role notes are bounded to authority documentation: [HSIA terminals](https://www.hsia.gov.bd/content-details/5/Terminals), [Shah Amanat](https://ops.caab.gov.bd/group-menu-content/12/96) and [Osmani](https://ops.caab.gov.bd/group-menu-content/12/97). Older capacity, terminal completion, international certification, live schedules and route availability are deliberately not asserted.

To update airports, recheck authority identity and contemporary passenger-service evidence; query `nwr["aeroway"="aerodrome"]["iata"]` in the recorded bounding box; inspect returned identities against the explicit eight-code selection. Never import every result automatically: the box includes neighbouring-country airfields. Record the actual retrieval date, request, response SHA-256 and OSM snapshot, and validate each coordinate against its named district. Keep old source-page dates separate from a new retrieval. Tests cover all eight geographic joins, including Saidpur in Nilphamari.

The transport importer requires the recorded acquisition manifest and checks its hash against input bytes before writing. Re-importing old data does not change its retrieval date. `data/maps/industry.json` also retains the actual EPZ coordinate request/endpoint/hash. Run `python3 scripts/test-import-map-transport.py`; mismatched or impossible acquisition records must leave the previous output intact.

Financial-account ownership is a 2022 measure. The business profile's Financial and insurance section counts a broad census activity category; neither is a bank-branch inventory or a measure of active payments.

## Poverty and geography register

### Population and poverty

- **Source:** BBS, World Bank and WFP, *Poverty Map of Bangladesh 2022: Small Area Estimation, District and Upazila Results*, Annex 1, printed pp.46–63 / PDF pp.58–75. [Official government-hosted PDF](https://socialprotection.gov.bd/wp-content/uploads/2025/08/Paper-4-Poverty-Map-of-Bangladesh.pdf), [government landing page](https://socialprotection.gov.bd/2025/08/poverty-map-of-bangladesh-2022/).
- **Observation:** 2022. **Report publication:** December 2024 (inside report). **Hosting date:** August 2025 is not the observation or report publication date. **Retrieved:** 12 September 2026.
- **Population:** individuals in *general/private households*. Footnote 20 excludes institutional residents and floating populations. Sum of the 64 districts: 160,232,524. Do not label this total census population.
- **Poverty:** estimated headcount ratio below the **upper poverty line**, percent of population, modelled using HIES 2022 and Population and Housing Census 2022 with CensusEB. `povertySE` is the published standard error in percentage points. Division values are published values, never unweighted district means.
- **Uncertainty transformation:** approximate 95% interval = estimate ±1.96 × SE, clipped to [0,100]. This is a normal approximation for interpretation, not a new official confidence interval; comparisons are not significance tests. Do not rank districts by small differences.
- **Reuse:** report permits educational/non-commercial dissemination with acknowledgement; commercial reuse requires permission. The website's MIT code / CC BY-SA content licence does not relicense these report-derived data. No bulk export button is provided. `data/maps/README.md` carries the same exception.
- **Join:** reviewed canonical names → `data/maps/geography.json` → internal `district-*` or `division-*` IDs. These IDs are **not BBS geocodes**. Each row retains a PDF source page. Report is public-use statistics, no personal microdata.
- **Normalization:** deterministic `pdftotext -layout` table extraction; 72 rows only, not upazila values or old-year columns. Import asserts 64 district and 8 division rows and reconciles every division's population.

### Boundaries and context

- [geoBoundaries API record](https://www.geoboundaries.org/api/current/gbOpen/BGD/ADM2/): BGD-ADM2-16705992, boundary year **2020**, BBS/OCHA ROAP source, CC BY 3.0 IGO, source update 19 January 2023, build 12 December 2023; retrieved 12 September 2026.
- **Pinned input:** [simplified GeoJSON at release 9469f09](https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/BGD/ADM2/geoBoundaries-BGD-ADM2_simplified.geojson). The metadata links back to [HDX administrative boundaries](https://data.humdata.org/dataset/administrative-boundaries-of-bangladesh-as-of-2015); this older provenance is not evidence of a newly surveyed 2020 coastline.
- `shapeID` is preserved per district. Empty upstream ISO fields are not treated as identifiers. Crosswalk reconciles Barisal/Barishal, Bogra/Bogura, Brahamanbaria/Brahmanbaria, Chittagong/Chattogram, Comilla/Cumilla, Jessore/Jashore, Maulvibazar/Moulvibazar and Nawabganj/Chapainawabganj.
- **Transformations:** round coordinates to five decimals, preserve all 38,112 district vertices from the pinned source, construct shared topology, dissolve districts into the eight division memberships in the report, and dissolve all districts into one national perimeter. The exported GeoJSON has 73 features: 64 districts, eight divisions and `country-bangladesh`. The national shape is for orientation and adds no statistical row. Representative symbols use the largest polygon's pole of inaccessibility (`polylabel`), not geocoded city centres or office addresses.
- Boundaries are older than the statistics and generalized for national comparison. The administrative district count/name crosswalk is complete; this does not validate every boundary segment against 2022. Never use for land/address decisions or compute authoritative area/density from these generalized polygons.
- **Context:** OpenFreeMap supplies optional detailed roads, water and deeper place labels. Local analytical geometry remains available over the neutral background when hosted context fails.

### National perimeter and contextual fallback

The national perimeter uses the same shared district topology, not a second boundary dataset. Its muted green line is 1.1px at zoom 5, 1.4px at zoom 7 and 1px at zoom 10; opacity fades from 0.7 at zoom 7 to 0.25 at zoom 10 so contextual detail can take over. Selected and compared regions retain their stronger solid and dashed outlines.

Water and roads render above the analytical fills. Fill opacity decreases with zoom, district border widths range from 0.6 to 1.4px, and local labels use restrained weight. The neutral background is present from initialization; no tile-readiness switch or coarse-country silhouette is needed. The 73-feature payload is **1,415,207 bytes raw / 458,924 bytes gzip** (Python gzip, approximately 459 kB). Upstream boundaries describe 2020 and are not surveyed land boundaries.


## Update and maintenance

The importers target the specific report editions and table layouts below. A newer edition requires a reviewed extraction change; changing a filename alone is not an update. Set `MAPS_RETRIEVED_AT=YYYY-MM-DD` to the actual source retrieval date when reproducing an earlier extraction; otherwise the scripts record the current UTC date. Update the UI’s checked date only after verifying the source cells.

1. Download the official Census/HIES PDFs and produce UTF-8 text with `pdftotext -layout`. Keep PDFs/text outside Git. Inspect copyright/publication pages and the named source tables, including continuation headers and denominator changes.
2. Run `python3 scripts/import-map-census.py /path/census.txt /path/hies.txt`. The script normalizes documented spellings, handles wrapped Mymensingh division rows, refuses missing joins and reconciles totals. Review `data/maps/census.json` and its changed checksums. Verify representative cells visually against the PDF after every replacement source.
3. Poverty/geometry updates use `node scripts/import-maps.mjs REPORT.txt DISTRICTS.geojson` with the locally downloaded poverty text and pinned district GeoJSON. There is no context-file argument. The importer writes the 72 regional statistics rows, input hashes and 73 geometry features, including the national perimeter dissolved from all districts. Keep `geography.json` canonical and retain the pinned boundary source. Never hand-edit generated geometry or claim a polygon is an office location.
4. Run `npm test`, `npx tsc --noEmit`, content lints and `npm run build:worker`. Check both locales, district/division selection, source pages, changed classifications, comparison links and fallback states in a browser. A successful build alone does not validate worker loading.
5. Add a metric in `layers.ts` only after source dates, age/population denominator, geographic level, reuse rights, null behavior and interpretation risk are settled. Put normalization in the importer, not JSX; metadata/formatting lives in `layers.ts`, renderer in `MapCanvas.tsx`, interaction state in `MapsExperience.tsx`.

For normal development use Node 22 and `npm run dev`; Maps is under `/maps` and `/en/maps`. `npm run build:worker` prepares map worker assets and exports the integrated site. Publishing is separate and requires the maintainer's instruction.

## Trade & connections

Context layers are optional and never accumulate automatically when switching analytical topics. The first view prioritizes regional market conditions. A single context group holds major transport, industrial zones and parks, selected ports and airports; active context can be cleared together. Regional comparison and clearly attributed measures are the primary analytical workflow.

### Major transport connections

[OpenStreetMap data](https://www.openstreetmap.org/copyright), **ODbL 1.0**, fetched through [Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API). The successful snapshot is **2026-09-12 08:34:51 UTC**; the area-index timestamp is 2026-09-11 20:42:21 UTC. `transport.json` records the exact query, endpoint, input SHA-256, selection and simplification. Selected ways intersect Bangladesh; some cross the border.

Roads have `highway=motorway` or `trunk`. Railways have `railway=rail`, excluding `service=siding|yard|spur`. The 6,442 ways represent mapped infrastructure, with no assertion about current operations, frequency, transit time, freight volume or a complete transport network. Buses, ferries, station entrances, private logistics locations and secondary/local roads are not included in this analytical overlay. Contextual basemap roads remain separate.

The importer simplifies line geometry with Douglas–Peucker at 0.00015 degrees (about 17 m in latitude), rounds to five decimals and preserves endpoints. `transport.geojson` is **1,186,172 bytes / 184,766 gzip bytes** (Python gzip). It loads on demand from local static assets; changing unrelated layers does not re-fetch it. A loading/error notice and Retry preserve access to regional data. This neither calls Overpass at runtime nor relies on permission to use OSM's public raster tile servers.

To update, run the recorded query against the public endpoint within its usage limits and save its JSON outside the checkout. Verify `remark` is absent and `timestamp_osm_base` is acceptably current. Then:

```sh
python3 scripts/import-map-transport.py /path/to/verified-overpass.json data/maps/sources/transport-acquisition.json
```

Update the acquisition manifest from the actual request, response hash and retrieval event before importing a new snapshot. Review the changed geometry/counts, metadata, visible snapshot labels and payload test budget. A newer retrieval timestamp does not make an older OSM snapshot current.

### Industry and trade anchors

[BEPZA identifies eight operating EPZs](https://bepza.gov.bd/pages/who-we-are). Its individual zone pages were read and checked against the named localities on 12 September 2026. `industry.json` contains Chattogram, Dhaka, Mongla, Ishwardi, Cumilla, Uttara, Adamjee and Karnaphuli EPZs, each with its own official source. Employment, exports, available plots, occupancy and utility reliability are deliberately absent because the current page figures did not supply a clear observation period.

Coordinates are independently attributed OpenStreetMap industrial-area bounding-box centres, from a **2026-09-12 08:45:06 UTC** extract. They are approximate overview positions, not entrances or legal zone boundaries. Dhaka uses its mapped **new area**; two Karnaphuli polygons were deduplicated to one official zone. All eight positions were checked to lie within their stated district geometry. Nearby markers group at 44 screen pixels, with both names and source links retained in the popup. The insights list supplies the same sites as text; a division filter limits both list and markers. Selecting a region narrows the list, with an explicit coverage limitation.

`industrial-parks.json` extends that same optional layer with **15 BSCIC estates,
three economic zones and two technology parks**. Combined with the EPZs, the 28
sites span all eight divisions. This is a verified selection, not a census. The
absence or number of markers cannot establish industrial activity, unmet demand
or market size. One factory symbol covers industrial sites; categories, dated
status notes and source links appear in marker details and the text list. The
legend count follows the division filter. The layer stays off by default.

| Selection | Evidence and observation period | Status meaning |
| --- | --- | --- |
| BSCIC estates in Sirajganj, Bogura, Tangail, Bagerhat, Tongi, Barishal, Jhenaidah, Rajshahi, Patiya, Khagrachhari, Netrakona, Khulna (Shiromoni), Cox's Bazar, Jhalokati and Gaibandha | [BSCIC estate register](https://bscic.gov.bd/pages/static-pages/6922df55933eb65569e2141e), linked table headed **July 2026**, inspected on all four PDF pages. Each record retains the PDF URL, page and numbered row. Publication date is unspecified. | `production-reported`: the July table reports producing units at the estate. Individual factory status, employment, rents and plot availability are not imported. Extensions are not separately counted as another estate. |
| Kaliakoir and Sylhet Hi-Tech Parks | [Kaliakoir profile](https://bhtpa.gov.bd/pages/static-pages/6922e01d933eb65569e25897), page updated **14 May 2026**, underlying observation date unspecified. [Sylhet profile](https://bhtpa.gov.bd/pages/static-pages/6922dbba933eb65569e0c228), updated **29 June 2026**, reports primary infrastructure implemented in **January 2016–June 2023**. | `developed`: built park infrastructure is documented. This does not mean all plots or tenants operate. Current BHTPA names are displayed; former OSM names remain in `osmName` for reconciliation. |
| BEPZA Economic Zone, Meghna Industrial Economic Zone and Bangladesh Special Economic Zone | [BEPZA profile](https://bepza.gov.bd/pages/bepza-epz) reports operating factories; an undated count cannot establish current occupancy. [MGI operator profile](https://www.mgi.org/businessverticals/miez) identifies its developed Tripordi/Sonargaon zone. Both have unspecified observation/publication dates. [BSEZ operator history](https://bsezltd.com/about-bsez/) documents its **December 2022** Phase 1 opening in Araihazar. | `operations-reported`, `developed` and `phase-one-open`, respectively. The BEPZA site is not the whole National Special Economic Zone. BSEZ's milestone does not describe all phases or current tenants. |

All sources were retrieved/checked **12 September 2026**. Source dates are separate
from retrieval. The 19 industrial-area positions use the Overpass snapshot at
**14:50:20 UTC** that day; Sylhet uses the exact OSM way/node response retrieved
that day, way version 3 last edited **21 October 2023**. Coordinates are
bounding-box centres of named facility areas, not entrances or administrative
boundaries. Every added position passes its named district-containment check.
Acquisition endpoints, requests and response SHA-256 values are in the dataset.
No source coordinates are moved to satisfy a join.

Coordinate derivatives retain **ODbL 1.0** attribution. Authority/operator facts
are paraphrased and linked; no explicit open-data license was identified for
those publications. The source PDFs, original prose, photographs, tenant lists
and personal contact details are not redistributed or relicensed as site code.

To update a site, open its official or operator profile, confirm identity,
locality and the specific status evidence, then inspect its linked OSM way. Match
the facility itself, not a similarly named office, bank or locality. Retain source
observation/publication dates, retrieval date and exact table row where available.
Refresh the coordinate acquisition from actual response bytes and record its
hash; do not relabel an old snapshot as new. `sourceId` and
`coordinateAcquisition` join each site to the metadata in `industrial-parks.json`.
Keep unknown observation dates null. Status is a bounded source statement, never
a live feed. Changes must pass `app/components/maps/context.test.mjs`, including
unique site/OSM identities and named-district containment. Update displayed dates
and documented coverage when refreshing. Do not substitute a district centre for
an unverified facility location.

### Ports and crossings

`data/maps/ports.json` holds three seaports (Chattogram, Mongla, Payra) and six selected land ports (Benapole, Burimari, Banglabandha, Bhomra, Tamabil, Akhaura). This is a deliberately partial inventory: the [Bangladesh Land Port Authority](https://blpa.gov.bd/) lists 17 operating land ports. Identity and locality were checked on each record's authority page on **12 September 2026**. Operation descriptions are authority references, not a live status feed. Port activity cannot be assigned to district production or interpreted as measured logistics flows.

Payra's [terminal page](https://ppa.gov.bd/pages/static-pages/6922e05a933eb65569e26a61) was updated **19 August 2026**, and its [cargo-handling page](https://ppa.gov.bd/pages/static-pages/6922de60933eb65569e1a3b3) **3 September 2026**. Mongla's historical profile remains dated **16 April 2019**; retrieval is not treated as a new observation. Port-specific source URLs, page dates where stated, original OSM identities, exact extraction queries and input hashes live in each record and metadata.

The OSM snapshots are **12 September 2026, 09:28:20 and 09:30:20 UTC**, under ODbL 1.0. Coordinates represent area/building bounding-box centres, not entrances: Payra uses the first terminal area; Bhomra a crossing building; Tamabil the mapped port parking area; Akhaura a check-post building. Those distinctions remain in coordinate provenance. Markers group with EPZs to prevent overlaps, using anchor/gate symbols for port categories. Their source-linked text alternative stays available in Insights.

To update, verify each site's identity and locality against its authority, then check the specific linked OSM object and retain both source trails. Record publication/observation dates separately from retrieval. Do not imply real-time access, current vessel services, complete terminal coverage, or available industrial plots. Verify named-district joins without moving source coordinates to fit a boundary. Eight port positions lie inside their named district polygon. Bhomra’s OSM crossing-building centre is approximately **23 metres outside** the simplified 2020 Satkhira polygon: its original position is retained with a per-record boundary note and a bounded 50-metre regression check. This overview does not resolve legal border alignment.

## Verification

Use Node 22 for development and builds. From the repository root:

```sh
npm run dev
npm test
python3 -B scripts/test-import-map-economy.py
python3 -B scripts/test-import-map-ict.py
python3 -B scripts/test-import-map-transport.py
python3 -B scripts/import-map-economy.py --check
python3 -B scripts/import-map-ict.py --check
npm run lint:bangla
npm run build:worker
npm run check:worker
```

`build:worker` includes content validation, static export, search and SEO checks.
`check:worker` checks types, dry-run packaging and deployment budgets. In the
browser, check both locales, phone and desktop, initial fit, count legends,
zoom limits, search, comparison, source links and restored URL state. Check
provider/geometry failure recovery separately from a successful build.

National ICT uncertainty is preserved in the source data; the interface surfaces
published district intervals and marks unavailable division intervals. Survey
intervals, census counts and modelled poverty uncertainty have different meanings.
Do not interpret small differences as significant or infer service gaps from
incomplete facility records.
