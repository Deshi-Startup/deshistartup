import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { enrichRegion } from "./evidence.ts";
import {
  sectorNames,
  sectorMeasures,
  sectorValue,
  nationalSectorValue,
} from "./business.ts";
import {
  explorerLayer,
  metricValue,
  sourceLink,
  formatValue,
  metricColor,
  parseExplorer,
  explorerUrl,
  matchingRegions,
  nationalExplorer,
  comparisonRows,
  initialExplorer,
} from "./layers.ts";

const read = (name) =>
  JSON.parse(
    fs.readFileSync(
      new URL(`../../../data/maps/${name}.json`, import.meta.url),
    ),
  );
const economy = read("economy"),
  census = read("census"),
  ict = read("ict");
const regions = read("regions").regions.map((r) =>
  enrichRegion(
    r,
    census.regions[r.id],
    ict.regions[r.id],
    economy.regions[r.id],
  ),
);
const selection = {
  ...initialExplorer,
  layer: "economicUnits",
  sector: "C",
  sectorMeasure: "share",
};

test("all sector views reconcile to census cells and weighted national totals", () => {
  for (const sector of Object.keys(sectorNames)) {
    for (const sectorMeasure of sectorMeasures) {
      const layer = explorerLayer(
        { ...selection, sector, sectorMeasure },
        regions,
      );
      const field =
        sectorMeasure === "people"
          ? "personsEngaged"
          : "permanentEstablishments";
      const expectedNational =
        sectorMeasure === "share"
          ? (economy.national.sectors[sector][field] /
              economy.national.permanentEstablishments) *
            100
          : economy.national.sectors[sector][field];
      assert.equal(layer.national, expectedNational);
      const nationalPage =
        sectorMeasure === "people"
          ? economy.national.sectorPersonsSource.pdfPage
          : economy.national.sectorEstablishmentsSource.pdfPage;
      assert.ok(sourceLink(undefined, layer).endsWith(`#page=${nationalPage}`));
      for (const region of regions) {
        const row = economy.regions[region.id];
        const expected =
          sectorMeasure === "share"
            ? (row.sectors[sector].permanentEstablishments /
                row.permanentEstablishments) *
              100
            : row.sectors[sector][field];
        assert.equal(metricValue(region, layer), expected);
        const page =
          sectorMeasure === "people"
            ? row.sectorPersonsSource.pdfPage
            : row.sectorEstablishmentsSource.pdfPage;
        assert.ok(sourceLink(region, layer).endsWith(`#page=${page}`));
      }
    }
  }
});

test("missing evidence stays missing; genuine zero and very small shares stay distinguishable", () => {
  const layer = explorerLayer(selection, regions),
    original = regions[0];
  const missing = { ...original, business: undefined };
  assert.equal(sectorValue(missing, selection), null);
  const noActivity = {
    ...original,
    business: { ...original.business, sectors: [] },
  };
  assert.equal(sectorValue(noActivity, selection), null);
  const zero = {
    ...original,
    business: {
      ...original.business,
      sectors: [{ code: "C", units: 0, people: 0 }],
    },
  };
  assert.equal(sectorValue(zero, selection), 0);
  assert.equal(
    sectorValue(
      { ...zero, business: { ...zero.business, permanentEstablishments: 0 } },
      selection,
    ),
    null,
  );
  assert.equal(
    nationalSectorValue(
      regions.filter((r) => r.id !== "division-dhaka"),
      selection,
    ),
    null,
  );
  assert.equal(
    nationalSectorValue(
      [...regions, regions.find((r) => r.level === "division")],
      selection,
    ),
    null,
  );
  assert.notEqual(metricColor(null, layer), metricColor(0, layer));
  assert.equal(formatValue(null, layer, "en"), "—");
  assert.equal(formatValue(0, layer, "en"), "0%");
  assert.equal(formatValue(0.004, layer, "en", true), "<0.01%");
  assert.equal(formatValue(0.025, layer, "en", true), "0.03%");
  assert.equal(formatValue(0.004, layer, "bn", true), "<০.০১%");
});

test("sector links roundtrip, irrelevant state clears, and national return retains the sector", () => {
  const state = parseExplorer(
    "?layer=economicUnits&sector=C&sectorMeasure=share&region=district-bogura&compare=district-gazipur&industry=true",
    regions,
  );
  assert.deepEqual(parseExplorer(explorerUrl(state), regions), state);
  for (const sector of ["unknown", "__proto__", "constructor", "A"]) {
    const invalid = parseExplorer(
      `?layer=economicUnits&sector=${sector}&sectorMeasure=share`,
      regions,
    );
    assert.equal(invalid.sector, "");
    assert.equal(invalid.sectorMeasure, "units");
    assert.ok(!explorerUrl(invalid).includes("sector"));
  }
  assert.equal(
    parseExplorer(
      "?layer=economicUnits&sector=C&sectorMeasure=invalid",
      regions,
    ).sectorMeasure,
    "units",
  );
  assert.equal(
    parseExplorer("?layer=population&sector=C&sectorMeasure=share", regions)
      .sector,
    "",
  );
  const urban = parseExplorer(
    "?layer=economicUnits&sector=C&urban=district-bogura",
    regions,
    [{ district: "district-bogura", id: "town-bogura" }],
  );
  assert.equal(urban.sector, "");
  assert.equal(urban.layer, "density");
  const national = nationalExplorer({
    ...state,
    division: "rajshahi",
    minimum: 5,
  });
  assert.equal(national.sector, "C");
  assert.equal(national.sectorMeasure, "share");
  assert.equal(national.region, "");
  assert.equal(national.industry, true);
});

test("filters and comparison use sector measurements without changing classification", () => {
  const filtered = { ...selection, minimum: 10 };
  const layer = explorerLayer(filtered, regions);
  assert.deepEqual(
    matchingRegions(regions, filtered).map((r) => r.id),
    regions
      .filter(
        (r) =>
          r.level === "district" &&
          (economy.regions[r.id].sectors.C.permanentEstablishments /
            economy.regions[r.id].permanentEstablishments) *
            100 >=
            10,
      )
      .map((r) => r.id),
  );
  assert.deepEqual(
    layer.breaks,
    explorerLayer(
      { ...filtered, level: "division", minimum: 1, division: "dhaka" },
      regions,
    ).breaks,
  );
  const places = ["district-bogura", "district-gazipur"].map((id) =>
    regions.find((r) => r.id === id),
  );
  const rows = comparisonRows(regions, places, layer);
  assert.deepEqual(
    rows.map((r) => r.metric.sector?.sectorMeasure || r.metric.id),
    ["share", "units", "people", "population", "internet"],
  );
  assert.equal(rows[0].cells[0].value, metricValue(places[0], layer));
  assert.equal(
    rows[1].cells[1].value,
    economy.regions[places[1].id].sectors.C.permanentEstablishments,
  );
  assert.equal(
    rows[2].cells[1].value,
    economy.regions[places[1].id].sectors.C.personsEngaged,
  );
});
