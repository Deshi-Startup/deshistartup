import nextra from 'nextra'
import { MEDIA_URL } from './app/seo.config.mjs'
import rehypeFootnotes from './app/lib/rehype-footnotes.mjs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(fileURLToPath(import.meta.url))
const isDevelopment = process.env.NODE_ENV === 'development'

const withNextra = nextra({
  search: {
    codeblocks: false
  },
  mdxOptions: {
    // Nextra already turns GFM footnotes into numbered links, source targets
    // and backlinks. This build-only pass localizes the generated UI and adds
    // stable classes without shipping JavaScript to article readers.
    rehypePlugins: [rehypeFootnotes]
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
// by the Cloudflare static-assets build.
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
  // Content is a static asset. The small native Worker in worker/ owns only
  // /api/*, so adding guides does not increase the Worker script bundle.
  turbopack: { root: projectRoot },
  // `next dev` and `next build` otherwise share one .next directory, and a dev
  // server left running in an editor writes into it while a build is reading
  // it. That does not fail loudly: builds die on a different random route each
  // time ("Cannot find module for page", "Failed to collect page data"), or
  // worse, succeed and export a stale client chunk, so a fix appears to have
  // been deployed when the old code shipped. Give dev its own directory and
  // the two stop touching the same files. Nothing else reads .next-dev; the
  // build tooling (postbuild-seo, build-output) is production-only.
  ...(isDevelopment ? { distDir: '.next-dev' } : {}),
  basePath,
  ...(isDevelopment
    ? {
        async rewrites() {
          return [
            {
              source: '/api/:path*',
              destination: 'http://127.0.0.1:8787/api/:path*'
            }
          ]
        }
      }
    : { output: 'export' }),
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

const config = withNextra(nextConfig)

// Nextra 4 still emits the old experimental.turbo key. Next 15.5 accepts the
// same rules and aliases under the stable top-level turbopack option.
if (config.experimental?.turbo) {
  config.turbopack = { ...config.experimental.turbo, ...config.turbopack }
  const { turbo: _turbo, ...experimental } = config.experimental
  config.experimental = experimental
}

export default config
