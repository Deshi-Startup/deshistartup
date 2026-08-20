import assert from 'node:assert/strict'
import test from 'node:test'

import { contributorEventTarget } from './contributor-event-locale.mjs'

test('keeps a contributor target in the edition credited by its event', () => {
  assert.deepEqual(
    contributorEventTarget('/registration/structure-decision-tree', ['bn'], 'en'),
    { locale: 'bn', path: '/registration/structure-decision-tree' }
  )
  assert.deepEqual(
    contributorEventTarget('/funding/cap-table', ['bn', 'en'], 'en'),
    { locale: 'en', path: '/en/funding/cap-table' }
  )
})

test('defaults legacy events without a locale scope to both editions', () => {
  assert.deepEqual(
    contributorEventTarget('/funding/cap-table', undefined, 'en'),
    { locale: 'en', path: '/en/funding/cap-table' }
  )
})
