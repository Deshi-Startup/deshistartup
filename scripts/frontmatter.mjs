import { parse } from 'yaml'

// Use the same YAML parser as Nextra. Stripping quote delimiters by hand left
// escape sequences in JSON-LD and discovery indexes while Next decoded them.
export function parseFrontmatter(source, filePath = 'MDX page') {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) return {}
  const data = parse(match[1]) ?? {}
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${filePath}: frontmatter must be a YAML mapping`)
  }
  for (const field of ['title', 'seoTitle', 'description']) {
    if (Object.hasOwn(data, field) && (typeof data[field] !== 'string' || !data[field].trim())) {
      throw new Error(`${filePath}: ${field} must be a non-empty string`)
    }
  }
  return data
}
