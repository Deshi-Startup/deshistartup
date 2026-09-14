export type MapCamera = {
  lng: number;
  lat: number;
  zoom: number;
};
export type MapAppearance = {
  camera: MapCamera | null;
  labels: boolean;
  opacity: number;
};
/** Camera state is separate from statistical filters; panning never rerenders React. */
export function parseMapAppearance(search: string): MapAppearance {
  const query = new URLSearchParams(search);
  const parts = query.get("map")?.split(",");
  const values = parts?.map(Number);
  const valid =
    parts?.every((p) => p.trim() !== "") &&
    values?.length === 3 &&
    values.every(Number.isFinite) &&
    values[0] >= 70 &&
    values[0] <= 112 &&
    values[1] >= 5 &&
    values[1] <= 40 &&
    values[2] >= 3.5 &&
    values[2] <= 13;
  const opacity = Number(query.get("opacity") ?? 0.8);
  return {
    camera: valid
      ? { lng: values![0], lat: values![1], zoom: values![2] }
      : null,
    labels: query.get("labels") !== "false",
    opacity:
      Number.isFinite(opacity) && opacity >= 0.35 && opacity <= 1
        ? opacity
        : 0.8,
  };
}
export function withMapAppearance(search: string, view: MapAppearance) {
  const query = new URLSearchParams(search);
  if (view.camera) {
    const { lng, lat, zoom } = view.camera;
    query.set(
      "map",
      `${+lng.toFixed(5)},${+lat.toFixed(5)},${+zoom.toFixed(3)}`,
    );
  } else query.delete("map");
  if (!view.labels) query.set("labels", "false");
  else query.delete("labels");
  if (view.opacity !== 0.8)
    query.set("opacity", String(+view.opacity.toFixed(2)));
  else query.delete("opacity");
  return query.size ? `?${query}` : "";
}
