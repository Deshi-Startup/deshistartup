export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'meta'
  text: string
}

/**
 * Computes a line-by-line diff between two string arrays using a standard LCS algorithm.
 */
export function diffLines(oldLines: string[], newLines: string[]): DiffLine[] {
  const n = oldLines.length
  const m = newLines.length

  const dp: number[][] = Array(n + 1)
    .fill(0)
    .map(() => Array(m + 1).fill(0))

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const result: DiffLine[] = []
  let i = n
  let j = m

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({ type: 'unchanged', text: oldLines[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', text: newLines[j - 1] })
      j--
    } else {
      result.unshift({ type: 'removed', text: oldLines[i - 1] })
      i--
    }
  }
  return result
}

/**
 * Parses a standard Git unified diff string into DiffLine items.
 */
export function parseUnifiedDiff(diffText: string): DiffLine[] {
  if (!diffText) return []
  const lines = diffText.split('\n')
  const result: DiffLine[] = []

  for (const line of lines) {
    if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('diff --git') || line.startsWith('index ')) {
      continue // Skip file metadata headers
    }
    if (line.startsWith('@@')) {
      result.push({ type: 'meta', text: line })
    } else if (line.startsWith('+')) {
      result.push({ type: 'added', text: line.slice(1) })
    } else if (line.startsWith('-')) {
      result.push({ type: 'removed', text: line.slice(1) })
    } else if (line.startsWith(' ')) {
      result.push({ type: 'unchanged', text: line.slice(1) })
    } else {
      // Sometimes git returns trailing empty lines
      if (line.trim() === '' && result.length === 0) continue
      result.push({ type: 'unchanged', text: line })
    }
  }
  return result
}
