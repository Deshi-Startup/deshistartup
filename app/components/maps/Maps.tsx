import regions from "../../../data/maps/regions.json";
import census from "../../../data/maps/census.json";
import ict from "../../../data/maps/ict.json";
import economy from "../../../data/maps/economy.json";
import { enrichRegion } from "./evidence";
import MapsExperience from "./MapsExperience";
import type { Locale } from "./types";

export default function Maps({ locale }: { locale: Locale }) {
  return (
    <MapsExperience
      locale={locale}
      regions={regions.regions.map((r) =>
        enrichRegion(
          r,
          census.regions[r.id as keyof typeof census.regions],
          ict.regions[r.id as keyof typeof ict.regions],
          economy.regions[r.id as keyof typeof economy.regions],
        ),
      )}
    />
  );
}
