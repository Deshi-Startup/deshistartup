import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createContributableResolver } from './contributable-resolver.ts'
import { sourceSupportsInlineEdit } from './inline-edit-policy.mjs'

const readJson = (file) => JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8'))
const metadata = readJson('../generated/contributable.json')
const resolve = createContributableResolver(metadata)

test('generated contribution metadata matches every editable page and excludes all other pages', () => {
  const editable = []
  for (const locale of ['bn', 'en']) {
    const manifest = readJson(`../generated/manifest.${locale}.json`)
    for (const section of Object.values(manifest.sections)) {
      for (const page of [section.index, ...section.children].filter(Boolean)) {
        const source = readFileSync(new URL(`../(contents)/${locale === 'bn' ? '(bn)' : 'en'}/${page.slug}/page.mdx`, import.meta.url), 'utf8')
        const allowed = sourceSupportsInlineEdit({ slug: page.slug, source, stub: page.stub })
        if (!allowed) {
          assert.equal(resolve(page.route), null, page.route)
          continue
        }
        editable.push(page.route)
        assert.deepEqual(metadata[page.route], [page.title, Number(page.stub)])
        assert.deepEqual(resolve(page.route), {
          repoPath: `app/(contents)/${locale === 'bn' ? '(bn)' : 'en'}/${page.slug}/page.mdx`,
          locale, title: page.title, stub: page.stub
        })
      }
    }
  }
  assert.deepEqual(Object.keys(metadata).sort(), editable.sort())
})

test('route resolution rejects missing, inherited and malformed paths even when listed', () => {
  for (const path of ['/', '/en', '/en/missing', 'toString', '__proto__', '/en/../about', '/a/b/c', '/en/about?edit=true']) {
    assert.equal(resolve(path), null, path)
  }
  const invalid = createContributableResolver({ '/en/../about': ['Bad', 0] })
  assert.equal(invalid('/en/../about'), null)
})
