const LOCKED_FENCE = 'deshi-locked-mdx'
const SELF_CLOSING_COMPONENT = /<([A-Z][\w]*)\b[^>]*?\/>/g
const EDITABLE_COMPONENTS = new Set(['YouTube', 'FacebookVideo'])

function isEditableVideoComponent(name: string): boolean {
  return EDITABLE_COMPONENTS.has(name)
}

function mapOutsideCodeFences(source: string, transform: (segment: string) => string): string {
  const lines = source.match(/[^\n]*\n|[^\n]+$/g) || []
  const output: string[] = []
  let plain = ''
  let fence: { char: string; length: number } | null = null

  const flushPlain = () => {
    if (!plain) return
    output.push(transform(plain))
    plain = ''
  }

  for (const line of lines) {
    const opening: RegExpMatchArray | null = fence
      ? null
      : line.match(/^[ \t]{0,3}(`{3,}|~{3,})/)
    if (opening) {
      flushPlain()
      fence = { char: opening[1][0], length: opening[1].length }
      output.push(line)
      continue
    }

    if (fence) {
      output.push(line)
      const trimmed = line.trim()
      const isClosing =
        trimmed.length >= fence.length &&
        [...trimmed].every((character) => character === fence?.char)
      if (isClosing) fence = null
      continue
    }

    plain += line
  }

  flushPlain()
  return output.join('')
}

/** Protect self-closing MDX components while the body passes through Crepe. */
export function encodeLockedMdx(body: string): string {
  return mapOutsideCodeFences(body, (segment) =>
    segment.replace(
      SELF_CLOSING_COMPONENT,
      (match, name: string) =>
        isEditableVideoComponent(name)
          ? match
          : `\`\`\`${LOCKED_FENCE}\n${match}\n\`\`\``
    )
  )
}

/** Restore only fences created by encodeLockedMdx, never an author's real mdx example. */
export function decodeLockedMdx(markdown: string): string {
  return markdown.replace(
    /```deshi-locked-mdx\r?\n(<[A-Z][\w]*\b[\s\S]*?\/>)\r?\n```/g,
    (_match, component: string) => component
  )
}

export function lockedMdxBlocks(body: string): string[] {
  const blocks: string[] = []
  mapOutsideCodeFences(body, (segment) => {
    for (const match of segment.matchAll(SELF_CLOSING_COMPONENT)) {
      if (!isEditableVideoComponent(match[1])) blocks.push(match[0])
    }
    return segment
  })
  return blocks
}

export function sameLockedMdx(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((block, index) => block === right[index])
}

const DELIMITER_ROW = /^\|?(?:[ \t]*:?-+:?[ \t]*\|)+[ \t]*:?-*:?[ \t]*\|?$/

type TableLine = {
  prefix: string
  row: string
}

/** Cells of one table row, keeping `\|` as the escaped literal it is. */
function tableCells(row: string): string[] {
  let inner = row.trim()
  if (inner.startsWith('|')) inner = inner.slice(1)
  if (inner.endsWith('|')) {
    let backslashes = 0
    for (let index = inner.length - 2; index >= 0 && inner[index] === '\\'; index -= 1) {
      backslashes += 1
    }
    if (backslashes % 2 === 0) inner = inner.slice(0, -1)
  }

  const cells: string[] = []
  let cell = ''
  for (let index = 0; index < inner.length; index += 1) {
    if (inner[index] === '|') {
      let backslashes = 0
      for (let cursor = index - 1; cursor >= 0 && inner[cursor] === '\\'; cursor -= 1) {
        backslashes += 1
      }
      if (backslashes % 2 === 1) cell += '|'
      else {
        cells.push(cell.trim())
        cell = ''
      }
      continue
    }
    cell += inner[index]
  }
  cells.push(cell.trim())
  return cells
}

/** `---`, or `:---` / `---:` / `:---:` when the column carries an alignment. */
function delimiterCell(cell: string): string {
  const left = cell.startsWith(':')
  const right = cell.endsWith(':')
  if (left && right) return ':---:'
  if (left) return ':---'
  if (right) return '---:'
  return '---'
}

/**
 * Split a serialized table row from the Markdown container that owns it.
 *
 * Crepe can serialize a table inside a blockquote or list item. In those
 * cases the row still starts with `|`, but the line starts with a Markdown
 * container prefix such as `> `, `* ` or two continuation spaces. Requiring
 * the structural pipe here also keeps prose, headings and MDX attributes
 * from being mistaken for tables merely because they contain a pipe.
 */
function parseTableLine(line: string, allowDeepIndent = false): TableLine | null {
  let offset = 0
  let prefix = ''

  const leading = line.match(allowDeepIndent ? /^[ \t]*/ : /^[ \t]{0,3}/)?.[0] ?? ''
  prefix += leading
  offset += leading.length

  // A blockquote may contain another blockquote or a list. Keep the exact
  // prefix so the normalizer changes only cell padding, never the container.
  while (true) {
    const blockquote = line.slice(offset).match(/^[ \t]{0,3}>[ \t]?/)
    if (!blockquote) break
    prefix += blockquote[0]
    offset += blockquote[0].length
  }

  // A blockquote's continuation line can be indented after its marker.
  if (prefix.includes('>')) {
    const continuation =
      line.slice(offset).match(allowDeepIndent ? /^[ \t]*/ : /^[ \t]{0,3}/)?.[0] ?? ''
    prefix += continuation
    offset += continuation.length
  }

  // The first row in a list item carries its marker; continuation rows carry
  // the equivalent indentation instead. Accept nested list markers too.
  while (true) {
    const listMarker = line.slice(offset).match(/^(?:[-+*]|\d+[.)])[ \t]+/)
    if (!listMarker) break
    prefix += listMarker[0]
    offset += listMarker[0].length
  }

  if (line[offset] !== '|') return null
  return { prefix, row: line.slice(offset) }
}

