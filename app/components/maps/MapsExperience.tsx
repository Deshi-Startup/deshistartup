"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import SiteBrand from "../SiteBrand";
import SurveyInterval from "./SurveyInterval";
import BusinessProfile from "./BusinessProfile";
import type { Region, Locale } from "./types";
import { interval, regionMatches } from "./model";
import { countRadius } from "./cartography";
import { matchingAnchors, siteKind } from "./industry";
import {
  comparisonRows,
  layers,
  lenses,
  layerById,
  symbolColors,
  words,
  metricValue,
  observation,
  formatValue,
  sourceLink,
  sourceLabel,
  internetInterval,
  initialExplorer,
  parseExplorer,
  explorerUrl,
  matchingRegions,
  type ExplorerState,
  type LayerId,
  type LensId,
} from "./layers";
import "./maps.css";
const MapCanvas = dynamic(() => import("./MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="maps-load" role="status">
      Deshi Startup Maps…
    </div>
  ),
});
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
function Icon({
  name,
}: {
  name:
    | "layers"
    | "search"
    | "close"
    | "share"
    | "arrow"
    | "info"
    | "compare"
    | "chevron"
    | "factory"
    | "anchor"
    | "gate"
    | "plane";
}) {
  const paths = {
    layers: "M12 3 2 8l10 5 10-5-10-5ZM2 12l10 5 10-5M2 16l10 5 10-5",
    search: "m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
    close: "m6 6 12 12M18 6 6 18",
    share:
      "m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    info: "M12 11v6m0-10v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    compare: "M8 4v16M16 4v16M3 8l5-4 5 4M11 16l5 4 5-4",
    chevron: "m6 9 6 6 6-6",
    factory: "M3 21V10l6 3V7l6 4V3h4l2 18H3ZM7 17h1m4 0h1m4 0h1",
    anchor:
      "M12 7v14M5 11H2v4a10 10 0 0 0 20 0v-4h-3M8 12h8M15 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    plane:
      "M12 2c-1 0-2 2-2 4v3L2 14v2l8-2v4l-3 2v1l5-1 5 1v-1l-3-2v-4l8 2v-2l-8-5V6c0-2-1-4-2-4Z",
    gate: "M4 21V8h16v13M2 8l10-5 10 5M8 21v-7h8v7M2 21h20",
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
export default function MapsExperience({
  locale,
  regions,
}: {
  locale: Locale;
  regions: Region[];
}) {
  const t = (en: string, bn: string) => (locale === "en" ? en : bn);
  const [state, setState] = useState<ExplorerState>(initialExplorer),
    [hydrated, setHydrated] = useState(false),
    [layersOpen, setLayersOpen] = useState(false),
    [detailOpen, setDetailOpen] = useState(false),
    [panel, setPanel] = useState<"insights" | "sources" | "compare">(
      "insights",
    ),
    [searchVisible, setSearchVisible] = useState(false),
    [query, setQuery] = useState(""),
    [searchOpen, setSearchOpen] = useState(false),
    [activeResult, setActiveResult] = useState(0),
    [share, setShare] = useState(""),
    [reset, setReset] = useState(0),
    [opacity, setOpacity] = useState(0.8),
    [labels, setLabels] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null),
    searchTrigger = useRef<HTMLButtonElement>(null),
    layerTrigger = useRef<HTMLButtonElement>(null),
    detailTrigger = useRef<HTMLButtonElement>(null),
    mobileDetailTrigger = useRef<HTMLButtonElement>(null),
    detailPanel = useRef<HTMLElement>(null),
    detailOpener = useRef<HTMLElement | null>(null);
  const layer = layerById(state.layer),
    lens = lenses.find((l) => l.id === state.lens)!,
    divisionRegions = regions.filter((r) => r.level === "division"),
    visible = matchingRegions(regions, state);
  const selected = regions.find((r) => r.id === state.region),
    compared = regions.find((r) => r.id === state.compare);
  const results = regions
    .filter((r) => r.level === state.level && regionMatches(r, query))
    .slice(0, 8);
  const num = (v: number) =>
    new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-GB", {
      maximumFractionDigits: 0,
    }).format(v);
  const value = (r: Region, id = state.layer) =>
    formatValue(metricValue(r, id), layerById(id), locale);
  const change = (next: Partial<ExplorerState>) =>
    setState((s) => ({ ...s, ...next }));
  useEffect(() => {
    const read = () => {
      const restored = parseExplorer(location.search, regions);
      setState(restored);
      setLayersOpen(false);
      setPanel(restored.compare ? "compare" : "insights");
      setDetailOpen(
        restored.view !== "table" && (!!restored.region || !!restored.compare),
      );
      setHydrated(true);
    };
    read();
    addEventListener("popstate", read);
    return () => removeEventListener("popstate", read);
  }, [regions]);
  useEffect(() => {
    detailPanel.current?.scrollTo({ top: 0 });
  }, [panel, state.region, state.layer, detailOpen]);
  useEffect(() => {
    const compact = matchMedia("(max-width: 1100px)");
    const closeLayers = () => {
      if (compact.matches) setLayersOpen(false);
    };
    compact.addEventListener("change", closeLayers);
    return () => compact.removeEventListener("change", closeLayers);
  }, []);
  useEffect(() => {
    if (hydrated) {
      history.replaceState(null, "", location.pathname + explorerUrl(state));
      setShare("");
    }
  }, [state, hydrated]);
  useEffect(() => {
    if (!share) return;
    const timeout = setTimeout(() => setShare(""), 5000);
    return () => clearTimeout(timeout);
  }, [share]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement)?.tagName,
        )
      ) {
        e.preventDefault();
        setSearchVisible(true);
        requestAnimationFrame(() => searchRef.current?.focus());
      }
      if (e.key === "Escape") {
        const active = document.activeElement as HTMLElement | null;
        setSearchOpen(false);
        if (active === searchRef.current) {
          setSearchVisible(false);
          searchTrigger.current?.focus();
          return;
        }
        if (active?.closest(".maps-layer-panel")) {
          setLayersOpen(false);
          layerTrigger.current?.focus();
        } else if (document.getElementById("maps-details")) {
          closeDetails();
        } else {
          setLayersOpen(false);
          layerTrigger.current?.focus();
        }
      }
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, []);
  function rememberDetailOpener() {
    const active = document.activeElement as HTMLElement | null;
    if (active && !active.closest(".maps-detail-panel, .maps-text-alternative"))
      detailOpener.current = active;
  }
  function choose(id: string) {
    rememberDetailOpener();
    if (detailOpen && panel === "compare" && selected && id !== selected.id)
      change({ compare: id });
    else {
      change({ region: id, compare: "" });
      setPanel("insights");
    }
    setQuery("");
    setSearchOpen(false);
    setSearchVisible(false);
    setDetailOpen(true);
    if (innerWidth <= 1100) setLayersOpen(false);
  }
  function chooseLayer(id: LayerId, lensId?: LensId, keepOpen = false) {
    const next = layerById(id),
      level = next.source === "hies" ? "division" : state.level;
    const owner =
      lensId ||
      lenses.find((l) => l.id === state.lens && l.layers.includes(id))?.id ||
      lenses.find((l) => l.layers.includes(id))!.id;
    change({
      layer: id,
      lens: owner,
      level,
      region: level === state.level ? state.region : "",
      compare: level === state.level ? state.compare : "",
      minimum: 0,
    });
    if (innerWidth < 760 && !keepOpen) setLayersOpen(false);
  }
  function toggleDetails(next: "insights" | "sources" | "compare") {
    rememberDetailOpener();
    setPanel(next);
    setDetailOpen(true);
    if (innerWidth <= 1100) setLayersOpen(false);
  }
  async function shareView() {
    try {
      await navigator.clipboard.writeText(
        location.origin + location.pathname + explorerUrl(state),
      );
      setShare(t("Link copied", "লিংক কপি হয়েছে"));
    } catch {
      setShare(
        t(
          "Copy the link from your address bar.",
          "অ্যাড্রেস বার থেকে লিংক কপি করুন।",
        ),
      );
    }
  }
  const top = [...visible]
    .filter((r) => metricValue(r, state.layer) !== null)
    .sort((a, b) => metricValue(b, state.layer)! - metricValue(a, state.layer)!)
    .slice(0, 5);
  function closeDetails() {
    setDetailOpen(false);
    requestAnimationFrame(() => {
      const opener = detailOpener.current;
      const visible =
        opener?.isConnected &&
        opener.getClientRects().length &&
        getComputedStyle(opener).visibility !== "hidden" &&
        !opener.closest(".maps-text-alternative");
      if (visible && opener !== document.body) opener.focus();
      else if (innerWidth < 760) mobileDetailTrigger.current?.focus();
      else detailTrigger.current?.focus();
    });
  }
  const sourceName = sourceLabel(layer);
  const interviewGuideLink = (
    <a
      className="maps-investigation-link"
      href={
        basePath +
        (locale === "en"
          ? "/en/validation/interview-scripts"
          : "/validation/interview-scripts")
      }
    >
      {t(
        "Prepare customer interviews",
        "কাস্টমারের সঙ্গে কথা বলার প্রশ্ন সাজান",
      )}
      <Icon name="arrow" />
    </a>
  );
  const fieldQuestion = (
    <section className="maps-next-question">
      <h3>
        {t("A question to take into the field", "মাঠে যাচাই করার প্রশ্ন")}
      </h3>
      <p>{words(layer.question, locale)}</p>
      {interviewGuideLink}
    </section>
  );
  const table = (items: Region[]) => (
    <table>
      <caption>
        {words(layer.name, locale)} · {words(layer.unit, locale)} ·{" "}
        {observation(layer, locale)}
      </caption>
      <thead>
        <tr>
          <th scope="col">{t("Region", "অঞ্চল")}</th>
          <th scope="col">{words(layer.name, locale)}</th>
          {(state.layer === "poverty" || state.layer === "internet") && (
            <th scope="col">
              {state.layer === "internet"
                ? t("95% interval", "৯৫% আস্থার সীমা")
                : t("Approx. 95% interval", "প্রায় ৯৫% আস্থার সীমা")}
            </th>
          )}
          <th scope="col">{t("Source", "উৎস")}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((r) => (
          <tr key={r.id}>
            <th scope="row">
              <button
                onClick={() => {
                  choose(r.id);
                  change({ view: "map" });
                }}
              >
                {r.name[locale]}
              </button>
            </th>
            <td>{value(r)}</td>
            {state.layer === "poverty" && (
              <td>
                {interval(r.povertyRate, r.povertySE)
                  ?.map((n) => formatValue(n, layer, locale))
                  .join("–") || "-"}
              </td>
            )}
            {state.layer === "internet" && (
              <td>
                <SurveyInterval region={r} locale={locale} />
              </td>
            )}
            <td>
              <a href={sourceLink(r, layer)}>{t("Report", "রিপোর্ট")}</a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  return (
    <div className="deshi-maps" lang={locale}>
      <a className="skip-link" href="#map-data">
        {t("Skip to regional data", "অঞ্চলের তথ্যে যান")}
      </a>
      <header className="maps-header">
        <SiteBrand isEn={locale === "en"} />
        <div className={`maps-search ${searchVisible ? "is-open" : ""}`}>
          <Icon name="search" />
          <input
            ref={searchRef}
            role="combobox"
            aria-label={t(
              "Search districts and divisions",
              "জেলা ও বিভাগ খুঁজুন",
            )}
            placeholder={t("Search a place…", "জেলা বা বিভাগ খুঁজুন…")}
            aria-expanded={searchOpen && !!query.trim()}
            aria-controls="maps-results"
            aria-activedescendant={
              searchOpen && query.trim() && results[activeResult]
                ? `result-${results[activeResult].id}`
                : undefined
            }
            value={query}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveResult(0);
              setSearchOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveResult((a) => Math.min(a + 1, results.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveResult((a) => Math.max(a - 1, 0));
              }
              if (e.key === "Enter" && query.trim() && results[activeResult]) {
                e.preventDefault();
                choose(results[activeResult].id);
              }
              if (e.key === "Escape") setSearchOpen(false);
            }}
          />
          <kbd>/</kbd>
          {searchOpen && query.trim() && (
            <ul id="maps-results" role="listbox">
              {results.length ? (
                results.map((r, i) => (
                  <li
                    role="option"
                    id={`result-${r.id}`}
                    key={r.id}
                    aria-selected={activeResult === i}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(r.id)}
                  >
                    {r.name[locale]}
                    <small>
                      {r.level === "division"
                        ? t("Division", "বিভাগ")
                        : divisionRegions.find((d) => d.key === r.division)
                            ?.name[locale]}
                    </small>
                  </li>
                ))
              ) : (
                <li role="presentation">
                  {t(
                    "No matching place. Try another spelling.",
                    "মেলেনি। অন্য বানানে খুঁজে দেখুন।",
                  )}
                </li>
              )}
            </ul>
          )}
        </div>
        <nav
          className="maps-header-actions"
          aria-label={t("Map actions", "মানচিত্রের কাজ")}
        >
          <button
            ref={searchTrigger}
            className="maps-search-trigger"
            aria-label={t("Search places", "অঞ্চল খুঁজুন")}
            aria-expanded={searchVisible}
            onClick={() => {
              setSearchVisible((v) => !v);
              requestAnimationFrame(() => searchRef.current?.focus());
            }}
          >
            <Icon name="search" />
          </button>
          <a
            className="maps-language"
            href={
              basePath +
              (locale === "en" ? "/maps" : "/en/maps") +
              explorerUrl(state)
            }
            lang={locale === "en" ? "bn" : "en"}
            aria-label={t("বাংলায় দেখুন", "View in English")}
          >
            {t("বাংলা", "EN")}
          </a>
          <button
            className="maps-compare-trigger"
            aria-label={t("Compare regions", "অঞ্চলের তুলনা")}
            aria-expanded={detailOpen && panel === "compare"}
            aria-controls="maps-details"
            onClick={() =>
              detailOpen && panel === "compare"
                ? closeDetails()
                : toggleDetails("compare")
            }
          >
            <Icon name="compare" />
            <span>{t("Compare", "তুলনা")}</span>
          </button>
          <button
            className="maps-share"
            aria-label={t("Share this view", "এই ভিউ শেয়ার করুন")}
            onClick={shareView}
          >
            <Icon name="share" />
            <span>{t("Share view", "লিংক কপি")}</span>
          </button>
        </nav>
      </header>
      <main
        id="main"
        className={`maps-workspace ${layersOpen ? "has-layers" : ""} ${detailOpen ? "has-detail" : ""}`}
        aria-label={t("Deshi Startup map explorer", "দেশি স্টার্টআপ মানচিত্র")}
      >
        {(!detailOpen || panel !== "insights") && (
          <h1 className="sr-only">
            {t("Deshi Startup Maps", "দেশি স্টার্টআপ মানচিত্র")}
          </h1>
        )}
        <MapCanvas
          regions={regions}
          locale={locale}
          state={state}
          onSelect={choose}
          reset={reset}
          detailOpen={detailOpen}
          layersOpen={layersOpen}
          opacity={opacity}
          labels={labels}
        />
        <nav
          className="maps-lenses"
          aria-label={t("Explore by question", "বিষয় বেছে নিন")}
        >
          {lenses.map((l) => (
            <button
              key={l.id}
              aria-pressed={state.lens === l.id}
              onClick={() => chooseLayer(l.layers[0], l.id)}
            >
              {words(l.name, locale)}
            </button>
          ))}
        </nav>
        <div className="maps-overlays-toolbar">
          <div>
            <button
              ref={layerTrigger}
              className="maps-layer-trigger"
              aria-expanded={layersOpen}
              aria-controls="maps-layers"
              onClick={() => {
                setLayersOpen((o) => !o);
                if (innerWidth <= 1100) setDetailOpen(false);
              }}
            >
              <Icon name="layers" />
              <span>
                {words(layer.name, locale)}
                <small>
                  {words(layer.unit, locale)} · {observation(layer, locale)}
                </small>
              </span>
              <Icon name="chevron" />
            </button>
            <button
              ref={detailTrigger}
              aria-expanded={detailOpen}
              aria-controls="maps-details"
              onClick={() => {
                if (detailOpen) closeDetails();
                else toggleDetails("insights");
              }}
            >
              <Icon name="info" />
              {t("Insights", "বিস্তারিত")}
            </button>
          </div>
          <div
            className="maps-view-toggle"
            role="group"
            aria-label={t("Map or data table", "মানচিত্র বা তথ্যের টেবিল")}
          >
            <button
              aria-pressed={state.view === "map"}
              onClick={() => change({ view: "map" })}
            >
              {t("Map", "মানচিত্র")}
            </button>
            <button
              aria-pressed={state.view === "table"}
              onClick={() => {
                change({ view: "table" });
                setLayersOpen(false);
                setDetailOpen(false);
              }}
            >
              {t("Data", "তথ্য")}
            </button>
          </div>
        </div>
        {layersOpen && (
          <aside
            className="maps-layer-panel maps-floating"
            id="maps-layers"
            aria-label={t("Map layers", "মানচিত্রের তথ্যস্তর")}
          >
            <div className="maps-panel-heading">
              <h2>{t("Explore the data", "তথ্য ঘুরে দেখুন")}</h2>
              <button
                className="maps-icon-button"
                aria-label={t("Close layers", "তথ্যস্তর বন্ধ করুন")}
                onClick={() => {
                  setLayersOpen(false);
                  layerTrigger.current?.focus();
                }}
              >
                <Icon name="close" />
              </button>
            </div>
            <label className="maps-topic-picker">
              {t("Explore", "বিষয়")}
              <select
                aria-label={t("Explore topic", "বিষয় বেছে নিন")}
                value={state.lens}
                onChange={(e) => {
                  const next = lenses.find((l) => l.id === e.target.value)!;
                  chooseLayer(next.layers[0], next.id, true);
                }}
              >
                {lenses.map((l) => (
                  <option key={l.id} value={l.id}>
                    {words(l.name, locale)}
                  </option>
                ))}
              </select>
            </label>
            <div className="maps-layer-options">
              {lens.layers.map(layerById).map((l) => (
                <button
                  key={l.id}
                  aria-pressed={state.layer === l.id}
                  onClick={() => chooseLayer(l.id)}
                >
                  <span>{words(l.name, locale)}</span>
                  <span className="maps-layer-swatch" aria-hidden="true">
                    {l.kind === "count" ? (
                      <i
                        className="maps-layer-dot"
                        style={{ background: symbolColors(l).fill }}
                      />
                    ) : (
                      l.colors.map((color) => (
                        <i key={color} style={{ background: color }} />
                      ))
                    )}
                  </span>
                </button>
              ))}
            </div>
            <label>
              {t("Geographic level", "অঞ্চলের ধরন")}
              <select
                value={state.level}
                disabled={layer.source === "hies"}
                onChange={(e) =>
                  change({
                    level: e.target.value as "district" | "division",
                    region: "",
                    compare: "",
                  })
                }
              >
                <option value="district">{t("Districts", "জেলা")}</option>
                <option value="division">{t("Divisions", "বিভাগ")}</option>
              </select>
            </label>
            {layer.source === "hies" && (
              <p className="maps-small">
                {t(
                  "Income and consumption are available by division.",
                  "আয় ও ভোগব্যয়ের তথ্য শুধু বিভাগ অনুযায়ী আছে।",
                )}
              </p>
            )}
            <label>
              {t("Focus on a division", "বিভাগ বেছে নিন")}
              <select
                value={state.division}
                onChange={(e) =>
                  change({ division: e.target.value, region: "", compare: "" })
                }
              >
                <option value="">{t("All Bangladesh", "পুরো বাংলাদেশ")}</option>
                {divisionRegions.map((r) => (
                  <option key={r.id} value={r.key}>
                    {r.name[locale]}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="maps-context-options">
              <legend>{t("Trade & connections", "বাণিজ্য ও যোগাযোগ")}</legend>
              <label className="maps-check">
                <input
                  type="checkbox"
                  checked={state.transport}
                  onChange={(e) => change({ transport: e.target.checked })}
                />
                {t("Major roads & railways", "বড় সড়ক ও রেলপথ")}
              </label>
              <p className="maps-small">
                {t(
                  "Mapped infrastructure, not routes, service frequency or freight volumes.",
                  "সড়ক ও রেলপথের অবস্থান। চলাচলের সময়সূচি বা পণ্য পরিবহনের পরিমাণ নয়।",
                )}
              </p>
              <label className="maps-check">
                <input
                  type="checkbox"
                  checked={state.industry}
                  onChange={(e) => change({ industry: e.target.checked })}
                />
                {t("Operating EPZs", "চালু ইপিজেড")}
              </label>
              <p className="maps-small">
                {t(
                  "8 BEPZA zones. Other industrial zones and parks are not yet covered.",
                  "বেপজার ৮টি অঞ্চল। অন্য শিল্পাঞ্চল ও পার্কের তথ্য এখনো যোগ হয়নি।",
                )}
              </p>
              <label className="maps-check">
                <input
                  type="checkbox"
                  checked={state.ports}
                  onChange={(e) => change({ ports: e.target.checked })}
                />
                {t("Ports & airports", "বন্দর ও বিমানবন্দর")}
              </label>
              <p className="maps-small">
                {t(
                  "3 seaports, 6 selected land ports and 8 airports. Reference locations, not live services.",
                  "৩টি সমুদ্রবন্দর, বাছাই করা ৬টি স্থলবন্দর ও ৮টি বিমানবন্দর। অবস্থান দেখানো হয়েছে, এই মুহূর্তের চলাচল নয়।",
                )}
              </p>
              {(state.transport || state.industry || state.ports) && (
                <button
                  className="maps-text-button"
                  onClick={() =>
                    change({ transport: false, industry: false, ports: false })
                  }
                >
                  {t("Clear context layers", "যোগ করা তথ্যস্তর সরান")}
                </button>
              )}
            </fieldset>
            <details className="maps-refine">
              <summary>{t("Refine the map", "আরও বাছাই করুন")}</summary>
              <label>
                {t("Layer opacity", "তথ্যস্তরের গাঢ়ত্ব")}
                <input
                  type="range"
                  min=".35"
                  max="1"
                  step=".05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                />
              </label>
              <label className="maps-check">
                <input
                  type="checkbox"
                  checked={labels}
                  onChange={(e) => setLabels(e.target.checked)}
                />
                {t("Place names", "অঞ্চলের নাম")}
              </label>
            </details>
            <div className="maps-panel-foot">
              <span aria-live="polite">
                {num(visible.length)}{" "}
                {state.level === "district"
                  ? t("matching districts", "জেলা মিলেছে")
                  : t("matching divisions", "বিভাগ মিলেছে")}
              </span>
              {(state.division || state.minimum > 0) && (
                <button onClick={() => change({ division: "", minimum: 0 })}>
                  {t("Clear", "মুছুন")}
                </button>
              )}
            </div>
          </aside>
        )}
        {detailOpen && (
          <aside
            ref={detailPanel}
            id="maps-details"
            className="maps-detail-panel maps-floating"
            aria-label={t("Regional insights", "অঞ্চলের বিস্তারিত")}
          >
            <div
              className={`maps-panel-heading ${panel === "insights" ? "maps-panel-heading--insights" : ""}`}
            >
              {panel === "sources" && (
                <span>{t("Sources & method", "উৎস ও পদ্ধতি")}</span>
              )}
              {panel === "compare" && (
                <h2>{t("Compare regions", "অঞ্চলের তুলনা")}</h2>
              )}
              <button
                className="maps-icon-button"
                aria-label={t("Close details", "বিস্তারিত বন্ধ করুন")}
                onClick={closeDetails}
              >
                <Icon name="close" />
              </button>
            </div>
            {panel === "sources" ? (
              <div className="maps-source-body">
                <h2>{words(layer.name, locale)}</h2>
                <p>{words(layer.definition, locale)}</p>
                <dl>
                  <dt>{t("Observation", "তথ্যের বছর")}</dt>
                  <dd>{observation(layer, locale)}</dd>
                  <dt>{t("Published", "প্রকাশ")}</dt>
                  <dd>
                    {layer.source === "census"
                      ? t(
                          "November 2023; revised January 2024",
                          "নভেম্বর ২০২৩, সংশোধিত জানুয়ারি ২০২৪",
                        )
                      : layer.source === "hies"
                        ? t("14 December 2023", "১৪ ডিসেম্বর ২০২৩")
                        : layer.source === "ict"
                          ? t(
                              "Final report; publication date not stated. Official register upload: 20 April 2026.",
                              "চূড়ান্ত রিপোর্টে প্রকাশের তারিখ নেই। সরকারি তালিকায় আপলোড: ২০ এপ্রিল ২০২৬।",
                            )
                          : layer.source === "economy"
                            ? t(
                                "Volume I: March 2026; Volume II: June 2026",
                                "প্রথম খণ্ড: মার্চ ২০২৬। দ্বিতীয় খণ্ড: জুন ২০২৬।",
                              )
                            : t("December 2024", "ডিসেম্বর ২০২৪")}
                  </dd>
                  <dt>{t("Checked", "যাচাই")}</dt>
                  <dd>{t("12 September 2026", "১২ সেপ্টেম্বর ২০২৬")}</dd>
                </dl>
                <a href={sourceLink(selected, layer)}>
                  {sourceName} <Icon name="arrow" />
                </a>
                <h3>{t("How to read this map", "কীভাবে মানচিত্র পড়বেন")}</h3>
                <p>
                  {layer.kind === "count"
                    ? t(
                        "Circle area is proportional to the value. The scale is fixed within each geographic level and does not change with filters.",
                        "বৃত্তের ক্ষেত্রফল সংখ্যার অনুপাতে। একই ধরনের অঞ্চলে স্কেল স্থির থাকে, ফিল্টারে বদলায় না।",
                      )
                    : t(
                        "Color bands are fixed, including when you filter or compare regions. Gray means unavailable, never zero.",
                        "ফিল্টার বা তুলনায় রঙের সীমা বদলায় না। ধূসর মানে তথ্য নেই, শূন্য নয়।",
                      )}
                </p>
                {state.transport && (
                  <>
                    <h3>{t("Roads & railways", "সড়ক ও রেলপথ")}</h3>
                    <p>
                      {t(
                        "OpenStreetMap snapshot: 12 September 2026, 08:34 UTC. Motorway/trunk roads and rail tracks, excluding tagged yards, sidings and spurs. Coverage depends on community mapping. A line does not establish an operating service, station access or shipment volume.",
                        "ওপেনস্ট্রিটম্যাপের তথ্য, ১২ সেপ্টেম্বর ২০২৬, ০৮:৩৪ ইউটিসি। বড় সড়ক ও রেলপথ দেখানো হয়েছে। তথ্যের পূর্ণতা স্বেচ্ছাসেবীদের অবদানের ওপর নির্ভর করে। রেখা দেখে চালু ট্রেনসেবা, স্টেশনে প্রবেশ বা পণ্য পরিবহনের পরিমাণ বোঝা যায় না।",
                      )}
                    </p>
                    <a href="https://www.openstreetmap.org/copyright">
                      OpenStreetMap · ODbL 1.0
                    </a>
                  </>
                )}
                {state.industry && (
                  <>
                    <h3>{t("Industry & trade", "শিল্প ও বাণিজ্য")}</h3>
                    <p>
                      {t(
                        "Eight operational EPZs identified by BEPZA, checked 12 September 2026. Positions are OSM industrial-area centres, not entrances or legal boundaries. Dhaka EPZ is represented by its new area. No claim of available plots, capacity or investment suitability.",
                        "বেপজার তথ্য অনুযায়ী চালু আটটি ইপিজেড, যাচাই ১২ সেপ্টেম্বর ২০২৬। OSM থেকে এলাকার আনুমানিক কেন্দ্র নেওয়া হয়েছে, প্রবেশপথ বা আইনি সীমানা নয়। ঢাকা ইপিজেডের নতুন অংশ দেখানো হয়েছে। খালি প্লট বা বিনিয়োগের উপযোগিতা বোঝানো হয়নি।",
                      )}
                    </p>
                    <a href="https://bepza.gov.bd/pages/who-we-are">
                      BEPZA · {t("Operating zones", "চালু অঞ্চল")}
                    </a>
                  </>
                )}
                {state.ports && (
                  <p>
                    {t(
                      "Three seaports, six selected BLPA land ports and eight passenger airports. Authority identities and OSM positions checked 12 September 2026. Older CAAB profiles were cross-checked with 2026 reporting. These are approximate facilities, not entrances, live flight services, cargo capacity or district import/export totals.",
                      "৩টি সমুদ্রবন্দর, বাছাই করা ৬টি স্থলবন্দর ও ৮টি যাত্রীবাহী বিমানবন্দর। কর্তৃপক্ষের তথ্য ও OSM-এর অবস্থান যাচাই ১২ সেপ্টেম্বর ২০২৬। বেবিচকের পুরোনো তথ্য ২০২৬ সালের প্রতিবেদনের সঙ্গে মেলানো হয়েছে। অবস্থান আনুমানিক, ফ্লাইট, কার্গো সক্ষমতা বা জেলার আমদানি-রপ্তানির হিসাব নয়।",
                    )}{" "}
                    <a href="https://blpa.gov.bd/">
                      {t("Land Port Authority", "স্থলবন্দর কর্তৃপক্ষ")}
                    </a>
                    {" · "}
                    <a href="https://ops.caab.gov.bd/group-menu-content/12/105">
                      CAAB
                    </a>
                    {" · "}
                    <a href="https://www.tbsnews.net/economy/aviation/how-many-domestic-airports-does-bangladesh-have-how-many-are-operational-1420191">
                      {t(
                        "2026 airport cross-check",
                        "২০২৬ সালের বিমানবন্দরের তথ্য",
                      )}
                    </a>
                  </p>
                )}
                {layer.source === "ict" && (
                  <p>
                    {t(
                      "Published 95% intervals are shown for districts; division intervals were not available in the imported tables. Small differences may be sampling noise. This private-household survey has a different population and method from Census 2022; the two are not a seamless time series. Estimates are not averaged across districts or converted into counts using older population data.",
                      "জেলার প্রকাশিত ৯৫% আস্থার সীমা দেখানো হয়েছে। ব্যবহৃত টেবিলে বিভাগের সীমা নেই। ছোট পার্থক্য নমুনার অনিশ্চয়তা থেকেও হতে পারে। সাধারণ খানার এই জরিপের আওতা ও পদ্ধতি জনশুমারি ২০২২ থেকে আলাদা। জেলার হার গড় করে বা পুরোনো জনসংখ্যা দিয়ে মানুষের সংখ্যা হিসাব করা হয়নি।",
                    )}
                  </p>
                )}
                {layer.source === "economy" && (
                  <p>
                    {t(
                      "Counts describe economic activity, not a monetary market size. They include public and nonprofit establishments and household activity, not only registered companies. Ordinary household crop farming is outside the census scope. Persons engaged includes working owners and unpaid family workers, not only salaried employees. Industry profiles cover permanent establishments only; they are not regional GDP, exports or imports.",
                      "সংখ্যা দিয়ে অর্থনৈতিক কাজকর্মের পরিসর বোঝানো হচ্ছে, টাকায় বাজারের আকার নয়। সরকারি ও অলাভজনক প্রতিষ্ঠান এবং খানার কাজও আছে, শুধু নিবন্ধিত কোম্পানি নয়। সাধারণ খানার ফসল চাষ এই শুমারির আওতার বাইরে। নিয়োজিত ব্যক্তিদের মধ্যে কর্মরত মালিক ও বিনা বেতনে কাজ করা পরিবারের সদস্যও আছেন। খাতের তথ্যে শুধু স্থায়ী প্রতিষ্ঠান আছে, আঞ্চলিক জিডিপি বা আমদানি-রপ্তানি নয়।",
                    )}
                  </p>
                )}
                {layer.source === "poverty" && (
                  <p>
                    {t(
                      "Approximate 95% intervals: estimate ± 1.96 × reported standard error, clipped to 0–100%. Overlapping intervals caution against ranking.",
                      "প্রায় ৯৫% আস্থার সীমা: প্রাক্কলন ± প্রমিত ত্রুটির ১.৯৬ গুণ (০–১০০%-এর মধ্যে)। সীমাগুলো মিলে গেলে র‍্যাঙ্কিংয়ে সতর্কতা দরকার।",
                    )}
                  </p>
                )}
                <h3>{t("Boundaries and reuse", "সীমারেখা ও পুনর্ব্যবহার")}</h3>
                <p>
                  {t(
                    "BBS/OCHA boundaries via geoBoundaries, 2020, CC BY 3.0 IGO; divisions assembled from districts. Simplified for regional comparison. Names reconciled with the 2022 reports.",
                    "geoBoundaries থেকে বিবিএস/OCHA-এর ২০২০ সালের সীমারেখা, CC BY 3.0 IGO। জেলা মিলিয়ে বিভাগ তৈরি। আঞ্চলিক তুলনার জন্য সরল করা হয়েছে। নামগুলো ২০২২ সালের রিপোর্টের সঙ্গে মেলানো।",
                  )}
                </p>
                <p>
                  {t(
                    "BBS retains report copyright. Census and HIES data permit publication with source acknowledgement; commercial reproduction of the publications is restricted. Poverty-report reuse is limited to educational or non-commercial purposes without additional permission.",
                    "রিপোর্টের কপিরাইট বিবিএসের। জনশুমারি ও HIES-এর তথ্য উৎস উল্লেখ করে প্রকাশ করা যায়, তবে রিপোর্টের বাণিজ্যিক পুনর্মুদ্রণে বিধিনিষেধ আছে। দারিদ্র্য রিপোর্টের তথ্য অতিরিক্ত অনুমতি ছাড়া শুধু শিক্ষা বা অ-বাণিজ্যিক কাজে ব্যবহার করা যায়।",
                  )}
                </p>
                <p>
                  <a href="https://openfreemap.org/">OpenFreeMap</a> ·{" "}
                  <a href="https://www.openstreetmap.org/copyright">
                    OpenStreetMap
                  </a>{" "}
                  · <a href="https://www.geoboundaries.org/">geoBoundaries</a>
                </p>
                <button onClick={() => setPanel("insights")}>
                  {t("Back to insights", "বিস্তারিত তথ্যে ফিরুন")}
                </button>
              </div>
            ) : panel === "compare" ? (
              <div className="maps-comparison">
                <p className="maps-intro">
                  {t(
                    "Compare places for the same customer group and service. A higher value is not automatically a better fit.",
                    "একই ধরনের কাস্টমার ও সেবার কথা ভেবে অঞ্চল তুলনা করুন। কোনো একটি সংখ্যায় এগিয়ে থাকলেই সেই অঞ্চল আপনার ব্যবসার জন্য উপযুক্ত হবে, এমন নয়।",
                  )}
                </p>
                {selected && compared && (
                  <>
                    <table className="maps-comparison-matrix">
                      <caption className="sr-only">
                        {t("Regional comparison", "অঞ্চলের তুলনা")}
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">{t("Measure", "পরিমাপ")}</th>
                          <th scope="col">{selected.name[locale]}</th>
                          <th scope="col">{compared.name[locale]}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonRows(
                          regions,
                          [selected, compared],
                          state.layer,
                        ).map(({ metric, cells }) => (
                          <tr key={metric.id}>
                            <th scope="row">
                              {words(metric.name, locale)}
                              <small>
                                {words(metric.unit, locale)} ·{" "}
                                {observation(metric, locale)}
                              </small>
                              {cells.some((c) => c.context) && (
                                <small className="maps-context-label">
                                  {t("Division context", "বিভাগের প্রেক্ষাপট")}
                                </small>
                              )}
                            </th>
                            {cells.map((cell, i) => (
                              <td key={i}>
                                {cell.region && cell.value !== null ? (
                                  <a
                                    href={sourceLink(cell.region, metric)}
                                    aria-label={`${cell.region.name[locale]} · ${words(metric.name, locale)} · ${t("source", "উৎস")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {formatValue(cell.value, metric, locale)}
                                  </a>
                                ) : (
                                  "—"
                                )}
                                {metric.id === "internet" && cell.region && (
                                  <SurveyInterval
                                    region={cell.region}
                                    locale={locale}
                                  />
                                )}
                                {cell.context && (
                                  <small>
                                    {cell.region?.name[locale]}{" "}
                                    {t("division", "বিভাগ")}
                                  </small>
                                )}
                                {metric.id === "poverty" && cell.region && (
                                  <small>
                                    {interval(
                                      cell.region.povertyRate,
                                      cell.region.povertySE,
                                    )
                                      ?.map((n) =>
                                        formatValue(n, metric, locale),
                                      )
                                      .join("–")}
                                    <br />
                                    {t(
                                      "approx. 95% interval",
                                      "প্রায় ৯৫% আস্থার সীমা",
                                    )}
                                  </small>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="maps-small">
                      {t(
                        "Select a value for its source. Division budgets describe the wider region, not a district estimate. — means unavailable.",
                        "উৎস দেখতে সংখ্যায় চাপ দিন। বিভাগের বাজেট পুরো অঞ্চলের চিত্র, জেলার আলাদা হিসাব নয়। '—' মানে তথ্য নেই।",
                      )}
                    </p>
                    {state.layer === "poverty" && (
                      <p className="maps-small">
                        {t(
                          "Overlapping intervals do not establish a reliable ordering.",
                          "আস্থার সীমা মিলে গেলে কোনটি বেশি, তা নিশ্চিত বলা যায় না।",
                        )}
                      </p>
                    )}
                    <details className="maps-measure-notes">
                      <summary>
                        {t("Before choosing a place", "অঞ্চল বেছে নেওয়ার আগে")}
                      </summary>
                      <p>{words(layer.question, locale)}</p>
                      <p>
                        {t(
                          "Check how your intended customers solve the problem today, what they pay, and what reaching and serving them would cost.",
                          "আপনার সম্ভাব্য কাস্টমাররা এখন সমস্যাটি কীভাবে সমাধান করছেন, কত খরচ করছেন আর তাঁদের কাছে পৌঁছাতে ও সার্ভিস দিতে আপনার কত খরচ পড়বে, তা আগে জেনে নিন।",
                        )}
                      </p>
                      {interviewGuideLink}
                      <h3>
                        {t("What these measures mean", "পরিমাপগুলো কী বোঝায়")}
                      </h3>
                      {comparisonRows(
                        regions,
                        [selected, compared],
                        state.layer,
                      ).map(({ metric }) => (
                        <p key={metric.id}>
                          <strong>{words(metric.name, locale)}:</strong>{" "}
                          {words(metric.definition, locale)}
                        </p>
                      ))}
                    </details>
                  </>
                )}
                <details
                  className="maps-compare-selectors"
                  open={!selected || !compared}
                >
                  <summary>
                    {t("Choose or change regions", "অঞ্চল বেছে নিন বা বদলান")}
                  </summary>
                  <label>
                    {t("First region", "প্রথম অঞ্চল")}
                    <select
                      value={state.region}
                      onChange={(e) =>
                        change({ region: e.target.value, compare: "" })
                      }
                    >
                      <option value="">
                        {t("Choose a region", "অঞ্চল বেছে নিন")}
                      </option>
                      {regions
                        .filter((r) => r.level === state.level)
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name[locale]}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    {t("Second region", "দ্বিতীয় অঞ্চল")}
                    <select
                      disabled={!selected}
                      value={state.compare}
                      onChange={(e) => change({ compare: e.target.value })}
                    >
                      <option value="">
                        {t("Choose a region", "অঞ্চল বেছে নিন")}
                      </option>
                      {regions
                        .filter(
                          (r) =>
                            r.level === state.level && r.id !== state.region,
                        )
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name[locale]}
                          </option>
                        ))}
                    </select>
                  </label>
                </details>
                <button
                  onClick={() => {
                    change({ compare: "" });
                    setPanel("insights");
                  }}
                >
                  {t("Back to insights", "বিস্তারিত তথ্যে ফিরুন")}
                </button>
              </div>
            ) : (
              <>
                <h1 className={!selected ? "maps-national-title" : undefined}>
                  {selected
                    ? selected.name[locale]
                    : t("Bangladesh", "বাংলাদেশ")}
                </h1>
                <p className="maps-intro">
                  {selected
                    ? words(layer.definition, locale)
                    : t(
                        "Compare places for a business idea, then choose what to investigate locally.",
                        "ব্যবসার আইডিয়া নিয়ে অঞ্চলগুলো তুলনা করুন, তারপর ঠিক করুন সেখানে কী কী খোঁজ নেবেন।",
                      )}
                </p>
                {selected ? (
                  <>
                    <div className="maps-primary-value">
                      <span>{words(layer.name, locale)}</span>
                      <strong>{value(selected)}</strong>
                      <small>
                        {words(layer.unit, locale)} ·{" "}
                        {observation(layer, locale)}
                      </small>
                    </div>
                    {state.layer === "poverty" && (
                      <p className="maps-small">
                        {t("Approx. 95% interval: ", "প্রায় ৯৫% আস্থার সীমা: ")}
                        {interval(selected.povertyRate, selected.povertySE)
                          ?.map((n) => formatValue(n, layer, locale))
                          .join(" – ")}
                      </p>
                    )}
                    {state.layer === "internet" && (
                      <SurveyInterval region={selected} locale={locale} />
                    )}
                    {layer.kind === "rate" && (
                      <p className="maps-benchmark">
                        {t("Bangladesh: ", "বাংলাদেশ: ")}
                        <strong>
                          {formatValue(layer.national, layer, locale)}
                        </strong>
                      </p>
                    )}
                    <dl className="maps-facts">
                      {(
                        [
                          "population",
                          "density",
                          "literacy",
                          "internet",
                        ] as LayerId[]
                      )
                        .filter((id) => id !== state.layer)
                        .map((id) => (
                          <div key={id}>
                            <dt>
                              <a
                                href={sourceLink(selected, layerById(id))}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {words(layerById(id).name, locale)}
                              </a>
                            </dt>
                            <dd>
                              {value(selected, id)}
                              <small>
                                {words(layerById(id).unit, locale)} ·{" "}
                                {observation(layerById(id), locale)}
                              </small>
                              {id === "internet" && (
                                <SurveyInterval
                                  region={selected}
                                  locale={locale}
                                />
                              )}
                            </dd>
                          </div>
                        ))}
                    </dl>
                    <BusinessProfile region={selected} locale={locale} />
                    <button
                      className="maps-wide-button"
                      onClick={() => toggleDetails("compare")}
                    >
                      <Icon name="compare" />
                      {t(
                        "Compare with another region",
                        "অন্য অঞ্চলের সঙ্গে তুলনা",
                      )}
                    </button>
                    <button
                      className="maps-text-button"
                      onClick={() => {
                        change({ region: "", compare: "" });
                        setReset((r) => r + 1);
                      }}
                    >
                      {t("Back to Bangladesh", "পুরো বাংলাদেশে ফিরুন")}
                      <Icon name="arrow" />
                    </button>
                  </>
                ) : (
                  <>
                    <p className="maps-overview-measure">
                      {words(layer.name, locale)} · {observation(layer, locale)}
                    </p>
                    <div className="maps-overview-numbers">
                      <div>
                        <strong>
                          {formatValue(layer.national, layer, locale, true)}
                        </strong>
                        <span>{words(layer.unit, locale)}</span>
                      </div>
                      <div>
                        <strong>
                          {num(state.level === "district" ? 64 : 8)}
                        </strong>
                        <span>
                          {state.level === "district"
                            ? t("Districts covered", "জেলার তথ্য")
                            : t("Divisions covered", "বিভাগের তথ্য")}
                        </span>
                      </div>
                    </div>
                    <p className="maps-small">
                      {t("Bangladesh", "বাংলাদেশ")} · {sourceName}
                    </p>
                    {fieldQuestion}
                    <div className="maps-rank-title">
                      <h3>{words(layer.name, locale)}</h3>
                      <span>{observation(layer, locale)}</span>
                    </div>
                    <p className="maps-small">
                      {t(
                        state.layer === "poverty"
                          ? "Higher estimates with approximate 95% intervals. Overlap cautions against ranking."
                          : state.layer === "internet"
                            ? "Higher survey estimates with published 95% intervals where available. Overlap cautions against ranking. Division intervals are unavailable."
                            : "Highest values in the current selection",
                        state.layer === "poverty"
                          ? "বেশি প্রাক্কলনগুলোর সঙ্গে প্রায় ৯৫% আস্থার সীমা। সীমা মিলে গেলে র‍্যাঙ্কিং নির্ভরযোগ্য নয়।"
                          : state.layer === "internet"
                            ? "বেশি প্রাক্কলনগুলোর সঙ্গে প্রকাশিত ৯৫% আস্থার সীমা দেখুন। সীমা মিলে গেলে র‍্যাঙ্কিং নির্ভরযোগ্য নয়। বিভাগের সীমা নেই।"
                            : "বর্তমান বাছাইয়ে সর্বোচ্চ মান",
                      )}
                    </p>
                    <div className="maps-ranked">
                      {top.map((r, i) => (
                        <button key={r.id} onClick={() => choose(r.id)}>
                          <span>
                            {state.layer === "poverty" ||
                            state.layer === "internet"
                              ? ""
                              : num(i + 1)}
                          </span>
                          <span>
                            {r.name[locale]}
                            <i
                              style={{
                                width: `${(100 * metricValue(r, state.layer)!) / (metricValue(top[0], state.layer) || 1)}%`,
                              }}
                            />
                          </span>
                          <strong>
                            {formatValue(
                              metricValue(r, state.layer),
                              layer,
                              locale,
                              true,
                            )}
                            {state.layer === "poverty" && (
                              <small>
                                {interval(r.povertyRate, r.povertySE)
                                  ?.map((n) => formatValue(n, layer, locale))
                                  .join("–")}
                              </small>
                            )}
                            {state.layer === "internet" && (
                              <small>
                                {internetInterval(r)
                                  ?.map((n) => formatValue(n, layer, locale))
                                  .join("–") ||
                                  t("Interval unavailable", "আস্থার সীমা নেই")}
                              </small>
                            )}
                          </strong>
                        </button>
                      ))}
                    </div>
                    {!visible.length && (
                      <p role="status">
                        {t(
                          "No regions match. Clear the filters to explore again.",
                          "কোনো অঞ্চল মেলেনি। ফিল্টার মুছে আবার দেখুন।",
                        )}
                      </p>
                    )}
                  </>
                )}
                {selected && fieldQuestion}
                {(state.industry || state.ports) && (
                  <details className="maps-industry-list">
                    <summary>
                      {t(
                        "Ports, airports & zones",
                        "বন্দর, বিমানবন্দর ও শিল্পাঞ্চল",
                      )}{" "}
                      ·{" "}
                      {num(
                        matchingAnchors(state).filter(
                          (site) =>
                            !selected ||
                            (selected.level === "district"
                              ? site.district === selected.id
                              : site.division === selected.key),
                        ).length,
                      )}
                    </summary>
                    <p className="maps-small">
                      {t(
                        "Authority sources checked 12 September 2026. Approximate OSM facility locations.",
                        "কর্তৃপক্ষের তথ্য যাচাই ১২ সেপ্টেম্বর ২০২৬। অবস্থান OSM-এর আনুমানিক হিসাব।",
                      )}
                    </p>
                    {matchingAnchors(state)
                      .filter(
                        (site) =>
                          !selected ||
                          (selected.level === "district"
                            ? site.district === selected.id
                            : site.division === selected.key),
                      )
                      .map((site) => (
                        <a
                          key={site.id}
                          href={site.source}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span>
                            {site.name[locale]}
                            <small>
                              {siteKind(site.kind, locale)} ·{" "}
                              {site.location[locale]}
                            </small>
                            {"role" in site && (
                              <small>
                                {site.role[locale]} {site.sourceNote[locale]}
                              </small>
                            )}
                          </span>
                          <Icon name="arrow" />
                        </a>
                      ))}
                    <p className="maps-small">
                      {t(
                        "Selected ports, airports and the eight BEPZA EPZs only. An empty list does not mean no local activity.",
                        "বাছাই করা বন্দর, বিমানবন্দর ও বেপজার আটটি ইপিজেডের তথ্য। তালিকা খালি মানে এখানে কাজকর্ম নেই, এমন নয়।",
                      )}
                    </p>
                  </details>
                )}
                <button
                  className="maps-source-link"
                  onClick={() => toggleDetails("sources")}
                >
                  <Icon name="info" />
                  {sourceName}
                  <Icon name="arrow" />
                </button>
              </>
            )}
          </aside>
        )}
        {state.view === "map" && (
          <section
            className="maps-legend maps-floating"
            aria-label={t("Map legend", "মানচিত্রের সংকেত")}
          >
            <div>
              <h2>{words(layer.name, locale)}</h2>
              <button
                className="maps-icon-button"
                aria-label={t(
                  "Layer source and definition",
                  "তথ্যের উৎস ও সংজ্ঞা",
                )}
                onClick={() => toggleDetails("sources")}
              >
                <Icon name="info" />
              </button>
            </div>
            <p>
              {words(layer.unit, locale)} · {observation(layer, locale)} ·{" "}
              {state.level === "district"
                ? t("Districts", "জেলা")
                : t("Divisions", "বিভাগ")}
            </p>
            <div className="maps-legend-body" id="maps-legend-body">
              {layer.kind === "rate" ? (
                <>
                  <div className="maps-ramp">
                    {layer.colors.map((c, i) => (
                      <span
                        key={c}
                        style={{ background: c }}
                        title={
                          i === 0
                            ? `< ${num(layer.breaks[0])}`
                            : i === layer.breaks.length
                              ? `${num(layer.breaks[i - 1])}+`
                              : `${num(layer.breaks[i - 1])}–<${num(layer.breaks[i])}`
                        }
                      />
                    ))}
                  </div>
                  <div className="maps-ticks">
                    <span>{num(0)}</span>
                    {layer.breaks.map((b) => (
                      <span key={b}>{num(b)}</span>
                    ))}
                    <span>+</span>
                  </div>
                </>
              ) : (
                <div className="maps-circle-legend">
                  {[0.0625, 0.25, 1].map((f) => {
                    const max = Math.max(
                      ...regions
                        .filter((r) => r.level === state.level)
                        .map((r) => metricValue(r, state.layer) || 0),
                    );
                    return (
                      <div key={f}>
                        <svg width="78" height="76" viewBox="0 0 78 76">
                          <circle
                            cx="39"
                            cy="38"
                            r={countRadius(max * f, max)}
                            fill={symbolColors(layer).fill}
                            stroke={symbolColors(layer).stroke}
                          />
                        </svg>
                        <span>{formatValue(max * f, layer, locale, true)}</span>
                      </div>
                    );
                  })}
                  <p>
                    {t("Circle area = value", "বৃত্তের ক্ষেত্রফল = পরিমাণ")}
                  </p>
                </div>
              )}
              {(state.transport || state.industry || state.ports) && (
                <div className="maps-context-key">
                  {state.transport && (
                    <div className="maps-transport-key">
                      <span>
                        <i />
                        {t("Major road", "বড় সড়ক")}
                      </span>
                      <span>
                        <i className="maps-rail-key" />
                        {t("Railway", "রেলপথ")}
                      </span>
                    </div>
                  )}
                  {(state.industry || state.ports) && (
                    <div className="maps-place-key">
                      {state.industry && (
                        <span>
                          <i>
                            <Icon name="factory" />
                          </i>
                          {t("8 EPZs", "৮টি ইপিজেড")}
                        </span>
                      )}
                      {state.ports && (
                        <>
                          <span>
                            <i className="maps-port-swatch">
                              <Icon name="anchor" />
                            </i>
                            {t("3 seaports", "৩টি সমুদ্রবন্দর")}
                          </span>
                          <span>
                            <i className="maps-port-swatch">
                              <Icon name="gate" />
                            </i>
                            {t(
                              "6 selected land ports",
                              "বাছাই করা ৬টি স্থলবন্দর",
                            )}
                          </span>
                          <span>
                            <i className="maps-port-swatch">
                              <Icon name="plane" />
                            </i>
                            {t("8 airports", "৮টি বিমানবন্দর")}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  <p>
                    {t(
                      "Context snapshot · 12 Sep 2026",
                      "অবস্থান ও সংযোগের তথ্য · ১২ সেপ্টেম্বর ২০২৬",
                    )}
                  </p>
                </div>
              )}
            </div>
            <small>
              {sourceName}
              {layer.kind === "rate"
                ? " · " + t("Fixed bands", "স্থির সীমা")
                : ""}
            </small>
          </section>
        )}
        <section
          id="map-data"
          tabIndex={-1}
          className={
            state.view === "table"
              ? "maps-data-panel maps-floating"
              : "maps-text-alternative"
          }
          aria-label={t("Regional data table", "অঞ্চলের তথ্যের টেবিল")}
        >
          <h2>{words(layer.name, locale)}</h2>
          <p>{words(layer.definition, locale)}</p>
          {table(visible)}
          {!visible.length && (
            <p>{t("No matching regions.", "কোনো অঞ্চল মেলেনি।")}</p>
          )}
          <p>
            {sourceName} · {observation(layer, locale)}
          </p>
        </section>
        {state.view === "map" && !detailOpen && (
          <button
            className="maps-mobile-insights"
            ref={mobileDetailTrigger}
            onClick={() => toggleDetails("insights")}
          >
            {selected?.name[locale] ||
              t("Explore Bangladesh", "বাংলাদেশ ঘুরে দেখুন")}
            <Icon name="arrow" />
          </button>
        )}
        {share && (
          <div className="maps-share-status" role="status">
            {share}
          </div>
        )}
      </main>
    </div>
  );
}
