import { mapIconPaths } from "./map-icons";
import { Map as LibreMap } from "maplibre-gl";
import type { MapHandle, MapSnapshot, MapAnnotation, MapImageLayout } from "./export-types";
import { exportSize, type ExportDocument } from "./export-model";
export class ExportError extends Error {
  constructor(public reason: "loading" | "unavailable" | "render") {
    super(reason);
  }
}
const aborted = () => new DOMException("Export cancelled", "AbortError");
function waitForMap(map: LibreMap, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const finish = (error?: Error) => {
      clearTimeout(timer);
      map.off("idle", ready);
      map.off("error", failed);
      signal.removeEventListener("abort", cancel);
      error ? reject(error) : resolve();
    };
    const ready = () => finish();
    const failed = () => finish(new ExportError("unavailable"));
    const cancel = () => finish(aborted());
    const timer = setTimeout(() => finish(new ExportError("loading")), 20000);
    map.on("idle", ready);
    map.on("error", failed);
    signal.addEventListener("abort", cancel, { once: true });
    if (signal.aborted) cancel();
    else map.triggerRepaint();
  });
}
export async function captureMap(
  handle: () => MapHandle | null,
  signal: AbortSignal,
): Promise<MapSnapshot> {
  const map = handle()?.getMap();
  if (!map) throw new ExportError("loading");
  await document.fonts.ready;
  await waitForMap(map, signal);
  const issue = handle()?.getIssue();
  if (issue) throw new ExportError(issue);
  const host = map.getContainer();
  const bounds = host.getBoundingClientRect();
  const annotations: MapAnnotation[] = [];
  const box = (el: Element) => {
    const r = el.getBoundingClientRect();
    return {
      x: r.left - bounds.left,
      y: r.top - bounds.top,
      width: r.width,
      height: r.height,
    };
  };
  const text = (el: Element, halo = false) => {
    const style = getComputedStyle(el);
    const rect = box(el);
    if (!rect.width || !rect.height || style.display === "none") return;
    annotations.push({
      ...rect,
      text: el.textContent || "",
      font: `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
      color: style.color,
      halo,
    });
  };
  const surface = (el: Element) => {
    const style = getComputedStyle(el);
    annotations.push({
      ...box(el),
      background: style.backgroundColor,
      radius: parseFloat(style.borderRadius) || 0,
      ...(parseFloat(style.borderWidth) ? { border: style.borderColor } : {}),
    });
  };
  // DOM markers deliberately remain DOM in the explorer. Snapshot only their
  // visible primitives; never rasterize the page or depend on foreignObject.
  host.querySelectorAll(".maps-place-label").forEach((el) => text(el, true));
  host.querySelectorAll(".maps-industry-pin").forEach((el) => {
    const swatch = el.querySelector("span");
    const svg = el.querySelector("svg");
    if (swatch) surface(swatch);
    if (svg)
      annotations.push({
        ...box(svg),
        path: svg.querySelector("path")?.getAttribute("d") || "",
        color: getComputedStyle(svg).stroke,
      });
    const badge = el.querySelector("b");
    if (badge) {
      surface(badge);
      text(badge);
    }
  });
  host.querySelectorAll(".maps-urban-marker").forEach((el) => {
    surface(el);
    const dot = el.querySelector(".maps-urban-marker-dot");
    if (dot) surface(dot);
    const label = el.querySelector("span:last-child");
    if (label) text(label);
  });
  const center = map.getCenter();
  const style = map.getStyle();
  // Disabled context should not fetch or consume memory in a temporary map.
  if (
    style.layers
      .filter((l) => "source" in l && l.source === "transport")
      .every((l) => l.layout?.visibility === "none")
  ) {
    style.layers = style.layers.filter(
      (l) => !("source" in l && l.source === "transport"),
    );
    delete style.sources.transport;
  }
  // Include all configured regions, not only queryRenderedFeatures in view.
  const featureStates = (handle()?.getFeatureIds() || []).map((id) => ({
    id,
    state: { ...map.getFeatureState({ source: "regions", id }) },
  }));
  return {
    width: map.getCanvas().clientWidth,
    height: map.getCanvas().clientHeight,
    camera: { lng: center.lng, lat: center.lat, zoom: map.getZoom() },
    padding: { top: 0, bottom: 0, left: 0, right: 0, ...map.getPadding() },
    style,
    featureStates,
    annotations,
    fontFamily: getComputedStyle(host).fontFamily,
  };
}
/** The interactive map keeps its normal buffer. This renderer lives for one job. */
export async function renderMap(snapshot: MapSnapshot, signal: AbortSignal) {
  const host = document.createElement("div");
  host.className = "maps-export-render-host";
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, {
    position: "fixed",
    left: "-100000px",
    top: "0",
    width: `${snapshot.width}px`,
    height: `${snapshot.height}px`,
    pointerEvents: "none",
  });
  document.body.append(host);
  let map: LibreMap | undefined;
  try {
    signal.throwIfAborted();
    const { ratio } = exportSize(snapshot.width, snapshot.height, 0);
    map = new LibreMap({
      container: host,
      style: snapshot.style,
      center: [snapshot.camera.lng, snapshot.camera.lat],
      zoom: snapshot.camera.zoom,
      pixelRatio: ratio,
      interactive: false,
      attributionControl: false,
      renderWorldCopies: false,
      fadeDuration: 0,
      canvasContextAttributes: { preserveDrawingBuffer: true },
    });
    map.jumpTo({ padding: snapshot.padding });
    await waitForMap(map, signal);
    for (const { id, state } of snapshot.featureStates)
      map.setFeatureState({ source: "regions", id }, state);
    await waitForMap(map, signal);
    signal.throwIfAborted();
    const original = map.getCanvas();
    const canvas = document.createElement("canvas");
    canvas.width = original.width;
    canvas.height = original.height;
    const ctx = canvas.getContext("2d");
    if (
      !ctx ||
      canvas.width < Math.floor(snapshot.width * ratio) ||
      canvas.height < Math.floor(snapshot.height * ratio)
    )
      throw new ExportError("render");
    ctx.drawImage(original, 0, 0);
    ctx.scale(canvas.width / snapshot.width, canvas.height / snapshot.height);
    for (const a of snapshot.annotations) drawAnnotation(ctx, a);
    return canvas;
  } finally {
    map?.remove();
    host.remove();
  }
}
function drawAnnotation(ctx: CanvasRenderingContext2D, a: MapAnnotation) {
  ctx.save();
  if (a.background) {
    ctx.beginPath();
    ctx.roundRect(
      a.x,
      a.y,
      a.width,
      a.height,
      Math.min(a.radius || 0, a.width / 2, a.height / 2),
    );
    ctx.fillStyle = a.background;
    ctx.fill();
    if (a.border) {
      ctx.strokeStyle = a.border;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  if (a.text) {
    ctx.font = a.font!;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (a.halo) {
      ctx.strokeStyle = "#ffffffdd";
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.strokeText(a.text, a.x + a.width / 2, a.y + a.height / 2);
    }
    ctx.fillStyle = a.color!;
    ctx.fillText(a.text, a.x + a.width / 2, a.y + a.height / 2);
  }
  if (a.path) {
    ctx.translate(a.x, a.y);
    ctx.scale(a.width / 24, a.height / 24);
    ctx.strokeStyle = a.color!;
    ctx.lineWidth = 1.7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke(new Path2D(a.path));
  }
  ctx.restore();
}
export async function composeImage(
  snapshot: MapImageLayout,
  map: HTMLCanvasElement,
  doc: ExportDocument,
  includeComparison: boolean,
  signal: AbortSignal,
) {
  await document.fonts.ready;
  signal.throwIfAborted();
  // Keep the legend and source credits readable on very large desktop canvases.
  // Only the caption layout is normalized; map framing and geometry stay intact.
  const layoutScale = Math.min(1, 1600 / Math.max(snapshot.width, snapshot.height));
  const layoutWidth = snapshot.width * layoutScale;
  const layoutHeight = snapshot.height * layoutScale;
  const measure = document.createElement("canvas").getContext("2d")!;
  const family = snapshot.fontFamily;
  const font = (size: number, weight = 400) => `${weight} ${size}px ${family}`;
  function lines(text: string, width: number, size: number, weight = 400) {
    measure.font = font(size, weight);
    const output: string[] = [];
    let line = "";
    for (const word of text.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (line && measure.measureText(next).width > width) {
        output.push(line);
        line = word;
      } else line = next;
    }
    if (line) output.push(line);
    return output;
  }
  const margin = layoutWidth < 600 ? 16 : 24;
  const width = layoutWidth - margin * 2;
  const comparison =
    includeComparison && doc.evidence.length === 2 ? doc.evidence : [];
  const evidenceWidth = (width - 24) / 2;
  const evidenceLines = comparison.map((e) => ({
    ...e,
    nameLines: lines(`${e.name} · ${e.kind}`, evidenceWidth, 13, 500),
    intervalLines: lines(e.interval, evidenceWidth, 10),
  }));
  const comparisonHeader = `${doc.kind === "places" ? doc.unit : doc.title} · ${doc.period}`;
  const comparisonHeight = comparison.length
    ? 40 +
      lines(comparisonHeader, width, 12, 500).length * 18 +
      Math.max(
        ...evidenceLines.map(
          (e) => e.nameLines.length * 19 + 38 + e.intervalLines.length * 15,
        ),
      )
    : 0;
  const credits = [
    doc.source,
    ...doc.notes,
    ...(doc.reuse ? [doc.reuse] : []),
    "© OpenMapTiles · © OpenStreetMap contributors · openstreetmap.org/copyright",
    "Boundaries: BBS/OCHA via geoBoundaries · CC BY 3.0 IGO · Simplified",
  ];
  const creditLines = credits.flatMap((s) => lines(s, width, 9));
  const footer = comparisonHeight + 46 + creditLines.length * 14;
  const size = exportSize(layoutWidth, layoutHeight, footer);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ExportError("render");
  ctx.scale(size.ratio, size.ratio);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, layoutWidth, layoutHeight + footer);
  ctx.drawImage(map, 0, 0, layoutWidth, layoutHeight);
  ctx.textBaseline = "top";
  const write = (
    text: string,
    x: number,
    y: number,
    size = 11,
    weight = 400,
    color = "#23372f",
  ) => {
    ctx.fillStyle = color;
    ctx.font = font(size, weight);
    ctx.fillText(text, x, y);
  };
  // The legend uses logical pixels, so exporting at higher resolution changes
  // sharpness without changing classification, symbol scale or map zoom.
  const legendWidth = Math.min(340, width);
  const contentWidth = legendWidth - 28;
  const titleLines = lines(doc.title, contentWidth, 13, 600);
  const meta =
    doc.kind === "places"
      ? `${doc.geography} · ${doc.period}`
      : `${doc.unit} · ${doc.period} · ${doc.geography}`;
  const metaLines = lines(meta, contentWidth, 10);
  const keyWidth = (contentWidth - 12) / 2;
  const keys = doc.context.map((key) => ({
    ...key,
    lines: lines(key.label, keyWidth - 28, 10),
  }));
  const keyRows = Array.from({ length: Math.ceil(keys.length / 2) }, (_, row) =>
    Math.max(
      22,
      ...keys
        .slice(row * 2, row * 2 + 2)
        .map((key) => key.lines.length * 14 + 4),
    ),
  );
  const legendHeight =
    28 +
    titleLines.length * 19 +
    metaLines.length * 15 +
    (doc.kind === "rate" ? 45 : doc.kind === "count" ? 105 : 0) +
    keyRows.reduce((sum, height) => sum + height, 0) +
    14;
  const lx = margin,
    ly = Math.max(margin, layoutHeight - margin - legendHeight);
  ctx.shadowColor = "#173b2c18";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(lx, ly, legendWidth, legendHeight, 12);
  ctx.fill();
  ctx.shadowColor = "transparent";
  let y = ly + 14;
  titleLines.forEach((line) => {
    write(line, lx + 14, y, 13, 600);
    y += 19;
  });
  metaLines.forEach((line) => {
    write(line, lx + 14, y, 10, 400, "#56655e");
    y += 15;
  });
  y += 10;
  if (doc.kind === "rate") {
    const band = contentWidth / doc.colors.length;
    doc.colors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(lx + 14 + band * i, y, band + 0.1, 9);
    });
    y += 17;
    doc.ticks.forEach((tick, i) => {
      ctx.textAlign =
        i === doc.ticks.length - 1 ? "right" : i === 0 ? "left" : "center";
      write(
        tick,
        lx + 14 + (i * contentWidth) / (doc.ticks.length - 1),
        y,
        9,
        400,
        "#56655e",
      );
    });
    ctx.textAlign = "left";
    y += 20;
  } else if (doc.kind === "count") {
    doc.circles.forEach((circle, i) => {
      const x = lx + 14 + ((i + 0.5) * contentWidth) / 3;
      ctx.fillStyle = doc.symbols.fill;
      ctx.strokeStyle = doc.symbols.stroke;
      ctx.globalAlpha = 0.52;
      ctx.beginPath();
      // Match the map's symbols when a very large viewport is scaled down.
      ctx.arc(x, y + 36, circle.radius * layoutScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.textAlign = "center";
      write(circle.value, x, y + 76, 10);
      ctx.textAlign = "left";
    });
    y += 98;
  }
  keyRows.forEach((height, row) => {
    keys.slice(row * 2, row * 2 + 2).forEach((key, col) => {
      const x = lx + 14 + col * (keyWidth + 12);
      if (key.icon) {
        drawAnnotation(ctx, {
          x,
          y,
          width: 18,
          height: 18,
          radius: 4,
          background: key.color,
        });
        drawAnnotation(ctx, {
          x: x + 2,
          y: y + 2,
          width: 14,
          height: 14,
          path: mapIconPaths[key.icon],
          color: "#fff",
        });
      } else {
        ctx.save();
        ctx.strokeStyle = key.color;
        ctx.lineWidth = 2;
        ctx.setLineDash(key.dashed ? [4, 3] : []);
        ctx.beginPath();
        ctx.moveTo(x, y + 8);
        ctx.lineTo(x + 20, y + 8);
        ctx.stroke();
        ctx.restore();
      }
      key.lines.forEach((line, i) =>
        write(line, x + 28, y + 2 + i * 14, 10, 400, "#56655e"),
      );
    });
    y += height;
  });
  if (doc.kind !== "places")
    write(
      doc.kind === "rate"
        ? doc.bands
        : doc.locale === "en"
          ? "Circle area = value"
          : "বৃত্তের ক্ষেত্রফল = পরিমাণ",
      lx + 14,
      y,
      9,
      400,
      "#56655e",
    );
  y = layoutHeight + 20;
  if (comparison.length) {
    lines(comparisonHeader, width, 12, 500).forEach((line) => {
      write(line, margin, y, 12, 500);
      y += 18;
    });
    y += 10;
    evidenceLines.forEach((e, i) => {
      const x = margin + i * (evidenceWidth + 24);
      let ey = y;
      e.nameLines.forEach((line) => {
        write(line, x, ey, 13, 500);
        ey += 19;
      });
      write(e.value, x, ey + 3, 26, 600);
      ey += 38;
      e.intervalLines.forEach((line) => {
        write(line, x, ey, 10, 400, "#56655e");
        ey += 15;
      });
    });
    y = layoutHeight + comparisonHeight;
    ctx.strokeStyle = "#e1e6df";
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(layoutWidth - margin, y);
    ctx.stroke();
    y += 16;
  }
  write(
    `Deshi Startup · deshistartup.com/${doc.locale === "en" ? "en/" : ""}maps`,
    margin,
    y,
    10,
    600,
  );
  y += 20;
  creditLines.forEach((line) => {
    write(line, margin, y, 9, 400, "#56655e");
    y += 14;
  });
  try {
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new ExportError("render"))),
        "image/png",
      ),
    );
    signal.throwIfAborted();
    return { blob, width: size.width, height: size.height };
  } finally {
    canvas.width = canvas.height = 1;
  }
}
