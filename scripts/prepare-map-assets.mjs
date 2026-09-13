// MapLibre 6 publishes an ES-module worker with a relative shared-module import.
// Copy both locked-package files; emitting the worker alone breaks static exports.
import { mkdir, copyFile } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const target = new URL("public/maps/worker/", root);
await mkdir(target, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"])
  await copyFile(
    new URL("node_modules/maplibre-gl/dist/" + file, root),
    new URL(file, target),
  );
await copyFile(
  new URL("node_modules/maplibre-gl/LICENSE.txt", root),
  new URL("LICENSE.txt", target),
);
