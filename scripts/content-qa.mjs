import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const checkAll = args.includes('--all')
const checkChanged = args.includes('--changed') || !checkAll
const warnOnly = args.includes('--warn-only')
const baseIndex = args.indexOf('--base')
const baseRef = baseIndex >= 0 ? args[baseIndex + 1] : 'origin/main'
const maxMessages = 120

const contentRoot = 'app/(contents)'
const englishHighRiskPattern = /\b(?:legal|law|tax|vat|bin|tin|rjsc|labo[u]?r|employment|employee|fintech|healthtech|privacy|imports?|exports?|compliance|regulat\w*|licen[cs]es?|payments?|banks?)\b/i
const banglaHighRiskPattern = /(?:নিবন্ধন|কর|ভ্যাট|আইন|লাইসেন্স|পেমেন্ট|ব্যাংক|আমদানি|রপ্তানি)/
const sourceHeadingPattern = /^##\s*(?:প্রাসঙ্গিক সূত্র|Relevant Sources|Sources|সূত্র)\s*$/im
const markdownLinkPattern = /\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/g
const reputableDomainPattern = /(?:^|\.)((gov\.bd)|(org\.bd)|(edu\.bd)|(nbr\.gov\.bd)|(rjsc\.gov\.bd)|(bb\.org\.bd)|(bida\.gov\.bd)|(ossbida\.gov\.bd)|(laws\.gov\.bd)|(bangladeshtradeportal\.gov\.bd)|(epb\.gov\.bd)|(btrc\.gov\.bd)|(basis\.org\.bd)|(e-cab\.net)|(startupbangladesh\.vc)|(worldbank\.org)|(unctad\.org)|(imf\.org)|(adb\.org)|(datareportal\.com))$/i

function runGit(argsToRun) {
  try {
    return execFileSync('git', argsToRun, { encoding: 'utf8' })
  } catch {
    return ''
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function listAllMdxFiles(dir) {
  if (!existsSync(dir)) return []

  return readdirSync(dir).flatMap((entry) => {
    const fullPath = path.join(dir, entry)
    const stats = statSync(fullPath)

    if (stats.isDirectory()) return listAllMdxFiles(fullPath)
    return fullPath.endsWith('.mdx') ? [fullPath] : []
  })
}

function listChangedMdxFiles() {
  const changedAgainstBase = runGit(['diff', '--name-only', '--diff-filter=ACMR', `${baseRef}...HEAD`])
  const unstaged = runGit(['diff', '--name-only', '--diff-filter=ACMR'])
  const staged = runGit(['diff', '--cached', '--name-only', '--diff-filter=ACMR'])
  const untracked = runGit(['ls-files', '--others', '--exclude-standard'])

  return unique(`${changedAgainstBase}\n${unstaged}\n${staged}\n${untracked}`.split('\n'))
    .filter((file) => file.startsWith(contentRoot) && file.endsWith('.mdx') && existsSync(file))
}

function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) {
    return { data: {}, body: text }
  }

  const end = text.indexOf('\n---', 4)
  if (end === -1) {
    return { data: {}, body: text }
  }

  const rawFrontmatter = text.slice(4, end)
  const body = text.slice(end + 4)
  const data = {}

  for (const line of rawFrontmatter.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!match) continue

    const [, key, rawValue] = match
    data[key] = rawValue.trim().replace(/^["']|["']$/g, '')
  }

  return { data, body }
}

function collectLinks(text) {
  return [...text.matchAll(markdownLinkPattern)].map((match) => match[1])
}

function hasReputableDeepSource(text) {
  return collectLinks(text).some((href) => {
    try {
      const url = new URL(href)
      const host = url.hostname.replace(/^www\./, '')
      const hasDeepPath = url.pathname.replace(/\/+$/, '').length > 0 || url.search.length > 0

      return hasDeepPath && reputableDomainPattern.test(host)
    } catch {
      return false
    }
  })
}

function isHighRisk(file, metadata) {
  if (metadata.risk_level) return metadata.risk_level === 'high'
  return hasHighRiskTerms(file) || hasHighRiskTerms(`${metadata.title || ''} ${metadata.description || ''}`)
}

function hasHighRiskTerms(value) {
  return englishHighRiskPattern.test(value) || banglaHighRiskPattern.test(value)
}

function checkFile(file) {
  const text = readFileSync(file, 'utf8')
  const { data } = parseFrontmatter(text)
  const errors = []
  const warnings = []

  if (!data.title) {
    errors.push('missing frontmatter title')
  }

  if (!data.description) {
    errors.push('missing frontmatter description')
  }

  const highRisk = isHighRisk(file, data)

  if (highRisk) {
    if (data.risk_level !== 'high') {
      errors.push('high-risk page must declare risk_level: high')
    }

    if (!data.last_verified) {
      errors.push('high-risk page must include last_verified')
    }

    if (!sourceHeadingPattern.test(text)) {
      errors.push('high-risk page must include a sources section')
    }

    if (!hasReputableDeepSource(text)) {
      errors.push('high-risk page must include at least one deep official or reputable source link')
    }
  } else if (!data.risk_level) {
    warnings.push('risk_level is not set')
  } else if (data.risk_level !== 'high' && (hasHighRiskTerms(file) || hasHighRiskTerms(`${data.title || ''} ${data.description || ''}`))) {
    warnings.push('risk_level is not high, but high-risk terms were detected')
  }

  if (data.risk_level === 'medium' && !sourceHeadingPattern.test(text)) {
    warnings.push('medium-risk page should include a sources section')
  }

  return { file, errors, warnings }
}

const files = checkAll ? listAllMdxFiles(contentRoot) : checkChanged ? listChangedMdxFiles() : []
const results = files.map(checkFile)
const errors = results.flatMap((result) => result.errors.map((message) => ({ file: result.file, message })))
const warnings = results.flatMap((result) => result.warnings.map((message) => ({ file: result.file, message })))

if (files.length === 0) {
  console.log('Content QA: no MDX files to check.')
} else {
  console.log(`Content QA: checked ${files.length} MDX file${files.length === 1 ? '' : 's'}.`)
}

function printMessages(messages, prefix, printer) {
  const visible = messages.slice(0, maxMessages)

  for (const message of visible) {
    printer(`${prefix} ${message.file}: ${message.message}`)
  }

  if (messages.length > visible.length) {
    printer(`${prefix} ${messages.length - visible.length} additional messages hidden; rerun on a smaller file set for details.`)
  }
}

printMessages(warnings, 'WARN', console.warn)

if (warnOnly) {
  printMessages(errors, 'WARN', console.warn)
} else {
  printMessages(errors, 'ERROR', console.error)
}

if (errors.length > 0 && !warnOnly) {
  process.exit(1)
}
