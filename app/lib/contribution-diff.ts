export type ContributionDiffKind = 'context' | 'addition' | 'deletion'

/**
 * One run inside a changed line. A prose edit is usually a couple of words in
 * a long sentence, so the dialog needs to point at those words rather than
 * hand the reader two near-identical paragraphs to compare by eye.
 */
export interface ContributionDiffSegment {
  kind: 'same' | 'changed'
  text: string
}

export interface ContributionDiffRow {
  kind: ContributionDiffKind
  oldLine: number | null
  newLine: number | null
  text: string
  /** Present only when this line was paired with its counterpart. */
  segments?: ContributionDiffSegment[]
  /**
   * A fence this editor wraps protected MDX in on the way through Crepe. It
   * is transport, not the author's text, so an unchanged one is not shown.
   */
  wrapper?: boolean
}

export interface ContributionDiffHunk {
  oldStart: number
  oldCount: number
  newStart: number
  newCount: number
  /** Nearest Markdown heading at or above this hunk, for "where am I". */
  heading: string | null
  rows: ContributionDiffRow[]
}

export interface ContributionReview {
  status: 'unchanged' | 'ready' | 'too-large'
  additions: number
  deletions: number
  hunks: ContributionDiffHunk[]
}

interface ContributionDiffOptions {
  contextLines?: number
  maxChangedLines?: number
  maxLines?: number
  maxWork?: number
}

interface RawDiffRow {
  kind: 'equal' | 'addition' | 'deletion'
  text: string
}

