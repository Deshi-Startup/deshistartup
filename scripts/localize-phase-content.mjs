import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const fsp = fs.promises

const model = process.env.OLLAMA_MODEL || 'gemma4:e4b'
const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/generate'
const root = process.cwd()
const sourceRoot = path.join(root, 'app/(contents)/(bn)')
const targetRoot = path.join(root, 'app/(contents)/en')
const phases = ['phase-one', 'phase-two', 'phase-three', 'phase-four']
const overwrite = process.env.OVERWRITE === 'true'
const limit = Number(process.env.LIMIT || 0)

async function walk(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath))
    } else if (entry.isFile() && entry.name === 'page.mdx') {
      files.push(fullPath)
    }
  }

  return files
}

function cleanResponse(text) {
  const cleaned = text
    .trim()
    .replace(/^```(?:mdx|markdown)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const frontmatterStart = cleaned.indexOf('---')
  if (frontmatterStart > 0) {
    return cleaned.slice(frontmatterStart).trim() + '\n'
  }

  return cleaned + '\n'
}

async function translateMdx(content, relativePath) {
  const prompt = `Translate this Bangla/English mixed MDX documentation page into natural, clear English.

Rules:
- Return only the translated MDX file. Do not add commentary.
- Preserve valid YAML frontmatter between --- markers.
- Translate frontmatter title and description into English.
- Preserve Markdown/MDX structure, headings, lists, blockquotes, tables, links, code fences, imports, JSX, URLs, and route slugs.
- Keep product names, organization names, legal terms, file paths, and URLs unchanged unless they are explanatory prose.
- Keep checkbox syntax, relative links, and absolute links exactly as links.
- If a Bangla phrase is a proper local term, translate the explanation but keep the term where useful.

File: ${relativePath}

${content}`

  const response = await fetch(ollamaUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.9
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const translated = cleanResponse(String(data.response || ''))

  if (!translated.startsWith('---')) {
    throw new Error('Translated output is missing frontmatter')
  }

  return translated
}

async function main() {
  const sourceFiles = []

  for (const phase of phases) {
    sourceFiles.push(...await walk(path.join(sourceRoot, phase)))
  }

  sourceFiles.sort()
  const selectedFiles = limit > 0 ? sourceFiles.slice(0, limit) : sourceFiles
  let written = 0
  let skipped = 0
  const failed = []

  for (const sourceFile of selectedFiles) {
    const relativePath = path.relative(sourceRoot, sourceFile)
    const targetFile = path.join(targetRoot, relativePath)

    try {
      if (!overwrite) {
        await fsp.access(targetFile)
        skipped += 1
        console.log(`skip ${relativePath}`)
        continue
      }
    } catch (_) {
      // Missing target is expected.
    }

    try {
      const content = await fsp.readFile(sourceFile, 'utf8')
      const translated = await translateMdx(content, relativePath)

      await fsp.mkdir(path.dirname(targetFile), { recursive: true })
      await fsp.writeFile(targetFile, translated, 'utf8')
      written += 1
      console.log(`write ${relativePath}`)
    } catch (error) {
      failed.push(`${relativePath}: ${error.message}`)
      console.error(`fail ${relativePath}: ${error.message}`)
    }
  }

  console.log(`done: ${written} written, ${skipped} skipped`)
  if (failed.length > 0) {
    console.error(`failed: ${failed.length}`)
    for (const failure of failed) console.error(failure)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
