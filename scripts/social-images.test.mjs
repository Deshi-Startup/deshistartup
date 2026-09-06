import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'
import mediaManifest from '../app/generated/media.json' with { type: 'json' }
import socialImages from '../data/social-images.json' with { type: 'json' }
import { pageSocialImage, socialImageDefinition } from '../app/lib/page-social-image.mjs'
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  buildSocialImages,
  createSocialImageFont
} from './build-social-images.mjs'

const root = path.resolve(new URL('..', import.meta.url).pathname)
const fontPath = path.join(root, 'app', 'fonts', 'deshi-sans-bengali-var.woff2')
const markPath = path.join(root, 'public', 'deshi-mark.webp')
const socialFont = createSocialImageFont(await fs.readFile(fontPath))

function countRedPixels(data, channels) {
  let count = 0
  for (let index = 0; index < data.length; index += channels) {
    const [red, green, blue] = data.subarray(index, index + 3)
    if (red > 140 && red > green * 1.35 && red > blue * 1.2) count += 1
  }
  return count
}

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

  const result = await buildSocialImages({ outputDir, fontPath, markPath })
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

test('Bangla card keeps the approved page copy unchanged and uses the bundled Bangla face', () => {
  const copy = socialImages['startup-50'].locales.bn
  assert.equal(copy.title, 'দেশি স্টার্টআপ ৫০')
  assert.deepEqual(copy.tagline, [
    '২০২৬ সালে নজরে রাখার মতো',
    '৫০টি বাংলাদেশি স্টার্টআপ।'
  ])
  assert.ok(socialFont.characterSet.includes(0x0995))
})
