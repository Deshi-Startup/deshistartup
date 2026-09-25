-- BIDA moved this announcement to its current Invest Bangladesh website.
UPDATE problems
SET sources_json = replace(
  sources_json,
  'https://www.bida.gov.bd/details/govt-approves-national-semiconductor-taskforce-headed-bida-latest-news',
  'https://investbangladesh.gov.bd/press-release/govt-approves-national-semiconductor-taskforce-headed-by-bida'
)
WHERE id = 'chip-verification-problem';
