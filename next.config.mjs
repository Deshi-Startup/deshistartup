import nextra from "nextra";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const [nextMajor, nextMinor] = require("next/package.json")
  .version.split(".")
  .map(Number);
const turboRootConfig =
  nextMajor > 15 || (nextMajor === 15 && nextMinor >= 3)
    ? { turbopack: { root: projectRoot } }
    : { experimental: { turbo: { root: projectRoot } } };

const withNextra = nextra({
  search: {
    codeblocks: false,
  },
});

// Deploy targets mount the site at different roots:
//   - GitHub Pages serves the project under /deshistartup (a repo subpath)
//   - The custom domain deshistartup.com (Cloudflare Pages) serves from the root
// Cloudflare's build environment sets CF_PAGES=1, so we detect it and drop the
// basePath there. DEPLOY_BASE_PATH overrides everything (handy for local testing).
const isCloudflare = process.env.CF_PAGES === "1";
const basePath =
  process.env.DEPLOY_BASE_PATH ??
  (process.env.NODE_ENV === "production" && !isCloudflare
    ? "/deshistartup"
    : "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  output: "export",
  outputFileTracingRoot: projectRoot,
  ...turboRootConfig,
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
};

export default withNextra(nextConfig);
