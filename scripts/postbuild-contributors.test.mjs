import assert from 'node:assert/strict'
import test from 'node:test'

import {
  eventsForLocale,
  fillPageByline,
  fillPageCredits
} from './postbuild-contributors.mjs'

test('locale-scoped events only claim work on the edition they changed', () => {
  const events = [
    { id: 'both' },
    { id: 'bangla-only', locales: ['bn'] }
  ]

  assert.deepEqual(eventsForLocale(events, 'bn').map((event) => event.id), ['both', 'bangla-only'])
  assert.deepEqual(eventsForLocale(events, 'en').map((event) => event.id), ['both'])
})

test('static contributor slots preserve JavaScript replacement tokens', () => {
  const content = "<a>A $& $1 $` $' $$</a>"

  assert.equal(
    fillPageByline('<div data-deshi-byline="true"></div><p>After</p>', content),
    `<div data-deshi-byline="true">${content}</div><p>After</p>`
  )
  assert.equal(
    fillPageCredits('<section data-deshi-credits="true"></section><footer>After</footer>', content),
    `<section data-deshi-credits="true">${content}</section><footer>After</footer>`
  )
})
