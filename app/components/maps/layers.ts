import type { Locale, Region, Level } from "./types.ts";
const REPORT_URL =
  "https://socialprotection.gov.bd/wp-content/uploads/2025/08/Paper-4-Poverty-Map-of-Bangladesh.pdf";
export const CENSUS_URL =
  "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2024/12/ad6c94d02722448f92690a27c4313ec9.pdf";
export const HIES_URL =
  "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2024/12/22b6e770f6a84cd9a48ff636ae506818.pdf";
export const ICT_URL =
  "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/6/d3fd947e-bfbe-4d23-9a46-6436bc50f126.pdf";
export const ECONOMY_URL =
  "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-bbs/2026/3/5c074dc0-09bd-41a5-9068-308e67afe931.pdf";
export type LayerId =
  | "density"
  | "population"
  | "economicUnits"
  | "urban"
  | "poverty"
  | "literacy"
  | "students"
  | "internet"
  | "financial"
  | "mobileBanking"
  | "income"
  | "consumption";
export type LensId = "people" | "education";
type Words = [string, string];
export const words = (s: Words, locale: Locale) => s[locale === "en" ? 0 : 1];
const teal = ["#e0efdf", "#b9dac2", "#8ac7b1", "#54aa9f", "#258783", "#125c62"];
const blue = ["#e4eaf7", "#bdcdea", "#91b0dc", "#638fc2", "#3a6da5", "#244c80"];
const rose = ["#f7e5db", "#efc5ad", "#dda284", "#c78068", "#a85b4b", "#803c36"];
// Stable measure identities; every rate ramp darkens as its value increases.
const azure = [
  "#e2edf5",
  "#bdd8ea",
  "#89bdd9",
  "#549bc2",
  "#2c78a7",
  "#15577d",
];
const violet = [
  "#eee7f5",
  "#d6c4e6",
  "#b69bcf",
  "#9472b4",
  "#734e94",
  "#513367",
];
const ochre = [
  "#f6ead1",
  "#eed09b",
  "#ddb365",
  "#c7953d",
  "#a57524",
  "#785117",
];
const berry = [
  "#f6e5ee",
  "#e6bfd3",
  "#cf93b4",
  "#b66e95",
  "#954970",
  "#713151",
];
const jade = ["#e3eee6", "#bdd8c6", "#91bea3", "#61a480", "#39825c", "#215e3d"];
const countInk = { fill: "#197c70", stroke: "#0b514a", ground: "#dce8de" };
export type Layer = {
  id: LayerId;
  name: Words;
  unit: Words;
  definition: Words;
  question: Words;
  breaks: number[];
  colors: string[];
  symbols?: typeof countInk;
  national: number;
  kind: "rate" | "count";
  source: "census" | "hies" | "poverty" | "ict" | "economy";
};
const census = (
  id: LayerId,
  name: Words,
  unit: Words,
  definition: Words,
  question: Words,
  breaks: number[],
  national: number,
  kind: "rate" | "count" = "rate",
  colors: string[] = teal,
): Layer => ({
  id,
  name,
  unit,
  definition,
  question,
  breaks,
  national,
  kind,
  colors,
  source: "census",
});
export const layers: Layer[] = [
  census(
    "density",
    ["Population density", "জনঘনত্ব"],
    ["people / km²", "মানুষ / বর্গকিমি"],
    [
      "Census population per square kilometre of administrative area. Not built-up density.",
      "প্রশাসনিক এলাকার প্রতি বর্গকিলোমিটারে জনশুমারিতে গণনা করা মানুষ। শুধু বসতি এলাকার ঘনত্ব নয়।",
    ],
    [
      "Where could customers be reached within a smaller service area? Check settlement patterns and road access next.",
      "কম জায়গার মধ্যে কোথায় বেশি মানুষের কাছে পৌঁছানো সম্ভব? এরপর বসতির ধরন ও সড়ক যোগাযোগ যাচাই করুন।",
    ],
    [500, 900, 1200, 1700, 3000],
    1119,
  ),
  census(
    "population",
    ["Population", "জনসংখ্যা"],
    ["people counted", "গণনা করা মানুষ"],
    [
      "Total enumerated population, including general and institutional households and floating people; not the post-enumeration adjusted total.",
      "সাধারণ ও প্রাতিষ্ঠানিক খানার মানুষ এবং ভাসমান মানুষসহ গণনা করা মোট জনসংখ্যা। শুমারি-পরবর্তী যাচাই দিয়ে সমন্বয় করা সংখ্যা নয়।",
    ],
    [
      "A large population is a potential audience. Which people have the problem your product solves?",
      "বেশি জনসংখ্যা মানে সম্ভাব্য কাস্টমারও বেশি হতে পারে। তাঁদের মধ্যে কারা আপনার পণ্যের মাধ্যমে সমাধান পাওয়ার মতো সমস্যায় আছেন?",
    ],
    [],
    165158616,
    "count",
  ),
  {
    ...census(
      "economicUnits",
      ["Economic units", "অর্থনৈতিক ইউনিট"],
      ["units counted", "গণনা করা ইউনিট"],
      [
        "Permanent and temporary establishments plus economic households, Economic Census 2024. Includes businesses, public and nonprofit establishments. A count of activity, not revenue, GDP or paying customers.",
        "অর্থনৈতিক শুমারি ২০২৪-এ স্থায়ী ও অস্থায়ী প্রতিষ্ঠান এবং অর্থনৈতিক কর্মকাণ্ডে যুক্ত খানা। ব্যবসার পাশাপাশি সরকারি ও অলাভজনক প্রতিষ্ঠানও আছে। এটি কাজকর্মের সংখ্যা, আয়, জিডিপি বা টাকা দিতে প্রস্তুত কাস্টমারের হিসাব নয়।",
      ],
      [
        "Which of these activities could need your service? Check the sector mix, then interview owners about their current tools, budgets and alternatives.",
        "এসব কাজের কোনটিতে আপনার সেবা লাগতে পারে? খাতের ধরন দেখুন, তারপর মালিকদের বর্তমান ব্যবস্থা, বাজেট ও বিকল্প নিয়ে কথা বলুন।",
      ],
      [],
      11702792,
      "count",
    ),
    source: "economy",
  },
  census(
    "urban",
    ["Urban population", "শহরাঞ্চলের জনসংখ্যা"],
    ["% of population", "মোট জনসংখ্যার %"],
    [
      "Urban residents divided by all enumerated residents. Calculated from Census Table P02.",
      "জনশুমারির P02 টেবিলের শহরাঞ্চলের জনসংখ্যাকে মোট জনসংখ্যা দিয়ে ভাগ করে হিসাব করা।",
    ],
    [
      "How much of the market is outside urban areas? Test whether a city-focused delivery model would reach it.",
      "আপনার টার্গেট কাস্টমারদের কতজন শহরের বাইরে আছেন? শহরভিত্তিক ডেলিভারি দিয়ে তাঁদের কাছে পৌঁছানো যাবে কি না যাচাই করুন।",
    ],
    [15, 20, 30, 40, 60],
    (52049459 / 165158616) * 100,
  ),
  {
    ...census(
      "poverty",
      ["Poverty rate", "দারিদ্র্যের হার"],
      ["% below upper poverty line", "ঊর্ধ্ব দারিদ্র্যসীমার নিচে %"],
      [
        "Estimated consumption poverty (CensusEB), using HIES and Census 2022. Not income, wealth or an opportunity ranking.",
        "HIES ও জনশুমারি ২০২২ দিয়ে CensusEB পদ্ধতিতে ভোগব্যয়ভিত্তিক দারিদ্র্যের প্রাক্কলন। আয়, সম্পদ বা ব্যবসার সুযোগের র‍্যাঙ্কিং নয়।",
      ],
      [
        "What price and payment schedule would fit local constraints? Small differences between estimates may be statistical noise.",
        "স্থানীয় কাস্টমারদের সামর্থ্য অনুযায়ী দাম ও পেমেন্টের শিডিউল কেমন হওয়া উচিত? প্রাক্কলনের সামান্য পার্থক্য স্ট্যাটিস্টিকাল নয়েজ থেকেও হতে পারে।",
      ],
      [10, 15, 20, 25, 35],
      19.2,
    ),
    source: "poverty",
    colors: rose,
  },
  census(
    "literacy",
    ["Literacy", "সাক্ষরতা"],
    ["% of people aged 7+", "৭ বছর বা বেশি বয়সীদের %"],
    [
      "Literacy rate among people aged seven and above. Not a measure of job-specific skills.",
      "৭ বছর বা বেশি বয়সীদের সাক্ষরতার হার। নির্দিষ্ট কাজের দক্ষতার পরিমাপ নয়।",
    ],
    [
      "Would a text-heavy product be usable here? Test Bangla, audio and assisted onboarding with actual users.",
      "টেক্সট-নির্ভর প্রোডাক্ট এখানকার ইউজাররা কতটা সহজে ব্যবহার করতে পারবেন? বাংলা, অডিও ও অ্যাসিস্টেড অনবোর্ডিং দিয়ে টেস্ট করে দেখুন।",
    ],
    [65, 70, 75, 80, 85],
    74.8,
    "rate",
    violet,
  ),
  {
    ...census(
      "students",
      ["Students", "শিক্ষার্থী"],
      ["students aged 5–29", "৫–২৯ বছর বয়সী শিক্ষার্থী"],
      [
        "People aged 5–29 currently studying, summed from the male and female columns in Census Table P16.",
        "জনশুমারির P16 টেবিলে বর্তমানে পড়াশোনা করছেন এমন ৫–২৯ বছর বয়সী নারী ও পুরুষের যোগফল।",
      ],
      [
        "Which age group and learning need would you serve? The total does not measure paid education demand.",
        "কোন বয়সের শিক্ষার্থীর কোন শেখার চাহিদা পূরণ করবেন? মোট সংখ্যা দিয়ে টাকা খরচ করে শেখার চাহিদা বোঝা যায় না।",
      ],
      [],
      41518866,
      "count",
      ochre,
    ),
    symbols: { fill: ochre[4], stroke: ochre[5], ground: ochre[0] },
  },
  {
    ...census(
      "internet",
      ["Internet use", "ইন্টারনেট ব্যবহার"],
      ["% of people aged 5+", "৫ বছর বা বেশি বয়সীদের %"],
      [
        "Survey estimate of people aged 5+ in private households who used the internet in the last three months, ICT Survey 2024–25. Not network coverage, speed or device ownership.",
        "আইসিটি জরিপ ২০২৪–২৫ অনুযায়ী সাধারণ খানার ৫ বছর বা বেশি বয়সীদের মধ্যে গত তিন মাসে ইন্টারনেট ব্যবহারের প্রাক্কলিত হার। নেটওয়ার্কের আওতা, গতি বা ডিভাইসের মালিকানা নয়।",
      ],
      [
        "Can users complete the task online? Explore low-data and assisted options before assuming an app-only service.",
        "ইউজাররা কি কাজটা অনলাইনেই শেষ করতে পারবেন? শুধু অ্যাপ ধরে এগোনোর আগে কম ডেটায় ও কারও সাহায্য নিয়ে ব্যবহারের অপশনগুলো টেস্ট করে দেখুন।",
      ],
      [30, 40, 50, 60, 70],
      53.4,
      "rate",
      azure,
    ),
    source: "ict",
  },
  census(
    "financial",
    ["Financial accounts", "আর্থিক প্রতিষ্ঠানে হিসাব"],
    ["% of people aged 15+", "১৫ বছর বা বেশি বয়সীদের %"],
    [
      "People with an account at a bank, insurer, microcredit institution, post office or other financial institution. Not balances or active use.",
      "ব্যাংক, বিমা, ক্ষুদ্রঋণ প্রতিষ্ঠান, ডাকঘর বা অন্য আর্থিক প্রতিষ্ঠানে হিসাব আছে এমন মানুষের হার। জমা টাকা বা নিয়মিত ব্যবহার বোঝায় না।",
    ],
    [
      "Which payment and support channels do people already use? Verify account activity and trust locally.",
      "মানুষ কোন মাধ্যমে পেমেন্ট করেন ও সাহায্য নেন? অ্যাকাউন্টের অ্যাক্টিভিটি ও আস্থার বিষয়টি স্থানীয়ভাবে যাচাই করে নিন।",
    ],
    [15, 20, 25, 30, 35],
    25.35,
    "rate",
    jade,
  ),
  census(
    "mobileBanking",
    ["Mobile banking accounts", "মোবাইল ব্যাংকিং হিসাব"],
    ["% of people aged 15+", "১৫ বছর বা বেশি বয়সীদের %"],
    [
      "People aged 15+ reporting a mobile banking account. Not transaction volume, active customers or agent coverage.",
      "১৫ বছর বা বেশি বয়সীদের মধ্যে মোবাইল ব্যাংকিং হিসাব আছে এমন মানুষের হার। লেনদেনের পরিমাণ, সক্রিয় কাস্টমার বা এজেন্টের আওতা নয়।",
    ],
    [
      "Would mobile payments reduce friction here? Investigate active use, cash-out costs and available agents.",
      "মোবাইল পেমেন্টে কি ইউজারদের কাজ সহজ হবে? নিয়মিত ব্যবহার, ক্যাশ-আউট খরচ ও এজেন্টের উপস্থিতি যাচাই করে দেখুন।",
    ],
    [30, 35, 40, 45, 50],
    39.11,
    "rate",
    berry,
  ),
  ...(["income", "consumption"] as const).map((id) => ({
    ...census(
      id,
      id === "income"
        ? ["Household income", "খানার আয়"]
        : ["Consumption expenditure", "ভোগব্যয়"],
      ["BDT / household / month", "টাকা / খানা / মাস"],
      id === "income"
        ? [
            "Mean monthly nominal household income, HIES 2022 Table 4.5. Not median, per-person income or wealth. Division estimates only.",
            "HIES ২০২২-এর টেবিল ৪.৫ অনুযায়ী খানার মাসিক গড় আয়, সেই বছরের টাকার মূল্যে। মধ্যমা, মাথাপিছু আয় বা সম্পদ নয়। শুধু বিভাগের হিসাব।",
          ]
        : [
            "Mean monthly nominal household consumption expenditure, HIES 2022 Table 4.5. Distinct from income and total expenditure. Division estimates only.",
            "HIES ২০২২-এর টেবিল ৪.৫ অনুযায়ী খানার মাসিক গড় ভোগব্যয়, সেই বছরের টাকার মূল্যে। আয় ও মোট ব্যয় থেকে আলাদা। শুধু বিভাগের হিসাব।",
          ],
      [
        "How does a proposed price fit household budgets? Validate your customer segment; a regional average hides wide differences.",
        "আপনার প্রাইজ পয়েন্ট সাধারণ ফ্যামিলির বাজেটের সঙ্গে কতটা মেলে? নির্দিষ্ট কাস্টমার সেগমেন্টের সামর্থ্য যাচাই করে নিন, কারণ অঞ্চলের গড়ে অনেক বড় পার্থক্য ঢাকা পড়ে যায়।",
      ],
      [24000, 28000, 32000, 36000, 40000],
      id === "income" ? 32422 : 30603,
    ),
    source: "hies" as const,
    colors: blue,
  })),
];
export const lenses: { id: LensId; name: Words; layers: LayerId[] }[] = [
  {
    id: "people",
    name: ["People & markets", "মানুষ ও বাজার"],
    layers: [
      "density",
      "population",
      "economicUnits",
      "urban",
      "income",
      "consumption",
      "poverty",
    ],
  },
  {
    id: "education",
    name: ["Education & access", "শিক্ষা ও সেবা"],
    layers: ["internet", "students", "literacy", "mobileBanking", "financial"],
  },
];
export const observation = (layer: Layer, locale: Locale) =>
  words(
    layer.source === "ict"
      ? ["2024–25", "২০২৪–২৫"]
      : layer.source === "economy"
        ? ["2024", "২০২৪"]
        : ["2022", "২০২২"],
    locale,
  );
