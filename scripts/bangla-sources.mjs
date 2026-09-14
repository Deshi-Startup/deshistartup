import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const READER_TEXT = /[ঀ-৿ऀ-ॣ०-ॿ]/

// Parse literals and JSX text so comments, English alternatives and display
// sentinels do not become Bangla findings. Blank lines preserve source locations.
export function banglaSourceText(file, raw) {
  const kind = file.endsWith('.json') ? ts.ScriptKind.JSON :
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  const source = ts.createSourceFile(file, raw, ts.ScriptTarget.Latest, true, kind)
  const lines = raw.split('\n').map(() => '')
  function visit(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node) || ts.isJsxText(node)) {
      const text = ts.isJsxText(node) ? node.getText(source) : node.text
      if (READER_TEXT.test(text)) {
        const start = source.getLineAndCharacterOfPosition(node.getStart(source)).line
        text.split('\n').forEach((line, offset) => {
          lines[start + offset] = `${lines[start + offset] || ''} ${line}`
        })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return lines.join('\n')
}

export function collectBanglaSources(root = '.') {
  const files = []
  function walk(dir) {
    for (const entry of readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const file = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!['generated', '(contents)'].includes(entry.name)) walk(file)
      } else if (/\.(?:tsx?|mjs|json)$/.test(file) && !/\.(?:test|d)\./.test(file)) {
        if (READER_TEXT.test(readFileSync(path.join(root, file), 'utf8'))) files.push(file)
      }
    }
  }
  walk('app')
  walk('data')
  return files.sort()
}
