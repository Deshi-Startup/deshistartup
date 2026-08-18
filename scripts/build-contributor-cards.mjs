#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
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

function textNode({ x, y, text, className, textLength = null }) {
  return `<text x="${x}" y="${y}" class="${className}"${
    textLength ? ` textLength="${textLength}" lengthAdjust="spacingAndGlyphs"` : ''
  }>${escapeXml(text)}</text>`
}

export function renderContributorCardSvg({ profile, fontData, markData }) {
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
  const fontFace = fontData
    ? `@font-face{font-family:'Deshi Card';src:url(data:font/woff2;base64,${fontData}) format('woff2');font-weight:100 900;}`
    : ''

  const nameNodes = fitted.lines.map((line, index) => textNode({
    x: 300,
    y: nameStartY + lineHeight * index,
    text: line,
    className: 'name',
    textLength: fitted.textLength[index]
  })).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <style>
    ${fontFace}
    text{font-family:'Deshi Card','Noto Sans Bengali','Noto Sans',sans-serif;fill:#202122}
    .brand{font-size:38px;font-weight:700;fill:#065f46}
    .tagline{font-size:21px;font-weight:450;fill:#54595d}
    .name{font-size:${fitted.fontSize}px;font-weight:720;fill:#202122}
    .designation{font-size:26px;font-weight:620;fill:#065f46}
    .roles{font-size:20px;font-weight:560;fill:#54595d}
    .count{font-size:27px;font-weight:680;fill:#202122}
    .organization{font-size:21px;font-weight:520;fill:#54595d}
    .url{font-size:20px;font-weight:560;fill:#3366cc}
    .monogram{font-size:44px;font-weight:720;fill:#065f46;text-anchor:middle}
  </style>
  <rect width="1200" height="630" fill="#f5f3ee"/>
  <rect x="42" y="38" width="1116" height="554" rx="4" fill="#ffffff"/>
  <rect x="42" y="38" width="1116" height="10" fill="#065f46"/>
  ${markData ? `<image href="data:image/svg+xml;base64,${markData}" x="82" y="78" width="86" height="86"/>` : ''}
  ${textNode({ x: 194, y: 112, text: 'দেশি স্টার্টআপ · Deshi Startup', className: 'brand' })}
  ${textNode({ x: 194, y: 148, text: 'বাংলাদেশের উন্মুক্ত স্টার্টআপ গাইড', className: 'tagline' })}
  <line x1="82" y1="186" x2="1118" y2="186" stroke="#d9d5cd" stroke-width="1"/>
  <circle cx="194" cy="302" r="76" fill="#eaf4ef" stroke="#c8ccd1" stroke-width="1"/>
  ${textNode({ x: 194, y: 318, text: profile.monogram, className: 'monogram' })}
  ${nameNodes}
  ${textNode({ x: 300, y: fitted.lines.length === 1 ? 346 : 378, text: 'কন্ট্রিবিউটর · Contributor', className: 'designation' })}
  ${roleText ? textNode({ x: 300, y: fitted.lines.length === 1 ? 389 : 421, text: roleText, className: 'roles', textLength: textUnits(roleText) * 20 > 800 ? 800 : null }) : ''}
  ${textNode({ x: 82, y: 490, text: `${countBn}টি অবদান · ${countEn} ${profile.acceptedEventCount === 1 ? 'contribution' : 'contributions'}`, className: 'count' })}
  ${organization ? textNode({ x: 82, y: 528, text: organization, className: 'organization', textLength: textUnits(organization) * 21 > 720 ? 720 : null }) : ''}
  ${textNode({ x: 82, y: 565, text: `deshistartup.com/contributors/${profile.slug}`, className: 'url' })}
</svg>`
}

export async function buildContributorCards({
  snapshot = snapshotData,
  outputDir,
  fontPath,
  markPath
}) {
  const view = prepareContributorSnapshot(snapshot)
  const [font, mark] = await Promise.all([
    fontPath ? fs.readFile(fontPath).catch(() => null) : null,
    markPath ? fs.readFile(markPath).catch(() => null) : null
  ])
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
      fontData: font?.toString('base64') || '',
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
    markPath: path.join(root, 'public', 'deshi-mark.svg')
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
