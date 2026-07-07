import investors from '../../data/directory/investors.json'
import accelerators from '../../data/directory/accelerators.json'
import DirectoryFilterTable from './DirectoryFilterTable'

const DATA = {
  investors,
  accelerators
}

export default function DirectoryList({ category = 'investors', locale = 'bn' }) {
  const rows = DATA[category]
  if (!rows) {
    throw new Error(`Unknown directory category: ${category}`)
  }

  return <DirectoryFilterTable category={category} locale={locale} rows={rows} />
}
