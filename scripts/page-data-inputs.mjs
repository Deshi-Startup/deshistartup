// Data rendered inside otherwise unchanged MDX shells. Keep these dependencies
// explicit: a build, source report or unrelated data edit is not a page update.
const directories = ['investors', 'accelerators', 'government-funding',
  'payment-gateways', 'couriers', 'legal-accounting', 'government-services', 'coworking']

export const PAGE_DATA_INPUTS = {
  ...Object.fromEntries(directories.map((category) => [
    `directory/${category}`, [`data/directory/${category}.json`]
  ])),
  maps: [
    ...['regions', 'census', 'ict', 'economy', 'urban', 'industry', 'industrial-parks', 'ports', 'airports']
      .map((name) => `data/maps/${name}.json`),
    ...['bangladesh-2020.geojson', 'bangladesh-2020-division-detail.geojson',
      'bangladesh-2020-district-detail.geojson', 'transport.geojson', 'basemap.json']
      .map((name) => `public/maps/${name}`)
  ],
  'start-here/glossary': ['data/glossary.json'],
  'startup-50': ['data/startup-50.json', 'data/startup-50-sources.json', 'data/startup-50-logos.json'],
  'case-studies': ['data/case-study-covers.json', 'data/case-study-artwork.json', 'data/case-study-logos.json', 'data/startup-50-logos.json'],
  contributors: ['app/generated/contributors.json']
}

export const PAGE_DATA_PATHS = [...new Set(Object.values(PAGE_DATA_INPUTS).flat())]

export function datesForPage(gitDates, { repoPath, slug, verified = null }) {
  let modifiedAt = gitDates.modifiedAt.get(repoPath) || null
  for (const input of PAGE_DATA_INPUTS[slug] || []) {
    const timestamp = gitDates.modifiedAt.get(input)
    if (timestamp && (!modifiedAt || Date.parse(timestamp) > Date.parse(modifiedAt))) {
      modifiedAt = timestamp
    }
  }
  return {
    date: modifiedAt?.slice(0, 10) || verified,
    modifiedAt,
    // Authored data changes neither establish publication nor verify claims.
    published: gitDates.published.get(repoPath) || null,
    publishedAt: gitDates.publishedAt.get(repoPath) || null
  }
}
