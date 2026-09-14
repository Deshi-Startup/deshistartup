"""Run every map importer suite, whose filenames use repository-style hyphens."""
from pathlib import Path
import subprocess
import sys

tests = sorted(Path(__file__).parent.glob("test-import-map-*.py"))
if not tests:
    raise SystemExit("No map importer tests found")
for test in tests:
    print(f"\n{test.name}", flush=True)
    subprocess.run([sys.executable, "-B", str(test)], check=True)