export const sourceLabel = (layer: Layer) =>
  ({
    census: "BBS · Census 2022",
    hies: "BBS · HIES 2022",
    poverty: "BBS · World Bank · WFP",
    ict: "BBS · ICT Survey 2024–25",
    economy: "BBS · Economic Census 2024",
  })[layer.source];
/** Published survey intervals, never reconstructed from a rounded estimate. */
export function internetInterval(region: Region): [number, number] | null {
  const low = region.metrics?.internetLow,
    high = region.metrics?.internetHigh;
  return typeof low === "number" && typeof high === "number"
    ? [low, high]
    : null;
}
export const layerById = (id: LayerId) => layers.find((l) => l.id === id)!;
export const symbolColors = (layer: Layer) => layer.symbols ?? countInk;
export function metricValue(r: Region, l: LayerId): number | null {
  return l === "poverty" ? r.povertyRate : (r.metrics?.[l] ?? null);
}
export function sourceLink(r: Region | undefined, l: Layer) {
  const page =
    l.source === "poverty" ? r?.sourcePage : r?.metrics?.[l.id + "Page"];
  return (
    {
      poverty: REPORT_URL,
      hies: HIES_URL,
      census: CENSUS_URL,
      ict: ICT_URL,
      economy: ECONOMY_URL,
    }[l.source] + (page ? `#page=${page}` : "")
  );
}
export function metricColor(v: number | null, l: Layer) {
  return v === null
    ? "#cdd2cf"
    : l.colors[
        l.breaks.findIndex((b) => v < b) < 0
          ? l.colors.length - 1
          : l.breaks.findIndex((b) => v < b)
      ];
}
export function formatValue(
  v: number | null,
  l: Layer,
  locale: Locale,
  compact = false,
) {
  if (v === null) return "—";
  return (
    new Intl.NumberFormat(locale === "en" ? "en-GB" : "bn-BD", {
      maximumFractionDigits:
        l.kind === "count" || l.id === "density" || l.source === "hies" ? 0 : 1,
      ...(compact
        ? { notation: "compact" as const, maximumFractionDigits: 1 }
        : {}),
    }).format(v) +
    (l.kind === "rate" && l.id !== "density" && l.source !== "hies" ? "%" : "")
  );
}
export type ExplorerState = {
  lens: LensId;
  layer: LayerId;
  level: Level;
  region: string;
  compare: string;
  division: string;
  minimum: number;
  view: "map" | "table";
  transport: boolean;
  industry: boolean;
  ports: boolean;
};
export const initialExplorer: ExplorerState = {
  lens: "people",
  layer: "density",
  level: "district",
  region: "",
  compare: "",
  division: "",
  minimum: 0,
  view: "map",
  transport: false,
  industry: false,
  ports: false,
};
export function parseExplorer(
  search: string,
  regions: Region[],
): ExplorerState {
  const q = new URLSearchParams(search);
  const candidate =
    q.get("layer") ||
    (q.get("mode") === "people"
      ? "population"
      : q.get("mode") === "poverty"
        ? "poverty"
        : "density");
  const layer = layers.find((l) => l.id === candidate) || layerById("density");
  const lens =
    lenses.find((l) => l.id === q.get("lens") && l.layers.includes(layer.id)) ||
    lenses.find((l) => l.layers.includes(layer.id))!;
  const level =
    layer.source === "hies" || q.get("level") === "division"
      ? "division"
      : "district";
  const valid = (id: string | null) =>
    regions.some((r) => r.id === id && r.level === level) ? id! : "";
  const division =
    regions.find((r) => r.level === "division" && r.key === q.get("division"))
      ?.key || "";
  const region = valid(q.get("region"));
  const compare = valid(q.get("compare"));
  const min = Number(q.get("min"));
  const minimum = Number.isFinite(min) && min >= 0 ? Math.min(min, 1e9) : 0;
  return {
    lens: lens.id,
    layer: layer.id,
    level,
    region,
    compare: region && compare !== region ? compare : "",
    division,
    minimum,
    view: q.get("view") === "table" ? "table" : "map",
    transport: q.get("transport") === "true",
    industry: q.get("industry") === "true",
    ports: q.get("ports") === "true",
  };
}
export function explorerUrl(s: ExplorerState) {
  const q = new URLSearchParams();
  for (const k of Object.keys(initialExplorer) as (keyof ExplorerState)[])
    if (s[k] !== initialExplorer[k] && s[k] !== "" && s[k] !== 0)
      q.set(k === "minimum" ? "min" : k, String(s[k]));
  return q.size ? "?" + q.toString() : "";
}
export function matchingRegions(regions: Region[], s: ExplorerState) {
  return regions.filter(
    (r) =>
      r.level === s.level &&
      (!s.division ||
        (r.level === "division" ? r.key : r.division) === s.division) &&
      (s.minimum === 0 ||
        (metricValue(r, s.layer) !== null &&
          metricValue(r, s.layer)! >= s.minimum)),
  );
}

/** A small, stable comparison survives changes to the active map measure. */
export function comparisonRows(
  regions: Region[],
  places: Region[],
  active: LayerId,
) {
  const ids = [
    ...new Set<LayerId>([
      active,
      "population",
      "urban",
      "internet",
      "consumption",
    ]),
  ];
  return ids.map((id) => {
    const metric = layerById(id);
    return {
      metric,
      cells: places.map((place) => {
        const context = metric.source === "hies" && place.level === "district";
        const sourceRegion = context
          ? regions.find(
              (r) => r.level === "division" && r.key === place.division,
            )
          : place;
        return {
          region: sourceRegion,
          context,
          value: sourceRegion ? metricValue(sourceRegion, id) : null,
        };
      }),
    };
  });
}
