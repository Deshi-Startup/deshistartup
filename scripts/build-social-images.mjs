#!/usr/bin/env node
/*
FORM: Code-led editorial folio; chosen form 7 of 7; concept-seed key 43206b6f.
*/
import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import * as fontkit from 'fontkit'
import sharp from 'sharp'
import socialImages from '../data/social-images.json' with { type: 'json' }
import caseCovers from '../data/case-study-covers.json' with { type: 'json' }
import caseArtwork from '../data/case-study-artwork.json' with { type: 'json' }
import caseLogos from '../data/case-study-logos.json' with { type: 'json' }
import startupLogos from '../data/startup-50-logos.json' with { type: 'json' }
import mediaRegistry from '../app/generated/media.json' with { type: 'json' }
import { MEDIA_URL } from '../app/seo.config.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CASE_PROVENANCE = 'Programmatic 1200x630 social image adapted from the approved Deshi Startup case-study gallery. The same company ground, official logo, headline and vector artwork are shared with the gallery. Wide composition with generous text measure, original logo colours, and a quiet Deshi Startup footer. The bundled Deshi Sans Bengali font shapes Bangla; Latin uses the existing sans-serif fallback. No new factual claims, synthetic photos or interface controls.'

export const CARD_WIDTH = 1200
export const CARD_HEIGHT = 630

const PNG_TEXT_KEY = 'impeccable:prompt'
const crcTable = (() => {
  const table = new Uint32Array(256)
  for (let value = 0; value < 256; value += 1) {
    let crc = value
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
    }
    table[value] = crc >>> 0
  }
  return table
})()

function crc32(data) {
  let crc = 0xffffffff
  for (const byte of data) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const chunk = Buffer.alloc(12 + data.length)
  chunk.writeUInt32BE(data.length, 0)
  chunk.write(type, 4, 'ascii')
  data.copy(chunk, 8)
  chunk.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length)
  return chunk
}

