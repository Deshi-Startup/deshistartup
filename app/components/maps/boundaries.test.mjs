import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { GeoJSONVT } from "@maplibre/geojson-vt";
import { boundaryFeatures, boundaryDetailMinZoom, boundaryRenderTolerance, isContextLayer } from "./cartography.ts";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url));
const metadata = JSON.parse(read("../../../data/maps/boundaries.json"));
const files = metadata.levels.map((level) => ({
  level, bytes: read(`../../../public/maps/${level.file}`),
}));
const [overview, districtDetail, divisionDetail] = files.map(({ bytes }) => JSON.parse(bytes));
const detail = { type: "FeatureCollection", features: [
  ...[districtDetail, divisionDetail].flatMap((p) => p.features.filter((f) => !f.properties.national)),
  { type: "Feature", properties: { id: "country-bangladesh" }, geometry: {
    type: "MultiPolygon", coordinates: districtDetail.features.filter((f) => f.properties.national)
      .map((f) => f.geometry.coordinates),
  } },
] };
const regions = JSON.parse(read("../../../data/maps/regions.json")).regions;

function edges(feature) {
  const g = feature.geometry;
  const polygons = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  return polygons.flatMap((p) => p.flatMap((ring) => ring.slice(1).map((b, i) => {
    const a = ring[i];
    return [a.join(","), b.join(",")].sort().join("|");
  })));
}

test("boundary detail is pinned, independently reproducible and bounded", () => {
  assert.match(metadata.sourceSha256, /^[a-f0-9]{64}$/);
  assert.equal(metadata.boundaryYear, 2020);
  assert.equal(metadata.license, "CC BY 3.0 IGO");
  assert.equal(metadata.detailMinZoom, boundaryDetailMinZoom);
  for (const { level, bytes } of files) {
    assert.equal(bytes.length, level.bytes);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), level.sha256);
    const budget = level.name === "overview" ? 750_000 : level.geography === "district" ? 2_000_000 : 1_100_000;
    assert.ok(gzipSync(bytes).length < budget);
  }
  assert.deepEqual(new Set(detail.features.map((f) => f.properties.id)),
    new Set(overview.features.map((f) => f.properties.id)));
  assert.equal(detail.features.length, overview.features.length);
  assert.equal(fs.existsSync(new URL("../../../public/maps/bangladesh-2020-detail.geojson", import.meta.url)), false);
});

test("every parent outline follows district edges at both resolutions", () => {
  for (const data of [overview, detail]) {
    const districts = data.features.filter((f) => f.properties.id.startsWith("district-"));
    assert.equal(districts.length, 64);
    const districtEdges = new Set(districts.flatMap(edges));
    for (const f of districts)
      assert.equal(f.properties.boundaryId, regions.find((r) => r.id === f.properties.id).boundaryId);
    for (const parent of data.features.filter((f) => !f.properties.id.startsWith("district-")))
      for (const edge of edges(parent)) assert.ok(districtEdges.has(edge), `${parent.properties.id}: ${edge}`);
  }
});

test("one rendering collection contains regions and matching perimeter, without mixed resolutions", () => {
  for (const data of [overview, detail]) {
    for (const level of ["district", "division"]) {
      const ids = new Set(regions.filter((r) => r.level === level).map((r) => r.id));
      const rendered = boundaryFeatures(data, ids);
      assert.deepEqual(rendered.features.filter((f) => !f.properties.national),
        data.features.filter((f) => ids.has(f.properties.id)));
      const outline = rendered.features.filter((f) => f.properties.national);
      const country = data.features.find((f) => f.properties.id === "country-bangladesh");
      assert.deepEqual(outline.map((f) => f.geometry.coordinates), country.geometry.coordinates);
      assert.equal(new Set(rendered.features.map((f) => f.properties.id)).size, rendered.features.length);
      if (data === detail) assert.deepEqual(rendered, level === "district" ? districtDetail : divisionDetail);
    }
  }
  const chapai = (data) => edges(data.features.find((f) => f.properties.id === "district-chapainawabganj")).length;
  assert.ok(chapai(detail) > chapai(overview) * 2);
});

test("context retains roads and water but never supplies competing administrative lines", () => {
  const style = JSON.parse(read("../../../public/maps/basemap.json"));
  const boundaries = style.layers.filter((l) => l["source-layer"] === "boundary");
  assert.ok(boundaries.length >= 2);
  assert.ok(boundaries.every((l) => !isContextLayer(l)));
  assert.ok(style.layers.filter((l) => ["water", "transportation", "place"].includes(l["source-layer"]))
    .every(isContextLayer));
});

test("overview and cached detail stay within line mesh limits when zooming out", () => {
  assert.ok(boundaryRenderTolerance > 0 && boundaryRenderTolerance <= 0.25);
  // Exercise the renderer's actual tiler, including tile clipping and quantization.
  // MapLibre reserves up to 10 mesh vertices per line point in a 16-bit segment.
  const index = (data, tolerance) => new GeoJSONVT(data, {
    extent: 8192, buffer: 2048, maxZoom: 18, tolerance: tolerance * 16,
    promoteId: "id",
  });
  const longestRing = (tile) => Math.max(0, ...((tile?.features ?? [])
    .flatMap((f) => f.geometry.map((ring) => ring.length))));
  // This tile previously generated a 138,121-vertex line mesh (limit 65,535),
  // producing long false diagonals after detailed geometry had been loaded.
  assert.ok(longestRing(index(districtDetail, 0).getTile(6, 48, 27)) * 10 > 65_535);
  const tileX = (longitude, z) => Math.floor((longitude + 180) / 360 * 2 ** z);
  const tileY = (latitude, z) => Math.floor(
    (1 - Math.asinh(Math.tan(latitude * Math.PI / 180)) / Math.PI) / 2 * 2 ** z,
  );
  for (const data of [overview, districtDetail, divisionDetail]) {
    const tiles = index(data, boundaryRenderTolerance);
    for (let z = 3; z <= 10; z++) {
      for (let x = tileX(88, z); x <= tileX(93, z); x++) {
        for (let y = tileY(27, z); y <= tileY(20.5, z); y++) {
          // Headroom below MapLibre's 6,553-point reservation ceiling. Covers
          // district/division selection rings as well as the national perimeter.
          assert.ok(longestRing(tiles.getTile(z, x, y)) < 4_000, `Oversized ring at ${z}/${x}/${y}`);
        }
      }
    }
  }
});
