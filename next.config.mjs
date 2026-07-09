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

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  output: 'export',
  outputFileTracingRoot: projectRoot,
  ...turboRootConfig,
  basePath: process.env.NODE_ENV === 'production' ? '/deshistartup' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.NODE_ENV === 'production' ? '/deshistartup' : ''
  },
  images: {
    unoptimized: true
  }
}

export default withNextra(nextConfig)