function hasListMarkerPrefix(prefix: string): boolean {
  return /(?:^|[ \t>])(?:[-+*]|\d+[.)])(?=[ \t])/.test(prefix)
}

/** `| a | b |` — one space of padding per side, empty cells included. */
function contentRow(cells: string[]): string {
  return `| ${cells.join(' | ')} |`
}

/**
 * Treat a list marker and its indented continuation as the same table
 * container. Whitespace differences inside a blockquote are also harmless,
 * but the blockquote depth itself remains significant.
 */
function tablePrefixSignature(prefix: string): string {
  return prefix
    .replace(/(?:^|[ \t>])(?:[-+*]|\d+[.)])(?=[ \t])/g, (match) =>
      match.replace(/[^ \t>]/g, ' ')
    )
    .replace(/[ \t]+/g, ' ')
}

function compatibleTablePrefix(left: string, right: string): boolean {
  return tablePrefixSignature(left) === tablePrefixSignature(right)
}

function normalizeTableSegment(segment: string): string {
  const lines = segment.split('\n')
  for (let index = 0; index < lines.length - 1; index += 1) {
    const header = parseTableLine(lines[index])
    const deepHeader = header ? null : parseTableLine(lines[index], true)
    if (!header && (!deepHeader || !hasListMarkerPrefix(deepHeader.prefix))) continue
    const tableHeader = header ?? deepHeader
    if (!tableHeader) continue
    const allowDeepIndent = hasListMarkerPrefix(tableHeader.prefix)
    const delimiter = parseTableLine(lines[index + 1], allowDeepIndent)
    if (!delimiter || !DELIMITER_ROW.test(delimiter.row.trim())) continue
    if (!compatibleTablePrefix(tableHeader.prefix, delimiter.prefix)) continue

    const headerCells = tableCells(tableHeader.row)
    const delimiterCells = tableCells(delimiter.row)
    if (delimiterCells.length !== headerCells.length) continue

    const tablePrefix = tablePrefixSignature(tableHeader.prefix)
    lines[index] = `${tableHeader.prefix}${contentRow(headerCells)}`
    lines[index + 1] = `${delimiter.prefix}|${delimiterCells.map(delimiterCell).join('|')}|`

    let body = index + 2
    while (body < lines.length) {
      const row = parseTableLine(lines[body], allowDeepIndent)
      if (!row || !row.row.trim() || tablePrefixSignature(row.prefix) !== tablePrefix) break
      lines[body] = `${row.prefix}${contentRow(tableCells(row.row))}`
      body += 1
    }
    index = body - 1
  }
  return lines.join('\n')
}

