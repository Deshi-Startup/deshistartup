#!/usr/bin/env python3
"""Extract verified P23/P25 jurisdiction rows from the BBS Census 2022 Urban report.

Requires pdftotext (Poppler). Writes reviewable JSON to stdout; never changes map data.
Usage: python3 scripts/extract-map-urban-census.py /path/to/urban.pdf > /tmp/urban-rows.json
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

REPORT_SHA256 = "c6667f66afde3622d0eb0e0288c3b1755c6575464577bfe0870b957f24c545fb"
EXPECTED = {"P23": (12, 5199182), "P25": (326, 4314126)}
NUMBER = r"\d+(?:\.\d+)?"
ROW = re.compile(r"^(.*?)\s+(" + NUMBER + r"(?:\s+" + NUMBER + r"){16})\s*$")


def extract(text):
    pages = text.split("\f")
    rows = []
    for start, end, table in [(259, 268, "P23"), (273, 334, "P25")]:
        current = None
        district = None
        for page in range(start, end + 1):
            lines = pages[page - 1].splitlines()
            for index, line in enumerate(lines):
                match = ROW.match(line.strip())
                if not match:
                    continue
                name = match[1].strip()
                values = [float(v) if "." in v else int(v) for v in match[2].split()]
                if name.startswith("Ward"):
                    if current is not None:
                        current["wardHouseholds"].append(values[1])
                    continue
                if name.endswith("District"):
                    district = name.removesuffix(" District")
                    current = None
                    continue
                # Repeated numeric column headings must not interrupt a jurisdiction.
                if name == "1":
                    continue
                if name == "Total" or name.endswith("Division"):
                    current = None
                    continue
                following = lines[index + 1].strip() if index + 1 < len(lines) else ""
                if following in ["Paurashava", "City Corporation", "Corporation"]:
                    name += " " + following
                if not name.endswith("Paurashava" if table == "P25" else "City Corporation"):
                    raise ValueError(f"Unexpected jurisdiction name on PDF page {page}: {name}")
                if values[0] != sum(values[1:4]):
                    raise ValueError(f"Household categories do not reconcile: {name}")
                current = dict(sourceName=name, district=district, sourcePage=page,
                               table=table, households=values[1], householdSize=values[10],
                               literacy=values[11], wardHouseholds=[])
                rows.append(current)
    for row in rows:
        wards = row.pop("wardHouseholds")
        if not wards or sum(wards) != row["households"]:
            raise ValueError(f"Ward households do not reconcile: {row['sourceName']}")
    for table, (count, total) in EXPECTED.items():
        subset = [r for r in rows if r["table"] == table]
        if len(subset) != count or sum(r["households"] for r in subset) != total:
            raise ValueError(f"National household total or record count does not reconcile: {table}")
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path)
    args = parser.parse_args()
    if hashlib.sha256(args.pdf.read_bytes()).hexdigest() != REPORT_SHA256:
        parser.error("Report bytes changed. Review tables, definitions and page ranges before updating this extractor.")
    text = subprocess.run(["pdftotext", "-layout", str(args.pdf), "-"],
                          capture_output=True, text=True, check=True).stdout
    rows = extract(text)
    json.dump(rows, sys.stdout, ensure_ascii=False, indent=2)
    print()


if __name__ == "__main__":
    main()
