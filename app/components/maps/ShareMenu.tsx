"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Icon from "./MapIcon";
import type { ExplorerState } from "./layers";
import type { Locale, Region, UrbanPlace } from "./types";
import type { MapHandle } from "./export-types";
const ExportPreview = dynamic(() => import("./ExportPreview"), { ssr: false });
export type ExportRequest = {
  state: ExplorerState;
  regions: Region[];
  towns: UrbanPlace[];
  locale: Locale;
  mapHandle: RefObject<MapHandle | null>;
  comparisonOpen: boolean;
};
export default function ShareMenu({
  request,
  getLink,
  onMessage,
}: {
  request: ExportRequest;
  getLink: () => string;
  onMessage: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [exportRequest, setExportRequest] = useState<ExportRequest | null>(
    null,
  );
  const trigger = useRef<HTMLButtonElement>(null);
  const exportWasOpen = useRef(false);
  const menu = useRef<HTMLDivElement>(null);
  const t = (en: string, bn: string) => (request.locale === "en" ? en : bn);
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const outside = (e: PointerEvent) => {
      if (
        !menu.current?.contains(e.target as Node) &&
        !trigger.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  useEffect(() => {
    // Restore focus after the modal is removed, when the header is no longer inert.
    if (!exportRequest && exportWasOpen.current) trigger.current?.focus();
    exportWasOpen.current = !!exportRequest;
  }, [exportRequest]);
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  async function copy() {
    const url = getLink();
    close();
    try {
      await navigator.clipboard.writeText(url);
      onMessage(t("Link copied", "লিংক কপি হয়েছে"));
    } catch {
      // Keep the address bar usable when clipboard permission is unavailable.
      history.replaceState(null, "", url);
      onMessage(
        t(
          "Copy the link from your address bar.",
          "অ্যাড্রেস বার থেকে লিংক কপি করুন।",
        ),
      );
    }
  }
  return (
    <div
      className="maps-share-control"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          close();
        }
      }}
    >
      <button
        ref={trigger}
        className="maps-share"
        aria-label={t("Share this view", "এই ভিউ শেয়ার করুন")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="maps-share-menu"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <Icon name="share-out" />
        <span>{t("Share", "শেয়ার")}</span>
      </button>
      {open && (
        <div
          ref={menu}
          id="maps-share-menu"
          className="maps-share-menu"
          role="menu"
          aria-label={t("Share", "শেয়ার")}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node))
              setOpen(false);
          }}
          onKeyDown={(e) => {
            const buttons = [
              ...e.currentTarget.querySelectorAll<HTMLButtonElement>("button"),
            ];
            const index = buttons.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
              e.preventDefault();
              buttons[
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? buttons.length - 1
                    : (index +
                        (e.key === "ArrowDown" ? 1 : buttons.length - 1)) %
                      buttons.length
              ]?.focus();
            }
          }}
        >
          <button role="menuitem" onClick={copy}>
            <Icon name="share" />
            {t("Copy link", "লিংক কপি করুন")}
          </button>
          <button
            role="menuitem"
            aria-disabled={request.state.view !== "map"}
            onClick={() => {
              if (request.state.view !== "map") {
                onMessage(
                  t(
                    "Switch to Map to download an image.",
                    "ছবি ডাউনলোড করতে ম্যাপ ভিউ খুলুন।",
                  ),
                );
                return;
              }
              setExportRequest({ ...request, state: { ...request.state } });
              setOpen(false);
            }}
          >
            <Icon name="download" />
            {t("Download image…", "ছবি ডাউনলোড…")}
          </button>
        </div>
      )}
      {exportRequest &&
        createPortal(
          <ExportPreview
            request={exportRequest}
            onClose={() => {
              setExportRequest(null);
            }}
            onMessage={onMessage}
          />,
          trigger.current!.closest(".deshi-maps")!,
        )}
    </div>
  );
}
