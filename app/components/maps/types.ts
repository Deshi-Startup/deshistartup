export type Locale = "en" | "bn";
export type Level = "district" | "division";
export type UrbanPlace = {
  id: string;
  district: string;
  kind: "city-corporation" | "municipality";
  name: { en: string; bn: string };
  aliases?: string[];
  point: number[];
  pointRole?: "place-node" | "municipal-office" | "reference-point";
  pointSource: string;
  households: number;
  householdSize: number;
  literacy: number;
  table: string;
  sourcePage: number;
};
export type UrbanCoverage = {
  reportRecords: number;
  mappedRecords: number;
  excluded: { name: string; sourcePage: number; reason: string }[];
};
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
