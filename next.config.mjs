import nextra from 'nextra'

const withNextra = nextra({
  search: {
    codeblocks: false
  }
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  output: 'export',
  basePath: '/deshistartup',
  images: {
    unoptimized: true
  }
}

export default withNextra(nextConfig)
