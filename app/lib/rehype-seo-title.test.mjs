import assert from 'node:assert/strict'
import path from 'node:path'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import { compileMdx } from 'nextra/compile'
import rehypeSeoTitle from './rehype-seo-title.mjs'
import { pageDocumentTitle } from '../seo.config.mjs'
import { parseFrontmatter } from '../../scripts/frontmatter.mjs'

const defaultSource = '---\ntitle: "A founder guide"\ndescription: "Test description"\n---\n\n# A different visible heading'

async function compiledMetadata(route, source = defaultSource) {
  const compiled = await compileMdx(source, {
    filePath: path.resolve(`app/(contents)/${route}/page.mdx`),
    isPageImport: true,
    mdxOptions: { outputFormat: 'program', rehypePlugins: [rehypeSeoTitle] }
  })
  const [, metadata] = compiled.match(/export const metadata = ([\s\S]*?);\n/)
  return { metadata: runInNewContext(`(${metadata})`), compiled }
}

test('Nextra compiles both homepages with an absolute title for Next hydration', async () => {
  assert.equal((await compiledMetadata('en')).metadata.title.absolute, 'Deshi Startup – A founder guide')
  assert.equal((await compiledMetadata('(bn)')).metadata.title.absolute, 'দেশি স্টার্টআপ – A founder guide')
})

test('ordinary guides use their authored title without an automatic brand suffix', async () => {
  for (const route of ['en/registration/private-limited', '(bn)/start-here']) {
    assert.equal((await compiledMetadata(route)).metadata.title.absolute, 'A founder guide')
  }
})

test('seoTitle changes Next metadata while preserving the authored title and visible heading', async () => {
  const source = defaultSource.replace('description:', 'seoTitle: "Startup Case Studies in Bangladesh"\ndescription:')
  for (const route of ['en/case-studies', '(bn)/case-studies', 'en']) {
    const fm = parseFrontmatter(source)
    const { metadata, compiled } = await compiledMetadata(route, source)
    assert.equal(metadata.title.absolute, 'Startup Case Studies in Bangladesh')
    assert.equal(metadata.title.absolute, pageDocumentTitle({ ...fm, fullTitle: fm.title, slug: route === 'en' ? '' : 'case-studies', locale: 'en' }))
    assert.equal(fm.title, 'A founder guide')
    assert.match(compiled, /A different visible heading/)
  }
})

test('an intentionally authored brand is retained without another suffix', async () => {
  const source = defaultSource.replace('A founder guide', 'About Deshi Startup')
  assert.equal((await compiledMetadata('en/about', source)).metadata.title.absolute, 'About Deshi Startup')
})

test('Next metadata and the manifest decode YAML descriptions identically', async () => {
  for (const description of [
    '"Why \\"just 1%\\" is not a market estimate."',
    "'A founder''s practical guide.'",
    '>\n  First line of a description\n  continued on another line.'
  ]) {
    const source = `---\ntitle: "A founder guide"\nseoTitle: "A search title"\ndescription: ${description}\n---\n\n# Visible heading`
    const fm = parseFrontmatter(source)
    const { metadata } = await compiledMetadata('en/ideas/example', source)
    assert.equal(metadata.description, fm.description)
  }
})

test('invalid SEO titles fail compilation instead of silently using a different title', async () => {
  for (const value of ['""', '123', '[one, two]']) {
    const source = defaultSource.replace('description:', `seoTitle: ${value}\ndescription:`)
    assert.throws(() => parseFrontmatter(source), /seoTitle must be a non-empty string/)
    await assert.rejects(compiledMetadata('en/ideas/example', source), /seoTitle must be a non-empty string/)
  }
})
