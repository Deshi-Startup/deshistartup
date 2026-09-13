import type { Region } from "./types.ts";
export function interval(value: number | null, se: number | null) {
  return value === null || se === null
    ? null
    : [Math.max(0, value - 1.96 * se), Math.min(100, value + 1.96 * se)];
}
export function regionMatches(region: Region, query: string) {
  const words = query.trim().toLocaleLowerCase().normalize("NFC").split(/\s+/);
  const text = [region.name.en, region.name.bn, ...region.aliases]
    .join(" ")
    .toLocaleLowerCase()
    .normalize("NFC");
  return words.every((w) => text.includes(w));
}