const DEFAULT_CONTEXT_LINES = 3
const DEFAULT_MAX_CHANGED_LINES = 600
const DEFAULT_MAX_LINES = 5_000
const DEFAULT_MAX_WORK = 80_000
/** A prose line is a few dozen tokens, so this budget is never reached in practice. */
const WORD_MAX_WORK = 4_000
/** Beyond this the pair is a rewrite, not an edit, and word marks only add noise. */
const WORD_MIN_SHARED_RATIO = 0.25
const WORD_MAX_LINE_LENGTH = 2_000
const WORD_TOKENS = /[\p{L}\p{M}\p{N}_]+|\s+|[^\p{L}\p{M}\p{N}_\s]/gu
const ATX_HEADING = /^ {0,3}(#{1,6})[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/
const LOCKED_FENCE_OPEN = '```deshi-locked-mdx'
const LOCKED_FENCE_CLOSE = '```'

function integerOption(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && value !== undefined && value >= 0
    ? Math.floor(value)
    : fallback
}

function linesOf(markdown: string): string[] {
  return markdown === '' ? [] : markdown.split('\n')
}

function mapValue(map: Map<number, number>, key: number): number {
  return map.get(key) ?? -1
}

/** Reconstruct Myers' shortest edit script from the saved frontiers. */
function backtrack(
  trace: Map<number, number>[],
  before: string[],
  after: string[]
): RawDiffRow[] {
  let x = before.length
  let y = after.length
  const reversed: RawDiffRow[] = []

  for (let depth = trace.length - 1; depth >= 0; depth -= 1) {
    const frontier = trace[depth]
    const diagonal = x - y
    const previousDiagonal =
      diagonal === -depth ||
      (diagonal !== depth && mapValue(frontier, diagonal - 1) < mapValue(frontier, diagonal + 1))
        ? diagonal + 1
        : diagonal - 1
    const previousX = Math.max(0, mapValue(frontier, previousDiagonal))
    const previousY = previousX - previousDiagonal

    while (x > previousX && y > previousY) {
      reversed.push({ kind: 'equal', text: before[x - 1] })
      x -= 1
      y -= 1
    }

    if (depth === 0) break
    if (x === previousX) {
      reversed.push({ kind: 'addition', text: after[y - 1] })
      y -= 1
    } else {
      reversed.push({ kind: 'deletion', text: before[x - 1] })
      x -= 1
    }
  }

  return reversed.reverse()
}

/**
 * Myers line diff with an explicit work ceiling. The normal case is a small
 * edit to a guide and finishes near-linearly; adversarial replacements stop
 * at the budget instead of allocating an N x M matrix on the reader's phone.
 */
function diffMiddle(
  before: string[],
  after: string[],
  maxWork: number,
  maxChangedLines: number
): RawDiffRow[] | null {
  if (before.length === 0) {
    return after.length > maxChangedLines
      ? null
      : after.map((text) => ({ kind: 'addition', text }))
  }
  if (after.length === 0) {
    return before.length > maxChangedLines
      ? null
      : before.map((text) => ({ kind: 'deletion', text }))
  }

  const maximumDepth = Math.min(before.length + after.length, maxChangedLines)
  const frontier = new Map<number, number>([[1, 0]])
  const trace: Map<number, number>[] = []
  let work = 0

  for (let depth = 0; depth <= maximumDepth; depth += 1) {
    trace.push(new Map(frontier))

    for (let diagonal = -depth; diagonal <= depth; diagonal += 2) {
      work += 1
      if (work > maxWork) return null

      let x
      if (
        diagonal === -depth ||
        (diagonal !== depth &&
          mapValue(frontier, diagonal - 1) < mapValue(frontier, diagonal + 1))
      ) {
        x = Math.max(0, mapValue(frontier, diagonal + 1))
      } else {
        x = mapValue(frontier, diagonal - 1) + 1
      }
      let y = x - diagonal

      while (x < before.length && y < after.length && before[x] === after[y]) {
        x += 1
        y += 1
        work += 1
        if (work > maxWork) return null
      }

      frontier.set(diagonal, x)
      if (x >= before.length && y >= after.length) {
        return backtrack(trace, before, after)
      }
    }
  }

  return null
}

function numberedRows(rows: RawDiffRow[]): ContributionDiffRow[] {
  let oldLine = 1
  let newLine = 1

  return rows.map((row) => {
    if (row.kind === 'equal') {
      const numbered = {
        kind: 'context' as const,
        oldLine,
        newLine,
        text: row.text
      }
      oldLine += 1
      newLine += 1
      return numbered
    }
    if (row.kind === 'deletion') {
      const numbered = {
        kind: 'deletion' as const,
        oldLine,
        newLine: null,
        text: row.text
      }
      oldLine += 1
      return numbered
    }
    const numbered = {
      kind: 'addition' as const,
      oldLine: null,
      newLine,
      text: row.text
    }
    newLine += 1
    return numbered
  })
}

function tokenize(line: string): string[] {
  return line.match(WORD_TOKENS) ?? []
}

/** Adjacent runs of one kind become one span, and a lone gap of whitespace
    between two changes is absorbed so a two-word fix reads as one mark. */
function coalesce(segments: ContributionDiffSegment[]): ContributionDiffSegment[] {
  const merged: ContributionDiffSegment[] = []
  for (const segment of segments) {
    if (segment.text === '') continue
    const previous = merged.at(-1)
    if (previous && previous.kind === segment.kind) previous.text += segment.text
    else merged.push({ ...segment })
  }

  const bridged: ContributionDiffSegment[] = []
  for (let index = 0; index < merged.length; index += 1) {
    const segment = merged[index]
    const isWhitespaceGap =
      segment.kind === 'same' &&
      segment.text.trim() === '' &&
      index > 0 &&
      index < merged.length - 1
    if (isWhitespaceGap) bridged.push({ kind: 'changed', text: segment.text })
    else bridged.push(segment)
  }

  const finished: ContributionDiffSegment[] = []
  for (const segment of bridged) {
    const previous = finished.at(-1)
    if (previous && previous.kind === segment.kind) previous.text += segment.text
    else finished.push({ ...segment })
  }
  return finished
}

/**
 * Mark the words that actually moved between one removed line and the added
 * line that replaced it. Returns null when the two lines share too little to
 * be the same sentence, in which case the whole line stays marked instead.
 */
function pairSegments(
  before: string,
  after: string
): { before: ContributionDiffSegment[]; after: ContributionDiffSegment[] } | null {
  if (before.length > WORD_MAX_LINE_LENGTH || after.length > WORD_MAX_LINE_LENGTH) return null

  const beforeTokens = tokenize(before)
  const afterTokens = tokenize(after)
  if (beforeTokens.length === 0 || afterTokens.length === 0) return null

  const raw = diffMiddle(
    beforeTokens,
    afterTokens,
    WORD_MAX_WORK,
    beforeTokens.length + afterTokens.length
  )
  if (!raw) return null

  const shared = raw.reduce(
    (total, row) => (row.kind === 'equal' ? total + row.text.trim().length : total),
    0
  )
  const longest = Math.max(before.trim().length, after.trim().length, 1)
  if (shared / longest < WORD_MIN_SHARED_RATIO) return null

  return {
    before: coalesce(
      raw.flatMap((row) =>
        row.kind === 'addition'
          ? []
          : [{ kind: row.kind === 'equal' ? ('same' as const) : ('changed' as const), text: row.text }]
      )
    ),
    after: coalesce(
      raw.flatMap((row) =>
        row.kind === 'deletion'
          ? []
          : [{ kind: row.kind === 'equal' ? ('same' as const) : ('changed' as const), text: row.text }]
      )
    )
  }
}

/**
 * A removed line immediately followed by an added line is nearly always the
 * same sentence, edited. Pair those runs off so each half can carry its word
 * marks; the leftovers of an uneven run stay whole-line changes.
 */
function markWordChanges(rows: ContributionDiffRow[]): void {
  let index = 0
  while (index < rows.length) {
    if (rows[index].kind !== 'deletion') {
      index += 1
      continue
    }
    let deletionEnd = index
    while (deletionEnd < rows.length && rows[deletionEnd].kind === 'deletion') deletionEnd += 1
    let additionEnd = deletionEnd
    while (additionEnd < rows.length && rows[additionEnd].kind === 'addition') additionEnd += 1

    const pairs = Math.min(deletionEnd - index, additionEnd - deletionEnd)
    for (let offset = 0; offset < pairs; offset += 1) {
      const removed = rows[index + offset]
      const added = rows[deletionEnd + offset]
      const segments = pairSegments(removed.text, added.text)
      if (!segments) continue
      removed.segments = segments.before
      added.segments = segments.after
    }
    index = additionEnd > index ? additionEnd : index + 1
  }
}

/**
 * Flag the fence pair around protected MDX so the dialog can leave it out of
 * the context it shows. A contributor never typed ```deshi-locked-mdx and
 * cannot change what is inside it, so an unchanged fence is only noise.
 */
function markLockedFences(rows: ContributionDiffRow[]): void {
  for (let index = 0; index < rows.length; index += 1) {
    if (rows[index].kind !== 'context' || rows[index].text !== LOCKED_FENCE_OPEN) continue
    for (let cursor = index + 1; cursor < rows.length; cursor += 1) {
      if (rows[cursor].text === LOCKED_FENCE_OPEN) break
      if (rows[cursor].kind === 'context' && rows[cursor].text === LOCKED_FENCE_CLOSE) {
        rows[index].wrapper = true
        rows[cursor].wrapper = true
        index = cursor
        break
      }
    }
  }
}

/** Strip the inline Markdown a heading may carry, so the label reads as prose. */
function plainHeading(text: string): string {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** For every row, the nearest heading at or above it in the edited document. */
function headingTrail(rows: ContributionDiffRow[]): Array<string | null> {
  const trail: Array<string | null> = []
  let current: string | null = null
  for (const row of rows) {
    const match = row.kind === 'deletion' ? null : row.text.match(ATX_HEADING)
    if (match) current = plainHeading(match[2]) || null
    trail.push(current)
  }
  return trail
}

function hunkFrom(rows: ContributionDiffRow[], heading: string | null): ContributionDiffHunk {
  const oldLines = rows.flatMap((row) => (row.oldLine === null ? [] : [row.oldLine]))
  const newLines = rows.flatMap((row) => (row.newLine === null ? [] : [row.newLine]))
  return {
    oldStart: oldLines[0] ?? 0,
    oldCount: oldLines.length,
    newStart: newLines[0] ?? 0,
    newCount: newLines.length,
    heading,
    rows
  }
}

function compactHunks(rows: ContributionDiffRow[], contextLines: number): ContributionDiffHunk[] {
  const changed = rows.flatMap((row, index) => (row.kind === 'context' ? [] : [index]))
  if (changed.length === 0) return []

  const windows: Array<{ start: number; end: number }> = []
  for (const index of changed) {
    const start = Math.max(0, index - contextLines)
    const end = Math.min(rows.length, index + contextLines + 1)
    const previous = windows.at(-1)
    if (previous && start <= previous.end) previous.end = Math.max(previous.end, end)
    else windows.push({ start, end })
  }

  const trail = headingTrail(rows)
  return windows.map(({ start, end }) => {
    const hunkRows = rows.slice(start, end)
    const firstChangedOffset = hunkRows.findIndex((row) => row.kind !== 'context')
    const rowBeforeChange = start + firstChangedOffset - 1
    // Resolve from the change, not from the context window: that window often
    // opens above the nearby heading. Looking one row back also means a heading
    // that is itself added or replaced does not misleadingly name its own hunk.
    const heading = rowBeforeChange >= 0 ? trail[rowBeforeChange] : null
    return hunkFrom(hunkRows, heading)
  })
}

const EMPTY_REVIEW: ContributionReview = {
  status: 'unchanged',
  additions: 0,
  deletions: 0,
  hunks: []
}

const TOO_LARGE_REVIEW: ContributionReview = {
  status: 'too-large',
  additions: 0,
  deletions: 0,
  hunks: []
}

/**
 * Compare the normalized strings already used for dirty tracking and submit.
 * The result contains only changed regions plus a small amount of context.
 */
export function buildContributionReview(
  beforeMarkdown: string,
  afterMarkdown: string,
  options: ContributionDiffOptions = {}
): ContributionReview {
  if (beforeMarkdown === afterMarkdown) return { ...EMPTY_REVIEW }

  const contextLines = integerOption(options.contextLines, DEFAULT_CONTEXT_LINES)
  const maxChangedLines = integerOption(
    options.maxChangedLines,
    DEFAULT_MAX_CHANGED_LINES
  )
  const maxLines = integerOption(options.maxLines, DEFAULT_MAX_LINES)
  const maxWork = integerOption(options.maxWork, DEFAULT_MAX_WORK)
  const before = linesOf(beforeMarkdown)
  const after = linesOf(afterMarkdown)
  if (before.length > maxLines || after.length > maxLines) return { ...TOO_LARGE_REVIEW }

  let prefixLength = 0
  while (
    prefixLength < before.length &&
    prefixLength < after.length &&
    before[prefixLength] === after[prefixLength]
  ) {
    prefixLength += 1
  }

  let suffixLength = 0
  while (
    suffixLength < before.length - prefixLength &&
    suffixLength < after.length - prefixLength &&
    before[before.length - suffixLength - 1] === after[after.length - suffixLength - 1]
  ) {
    suffixLength += 1
  }

  const middle = diffMiddle(
    before.slice(prefixLength, before.length - suffixLength),
    after.slice(prefixLength, after.length - suffixLength),
    maxWork,
    maxChangedLines
  )
  if (!middle) return { ...TOO_LARGE_REVIEW }

  const rawRows: RawDiffRow[] = [
    ...before.slice(0, prefixLength).map((text) => ({ kind: 'equal' as const, text })),
    ...middle,
    ...before
      .slice(before.length - suffixLength)
      .map((text) => ({ kind: 'equal' as const, text }))
  ]
  const rows = numberedRows(rawRows)
  markWordChanges(rows)
  markLockedFences(rows)
  const additions = rows.filter((row) => row.kind === 'addition').length
  const deletions = rows.filter((row) => row.kind === 'deletion').length

  return {
    status: additions || deletions ? 'ready' : 'unchanged',
    additions,
    deletions,
    hunks: compactHunks(rows, contextLines)
  }
}
