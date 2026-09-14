import type { Map as LibreMap, StyleSpecification } from "maplibre-gl";
import type { MapCamera } from "./view-state";
export type MapHandle = {
  getMap: () => LibreMap | null;
  getCamera: () => MapCamera | null;
  getFeatureIds: () => string[];
  getIssue: () => "loading" | "unavailable" | null;
};
export type MapAnnotation = {
  x: number;
  y: number;
  width: number;
  height: number;
  background?: string;
  radius?: number;
  border?: string;
  text?: string;
  font?: string;
  color?: string;
  halo?: boolean;
  path?: string;
};
export type MapSnapshot = {
  width: number;
  height: number;
  camera: MapCamera;
  padding: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  style: StyleSpecification;
  featureStates: {
    id: string;
    state: Record<string, unknown>;
  }[];
  annotations: MapAnnotation[];
  fontFamily: string;
};
/** Composition needs layout only; release copied geometry after map rendering. */
export type MapImageLayout = Pick<MapSnapshot, "width" | "height" | "fontFamily">;
