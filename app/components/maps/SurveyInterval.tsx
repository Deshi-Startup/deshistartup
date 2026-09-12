import type { Locale, Region } from "./types";
import { formatValue, internetInterval, ICT_URL, layerById } from "./layers";

export default function SurveyInterval({
  region,
  locale,
}: {
  region: Region;
  locale: Locale;
}) {
  const bounds = internetInterval(region);
  return (
    <small className="maps-survey-interval">
      {bounds ? (
        <a
          href={`${ICT_URL}#page=${region.metrics?.internetIntervalPage}`}
          target="_blank"
          rel="noreferrer"
        >
          {bounds
            .map((value) => formatValue(value, layerById("internet"), locale))
            .join("–")}
          {locale === "en" ? " · 95% interval" : " · ৯৫% আস্থার সীমা"}
        </a>
      ) : locale === "en" ? (
        "Interval unavailable for this division"
      ) : (
        "এই বিভাগের আস্থার সীমা নেই"
      )}
    </small>
  );
}
