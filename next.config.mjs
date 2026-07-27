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
  },
  // Nextra would otherwise rewrite every markdown image into a webpack static
  // import: the src becomes an object pointing at a hashed /_next/static/media
  // URL, and the markdown title (our caption) is dropped on the floor. Both
  // fight the media pipeline, which addresses everything as /media/... so the
  // library can move to a bucket without touching content. Sizes come from
  // app/generated/media.json instead.
  staticImage: false
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
    NEXT_PUBLIC_BASE_PATH: basePath,
    // Edge image resizing (/cdn-cgi/image/...) exists only on the Cloudflare
    // zone, and only once Transformations are switched on for it. Off by
    // default so a fork, the static mirror, and dev all serve the original
    // file; set DESHI_MEDIA_TRANSFORM=1 in Workers Builds to turn it on.
    NEXT_PUBLIC_MEDIA_TRANSFORM:
      process.env.DESHI_MEDIA_TRANSFORM === '1' && isRootDeployment ? '1' : '',
    // Set to a bucket host (e.g. https://media.deshistartup.com) if the media
    // library ever outgrows the repo. Objects keep their /media/... key, so
    // no content changes.
    NEXT_PUBLIC_MEDIA_BASE_URL: process.env.DESHI_MEDIA_BASE_URL ?? ''
  },
  images: {
    unoptimized: true
  }
}

export default withNextra(nextConfig)
