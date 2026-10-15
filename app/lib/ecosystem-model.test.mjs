import assert from 'node:assert/strict'
import test from 'node:test'
import { parseSourceLine, partitionSources, splitSizeNote } from './ecosystem-model.ts'

const card = (section) => ({
  title: 'Example',
  url: `https://example.com/${section || 'note'}`,
  date: '2026-10-15',
  en: 'English note.',
  bn: 'বাংলা নোট।',
  ...(section ? { section } : {})
})

test('ungrouped sources stay together and empty groups are omitted from the labelled lists', () => {
  const groups = partitionSources([card(), card('facts'), card('maps'), card('size')])
  assert.equal(groups.other.length, 1)
  assert.equal(groups.facts[0].url, 'https://example.com/facts')
  assert.equal(groups.maps[0].url, 'https://example.com/maps')
  assert.equal(groups.size[0].url, 'https://example.com/size')
})

test('older cards without section still render when no labelled groups exist', () => {
  const groups = partitionSources([card(), card()])
  assert.equal(groups.other.length, 2)
  assert.deepEqual(groups.facts, [])
  assert.deepEqual(groups.maps, [])
  assert.deepEqual(groups.size, [])
})

test('size notes split into big results, small metrics, then assumptions and linked sources', () => {
  const parsed = splitSizeNote(
    '$62.4 million\nWorking · 24 taka per kilogram of fabric offcuts\n\n$104 million\nCeiling · 40 taka per kilogram of factory local sale\n\nWhat went into it\n312,000 tonnes\ncutting-floor waste\n1,000 kilograms\nin each tonne\n120 taka\nper US dollar\n\nAssumptions\n- Mixed grade\n\nSources\n- SWITCH2CE citing Reverse Resources, 2023 https://switch2ce.org/news/bangladesh-textile-waste-sankey-diagram-2023'
  )
  assert.deepEqual(parsed.results, [
    { value: '$62.4 million', caption: 'Working · 24 taka per kilogram of fabric offcuts' },
    { value: '$104 million', caption: 'Ceiling · 40 taka per kilogram of factory local sale' }
  ])
  assert.deepEqual(parsed.factors, [
    { value: '312,000 tonnes', metric: 'cutting-floor waste' },
    { value: '1,000 kilograms', metric: 'in each tonne' },
    { value: '120 taka', metric: 'per US dollar' }
  ])
  assert.deepEqual(parsed.assumptions, ['Mixed grade'])
  assert.equal(parseSourceLine(parsed.sources[0]).label, 'SWITCH2CE citing Reverse Resources, 2023')
  assert.equal(parseSourceLine(parsed.sources[0]).url.startsWith('https://'), true)
  const bangla = splitSizeNote('৬ কোটি ২৪ লাখ ডলার\nকাজ চালানোর হিসাব\n\nহিসাবের অংশ\n৩,১২,০০০ টন\nকাটিং ফ্লোরের বর্জ্য\n\nঅনুমান\n- মিশ্র গ্রেড\n\nউৎস\n- বিবিএস ইয়ারবুক ২০২৪')
  assert.equal(bangla.results[0].value, '৬ কোটি ২৪ লাখ ডলার')
  assert.equal(bangla.factors[0].metric, 'কাটিং ফ্লোরের বর্জ্য')
  assert.deepEqual(bangla.assumptions, ['মিশ্র গ্রেড'])
  assert.equal(splitSizeNote('A paragraph with no split.'), null)
})
