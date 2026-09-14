#!/usr/bin/env python3
"""Build matching overview/detail boundaries from the pinned full BBS/OCHA source.

Maintainer-only dependencies: pip install -r scripts/maps-requirements.txt.
No downloads, statistical updates, or geometry repair is performed by this script.
"""
import argparse
import gzip
import hashlib
import json
import math
from pathlib import Path

import shapely
from shapely.geometry import mapping, shape
from shapely.ops import transform

ROOT = Path(__file__).resolve().parents[1]
SOURCE_HASH = "54379ccc77f6f59dab3569ecc5f9b3850dbed2d65a5f43a034bdf92179f5621b"
SOURCE_URL = "https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/BGD/ADM2/geoBoundaries-BGD-ADM2.geojson"
LEVELS = (("overview", 125), ("detail", 15))
RADIUS = 6378137


def project(x, y):
    return (RADIUS * math.radians(x),
            RADIUS * math.log(math.tan(math.pi / 4 + math.radians(y) / 2)))


def unproject(x, y):
    return (math.degrees(x / RADIUS),
            math.degrees(2 * math.atan(math.exp(y / RADIUS)) - math.pi / 2))


def rounded(coordinates):
    if isinstance(coordinates, (tuple, list)):
        return [rounded(c) for c in coordinates]
    return round(coordinates, 5)


def feature(region_id, geometry, boundary_id=None):
    properties = {"id": region_id}
    if boundary_id:
        properties["boundaryId"] = boundary_id
    geo = mapping(geometry)
    geo["coordinates"] = rounded(geo["coordinates"])
    return {"type": "Feature", "properties": properties, "geometry": geo}


def validate_coverage(geometries):
    if any(g.is_empty for g in geometries) or not shapely.is_valid(geometries).all():
        raise ValueError("Empty or invalid boundary geometry")
    if not shapely.coverage_is_valid(geometries):
        raise ValueError("Districts must have exactly matching edges and no overlaps")


def render_outline(country):
    """Split only for styling; preserve the exact dissolved coordinates."""
    geometry = country["geometry"]
    polygons = [geometry["coordinates"]] if geometry["type"] == "Polygon" else geometry["coordinates"]
    areas = [abs(sum(a[0] * b[1] - b[0] * a[1]
                     for a, b in zip(p[0], p[0][1:]))) for p in polygons]
    threshold = max(areas) * 0.01
    return [{"type": "Feature",
             "properties": {"id": f"country-outline-{i}", "national": True,
                            "minor": areas[i] < threshold},
             "geometry": {"type": "Polygon", "coordinates": p}}
            for i, p in enumerate(polygons)]


