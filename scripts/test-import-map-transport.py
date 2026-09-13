"""Acquisition failures must leave the previous published snapshot untouched."""
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import sys
import unittest

sys.dont_write_bytecode = True

spec = importlib.util.spec_from_file_location("transport", Path(__file__).with_name("import-map-transport.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class AcquisitionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        module.ROOT, module.DATA = self.root, self.root / "data"
        module.DATA.mkdir()
        (self.root / "public/maps").mkdir(parents=True)
        self.output = self.root / "public/maps/transport.geojson"
        self.output.write_text("previous snapshot")
        self.raw = self.root / "raw.json"
        self.raw.write_text(json.dumps({"osm3s": {"timestamp_osm_base": "2026-09-11T01:00:00Z"}, "elements": [{"id": 1, "tags": {"highway": "trunk"}, "geometry": [{"lon": 90, "lat": 24}, {"lon": 90.1, "lat": 24.1}]}]}))
        self.meta = {"retrieved": "2026-09-11", "endpoint": "https://example.org/api/interpreter", "query": "recorded request", "inputSha256": hashlib.sha256(self.raw.read_bytes()).hexdigest()}
        self.manifest = self.root / "acquisition.json"

    def run_import(self):
        self.manifest.write_text(json.dumps(self.meta))
        module.transport(self.raw, self.manifest)

    def test_keeps_recorded_acquisition_date_and_request(self):
        self.run_import()
        result = json.loads((module.DATA / "transport.json").read_text())
        for key, value in self.meta.items():
            self.assertEqual(result[key], value)

    def test_rejects_a_different_download_before_writing(self):
        self.meta["inputSha256"] = "0" * 64
        with self.assertRaisesRegex(AssertionError, "hash"):
            self.run_import()
        self.assertEqual(self.output.read_text(), "previous snapshot")

    def test_rejects_snapshot_after_claimed_retrieval(self):
        self.meta["retrieved"] = "2026-09-10"
        with self.assertRaisesRegex(AssertionError, "postdates"):
            self.run_import()
        self.assertEqual(self.output.read_text(), "previous snapshot")


if __name__ == "__main__":
    unittest.main()
