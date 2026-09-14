"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "./MapIcon";
import type { ExportRequest } from "./ShareMenu";
import type { MapImageLayout } from "./export-types";
import { exportDocument } from "./export-model";
import {
  captureMap,
  composeImage,
  ExportError,
  renderMap,
} from "./export-render";
import "./export.css";
export default function ExportPreview({
  request,
  onClose,
  onMessage,
}: {
  request: ExportRequest;
  onClose: () => void;
  onMessage: (message: string) => void;
}) {
  const t = (en: string, bn: string) => (request.locale === "en" ? en : bn);
  const dialog = useRef<HTMLDialogElement>(null);
  const cache = useRef<{
    layout: MapImageLayout;
    map: HTMLCanvasElement;
  } | null>(null);
  const [includeComparison, setIncludeComparison] = useState(
    request.comparisonOpen,
  );
  const [revision, setRevision] = useState(0);
  const [prepared, setPrepared] = useState(0);
  const [image, setImage] = useState<{
    url: string;
    width: number;
    height: number;
  } | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const doc = useMemo(
    () =>
      exportDocument(
        request.state,
        request.regions,
        request.towns,
        request.locale,
      ),
    [request],
  );
  useEffect(() => {
    dialog.current?.showModal();
    return () => dialog.current?.close();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let map: HTMLCanvasElement | undefined;
    setError("");
    setBusy(true);
    void (async () => {
      try {
        const snapshot = await captureMap(
          () => request.mapHandle.current,
          controller.signal,
        );
        map = await renderMap(snapshot, controller.signal);
        if (controller.signal.aborted) {
          map.width = map.height = 1;
          return;
        }
        const { width, height, fontFamily } = snapshot;
        cache.current = { layout: { width, height, fontFamily }, map };
        setPrepared((n) => n + 1);
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(
          e instanceof ExportError && e.reason === "loading"
            ? t(
                "The map is still loading. Wait a moment, then retry.",
                "ম্যাপ লোড হচ্ছে। একটু পর আবার চেষ্টা করুন।",
              )
            : t(
                "The complete map image couldn’t be prepared. Check your connection and retry.",
                "ম্যাপের পুরো ছবি তৈরি করা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।",
              ),
        );
        setBusy(false);
      }
    })();
    return () => {
      controller.abort();
      if (map) map.width = map.height = 1;
      cache.current = null;
    };
  }, [request, revision]);
  useEffect(() => {
    if (!prepared || !cache.current) return;
    const controller = new AbortController();
    let url = "";
    setBusy(true);
    setError("");
    setImage(null);
    const { layout, map } = cache.current;
    void composeImage(layout, map, doc, includeComparison, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        url = URL.createObjectURL(result.blob);
        setImage({ url, width: result.width, height: result.height });
        setBusy(false);
        if (doc.evidence.length !== 2) {
          // Only a comparison toggle needs the uncaptioned map again.
          map.width = map.height = 1;
          cache.current = null;
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setBusy(false);
          setError(
            t(
              "This device couldn’t create the image. Retry or share a link instead.",
              "এই ডিভাইসে ছবি তৈরি করা যায়নি। আবার চেষ্টা করুন অথবা লিংক শেয়ার করুন।",
            ),
          );
        }
      });
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [prepared, includeComparison, doc]);
  function download() {
    if (!image || busy) return;
    const a = document.createElement("a");
    a.href = image.url;
    a.download = doc.filename;
    document.body.append(a);
    a.click();
    a.remove();
    onMessage(t("Image download started", "ছবি ডাউনলোড শুরু হয়েছে"));
  }
  return (
    <dialog
      ref={dialog}
      className="maps-export-dialog"
      aria-labelledby="maps-export-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="maps-export-heading">
        <h2 id="maps-export-title">
          {t("Download map", "ম্যাপের ছবি ডাউনলোড")}
        </h2>
        <button
          className="maps-icon-button"
          onClick={onClose}
          aria-label={t("Close export", "ডাউনলোড বন্ধ করুন")}
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="maps-export-preview" aria-busy={busy}>
        {image && !error && (
          <img
            src={image.url}
            width={image.width}
            height={image.height}
            alt={t(
              `${doc.title} map export preview`,
              `${doc.title} ম্যাপের ছবির প্রিভিউ`,
            )}
          />
        )}
        {(busy || error) && (
          <div
            className="maps-export-progress"
            role={error ? "alert" : "status"}
          >
            <p>
              {error || t("Preparing your map…", "ম্যাপের ছবি তৈরি হচ্ছে…")}
            </p>
            {error && (
              <button onClick={() => setRevision((n) => n + 1)}>
                {t("Retry", "আবার চেষ্টা করুন")}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="maps-export-options">
        {doc.evidence.length === 2 && (
          <label>
            <input
              type="checkbox"
              checked={includeComparison}
              onChange={(e) => setIncludeComparison(e.target.checked)}
            />
            {t("Include comparison", "তুলনার তথ্য রাখুন")}
          </label>
        )}
        <p>
          {t("Current view · PNG", "বর্তমান ভিউ · PNG")}
          {image && !busy
            ? ` · ${new Intl.NumberFormat(request.locale === "bn" ? "bn-BD" : "en-GB", { useGrouping: false }).format(image.width)} × ${new Intl.NumberFormat(request.locale === "bn" ? "bn-BD" : "en-GB", { useGrouping: false }).format(image.height)}`
            : ""}
        </p>
      </div>
      {doc.reuse && (
        <p className="maps-export-reuse">
          {doc.reuse}{" "}
          <a href={doc.sourceUrl} target="_blank" rel="noreferrer">
            {t("Source terms", "উৎসের শর্ত")}
          </a>
        </p>
      )}
      <div className="maps-export-actions">
        <a href={doc.sourceUrl} target="_blank" rel="noreferrer">
          {doc.source}
        </a>
        <button
          className="maps-export-download"
          disabled={!image || busy || !!error}
          onClick={download}
        >
          <Icon name="download" />
          {t("Download PNG", "PNG ডাউনলোড")}
        </button>
      </div>
    </dialog>
  );
}