export function embedSocialImageProvenance(png, prompt) {
  const iend = png.indexOf(Buffer.from('IEND', 'ascii')) - 4
  if (iend < 8) throw new Error('Generated social image is not a valid PNG')
  if (!prompt?.trim()) throw new Error('Social-image provenance is required')
  const text = Buffer.concat([
    Buffer.from(PNG_TEXT_KEY, 'latin1'),
    Buffer.from([0]),
    Buffer.from(prompt, 'utf8')
  ])
  return Buffer.concat([png.subarray(0, iend), pngChunk('tEXt', text), png.subarray(iend)])
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function createSocialImageFont(fontData) {
  if (!fontData?.length) throw new Error('Social-image Bengali font file is missing or empty')
  const font = fontkit.create(fontData)
  if (!font || !['WOFF2', 'TTF'].includes(font.type) || !font.characterSet?.includes(0x0995)) {
    throw new Error('Social-image font does not contain Bengali glyphs')
  }
  return font
}

export function renderFolioSocialSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <!-- Startup 50 social image: an editorial folio, not a miniature web page. -->
  <rect width="1200" height="630" fill="#fbfaf7"/>
  <rect width="400" height="630" fill="#064e3b"/>
  <line x1="468" y1="132" x2="1138" y2="132" stroke="#d9d5cd" stroke-width="1"/>
  <line x1="468" y1="530" x2="1138" y2="530" stroke="#d9d5cd" stroke-width="1"/>
</svg>`
}

async function configureFontRendering() {
  const cache = path.join(os.tmpdir(), 'deshi-social-image-font-cache')
  await fs.mkdir(cache, { recursive: true })
  process.env.XDG_CACHE_HOME ||= cache
  if (!process.env.FONTCONFIG_FILE) {
    const config = [
      '/opt/homebrew/etc/fonts/fonts.conf',
      '/usr/local/etc/fonts/fonts.conf',
      '/etc/fonts/fonts.conf'
    ].find((candidate) => fsSync.existsSync(candidate))
    if (config) process.env.FONTCONFIG_FILE = config
  }
}

async function textLayer({
  text,
  locale,
  fontPath,
  fontSize,
  fontWeight,
  color,
  width,
  height,
  spacing = 0,
  letterSpacing = 0,
  bundledFont = false,
  fixedSize = false
}) {
  const markup = `<span foreground="${color}" font_size="${Math.round(fontSize * 1024)}" font_weight="${fontWeight}"` +
    (letterSpacing ? ` letter_spacing="${Math.round(letterSpacing * 1024)}"` : '') +
    `>${escapeXml(text)}</span>`
  return sharp({
    text: {
      text: markup,
      font: locale === 'bn' || bundledFont ? 'Deshi Sans Bengali' : 'Arial',
      ...(locale === 'bn' || bundledFont ? { fontfile: fontPath } : {}),
      width,
      ...(fixedSize ? {} : { height }),
      rgba: true,
      align: 'left',
      spacing
    }
  }).png().toBuffer({ resolveWithObject: true })
}

async function renderFolioSocialCard({ locale, copy, fontPath, mark, provenance }) {
  if (!Array.isArray(copy.tagline) || copy.tagline.length !== 2) {
    throw new Error(`${locale} folio social image needs exactly two tagline lines`)
  }
  const [folio, title, tagline, url] = await Promise.all([
    textLayer({
      text: copy.folio,
      locale,
      fontPath,
      fontSize: locale === 'en' ? 216 : 195,
      fontWeight: locale === 'en' ? 700 : 600,
      color: '#f7f3e8',
      width: 330,
      height: 360,
      letterSpacing: locale === 'en' ? -6 : 0
    }),
    textLayer({
      text: copy.title,
      locale,
      fontPath,
      fontSize: 44,
      fontWeight: locale === 'en' ? 700 : 600,
      color: '#202122',
      width: 668,
      height: 90,
      letterSpacing: locale === 'en' ? -1.1 : 0
    }),
    textLayer({
      text: copy.tagline.join('\n'),
      locale,
      fontPath,
      fontSize: 29,
      fontWeight: 400,
      color: '#315548',
      width: 668,
      height: 120,
      spacing: locale === 'en' ? 8 : -8,
      letterSpacing: locale === 'en' ? -0.2 : 0
    }),
    textLayer({
      text: copy.displayUrl,
      locale: 'en',
      fontPath,
      fontSize: 14.5,
      fontWeight: 600,
      color: '#065f46',
      width: 668,
      height: 30,
      letterSpacing: 0.15
    })
  ])

  const png = await sharp(Buffer.from(renderFolioSocialSvg()))
    .composite([
      { input: folio.data, left: Math.round((400 - folio.info.width) / 2), top: Math.round((630 - folio.info.height) / 2) },
      { input: title.data, left: 468, top: 194 },
      { input: tagline.data, left: 468, top: locale === 'en' ? 304 : 316 },
      { input: url.data, left: 468, top: 554 },
      ...(mark ? [{ input: mark, left: 1068, top: 50 }] : [])
    ])
    .png({ compressionLevel: 9 })
    .toBuffer()
  return embedSocialImageProvenance(png, provenance)
}

function shortHash(bytes) {
  return createHash('sha256').update(bytes).digest('hex').slice(0, 12)
}

export function caseStudyPalette(css, theme) {
  const rule = [...css.matchAll(/\.case-theme--([\w-]+)\s*\{([^}]+)\}/g)]
    .filter((match) => match[1] === theme).at(-1)?.[2]
  const colors = Object.fromEntries([...String(rule).matchAll(/--case-(ground|ink|soft):\s*(#[a-f\d]{6})/gi)]
    .map((match) => [match[1], match[2]]))
  if (!colors.ground || !colors.ink || !colors.soft) throw new Error(`Missing case-study palette: ${theme}`)
  return colors
}

export function validateCaseStudySocialDefinitions(pages, definitions = socialImages) {
  const written = pages.filter((page) => page.slug.startsWith('case-studies/') && !page.stub)
  for (const page of written) {
    const definition = definitions[page.slug]
    const slug = page.slug.slice('case-studies/'.length)
    if (definition?.template !== 'case-study' || !definition.locales?.[page.locale]) {
      throw new Error(`${page.locale}:${page.slug}: completed case study needs a social-image definition`)
    }
    if (!caseCovers[slug] || !caseArtwork[caseCovers[slug].theme]) {
      throw new Error(`${page.slug}: completed case study needs shared cover copy and artwork`)
    }
  }
  for (const [slug, definition] of Object.entries(definitions)) {
    if (definition.template !== 'case-study') continue
    for (const locale of Object.keys(definition.locales || {})) {
      if (!written.some((page) => page.slug === slug && page.locale === locale)) {
        throw new Error(`${locale}:${slug}: stale social-image definition has no completed case study`)
      }
    }
  }
}

function logoForCase(slug) {
  const logoSlug = caseCovers[slug]?.logoSlug || slug
  return caseLogos.entries.find((entry) => entry.slug === logoSlug)
    || startupLogos.entries.find((entry) => entry.slug === logoSlug)
}

async function loadApprovedLogo(logo) {
  const entry = mediaRegistry[logo.src]
  if (!entry?.remote || !entry.sha || !entry.key) throw new Error(`${logo.slug}: no approved remote logo`)
  let bytes
  try {
    bytes = await fs.readFile(path.join(ROOT, logo.src))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    const response = await fetch(`${MEDIA_URL}/${entry.key}`, { signal: AbortSignal.timeout(20000) })
    if (!response.ok) throw new Error(`${logo.slug}: approved logo returned HTTP ${response.status}`)
    bytes = Buffer.from(await response.arrayBuffer())
  }
  if (shortHash(bytes) !== entry.sha) throw new Error(`${logo.slug}: logo bytes differ from the reviewed media registry`)
  return bytes
}

export async function renderCaseStudySocialCard({ page, fontPath, palette, logo, logoBytes }) {
  const locale = page.locale
  const slug = page.slug.slice('case-studies/'.length)
  const cover = caseCovers[slug]
  const artwork = caseArtwork[cover.theme]
  const svg = artwork.locales?.[locale] || artwork.svg
  const text = (value, fontSize, color, width, height, fontWeight = 600, spacing = 0) => textLayer({
    text: value, locale, fontPath, fontSize, fontWeight, color, width, height, spacing,
    bundledFont: true, fixedSize: true
  })
  const [name, headline, footer, domain, logoLayer, artLayer] = await Promise.all([
    text(page.title, 32, palette.soft, 650, 74),
    text(cover.title[locale].join('\n'), 56, palette.ink, 660, 205, 600, locale === 'bn' ? -3 : 2),
    text(locale === 'en' ? 'Deshi Startup / Case study' : 'দেশি স্টার্টআপ / কেস স্টাডি', 23, palette.soft, 700, 52, 400),
    textLayer({ text: 'deshistartup.com', locale: 'en', fontPath, fontSize: 22, fontWeight: 400, color: palette.soft, width: 300, height: 52, bundledFont: true, fixedSize: true }),
    sharp(logoBytes).resize(208, 66, { fit: 'inside' }).png().toBuffer({ resolveWithObject: true }),
    sharp(Buffer.from(svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')))
      .resize(432, 262).png().toBuffer()
  ])
  if (name.info.height > 58 || headline.info.height > 207 || footer.info.height > 42 || domain.info.height > 42) {
    const sizes = { name: name.info, headline: headline.info, footer: footer.info, domain: domain.info }
    throw new Error(`${locale}:${page.slug}: social-image copy exceeds its safe area: ${JSON.stringify(sizes)}`)
  }
  // The approved cover artwork fills the right side; text is never scaled into a narrow column.
  const base = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="${palette.ground}"/>
    <rect x="60" y="54" width="248" height="102" rx="6" fill="${logo.background || '#ffffff'}"/>
    <path d="M60 536H1140" stroke="${palette.ink}" stroke-opacity=".28"/>
  </svg>`
  const png = await sharp(Buffer.from(base)).composite([
    { input: logoLayer.data, left: 60 + Math.round((248 - logoLayer.info.width) / 2), top: 54 + Math.round((102 - logoLayer.info.height) / 2) },
    { input: name.data, left: 60, top: 229 },
    { input: headline.data, left: 60, top: 297 },
    { input: artLayer, left: 714, top: 216 },
    { input: footer.data, left: 60, top: 568 },
    { input: domain.data, left: 1140 - domain.info.width, top: 568 }
  ]).png({ compressionLevel: 9 }).toBuffer()
  return embedSocialImageProvenance(png, `${CASE_PROVENANCE} Company: ${page.title}. Locale: ${locale}.`)
}

