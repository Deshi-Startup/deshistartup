#!/usr/bin/env node
/** Notify IndexNow-compatible search engines after a production deployment. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'cheerio'
import { INDEXNOW_KEY, SITE_URL } from '../app/seo.config.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sitemapPath = path.join(root, 'public', 'sitemap.xml')
const dryRun = process.argv.includes('--dry-run')

if (!fs.existsSync(sitemapPath)) {
  throw new Error('public/sitemap.xml is missing. Run npm run manifest first.')
}

const xml = fs.readFileSync(sitemapPath, 'utf8')
const $ = load(xml, { xmlMode: true })
const urlList = $('url > loc').toArray().map((node) => $(node).text().trim()).filter(Boolean)

const payload = {
  host: new URL(SITE_URL).host,
  key: INDEXNOW_KEY,
  keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
  urlList
}

if (dryRun) {
  console.log(JSON.stringify(payload, null, 2))
  process.exit(0)
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload)
})

if (!response.ok && response.status !== 202) {
  const body = await response.text()
  throw new Error(`IndexNow submission failed (${response.status}): ${body}`)
}

console.log(`IndexNow accepted ${urlList.length} canonical URLs (${response.status})`)
