import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { enrichRegion } from "./evidence.ts";
import {
  activityShare,
  orderedActivities,
  sectorNames,
  ECONOMY_SECTOR_URL,
} from "./business.ts";
import {
  layerById,
  metricValue,
  observation,
  sourceLink,
  internetInterval,
  comparisonRows,
  parseExplorer,
  explorerUrl,
  initialExplorer,
  ICT_URL,
  ECONOMY_URL,
} from "./layers.ts";
const read = (file) =>
  JSON.parse(
    fs.readFileSync(
      new URL(`../../../data/maps/${file}.json`, import.meta.url),
    ),
  );
const raw = read("regions").regions,
  census = read("census"),
  ict = read("ict"),
  economy = read("economy");
const regions = raw.map((r) =>
  enrichRegion(
    r,
    census.regions[r.id],
    ict.regions[r.id],
    economy.regions[r.id],
  ),
);

test("current internet evidence replaces historical data consistently without mutating it", () => {
  assert.deepEqual(
    new Set(Object.keys(ict.regions)),
    new Set(raw.map((r) => r.id)),
  );
  const internet = layerById("internet");
  assert.equal(internet.source, "ict");
  assert.equal(internet.national, ict.national.estimate);
  assert.equal(observation(internet, "en"), "2024–25");
  assert.equal(ICT_URL, ict.source.url);
  for (const region of regions) {
    const row = ict.regions[region.id];
    assert.equal(metricValue(region, "internet"), row.estimate);
    assert.equal(
      sourceLink(region, internet),
      `${ict.source.url}#page=${row.estimateSource.pdfPage}`,
    );
    assert.deepEqual(
      internetInterval(region),
      region.level === "district" ? [row.low, row.high] : null,
    );
  }
  assert.equal(census.regions["district-bandarban"].internet, 23.06);
  const noCurrentEvidence = enrichRegion(
    raw[0],
    census.regions[raw[0].id],
    undefined,
    undefined,
  );
  assert.equal(metricValue(noCurrentEvidence, "internet"), null);
  assert.equal(metricValue(noCurrentEvidence, "economicUnits"), null);
  assert.equal(noCurrentEvidence.business, undefined);
});

test("business geography counts retain scope, source pages, and published totals", () => {
  const layer = layerById("economicUnits");
  assert.equal(layer.kind, "count");
  assert.equal(layer.national, economy.national.economicUnits);
  assert.equal(observation(layer, "en"), "2024");
  assert.equal(ECONOMY_URL, economy.source.url);
  assert.ok(
    ECONOMY_SECTOR_URL.endsWith("c349ddf7-fe70-4c4e-8062-7cc1c468f84b.pdf"),
  );
  assert.deepEqual(
    new Set(Object.keys(economy.regions)),
    new Set(raw.map((r) => r.id)),
  );
  for (const region of regions) {
    const b = region.business,
      row = economy.regions[region.id];
    assert.equal(
      b.economicUnits,
      b.permanentEstablishments +
        b.temporaryEstablishments +
        b.economicHouseholds,
    );
    assert.equal(b.sectors.length, 18);
    assert.equal(
      b.sectors.reduce((sum, s) => sum + s.units, 0),
      b.permanentEstablishments,
    );
    assert.equal(
      b.sectors.reduce((sum, s) => sum + s.people, 0),
      row.permanentPersonsEngaged,
    );
    assert.equal(
      sourceLink(region, layer),
      `${ECONOMY_URL}#page=${row.source.pdfPage}`,
    );
    assert.equal(b.sectorPage, row.sectorEstablishmentsSource.pdfPage);
    assert.equal(b.sectorPersonsPage, row.sectorPersonsSource.pdfPage);
    assert.ok(b.sectors.every((s) => sectorNames[s.code]?.every(Boolean)));
    const sorted = orderedActivities(b);
    assert.ok(sorted.every((s, i) => !i || sorted[i - 1].units >= s.units));
    const share = activityShare(sorted[0].units, b.permanentEstablishments);
    assert.equal(share, (sorted[0].units / row.permanentEstablishments) * 100);
  }
  for (const level of ["district", "division"])
    assert.equal(
      regions
        .filter((r) => r.level === level)
        .reduce((sum, r) => sum + metricValue(r, "economicUnits"), 0),
      layer.national,
    );
  assert.equal(activityShare(0, 0), null);
});

test("business comparison and shared links use current evidence while defaults stay restrained", () => {
  assert.equal(initialExplorer.ports, false);
  assert.equal(initialExplorer.industry, false);
  assert.equal(initialExplorer.transport, false);
  assert.equal(initialExplorer.layer, "density");
  const state = parseExplorer(
    "?layer=economicUnits&region=district-dhaka&compare=district-gazipur&ports=true",
    regions,
  );
  assert.deepEqual(parseExplorer(explorerUrl(state), regions), state);
  const selected = regions.find((r) => r.id === state.region),
    compared = regions.find((r) => r.id === state.compare);
  const rows = comparisonRows(regions, [selected, compared], state.layer);
  assert.equal(rows[0].metric.id, "economicUnits");
  assert.equal(
    rows[0].cells[0].value,
    economy.regions[selected.id].economicUnits,
  );
  const internet = rows.find((r) => r.metric.id === "internet");
  assert.equal(internet.cells[1].value, ict.regions[compared.id].estimate);
  assert.deepEqual(internetInterval(internet.cells[1].region), [
    ict.regions[compared.id].low,
    ict.regions[compared.id].high,
  ]);
});
