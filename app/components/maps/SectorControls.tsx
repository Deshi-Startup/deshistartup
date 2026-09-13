import {
  sectorNames,
  sectorMeasures,
  sectorMeasureNames,
  type SectorSelection,
} from "./business";
import type { Locale } from "./types";
import { words } from "./layers";

export default function SectorControls({
  locale,
  selection,
  onChange,
}: {
  locale: Locale;
  selection: SectorSelection;
  onChange: (next: SectorSelection) => void;
}) {
  const t = (en: string, bn: string) => (locale === "en" ? en : bn);
  return (
    <div className="maps-sector-controls">
      <label>
        {t("Business sector", "ব্যবসার খাত")}
        <select
          aria-label={t("Business sector", "ব্যবসার খাত")}
          value={selection.sector}
          onChange={(e) =>
            onChange({
              sector: e.target.value,
              sectorMeasure: e.target.value ? selection.sectorMeasure : "units",
            })
          }
        >
          <option value="">
            {t("All economic activity", "সব অর্থনৈতিক কর্মকাণ্ড")}
          </option>
          {Object.entries(sectorNames).map(([code, name]) => (
            <option key={code} value={code}>
              {words(name, locale)}
            </option>
          ))}
        </select>
      </label>
      {selection.sector && (
        <div
          className="maps-sector-measures"
          role="group"
          aria-label={t("Show sector by", "খাতের কোন তথ্য দেখবেন")}
        >
          {sectorMeasures.map((measure) => (
            <button
              key={measure}
              aria-label={
                measure === "units"
                  ? t("Count of establishments", "প্রতিষ্ঠানের সংখ্যা")
                  : words(sectorMeasureNames[measure], locale)
              }
              aria-pressed={selection.sectorMeasure === measure}
              onClick={() => onChange({ ...selection, sectorMeasure: measure })}
            >
              {measure === "units"
                ? t("Count", "সংখ্যা")
                : measure === "share"
                  ? t("Local share", "স্থানীয় অংশ")
                  : t("People", "মানুষ")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
