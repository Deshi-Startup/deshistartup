import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import sharp from 'sharp'
import mediaManifest from '../app/generated/media.json' with { type: 'json' }
import socialImages from '../data/social-images.json' with { type: 'json' }
import covers from '../data/case-study-covers.json' with { type: 'json' }
import artwork from '../data/case-study-artwork.json' with { type: 'json' }
import { pageSocialImage, socialImageDefinition } from '../app/lib/page-social-image.mjs'
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  buildSocialImages,
  createSocialImageFont,
  validateCaseStudySocialDefinitions
} from './build-social-images.mjs'

const root = path.resolve(new URL('..', import.meta.url).pathname)
const fontPath = path.join(root, 'app', 'fonts', 'deshi-sans-bengali-var.ttf')
const markPath = path.join(root, 'public', 'deshi-mark.webp')
const socialFont = createSocialImageFont(await fs.readFile(fontPath))
const pages = JSON.parse(await fs.readFile(path.join(root, 'app/generated/seo-pages.json'), 'utf8'))
const casePages = pages.filter((page) => page.slug.startsWith('case-studies/') && !page.stub)
const caseDefinitions = Object.fromEntries(Object.entries(socialImages).filter(([, entry]) => entry.template === 'case-study'))

function countRedPixels(data, channels) {
  let count = 0
  for (let index = 0; index < data.length; index += channels) {
    const [red, green, blue] = data.subarray(index, index + 3)
    if (red > 140 && red > green * 1.35 && red > blue * 1.2) count += 1
  }
  return count
}

test('the social-image font renders Bangla without installed system fonts', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'deshi-font-render-'))
  t.after(() => fs.rm(directory, { recursive: true, force: true }))
  const config = path.join(directory, 'fonts.conf')
  await fs.writeFile(config, '<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig></fontconfig>')
  // A separate process prevents Pango's global font cache from hiding fallback.
  const output = execFileSync(process.execPath, ['--input-type=module', '-e', `
    import sharp from 'sharp'
    const { info } = await sharp({ text: {
      text: '<span font_size="57344" font_weight="600">এজেন্ট নেটওয়ার্কে\\nভরসা এলো কীভাবে?</span>',
      font: 'Deshi Sans Bengali', fontfile: ${JSON.stringify(fontPath)},
      width: 660, rgba: true, spacing: -3
    } }).png().toBuffer({ resolveWithObject: true })
    console.log(JSON.stringify(info))
  `], { cwd: root, encoding: 'utf8', env: { ...process.env, FONTCONFIG_FILE: config, PANGOCAIRO_BACKEND: 'fontconfig' } })
  const { width, height } = JSON.parse(output)
  assert.ok(width > 400 && width < 600, `Expected shaped Bangla, got width ${width}`)
  assert.ok(height > 90 && height < 160, `Expected two lines of the bundled font, got height ${height}`)
})

test('Startup 50 social copy and logical paths are explicit for both locales', () => {
  const definition = socialImages['startup-50']
  assert.equal(definition.template, 'folio')
  assert.deepEqual(Object.keys(definition.locales).sort(), ['bn', 'en'])
  assert.equal(definition.locales.en.src, '/media/og/en/startup-50.png')
  assert.equal(definition.locales.bn.src, '/media/og/bn/startup-50.png')
  assert.equal(definition.locales.en.tagline.join(' '), '50 Bangladeshi startups to watch in 2026.')
  assert.doesNotMatch(definition.locales.en.alt, /\btop\s+50\b|\branked\b/i)
  assert.equal(definition.locales.bn.tagline.join(' '), '২০২৬ সালে নজরে রাখার মতো ৫০টি বাংলাদেশি স্টার্টআপ।')
})

test('social-image resolver uses the R2 content-addressed key and declines missing objects', () => {
  for (const locale of ['en', 'bn']) {
    const page = { slug: 'startup-50', locale }
    const definition = socialImageDefinition(page)
    assert.ok(definition)
    const resolved = pageSocialImage(page)
    assert.ok(resolved, `${locale} Startup 50 social image is not uploaded`)
    assert.equal(resolved.logicalPath, definition.src)
    assert.equal(resolved.alt, definition.alt)
    assert.equal(resolved.url, `https://media.deshistartup.com/${mediaManifest[definition.src].key}`)
  }
  assert.equal(pageSocialImage({ slug: 'contact', locale: 'en' }), null)
  assert.equal(
    pageSocialImage(
      { slug: 'startup-50', locale: 'en' },
      { registry: {}, definitions: socialImages }
    ),
    null
  )
})

test('both localized cards render as exact 1200 by 630 PNGs with the Deshi mark', async (t) => {
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'deshi-social-images-'))
  t.after(() => fs.rm(outputDir, { recursive: true, force: true }))

  const result = await buildSocialImages({ definitions: { 'startup-50': socialImages['startup-50'] }, outputDir, fontPath, markPath })
  assert.deepEqual(result, { generated: 2 })

  for (const locale of ['en', 'bn']) {
    const file = path.join(outputDir, locale, 'startup-50.png')
    const metadata = await sharp(file).metadata()
    const stat = await fs.stat(file)
    const bytes = await fs.readFile(file)
    assert.equal(metadata.width, CARD_WIDTH)
    assert.equal(metadata.height, CARD_HEIGHT)
    assert.equal(metadata.format, 'png')
    assert.ok(stat.size <= 300 * 1024)
    assert.ok(bytes.includes(Buffer.from('impeccable:prompt')))
    assert.ok(bytes.includes(Buffer.from(socialImages['startup-50'].provenance)))

    const { data, info } = await sharp(file)
      .extract({ left: 1068, top: 50, width: 70, height: 70 })
      .raw()
      .toBuffer({ resolveWithObject: true })
    assert.ok(countRedPixels(data, info.channels) > 100, `${locale} card is missing the Deshi mark`)
  }
})

