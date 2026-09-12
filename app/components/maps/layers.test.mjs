import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  layers,
  parseExplorer,
  explorerUrl,
  matchingRegions,
  metricValue,
  metricColor,
  layerById,
  sourceLink,
} from "./layers.ts";
const raw = JSON.parse(
  fs.readFileSync(new URL("../../../data/maps/regions.json", import.meta.url)),
).regions;
const census = JSON.parse(
  fs.readFileSync(new URL("../../../data/maps/census.json", import.meta.url)),
);
const regions = raw.map((r) => ({ ...r, metrics: census.regions[r.id] }));
test("census cells join 72 geographic IDs; count totals and official division totals reconcile", () => {
  assert.deepEqual(
    new Set(Object.keys(census.regions)),
    new Set(regions.map((r) => r.id)),
  );
  for (const [field, total] of [
    ["population", 165158616],
    ["urbanPopulation", 52049459],
    ["students", 41518866],
  ]) {
    assert.equal(
      regions
        .filter((r) => r.level === "district")
        .reduce((s, r) => s + r.metrics[field], 0),
      total,
    );
    for (const d of regions.filter((r) => r.level === "division"))
      assert.equal(
        regions
          .filter((r) => r.level === "district" && r.division === d.key)
          .reduce((s, r) => s + r.metrics[field], 0),
        d.metrics[field],
        d.id + field,
      );
  }
  for (const r of regions) {
    for (const id of [
      "urban",
      "literacy",
      "internet",
      "financial",
      "mobileBanking",
    ])
      assert.ok(r.metrics[id] >= 0 && r.metrics[id] <= 100);
    assert.equal(
      r.metrics.urban,
      Math.round(
        (r.metrics.urbanPopulation / r.metrics.population) * 100 * 1e4,
      ) / 1e4,
    );
  }
});
test("source definitions retain age denominators and PDF page joins", () => {
  const b = regions.find((r) => r.id === "district-bandarban");
  assert.equal(b.metrics.internet, 23.06); // P25 age 5+, NOT the adjacent age-15+ value 29.54.
  assert.equal(b.metrics.literacy, 63.74);
  const dhaka = regions.find((r) => r.id === "division-dhaka");
  assert.equal(dhaka.metrics.income, 42696);
  assert.equal(dhaka.metrics.consumption, 37935);
  assert.match(sourceLink(dhaka, layerById("income")), /#page=72$/);
  assert.equal(metricValue(b, "income"), null);
  for (const l of layers) {
    assert.ok(l.name[1]);
    assert.ok(l.definition[1]);
    assert.ok(l.unit[1]);
    assert.equal(l.colors.length, l.kind === "count" ? 6 : l.breaks.length + 1);
  }
});
test("links roundtrip meaningful map state and normalize obsolete startup and invalid filters", () => {
  const input =
    "?lens=education&layer=internet&level=district&region=district-dhaka&compare=district-sylhet&division=dhaka&min=20&view=table";
  const s = parseExplorer(input, regions);
  assert.deepEqual(parseExplorer(explorerUrl(s), regions), s);
  assert.equal(
    parseExplorer("?mode=startups&company=pathao", regions).layer,
    "density",
  );
  assert.equal(
    explorerUrl(parseExplorer("?mode=startups&company=pathao", regions)),
    "",
  );
  assert.equal(parseExplorer("?mode=people", regions).layer, "population");
  assert.equal(parseExplorer("?mode=poverty", regions).layer, "poverty");
  const income = parseExplorer(
    "?layer=income&region=district-dhaka&compare=division-sylhet&min=NaN",
    regions,
  );
  assert.equal(income.level, "division");
  assert.equal(income.region, "");
  assert.equal(income.compare, "");
  assert.equal(income.minimum, 0);
  assert.equal(
    parseExplorer("?min=-3&division=unknown&lens=startups", regions).division,
    "",
  );
});
test("missing is distinct from zero; filters preserve classification and exclude absent values", () => {
  const layer = layerById("income");
  assert.notEqual(metricColor(null, layer), metricColor(0, layer));
  const s = parseExplorer("?layer=income&min=40000", regions);
  assert.deepEqual(
    matchingRegions(regions, s).map((r) => r.id),
    ["division-dhaka"],
  );
  assert.equal(matchingRegions(regions, { ...s, minimum: 1e8 }).length, 0);
  assert.equal(metricColor(42696, layer), layer.colors.at(-1));
});
