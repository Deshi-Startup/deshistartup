const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯'
const ENGLISH_CONTENT_PATH = /\/app\/\(contents\)\/en\//

const hasProperty = (node, property) =>
  Boolean(node?.properties && Object.prototype.hasOwnProperty.call(node.properties, property))

const addClass = (node, className) => {
  if (!node?.properties) node.properties = {}
  const classes = Array.isArray(node.properties.className)
    ? node.properties.className
    : node.properties.className
      ? [node.properties.className]
      : []
  if (!classes.includes(className)) classes.push(className)
  node.properties.className = classes
}

const bengaliDigits = (value) =>
  String(value).replace(/\d/g, (digit) => BENGALI_DIGITS[Number(digit)])

const transformText = (node, transform) => {
  if (node?.type === 'text') {
    node.value = transform(node.value)
    return
  }
  for (const child of node?.children || []) transformText(child, transform)
}

const replaceText = (node, value) => {
  node.children = [{ type: 'text', value }]
}

const backlinkNumbers = (node) => {
  const label = String(node?.properties?.ariaLabel || '')
  const match = label.match(/(\d+)(?:-(\d+))?$/)
  return match ? { reference: match[1], occurrence: match[2] } : null
}

const backlinkLabel = (numbers, isEnglish) => {
  if (!numbers) return isEnglish ? 'Back to citation' : 'লেখায় সূত্রের উল্লেখে ফিরুন'

  const { reference, occurrence } = numbers
  if (isEnglish) {
    return occurrence
      ? `Back to citation ${reference}, occurrence ${occurrence}`
      : `Back to citation ${reference}`
  }

  const localizedReference = bengaliDigits(reference)
  return occurrence
    ? `লেখায় ${localizedReference} নম্বর সূত্রের ${bengaliDigits(occurrence)} নম্বর উল্লেখে ফিরুন`
    : `লেখায় ${localizedReference} নম্বর সূত্রের উল্লেখে ফিরুন`
}

export function transformFootnotes(tree, { isEnglish = false } = {}) {
  const visit = (node, parent, inFootnotes = false) => {
    if (!node || typeof node !== 'object') return

    const isFootnoteSection =
      node.type === 'element' &&
      node.tagName === 'section' &&
      hasProperty(node, 'dataFootnotes')
    const insideFootnotes = inFootnotes || isFootnoteSection

    if (isFootnoteSection) addClass(node, 'reference-notes')

    if (
      node.type === 'element' &&
      node.tagName === 'a' &&
      hasProperty(node, 'dataFootnoteRef')
    ) {
      addClass(node, 'cite-link')
      if (parent?.type === 'element' && parent.tagName === 'sup') {
        addClass(parent, 'cite-footnote')
      }
      if (!isEnglish) transformText(node, bengaliDigits)
    }

    if (
      node.type === 'element' &&
      node.tagName === 'a' &&
      hasProperty(node, 'dataFootnoteBackref')
    ) {
      addClass(node, 'reference-backlink')
      node.properties.ariaLabel = backlinkLabel(backlinkNumbers(node), isEnglish)
      if (!isEnglish) transformText(node, bengaliDigits)
    }

    if (insideFootnotes && node.type === 'element') {
      if (node.tagName === 'h2' && node.properties?.id === 'footnote-label') {
        // Every guide already has a visible Relevant Sources heading. Keep this
        // generated label for aria-describedby without announcing a duplicate
        // heading to screen-reader users.
        node.tagName = 'span'
        replaceText(node, isEnglish ? 'References' : 'সূত্র')
      } else if (node.tagName === 'ol') {
        addClass(node, 'reference-list')
      } else if (node.tagName === 'li') {
        addClass(node, 'reference-item')
      }
    }

    for (const child of node.children || []) visit(child, node, insideFootnotes)
  }

  visit(tree, null, false)
  return tree
}

export default function rehypeFootnotes() {
  return (tree, file) => {
    const normalizedPath = String(file?.path || '').replaceAll('\\', '/')
    transformFootnotes(tree, { isEnglish: ENGLISH_CONTENT_PATH.test(normalizedPath) })
  }
}
