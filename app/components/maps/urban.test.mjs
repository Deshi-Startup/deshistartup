import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseExplorer, explorerUrl } from "./layers.ts";
import { urbanMatches, urbanName, urbanSource } from "./urban.ts";
const data = JSON.parse(
  readFileSync(new URL("../../../data/maps/urban.json", import.meta.url)),
);
const regions = JSON.parse(
  readFileSync(new URL("../../../data/maps/regions.json", import.meta.url)),
).regions;
const place = (id) => data.places.find((p) => p.id === id);

test("urban coverage reconciles all 338 census entries and keeps six unresolved entries explicit", () => {
  assert.equal(data.places.length, 332);
  assert.equal(data.observationYear, 2022);
  assert.equal(data.publicationDate, "2025-01");
  assert.equal(
    data.places.filter((p) => p.kind === "city-corporation").length,
    12,
  );
  assert.equal(
    data.places.filter((p) => p.kind === "municipality").length,
    320,
  );
  assert.equal(Object.keys(data.coverageByDistrict).length, 64);
  let omitted = 0,
    total = 0;
  for (const [district, coverage] of Object.entries(data.coverageByDistrict)) {
    assert.equal(
      data.places.filter((p) => p.district === district).length,
      coverage.mappedRecords,
    );
    assert.equal(
      coverage.mappedRecords + coverage.excluded.length,
      coverage.reportRecords,
    );
    omitted += coverage.excluded.length;
    total += coverage.reportRecords;
  }
  assert.equal(omitted, 6);
  assert.equal(total, 338);
  const unnamed = data.coverageByDistrict["district-jamalpur"].excluded.find(
    (e) => e.reason === "unnamed-report-row",
  );
  assert.equal(unnamed.name, "Paurashava");
  assert.equal(unnamed.sourcePage, 308);
  assert.equal(
    data.places.some((p) => p.name.en === "Hazrabari"),
    false,
  );
  assert.equal(
    data.places
      .filter((p) => p.kind === "city-corporation")
      .reduce((n, p) => n + p.households, 0),
    5199182,
  );
});

test("urban records have distinct identities, source pages, bilingual names and reference locations", () => {
  assert.equal(new Set(data.places.map((p) => p.id)).size, data.places.length);
  assert.equal(
    new Set(data.places.map((p) => p.censusCode)).size,
    data.places.length,
  );
  assert.match(data.definitions.households, /excluding institutional/);
  assert.match(data.geography.display, /No jurisdiction boundary/);
  for (const p of data.places) {
    assert.ok(
      regions.some((r) => r.id === p.district && r.level === "district"),
    );
    assert.match(p.censusCode, /^(\d{6}|\d{10})$/);
    assert.match(p.name.bn, /[\u0980-\u09ff]/);
    assert.ok(p.point.length === 2 && p.point.every(Number.isFinite));
    assert.ok(
      p.point[0] > 88 &&
        p.point[0] < 93 &&
        p.point[1] > 20.5 &&
        p.point[1] < 26.7,
    );
    assert.ok(p.pointSource.startsWith("https://"));
    assert.ok(p.pointReference);
    assert.ok(Number.isInteger(p.households) && p.households > 0);
    assert.ok(p.householdSize > 0 && p.householdSize < 10);
    assert.ok(p.literacy >= 0 && p.literacy <= 100);
    assert.ok(
      p.kind === "city-corporation"
        ? p.table === "P23" && p.sourcePage >= 259 && p.sourcePage <= 268
        : p.table === "P25" && p.sourcePage >= 273 && p.sourcePage <= 334,
    );
    for (const key of ["population", "income", "internet", "geometry"])
      assert.equal(p[key], undefined);
  }
  assert.notEqual(
    place("town-sherpur-sherpur").district,
    place("town-bogura-sherpur").district,
  );
  assert.deepEqual(place("town-bogura-bogura").additionalCensusCodes, [
    "5010008520",
  ]);
});

test("source figures preserve original links and distinguish both Dhaka jurisdictions", () => {
  for (const [id, households, householdSize, literacy, page] of [
    ["city-mymensingh", 128636, 4.03, 84.31, 265],
    ["town-muktagachha", 14186, 4.08, 86.05, 310],
    ["town-trishal", 9604, 4.18, 80.95, 311],
    ["city-dhaka-north", 1469464, 3.64, 86.59, 262],
    ["city-dhaka-south", 1007018, 3.85, 85.56, 261],
    ["city-chattogram", 776162, 3.92, 84.45, 259],
  ]) {
    const p = place(id);
    assert.deepEqual(
      [p.households, p.householdSize, p.literacy, p.sourcePage],
      [households, householdSize, literacy, page],
    );
    assert.ok(urbanSource(p).endsWith(`#page=${page}`));
  }
  const north = place("city-dhaka-north"),
    south = place("city-dhaka-south");
  assert.notDeepEqual(north.point, south.point);
  for (const p of [north, south]) assert.equal(p.pointRole, "municipal-office");
  assert.equal(
    urbanName(place("city-mymensingh"), "en"),
    "Mymensingh · City corporation",
  );
  assert.equal(
    urbanName(place("town-muktagachha"), "bn"),
    "মুক্তাগাছা · পৌরসভা",
  );
  for (const p of data.places)
    for (const alias of [p.name.en, p.name.bn, ...(p.aliases || [])])
      assert.ok(urbanMatches(p, alias));
  assert.ok(urbanMatches(north, " DHAKA "));
});

test("urban URLs restore same- and cross-district comparisons without borrowing division measures", () => {
  for (const compared of ["town-trishal", "city-dhaka-north"]) {
    const state = parseExplorer(
      `?layer=income&level=division&urban=district-mymensingh&place=city-mymensingh&urbanCompare=${compared}`,
      regions,
      data.places,
    );
    assert.equal(state.level, "district");
    assert.equal(state.layer, "density");
    assert.equal(state.region, "district-mymensingh");
    assert.equal(state.place, "city-mymensingh");
    assert.equal(state.urbanCompare, compared);
    assert.deepEqual(
      parseExplorer(explorerUrl(state), regions, data.places),
      state,
    );
  }
});

test("invalid primary jurisdictions and comparisons never acquire another place's statistics", () => {
  const mismatch = parseExplorer(
    "?urban=district-dhaka&place=city-mymensingh&urbanCompare=city-dhaka-south",
    regions,
    data.places,
  );
  assert.equal(mismatch.urban, "district-dhaka");
  assert.equal(mismatch.place, "");
  assert.equal(mismatch.urbanCompare, "");
  assert.equal(
    parseExplorer("?urban=unverified", regions, data.places).urban,
    "",
  );
  for (const query of [
    "place=city-mymensingh&urbanCompare=city-mymensingh",
    "place=unverified&urbanCompare=town-trishal",
    "place=city-mymensingh&urbanCompare=district-dhaka",
  ]) {
    assert.equal(
      parseExplorer("?urban=district-mymensingh&" + query, regions, data.places)
        .urbanCompare,
      "",
    );
  }
});
