import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { exportDocument, exportSize } from "./export-model.ts";
import { parseMapAppearance, withMapAppearance } from "./view-state.ts";
import { enrichRegion } from "./evidence.ts";
import { initialExplorer, layerById } from "./layers.ts";

const read = (name) =>
  JSON.parse(
    fs.readFileSync(
      new URL(`../../../data/maps/${name}.json`, import.meta.url),
    ),
  );
const census = read("census"),
  ict = read("ict"),
  economy = read("economy");
const regions = read("regions").regions.map((r) =>
  enrichRegion(
    r,
    census.regions[r.id],
    ict.regions[r.id],
    economy.regions[r.id],
  ),
);
const towns = read("urban").places;

test("shared links preserve camera and appearance without altering statistical filters", () => {
  const view = {
    camera: { lng: 89.37523, lat: 24.85689, zoom: 8.725 },
    opacity: 0.65,
    labels: false,
  };
  const url = withMapAppearance("?layer=internet&region=district-bogura", view);
  assert.deepEqual(parseMapAppearance(url), view);
  assert.equal(new URLSearchParams(url).get("region"), "district-bogura");
  assert.equal(
    withMapAppearance("?map=90,24,7&labels=false&opacity=1", {
      camera: null,
      labels: true,
      opacity: 0.8,
    }),
    "",
  );
  for (const bad of [
    "NaN,24,7",
    "90,Infinity,7",
    "90,24,50",
    "0,0,7",
    "90,,7",
    "90,24",
    "90,24,7,8",
  ])
    assert.equal(parseMapAppearance(`?map=${bad}`).camera, null);
  for (const opacity of ["NaN", "-1", "0.1", "9"])
    assert.equal(parseMapAppearance(`?opacity=${opacity}`).opacity, 0.8);
});

test("PNG allocation stays bounded across desktop, portrait, ultrawide and invalid sizes", () => {
  for (const [w, h, footer] of [
    [1440, 820, 180],
    [390, 780, 300],
    [3840, 1000, 200],
    [320, 540, 450],
  ]) {
    const size = exportSize(w, h, footer);
    assert.ok(Math.max(size.width, size.height) <= 2400);
    assert.ok(size.width * size.height <= 5_760_000);
    assert.ok(Math.abs(size.width / size.height - w / (h + footer)) < 0.005);
  }
  assert.throws(() => exportSize(0, 0, 0));
  assert.throws(() => exportSize(Infinity, 800, 100));
});

test("internet comparison retains exact observation, denominator, values and uncertainty", () => {
  const doc = exportDocument(
    {
      ...initialExplorer,
      layer: "internet",
      region: "district-bogura",
      compare: "district-sylhet",
    },
    regions,
    towns,
    "en",
  );
  assert.equal(doc.period, "2024–25");
  assert.equal(doc.unit, "% of people aged 5+");
  assert.deepEqual(
    doc.evidence.map((e) => e.value),
    ["42.4%", "39.7%"],
  );
  assert.equal(doc.evidence[0].interval, "36.4%–48.5% · 95% interval");
  assert.match(doc.evidence[0].source, /#page=283$/);
  assert.match(doc.filename, /internet-bogura-sylhet/);
});

test("filters do not recalculate rate bands or count-symbol scales", () => {
  const all = exportDocument(
    { ...initialExplorer, layer: "students" },
    regions,
    towns,
    "en",
  );
  const filtered = exportDocument(
    { ...initialExplorer, layer: "students", division: "sylhet", minimum: 100 },
    regions,
    towns,
    "en",
  );
  assert.deepEqual(all.circles, filtered.circles);
  assert.equal(filtered.notes.length, 2);
  const rate = exportDocument(
    { ...initialExplorer, layer: "internet", division: "sylhet" },
    regions,
    towns,
    "en",
  );
  assert.deepEqual(rate.colors, layerById("internet").colors);
});

test("missing evidence stays unavailable and source-specific reuse conditions survive", () => {
  const missing = regions.map((r) => ({
    ...r,
    metrics: {
      ...r.metrics,
      internet: null,
      internetLow: null,
      internetHigh: null,
    },
  }));
  const doc = exportDocument(
    { ...initialExplorer, layer: "internet", region: "district-bogura" },
    missing,
    towns,
    "en",
  );
  assert.equal(doc.evidence[0].value, "—");
  assert.equal(doc.evidence[0].interval, "");
  assert.ok(doc.notes.some((n) => n.includes("unavailable")));
  const poverty = exportDocument(
    { ...initialExplorer, layer: "poverty" },
    regions,
    towns,
    "en",
  );
  assert.match(poverty.reuse, /commercial reuse requires permission/);
});

test("urban export uses city and municipality evidence rather than district rates", () => {
  const city = towns.find((p) => p.id === "city-mymensingh");
  const other = towns.find((p) => p.id === "town-muktagachha");
  const state = {
    ...initialExplorer,
    urban: city.district,
    place: city.id,
    urbanCompare: other.id,
  };
  const doc = exportDocument(state, regions, towns, "en");
  assert.equal(doc.kind, "places");
  assert.equal(doc.unit, "General households");
  assert.equal(doc.evidence[0].kind, "City corporation");
  assert.equal(doc.evidence[1].kind, "Municipality");
  assert.equal(
    doc.evidence[0].value,
    new Intl.NumberFormat("en-GB").format(city.households),
  );
  assert.match(doc.geography, /Locations only/);
  assert.equal(exportDocument(state, regions, towns, "bn").period, "২০২২");
});