def build_levels(raw, regions):
    """Simplify the entire coverage together, then derive every parent boundary."""
    if shapely.geos_version < (3, 12, 0):
        raise RuntimeError("Boundary imports require GEOS 3.12 or newer")
    rows = {r["boundaryId"]: r for r in regions if r["level"] == "district"}
    features = raw["features"]
    ids = [f["properties"]["shapeID"] for f in features]
    if len(ids) != 64 or len(set(ids)) != 64 or set(ids) != set(rows):
        raise ValueError("Source district IDs must match all 64 statistical districts")
    original = [shape(f["geometry"]) for f in features]
    validate_coverage(original)
    projected = [transform(project, g) for g in original]
    results = {}
    for name, tolerance in LEVELS:
        # GEOS coverage simplification preserves shared edges and polygon validity.
        # Its Visvalingam tolerance is an area-derived scale, NOT an accuracy bound.
        simplified = shapely.coverage_simplify(projected, tolerance)
        geometries = shapely.set_precision(
            [transform(unproject, g) for g in simplified], 0.00001)
        validate_coverage(geometries)
        if any(shapely.get_num_geometries(a) != shapely.get_num_geometries(b)
               for a, b in zip(original, geometries)):
            raise ValueError("Simplification must not discard islands/components")
        out = [feature(rows[bid]["id"], g, bid) for bid, g in zip(ids, geometries)]
        for division in (r for r in regions if r["level"] == "division"):
            members = [g for bid, g in zip(ids, geometries)
                       if rows[bid]["division"] == division["key"]]
            out.append(feature(division["id"], shapely.coverage_union_all(members)))
        out.append(feature("country-bangladesh", shapely.coverage_union_all(geometries)))
        # Check serialized coordinates too: decimal conversion must not break topology.
        serialized = [shape(f["geometry"]) for f in out]
        validate_coverage(serialized[:64])
        if len(out) != 73 or not shapely.is_valid(serialized).all():
            raise ValueError("Expected 64 valid districts, 8 divisions and one country")
        if name == "overview":
            results["bangladesh-2020.geojson"] = (
                json.dumps({"type": "FeatureCollection", "features": out},
                           separators=(",", ":")) + "\n").encode()
        else:
            # Download and index only the geographic level being explored.
            # Outlines are prepared offline so the browser worker can read the URL.
            for level in ("district", "division"):
                rendered = [f for f in out if f["properties"]["id"].startswith(f"{level}-")]
                rendered += render_outline(out[-1])
                results[f"bangladesh-2020-{level}-detail.geojson"] = (
                    json.dumps({"type": "FeatureCollection", "features": rendered},
                               separators=(",", ":")) + "\n").encode()
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--retrieved", help="Actual source retrieval date, YYYY-MM-DD")
    parser.add_argument("--check", action="store_true", help="Compare without writing")
    args = parser.parse_args()
    source = args.source.read_bytes()
    if hashlib.sha256(source).hexdigest() != SOURCE_HASH:
        raise ValueError("Input does not match the pinned full-resolution source")
    metadata_path = ROOT / "data/maps/boundaries.json"
    retrieved = args.retrieved
    if args.check and not retrieved:
        retrieved = json.loads(metadata_path.read_text())["retrieved"]
    from datetime import date
    if not retrieved or date.fromisoformat(retrieved).isoformat() != retrieved:
        raise ValueError("Supply the actual --retrieved YYYY-MM-DD date")
    regions = json.loads((ROOT / "data/maps/regions.json").read_text())["regions"]
    outputs = build_levels(json.loads(source), regions)
    metadata = {
        "source": "BBS / OCHA ROAP via geoBoundaries", "boundaryYear": 2020,
        "boundaryId": "BGD-ADM2-16705992", "release": "9469f09",
        "sourceUrl": SOURCE_URL, "sourceSha256": SOURCE_HASH,
        "sourceBytes": len(source), "retrieved": retrieved,
        "license": "CC BY 3.0 IGO",
        "licenseUrl": "https://creativecommons.org/licenses/by/3.0/igo/",
        "method": "Coverage-preserving Visvalingam simplification in EPSG:3857; precision grid 0.00001 degrees; divisions and country dissolved from the same districts. Tolerances are cartographic scales, not surveyed accuracy bounds.",
        "shapelyVersion": shapely.__version__, "geosVersion": shapely.geos_version_string,
        "detailMinZoom": 9,
        "levels": [{"name": "detail" if "detail" in filename else "overview",
                    "geography": "district" if "district-detail" in filename else
                                 "division" if "division-detail" in filename else "both",
                    "tolerance": 15 if "detail" in filename else 125, "file": filename,
                    "bytes": len(data),
                    "gzipBytes": len(gzip.compress(data, mtime=0)),
                    "sha256": hashlib.sha256(data).hexdigest()}
                   for filename, data in outputs.items()],
        "limitations": "2020 administrative geography, not current surveyed borders or a validated 2022 census boundary match. No snapping to basemap borders, roads or riverbanks. The full input is not shipped to browsers."
    }
    files = {ROOT / "public/maps" / name: data for name, data in outputs.items()}
    files[metadata_path] = (json.dumps(metadata, indent=2) + "\n").encode()
    # Validate every output before touching any maintained file.
    for path, data in files.items():
        if args.check:
            if not path.exists() or path.read_bytes() != data:
                raise ValueError(f"Generated boundary output differs: {path.name}")
        else:
            path.write_bytes(data)
    print("Verified 64 district joins, valid shared edges, retained components and 73 hierarchical features per resolution.")
    for level in metadata["levels"]:
        print(f"{level['file']}: {level['bytes']:,} bytes / {level['gzipBytes']:,} gzip")


if __name__ == "__main__":
    main()
