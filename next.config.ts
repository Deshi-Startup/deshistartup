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

// Nextra's wrapper aliases the bare specifier `next-mdx-import-source-file`
// (which every compiled MDX file imports via `providerImportSource`) to
// `@vercel/turbopack-next/mdx-import-source` — a virtual module that only
// exists under Next.js's Turbopack. vinext reads `turbopack.resolveAlias`
// and feeds it to Vite, where that virtual module fails to resolve.
// Override it here to point at the project's mdx-components module instead.
// nextra spreads the user's `resolveAlias` last, so this wins.
const mdxImportSourceAlias = {
  turbopack: {
    resolveAlias: {
      "next-mdx-import-source-file": "./mdx-components.tsx",
    },
  },
};

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
const basePath = process.env.DEPLOY_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  outputFileTracingRoot: projectRoot,
  ...turboRootConfig,
  ...mdxImportSourceAlias,
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
};

export default withNextra(nextConfig);
