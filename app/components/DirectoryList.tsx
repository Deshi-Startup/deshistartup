import React from 'react'
import investors from '../../data/directory/investors.json'
import accelerators from '../../data/directory/accelerators.json'
import DirectoryFilterTable, { DirectoryRow } from './DirectoryFilterTable'

const DATA: Record<string, DirectoryRow[]> = {
  investors: investors as unknown as DirectoryRow[],
  accelerators: accelerators as unknown as DirectoryRow[]
}

interface DirectoryListProps {
  category?: 'investors' | 'accelerators'
  locale?: 'bn' | 'en'
}

export default function DirectoryList({ category = 'investors', locale = 'bn' }: DirectoryListProps) {
  const rows = DATA[category]
  if (!rows) {
    throw new Error(`Unknown directory category: ${category}`)
  }

  return <DirectoryFilterTable category={category} locale={locale} rows={rows} />
}
