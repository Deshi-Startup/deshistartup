"""Data-contract and adversarial ingestion checks for the ICT Internet import."""
import csv
import importlib.util
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).with_name("import-map-ict.py")
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("import_map_ict", SCRIPT)
ict = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ict)


class ICTImportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.source = Path(self.temp.name) / "source"
        shutil.copytree(ict.SOURCE, self.source)

    def tearDown(self):
        self.temp.cleanup()

    def rewrite(self, filename, change):
        path = self.source / filename
        with path.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            fields = reader.fieldnames
            rows = list(reader)
        change(rows)
        with path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            writer.writerows(rows)

    def test_complete_release_reproduces_and_preserves_published_precision(self):
        data = ict.build()
        self.assertEqual(data, json.loads(ict.OUTPUT.read_text(encoding="utf-8")))
        self.assertEqual(len(data["regions"]), 72)
        self.assertEqual(sum("se" in r for r in data["regions"].values()), 64)
        self.assertEqual(data["national"]["estimate"], 53.4)
        self.assertEqual(data["national"]["low"], 52.642)
        dhaka = data["regions"]["district-dhaka"]
        self.assertEqual((dhaka["estimate"], dhaka["se"], dhaka["low"], dhaka["high"]),
                         (80.3, 1.275, 77.773, 82.775))
        kushtia = data["regions"]["district-kushtia"]
        self.assertEqual((kushtia["estimate"], kushtia["se"], kushtia["low"], kushtia["high"]),
                         (45.9, 2.960, 40.091, 51.700))
        self.assertEqual(data["regions"]["division-dhaka"]["estimate"], 66.1)
        self.assertNotIn("low", data["regions"]["division-dhaka"])
        self.assertIsNone(data["publication"]["reportDate"])
        self.assertEqual(data["publication"]["registerUploadDate"], "2026-04-20")

    def test_inconsistent_independently_transcribed_estimate_is_rejected(self):
        self.rewrite("internet-uncertainty.csv", lambda rows: rows[1].update(estimate="46.8"))
        with self.assertRaisesRegex(ValueError, "differs between main and uncertainty"):
            ict.build(self.source)

    def test_missing_district_is_rejected(self):
        self.rewrite("internet-estimates.csv", lambda rows: rows.pop())
        with self.assertRaisesRegex(ValueError, "exactly match"):
            ict.build(self.source)

    def test_duplicate_id_is_rejected(self):
        self.rewrite("internet-estimates.csv", lambda rows: rows.append(dict(rows[-1])))
        with self.assertRaisesRegex(ValueError, "Duplicate/empty id"):
            ict.build(self.source)

    def test_geographic_name_swap_is_rejected(self):
        def swap(rows):
            rows[9]["id"], rows[10]["id"] = rows[10]["id"], rows[9]["id"]
        self.rewrite("internet-estimates.csv", swap)
        with self.assertRaisesRegex(ValueError, "Source-name/canonical-id mismatch"):
            ict.build(self.source)

    def test_fabricated_division_uncertainty_is_rejected(self):
        self.rewrite("internet-uncertainty.csv", lambda rows: rows.append({**rows[1], "id": "division-dhaka"}))
        with self.assertRaisesRegex(ValueError, "exactly 64 districts"):
            ict.build(self.source)

    def test_rounded_source_confidence_limit_is_rejected(self):
        self.rewrite("internet-uncertainty.csv", lambda rows: rows[1].update(low="41.33"))
        with self.assertRaisesRegex(ValueError, "Unexpected published precision"):
            ict.build(self.source)

    def test_different_pdf_is_rejected(self):
        pdf = Path(self.temp.name) / "different.pdf"
        pdf.write_bytes(b"different report")
        with self.assertRaisesRegex(ValueError, "PDF byte count differs"):
            ict.build(self.source, pdf_path=pdf)


if __name__ == "__main__":
    unittest.main()
