#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dryRunDir = path.join(root, ".wrangler", "dry-run");
const workerPath = fs.existsSync(dryRunDir)
  ? fs
      .readdirSync(dryRunDir)
      .filter((name) => name.endsWith(".js"))
      .map((name) => path.join(dryRunDir, name))
      .sort((left, right) => fs.statSync(right).mtimeMs - fs.statSync(left).mtimeMs)[0]
  : null;
const freePlanLimit = 3 * 1024 * 1024;
const projectBudget = 512 * 1024;

if (!workerPath) {
  console.error("worker-size: dry-run bundle is missing; run npm run check:worker");
  process.exit(1);
}

// Wrangler reports gzip at zlib's default compression level. Matching it here
// turns the documented Free-plan upload limit into a deterministic CI check.
const gzipBytes = gzipSync(fs.readFileSync(workerPath)).byteLength;
const headroom = freePlanLimit - gzipBytes;
const projectHeadroom = projectBudget - gzipBytes;
const kib = (bytes) => (bytes / 1024).toFixed(2);

console.log(
  `worker-size: ${kib(gzipBytes)} KiB gzip; ${kib(Math.max(0, projectHeadroom))} KiB project headroom; ${kib(Math.max(0, headroom))} KiB Cloudflare headroom`,
);

if (headroom < 0) {
  console.error(
    `worker-size: exceeds Cloudflare's 3 MiB Free-plan limit by ${kib(-headroom)} KiB`,
  );
  process.exit(1);
}

if (projectHeadroom < 0) {
  console.error(
    `worker-size: exceeds the project's 512 KiB growth budget by ${kib(-projectHeadroom)} KiB`,
  );
  process.exit(1);
}
