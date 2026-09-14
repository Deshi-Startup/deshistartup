"""Validate shipped boundary coverage. Uses scripts/maps-requirements.txt."""
import json
import unittest
from pathlib import Path

import shapely
from shapely.geometry import shape

ROOT = Path(__file__).resolve().parents[1]


class BoundaryCoverageTests(unittest.TestCase):
    def test_both_levels_are_valid_matching_coverages(self):
        regions = json.loads((ROOT / "data/maps/regions.json").read_text())["regions"]
        rows = {r["id"]: r for r in regions}
        for filename in ["bangladesh-2020.geojson", "detail"]:
            with self.subTest(filename=filename):
                if filename == "detail":
                    packets = [json.loads((ROOT / "public/maps" / f"bangladesh-2020-{level}-detail.geojson").read_text())["features"]
                               for level in ["district", "division"]]
                    features = [f for packet in packets for f in packet if not f["properties"].get("national")]
                    features.append({"properties": {"id": "country-bangladesh"}, "geometry": {
                        "type": "MultiPolygon", "coordinates": [f["geometry"]["coordinates"] for f in packets[0] if f["properties"].get("national")]}})
                else:
                    features = json.loads((ROOT / "public/maps" / filename).read_text())["features"]
                by_id = {f["properties"]["id"]: shape(f["geometry"]) for f in features}
                districts = [g for key, g in by_id.items() if key.startswith("district-")]
                self.assertTrue(shapely.is_valid(list(by_id.values())).all())
                self.assertTrue(shapely.coverage_is_valid(districts))
                self.assertTrue(shapely.coverage_union_all(districts).equals(by_id["country-bangladesh"]))
                if "detail" in filename:
                    from shapely.geometry import Point
                    sites = json.loads((ROOT / "data/maps/ports.json").read_text())["sites"]
                    for site in sites:
                        self.assertTrue(by_id[site["district"]].covers(Point(site["point"])), site["id"])
                for key, geometry in by_id.items():
                    if key.startswith("division-"):
                        members = [g for k, g in by_id.items() if k.startswith("district-")
                                   and rows[k]["division"] == rows[key]["key"]]
                        self.assertTrue(shapely.coverage_union_all(members).equals(geometry), key)


if __name__ == "__main__":
    unittest.main()