export async function buildSocialImages({
  definitions = socialImages,
  outputDir,
  fontPath,
  markPath,
  pages = [],
  themeCss,
  logoLoader = loadApprovedLogo,
  check = false,
  registry = mediaRegistry
}) {
  if (!fontPath) throw new Error('Social-image font path is required')
  await configureFontRendering()
  const [fontData, mark] = await Promise.all([
    fs.readFile(fontPath),
    markPath
      ? sharp(markPath).resize(70, 70, { fit: 'contain' }).png().toBuffer().catch(() => null)
      : null
  ])
  createSocialImageFont(fontData)
  let generated = 0
  const logoCache = new Map()
  const stale = []

  for (const [slug, definition] of Object.entries(definitions)) {
    if (!['folio', 'case-study'].includes(definition.template)) {
      throw new Error(`${slug}: unsupported social-image template ${definition.template}`)
    }
    if (definition.template === 'folio' && !definition.provenance?.trim()) {
      throw new Error(`${slug}: social-image provenance is required`)
    }
    for (const [locale, copy] of Object.entries(definition.locales || {})) {
      const expectedSrc = `/media/og/${locale}/${slug}.png`
      if (copy.src !== expectedSrc) {
        throw new Error(`${slug}:${locale} must use ${expectedSrc}`)
      }
      const target = path.join(outputDir, locale, `${slug}.png`)
      let card
      if (definition.template === 'case-study') {
        const companySlug = slug.slice('case-studies/'.length)
        const page = pages.find((candidate) => candidate.slug === slug && candidate.locale === locale && !candidate.stub)
        if (!page) throw new Error(`${locale}:${slug}: no completed case study in the manifest`)
        const logo = logoForCase(companySlug)
        if (!logo) throw new Error(`${slug}: reviewed company logo is required`)
        if (!logoCache.has(logo.src)) logoCache.set(logo.src, await logoLoader(logo))
        card = await renderCaseStudySocialCard({
          page, fontPath, logo, logoBytes: logoCache.get(logo.src),
          palette: caseStudyPalette(themeCss, caseCovers[companySlug].theme)
        })
      } else {
        card = await renderFolioSocialCard({ locale, copy, fontPath, mark, provenance: definition.provenance })
      }
      if (check) {
        // Compare the exact expected pixels and provenance to the uploaded revision.
        // This catches changed headlines, artwork, palettes and missing uploads.
        if (!registry[copy.src]?.remote || registry[copy.src]?.sha !== shortHash(card)) stale.push(copy.src)
      } else {
        await fs.mkdir(path.dirname(target), { recursive: true })
        await fs.writeFile(target, card)
      }
      generated += 1
    }
  }
  return check ? { checked: generated, stale } : { generated }
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const pages = JSON.parse(await fs.readFile(path.join(root, 'app/generated/seo-pages.json'), 'utf8'))
  validateCaseStudySocialDefinitions(pages)
  const check = process.argv.includes('--check')
  const definitions = process.argv.includes('--case-studies')
    ? Object.fromEntries(Object.entries(socialImages).filter(([, definition]) => definition.template === 'case-study'))
    : socialImages
  const themeCss = (await Promise.all(['CaseStudy.css', 'CaseStudyIndex.css'].map((file) => fs.readFile(path.join(root, 'app/components', file), 'utf8')))).join('\n')
  const result = await buildSocialImages({
    definitions, pages, themeCss, check,
    outputDir: path.join(root, 'media', 'og'),
    fontPath: path.join(root, 'app', 'fonts', 'deshi-sans-bengali-var.ttf'),
    markPath: path.join(root, 'public', 'deshi-mark.webp')
  })
  if (check) {
    if (result.stale.length) throw new Error(`Social images need regeneration and upload:\n${result.stale.join('\n')}`)
    process.stdout.write(`Social images: ${result.checked} uploaded images match current sources\n`)
  } else {
    process.stdout.write(`Social images: generated ${result.generated} in gitignored media/og\n`)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main().catch((error) => {
    process.stderr.write(`Social-image build failed: ${error.message}\n`)
    process.exitCode = 1
  })
}
