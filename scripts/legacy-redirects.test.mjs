import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rules = fs.readFileSync(path.join(root, 'public/_redirects'), 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'))
  .map(line => line.split(/\s+/))

function contentPath(route) {
  const english = route.startsWith('/en/')
  return path.join(root, 'app/(contents)', english ? 'en' : '(bn)',
    route.replace(/^\/(en\/)?/, ''))
}

test('legacy redirects lead directly to completed pages without shadowing current routes', () => {
  const sources = new Set()
  for (const rule of rules) {
    assert.equal(rule.length, 3)
    const [source, destination, status] = rule
    assert.match(source, /^\/[a-z0-9/-]+$/)
    assert.match(destination, /^\/[a-z0-9/-]+$/)
    assert.equal(status, '301')
    assert.equal(sources.has(source), false, 'duplicate source: ' + source)
    sources.add(source)
    assert.equal(source.startsWith('/en/'), destination.startsWith('/en/'), source)
    for (const extension of ['mdx', 'tsx']) {
      assert.equal(fs.existsSync(path.join(contentPath(source), 'page.' + extension)), false,
        'redirect shadows a current page: ' + source)
    }
    const target = path.join(contentPath(destination), 'page.mdx')
    assert.ok(fs.existsSync(target), 'missing destination: ' + destination)
    assert.doesNotMatch(fs.readFileSync(target, 'utf8'), /<StubNotice\b/,
      'destination is unfinished: ' + destination)
  }
  for (const [, destination] of rules) {
    assert.equal(sources.has(destination), false, 'redirect chain: ' + destination)
  }
})

test('legacy redirects preserve both language editions', () => {
  const destinations = new Map(rules.map(([source, destination]) => [source, destination]))
  for (const [source, destination] of rules) {
    if (!source.startsWith('/en/')) {
      assert.equal(destinations.get('/en' + source), '/en' + destination, source)
    } else {
      assert.equal(destinations.get(source.slice(3)), destination.slice(3), source)
    }
  }
})
