import assert from 'node:assert/strict'
import test from 'node:test'
import { clearDraft, loadDraft, pruneDrafts, saveDraft } from './contribution-draft.ts'

const DAY = 24 * 60 * 60 * 1000

/** Enough of the Storage interface for the module, including the index access
 *  pruneDrafts walks. */
function fakeStorage(throwOnWrite = false) {
  const map = new Map()
  return {
    get length() {
      return map.size
    },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      if (throwOnWrite) throw new Error('QuotaExceededError')
      map.set(k, v)
    },
    removeItem: (k) => map.delete(k),
    _map: map
  }
}

function withStorage(store, run) {
  const previous = globalThis.window
  globalThis.window = { localStorage: store }
  try {
    return run()
  } finally {
    globalThis.window = previous
  }
}

test('a saved draft comes back for the page it was saved on', () => {
  const store = fakeStorage()
  withStorage(store, () => {
    saveDraft('/registration', '# edited', 1000)
    assert.deepEqual(loadDraft('/registration', 2000), { body: '# edited', savedAt: 1000 })
    assert.equal(loadDraft('/tax', 2000), null)
  })
})

test('clearing a draft removes it', () => {
  const store = fakeStorage()
  withStorage(store, () => {
    saveDraft('/registration', '# edited', 1000)
    clearDraft('/registration')
    assert.equal(loadDraft('/registration', 2000), null)
  })
})

test('a draft older than a fortnight is not offered, and is swept up', () => {
  const store = fakeStorage()
  withStorage(store, () => {
    saveDraft('/registration', '# stale', 0)
    assert.equal(loadDraft('/registration', 15 * DAY), null)
    assert.equal(store.length, 0, 'the expired entry should be deleted, not merely hidden')
  })
})

test('pruning drops expired and unparseable drafts, and keeps live ones', () => {
  const store = fakeStorage()
  withStorage(store, () => {
    saveDraft('/fresh', '# keep', 13 * DAY)
    saveDraft('/stale', '# drop', 0)
    store.setItem('deshi_draft:/broken', 'not json')
    store.setItem('unrelated_key', 'left alone')

    pruneDrafts(15 * DAY)

    assert.equal(loadDraft('/fresh', 15 * DAY)?.body, '# keep')
    assert.equal(store.getItem('deshi_draft:/stale'), null)
    assert.equal(store.getItem('deshi_draft:/broken'), null)
    assert.equal(store.getItem('unrelated_key'), 'left alone')
  })
})

test('an empty or malformed draft is treated as no draft', () => {
  const store = fakeStorage()
  withStorage(store, () => {
    store.setItem('deshi_draft:/blank', JSON.stringify({ body: '   ', savedAt: 1000 }))
    assert.equal(loadDraft('/blank', 2000), null)

    store.setItem('deshi_draft:/undated', JSON.stringify({ body: '# text' }))
    assert.equal(loadDraft('/undated', 2000), null)
  })
})

test('storage that is absent or refuses writes never throws', () => {
  const previous = globalThis.window
  globalThis.window = undefined
  try {
    assert.doesNotThrow(() => saveDraft('/registration', '# edited'))
    assert.equal(loadDraft('/registration'), null)
    assert.doesNotThrow(() => clearDraft('/registration'))
    assert.doesNotThrow(() => pruneDrafts())
  } finally {
    globalThis.window = previous
  }

  withStorage(fakeStorage(true), () => {
    assert.doesNotThrow(() => saveDraft('/registration', '# edited'))
    assert.equal(loadDraft('/registration'), null)
  })
})
