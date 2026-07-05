import nextra from "nextra";
import remarkFrontmatter from "remark-frontmatter";

const withNextra = nextra({
  search: {
    codeblocks: false,
  },
  mdxOptions: {
    remarkPlugins: [remarkFrontmatter],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default withNextra(nextConfig);
