import React from 'react'
import investors from '../../data/directory/investors.json'
import accelerators from '../../data/directory/accelerators.json'
import governmentFunding from '../../data/directory/government-funding.json'
import paymentGateways from '../../data/directory/payment-gateways.json'
import couriers from '../../data/directory/couriers.json'
import legalAccounting from '../../data/directory/legal-accounting.json'
import governmentServices from '../../data/directory/government-services.json'
import coworking from '../../data/directory/coworking.json'
import { localizeDirectory, type DirectoryEntry } from '../lib/directory'
import DirectoryFilterTable, { DirectoryCategory } from './DirectoryFilterTable'

const DATA: Record<DirectoryCategory, DirectoryEntry[]> = {
  investors: investors as unknown as DirectoryEntry[],
  accelerators: accelerators as unknown as DirectoryEntry[],
  'government-funding': governmentFunding as unknown as DirectoryEntry[],
  'payment-gateways': paymentGateways as unknown as DirectoryEntry[],
  couriers: couriers as unknown as DirectoryEntry[],
  'legal-accounting': legalAccounting as unknown as DirectoryEntry[],
  'government-services': governmentServices as unknown as DirectoryEntry[],
  coworking: coworking as unknown as DirectoryEntry[]
}

interface DirectoryListProps {
  category?: DirectoryCategory
  locale?: 'bn' | 'en'
}

export default function DirectoryList({ category = 'investors', locale = 'bn' }: DirectoryListProps) {
  const entries = DATA[category]
  if (!entries) {
    throw new Error(`Unknown directory category: ${category}`)
  }

  return <DirectoryFilterTable key={`${category}-${locale}`} category={category} locale={locale} rows={localizeDirectory(entries, locale)} />
}
