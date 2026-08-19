#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import * as fontkit from 'fontkit'
import sharp from 'sharp'
import snapshotData from '../app/generated/contributors.json' with { type: 'json' }
import {
  ROLE_LABELS,
  prepareContributorSnapshot
} from '../app/lib/contributor-leaderboard.mjs'

export const CARD_WIDTH = 1200
export const CARD_HEIGHT = 630

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function graphemes(value) {
  const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' })
  return [...segmenter.segment(String(value))].map((entry) => entry.segment)
}

function textUnits(value) {
  return graphemes(value).reduce((sum, character) => {
    if (/\s/u.test(character)) return sum + 0.34
    if (/\p{Script=Bengali}/u.test(character)) return sum + 0.92
    if (/[MW@#%&]/.test(character)) return sum + 0.88
    if (/[A-Z\d]/.test(character)) return sum + 0.68
    if (/[-–\u2014.,:']/u.test(character)) return sum + 0.34
    return sum + 0.56
  }, 0)
}

function scriptRuns(value) {
  const runs = []
  for (const character of graphemes(value)) {
    const kind = /\p{Script=Bengali}/u.test(character) ? 'bengali' : 'text'
    const previous = runs.at(-1)
    if (previous?.kind === kind) previous.value += character
    else runs.push({ kind, value: character })
  }
  return runs
}

function weightStroke(weight) {
  if (weight <= 450) return 0
  return Math.min(0.9, (weight - 400) / 340)
}

function bengaliRun(font, value, fontSize, strokeWidth) {
  const layout = font.layout(value, undefined, 'beng', 'bn', 'ltr')
  const scale = fontSize / font.unitsPerEm
  let penX = 0
  let penY = 0
  const paths = layout.glyphs.map((glyph, index) => {
    const position = layout.positions[index]
    const x = penX + position.xOffset
    const y = penY + position.yOffset
    penX += position.xAdvance
    penY += position.yAdvance
    return `<path data-bengali-glyph="${glyph.id}" d="${escapeXml(glyph.path.toSVG())}" transform="translate(${x} ${y})" vector-effect="non-scaling-stroke" stroke-width="${strokeWidth}"/>`
  }).join('')
  return {
    width: layout.advanceWidth * scale,
    svg: `<g transform="scale(${scale} ${-scale})">${paths}</g>`
  }
}

function outlinedTextNode({
  x,
  y,
  text,
  className,
  font,
  fontSize,
  fontWeight,
  textLength = null,
  anchor = 'start'
}) {
  if (!font) throw new Error('Contributor-card Bengali font is required')
  const strokeWidth = weightStroke(fontWeight)
  const runs = scriptRuns(text).map((run) => {
    if (run.kind === 'bengali') return { ...run, ...bengaliRun(font, run.value, fontSize, strokeWidth) }
    return { ...run, width: textUnits(run.value) * fontSize }
  })
  const naturalWidth = runs.reduce((sum, run) => sum + run.width, 0) || 1
  const renderedWidth = textLength || naturalWidth
  const startX = anchor === 'middle' ? x - renderedWidth / 2 : x
  const scaleX = renderedWidth / naturalWidth
  let offset = 0
  const content = runs.map((run) => {
    const runX = offset
    offset += run.width
    if (run.kind === 'bengali') {
      return `<g transform="translate(${runX} ${y})">${run.svg}</g>`
    }
    return `<text x="${runX}" y="${y}" xml:space="preserve">${escapeXml(run.value)}</text>`
  }).join('')
  return `<g class="${className}" data-card-text="${escapeXml(text)}" transform="translate(${startX} 0) scale(${scaleX} 1)">${content}</g>`
}

function splitLongToken(token, maximumUnits) {
  const pieces = []
  let current = ''
  for (const character of graphemes(token)) {
    if (current && textUnits(current + character) > maximumUnits) {
      pieces.push(current)
      current = character
    } else {
      current += character
    }
  }
  if (current) pieces.push(current)
  return pieces
}

export function fitNameLines(name, maximumWidth = 820) {
  const cleanName = String(name || '').replace(/\s+/g, ' ').trim() || '?'
  const initialSize = 68
  const maxUnitsAtInitialSize = maximumWidth / initialSize
  const words = cleanName
    .split(' ')
    .flatMap((word) => textUnits(word) > maxUnitsAtInitialSize * 1.7
      ? splitLongToken(word, maxUnitsAtInitialSize)
      : [word])

  if (textUnits(cleanName) * initialSize <= maximumWidth) {
    return { lines: [cleanName], fontSize: initialSize, textLength: [null] }
  }

  let best = null
  for (let split = 1; split < words.length; split += 1) {
    const lines = [words.slice(0, split).join(' '), words.slice(split).join(' ')]
    const widest = Math.max(...lines.map(textUnits))
    if (!best || widest < best.widest) best = { lines, widest }
  }
  if (!best) best = { lines: [cleanName], widest: textUnits(cleanName) }

  const fontSize = Math.max(30, Math.min(58, Math.floor(maximumWidth / best.widest)))
  const textLength = best.lines.map((line) =>
    textUnits(line) * fontSize > maximumWidth ? maximumWidth : null
  )
  return { lines: best.lines, fontSize, textLength }
}

export function createContributorCardFont(fontData) {
  if (!fontData?.length) throw new Error('Contributor-card font file is missing or empty')
  const font = fontkit.create(fontData)
  if (!font || font.type !== 'WOFF2' || !font.characterSet?.some((codePoint) => codePoint === 0x0995)) {
    throw new Error('Contributor-card font does not contain Bengali glyphs')
  }
  return font
}

export function renderContributorCardSvg({ profile, font, markData }) {
  const fitted = fitNameLines(profile.displayName)
  const lineHeight = fitted.fontSize * 1.17
  const nameStartY = fitted.lines.length === 1 ? 300 : 274
  const roleText = profile.roles
    .slice(0, 3)
    .map((role) => `${ROLE_LABELS[role]?.bn || role} · ${ROLE_LABELS[role]?.en || role}`)
    .join('   ')
  const countBn = new Intl.NumberFormat('bn-BD').format(profile.acceptedEventCount)
  const countEn = new Intl.NumberFormat('en-BD').format(profile.acceptedEventCount)
  const organization = profile.organization?.name || ''
  const nameNodes = fitted.lines.map((line, index) => outlinedTextNode({
    x: 300,
    y: nameStartY + lineHeight * index,
    text: line,
    className: 'name',
    font,
    fontSize: fitted.fontSize,
    fontWeight: 720,
    textLength: fitted.textLength[index]
  })).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <style>
    text{font-family:'Noto Sans','DejaVu Sans',sans-serif;fill:currentColor}
    path[data-bengali-glyph]{fill:currentColor;stroke:currentColor;paint-order:stroke fill}
    .brand{color:#065f46;font-size:38px;font-weight:700}
    .tagline{color:#54595d;font-size:21px;font-weight:450}
    .name{color:#202122;font-size:${fitted.fontSize}px;font-weight:720}
    .designation{color:#065f46;font-size:26px;font-weight:620}
    .roles{color:#54595d;font-size:20px;font-weight:560}
    .count{color:#202122;font-size:27px;font-weight:680}
    .organization{color:#54595d;font-size:21px;font-weight:520}
    .url{color:#3366cc;font-size:20px;font-weight:560}
    .monogram{color:#065f46;font-size:44px;font-weight:720}
  </style>
  <rect width="1200" height="630" fill="#f5f3ee"/>
  <rect x="42" y="38" width="1116" height="554" rx="4" fill="#ffffff"/>
  <rect x="42" y="38" width="1116" height="10" fill="#065f46"/>
  ${markData ? `<image href="data:image/png;base64,${markData}" x="82" y="78" width="86" height="86"/>` : ''}
  ${outlinedTextNode({ x: 194, y: 112, text: 'দেশি স্টার্টআপ · Deshi Startup', className: 'brand', font, fontSize: 38, fontWeight: 700 })}
  ${outlinedTextNode({ x: 194, y: 148, text: 'বাংলাদেশের উন্মুক্ত স্টার্টআপ গাইড', className: 'tagline', font, fontSize: 21, fontWeight: 450 })}
  <line x1="82" y1="186" x2="1118" y2="186" stroke="#d9d5cd" stroke-width="1"/>
  <circle cx="194" cy="302" r="76" fill="#eaf4ef" stroke="#c8ccd1" stroke-width="1"/>
  ${outlinedTextNode({ x: 194, y: 318, text: profile.monogram, className: 'monogram', font, fontSize: 44, fontWeight: 720, anchor: 'middle' })}
  ${nameNodes}
  ${outlinedTextNode({ x: 300, y: fitted.lines.length === 1 ? 346 : 378, text: 'কন্ট্রিবিউটর · Contributor', className: 'designation', font, fontSize: 26, fontWeight: 620 })}
  ${roleText ? outlinedTextNode({ x: 300, y: fitted.lines.length === 1 ? 389 : 421, text: roleText, className: 'roles', font, fontSize: 20, fontWeight: 560, textLength: textUnits(roleText) * 20 > 800 ? 800 : null }) : ''}
  ${outlinedTextNode({ x: 82, y: 490, text: `${countBn}টি অবদান · ${countEn} ${profile.acceptedEventCount === 1 ? 'contribution' : 'contributions'}`, className: 'count', font, fontSize: 27, fontWeight: 680 })}
  ${organization ? outlinedTextNode({ x: 82, y: 528, text: organization, className: 'organization', font, fontSize: 21, fontWeight: 520, textLength: textUnits(organization) * 21 > 720 ? 720 : null }) : ''}
  ${outlinedTextNode({ x: 82, y: 565, text: `deshistartup.com/contributors/${profile.slug}`, className: 'url', font, fontSize: 20, fontWeight: 560 })}
</svg>`
}

export async function buildContributorCards({
  snapshot = snapshotData,
  outputDir,
  fontPath,
  markPath
}) {
  const view = prepareContributorSnapshot(snapshot)
  if (!fontPath) throw new Error('Contributor-card font path is required')
  const [fontData, mark] = await Promise.all([
    fs.readFile(fontPath),
    // librsvg does not consistently decode nested WebP images. Normalize the
    // mark to PNG bytes before embedding it in the card SVG.
    markPath ? sharp(markPath).png().toBuffer().catch(() => null) : null
  ])
  const font = createContributorCardFont(fontData)
  await fs.mkdir(outputDir, { recursive: true })
  const expected = new Set(view.rankedProfiles.map((profile) => `${profile.slug}.png`))
  let removed = 0

  for (const name of await fs.readdir(outputDir)) {
    if (name.endsWith('.png') && !expected.has(name)) {
      await fs.unlink(path.join(outputDir, name))
      removed += 1
    }
  }

  for (const profile of view.rankedProfiles) {
    const svg = renderContributorCardSvg({
      profile,
      font,
      markData: mark?.toString('base64') || ''
    })
    await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9 })
      .toFile(path.join(outputDir, `${profile.slug}.png`))
  }
  return { generated: expected.size, removed }
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const result = await buildContributorCards({
    outputDir: path.join(root, 'public', 'contributor-cards'),
    fontPath: path.join(root, 'app', 'fonts', 'deshi-sans-bengali-var.woff2'),
    markPath: path.join(root, 'public', 'deshi-mark.webp')
  })
  process.stdout.write(
    `Contributor proof cards: generated ${result.generated}; removed ${result.removed} stale\n`
  )
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main().catch((error) => {
    process.stderr.write(`Contributor proof-card build failed: ${error.message}\n`)
    process.exitCode = 1
  })
}
