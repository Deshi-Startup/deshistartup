import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { gzipSync } from "node:zlib";
import { interval, regionMatches } from "./model.ts";
import { countRadius, nationalOutline } from "./cartography.ts";
import { layerById, metricColor } from "./layers.ts";
import { routeSupportsInlineEdit } from "../../lib/inline-edit-policy.mjs";
const { regions } = JSON.parse(
  fs.readFileSync(new URL("../../../data/maps/regions.json", import.meta.url)),
);
const geo = JSON.parse(
  fs.readFileSync(
    new URL("../../../public/maps/bangladesh-2020.geojson", import.meta.url),
  ),
);

test("all 64 districts join exactly once; published division population reconciles", () => {
  assert.equal(regions.length, 72);
  assert.equal(new Set(regions.map((r) => r.id)).size, 72);
  assert.equal(regions.filter((r) => r.level === "district").length, 64);
  assert.equal(new Set(geo.features.map((f) => f.properties.id)).size, 73);
  for (const r of regions) {
    assert.ok(geo.features.find((f) => f.properties.id === r.id));
    assert.ok(r.name.bn);
    assert.ok(r.sourcePage >= 58 && r.sourcePage <= 75);
  }
  for (const r of regions.filter((r) => r.level === "division"))
    assert.equal(
      regions
        .filter((d) => d.level === "district" && d.division === r.key)
        .reduce((a, d) => a + d.privateHouseholdPopulation, 0),
      r.privateHouseholdPopulation,
    );
});
test("spot checks against Annex 1 and explicit population denominator", () => {
  for (const [id, pop, rate, se, page] of [
    ["dhaka", 13514349, 8.6, 0.7, 63],
    ["narsingdi", 2499690, 43.7, 3.5, 66],
    ["madaripur", 1259062, 54.4, 4.6, 65],
    ["noakhali", 3541700, 6.1, 1.9, 62],
    ["sylhet", 3751330, 16, 1, 74],
    ["bandarban", 450692, 25, 5.9, 59],
  ]) {
    const r = regions.find((r) => r.id === `district-${id}`);
    assert.deepEqual(
      [r.privateHouseholdPopulation, r.povertyRate, r.povertySE, r.sourcePage],
      [pop, rate, se, page],
    );
  }
  assert.equal(
    regions
      .filter((r) => r.level === "district")
      .reduce((a, r) => a + r.privateHouseholdPopulation, 0),
    160232524,
  );
});
function insideRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    let a = ring[i],
      b = ring[j];
    if (
      a[1] > point[1] !== b[1] > point[1] &&
      point[0] < ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
  }
  return inside;
}
test("geometry is finite, closed, in Bangladesh, and each representative point is inside its region", () => {
  for (const f of geo.features) {
    const r = regions.find((r) => r.id === f.properties.id);
    const polygons =
      f.geometry.type === "Polygon"
        ? [f.geometry.coordinates]
        : f.geometry.coordinates;
    for (const poly of polygons)
      for (const ring of poly) {
        assert.ok(ring.length >= 4);
        assert.deepEqual(ring[0], ring.at(-1));
        for (const [lng, lat] of ring) {
          assert.ok(Number.isFinite(lng) && lng >= 88 && lng <= 93);
          assert.ok(Number.isFinite(lat) && lat >= 20.5 && lat <= 27);
        }
      }
    if (r)
      assert.ok(
        polygons.some(
          (poly) =>
            insideRing(r.point, poly[0]) &&
            !poly.slice(1).some((h) => insideRing(r.point, h)),
        ),
        r.id,
      );
  }
});
test("national perimeter encloses every representative point without internal district edges", () => {
  const national = geo.features.find(
    (f) => f.properties.id === "country-bangladesh",
  );
  assert.ok(national);
  const polygons = national.geometry.coordinates;
  for (const r of regions)
    assert.ok(
      polygons.some(
        (poly) =>
          insideRing(r.point, poly[0]) &&
          !poly.slice(1).some((h) => insideRing(r.point, h)),
      ),
      r.id,
    );
  // Dissolving removes internal shared borders rather than re-stroking 64 districts.
  const count = (g) => g.flat(Infinity).length;
  assert.ok(
    count(national.geometry.coordinates) <
      geo.features
        .filter((f) => f.properties.id.startsWith("district-"))
        .reduce((n, f) => n + count(f.geometry.coordinates), 0) /
        2,
  );
});
test("missing poverty is distinct from zero and circle AREA tracks population", () => {
  const povertyColor = (value) => metricColor(value, layerById("poverty"));
  assert.notEqual(povertyColor(null), povertyColor(0));
  assert.notEqual(povertyColor(9.9), povertyColor(10));
  assert.equal(povertyColor(100), povertyColor(54.4));
  assert.equal(countRadius(null, 4e6), 0);
  const a = countRadius(1e6, 4e6),
    b = countRadius(4e6, 4e6);
  assert.equal((b * b) / (a * a), 4);
  assert.equal(interval(null, 1), null);
  assert.deepEqual(interval(1, 2), [0, 4.92]);
});
test("search reconciles historic spellings and Bangla names", () => {
  assert.ok(
    regionMatches(
      regions.find((r) => r.id === "district-chattogram"),
      "Chittagong",
    ),
  );
  assert.ok(
    regionMatches(
      regions.find((r) => r.id === "district-dhaka"),
      "ঢাকা",
    ),
  );
});
test("map files stay bounded and data-owned pages are excluded from inline editing", () => {
  assert.ok(gzipSync(JSON.stringify(geo)).length < 500_000);
  assert.equal(routeSupportsInlineEdit("/maps"), false);
  assert.equal(routeSupportsInlineEdit("/en/maps"), false);
});

test("coastal outline hierarchy preserves every source polygon and coordinate", () => {
  const country = geo.features.find(
    (f) => f.properties.id === "country-bangladesh",
  );
  const parts = nationalOutline(country.geometry);
  assert.equal(parts.features.length, country.geometry.coordinates.length);
  assert.deepEqual(
    parts.features.map((f) => f.geometry.coordinates),
    country.geometry.coordinates,
  );
  assert.ok(parts.features.some((f) => f.properties.minor));
  assert.ok(parts.features.some((f) => !f.properties.minor));
});
