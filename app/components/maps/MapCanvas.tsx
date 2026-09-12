"use client";
import { useEffect, useRef, useState } from "react";
import {
  Map,
  Marker,
  Popup,
  ScaleControl,
  setWorkerUrl,
  type GeoJSONSource,
  type StyleSpecification,
} from "maplibre-gl";
import type { FeatureCollection, Geometry } from "geojson";
import {
  matchingRegions,
  metricValue,
  metricColor,
  formatValue,
  layerById,
  symbolColors,
  type ExplorerState,
} from "./layers";
import type { Region, Locale } from "./types";
import { countRadius, nationalOutline } from "./cartography";
import { matchingAnchors, groupSites, siteKind } from "./industry";
import "maplibre-gl/dist/maplibre-gl.css";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
setWorkerUrl(`${basePath}/maps/worker/maplibre-gl-worker.mjs`);
type Shapes = FeatureCollection<
  Geometry,
  { id: string; [key: string]: unknown }
>;
type Props = {
  regions: Region[];
  locale: Locale;
  state: ExplorerState;
  onSelect: (id: string) => void;
  reset: number;
  detailOpen: boolean;
  layersOpen: boolean;
  labels: boolean;
  opacity: number;
};
const minZoom = 3.5;
const maxZoom = 13;
const country: [[number, number], [number, number]] = [
  [88, 20.65],
  [92.75, 26.68],
];
function extent(
  features: Shapes["features"],
): [[number, number], [number, number]] {
  const all: number[][] = [];
  const visit = (a: unknown) => {
    if (Array.isArray(a)) {
      if (typeof a[0] === "number") all.push(a as number[]);
      else a.forEach(visit);
    }
  };
  features.forEach((f) => {
    if ("coordinates" in f.geometry) visit(f.geometry.coordinates);
  });
  return [
    [Math.min(...all.map((c) => c[0])), Math.min(...all.map((c) => c[1]))],
    [Math.max(...all.map((c) => c[0])), Math.max(...all.map((c) => c[1]))],
  ];
}
export default function MapCanvas(props: Props) {
  const host = useRef<HTMLDivElement>(null),
    map = useRef<Map | null>(null),
    shapes = useRef<Shapes | null>(null),
    current = useRef(props),
    hoverPopup = useRef<Popup | null>(null),
    sitePopup = useRef<Popup | null>(null),
    markers = useRef<Marker[]>([]),
    lastFitKey = useRef("");
  current.current = props;
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
      "loading",
    ),
    [retry, setRetry] = useState(0),
    [baseError, setBaseError] = useState(false),
    [transportStatus, setTransportStatus] = useState<
      "loading" | "ready" | "error"
    >("loading"),
    [transportRetry, setTransportRetry] = useState(0),
    [zoom, setZoom] = useState(6),
    [constrainedMinZoom, setConstrainedMinZoom] = useState(minZoom);
  const t = (a: string, b: string) => (props.locale === "en" ? a : b);
  const cameraKey = () => {
    const { state, reset } = current.current;
    return [
      state.region,
      state.compare,
      state.division,
      state.level,
      reset,
    ].join("|");
  };
  const targetBounds = () => {
    const { state } = current.current;
    const ids = [state.region, state.compare].filter(Boolean);
    if (!ids.length && state.division) ids.push(`division-${state.division}`);
    const features = shapes.current?.features.filter((f) =>
      ids.includes(f.properties.id),
    );
    return features?.length ? extent(features) : country;
  };
  const padding = (national = false) => {
    const bounds = host.current!.getBoundingClientRect();
    const workspace = host.current!.closest(".maps-workspace")!;
    const rect = (selector: string, includeHidden = false) => {
      const element = workspace.querySelector(selector);
      if (
        !element ||
        (!includeHidden && getComputedStyle(element).visibility === "hidden")
      )
        return;
      const box = element.getBoundingClientRect();
      return box.height && box.width ? box : undefined;
    };
    const toolbar = rect(".maps-overlays-toolbar"),
      detail = rect(".maps-detail-panel"),
      layers = rect(".maps-layer-panel"),
      // Sheets hide the legend visually, but its reserved space remains the
      // stable national frame. Opening a sheet must not shrink Bangladesh.
      legend = rect(".maps-legend", true);
    const mobile = bounds.width < 760;
    const inset = {
      top: mobile && toolbar ? toolbar.bottom - bounds.top + 18 : 24,
      left: 24,
      right: 24,
      bottom: 32,
    };
    if (mobile) {
      for (const box of [legend, ...(!national ? [detail] : [])])
        if (box)
          inset.bottom = Math.max(inset.bottom, bounds.bottom - box.top + 18);
    } else if (!national) {
      // Selection is an explicit navigation action; floating chrome alone never
      // changes the camera. Country framing uses the full desktop workspace.
      if (detail) inset.right = bounds.right - detail.left + 24;
      if (layers) inset.left = layers.right - bounds.left + 24;
    }
    return inset;
  };
  const fit = (bounds = country) =>
    map.current?.fitBounds(bounds, {
      padding: padding(bounds === country),
      maxZoom: 9,
      duration: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : 550,
    });
  function labels() {
    const m = map.current,
      p = current.current;
    if (!m || !shapes.current) return;
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
    if (!p.labels) return;
    const boxes: number[][] = [];
    const visible = matchingRegions(p.regions, { ...p.state, minimum: 0 }).sort(
      (a, b) =>
        Number(b.id === p.state.region) - Number(a.id === p.state.region) ||
        (metricValue(b, "population") ?? 0) -
          (metricValue(a, "population") ?? 0),
    );
    for (const r of visible) {
      const xy = m.project(r.point as [number, number]),
        text = r.name[p.locale],
        w = Math.max(48, text.length * 6.6),
        box = [xy.x - w / 2, xy.y - 10, xy.x + w / 2, xy.y + 12];
      if (
        boxes.some(
          (b) =>
            box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1],
        )
      )
        continue;
      boxes.push(box);
      const el = document.createElement("div");
      el.className = "maps-place-label";
      el.textContent = text;
      el.setAttribute("aria-hidden", "true");
      markers.current.push(
        new Marker({ element: el })
          .setLngLat(r.point as [number, number])
          .addTo(m),
      );
    }
  }
  useEffect(() => {
    let gone = false;
    let filesLoaded = false;
    const controller = new AbortController();
    let observer: ResizeObserver | undefined, popup: Popup | undefined;
    setStatus("loading");
    setBaseError(false);
    const timeout = setTimeout(() => {
      if (!filesLoaded) controller.abort();
      if (!gone) setStatus("error");
    }, 20000);
    async function start() {
      try {
        const [boundary, base] = await Promise.all([
          fetch(`${basePath}/maps/bangladesh-2020.geojson`, {
            signal: controller.signal,
          }).then((r) => {
            if (!r.ok) throw Error();
            return r.json();
          }),
          fetch(`${basePath}/maps/basemap.json`, { signal: controller.signal })
            .then((r) => r.json())
            .catch(() => null),
        ]);
        filesLoaded = true;
        if (gone || !host.current) return;
        if (boundary.features?.length !== 73) throw Error();
        shapes.current = boundary;
        const m = new Map({
          container: host.current,
          style: {
            version: 8,
            glyphs: base?.glyphs,
            sources: {},
            layers: [
              {
                id: "background",
                type: "background",
                paint: { "background-color": "#f4f3ed" },
              },
            ],
          },
          bounds: targetBounds(),
          fitBoundsOptions: {
            padding: padding(targetBounds() === country),
            maxZoom: 9,
          },
          minZoom,
          maxZoom,
          maxBounds: [
            [70, 5],
            [112, 40],
          ],
          attributionControl: {
            compact: true,
            customAttribution:
              '<a href="https://www.geoboundaries.org/">BBS/OCHA · geoBoundaries</a> · <a href="https://creativecommons.org/licenses/by/3.0/igo/">CC BY 3.0 IGO</a>',
          },
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          renderWorldCopies: false,
        });
        map.current = m;
        lastFitKey.current = cameraKey();
        // MapLibre 6 starts compact attribution expanded. Collapse only its
        // initial presentation; leave native disclosure and source updates intact.
        const attribution = m
          .getContainer()
          .querySelector<HTMLDetailsElement>(".maplibregl-ctrl-attrib");
        attribution?.classList.remove("maplibregl-compact-show");
        attribution?.removeAttribute("open");
        m.on("dragstart", () => {
          attribution?.classList.remove("maplibregl-compact-show");
          attribution?.removeAttribute("open");
        });
        m.touchZoomRotate.disableRotation();
        m.addControl(new ScaleControl({ maxWidth: 90 }), "bottom-left");
        popup = new Popup({
          closeButton: false,
          closeOnClick: true,
          offset: 14,
        });
        hoverPopup.current = popup;
        m.on("error", (event) => {
          if ("sourceId" in event && event.sourceId === "transport") {
            if (!gone) setTransportStatus("error");
            return;
          }
          if (!gone) setBaseError(true);
        });
        m.on("load", () => {
          if (gone) return;
          m.addSource("regions", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
          m.addSource("country", {
            type: "geojson",
            data: nationalOutline(
              boundary.features.find(
                (f: Shapes["features"][number]) =>
                  f.properties.id === "country-bangladesh",
              ).geometry,
            ),
          });
          m.addSource("symbols", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
          m.addLayer({
            id: "regions-fill",
            type: "fill",
            source: "regions",
            paint: {
              "fill-color": ["get", "color"],
              "fill-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                5,
                ["get", "opacity"],
                10,
                ["*", ["get", "opacity"], 0.6],
                14,
                ["*", ["get", "opacity"], 0.25],
              ],
            },
          });
          m.addLayer({
            id: "regions-line",
            type: "line",
            source: "regions",
            paint: {
              "line-color": "#fdfef8",
              "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                5,
                0.6,
                10,
                1.4,
              ],
              "line-opacity": 0.9,
            },
          });
          // A dissolved perimeter distinguishes Bangladesh at country scale. Fade it
          // as detailed basemap borders take over; the source is a 2020 statistical boundary.
          m.addLayer({
            id: "country-outline",
            type: "line",
            source: "country",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#6b8277",
              "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                5,
                ["case", ["get", "minor"], 0.35, 1.1],
                7,
                ["case", ["get", "minor"], 0.55, 1.4],
                10,
                1,
              ],
              "line-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7,
                ["case", ["get", "minor"], 0.35, 0.7],
                10,
                0.25,
              ],
            },
          });
          m.addLayer({
            id: "regions-selected",
            type: "line",
            source: "regions",
            filter: ["==", ["get", "selected"], true],
            paint: { "line-color": "#173e36", "line-width": 2.8 },
          });
          m.addLayer({
            id: "regions-compare",
            type: "line",
            source: "regions",
            filter: ["==", ["get", "compare"], true],
            paint: {
              "line-color": "#173e36",
              "line-width": 2.5,
              "line-dasharray": [3, 2],
            },
          });
          m.addLayer({
            id: "region-circles",
            type: "circle",
            source: "symbols",
            paint: {
              "circle-radius": ["get", "radius"],
              "circle-color": ["get", "fill"],
              "circle-opacity": 0.52,
              "circle-stroke-color": ["get", "stroke"],
              "circle-stroke-width": 1.2,
            },
          });
          // Local analytical geometry is usable before the optional contextual tile service.
          clearTimeout(timeout);
          setZoom(m.getZoom());
          setConstrainedMinZoom(m.getMinZoom(true));
          setStatus("ready");
          labels();
          if (base) {
            for (const [id, source] of Object.entries(
              (base as StyleSpecification).sources,
            ))
              m.addSource(id, source);
            let insertion = "regions-fill";
            for (const layer of (base as StyleSpecification).layers) {
              // Water, roads and labels sit above analytical fills, as in the preferred map.
              if (layer.id === "water") insertion = "regions-line";
              if (
                layer.type === "background" ||
                layer.type === "raster" ||
                (layer.type === "symbol" && layer.layout?.["icon-image"])
              )
                continue;
              const next = { ...layer };
              if (next.type === "symbol")
                next.minzoom = Math.max(9, next.minzoom || 0);
              m.addLayer(next, insertion);
            }
          } else setBaseError(true);
        });
        m.on("click", "regions-fill", (e) => {
          const id = e.features?.[0]?.properties?.id;
          if (typeof id === "string") current.current.onSelect(id);
        });
        m.on("mousemove", "regions-fill", (e) => {
          if (m.isMoving() || sitePopup.current?.isOpen()) return;
          m.getCanvas().style.cursor = "pointer";
          const p = current.current;
          const r = p.regions.find(
            (r) => r.id === e.features?.[0]?.properties?.id,
          );
          if (!r) return;
          const el = document.createElement("div");
          el.textContent =
            r.name[p.locale] +
            " · " +
            formatValue(
              metricValue(r, p.state.layer),
              layerById(p.state.layer),
              p.locale,
            );
          popup?.setLngLat(e.lngLat).setDOMContent(el).addTo(m);
        });
        m.on("mouseleave", "regions-fill", () => {
          m.getCanvas().style.cursor = "";
          popup?.remove();
        });
        m.on("movestart", () => popup?.remove());
        m.on("moveend", () => {
          setZoom(m.getZoom());
          setConstrainedMinZoom(m.getMinZoom(true));
          labels();
        });
        let width = host.current.clientWidth,
          height = host.current.clientHeight;
        observer = new ResizeObserver(() => {
          if (!host.current) return;
          const nextWidth = host.current.clientWidth,
            nextHeight = host.current.clientHeight;
          if (nextWidth === width && nextHeight === height) return;
          width = nextWidth;
          height = nextHeight;
          m.resize();
        });
        observer.observe(host.current);
      } catch {
        if (!gone) setStatus("error");
        clearTimeout(timeout);
      }
    }
    // Avoid starting GPU/worker work in React Strict Mode's discarded setup pass.
    const startFrame = requestAnimationFrame(() => void start());
    return () => {
      cancelAnimationFrame(startFrame);
      gone = true;
      clearTimeout(timeout);
      if (!filesLoaded) controller.abort();
      observer?.disconnect();
      popup?.remove();
      hoverPopup.current = null;
      markers.current.forEach((x) => x.remove());
      map.current?.remove();
      map.current = null;
    };
  }, [retry]);
  useEffect(() => {
    const m = map.current;
    if (status !== "ready" || !m) return;
    const ids = ["transport-road", "transport-rail"];
    if (m.getSource("transport")) {
      ids.forEach((id) =>
        m.setLayoutProperty(
          id,
          "visibility",
          props.state.transport ? "visible" : "none",
        ),
      );
      setTransportStatus("ready");
      return;
    }
    if (!props.state.transport) return;
    const controller = new AbortController();
    let gone = false;
    setTransportStatus("loading");
    const timeout = setTimeout(() => controller.abort(), 20000);
    fetch(`${basePath}/maps/transport.geojson`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Transport unavailable");
        const data = await response.json();
        if (!Array.isArray(data.features) || !data.features.length)
          throw new Error("Empty transport snapshot");
        if (gone) return;
        m.addSource("transport", { type: "geojson", data });
        for (const kind of ["road", "rail"] as const) {
          m.addLayer(
            {
              id: `transport-${kind}`,
              type: "line",
              source: "transport",
              filter: ["==", ["get", "kind"], kind],
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": kind === "road" ? "#b27c35" : "#566b80",
                "line-width": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  5,
                  0.8,
                  9,
                  2,
                  13,
                  3.5,
                ],
                "line-opacity": 0.85,
                ...(kind === "rail" ? { "line-dasharray": [3, 2] } : {}),
              },
            },
            "regions-selected",
          );
        }
        setTransportStatus("ready");
      })
      .catch(() => {
        if (!gone) setTransportStatus("error");
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      gone = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [status, props.state.transport, transportRetry]);
  useEffect(() => {
    const m = map.current;
    if (
      status !== "ready" ||
      !m ||
      !(props.state.industry || props.state.ports)
    )
      return;
    let pins: Marker[] = [];
    let openingPin: HTMLButtonElement | null = null;
    const restorePinFocus = () => {
      if (openingPin?.isConnected) openingPin.focus();
      else
        m.getContainer()
          .querySelector<HTMLButtonElement>(".maps-industry-pin")
          ?.focus();
    };
    const popup = new Popup({
      closeButton: true,
      offset: 20,
      maxWidth: "280px",
    });
    sitePopup.current = popup;
    function draw() {
      pins.forEach((pin) => pin.remove());
      pins = [];
      for (const sites of groupSites(matchingAnchors(props.state), (p) =>
        m!.project(p as [number, number]),
      )) {
        const element = document.createElement("button");
        element.className = "maps-industry-pin";
        if (sites.every((s) => s.kind !== "epz"))
          element.classList.add("maps-port-pin");
        element.type = "button";
        element.setAttribute(
          "aria-label",
          sites.map((s) => s.name[props.locale]).join(", "),
        );
        element.title = sites.map((s) => s.name[props.locale]).join(" · ");
        element.onpointerenter = () => hoverPopup.current?.remove();
        // Authored, static geometry: no provider strings are inserted as markup.
        const shape = sites.every((s) => s.kind === "seaport")
          ? "M12 7v14M5 11H2v4a10 10 0 0 0 20 0v-4h-3M8 12h8M15 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          : sites.every((s) => s.kind === "landport")
            ? "M4 21V8h16v13M2 8l10-5 10 5M8 21v-7h8v7M2 21h20"
            : sites.every((s) => s.kind === "airport")
              ? "M12 2c-1 0-2 2-2 4v3L2 14v2l8-2v4l-3 2v1l5-1 5 1v-1l-3-2v-4l8 2v-2l-8-5V6c0-2-1-4-2-4Z"
              : sites.every((s) => s.kind === "epz")
                ? "M3 21V10l6 3V7l6 4V3h4l2 18H3ZM7 17h1m4 0h1m4 0h1"
                : "M12 3 2 8l10 5 10-5-10-5ZM2 12l10 5 10-5M2 16l10 5 10-5";
        element.innerHTML = `<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${shape}"/></svg></span>`;
        if (sites.length > 1) {
          const count = document.createElement("b");
          count.textContent = new Intl.NumberFormat(
            props.locale === "bn" ? "bn-BD" : "en-GB",
          ).format(sites.length);
          element.append(count);
        }
        element.onclick = (event) => {
          event.stopPropagation();
          hoverPopup.current?.remove();
          openingPin = element;
          const body = document.createElement("div");
          body.className = "maps-industry-popup";
          const heading = document.createElement("strong");
          heading.textContent = t("Trade & connections", "বাণিজ্য ও যোগাযোগ");
          body.append(heading);
          for (const site of sites) {
            const link = document.createElement("a");
            link.href = site.source;
            link.target = "_blank";
            link.rel = "noreferrer";
            link.textContent = site.name[props.locale] + " ↗";
            const location = document.createElement("p");
            location.textContent =
              siteKind(site.kind, props.locale) +
              " · " +
              site.location[props.locale];
            body.append(link, location);
            if ("role" in site) {
              const role = document.createElement("p");
              role.textContent = site.role[props.locale];
              body.append(role);
              const age = document.createElement("small");
              age.textContent = site.sourceNote[props.locale];
              body.append(age);
            }
          }
          const note = document.createElement("small");
          note.textContent = t(
            "Authority sources checked 12 Sep 2026. Approximate OSM facility positions, 12 Sep 2026. Not entrances or live operating status.",
            "কর্তৃপক্ষের তথ্য যাচাই ১২ সেপ্টেম্বর ২০২৬। OSM-এর আনুমানিক অবস্থান, ১২ সেপ্টেম্বর ২০২৬। প্রবেশপথ বা এই মুহূর্তের কার্যক্রম বোঝায় না।",
          );
          body.append(note);
          popup
            .setLngLat(sites[0].point as [number, number])
            .setDOMContent(body)
            .addTo(m!);
          const close = popup
            .getElement()
            .querySelector<HTMLButtonElement>(".maplibregl-popup-close-button");
          close?.setAttribute(
            "aria-label",
            t("Close place details", "স্থানের তথ্য বন্ধ করুন"),
          );
          close?.addEventListener("click", (event) => {
            event.stopPropagation();
            restorePinFocus();
          });
        };
        pins.push(
          new Marker({ element })
            .setLngLat(sites[0].point as [number, number])
            .addTo(m!),
        );
      }
    }
    const close = () => popup.remove();
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && popup.isOpen()) {
        e.preventDefault();
        e.stopPropagation();
        popup.remove();
        restorePinFocus();
      }
    };
    draw();
    m.on("moveend", draw);
    m.on("movestart", close);
    m.getContainer().addEventListener("keydown", escape);
    return () => {
      m.off("moveend", draw);
      m.off("movestart", close);
      m.getContainer().removeEventListener("keydown", escape);
      pins.forEach((p) => p.remove());
      popup.remove();
      sitePopup.current = null;
    };
  }, [
    status,
    props.state.industry,
    props.state.ports,
    props.state.division,
    props.locale,
  ]);
  useEffect(() => {
    const m = map.current,
      data = shapes.current;
    if (status !== "ready" || !m || !data) return;
    const l = layerById(props.state.layer),
      symbols = symbolColors(l),
      included = new Set(
        matchingRegions(props.regions, props.state).map((r) => r.id),
      ),
      level = props.regions.filter((r) => r.level === props.state.level),
      maximum = Math.max(...level.map((r) => metricValue(r, l.id) ?? 0), 1);
    const features = data.features
      .filter((f) => level.some((r) => r.id === f.properties.id))
      .map((f) => {
        const r = level.find((r) => r.id === f.properties.id)!,
          v = metricValue(r, l.id);
        return {
          ...f,
          properties: {
            id: r.id,
            color: l.kind === "count" ? symbols.ground : metricColor(v, l),
            opacity: included.has(r.id) ? props.opacity : 0.1,
            selected: r.id === props.state.region,
            compare: r.id === props.state.compare,
          },
        };
      });
    (m.getSource("regions") as GeoJSONSource).setData({
      type: "FeatureCollection",
      features,
    });
    (m.getSource("symbols") as GeoJSONSource).setData({
      type: "FeatureCollection",
      features:
        l.kind === "count"
          ? level
              .filter((r) => included.has(r.id) && metricValue(r, l.id)! > 0)
              .map((r) => ({
                type: "Feature",
                geometry: { type: "Point", coordinates: r.point },
                properties: {
                  radius: countRadius(metricValue(r, l.id), maximum),
                  fill: symbols.fill,
                  stroke: symbols.stroke,
                },
              }))
          : [],
    });
    labels();
  }, [
    status,
    props.state,
    props.locale,
    props.opacity,
    props.labels,
    props.regions,
  ]);
  useEffect(() => {
    if (status !== "ready" || lastFitKey.current === cameraKey()) return;
    lastFitKey.current = cameraKey();
    fit(targetBounds());
  }, [
    status,
    props.state.region,
    props.state.compare,
    props.state.division,
    props.reset,
    props.state.level,
  ]);
  return (
    <div className="maps-canvas-wrap">
      <div
        ref={host}
        className={`maps-canvas ${status !== "ready" ? "is-loading" : ""}`}
        role="region"
        aria-label={t(
          "Interactive Bangladesh map. Search or use Data for keyboard access.",
          "বাংলাদেশের ইন্টার‌্যাকটিভ মানচিত্র। কিবোর্ড দিয়ে খুঁজুন বা তথ্যের টেবিল ব্যবহার করুন।",
        )}
      />
      <a
        className="maps-map-credit"
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
      >
        © OpenStreetMap
      </a>
      <div className="maps-map-controls">
        <button
          onClick={() => map.current?.zoomIn()}
          disabled={status !== "ready" || zoom >= maxZoom}
          aria-label={t("Zoom in", "বড় করুন")}
        >
          <svg viewBox="0 0 24 24">
            <path d="M5 12h14M12 5v14" />
          </svg>
        </button>
        <button
          onClick={() => map.current?.zoomOut()}
          disabled={
            status !== "ready" ||
            zoom <= constrainedMinZoom + 1e-6
          }
          aria-label={t("Zoom out", "ছোট করুন")}
        >
          <svg viewBox="0 0 24 24">
            <path d="M5 12h14" />
          </svg>
        </button>
        <button
          onClick={() => fit()}
          disabled={status !== "ready"}
          aria-label={t("Show all Bangladesh", "পুরো বাংলাদেশ দেখুন")}
        >
          <svg viewBox="0 0 24 24">
            <path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5M4 4l5 5m11-5-5 5M4 20l5-5m11 5-5-5" />
          </svg>
        </button>
      </div>
      {status !== "ready" && (
        <div className="maps-load" role="status">
          <strong>
            {status === "loading"
              ? t("Drawing Bangladesh…", "বাংলাদেশের মানচিত্র লোড হচ্ছে…")
              : t(
                  "The map is unavailable on this device.",
                  "এই ডিভাইসে মানচিত্র দেখা যাচ্ছে না।",
                )}
          </strong>
          {status === "error" && (
            <p>
              {t(
                "Use Data above to explore the same regional information.",
                "ওপরে তথ্য বেছে নিয়ে একই আঞ্চলিক তথ্য দেখতে পারবেন।",
              )}
            </p>
          )}
          {status === "error" && (
            <button onClick={() => setRetry((r) => r + 1)}>
              {t("Try again", "আবার চেষ্টা করুন")}
            </button>
          )}
        </div>
      )}
      {baseError && status === "ready" && (
        <p className="maps-context-note">
          {t(
            "Some background tiles are unavailable. Regional data is loaded.",
            "পেছনের মানচিত্রের কিছু অংশ লোড হয়নি। অঞ্চলের তথ্য দেখা যাচ্ছে।",
          )}
        </p>
      )}
      {props.state.transport &&
        status === "ready" &&
        transportStatus !== "ready" && (
          <div className="maps-overlay-status" role="status">
            {transportStatus === "loading" ? (
              t("Loading roads & railways…", "সড়ক ও রেলপথ লোড হচ্ছে…")
            ) : (
              <>
                {t(
                  "Roads & railways couldn't load.",
                  "সড়ক ও রেলপথ লোড হয়নি।",
                )}
                <button onClick={() => setTransportRetry((r) => r + 1)}>
                  {t("Retry", "আবার চেষ্টা করুন")}
                </button>
              </>
            )}
          </div>
        )}
    </div>
  );
}
