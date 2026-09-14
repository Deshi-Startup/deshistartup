/** Offline, deterministic importer. See docs/maps.md for source downloads and reuse terms. */
import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import polylabel from "polylabel";

const [reportPath] = process.argv.slice(2);
if (!reportPath)
  throw new Error(
    "Usage: node scripts/import-maps.mjs REPORT.txt (boundaries: import-map-boundaries.py)",
  );
const retrievedAt =
  process.env.MAPS_RETRIEVED_AT || new Date().toISOString().slice(0, 10);
assert.match(
  retrievedAt,
  /^\d{4}-\d{2}-\d{2}$/,
  "MAPS_RETRIEVED_AT must use YYYY-MM-DD",
);
const crosswalk = JSON.parse(
  fs.readFileSync("data/maps/geography.json", "utf8"),
);
const pages = fs.readFileSync(reportPath, "utf8").split("\f");
const rows = [];
let division = "";
// Annex 1 only. Physical PDF pages 58–75, printed pages 46–63.
for (let p = 57; p < 75; p++) {
  const lines = pages[p].split("\n");
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].trim().match(/^(.+?)\s+(\d{6,})\s+(.*)$/);
    if (!match) continue;
    let name = match[1];
    if (["District", "Division"].includes(lines[i + 1]?.trim()))
      name += ` ${lines[i + 1].trim()}`;
    if (!/ (District|Division)$/.test(name)) continue;
    const level = name.endsWith("Division") ? "division" : "district";
    name = name.replace(/ (District|Division)$/, "");
    const matchGeo = crosswalk.find((g) => g.en === name);
    assert(matchGeo, `Missing name crosswalk: ${name}`);
    if (level === "division") division = matchGeo.id;
    const values = match[3]
      .match(/\d+\.\d+/g)
      .slice(0, 2)
      .map(Number);
    rows.push({
      id: `${level}-${matchGeo.id}`,
      key: matchGeo.id,
      level,
      division,
      name: { en: name, bn: matchGeo.bn },
      aliases: [matchGeo.boundaryName].filter(Boolean),
      privateHouseholdPopulation: Number(match[2]),
      povertyRate: values[0],
      povertySE: values[1],
      sourcePage: p + 1,
    });
  }
}
assert.equal(rows.filter((r) => r.level === "district").length, 64);
assert.equal(rows.filter((r) => r.level === "division").length, 8);
for (const div of rows.filter((r) => r.level === "division")) {
  assert.equal(
    rows
      .filter((r) => r.level === "district" && r.division === div.key)
      .reduce((a, r) => a + r.privateHouseholdPopulation, 0),
    div.privateHouseholdPopulation,
    `Population reconciliation: ${div.id}`,
  );
}
// Statistical imports do not overwrite the separately verified geometry levels.
const geometry = JSON.parse(
  fs.readFileSync("public/maps/bangladesh-2020.geojson", "utf8"),
);
function point(geometry) {
  const polys =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  // Largest polygon by area, then pole of inaccessibility. A region symbol, never an office coordinate.
  const area = (ring) =>
    Math.abs(
      ring.reduce((sum, p, i) => {
        const q = ring[(i + 1) % ring.length];
        return sum + p[0] * q[1] - q[0] * p[1];
      }, 0),
    );
  const polygon = [...polys].sort((a, b) => area(b[0]) - area(a[0]))[0];
  return polylabel(polygon, 0.001)
    .slice(0, 2)
    .map((n) => Number(n.toFixed(5)));
}
for (const row of rows) {
  const f = geometry.features.find((f) => f.properties.id === row.id);
  assert(f, `Missing verified boundary: ${row.id}`);
  row.point = point(f.geometry);
  if (row.level === "district") row.boundaryId = f.properties.boundaryId;
}
fs.writeFileSync(
  "data/maps/regions.json",
  JSON.stringify(
    {
      observationYear: 2022,
      publicationDate: "2024-12",
      retrievedAt,
      regions: rows,
    },
    null,
    2,
  ) + "\n",
);
const hashes = Object.fromEntries(
  [
    ["reportText", reportPath],
  ].map(([key, path]) => [
    key,
    crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex"),
  ]),
);
fs.writeFileSync(
  "data/maps/import-hashes.json",
  JSON.stringify(hashes, null, 2) + "\n",
);
console.log(
  `Imported ${rows.length} regions; every district joins and every division population reconciles.`,
);
