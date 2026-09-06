import assert from 'node:assert/strict'
import path from 'node:path'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import { compileMdx } from 'nextra/compile'
import rehypeHomeTitle from './rehype-home-title.mjs'

async function compiledTitle(route) {
  const source = '---\ntitle: "A founder guide"\ndescription: "Test description"\n---\n\n# A different visible heading'
  const compiled = await compileMdx(source, {
    filePath: path.resolve(`app/(contents)/${route}/page.mdx`),
    isPageImport: true,
    mdxOptions: { outputFormat: 'program', rehypePlugins: [rehypeHomeTitle] }
  })
  const [, metadata] = compiled.match(/export const metadata = ([\s\S]*?);\n/)
  return runInNewContext(`(${metadata})`).title
}

test('Nextra compiles both homepages with an absolute title for Next hydration', async () => {
  assert.equal((await compiledTitle('en')).absolute, 'Deshi Startup – A founder guide')
  assert.equal((await compiledTitle('(bn)')).absolute, 'দেশি স্টার্টআপ – A founder guide')
})

test('ordinary guides keep their authored title and inherited locale template', async () => {
  assert.equal(await compiledTitle('en/registration/private-limited'), 'A founder guide')
  assert.equal(await compiledTitle('(bn)/start-here'), 'A founder guide')
})
