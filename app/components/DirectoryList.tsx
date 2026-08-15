import React from 'react'
import investors from '../../data/directory/investors.json'
import investorsBn from '../../data/directory/investors.bn.json'
import accelerators from '../../data/directory/accelerators.json'
import acceleratorsBn from '../../data/directory/accelerators.bn.json'
import governmentFunding from '../../data/directory/government-funding.json'
import governmentFundingBn from '../../data/directory/government-funding.bn.json'
import paymentGateways from '../../data/directory/payment-gateways.json'
import paymentGatewaysBn from '../../data/directory/payment-gateways.bn.json'
import couriers from '../../data/directory/couriers.json'
import couriersBn from '../../data/directory/couriers.bn.json'
import legalAccounting from '../../data/directory/legal-accounting.json'
import legalAccountingBn from '../../data/directory/legal-accounting.bn.json'
import governmentServices from '../../data/directory/government-services.json'
import governmentServicesBn from '../../data/directory/government-services.bn.json'
import coworking from '../../data/directory/coworking.json'
import coworkingBn from '../../data/directory/coworking.bn.json'
import DirectoryFilterTable, { DirectoryCategory, DirectoryRow } from './DirectoryFilterTable'

const DATA_EN: Record<DirectoryCategory, DirectoryRow[]> = {
  investors: investors as unknown as DirectoryRow[],
  accelerators: accelerators as unknown as DirectoryRow[],
  'government-funding': governmentFunding as unknown as DirectoryRow[],
  'payment-gateways': paymentGateways as unknown as DirectoryRow[],
  couriers: couriers as unknown as DirectoryRow[],
  'legal-accounting': legalAccounting as unknown as DirectoryRow[],
  'government-services': governmentServices as unknown as DirectoryRow[],
  coworking: coworking as unknown as DirectoryRow[]
}

const DATA_BN: Record<DirectoryCategory, DirectoryRow[]> = {
  investors: investorsBn as unknown as DirectoryRow[],
  accelerators: acceleratorsBn as unknown as DirectoryRow[],
  'government-funding': governmentFundingBn as unknown as DirectoryRow[],
  'payment-gateways': paymentGatewaysBn as unknown as DirectoryRow[],
  couriers: couriersBn as unknown as DirectoryRow[],
  'legal-accounting': legalAccountingBn as unknown as DirectoryRow[],
  'government-services': governmentServicesBn as unknown as DirectoryRow[],
  coworking: coworkingBn as unknown as DirectoryRow[]
}

interface DirectoryListProps {
  category?: DirectoryCategory
  locale?: 'bn' | 'en'
}

export default function DirectoryList({ category = 'investors', locale = 'bn' }: DirectoryListProps) {
  const rows = locale === 'en' ? DATA_EN[category] : DATA_BN[category]
  if (!rows) {
    throw new Error(`Unknown directory category: ${category}`)
  }

  return <DirectoryFilterTable category={category} locale={locale} rows={rows} />
}
