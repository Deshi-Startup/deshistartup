#!/usr/bin/env node
/**
 * Query the generated Pagefind bundle for the two translated-title cases that
 * ordinary same-language indexing cannot cover on its own.
 *
 * Pagefind's browser bundle normally fetches its shards over HTTP. The audit
 * maps those requests to the just-built files so it stays deterministic and
 * does not need a preview server or network access in CI.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolveBuildOutput } from './build-output.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { isStaticExport } = resolveBuildOutput(root)
const indexDir = isStaticExport
  ? path.join(root, 'out', '_pagefind')
  : path.join(root, 'public', '_pagefind')
const bundleFile = path.join(indexDir, 'pagefind.js')
const bundleOrigin = 'http://pagefind.local'
const bundleBase = `${bundleOrigin}/_pagefind/`

if (!fs.existsSync(bundleFile)) {
  throw new Error(`search audit: missing Pagefind bundle at ${path.relative(root, bundleFile)}`)
}

globalThis.fetch = async (input) => {
  const url = new URL(typeof input === 'string' ? input : input.url)
  if (url.origin !== bundleOrigin || !url.pathname.startsWith('/_pagefind/')) {
    throw new Error(`search audit: unexpected fetch ${url}`)
  }

  const relative = decodeURIComponent(url.pathname.slice('/_pagefind/'.length))
  const file = path.resolve(indexDir, relative)
  if (!file.startsWith(`${indexDir}${path.sep}`) || !fs.existsSync(file)) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(fs.readFileSync(file), {
    status: 200,
    headers: { 'content-type': 'application/octet-stream' }
  })
}

// Pagefind reads the document language when its browser bundle initializes.
// `window` deliberately stays absent so the bundle uses its main-thread path
// without trying to create a web worker in Node.
globalThis.location = { href: `${bundleOrigin}/` }

const cases = [
  {
    language: 'bn',
    query: 'glossary',
    path: '/start-here/glossary.html',
    title: 'স্টার্টআপ ডিকশনারি: কোন শব্দের মানে কী'
  },
  {
    language: 'en',
    query: 'ডিকশনারি',
    path: '/en/start-here/glossary.html',
    title: 'Startup Glossary: What do these terms mean?'
  }
]

const pollutedExcerpt = /Full glossary entry|show definition|Term definition/

for (const testCase of cases) {
  globalThis.document = {
    currentScript: null,
    querySelector: (selector) =>
      selector === 'html' ? { getAttribute: () => testCase.language } : null
  }

  // A unique module instance keeps Pagefind's language-specific WASM state
  // isolated between the two cases.
  const pagefind = await import(
    `${pathToFileURL(bundleFile).href}?search-audit=${testCase.language}`
  )
  await pagefind.options({
    basePath: bundleBase,
    ranking: { metaWeights: { 'alternate-title': 4 } }
  })

  const response = await pagefind.search(testCase.query)
  const topResults = response.results.slice(0, 8)
  const first = topResults[0]
  if (!first) {
    throw new Error(
      `search audit: ${testCase.language} query ${JSON.stringify(testCase.query)} returned no results`
    )
  }

  const topData = await Promise.all(topResults.map((result) => result.data()))
  const data = topData[0]
  const resultPath = new URL(data.url).pathname
  const resultTitle = data.meta?.title || data.title || ''
  if (resultPath !== testCase.path || resultTitle !== testCase.title) {
    throw new Error(
      `search audit: ${testCase.language} query ${JSON.stringify(testCase.query)} returned ` +
      `${resultPath} (${JSON.stringify(resultTitle)}) first`
    )
  }
  if (!first.matchedMetaFields?.includes('alternate-title')) {
    throw new Error(
      `search audit: ${testCase.language} query ${JSON.stringify(testCase.query)} did not match the translated-title metadata`
    )
  }
  const polluted = topData.find((result) => pollutedExcerpt.test(result.plain_excerpt || ''))
  if (polluted) {
    throw new Error(
      `search audit: ${testCase.language} glossary results contain hidden popover copy in ${polluted.url}`
    )
  }

  await pagefind.destroy()
}

console.log('search audit: translated-title aliases and clean glossary excerpts verified')
