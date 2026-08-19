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

function countRedPixels(data, channels) {
  let count = 0
  for (let index = 0; index < data.length; index += channels) {
    const [red, green, blue] = data.subarray(index, index + 3)
    if (red > 140 && red > green * 1.35 && red > blue * 1.2) count += 1
  }
  return count
}

test('long Bengali, English, and mixed-script names fit within two lines', () => {
  const maximumWidth = 660
  const names = [
    'মোহাম্মদ মুশফিকুর রহমান চৌধুরী',
    'Alexandra Catherine Montgomery-Worthington',
    'মোহাম্মদ Alexandra রহমান Montgomery-Worthington',
    'W'.repeat(180),
    'ম'.repeat(180)
  ]
  for (const name of names) {
    const fitted = fitNameLines(name, maximumWidth, cardFont)
    assert.ok(fitted.lines.length >= 1 && fitted.lines.length <= 2)
    assert.ok(fitted.fontSize >= 32)
    assert.equal(fitted.lines.join(' ').replace(/\s+/g, ''), name.replace(/\s+/g, ''))
    assert.equal(fitted.renderedWidths.length, fitted.lines.length)
    assert.ok(
      fitted.renderedWidths.every((width) => width <= maximumWidth),
      `${name} exceeds the ${maximumWidth}px identity column`
    )
  }
  assert.ok(
    fitNameLines('W'.repeat(180), maximumWidth, cardFont).textLength.includes(maximumWidth),
    'maximum-length names should use bounded horizontal compression'
  )
})

test('card SVG keeps stable identity details and outlines every Bengali name run', () => {
  const svg = renderContributorCardSvg({ profile, font: cardFont, markData: '' })
  assert.match(svg, /data-card-text="সR"/)
  assert.match(svg, /data-card-text="সাবরিনা Rahman"/)
  assert.match(svg, /data-card-text="DESHI STARTUP"/)
  assert.match(svg, /data-card-text="CONTRIBUTOR"/)
  assert.match(svg, /data-card-text="Author · Researcher"/)
  assert.match(svg, /data-card-text="deshistartup\.com\/contributors\/sabrina-rahman"/)
  assert.ok((svg.match(/data-bengali-glyph=/g) || []).length > 5)
  assert.doesNotMatch(svg, /<text[^>]*>[^<]*\p{Script=Bengali}/u)
  assert.doesNotMatch(svg, /@font-face|data:font\/woff2/)
  assert.doesNotMatch(svg, /Verified|Certified|Rank|contributions|অবদান/)
  assert.doesNotMatch(svg, /data-card-text="Example Labs"/)
})

test('card SVG stays English-only for an English name and excludes organization and changing statistics', () => {
  const svg = renderContributorCardSvg({
    profile: {
      ...profile,
      displayName: 'Shoumik Shahriar',
      monogram: 'SS',
      slug: 'shoumik-shahriar',
      roles: ['author'],
      acceptedEventCount: 999,
      rank: 1,
      lastAcceptedAt: '2026-08-19',
      organization: { id: 'example', name: 'Example Labs', url: null }
    },
    font: cardFont,
    markData: ''
  })
  assert.match(svg, /data-card-text="DESHI STARTUP"/)
  assert.match(svg, /data-card-text="CONTRIBUTOR"/)
  assert.match(svg, /data-card-text="Author"/)
  assert.doesNotMatch(svg, /\p{Script=Bengali}/u)
  assert.doesNotMatch(
    svg,
    /data-card-text="(?:Example Labs|999|2026-08-19|Rank|[^\"]*contributions|[^\"]*অবদান)/
  )
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
    ['#202122', '#fbfaf7'],
    ['#065f46', '#fbfaf7'],
    ['#54595d', '#fbfaf7'],
    ['#f7f3e8', '#064e3b']
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
    .extract({ left: 1070, top: 48, width: 68, height: 68 })
    .raw()
    .toBuffer({ resolveWithObject: true })
  assert.ok(
    countRedPixels(data, info.channels) > 100,
    'embedded Deshi Startup mark is missing from the warm-white identity field'
  )

  const oldMarkArea = await sharp(path.join(outputDir, 'niloy-biswas.png'))
    .extract({ left: 58, top: 54, width: 68, height: 68 })
    .raw()
    .toBuffer({ resolveWithObject: true })
  assert.equal(
    countRedPixels(oldMarkArea.data, oldMarkArea.info.channels),
    0,
    'Deshi Startup mark must not sit on the green monogram field'
  )
})
