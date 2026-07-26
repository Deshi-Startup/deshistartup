import fs from 'node:fs'
import path from 'node:path'

/**
 * Locate the prerendered HTML produced by either Next's server build or a
 * static export. OpenNext invokes the normal Next build first, so postbuild
 * validation must run before the `.open-next` bundle exists.
 */
export function resolveBuildOutput(root) {
  const override = process.env.DESHI_HTML_OUTPUT
    ? path.resolve(root, process.env.DESHI_HTML_OUTPUT)
    : null
  const candidates = [
    override,
    path.join(root, '.next', 'standalone', '.next', 'server', 'app'),
    path.join(root, '.next', 'server', 'app'),
    path.join(root, 'out')
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
