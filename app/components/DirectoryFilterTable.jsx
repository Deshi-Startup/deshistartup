'use client'

import { useMemo, useState } from 'react'

const LABELS = {
  bn: {
    name: 'নাম',
    type: 'ধরন',
    stage: 'স্টেজ',
    sectors: 'খাত',
    chequeSize: 'চেক সাইজ',
    benefits: 'সহায়তা',
    applicationPath: 'আবেদন/যোগাযোগ',
    source: 'সূত্র',
    notStated: 'প্রকাশ্যে বলা নেই',
    verified: 'যাচাই',
    search: 'খুঁজুন',
    searchPlaceholder: 'নাম, খাত, স্টেজ বা নোট',
    typeFilter: 'ধরন',
    stageFilter: 'স্টেজ',
    sectorFilter: 'খাত',
    allTypes: 'সব ধরন',
    allStages: 'সব স্টেজ',
    allSectors: 'সব খাত',
    reset: 'রিসেট',
    showing: (shown, total) => `মোট ${shown} / ${total}টি এন্ট্রি দেখানো হচ্ছে।`,
    noResults: 'মিল পাওয়া যায়নি।'
  },
  en: {
    name: 'Name',
    type: 'Type',
    stage: 'Stage',
    sectors: 'Sectors',
    chequeSize: 'Cheque size',
    benefits: 'Benefits',
    applicationPath: 'Application/contact',
    source: 'Source',
    notStated: 'Not publicly stated',
    verified: 'Verified',
    search: 'Search',
    searchPlaceholder: 'Name, sector, stage or notes',
    typeFilter: 'Type',
    stageFilter: 'Stage',
    sectorFilter: 'Sector',
    allTypes: 'All types',
    allStages: 'All stages',
    allSectors: 'All sectors',
    reset: 'Reset',
    showing: (shown, total) => `Showing ${shown} of ${total} verified entries.`,
    noResults: 'No matching entries.'
  }
}

function asText(value, fallback) {
  if (Array.isArray(value)) return value.length ? value.join(', ') : fallback
  return value || fallback
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return value ? [value] : []
}

function uniqueSorted(rows, field) {
  return Array.from(new Set(rows.flatMap((row) => asArray(row[field])))).sort((a, b) => a.localeCompare(b))
}

function searchableText(row, isAccelerators) {
  return [
    row.name,
    row.type,
    row.stage,
    row.sectors,
    isAccelerators ? row.benefits : row.chequeSize,
    row.applicationPath,
    row.notes
  ]
    .flatMap(asArray)
    .join(' ')
    .toLocaleLowerCase()
}

export default function DirectoryFilterTable({ category, locale, rows }) {
  const isEn = locale === 'en'
  const labels = isEn ? LABELS.en : LABELS.bn
  const fallback = labels.notStated
  const isAccelerators = category === 'accelerators'
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [stage, setStage] = useState('')
  const [sector, setSector] = useState('')

  const types = useMemo(() => uniqueSorted(rows, 'type'), [rows])
  const stages = useMemo(() => uniqueSorted(rows, 'stage'), [rows])
  const sectors = useMemo(() => uniqueSorted(rows, 'sectors'), [rows])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()

    return rows.filter((row) => {
      const matchesQuery = !normalizedQuery || searchableText(row, isAccelerators).includes(normalizedQuery)
      const matchesType = !type || asArray(row.type).includes(type)
      const matchesStage = !stage || asArray(row.stage).includes(stage)
      const matchesSector = !sector || asArray(row.sectors).includes(sector)

      return matchesQuery && matchesType && matchesStage && matchesSector
    })
  }, [isAccelerators, query, rows, sector, stage, type])

  const resetFilters = () => {
    setQuery('')
    setType('')
    setStage('')
    setSector('')
  }

  return (
    <div className="directory-list">
      <div className="directory-controls" role="search">
        <label className="directory-search">
          <span>{labels.search}</span>
          <input
            type="search"
            value={query}
            placeholder={labels.searchPlaceholder}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          <span>{labels.typeFilter}</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="">{labels.allTypes}</option>
            {types.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          <span>{labels.stageFilter}</span>
          <select value={stage} onChange={(event) => setStage(event.target.value)}>
            <option value="">{labels.allStages}</option>
            {stages.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          <span>{labels.sectorFilter}</span>
          <select value={sector} onChange={(event) => setSector(event.target.value)}>
            <option value="">{labels.allSectors}</option>
            {sectors.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={resetFilters}>{labels.reset}</button>
      </div>

      <div className="directory-list__summary" aria-live="polite">
        {labels.showing(filteredRows.length, rows.length)}
      </div>
      <div className="directory-table-wrap">
        {filteredRows.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>{labels.name}</th>
                <th>{labels.type}</th>
                <th>{labels.stage}</th>
                <th>{labels.sectors}</th>
                <th>{isAccelerators ? labels.benefits : labels.chequeSize}</th>
                <th>{labels.applicationPath}</th>
                <th>{labels.source}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.name}>
                  <td>
                    <strong>{row.name}</strong>
                    <span>{row.notes}</span>
                  </td>
                  <td>{asText(row.type, fallback)}</td>
                  <td>{asText(row.stage, fallback)}</td>
                  <td>{asText(row.sectors, fallback)}</td>
                  <td>{asText(isAccelerators ? row.benefits : row.chequeSize, fallback)}</td>
                  <td>{asText(row.applicationPath, fallback)}</td>
                  <td>
                    <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer">
                      {labels.source}
                    </a>
                    <span>
                      {labels.verified}: {row.lastVerified}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="directory-empty">{labels.noResults}</p>
        )}
      </div>
    </div>
  )
}
