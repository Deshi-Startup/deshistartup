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
  G: ["Trade & vehicle repair", "পাইকারি ও খুচরা বাণিজ্য, যানবাহন মেরামত"],
  H: ["Transport & storage", "পরিবহন ও গুদামজাতকরণ"],
  I: ["Accommodation & food services", "আবাসন ও খাবার সেবা"],
  J: ["Information & communication", "তথ্য ও যোগাযোগ"],
  K: ["Finance & insurance", "আর্থিক ও বিমা সেবা"],
  L: ["Real estate", "রিয়েল এস্টেট"],
  M: [
    "Professional, scientific & technical services",
    "পেশাগত, বৈজ্ঞানিক ও কারিগরি সেবা",
  ],
  N: ["Administrative & support services", "প্রশাসনিক ও সহায়তা সেবা"],
  O: ["Public administration & defence", "জনপ্রশাসন ও প্রতিরক্ষা"],
  P: ["Education", "শিক্ষা"],
  Q: ["Health & social work", "স্বাস্থ্য ও সমাজসেবা"],
  R: ["Arts, entertainment & recreation", "শিল্পকলা, বিনোদন ও অবসর"],
  S: ["Other services", "অন্যান্য সেবা"],
};

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