test('every completed case study has a cover, localized social image and uploaded metadata', () => {
  assert.ok(casePages.length >= 22)
  validateCaseStudySocialDefinitions(pages)
  for (const page of casePages) {
    const cover = covers[page.slug.slice('case-studies/'.length)]
    const definition = socialImageDefinition(page)
    assert.equal(definition.src, `/media/og/${page.locale}/${page.slug}.png`)
    assert.ok(definition.alt.includes(page.title))
    assert.ok(definition.alt.includes(cover.title[page.locale].join(' ')))
    const resolved = pageSocialImage(page)
    assert.ok(resolved, `${page.locale}:${page.slug} social image needs upload`)
    assert.equal(resolved.alt, definition.alt)
    assert.equal(resolved.url, `https://media.deshistartup.com/${mediaManifest[definition.src].key}`)
    assert.equal(pageSocialImage(page, { registry: {} }), null)
    assert.equal(socialImageDefinition({ ...page, stub: true }), null)
  }
})

test('social-image coverage rejects missing or stale case-study definitions', () => {
  const definitions = structuredClone(socialImages)
  delete definitions[casePages[0].slug].locales[casePages[0].locale]
  assert.throws(() => validateCaseStudySocialDefinitions(pages, definitions), /needs a social-image definition/)
  const withoutPage = pages.filter((page) => !(page.slug === casePages[0].slug && page.locale === casePages[0].locale))
  assert.throws(() => validateCaseStudySocialDefinitions(withoutPage), /stale social-image definition/)
})

test('shared cover artwork stays self-contained and safe for inline rendering', () => {
  for (const cover of Object.values(covers)) {
    const art = artwork[cover.theme]
    assert.ok(art)
    for (const svg of art.svg ? [art.svg] : Object.values(art.locales)) {
      assert.match(svg, /^<svg\s/)
      assert.match(svg, /viewBox="0 0 330 200"/)
      assert.doesNotMatch(svg, /<\s*(?:script|foreignObject|iframe|image|style)|\bon\w+\s*=|\bhref\s*=|url\(/i)
    }
  }
})

test('all case covers render at social size and stale uploaded revisions are detected', async (t) => {
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'deshi-case-social-'))
  t.after(() => fs.rm(outputDir, { recursive: true, force: true }))
  const themeCss = (await Promise.all(['CaseStudy.css', 'CaseStudyIndex.css']
    .map((file) => fs.readFile(path.join(root, 'app/components', file), 'utf8')))).join('\n')
  const logo = await sharp({ create: { width: 208, height: 66, channels: 4, background: '#ee1122' } }).png().toBuffer()
  const options = { definitions: caseDefinitions, outputDir, fontPath, pages, themeCss, logoLoader: async () => logo }
  const result = await buildSocialImages(options)
  assert.equal(result.generated, casePages.length)
  const registry = {}
  for (const page of casePages) {
    const file = path.join(outputDir, page.locale, `${page.slug}.png`)
    const bytes = await fs.readFile(file)
    const metadata = await sharp(bytes).metadata()
    assert.equal(metadata.width, CARD_WIDTH)
    assert.equal(metadata.height, CARD_HEIGHT)
    assert.equal(metadata.format, 'png')
    assert.ok(bytes.length < 150 * 1024, `${page.slug}: sharing image is too large`)
    assert.ok(bytes.includes(Buffer.from('impeccable:prompt')))
    const region = await sharp(bytes).extract({ left: 60, top: 54, width: 248, height: 102 }).raw().toBuffer({ resolveWithObject: true })
    assert.ok(countRedPixels(region.data, region.info.channels) > 10000, `${page.slug}: logo disappeared`)
    registry[`/media/og/${page.locale}/${page.slug}.png`] = { remote: true, sha: createHash('sha256').update(bytes).digest('hex').slice(0, 12) }
  }
  const current = await buildSocialImages({ ...options, check: true, registry })
  assert.deepEqual(current, { checked: casePages.length, stale: [] })
  const firstPath = Object.keys(registry)[0]
  registry[firstPath].sha = 'old-revision'
  const stale = await buildSocialImages({ ...options, check: true, registry })
  assert.deepEqual(stale.stale, [firstPath])
})

test('Bangla card keeps the approved page copy unchanged and uses the bundled Bangla face', () => {
  const copy = socialImages['startup-50'].locales.bn
  assert.equal(copy.title, 'দেশি স্টার্টআপ ৫০')
  assert.deepEqual(copy.tagline, [
    '২০২৬ সালে নজরে রাখার মতো',
    '৫০টি বাংলাদেশি স্টার্টআপ।'
  ])
  assert.ok(socialFont.characterSet.includes(0x0995))
})
