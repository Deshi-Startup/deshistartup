import investors from '../../data/directory/investors.json'
import accelerators from '../../data/directory/accelerators.json'

const DATA = {
  investors,
  accelerators
}

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
    verified: 'যাচাই'
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
    verified: 'Verified'
  }
}

function asText(value, fallback) {
  if (Array.isArray(value)) return value.length ? value.join(', ') : fallback
  return value || fallback
}

export default function DirectoryList({ category = 'investors', locale = 'bn' }) {
  const rows = DATA[category]
  if (!rows) {
    throw new Error(`Unknown directory category: ${category}`)
  }

  const isEn = locale === 'en'
  const labels = isEn ? LABELS.en : LABELS.bn
  const fallback = labels.notStated
  const isAccelerators = category === 'accelerators'

  return (
    <div className="directory-list" data-pagefind-ignore>
      <div className="directory-list__summary">
        {isEn
          ? `${rows.length} verified entries from structured JSON.`
          : `স্ট্রাকচার্ড JSON থেকে ${rows.length}টি যাচাইকৃত এন্ট্রি।`}
      </div>
      <div className="directory-table-wrap">
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
            {rows.map((row) => (
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
      </div>
    </div>
  )
}
