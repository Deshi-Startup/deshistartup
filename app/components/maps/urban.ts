import type { Locale, UrbanPlace } from "./types.ts";

export const URBAN_REPORT_URL =
  "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2024/12/fe6eeb0c1f364676877a4a7ef77989cc.pdf";

export function urbanKind(place: UrbanPlace, locale: Locale) {
  return place.kind === "city-corporation"
    ? locale === "en"
      ? "City corporation"
      : "সিটি করপোরেশন"
    : locale === "en"
      ? "Municipality"
      : "পৌরসভা";
}

export function urbanName(place: UrbanPlace, locale: Locale) {
  return `${place.name[locale]} · ${urbanKind(place, locale)}`;
}

export function urbanSource(place: UrbanPlace) {
  return `${URBAN_REPORT_URL}#page=${place.sourcePage}`;
}

export function urbanMatches(place: UrbanPlace, query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  return [place.name.en, place.name.bn, ...(place.aliases || [])].some((name) =>
    name.toLocaleLowerCase().includes(normalized),
  );
}
