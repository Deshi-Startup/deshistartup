import nextra from 'nextra'

const withNextra = nextra({
  search: {
    codeblocks: false
  }
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  }
}

export default withNextra(nextConfig)
