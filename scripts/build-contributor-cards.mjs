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

function measuredTextWidth(value, fontSize, font = null) {
  if (!font) return textUnits(value) * fontSize
  return scriptRuns(value).reduce((sum, run) => {
    if (run.kind !== 'bengali') return sum + textUnits(run.value) * fontSize
    const layout = font.layout(run.value, undefined, 'beng', 'bn', 'ltr')
    return sum + layout.advanceWidth * (fontSize / font.unitsPerEm)
  }, 0)
}

function finalizeNameFit(lines, fontSize, maximumWidth, font) {
  const naturalWidths = lines.map((line) => measuredTextWidth(line, fontSize, font))
  const textLength = naturalWidths.map((width) => width > maximumWidth ? maximumWidth : null)
  return {
    lines,
    fontSize,
    textLength,
    renderedWidths: naturalWidths.map((width) => Math.min(width, maximumWidth))
  }
}

export function fitNameLines(name, maximumWidth = 660, font = null) {
  const cleanName = String(name || '').replace(/\s+/g, ' ').trim() || '?'
  const initialSize = 78
  const maxUnitsAtInitialSize = maximumWidth / initialSize
  const words = cleanName
    .split(' ')
    .flatMap((word) => textUnits(word) > maxUnitsAtInitialSize * 1.7
      ? splitLongToken(word, maxUnitsAtInitialSize)
      : [word])

  const singleLineSize = Math.floor(maximumWidth / textUnits(cleanName))
  if (singleLineSize >= 56) {
    return finalizeNameFit(
      [cleanName],
      Math.min(initialSize, singleLineSize),
      maximumWidth,
      font
    )
  }

  let best = null
  for (let split = 1; split < words.length; split += 1) {
    const lines = [words.slice(0, split).join(' '), words.slice(split).join(' ')]
    const widest = Math.max(...lines.map(textUnits))
    if (!best || widest < best.widest) best = { lines, widest }
  }
  if (!best) best = { lines: [cleanName], widest: textUnits(cleanName) }

  const fontSize = Math.max(32, Math.min(62, Math.floor(maximumWidth / best.widest)))
  return finalizeNameFit(best.lines, fontSize, maximumWidth, font)
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
  const fitted = fitNameLines(profile.displayName, 660, font)
  const lineHeight = fitted.fontSize * 1.08
  const nameStartY = fitted.lines.length === 1 ? 322 : 276
  const roleText = profile.roles
    .slice(0, 3)
    .map((role) => ROLE_LABELS[role]?.en || role)
    .join(' · ')
  const roleFontSize = Math.max(17, Math.min(22, Math.floor(660 / Math.max(textUnits(roleText), 1))))
  const nameNodes = fitted.lines.map((line, index) => outlinedTextNode({
    x: 462,
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
  <!--
    THESIS: A contributor social image is an editorial colophon, not a miniature profile or scoreboard.
    OWN-WORLD: One deep-green monogram field faces a warm-white identity field; the mark and brand share the white colophon.
    STORY: See the person first, understand their contributor role, then follow the stable profile URL.
    FIRST VIEWPORT: Architectural initials on the left; mark, brand, name, contributor label, roles and URL on the right.
    FORM: Split editorial colophon, assigned direction 7, seed 56236154.
    FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
  -->
  <style>
    text{font-family:'Deshi Sans Bengali',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;fill:currentColor}
    path[data-bengali-glyph]{fill:currentColor;stroke:currentColor;paint-order:stroke fill}
    .brand{color:#065f46;font-size:22px;font-weight:720;letter-spacing:1.4px}
    .name{color:#202122;font-size:${fitted.fontSize}px;font-weight:720;letter-spacing:-1.2px}
    .designation{color:#065f46;font-size:24px;font-weight:700;letter-spacing:1.8px}
    .roles{color:#54595d;font-size:${roleFontSize}px;font-weight:560}
    .url{color:#065f46;font-size:18px;font-weight:600}
    .monogram{color:#f7f3e8;font-size:156px;font-weight:720;letter-spacing:-4px}
  </style>
  <rect width="1200" height="630" fill="#fbfaf7"/>
  <rect width="392" height="630" fill="#064e3b"/>
  ${outlinedTextNode({ x: 196, y: 382, text: profile.monogram, className: 'monogram', font, fontSize: 156, fontWeight: 720, anchor: 'middle' })}
  ${outlinedTextNode({ x: 462, y: 92, text: 'DESHI STARTUP', className: 'brand', font, fontSize: 22, fontWeight: 720 })}
  ${markData ? `<image href="data:image/png;base64,${markData}" x="1070" y="48" width="68" height="68"/>` : ''}
  <line x1="462" y1="130" x2="1138" y2="130" stroke="#d9d5cd" stroke-width="1"/>
  ${nameNodes}
  ${outlinedTextNode({ x: 462, y: fitted.lines.length === 1 ? 382 : 394, text: 'CONTRIBUTOR', className: 'designation', font, fontSize: 24, fontWeight: 700 })}
  ${roleText ? outlinedTextNode({ x: 462, y: fitted.lines.length === 1 ? 424 : 436, text: roleText, className: 'roles', font, fontSize: roleFontSize, fontWeight: 560 }) : ''}
  <line x1="462" y1="532" x2="1138" y2="532" stroke="#d9d5cd" stroke-width="1"/>
  ${outlinedTextNode({ x: 462, y: 570, text: `deshistartup.com/contributors/${profile.slug}`, className: 'url', font, fontSize: 18, fontWeight: 600 })}
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
    `Contributor social cards: generated ${result.generated}; removed ${result.removed} stale\n`
  )
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main().catch((error) => {
    process.stderr.write(`Contributor social-card build failed: ${error.message}\n`)
    process.exitCode = 1
  })
}
