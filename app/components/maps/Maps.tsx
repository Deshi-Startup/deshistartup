import regions from "../../../data/maps/regions.json";
import census from "../../../data/maps/census.json";
import ict from "../../../data/maps/ict.json";
import economy from "../../../data/maps/economy.json";
import urban from "../../../data/maps/urban.json";
import { enrichRegion } from "./evidence";
import MapsExperience from "./MapsExperience";
import type { Locale, UrbanPlace } from "./types";

export default function Maps({ locale }: { locale: Locale }) {
  return (
    <MapsExperience
      locale={locale}
      urbanPlaces={(urban.places as UrbanPlace[]).map(
        ({
          id,
          district,
          kind,
          name,
          aliases,
          point,
          pointSource,
          pointRole,
          households,
          householdSize,
          literacy,
          table,
          sourcePage,
        }) => ({
          id,
          district,
          kind,
          name,
          aliases: aliases || [],
          point,
          pointSource,
          pointRole,
          households,
          householdSize,
          literacy,
          table,
          sourcePage,
        }),
      )}
      urbanCoverage={urban.coverageByDistrict}
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
