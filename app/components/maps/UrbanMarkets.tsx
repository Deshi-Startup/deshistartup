import Icon from "./MapIcon";
import type { Locale, Region, UrbanCoverage, UrbanPlace } from "./types";
import { URBAN_REPORT_URL, urbanKind, urbanName, urbanSource } from "./urban";

export default function UrbanMarkets({
  places,
  allPlaces,
  districts,
  district,
  coverage,
  placeId,
  compareId,
  locale,
  onSelect,
  onCompare,
  onBack,
}: {
  places: UrbanPlace[];
  allPlaces: UrbanPlace[];
  districts: Region[];
  district: Region;
  coverage: UrbanCoverage;
  placeId: string;
  compareId: string;
  locale: Locale;
  onSelect: (id: string) => void;
  onCompare: (id: string) => void;
  onBack: () => void;
}) {
  const t = (en: string, bn: string) => (locale === "en" ? en : bn);
  const num = (n: number, digits = 0) =>
    new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-GB", {
      maximumFractionDigits: digits,
    }).format(n);
  const place = places.find((p) => p.id === placeId);
  const compared = allPlaces.find((p) => p.id === compareId);
  const comparisonGroups = [...districts].sort((a, b) =>
    a.id === district.id
      ? -1
      : b.id === district.id
        ? 1
        : a.name[locale].localeCompare(b.name[locale], locale),
  );
  const maximum = Math.max(...places.map((p) => p.households), 1);
  const facts = [
    {
      key: "households",
      name: t("General households", "সাধারণ খানা"),
      digits: 0,
      unit: "",
    },
    {
      key: "householdSize",
      name: t("People per household", "খানাপ্রতি মানুষ"),
      digits: 2,
      unit: "",
    },
    {
      key: "literacy",
      name: t("Literacy · age\u00a07+", "সাক্ষরতা · বয়স\u00a0৭+"),
      digits: 2,
      unit: "%",
    },
  ] as const;
  return (
    <div className="maps-urban-panel">
      <button className="maps-urban-back" onClick={onBack}>
        <Icon name="arrow" />
        {t(`${district.name.en} district`, `${district.name.bn} জেলা`)}
      </button>
      <h1 tabIndex={-1}>
        {place ? place.name[locale] : t("Cities & towns", "জেলার শহরগুলো")}
      </h1>
      {place ? (
        <>
          <p className="maps-intro">
            {urbanKind(place, locale)} ·{" "}
            {t("Census 2022 jurisdiction", "শুমারি ২০২২-এর এলাকা")}
          </p>
          {!compared && (
            <>
              <div className="maps-primary-value">
                <span>{facts[0].name}</span>
                <strong>{num(place.households)}</strong>
              </div>
              <dl className="maps-facts">
                {facts.slice(1).map((f) => (
                  <div key={f.key}>
                    <dt>{f.name}</dt>
                    <dd>
                      {num(place[f.key], f.digits)}
                      {f.unit}
                    </dd>
                    {f.key === "householdSize" && (
                      <dd className="maps-fact-context">
                        <small>
                          {t("Mean · general households", "গড় · সাধারণ খানা")}
                        </small>
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            </>
          )}
          <div className="maps-action-stack">
            <label className="maps-urban-compare-label">
              {t("Compare with another town", "অন্য শহরের সঙ্গে তুলনা")}
              <select
                value={compared?.id || ""}
                onChange={(e) => onCompare(e.target.value)}
              >
                <option value="">
                  {t("Choose a place…", "শহর বেছে নিন…")}
                </option>
                {comparisonGroups.map((d) => (
                  <optgroup
                    key={d.id}
                    label={t(`${d.name.en} district`, `${d.name.bn} জেলা`)}
                  >
                    {allPlaces
                      .filter((p) => p.district === d.id && p.id !== place.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {urbanName(p, locale)}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>
            {compared && (
              <div className="maps-urban-comparison">
                <table className="maps-comparison-matrix">
                  <caption>
                    {t("Census 2022 comparison", "শুমারি ২০২২-এর তুলনা")}
                  </caption>
                  <thead>
                    <tr>
                      {[place, compared].map((p) => (
                        <th scope="col" key={p.id}>
                          {p.name[locale]}
                          <small>{urbanKind(p, locale)}</small>
                          {place.district !== compared.district && (
                            <small>
                              {
                                districts.find((d) => d.id === p.district)
                                  ?.name[locale]
                              }
                            </small>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {facts.map((f) => (
                    <tbody key={f.key}>
                      <tr>
                        <th scope="rowgroup" colSpan={2}>
                          {f.name}
                        </th>
                      </tr>
                      <tr>
                        {[place, compared].map((p) => (
                          <td key={p.id}>
                            {num(p[f.key], f.digits)}
                            {f.unit}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  ))}
                </table>
              </div>
            )}
            <button className="maps-text-button" onClick={() => onSelect("")}>
              {t("See district places", "জেলার শহরগুলো দেখুন")}{" "}
              <Icon name="arrow" />
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="maps-intro">
            {t(
              `${num(places.length)} mapped places in ${district.name.en} district.`,
              `${district.name.bn} জেলার ${num(places.length)}টি শহরের তথ্য।`,
            )}
          </p>
          <div className="maps-urban-list-heading">
            <span>{facts[0].name}</span>
            <span>{t("2022", "২০২২")}</span>
          </div>
          <ul className="maps-urban-list">
            {places.map((p) => (
              <li key={p.id}>
                <button onClick={() => onSelect(p.id)}>
                  <span className="maps-urban-list-title">
                    <span>
                      {p.name[locale]}
                      <small>{urbanKind(p, locale)}</small>
                    </span>
                    <strong>{num(p.households)}</strong>
                  </span>
                  <span className="maps-urban-bar" aria-hidden="true">
                    <i
                      style={{ width: `${(p.households / maximum) * 100}%` }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="maps-urban-geography">
        {place?.pointRole === "municipal-office" && !compared
          ? t(
              "Marker: city corporation office.",
              "চিহ্নটি সিটি করপোরেশনের কার্যালয়ের অবস্থান দেখায়।",
            )
          : t(
              "Markers show locations only.",
              "চিহ্নগুলো শুধু শহরের অবস্থান দেখায়।",
            )}
      </p>
      <details className="maps-urban-sources">
        <summary>{t("Sources & coverage", "উৎস ও তথ্যের পরিধি")}</summary>
        <p>
          {t(
            "BBS Census 2022 Urban Area Report, published January 2025. Checked 13 September 2026. Statistics describe the named census jurisdiction, not its wider district or current legal status.",
            "বিবিএসের জনশুমারি ২০২২-এর Urban Area Report। প্রকাশ: জানুয়ারি ২০২৫। যাচাই: ১৩ সেপ্টেম্বর ২০২৬। তথ্য প্রতিটি শহরের শুমারির এলাকার, পুরো জেলার নয়। বর্তমান প্রশাসনিক পরিচয় বদলে থাকতে পারে।",
          )}
        </p>
        <p>
          {t(
            `${coverage.mappedRecords} of ${coverage.reportRecords} city and municipality entries from this district are mapped.`,
            `প্রতিবেদনে এই জেলার ${num(coverage.reportRecords)}টি শহরের মধ্যে ${num(coverage.mappedRecords)}টির অবস্থান ম্যাপে দেখানো হয়েছে।`,
          )}
        </p>
        {coverage.excluded.length > 0 && (
          <ul>
            {coverage.excluded.map((entry) => (
              <li key={`${entry.name}-${entry.sourcePage}`}>
                <a
                  href={`${URBAN_REPORT_URL}#page=${entry.sourcePage}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {entry.name}
                </a>
                {" · "}
                {entry.reason === "unnamed-report-row"
                  ? t("Name absent in report", "প্রতিবেদনে নাম নেই")
                  : t("Location not verified", "অবস্থান যাচাই করা যায়নি")}
              </li>
            ))}
          </ul>
        )}
        <p className="maps-small">
          {t(
            "People living and sharing meals together. This excludes institutional, other and floating households.",
            "একসঙ্গে থাকা ও খাওয়ার ব্যবস্থা করা মানুষদের নিয়ে একটি সাধারণ খানা। প্রাতিষ্ঠানিক, অন্যান্য ও ভাসমান খানা এই হিসাবে নেই।",
          )}
        </p>
        <p className="maps-small">
          {t(
            "Administrative areas differ in size. Household counts describe scale, not demand for your service.",
            "প্রশাসনিক এলাকার আয়তন এক রকম নয়। শুধু খানার সংখ্যা দিয়ে আপনার সেবার চাহিদা বোঝা যায় না।",
          )}
        </p>
        {(place ? [place, ...(compared ? [compared] : [])] : places).map(
          (p) => (
            <p key={p.id}>
              <a href={urbanSource(p)} target="_blank" rel="noreferrer">
                {urbanName(p, locale)} · {p.table}
              </a>
              <br />
              <a href={p.pointSource} target="_blank" rel="noreferrer">
                {p.pointRole === "municipal-office"
                  ? t(
                      "City corporation office location",
                      "সিটি করপোরেশনের কার্যালয়ের অবস্থান",
                    )
                  : t("Location reference", "অবস্থানের উৎস")}
              </a>
            </p>
          ),
        )}
        <p>
          {t(
            "Open reference polygons do not match the 2022 census extents, so no urban boundaries or density estimates are drawn. Points use OSM (ODbL) and BBS/OCHA via geoBoundaries (CC BY 3.0 IGO). Other measures need matching city-level evidence.",
            "উন্মুক্ত সীমানার ফাইলগুলো ২০২২-এর শুমারির এলাকার সঙ্গে মেলে না। তাই শহরের সীমানা বা ঘনত্ব দেখানো হয়নি। অবস্থানের উৎস: OSM (ODbL) ও geoBoundaries-এর মাধ্যমে BBS/OCHA (CC BY 3.0 IGO)। অন্য তথ্য যোগ করতে শহরভিত্তিক প্রমাণ লাগবে।",
          )}
        </p>
      </details>
    </div>
  );
}
