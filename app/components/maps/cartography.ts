import type { LayerSpecification, StyleSpecification } from "maplibre-gl";
import type { FeatureCollection, Geometry, Polygon } from "geojson";

export const boundaryDetailMinZoom = 9;
// Screen-space tolerance, not a change to stored geography. Zero lets detailed
// national rings overflow MapLibre's 16-bit line mesh when viewed at small scales.
export const boundaryRenderTolerance = 0.25;

export type Boundaries = FeatureCollection<
  Geometry,
  { id: string; [key: string]: unknown }
>;

/** Context supplies roads/water/labels; analytical geometry owns administrative borders. */
export function isContextLayer(layer: LayerSpecification) {
  return !("source-layer" in layer && layer["source-layer"] === "boundary");
}

/** One source update swaps fills, selection edges and the country perimeter together. */
export function boundaryFeatures(data: Boundaries, ids: Set<string>): Boundaries {
  const country = data.features.find(
    (f) => f.properties.id === "country-bangladesh",
  );
  if (!country) throw new Error("Missing national boundary");
  return {
    type: "FeatureCollection",
    features: [
      ...data.features.filter((f) => ids.has(f.properties.id)),
      ...nationalOutline(country.geometry).features.map((f, i) => ({
        ...f,
        properties: { ...f.properties, id: `country-outline-${i}`, national: true },
      })),
    ],
  };
}

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

/** The analytical map must also start when contextual tiles/style are unavailable. */
export function baseMapStyle(glyphs?: string): StyleSpecification {
  return {
    version: 8,
    ...(glyphs ? { glyphs } : {}),
    sources: {},
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": "#f4f3ed" },
      },
    ],
  };
}
