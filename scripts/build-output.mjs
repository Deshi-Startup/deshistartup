import fs from 'node:fs'
import path from 'node:path'

/**
 * Locate the prerendered HTML produced by either a static export or a legacy
 * Next server build. Production uses `out`; the fallback keeps the audit
 * scripts usable for downstream forks that have not adopted static export.
 */
export function resolveBuildOutput(root) {
  const override = process.env.DESHI_HTML_OUTPUT
    ? path.resolve(root, process.env.DESHI_HTML_OUTPUT)
    : null
  const candidates = [
    override,
    path.join(root, 'out'),
    path.join(root, '.next', 'standalone', '.next', 'server', 'app'),
    path.join(root, '.next', 'server', 'app')
  ].filter(Boolean)
  const htmlDir = candidates.find((candidate) => fs.existsSync(candidate))

  if (!htmlDir) {
    throw new Error(
      `No Next.js HTML output found. Checked: ${candidates
        .map((candidate) => path.relative(root, candidate))
        .join(', ')}`
    )
  }

  const staticExportDir = path.join(root, 'out')
  const isStaticExport = path.resolve(htmlDir) === path.resolve(staticExportDir)

  return {
    htmlDir,
    isStaticExport,
    staticDir: isStaticExport ? staticExportDir : path.join(root, 'public')
  }
}
