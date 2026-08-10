'use client'

import React, { useMemo, useState } from 'react'

const bengaliDigits = (value: number | string) => String(value).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])

function formatBanglaDate(value: string | null | undefined) {
  if (!value) return value
  try {
    return new Date(`${value}T00:00:00Z`).toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    })
  } catch {
    return bengaliDigits(value)
  }
}

export type DirectoryCategory =
  | 'investors'
  | 'accelerators'
  | 'government-funding'
  | 'payment-gateways'
  | 'couriers'
  | 'legal-accounting'
  | 'government-services'
  | 'coworking'

interface LocalText {
  bn: string
  en: string
}

interface ColumnDef {
  key: string
  label: LocalText
}

interface FilterDef {
  key: string
  label: LocalText
  allLabel: LocalText
}

interface CategoryConfig {
  columns: ColumnDef[]
  filters: FilterDef[]
  searchPlaceholder: LocalText
}

const applicationPathColumn: ColumnDef = {
  key: 'applicationPath',
  label: { bn: 'আবেদন/যোগাযোগ', en: 'Application/contact' }
}

const typeColumn: ColumnDef = { key: 'type', label: { bn: 'ধরন', en: 'Type' } }
const stageColumn: ColumnDef = { key: 'stage', label: { bn: 'স্টেজ', en: 'Stage' } }
const sectorsColumn: ColumnDef = { key: 'sectors', label: { bn: 'খাত', en: 'Sectors' } }

const typeFilter: FilterDef = {
  key: 'type',
  label: { bn: 'ধরন', en: 'Type' },
  allLabel: { bn: 'সব ধরন', en: 'All types' }
}
const stageFilter: FilterDef = {
  key: 'stage',
  label: { bn: 'স্টেজ', en: 'Stage' },
  allLabel: { bn: 'সব স্টেজ', en: 'All stages' }
}
const sectorsFilter: FilterDef = {
  key: 'sectors',
  label: { bn: 'খাত', en: 'Sector' },
  allLabel: { bn: 'সব খাত', en: 'All sectors' }
}

