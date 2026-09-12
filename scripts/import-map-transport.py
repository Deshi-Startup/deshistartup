#!/usr/bin/env python3
"""Build an OSM transport snapshot. No network at build time.

python3 scripts/import-map-transport.py OVERPASS.json ACQUISITION.json
Raw downloaded evidence stays outside git.
"""
import hashlib
import json
import math
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data/maps"


def write(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n")


def simplify(points, tolerance=0.00015):
    """Douglas–Peucker in degrees (~17 m latitude). Endpoints always retained."""
    if len(points) <= 2:
        return points
    a, b = points[0], points[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    length = dx * dx + dy * dy
    furthest, distance = 0, 0
    for i, p in enumerate(points[1:-1], 1):
        t = max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length)) if length else 0
        d = math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy)
        if d > distance:
            furthest, distance = i, d
    if distance <= tolerance:
        return [a, b]
    return simplify(points[:furthest + 1], tolerance)[:-1] + simplify(points[furthest:], tolerance)


def transport(path, acquisition_path):
    raw = json.loads(path.read_text())
    acquisition = json.loads(acquisition_path.read_text())
    # An import time is not an acquisition time. Require the recorded request
    # metadata and bind it to these bytes before emitting either output.
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    assert acquisition["inputSha256"] == digest, "Acquisition hash does not match input"
    retrieved = acquisition["retrieved"]
    datetime.strptime(retrieved, "%Y-%m-%d")
    assert acquisition["endpoint"].startswith("https://"), "HTTPS endpoint required"
    assert acquisition["query"].strip(), "Exact acquisition query required"
    assert raw["osm3s"]["timestamp_osm_base"][:10] <= retrieved, "Snapshot postdates acquisition"
    assert not raw.get("remark"), "Overpass reported an incomplete result"
    features = []
    for element in raw["elements"]:
        tags = element.get("tags", {})
        kind = "rail" if tags.get("railway") == "rail" else "road"
        assert kind == "rail" or tags.get("highway") in ("motorway", "trunk")
        points = [[p["lon"], p["lat"]] for p in element["geometry"]]
        assert len(points) >= 2 and all(87 < x < 94 and 20 < y < 28 for x, y in points)
        points = [[round(x, 5), round(y, 5)] for x, y in simplify(points)]
        features.append({"type": "Feature", "id": element["id"], "properties": {"kind": kind},
                         "geometry": {"type": "LineString", "coordinates": points}})
    assert features, "Empty transport snapshot"
    write(ROOT / "public/maps/transport.geojson", {"type": "FeatureCollection", "features": features})
    write(DATA / "transport.json", {
        "source": "OpenStreetMap via Overpass API", "url": "https://www.openstreetmap.org/copyright",
        "endpoint": acquisition["endpoint"], "snapshot": raw["osm3s"]["timestamp_osm_base"],
        "areaSnapshot": raw["osm3s"].get("timestamp_areas_base"), "retrieved": retrieved, "license": "ODbL 1.0",
        "inputSha256": digest,
        "query": acquisition["query"],
        "method": "OSM ways intersecting Bangladesh, selected by tags. Douglas–Peucker 0.00015-degree simplification, rounded to five decimals; endpoints retained. Ways may cross the border. No routing graph or service schedules.",
        "counts": {kind: sum(f["properties"]["kind"] == kind for f in features) for kind in ("road", "rail")},
    })
    print(f"Transport: {len(features)} ways; snapshot {raw['osm3s']['timestamp_osm_base']}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python3 scripts/import-map-transport.py OVERPASS.json ACQUISITION.json")
    transport(Path(sys.argv[1]), Path(sys.argv[2]))
