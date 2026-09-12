export type Locale = "en" | "bn";
export type Level = "district" | "division";
export type Region = {
  id: string;
  key: string;
  level: string;
  division: string;
  name: { en: string; bn: string };
  aliases: string[];
  privateHouseholdPopulation: number | null;
  povertyRate: number | null;
  povertySE: number | null;
  metrics?: Record<string, number | null>;
  business?: {
    economicUnits: number;
    permanentEstablishments: number;
    temporaryEstablishments: number;
    economicHouseholds: number;
    sourcePage: number;
    sectorPage: number;
    sectorPersonsPage: number;
    sectors: { code: string; units: number; people: number }[];
  };
  sourcePage: number;
  point: number[];
  boundaryId?: string;
};
