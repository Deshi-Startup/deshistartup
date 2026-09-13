"""Data regression and adversarial checks for final Economic Census extraction."""
import csv
import importlib.util
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("import_map_economy", Path(__file__).with_name("import-map-economy.py"))
economy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(economy)


class EconomyImportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.source = Path(self.temp.name) / "source"
        shutil.copytree(economy.SOURCE, self.source)

    def tearDown(self):
        self.temp.cleanup()

    def change_csv(self, filename, change):
        path = self.source / filename
        with path.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            fields, rows = reader.fieldnames, list(reader)
        change(rows)
        with path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            writer.writerows(rows)

    def test_release_reproduces_with_correct_scope_and_column_order(self):
        result = economy.build()
        self.assertEqual(result, json.loads(economy.OUTPUT.read_text(encoding="utf-8")))
        self.assertEqual(len(result["regions"]), 72)
        n = result["national"]
        self.assertEqual([n[m] for m in economy.METRICS],
                         [11702792, 6269457, 573969, 4859366, 30632661, 23748083, 778984, 6105594])
        # Values read from the first S4/S5 page also protect the B–S column mapping.
        self.assertEqual([n["sectors"][c]["permanentEstablishments"] for c in economy.CODES],
                         [582, 462936, 3405, 2337, 2179, 3430066, 69863, 756386, 22988,
                          76176, 2565, 48013, 134298, 30352, 273792, 105865, 9460, 838194])
        self.assertEqual([n["sectors"][c]["personsEngaged"] for c in economy.CODES],
                         [8153, 8006574, 140391, 23892, 40962, 6274223, 308386, 1362885, 134212,
                          673953, 36856, 266847, 402399, 792286, 2418790, 700976, 107959, 2048339])
        dhaka = result["regions"]["district-dhaka"]
        self.assertEqual(dhaka["permanentEstablishments"], 713515)
        self.assertEqual(dhaka["sectors"]["C"], {"permanentEstablishments": 55509, "personsEngaged": 1686884})
        self.assertEqual(result["regions"]["district-sylhet"]["permanentPersonsEngaged"], 420102)
        self.assertEqual(result["source"]["sectorShareDenominator"], "permanentEstablishments")

    def test_missing_locality_row_is_rejected(self):
        self.change_csv("permanent-sector-establishments.csv", lambda rows: rows.pop())
        with self.assertRaisesRegex(ValueError, "expected 219 unique"):
            economy.build(self.source)

    def test_duplicate_region_locality_is_rejected(self):
        self.change_csv("totals.csv", lambda rows: rows.append(dict(rows[0])))
        with self.assertRaisesRegex(ValueError, "expected 219 unique"):
            economy.build(self.source)

    def test_sector_change_is_rejected_against_permanent_total(self):
        self.change_csv("permanent-sector-establishments.csv", lambda rows: rows[0].update(G="3430067"))
        with self.assertRaisesRegex(ValueError, "Sector totals differ from S2"):
            economy.build(self.source)

    def test_sector_transfer_that_preserves_row_sum_fails_locality_check(self):
        self.change_csv("permanent-sector-persons.csv", lambda rows: rows[0].update(B="8154", C="8006573"))
        with self.assertRaisesRegex(ValueError, "Rural/urban mismatch"):
            economy.build(self.source)

    def test_misaligned_geographic_label_is_rejected(self):
        self.change_csv("totals.csv", lambda rows: rows[6].update(sourceName="Barishal"))
        with self.assertRaisesRegex(ValueError, "source-name/id mismatch"):
            economy.build(self.source)

    def test_independent_s3_disagreement_is_rejected(self):
        self.change_csv("regional-checks.csv", lambda rows: rows[0].update(s3PersonsEngaged="30630923"))
        with self.assertRaisesRegex(ValueError, "S2/S3 mismatch"):
            economy.build(self.source)

    def test_all_unit_sector_denominator_is_rejected(self):
        path = self.source / "metadata.json"
        metadata = json.loads(path.read_text(encoding="utf-8"))
        metadata["source"]["sectorShareDenominator"] = "economicUnits"
        path.write_text(json.dumps(metadata), encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "permanent-establishment denominator"):
            economy.build(self.source)


if __name__ == "__main__":
    unittest.main()
