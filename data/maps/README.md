# Maps data and licences

See [the complete register, sources and update instructions](../../docs/maps.md).

- `transport.json` and `../../public/maps/transport.geojson`: reproducible, simplified OSM motorway/trunk roads and rail tracks, **12 September 2026, 08:34:51 UTC**, **ODbL 1.0**. These are locally served data, independent of the hosted basemap. Query, input hash and transformation are in the metadata. Not a route timetable or logistics-flow dataset.
- `ports.json`: nine reviewed port/crossing locations, official identity sources and separate OSM coordinate provenance. A selected inventory, not shipment volumes or live operating status.
- `airports.json`: eight passenger-airport references, authority identity/role sources, older source-page dates and a 2026 selection cross-check. Exact OSM acquisition query/hash/snapshot and per-feature URLs are retained. Approximate locations, not live flights or freight capacity.
- `ict.json`: final BBS **2024–25** private-household internet-use estimates for 64 districts and eight divisions, with published district uncertainty. Replaces the active internet layer while retaining historical census rows. See [source transcriptions and updater](sources/ict-2024-25/README.md).
- `economy.json`: final BBS **Economic Census 2024**, Volumes I/II (March/June 2026): all-unit counts and permanent-establishment sector counts/people engaged for all 72 regions. Not monetary market size or regional trade/GDP. See [source tables and updater](sources/economic-2024/README.md).
- `industry.json`: eight operating BEPZA EPZs, checked **12 September 2026**, with separately sourced **ODbL** OSM area-centre positions. Every site has official and coordinate-source links. Dhaka EPZ uses its new area. Other zone types, proposed projects and available-plot claims are excluded.

- `geography.json`: authored canonical-name/Bangla-name crosswalk. Internal IDs are not official BBS codes.
- `regions.json`: generated factual extraction from BBS/World Bank/WFP **Poverty Map of Bangladesh 2022**, published December 2024, retrieved 12 September 2026. Educational/non-commercial reuse with source acknowledgement is permitted by the report; commercial reuse needs permission. These data are **not relicensed as MIT or CC BY-SA**.
- `import-hashes.json`: SHA-256 of the exact report-text and district-geometry inputs used by `scripts/import-maps.mjs`.
- `../../public/maps/bangladesh-2020.geojson`: generated, source-resolution/dissolved geoBoundaries BBS/OCHA geometry; **CC BY 3.0 IGO**, source BGD-ADM2-16705992, pinned release 9469f09. Contains 64 districts, eight dissolved divisions and one national perimeter dissolved from the same district topology: 73 features, with 72 corresponding statistical rows. Current size: 1,415,207 raw bytes / 458,924 gzip bytes (Python gzip).

Always retain these dataset-specific conditions and attribution when redistributing files. Numbers are historical estimates, not live measurements. No raw PDF, personal information, synthetic business data or API credentials are stored here.

- `census.json`: generated from BBS Census 2022 (November 2023, revised January 2024) and HIES 2022 (14 December 2023), checked 12 September 2026. Definitions, PDF pages, conditions and update commands are in `docs/maps.md`. Total census population differs from the household-only poverty-report count in `regions.json`.
- `../../public/maps/basemap.json`: customized OpenFreeMap/OpenMapTiles contextual style. Runtime attribution and hosted-service terms remain applicable.
- `../../public/maps/worker/`: ignored build output copied from the locked MapLibre dependency by `npm run maps:prepare`; BSD-3-Clause licence copied with it. Do not hand-edit or commit generated vendor modules.

Regenerate poverty rows and geometry with `node scripts/import-maps.mjs REPORT.txt DISTRICTS.geojson`. The importer takes no surrounding-context input. If optional OpenFreeMap tiles fail, the renderer keeps a neutral background, local regional outlines and the national perimeter. No hosted-tile failure changes the statistical values.
