"""Reconcile BBS ICT 2024–25 Internet table transcriptions and build ict.json.

No network access or PDF/OCR dependency is required to reproduce the checked data.
Pass --pdf PATH to also verify the separately acquired official PDF's SHA-256.
See data/maps/sources/ict-2024-25/README.md for acquisition and visual checks.
"""
import argparse
import csv
import hashlib
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/maps/sources/ict-2024-25"
OUTPUT = ROOT / "data/maps/ict.json"
NATIONAL = "country-bangladesh"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_rows(path, uncertainty=False):
    numeric = ["estimate", "se", "low", "high"] if uncertainty else ["estimate"]
    fields = {"id", "sourceName", "table", "pdfPage", "printedPage", *numeric}
    rows = {}
    with path.open(newline="", encoding="utf-8") as source:
        reader = csv.DictReader(source)
        require(set(reader.fieldnames or []) == fields, f"Unexpected columns in {path.name}")
        for row in reader:
            region_id = row["id"]
            require(region_id and region_id not in rows, f"Duplicate/empty id in {path.name}: {region_id}")
            require(row["sourceName"], f"Missing source name: {region_id}")
            for field in numeric:
                require(re.fullmatch(r"\d+\.\d{1}" if field == "estimate" else r"\d+\.\d{3}", row[field]) is not None,
                        f"Unexpected published precision for {region_id}.{field}")
                row[field] = float(row[field])
                require(math.isfinite(row[field]) and 0 <= row[field] <= 100,
                        f"Invalid percentage/SE for {region_id}.{field}")
            for field in ["pdfPage", "printedPage"]:
                row[field] = int(row[field])
            if uncertainty:
                require(row["low"] <= row["estimate"] <= row["high"] and row["se"] > 0,
                        f"Invalid confidence interval: {region_id}")
            rows[region_id] = row
    return rows


def source_ref(row):
    return {key: row[key] for key in ["table", "pdfPage", "printedPage", "sourceName"]}


def build(source_dir=SOURCE, regions_path=ROOT / "data/maps/regions.json", pdf_path=None):
    metadata_path = source_dir / "metadata.json"
    result = json.loads(metadata_path.read_text(encoding="utf-8"))
    estimates_path = source_dir / "internet-estimates.csv"
    uncertainty_path = source_dir / "internet-uncertainty.csv"
    estimates = read_rows(estimates_path)
    uncertainty = read_rows(uncertainty_path, uncertainty=True)
    canonical = json.loads(regions_path.read_text(encoding="utf-8"))["regions"]
    ids = {row["id"] for row in canonical}
    districts = {row["id"] for row in canonical if row["level"] == "district"}
    divisions = {row["id"] for row in canonical if row["level"] == "division"}
    require(len(ids) == len(canonical) == 72 and len(districts) == 64 and len(divisions) == 8,
            "Expected exactly 64 canonical districts and eight divisions")
    require(set(estimates) == ids | {NATIONAL}, "Estimate IDs do not exactly match the canonical geography plus national total")
    require(set(uncertainty) == districts | {NATIONAL}, "Expected published uncertainty for exactly 64 districts and national total")

    for region_id, row in estimates.items():
        ref = (row["table"], row["pdfPage"], row["printedPage"])
        allowed = {("B-2", 283, 247), ("B-2", 284, 248)} if region_id in districts else {("7.1.1", 133, 97)}
        require(ref in allowed, f"Unexpected estimate table/page: {region_id}")
        if region_id != NATIONAL:
            name = next(r["name"]["en"] for r in canonical if r["id"] == region_id)
            # Preserve the report spelling while making the only spelling crosswalk explicit.
            expected_name = "Chapainababganj" if region_id == "district-chapainawabganj" else name
            require(row["sourceName"] == expected_name, f"Source-name/canonical-id mismatch: {region_id}")

    for region_id, row in uncertainty.items():
        require(row["estimate"] == estimates[region_id]["estimate"],
                f"Point estimate differs between main and uncertainty tables: {region_id}")
        allowed = {("SE.2", 285, 249)} if region_id == NATIONAL else {("SE.4", 305, 269), ("SE.4", 306, 270)}
        require((row["table"], row["pdfPage"], row["printedPage"]) in allowed,
                f"Unexpected uncertainty table/page: {region_id}")
        if region_id != NATIONAL:
            require(row["sourceName"] == estimates[region_id]["sourceName"],
                    f"Name differs between main and uncertainty tables: {region_id}")

    if pdf_path is not None:
        require(pdf_path.stat().st_size == result["source"]["pdfBytes"], "Official PDF byte count differs from the reviewed report")
        require(sha256(pdf_path) == result["source"]["pdfSHA256"], "Official PDF SHA-256 differs from the reviewed report")

    def observation(region_id):
        row = estimates[region_id]
        output = {"estimate": row["estimate"], "estimateSource": source_ref(row)}
        if region_id in uncertainty:
            u = uncertainty[region_id]
            output.update({key: u[key] for key in ["se", "low", "high"]})
            output["uncertaintySource"] = source_ref(u)
        return output

    result["transcription"].update({
        "importer": "scripts/import-map-ict.py",
        "inputSHA256": {p.name: sha256(p) for p in [metadata_path, estimates_path, uncertainty_path]},
        "districtEstimatesReconciled": 64,
        "divisionEstimates": 8,
        "nationalEstimatesReconciled": 1,
        "unresolvedCells": 0
    })
    result["national"] = observation(NATIONAL)
    result["regions"] = {row["id"]: observation(row["id"]) for row in canonical}
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf", type=Path, help="Verify an acquired official PDF against the checked source hash")
    parser.add_argument("--source-dir", type=Path, default=SOURCE)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--check", action="store_true", help="Validate and compare without writing")
    args = parser.parse_args()
    result = build(args.source_dir, pdf_path=args.pdf)
    serialized = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        require(args.output.read_text(encoding="utf-8") == serialized, "ict.json does not match the checked source transcriptions; rerun importer")
    else:
        args.output.write_text(serialized, encoding="utf-8")
    print("Validated 64 district estimates against SE.4, eight published division estimates and the national estimate against SE.2; preserved 65 published intervals.")


if __name__ == "__main__":
    main()
