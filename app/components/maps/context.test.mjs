import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { gzipSync } from "node:zlib";
import {
  comparisonRows,
  layerById,
  metricValue,
  formatValue,
  observation,
  sourceLink,
  parseExplorer,
  explorerUrl,
} from "./layers.ts";
const read = (p) => fs.readFileSync(new URL(p, import.meta.url));
const raw = JSON.parse(read("../../../data/maps/regions.json")).regions;
const census = JSON.parse(read("../../../data/maps/census.json"));
const ports = JSON.parse(read("../../../data/maps/ports.json"));
const airports = JSON.parse(read("../../../data/maps/airports.json"));
const industry = JSON.parse(read("../../../data/maps/industry.json"));
const geometry = JSON.parse(
  read("../../../public/maps/bangladesh-2020.geojson"),
);
const regions = raw.map((r) => ({ ...r, metrics: census.regions[r.id] }));

function insideRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i],
      b = ring[j];
    if (
      a[1] > y !== b[1] > y &&
      x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
  }
  return inside;
}
test("airport references join the correct districts, with reproducible OSM acquisition and limited role claims", () => {
  assert.equal(airports.sites.length, 8);
  assert.equal(new Set(airports.sites.map((s) => s.code)).size, 8);
  assert.equal(new Set(airports.sites.map((s) => s.coordinateSource)).size, 8);
  assert.match(airports.coordinateAcquisition.inputSha256, /^[a-f0-9]{64}$/);
  assert.match(airports.coordinateAcquisition.query, /aerodrome/);
  assert.equal(airports.coordinateAcquisition.snapshot, "2026-09-12T11:51:36Z");
  for (const site of airports.sites) {
    assert.ok(site.name.en && site.name.bn && site.role.en && site.role.bn);
    assert.match(site.source, /^https:\/\/(ops.caab|www.hsia).gov.bd\//);
    const region = regions.find((r) => r.id === site.district);
    assert.equal(site.division, region.division);
    const g = geometry.features.find(
      (f) => f.properties.id === site.district,
    ).geometry;
    const polygons = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    assert.ok(
      polygons.some(
        (p) =>
          insideRing(site.point, p[0]) &&
          !p.slice(1).some((r) => insideRing(site.point, r)),
      ),
      site.code,
    );
    assert.equal(site.kind, "airport");
    assert.equal(site.coordinateMethod, "aerodrome-area-centre");
    assert.equal(site.flightFrequency, undefined);
    assert.equal(site.cargoCapacity, undefined);
  }
  assert.equal(
    airports.sites.find((s) => s.code === "SPD").district,
    "district-nilphamari",
  );
});

test("transport and EPZ snapshots retain the actual acquisition request rather than an import date", () => {
  const transport = JSON.parse(read("../../../data/maps/transport.json"));
  const acquisition = JSON.parse(
    read("../../../data/maps/sources/transport-acquisition.json"),
  );
  for (const field of ["retrieved", "inputSha256", "query", "endpoint"])
    assert.equal(acquisition[field], transport[field]);
  assert.equal(
    industry.coordinateAcquisition.inputSha256,
    industry.inputSha256,
  );
  assert.match(industry.coordinateAcquisition.query, /landuse/);
});
test("eight EPZs have distinct sourced positions inside their named districts", () => {
  assert.equal(industry.sites.length, 8);
  assert.equal(new Set(industry.sites.map((s) => s.coordinateSource)).size, 8);
  for (const site of industry.sites) {
    assert.equal(site.status, "operating");
    assert.match(site.source, /^https:\/\/bepza.gov.bd\/pages\/[a-z]+-epz$/);
    assert.match(
      site.coordinateSource,
      /^https:\/\/www.openstreetmap.org\/way\/\d+$/,
    );
    assert.ok(site.name.en && site.name.bn);
    const region = regions.find((r) => r.id === site.district);
    assert.equal(site.division, region.division);
    const g = geometry.features.find(
      (f) => f.properties.id === site.district,
    ).geometry;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    assert.ok(
      polys.some(
        (p) =>
          insideRing(site.point, p[0]) &&
          !p.slice(1).some((ring) => insideRing(site.point, ring)),
      ),
      site.id,
    );
  }
});

test("transport snapshot contains valid road and rail lines within a bounded payload", () => {
  const bytes = read("../../../public/maps/transport.geojson");
  const geo = JSON.parse(bytes),
    meta = JSON.parse(read("../../../data/maps/transport.json"));
  assert.equal(geo.features.length, 6442);
  assert.equal(meta.snapshot, "2026-09-12T08:34:51Z");
  assert.ok(gzipSync(bytes).length < 220000);
  for (const kind of ["road", "rail"])
    assert.equal(
      geo.features.filter((f) => f.properties.kind === kind).length,
      meta.counts[kind],
    );
  for (const feature of geo.features) {
    assert.equal(feature.geometry.type, "LineString");
    assert.ok(feature.geometry.coordinates.length >= 2);
    for (const [x, y] of feature.geometry.coordinates)
      assert.ok(
        Number.isFinite(x) &&
          Number.isFinite(y) &&
          x > 87 &&
          x < 94 &&
          y > 20 &&
          y < 28,
      );
  }
});

test("retired analytical links fall back safely and keep optional context", () => {
  for (const old of ["potatoProduction", "potatoArea", "potatoYield"]) {
    const state = parseExplorer(
      `?lens=production&layer=${old}&region=district-rangpur&transport=true&industry=true&ports=true`,
      regions,
    );
    assert.equal(state.layer, "density");
    assert.equal(state.lens, "people");
    assert.equal(state.region, "district-rangpur");
    assert.equal(state.transport && state.industry && state.ports, true);
    assert.deepEqual(parseExplorer(explorerUrl(state), regions), state);
  }
  assert.equal(parseExplorer("?ports=false", regions).ports, false);
  assert.equal(parseExplorer("", regions).transport, false);
});

test("comparison joins household budgets to the parent division, retaining source and missingness", () => {
  const rangpur = regions.find((r) => r.id === "district-rangpur");
  const dhaka = regions.find((r) => r.id === "district-dhaka");
  const rows = comparisonRows(regions, [rangpur, dhaka], "density");
  const budgets = rows.find((r) => r.metric.id === "consumption");
  assert.deepEqual(
    budgets.cells.map((c) => c.region.id),
    ["division-rangpur", "division-dhaka"],
  );
  for (const cell of budgets.cells) {
    assert.equal(cell.context, true);
    assert.equal(cell.value, census.regions[cell.region.id].consumption);
    assert.match(
      sourceLink(cell.region, budgets.metric),
      /22b6e770.*pdf#page=/,
    );
  }
  const population = rows.find((r) => r.metric.id === "population");
  assert.equal(population.cells[0].context, false);
  assert.equal(
    population.cells[0].value,
    census.regions[rangpur.id].population,
  );
  assert.equal(observation(population.metric, "en"), "2022");
  const missing = comparisonRows([], [{ ...rangpur, metrics: {} }], "internet");
  assert.equal(
    missing.find((r) => r.metric.id === "consumption").cells[0].value,
    null,
  );
  assert.equal(
    missing.find((r) => r.metric.id === "internet").cells[0].value,
    null,
  );
  assert.equal(formatValue(null, layerById("internet"), "en"), "—");
  assert.equal(
    metricValue({ ...rangpur, metrics: { internet: 0 } }, "internet"),
    0,
  );
});

test("selected ports have distinct official sources and verified district joins", () => {
  assert.equal(ports.sites.length, 9);
  assert.equal(ports.sites.filter((s) => s.kind === "seaport").length, 3);
  assert.equal(ports.sites.filter((s) => s.kind === "landport").length, 6);
  assert.equal(new Set(ports.sites.map((s) => s.coordinateSource)).size, 9);
  for (const site of ports.sites) {
    assert.match(
      new URL(site.source).hostname,
      /(?:blpa|cpa|mpa|ppa)\.gov\.bd$/,
    );
    assert.match(
      site.coordinateSource,
      /^https:\/\/www.openstreetmap.org\/(way|relation)\/\d+$/,
    );
    const region = regions.find((r) => r.id === site.district);
    assert.equal(region.division, site.division);
    const g = geometry.features.find(
      (f) => f.properties.id === site.district,
    ).geometry;
    const polygons = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    const contained = polygons.some(
      (p) =>
        insideRing(site.point, p[0]) &&
        !p.slice(1).some((ring) => insideRing(site.point, ring)),
    );
    if (site.id === "bhomra-port") {
      // Preserve the observed OSM position; never shift it to satisfy a simplified border.
      assert.match(site.boundaryNote, /23 metres outside/);
      const distance = (a, b) => {
        const scale = Math.cos((site.point[1] * Math.PI) / 180);
        const x = (a[0] - site.point[0]) * scale,
          y = a[1] - site.point[1];
        const dx = (b[0] - a[0]) * scale,
          dy = b[1] - a[1];
        const length = dx * dx + dy * dy;
        const t = length
          ? Math.max(0, Math.min(1, -(x * dx + y * dy) / length))
          : 0;
        return Math.hypot(x + t * dx, y + t * dy) * 111320;
      };
      const metres = Math.min(
        ...polygons.flatMap((p) =>
          p.flatMap((ring) =>
            ring.slice(1).map((b, i) => distance(ring[i], b)),
          ),
        ),
      );
      assert.ok(
        metres > 20 && metres < 50,
        `Bhomra boundary mismatch: ${metres} m`,
      );
    } else assert.ok(contained, site.id);
  }
});
