import type { Region } from "./types.ts";

type InternetEvidence = {
  estimate: number;
  estimateSource: { pdfPage: number };
  se?: number;
  low?: number;
  high?: number;
  uncertaintySource?: { pdfPage: number };
};
type BusinessEvidence = {
  economicUnits: number;
  permanentEstablishments: number;
  temporaryEstablishments: number;
  economicHouseholds: number;
  source: { pdfPage: number };
  sectorEstablishmentsSource: { pdfPage: number };
  sectorPersonsSource: { pdfPage: number };
  sectors: Record<
    string,
    { permanentEstablishments: number; personsEngaged: number }
  >;
};

/** Merge by canonical region ID at the server boundary; keep historical source files intact. */
export function enrichRegion(
  region: Region,
  census: Record<string, number | null> | undefined,
  internet: InternetEvidence | undefined,
  business: BusinessEvidence | undefined,
): Region {
  return {
    ...region,
    metrics: {
      ...census,
      // A missing new estimate must not silently fall back to an older observation.
      internet: internet?.estimate ?? null,
      internetPage: internet?.estimateSource.pdfPage ?? null,
      internetLow: internet?.low ?? null,
      internetHigh: internet?.high ?? null,
      internetIntervalPage: internet?.uncertaintySource?.pdfPage ?? null,
      economicUnits: business?.economicUnits ?? null,
      economicUnitsPage: business?.source.pdfPage ?? null,
    },
    business: business
      ? {
          economicUnits: business.economicUnits,
          permanentEstablishments: business.permanentEstablishments,
          temporaryEstablishments: business.temporaryEstablishments,
          economicHouseholds: business.economicHouseholds,
          sourcePage: business.source.pdfPage,
          sectorPage: business.sectorEstablishmentsSource.pdfPage,
          sectorPersonsPage: business.sectorPersonsSource.pdfPage,
          sectors: Object.entries(business.sectors).map(([code, value]) => ({
            code,
            units: value.permanentEstablishments,
            people: value.personsEngaged,
          })),
        }
      : undefined,
  };
}
