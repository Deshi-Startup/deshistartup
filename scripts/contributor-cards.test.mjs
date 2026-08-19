import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'
import snapshotData from '../app/generated/contributors.json' with { type: 'json' }
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  buildContributorCards,
  createContributorCardFont,
  fitNameLines,
  renderContributorCardSvg
} from './build-contributor-cards.mjs'

const root = path.resolve(new URL('..', import.meta.url).pathname)
const fontPath = path.join(root, 'app', 'fonts', 'deshi-sans-bengali-var.woff2')
const markPath = path.join(root, 'public', 'deshi-mark.webp')
const cardFont = createContributorCardFont(await fs.readFile(fontPath))

const profile = {
  displayName: 'সাবরিনা Rahman',
  monogram: 'সR',
  acceptedEventCount: 2,
  roles: ['author', 'researcher'],
  slug: 'sabrina-rahman',
  organization: null
}

function luminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map((value) => {
    const channel = Number.parseInt(value, 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function contrast(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background))
  const darker = Math.min(luminance(foreground), luminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

test('long Bengali, English, and mixed-script names fit within two lines', () => {
  const names = [
    'মোহাম্মদ মুশফিকুর রহমান চৌধুরী',
    'Alexandra Catherine Montgomery-Worthington',
    'মোহাম্মদ Alexandra রহমান Montgomery-Worthington'
  ]
  for (const name of names) {
    const fitted = fitNameLines(name)
    assert.ok(fitted.lines.length >= 1 && fitted.lines.length <= 2)
    assert.ok(fitted.fontSize >= 30)
    assert.equal(fitted.lines.join(' ').replace(/\s+/g, ''), name.replace(/\s+/g, ''))
  }
})

test('card SVG outlines every Bengali run and omits optional affiliation cleanly', () => {
  const svg = renderContributorCardSvg({ profile, font: cardFont, markData: '' })
  assert.match(svg, /data-card-text="সR"/)
  assert.match(svg, /data-card-text="কন্ট্রিবিউটর · Contributor"/)
  assert.match(svg, /xml:space="preserve"> · Contributor<\/text>/)
  assert.match(svg, /xml:space="preserve"> · Deshi Startup<\/text>/)
  assert.ok((svg.match(/data-bengali-glyph=/g) || []).length > 20)
  assert.doesNotMatch(svg, /<text[^>]*>[^<]*\p{Script=Bengali}/u)
  assert.doesNotMatch(svg, /@font-face|data:font\/woff2/)
  assert.doesNotMatch(svg, /Verified|Certified|Rank/)
  assert.doesNotMatch(svg, /data-card-text="Example Labs"/)
})

test('card SVG includes an optional organization without changing the proof claim', () => {
  const svg = renderContributorCardSvg({
    profile: { ...profile, organization: { id: 'example', name: 'Example Labs', url: null } },
    font: cardFont,
    markData: ''
  })
  assert.match(svg, /data-card-text="Example Labs"/)
  assert.doesNotMatch(svg, /Verified|Certified|Rank/)
})

test('card generation refuses to fall back to a host font', async () => {
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'deshi-contributor-cards-font-'))
  try {
    await assert.rejects(
      buildContributorCards({ snapshot: snapshotData, outputDir }),
      /font path is required/
    )
    assert.throws(() => createContributorCardFont(Buffer.alloc(0)), /missing or empty/)
  } finally {
    await fs.rm(outputDir, { recursive: true, force: true })
  }
})

test('card text colors retain WCAG AA contrast on their rendered grounds', () => {
  for (const [foreground, background] of [
    ['#202122', '#ffffff'],
    ['#065f46', '#ffffff'],
    ['#54595d', '#ffffff'],
    ['#3366cc', '#ffffff'],
    ['#065f46', '#eaf4ef']
  ]) {
    assert.ok(contrast(foreground, background) >= 4.5, `${foreground} on ${background}`)
  }
})

test('card build creates 1200 by 630 PNGs, replaces cards, and removes stale assets', async (t) => {
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'deshi-contributor-cards-'))
  t.after(() => fs.rm(outputDir, { recursive: true, force: true }))
  await fs.writeFile(path.join(outputDir, 'stale.png'), 'stale')
  await fs.writeFile(path.join(outputDir, 'niloy-biswas.png'), 'old')

  const result = await buildContributorCards({ snapshot: snapshotData, outputDir, fontPath, markPath })
  assert.deepEqual(result, { generated: 4, removed: 1 })
  await assert.rejects(fs.access(path.join(outputDir, 'stale.png')))

  const card = await sharp(path.join(outputDir, 'niloy-biswas.png')).metadata()
  assert.equal(card.width, CARD_WIDTH)
  assert.equal(card.height, CARD_HEIGHT)
  assert.equal(card.format, 'png')

  const { data, info } = await sharp(path.join(outputDir, 'niloy-biswas.png'))
    .extract({ left: 82, top: 78, width: 86, height: 86 })
    .raw()
    .toBuffer({ resolveWithObject: true })
  let saturatedMarkPixels = 0
  for (let index = 0; index < data.length; index += info.channels) {
    const [red, green, blue] = data.subarray(index, index + 3)
    if (red > 140 && red > green * 1.35 && red > blue * 1.2) saturatedMarkPixels += 1
  }
  assert.ok(saturatedMarkPixels > 100, 'embedded Deshi Startup mark is missing from the rendered card')
})