const CATEGORY_CONFIG: Record<DirectoryCategory, CategoryConfig> = {
  investors: {
    columns: [
      typeColumn,
      stageColumn,
      sectorsColumn,
      { key: 'chequeSize', label: { bn: 'চেক সাইজ', en: 'Cheque size' } },
      applicationPathColumn
    ],
    filters: [typeFilter, stageFilter, sectorsFilter],
    searchPlaceholder: { bn: 'নাম, খাত, স্টেজ বা নোট', en: 'Name, sector, stage or notes' }
  },
  accelerators: {
    columns: [
      typeColumn,
      stageColumn,
      sectorsColumn,
      { key: 'benefits', label: { bn: 'সুবিধা', en: 'Benefits' } },
      applicationPathColumn
    ],
    filters: [typeFilter, stageFilter, sectorsFilter],
    searchPlaceholder: { bn: 'নাম, খাত, স্টেজ বা নোট', en: 'Name, sector, stage or notes' }
  },
  'government-funding': {
    columns: [
      typeColumn,
      { key: 'eligibility', label: { bn: 'যোগ্যতা', en: 'Eligibility' } },
      { key: 'amount', label: { bn: 'অর্থের পরিমাণ', en: 'Amount' } },
      stageColumn,
      { key: 'deadline', label: { bn: 'ডেডলাইন', en: 'Deadline' } },
      applicationPathColumn
    ],
    filters: [typeFilter, stageFilter],
    searchPlaceholder: { bn: 'নাম, স্টেজ বা নোট', en: 'Name, stage or notes' }
  },
  'payment-gateways': {
    columns: [
      typeColumn,
      { key: 'fees', label: { bn: 'ফি', en: 'Fees' } },
      { key: 'settlement', label: { bn: 'সেটেলমেন্ট', en: 'Settlement' } },
      { key: 'supportedMethods', label: { bn: 'মাধ্যম', en: 'Methods' } },
      { key: 'requiredDocs', label: { bn: 'যেসব কাগজ লাগে', en: 'Documents needed' } },
      applicationPathColumn
    ],
    filters: [
      typeFilter,
      {
        key: 'supportedMethods',
        label: { bn: 'মাধ্যম', en: 'Method' },
        allLabel: { bn: 'সব মাধ্যম', en: 'All methods' }
      }
    ],
    searchPlaceholder: { bn: 'নাম, মাধ্যম বা নোট', en: 'Name, method or notes' }
  },
  couriers: {
    columns: [
      typeColumn,
      { key: 'coverage', label: { bn: 'কভারেজ', en: 'Coverage' } },
      { key: 'codSupport', label: { bn: 'COD', en: 'COD' } },
      { key: 'pricing', label: { bn: 'ভাড়া', en: 'Pricing' } },
      { key: 'returnHandling', label: { bn: 'ফেরত', en: 'Returns' } },
      { key: 'api', label: { bn: 'API', en: 'API' } },
      applicationPathColumn
    ],
    filters: [typeFilter],
    searchPlaceholder: { bn: 'নাম, এলাকা বা নোট', en: 'Name, area or notes' }
  },
  'legal-accounting': {
    columns: [
      typeColumn,
      { key: 'services', label: { bn: 'সেবা', en: 'Services' } },
      { key: 'specialty', label: { bn: 'বিশেষত্ব', en: 'Specialty' } },
      { key: 'languages', label: { bn: 'ভাষা', en: 'Languages' } },
      { key: 'priceModel', label: { bn: 'ফি মডেল', en: 'Price model' } },
      applicationPathColumn
    ],
    filters: [typeFilter],
    searchPlaceholder: { bn: 'নাম, সেবা বা নোট', en: 'Name, service or notes' }
  },
  'government-services': {
    columns: [
      typeColumn,
      { key: 'service', label: { bn: 'সেবা', en: 'Service' } },
      { key: 'process', label: { bn: 'প্রক্রিয়া', en: 'Process' } },
      { key: 'ministry', label: { bn: 'মন্ত্রণালয়/বিভাগ', en: 'Ministry/division' } },
      applicationPathColumn
    ],
    filters: [
      typeFilter,
      {
        key: 'ministry',
        label: { bn: 'মন্ত্রণালয়/বিভাগ', en: 'Ministry/division' },
        allLabel: { bn: 'সব মন্ত্রণালয়', en: 'All ministries' }
      }
    ],
    searchPlaceholder: { bn: 'নাম, সেবা বা নোট', en: 'Name, service or notes' }
  },
  coworking: {
    columns: [
      typeColumn,
      { key: 'locations', label: { bn: 'এলাকা', en: 'Locations' } },
      { key: 'priceRange', label: { bn: 'খরচ', en: 'Pricing' } },
      { key: 'facilities', label: { bn: 'সুবিধা', en: 'Facilities' } },
      { key: 'hours', label: { bn: 'সময়', en: 'Hours' } },
      applicationPathColumn
    ],
    filters: [
      typeFilter,
      {
        key: 'city',
        label: { bn: 'শহর', en: 'City' },
        allLabel: { bn: 'সব শহর', en: 'All cities' }
      }
    ],
    searchPlaceholder: { bn: 'নাম, এলাকা বা নোট', en: 'Name, area or notes' }
  }
}

interface Labels {
  name: string
  source: string
  notStated: string
  verified: string
  search: string
  reset: string
  showing: (shown: string, total: string) => string
  noResults: string
}

const LABELS: Record<'bn' | 'en', Labels> = {
  bn: {
    name: 'নাম',
    source: 'সূত্র',
    notStated: 'প্রকাশ্যে বলা নেই',
    verified: 'যাচাই',
    search: 'খুঁজুন',
    reset: 'রিসেট',
    showing: (shown, total) => `মোট ${shown}/${total}টি এন্ট্রি দেখানো হচ্ছে।`,
    noResults: 'মিল পাওয়া যায়নি।'
  },
  en: {
    name: 'Name',
    source: 'Source',
    notStated: 'Not publicly stated',
    verified: 'Verified',
    search: 'Search',
    reset: 'Reset',
    showing: (shown, total) => `Showing ${shown} of ${total} verified entries.`,
    noResults: 'No matching entries.'
  }
}

function asText(value: string | string[] | null | undefined, fallback: string): string {
  if (Array.isArray(value)) return value.length ? value.join(', ') : fallback
  return value || fallback
}

function asArray(value: string | string[] | null | undefined): string[] {
  if (Array.isArray(value)) return value.filter((x): x is string => !!x)
  return value ? [value] : []
}

