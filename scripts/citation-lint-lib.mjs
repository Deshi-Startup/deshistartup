import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

const parser = unified().use(remarkParse).use(remarkGfm)
const SAFE_IDENTIFIER = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const UNRESOLVED_REFERENCE = /\[\^([^\]\n]+)\]/g
const SOURCES_HEADING = /^##[ \t]+(?:প্রাসঙ্গিক সোর্স|Relevant Sources)[ \t]*$/
const MANUAL_LIST_ITEM = /^(?:[-+*]|\d+[.)])[ \t]+/

const lineOf = (node) => node?.position?.start?.line || 1

export function inspectCitations(source, file = '<content>') {
  const tree = parser.parse(source)
  const definitions = new Map()
  const references = new Map()
  const unresolved = []

  const push = (collection, identifier, node) => {
    const nodes = collection.get(identifier) || []
    nodes.push(node)
    collection.set(identifier, nodes)
  }

  const visit = (node) => {
    if (!node || typeof node !== 'object') return

    if (node.type === 'footnoteDefinition') {
      push(definitions, node.identifier, node)
    } else if (node.type === 'footnoteReference') {
      push(references, node.identifier, node)
    } else if (node.type === 'text') {
      for (const match of node.value.matchAll(UNRESOLVED_REFERENCE)) {
        unresolved.push({ identifier: match[1], node })
      }
    }

    for (const child of node.children || []) visit(child)
  }

  visit(tree)

  const errors = []

  if (!/<StubNotice\b/.test(source)) {
    const lines = source.split(/\r?\n/)
    let insideSources = false

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]
      if (SOURCES_HEADING.test(line)) {
        insideSources = true
        continue
      }
      if (insideSources && /^##[ \t]+/.test(line)) {
        insideSources = false
      }
      if (insideSources && MANUAL_LIST_ITEM.test(line)) {
        errors.push(
          `${file}:${index + 1} completed guides must use inline GFM footnotes instead of a manual list under Relevant Sources`
        )
        insideSources = false
      }
    }
  }

  if (
    definitions.size > 0 &&
    !new RegExp(SOURCES_HEADING.source, 'm').test(source)
  ) {
    errors.push(`${file}: cited pages must include a ## প্রাসঙ্গিক সোর্স or ## Relevant Sources heading`)
  }

  for (const { identifier, node } of unresolved) {
    errors.push(`${file}:${lineOf(node)} unresolved citation [^${identifier}]`)
  }

  for (const [identifier, nodes] of definitions) {
    const authoredIdentifier = nodes[0].label || identifier
    if (!SAFE_IDENTIFIER.test(authoredIdentifier)) {
      errors.push(
        `${file}:${lineOf(nodes[0])} citation identifier "${authoredIdentifier}" must use lowercase ASCII words separated by hyphens`
      )
    }
    if (nodes.length > 1) {
      errors.push(
        `${file}:${lineOf(nodes[1])} citation [^${identifier}] has ${nodes.length} definitions`
      )
    }
    if (!references.has(identifier)) {
      errors.push(`${file}:${lineOf(nodes[0])} citation [^${identifier}] is defined but never used`)
    }
  }

  for (const [identifier, nodes] of references) {
    const authoredIdentifier = nodes[0].label || identifier
    if (!SAFE_IDENTIFIER.test(authoredIdentifier)) {
      errors.push(
        `${file}:${lineOf(nodes[0])} citation identifier "${authoredIdentifier}" must use lowercase ASCII words separated by hyphens`
      )
    }
  }

  return {
    errors,
    definitionCount: definitions.size,
    referenceCount: [...references.values()].reduce((total, nodes) => total + nodes.length, 0),
    referenceCounts: Object.fromEntries(
      [...references.entries()]
        .map(([identifier, nodes]) => [identifier, nodes.length])
        .sort(([left], [right]) => left.localeCompare(right))
    )
  }
}
