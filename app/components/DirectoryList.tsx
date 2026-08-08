import React from 'react'
import investors from '../../data/directory/investors.json'
import accelerators from '../../data/directory/accelerators.json'
import governmentFunding from '../../data/directory/government-funding.json'
import paymentGateways from '../../data/directory/payment-gateways.json'
import couriers from '../../data/directory/couriers.json'
import legalAccounting from '../../data/directory/legal-accounting.json'
import governmentServices from '../../data/directory/government-services.json'
import DirectoryFilterTable, { DirectoryCategory, DirectoryRow } from './DirectoryFilterTable'

const DATA: Record<DirectoryCategory, DirectoryRow[]> = {
  investors: investors as unknown as DirectoryRow[],
  accelerators: accelerators as unknown as DirectoryRow[],
  'government-funding': governmentFunding as unknown as DirectoryRow[],
  'payment-gateways': paymentGateways as unknown as DirectoryRow[],
  couriers: couriers as unknown as DirectoryRow[],
  'legal-accounting': legalAccounting as unknown as DirectoryRow[],
  'government-services': governmentServices as unknown as DirectoryRow[]
}

interface DirectoryListProps {
  category?: DirectoryCategory
  locale?: 'bn' | 'en'
}

export default function DirectoryList({ category = 'investors', locale = 'bn' }: DirectoryListProps) {
  const rows = DATA[category]
  if (!rows) {
    throw new Error(`Unknown directory category: ${category}`)
  }

  return <DirectoryFilterTable category={category} locale={locale} rows={rows} />
}
