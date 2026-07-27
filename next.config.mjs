import nextra from 'nextra'
import { MEDIA_URL } from './app/seo.config.mjs'
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

// Images live in R2, not in the repo. An explicit empty value opts out and
// serves them from public/media instead.
const mediaBaseUrl = (process.env.DESHI_MEDIA_BASE_URL ?? MEDIA_URL).replace(/\/+$/, '')

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
    // Edge image resizing (/cdn-cgi/image/...), on wherever there is a
    // Cloudflare zone to serve it: the media bucket's host, or the site itself.
    // A subpath mirror that is also self-hosting its media has neither, so it
    // gets the original file. DESHI_MEDIA_TRANSFORM=0 turns it off everywhere.
    NEXT_PUBLIC_MEDIA_TRANSFORM:
      process.env.DESHI_MEDIA_TRANSFORM !== '0' && (mediaBaseUrl || isRootDeployment) ? '1' : '',
    // Where /media/... actually resolves. Defaults to the R2 bucket's public
    // host; set DESHI_MEDIA_BASE_URL to an empty string to self-host the files
    // from public/media instead (a fork with no bucket of its own).
    NEXT_PUBLIC_MEDIA_BASE_URL: mediaBaseUrl
  },
  images: {
    unoptimized: true
  }
}

export default withNextra(nextConfig)