export interface DirectoryRow {
  name: string
  sourceUrl?: string | null
  lastVerified?: string | null
  notes?: string
  [field: string]: string | string[] | null | undefined
}

function uniqueSorted(rows: DirectoryRow[], field: string): string[] {
  return Array.from(
    new Set(rows.flatMap((row) => asArray(row[field])))
  ).sort((a, b) => a.localeCompare(b))
}

function searchableText(row: DirectoryRow, columns: ColumnDef[]): string {
  return [row.name, ...columns.map((column) => row[column.key]), row.notes]
    .flatMap(asArray)
    .join(' ')
    .toLocaleLowerCase()
}

interface DirectoryFilterTableProps {
  category: DirectoryCategory
  locale: 'bn' | 'en'
  rows: DirectoryRow[]
}

export default function DirectoryFilterTable({ category, locale, rows }: DirectoryFilterTableProps) {
  const isEn = locale === 'en'
  const labels = isEn ? LABELS.en : LABELS.bn
  const config = CATEGORY_CONFIG[category]
  const fallback = labels.notStated
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const filterOptions = useMemo(
    () =>
      config.filters.map((filter) => ({
        filter,
        options: uniqueSorted(rows, filter.key)
      })),
    [config.filters, rows]
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()

    return rows.filter((row) => {
      const matchesQuery = !normalizedQuery || searchableText(row, config.columns).includes(normalizedQuery)
      const matchesFilters = config.filters.every(
        (filter) => !activeFilters[filter.key] || asArray(row[filter.key]).includes(activeFilters[filter.key])
      )

      return matchesQuery && matchesFilters
    })
  }, [activeFilters, config, query, rows])

  const resetFilters = () => {
    setQuery('')
    setActiveFilters({})
  }
  const shownCount = isEn ? String(filteredRows.length) : bengaliDigits(filteredRows.length)
  const totalCount = isEn ? String(rows.length) : bengaliDigits(rows.length)

  return (
    <div className="directory-list">
      <div className="directory-controls" role="search" data-filters={config.filters.length}>
        <label className="directory-search">
          <span>{labels.search}</span>
          <input
            type="search"
            value={query}
            placeholder={isEn ? config.searchPlaceholder.en : config.searchPlaceholder.bn}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {filterOptions.map(({ filter, options }) => (
          <label key={filter.key}>
            <span>{isEn ? filter.label.en : filter.label.bn}</span>
            <select
              value={activeFilters[filter.key] || ''}
              onChange={(event) =>
                setActiveFilters((current) => ({ ...current, [filter.key]: event.target.value }))
              }
            >
              <option value="">{isEn ? filter.allLabel.en : filter.allLabel.bn}</option>
              {options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        ))}
        <button type="button" onClick={resetFilters}>{labels.reset}</button>
      </div>

      <div className="directory-list__summary" aria-live="polite">
        {labels.showing(shownCount, totalCount)}
      </div>
      <div className="directory-results">
        {filteredRows.length > 0 ? (
          // Most values here are sentences, not tokens — a nine-column grid gave
          // every one of them a ~60px track and broke words mid-character. One
          // card per entry, with the fields as a labelled definition list, reads
          // at any width and takes a new field without squeezing the rest.
          <div className="directory-cards">
            {filteredRows.map((row, index) => (
              // Two entries can share a name, and directory data is edited by
              // hand: index keeps a collision from silently dropping a row.
              <article className="directory-card" key={`${row.name}-${index}`}>
                <h3>{row.name}</h3>
                {row.notes && <p className="directory-card__note">{row.notes}</p>}
                <dl>
                  {config.columns.map((column) => (
                    <div key={column.key}>
                      <dt>{isEn ? column.label.en : column.label.bn}</dt>
                      <dd>{asText(row[column.key], fallback)}</dd>
                    </div>
                  ))}
                </dl>
                <p className="directory-card__source">
                  {row.sourceUrl ? (
                    <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer">
                      {labels.source}
                    </a>
                  ) : (
                    labels.source
                  )}
                  <span>
                    {labels.verified}: {isEn ? row.lastVerified : formatBanglaDate(row.lastVerified)}
                  </span>
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="directory-empty">{labels.noResults}</p>
        )}
      </div>
    </div>
  )
}
