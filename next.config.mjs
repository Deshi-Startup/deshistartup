import nextra from 'nextra'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const [nextMajor, nextMinor] = require('next/package.json').version.split('.').map(Number)
const turboRootConfig =
  nextMajor > 15 || (nextMajor === 15 && nextMinor >= 3)
    ? { turbopack: { root: projectRoot } }
    : { experimental: { turbo: { root: projectRoot } } }

const withNextra = nextra({
  search: {
    codeblocks: false
  }
})

// Deploy targets mount the site at different roots:
//   - GitHub Pages serves the project under /deshistartup (a repo subpath)
//   - deshistartup.com (Cloudflare Pages or Workers) serves from the root
// DEPLOY_BASE_PATH overrides everything. The explicit Worker target is inherited
// by the nested Next build that OpenNext runs.
const isRootDeployment =
  process.env.CF_PAGES === '1' ||
  process.env.DESHI_DEPLOY_TARGET === 'cloudflare-worker'
const basePath =
  process.env.DEPLOY_BASE_PATH ??
  (process.env.NODE_ENV === 'production' && !isRootDeployment ? '/deshistartup' : '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  // `output: 'export'` is intentionally absent: the contribution feature's
  // dynamic route handlers need a server runtime. OpenNext packages that
  // runtime for Cloudflare Workers while preserving prerendered content.
  outputFileTracingRoot: projectRoot,
  ...turboRootConfig,
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  },
  images: {
    unoptimized: true
  }
}

export default withNextra(nextConfig)
