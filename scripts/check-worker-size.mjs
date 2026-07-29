#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workerPath = path.join(root, ".wrangler", "dry-run", "worker.js");
const freePlanLimit = 3 * 1024 * 1024;

if (!fs.existsSync(workerPath)) {
  console.error("worker-size: dry-run bundle is missing; run npm run check:worker");
  process.exit(1);
}

// Wrangler reports gzip at zlib's default compression level. Matching it here
// turns the documented Free-plan upload limit into a deterministic CI check.
const gzipBytes = gzipSync(fs.readFileSync(workerPath)).byteLength;
const headroom = freePlanLimit - gzipBytes;
const kib = (bytes) => (bytes / 1024).toFixed(2);

console.log(
  `worker-size: ${kib(gzipBytes)} KiB gzip; ${kib(Math.max(0, headroom))} KiB headroom`,
);

if (headroom < 0) {
  console.error(
    `worker-size: exceeds Cloudflare's 3 MiB Free-plan limit by ${kib(-headroom)} KiB`,
  );
  process.exit(1);
}
