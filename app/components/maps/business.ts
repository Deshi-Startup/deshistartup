import type { Region } from "./types.ts";

export const ECONOMY_SECTOR_URL =
  "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/6/c349ddf7-fe70-4c4e-8062-7cc1c468f84b.pdf";
// Short labels retain the BSIC section scope; the source holds full definitions.
export const sectorNames: Record<string, [string, string]> = {
  B: ["Mining & quarrying", "খনি ও পাথর উত্তোলন"],
  C: ["Manufacturing", "উৎপাদন শিল্প"],
  D: ["Electricity, gas & cooling", "বিদ্যুৎ, গ্যাস ও শীতাতপ ব্যবস্থা"],
  E: ["Water & waste services", "পানি ও বর্জ্য ব্যবস্থাপনা"],
  F: ["Construction", "নির্মাণ"],
  G: ["Trade & vehicle repair", "পাইকারি ও খুচরা ব্যবসা, যানবাহন মেরামত"],
  H: ["Transport & storage", "পরিবহন ও গুদামজাতকরণ"],
  I: ["Accommodation & food services", "থাকা ও খাবারের সেবা"],
  J: ["Information & communication", "তথ্য ও যোগাযোগ"],
  K: ["Finance & insurance", "ব্যাংক, আর্থিক ও বিমা সেবা"],
  L: ["Real estate", "রিয়েল এস্টেট"],
  M: [
    "Professional, scientific & technical services",
    "পেশাগত, বৈজ্ঞানিক ও কারিগরি সেবা",
  ],
  N: ["Administrative & support services", "প্রশাসনিক ও সহায়তা সেবা"],
  O: ["Public administration & defence", "জনপ্রশাসন ও প্রতিরক্ষা"],
  P: ["Education", "শিক্ষা"],
  Q: ["Health & social work", "স্বাস্থ্য ও সমাজসেবা"],
  R: ["Arts, entertainment & recreation", "শিল্পকলা, বিনোদন ও অবসর"],
  S: ["Other services", "অন্যান্য সেবা"],
};

export const sectorMeasures = ["units", "share", "people"] as const;
export type SectorMeasure = (typeof sectorMeasures)[number];
export type SectorSelection = { sector: string; sectorMeasure: SectorMeasure };
export const sectorMeasureNames: Record<SectorMeasure, [string, string]> = {
  units: ["Establishments", "প্রতিষ্ঠান"],
  share: ["Local share", "স্থানীয় অংশ"],
  people: ["People engaged", "কাজে যুক্ত মানুষ"],
};

// Percentage bands are fixed for the 2024 release, across levels and filters.
// Sector-specific ranges keep small activities legible without ranking regions.
export const sectorShareBreaks: Record<string, number[]> = {
  B: [0.005, 0.01, 0.025, 0.05, 0.1],
  C: [4, 6, 8, 10, 12],
  D: [0.02, 0.04, 0.06, 0.08, 0.1],
  E: [0.01, 0.025, 0.05, 0.1, 0.2],
  F: [0.01, 0.02, 0.03, 0.05, 0.07],
  G: [40, 45, 50, 55, 60],
  H: [0.5, 0.75, 1, 1.5, 2],
  I: [5, 8, 11, 14, 18],
  J: [0.1, 0.2, 0.3, 0.5, 0.7],
  K: [0.6, 0.9, 1.2, 1.5, 1.8],
  L: [0.01, 0.025, 0.05, 0.1, 0.2],
  M: [0.25, 0.5, 0.75, 1, 1.25],
  N: [1, 1.5, 2, 2.5, 3],
  O: [0.25, 0.5, 0.75, 1, 2],
  P: [3, 4, 5, 6, 8],
  Q: [1, 1.5, 2, 2.5, 3],
  R: [0.1, 0.15, 0.2, 0.3, 0.4],
  S: [10, 12, 14, 16, 18],
};

export function validSector(code: string | null): string {
  return code && Object.hasOwn(sectorNames, code) ? code : "";
}

/** Missing evidence and zero establishments have different meanings. */
export function sectorValue(
  region: Region,
  selection: SectorSelection,
): number | null {
  const business = region.business;
  const activity = business?.sectors.find((s) => s.code === selection.sector);
  if (!business || !activity) return null;
  return selection.sectorMeasure === "share"
    ? activityShare(activity.units, business.permanentEstablishments)
    : activity[selection.sectorMeasure];
}

/** Aggregate one complete geographic level; never average regional percentages. */
export function nationalSectorValue(
  regions: Region[],
  selection: SectorSelection,
): number | null {
  const divisions = regions.filter((r) => r.level === "division");
  if (divisions.length !== 8 || new Set(divisions.map((r) => r.id)).size !== 8)
    return null;
  if (divisions.some((r) => sectorValue(r, selection) === null)) return null;
  if (selection.sectorMeasure === "share") {
    const units = divisions.reduce(
      (sum, r) =>
        sum + sectorValue(r, { ...selection, sectorMeasure: "units" })!,
      0,
    );
    return activityShare(
      units,
      divisions.reduce(
        (sum, r) => sum + r.business!.permanentEstablishments,
        0,
      ),
    );
  }
  return divisions.reduce((sum, r) => sum + sectorValue(r, selection)!, 0);
}

export function orderedActivities(business: NonNullable<Region["business"]>) {
  return [...business.sectors].sort(
    (a, b) => b.units - a.units || a.code.localeCompare(b.code),
  );
}

export function activityShare(units: number, permanentEstablishments: number) {
  return permanentEstablishments > 0
    ? (units / permanentEstablishments) * 100
    : null;
}
