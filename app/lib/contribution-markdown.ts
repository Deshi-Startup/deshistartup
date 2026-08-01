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

/** Cells of one table row, keeping `\|` as the escaped literal it is. */
function tableCells(row: string): string[] {
  let inner = row.trim()
  if (inner.startsWith('|')) inner = inner.slice(1)
  if (/(?:^|[^\\])\|$/.test(inner)) inner = inner.slice(0, -1)

  const cells: string[] = []
  let cell = ''
  for (let index = 0; index < inner.length; index += 1) {
    if (inner[index] === '\\' && inner[index + 1] === '|') {
      cell += '\\|'
      index += 1
      continue
    }
    if (inner[index] === '|') {
      cells.push(cell.trim())
      cell = ''
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

function isTableRow(line: string): boolean {
  return line.includes('|')
}

/** `| a | b |` — one space of padding per side, empty cells included. */
function contentRow(cells: string[]): string {
  return `| ${cells.join(' | ')} |`
}

/**
 * Rewrite tables in the repo's hand-written shape: `| cell | cell |` over
 * `|---|---|`.
 *
 * Crepe serializes through mdast-util-gfm-table, which pads every cell out to
 * its column width. That padding is measured in UTF-16 code units, so on Bangla
 * text — where a cluster like `ক্ষ` is several units wide but one glyph — it
 * does not even align, it just rewrites every row of every table the
 * contributor never touched. Collapsing to the compact form makes the round
 * trip lossless, and the two forms parse to the same table.
 */
export function normalizeTables(markdown: string): string {
  return mapOutsideCodeFences(markdown, (segment) => {
    const lines = segment.split('\n')
    for (let index = 0; index < lines.length - 1; index += 1) {
      if (!isTableRow(lines[index]) || !DELIMITER_ROW.test(lines[index + 1].trim())) continue

      const columns = tableCells(lines[index]).length
      if (tableCells(lines[index + 1]).length !== columns) continue

      lines[index] = contentRow(tableCells(lines[index]))
      lines[index + 1] = `|${tableCells(lines[index + 1]).map(delimiterCell).join('|')}|`

      let body = index + 2
      while (body < lines.length && isTableRow(lines[body]) && lines[body].trim()) {
        lines[body] = contentRow(tableCells(lines[body]))
        body += 1
      }
      index = body - 1
    }
    return lines.join('\n')
  })
}
