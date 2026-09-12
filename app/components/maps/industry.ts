import data from "../../../data/maps/industry.json";
import ports from "../../../data/maps/ports.json";
import airports from "../../../data/maps/airports.json";
import type { ExplorerState } from "./layers";
export const industrySites = data.sites;
export type IndustrySite = (typeof industrySites)[number];
export const portSites = [...ports.sites, ...airports.sites];
export type MapSite = IndustrySite | (typeof portSites)[number];
export const siteKind = (kind: string, locale: "en" | "bn") =>
  (({
    epz: ["EPZ", "ইপিজেড"],
    seaport: ["Seaport", "সমুদ্রবন্দর"],
    landport: ["Land port", "স্থলবন্দর"],
    airport: ["Airport", "বিমানবন্দর"],
  })[kind] || [kind, kind])[locale === "en" ? 0 : 1];
export function matchingSites(state: ExplorerState) {
  return industrySites.filter(
    (site) => !state.division || site.division === state.division,
  );
}
export function matchingPorts(state: ExplorerState) {
  return portSites.filter(
    (site) => !state.division || site.division === state.division,
  );
}
export function matchingAnchors(state: ExplorerState): MapSite[] {
  return [
    ...(state.industry ? matchingSites(state) : []),
    ...(state.ports ? matchingPorts(state) : []),
  ];
}

/** Small, deterministic pixel groups avoid hiding adjacent EPZs behind each other. */
export function groupSites(
  sites: MapSite[],
  project: (point: number[]) => { x: number; y: number },
) {
  const groups: MapSite[][] = [];
  for (const site of sites) {
    const point = project(site.point);
    const group = groups.find((items) => {
      const anchor = project(items[0].point);
      return Math.hypot(point.x - anchor.x, point.y - anchor.y) < 44;
    });
    if (group) group.push(site);
    else groups.push([site]);
  }
  return groups;
}
