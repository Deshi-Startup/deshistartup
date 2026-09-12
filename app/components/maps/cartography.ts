import type { FeatureCollection, Geometry, Polygon } from "geojson";

/** Shared by the map and legend: circle AREA, not radius, represents the count. */
export function countRadius(value: number | null, maximum: number) {
  return value === null || value <= 0 || maximum <= 0
    ? 0
    : Math.sqrt(value / maximum) * 36;
}

/** Split the dissolved outline for styling only; retain every source coordinate. */
export function nationalOutline(
  geometry: Geometry,
): FeatureCollection<Polygon, { minor: boolean }> {
  if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon")
    throw new Error("Expected a polygon national boundary");
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  // Relative planar area is sufficient for this visual hierarchy within one country.
  // It is never used for official area, density, or any analytical measurement.
  const areas = polygons.map(([ring]) =>
    Math.abs(
      ring.reduce((sum, p, i) => {
        const q = ring[(i + 1) % ring.length];
        return sum + p[0] * q[1] - q[0] * p[1];
      }, 0),
    ),
  );
  const threshold = Math.max(...areas) * 0.01;
  return {
    type: "FeatureCollection",
    features: polygons.map((coordinates, i) => ({
      type: "Feature",
      properties: { minor: areas[i] < threshold },
      geometry: { type: "Polygon", coordinates },
    })),
  };
}
