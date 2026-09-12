import data from "../../../data/maps/industry.json";
import parks from "../../../data/maps/industrial-parks.json";
import ports from "../../../data/maps/ports.json";
import airports from "../../../data/maps/airports.json";
import type { ExplorerState } from "./layers";
export type IndustrySite = (typeof data.sites)[number] | (typeof parks.sites)[number];
export const industrySites: IndustrySite[] = [...data.sites, ...parks.sites];
export const portSites = [...ports.sites, ...airports.sites];
export type MapSite = IndustrySite | (typeof portSites)[number];
export const siteKind = (kind: string, locale: "en" | "bn") =>
  (({
    epz: ["EPZ", "ইপিজেড"],
    estate: ["BSCIC estate", "বিসিক শিল্পনগরী"],
    technologypark: ["Technology park", "প্রযুক্তি পার্ক"],
    economiczone: ["Economic zone", "অর্থনৈতিক অঞ্চল"],
    seaport: ["Seaport", "সমুদ্রবন্দর"],
    landport: ["Land port", "স্থলবন্দর"],
    airport: ["Airport", "বিমানবন্দর"],
  })[kind] || [kind, kind])[locale === "en" ? 0 : 1];
export const isIndustrialSite = (site: MapSite) =>
  ["epz", "estate", "technologypark", "economiczone"].includes(site.kind);
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

/** Small, deterministic pixel groups keep nearby sites discoverable. */
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
