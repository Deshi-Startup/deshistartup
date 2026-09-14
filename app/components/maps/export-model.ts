import {
  explorerLayer,
  formatValue,
  internetInterval,
  matchingRegions,
  metricValue,
  observation,
  sourceLabel,
  sourceLink,
  symbolColors,
  words,
  type ExplorerState,
} from "./layers.ts";
import { interval } from "./model.ts";
import { countRadius } from "./cartography.ts";
import { URBAN_REPORT_URL, urbanKind, urbanSource } from "./urban.ts";
import type { Locale, Region, UrbanPlace } from "./types.ts";
export type ExportContext = {
  label: string;
  color: string;
  icon?: "factory" | "anchor" | "gate" | "plane";
  dashed?: boolean;
};
export type ExportEvidence = {
  name: string;
  kind: string;
  value: string;
  interval: string;
  source: string;
};
export type ExportDocument = ReturnType<typeof exportDocument>;
/** Use the same definitions and classifications as the explorer, never viewport ranks. */
export function exportDocument(
  state: ExplorerState,
  regions: Region[],
  towns: UrbanPlace[],
  locale: Locale,
) {
  const t = (en: string, bn: string) => (locale === "en" ? en : bn);
  const layer = explorerLayer(state, regions);
  const number = (n: number) =>
    new Intl.NumberFormat(locale === "en" ? "en-GB" : "bn-BD", {
      maximumFractionDigits: 3,
    }).format(n);
  const places = [state.region, state.compare]
    .map((id) => regions.find((r) => r.id === id))
    .filter((r): r is Region => !!r);
  const urban = !!state.urban;
  const urbanPlaces = [state.place, state.urbanCompare]
    .map((id) => towns.find((p) => p.id === id))
    .filter((p): p is UrbanPlace => !!p);
  const evidence: ExportEvidence[] = urban
    ? urbanPlaces.map((p) => ({
        name: p.name[locale],
        kind: urbanKind(p, locale),
        value: number(p.households),
        interval: "",
        source: urbanSource(p),
      }))
    : places.map((r) => {
        const bounds =
          layer.id === "internet"
            ? internetInterval(r)
            : layer.id === "poverty"
              ? interval(r.povertyRate, r.povertySE)
              : null;
        return {
          name: r.name[locale],
          kind:
            r.level === "division"
              ? t("Division", "বিভাগ")
              : t("District", "জেলা"),
          value: formatValue(metricValue(r, layer), layer, locale),
          interval: bounds
            ? `${bounds.map((n) => formatValue(n, layer, locale)).join("–")} · ${t("95% interval", "৯৫% আস্থার সীমা")}`
            : "",
          source: sourceLink(r, layer),
        };
      });
  const maximum = Math.max(
    1,
    ...regions
      .filter((r) => r.level === state.level)
      .map((r) => metricValue(r, layer) ?? 0),
  );
  const context: ExportContext[] = [
    ...(state.transport
      ? [
          { label: t("Major road", "বড় সড়ক"), color: "#b27c35" },
          { label: t("Railway", "রেলপথ"), color: "#566b80", dashed: true },
        ]
      : []),
    ...(state.industry
      ? [
          {
            label: t("Zones & parks", "শিল্পাঞ্চল ও পার্ক"),
            color: "#374c68",
            icon: "factory" as const,
          },
        ]
      : []),
    ...(state.ports
      ? [
          {
            label: t("Seaports", "সমুদ্রবন্দর"),
            color: "#2e6576",
            icon: "anchor" as const,
          },
          {
            label: t("Land ports", "স্থলবন্দর"),
            color: "#2e6576",
            icon: "gate" as const,
          },
          {
            label: t("Airports", "বিমানবন্দর"),
            color: "#2e6576",
            icon: "plane" as const,
          },
        ]
      : []),
  ];
  const title = urban
    ? t("Cities & towns", "শহরের তথ্য")
    : words(layer.name, locale);
  const unit = urban
    ? t("General households", "সাধারণ খানা")
    : words(layer.unit, locale);
  const period = urban ? t("2022", "২০২২") : observation(layer, locale);
  const geography = urban
    ? t(
        "Census 2022 jurisdictions · Locations only",
        "জনশুমারি ২০২২-এর এলাকা · শুধু অবস্থান",
      )
    : state.level === "division"
      ? t("Divisions", "বিভাগ")
      : t("Districts", "জেলা");
  const notes = [
    ...(state.minimum
      ? [
          t(
            `Values below ${formatValue(state.minimum, layer, locale)} are faded.`,
            `${formatValue(state.minimum, layer, locale)}-এর নিচের মান হালকা দেখানো হয়েছে।`,
          ),
        ]
      : []),
    ...(state.division
      ? [
          t(
            "Regions outside the selected division are faded.",
            "বাছাই করা বিভাগের বাইরের অঞ্চল হালকা দেখানো হয়েছে।",
          ),
        ]
      : []),
    ...(!urban &&
    matchingRegions(regions, state).some((r) => metricValue(r, layer) === null)
      ? [t("Gray: data unavailable", "ধূসর: তথ্য নেই")]
      : []),
    ...(context.length
      ? [
          t(
            "Context: 12 Sep 2026 snapshot. Selected, approximate sites; not complete coverage, live services or flows.",
            "অবস্থান ও সংযোগ: ১২ সেপ্টেম্বর ২০২৬। বাছাই করা কিছু স্থানের আনুমানিক অবস্থান; পূর্ণ তালিকা, সরাসরি সেবা বা চলাচলের তথ্য নয়।",
          ),
        ]
      : []),
  ];
  const reuse =
    layer.source === "poverty" && !urban
      ? t(
          "Poverty data: educational/non-commercial reuse with acknowledgement; commercial reuse requires permission.",
          "দারিদ্র্যের তথ্য: উৎস উল্লেখ করে শিক্ষা ও অবাণিজ্যিক কাজে ব্যবহার করা যাবে। বাণিজ্যিক ব্যবহারে অনুমতি প্রয়োজন।",
        )
      : "";
  const source = urban
    ? "BBS · Census 2022 Urban Area Report"
    : sourceLabel(layer);
  const names = (urban ? urbanPlaces : places)
    .map((p) => p.name.en.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
    .join("-");
  return {
    locale,
    title,
    unit,
    period,
    geography,
    evidence,
    source,
    reuse,
    notes,
    context,
    sourceUrl:
      evidence[0]?.source ||
      (urban ? URBAN_REPORT_URL : sourceLink(undefined, layer)),
    filename: `deshi-startup-${urban ? "cities-and-towns" : state.sector ? `sector-${state.sector}-${state.sectorMeasure}` : state.layer}${names ? `-${names}` : "-bangladesh"}.png`,
    kind: urban ? ("places" as const) : layer.kind,
    colors: layer.colors,
    ticks: [number(0), ...layer.breaks.map(number), "+"],
    circles: [0.0625, 0.25, 1].map((f) => ({
      radius: countRadius(maximum * f, maximum),
      value: formatValue(maximum * f, layer, locale, true),
    })),
    symbols: symbolColors(layer),
    bands: layer.sector
      ? t("Sector-specific fixed bands", "খাতভেদে স্থির সীমা")
      : t("Fixed bands", "স্থির সীমা"),
  };
}
/** Bound allocation before creating a WebGL buffer; dimensions include the caption. */
export function exportSize(
  width: number,
  height: number,
  footer: number,
  longEdge = 2400,
) {
  if (
    ![width, height, footer, longEdge].every(Number.isFinite) ||
    width < 160 ||
    height < 160 ||
    footer < 0 ||
    longEdge < 1
  )
    throw new Error("Invalid export size");
  const ratio = Math.min(
    Math.min(2400, longEdge) / Math.max(width, height + footer),
    Math.sqrt(5760000 / (width * (height + footer))),
  );
  return {
    ratio,
    width: Math.max(1, Math.floor(width * ratio)),
    height: Math.max(1, Math.floor((height + footer) * ratio)),
  };
}