function isMarkdownWordCharacter(character: string | undefined): boolean {
  return character !== undefined && /[\p{L}\p{N}_]/u.test(character)
}

/**
 * Undo only escapes that remark-stringify adds defensively to ordinary text.
 *
 * `remark-stringify` emits `C\\&F` and `\\_\\_\\_` for literal text even though
 * the repository writes those values unescaped. Entity-looking ampersands
 * and underscores touching a word are left alone because removing their
 * backslashes can change Markdown meaning.
 */
function normalizeSerializerEscapes(segment: string): string {
  let normalized = segment.replace(
    /(?<!\\)\\&(?!(?:#(?:x[0-9a-f]+|[0-9]+)|[a-z][a-z0-9]+);)/gi,
    '&'
  )

  normalized = normalized.replace(/(?<!\\)(?:\\_)+/g, (escaped, offset: number, source: string) => {
    const before = source[offset - 1]
    const after = source[offset + escaped.length]
    if (isMarkdownWordCharacter(before) || isMarkdownWordCharacter(after)) return escaped
    return '_'.repeat(escaped.length / 2)
  })

  return normalized
}

function mapOutsideInlineCodeSpans(source: string, transform: (segment: string) => string): string {
  let output = ''
  let plain = ''
  let codeDelimiter: string | null = null

  const flushPlain = () => {
    if (!plain) return
    output += transform(plain)
    plain = ''
  }

  for (let index = 0; index < source.length; ) {
    if (source[index] === '`' && !codeDelimiter) {
      let backslashes = 0
      for (let cursor = index - 1; cursor >= 0 && source[cursor] === '\\'; cursor -= 1) {
        backslashes += 1
      }
      if (backslashes % 2 === 1) {
        plain += source[index]
        index += 1
        continue
      }
    }

    if (source[index] !== '`') {
      if (codeDelimiter) output += source[index]
      else plain += source[index]
      index += 1
      continue
    }

    let end = index + 1
    while (source[end] === '`') end += 1
    const delimiter = source.slice(index, end)

    if (!codeDelimiter) {
      flushPlain()
      output += delimiter
      codeDelimiter = delimiter
    } else if (delimiter === codeDelimiter) {
      output += delimiter
      codeDelimiter = null
    } else {
      output += delimiter
    }
    index = end
  }

  flushPlain()
  return output
}

/**
 * Rewrite editor output in the repo's hand-written shape: `| cell | cell |` over
 * `|---|---|`.
 *
 * Crepe serializes through mdast-util-gfm-table, which pads every cell out to
 * its column width. That padding is measured in UTF-16 code units, so on Bangla
 * text — where a cluster like `ক্ষ` is several units wide but one glyph — it
 * does not even align, it just rewrites every row of every table the
 * contributor never touched. Collapsing to the compact form makes the round
 * trip lossless, and the two forms parse to the same table. The same pass
 * also removes the small set of defensive text escapes that the serializer
 * cannot be configured to avoid.
 */
export function normalizeContributionMarkdown(markdown: string): string {
  return mapOutsideCodeFences(markdown, (segment) =>
    mapOutsideInlineCodeSpans(normalizeTableSegment(segment), normalizeSerializerEscapes)
  )
}

/** Kept as a compatibility alias for existing table-normalization callers. */
export function normalizeTables(markdown: string): string {
  return normalizeContributionMarkdown(markdown)
}
