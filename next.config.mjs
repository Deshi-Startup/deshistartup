import nextra from 'nextra'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(fileURLToPath(import.meta.url))

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
  experimental: {
    turbo: {
      root: projectRoot
    }
  },
  basePath: process.env.NODE_ENV === 'production' ? '/deshistartup' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.NODE_ENV === 'production' ? '/deshistartup' : ''
  },
  images: {
    unoptimized: true
  }
}

export default withNextra(nextConfig)
