import type { Locale, Region } from "./types";
import { ECONOMY_URL, words } from "./layers";
import {
  activityShare,
  ECONOMY_SECTOR_URL,
  orderedActivities,
  sectorNames,
} from "./business";

export default function BusinessProfile({
  region,
  locale,
}: {
  region: Region;
  locale: Locale;
}) {
  const b = region.business;
  if (!b)
    return (
      <p className="maps-small">
        {locale === "en"
          ? "Business activity data unavailable for this region."
          : "এই অঞ্চলের অর্থনৈতিক কর্মকাণ্ডের তথ্য নেই।"}
      </p>
    );
  const t = (en: string, bn: string) => (locale === "en" ? en : bn);
  const number = (value: number, digits = 0) =>
    new Intl.NumberFormat(locale === "en" ? "en-GB" : "bn-BD", {
      maximumFractionDigits: digits,
    }).format(value);
  const activities = orderedActivities(b);
  return (
    <details className="maps-business" key={region.id}>
      <summary>
        <span>
          {t("Business activity", "অর্থনৈতিক কর্মকাণ্ড")}
          <small>
            {number(b.economicUnits)}{" "}
            {t("economic units · 2024", "অর্থনৈতিক ইউনিট · ২০২৪")}
          </small>
        </span>
      </summary>
      <p className="maps-small">
        {t(
          "A starting point for finding potential business customers. These counts do not measure sales, budgets or demand for your service.",
          "সম্ভাব্য বিজনেস কাস্টমার খোঁজার প্রাথমিক তথ্য। এই সংখ্যা বিক্রি, বাজেট বা আপনার সেবার চাহিদা বোঝায় না।",
        )}
      </p>
      <dl className="maps-business-counts">
        <div>
          <dt>{t("Permanent establishments", "স্থায়ী প্রতিষ্ঠান")}</dt>
          <dd>{number(b.permanentEstablishments)}</dd>
        </div>
        <div>
          <dt>{t("Temporary establishments", "অস্থায়ী প্রতিষ্ঠান")}</dt>
          <dd>{number(b.temporaryEstablishments)}</dd>
        </div>
        <div>
          <dt>{t("Economic households", "অর্থনৈতিক কর্মকাণ্ডে যুক্ত খানা")}</dt>
          <dd>{number(b.economicHouseholds)}</dd>
        </div>
      </dl>
      <a
        className="maps-business-source"
        href={`${ECONOMY_URL}#page=${b.sourcePage}`}
        target="_blank"
        rel="noreferrer"
      >
        {t(
          "BBS · Economic Census 2024 · S2",
          "বিবিএস · অর্থনৈতিক শুমারি ২০২৪ · S2",
        )}{" "}
        ↗
      </a>
      <h3>{t("Largest activities", "প্রধান কর্মকাণ্ড")}</h3>
      <p className="maps-small">
        {t(
          "By number of permanent establishments. Shares use permanent establishments only.",
          "স্থায়ী প্রতিষ্ঠানের সংখ্যা অনুযায়ী। অনুপাতের হিসাবে শুধু স্থায়ী প্রতিষ্ঠান আছে।",
        )}
      </p>
      <ol className="maps-activity-bars">
        {activities
          .filter((s) => s.units > 0)
          .slice(0, 3)
          .map((s) => {
            const share = activityShare(s.units, b.permanentEstablishments);
            return (
              <li key={s.code}>
                <div>
                  <span>{words(sectorNames[s.code], locale)}</span>
                  <strong>
                    {share === null ? "—" : number(share, 1) + "%"}
                  </strong>
                </div>
                <span className="maps-activity-track" aria-hidden="true">
                  <i style={{ width: `${share ?? 0}%` }} />
                </span>
                <small>
                  {number(s.units)} {t("establishments", "প্রতিষ্ঠান")}
                </small>
              </li>
            );
          })}
      </ol>
      <details className="maps-activity-detail">
        <summary>
          {t("All activities & scope", "সব কর্মকাণ্ড ও হিসাবের আওতা")}
        </summary>
        <table className="maps-activity-table">
          <caption>
            {t("Permanent establishments · 2024", "স্থায়ী প্রতিষ্ঠান · ২০২৪")}
          </caption>
          <thead>
            <tr>
              <th scope="col">{t("Activity", "কর্মকাণ্ড")}</th>
              <th scope="col">{t("Units", "প্রতিষ্ঠান")}</th>
              <th scope="col">{t("People engaged", "নিয়োজিত ব্যক্তি")}</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((s) => (
              <tr key={s.code}>
                <th scope="row">{words(sectorNames[s.code], locale)}</th>
                <td>{number(s.units)}</td>
                <td>{number(s.people)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="maps-small">
          {t(
            "People engaged includes working owners, unpaid family workers and part-time workers. This table covers permanent establishments only; temporary and household activity is excluded. Public and nonprofit establishments are included. Ordinary household crop farming is outside census scope, while farm-based livestock, poultry, fishery and nursery establishments are included.",
            "নিয়োজিত ব্যক্তিদের মধ্যে কর্মরত মালিক, বিনা বেতনে কাজ করা পরিবারের সদস্য ও খণ্ডকালীন কর্মীও আছেন। এই টেবিলে শুধু স্থায়ী প্রতিষ্ঠান আছে, অস্থায়ী প্রতিষ্ঠান ও খানার কাজ বাদ। সরকারি ও অলাভজনক প্রতিষ্ঠানও আছে। সাধারণ খানার ফসল চাষ শুমারির আওতার বাইরে। তবে পশুপালন, হাঁস-মুরগি, মৎস্য ও নার্সারির প্রতিষ্ঠান অন্তর্ভুক্ত।",
          )}
        </p>
        <p className="maps-small">
          {t(
            "Activity is classified by the establishment’s main activity. It does not establish regional GDP, exports, imports or an underserved market.",
            "প্রতিষ্ঠানের প্রধান কাজ অনুযায়ী খাত নির্ধারণ করা হয়েছে। এতে আঞ্চলিক জিডিপি, আমদানি-রপ্তানি বা সেবার ঘাটতি বোঝা যায় না।",
          )}
        </p>
        <a
          className="maps-business-source"
          href={`${ECONOMY_SECTOR_URL}#page=${b.sectorPersonsPage}`}
          target="_blank"
          rel="noreferrer"
        >
          {t(
            "People engaged · Volume II, S5",
            "নিয়োজিত ব্যক্তি · দ্বিতীয় খণ্ড, S5",
          )}{" "}
          ↗
        </a>
      </details>
      <a
        className="maps-business-source"
        href={`${ECONOMY_SECTOR_URL}#page=${b.sectorPage}`}
        target="_blank"
        rel="noreferrer"
      >
        {t(
          "Activity counts · Volume II, S4",
          "কর্মকাণ্ডের সংখ্যা · দ্বিতীয় খণ্ড, S4",
        )}{" "}
        ↗
      </a>
    </details>
  );
}
