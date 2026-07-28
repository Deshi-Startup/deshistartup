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
