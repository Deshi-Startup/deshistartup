import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateBreakEven as calc } from './break-even.mjs'
const base = { fixed: 30000, price: 1000, variable: 400, planned: 60 }
test('worked example and a price cut show a real decision', () => {
  assert.deepEqual(calc(base), { contribution: 600, profit: 6000, units: 50, sales: 50000 })
  assert.deepEqual(calc({ ...base, price: 900 }), { contribution: 500, profit: 0, units: 60, sales: 54000 })
})
test('rounds up whole sales and distinguishes sales from fixed costs', () => {
  const x = { ...base, fixed: 30001 }
  const r = calc(x)
  assert.equal(r.units, 51)
  assert.equal(r.sales, 51000)
  assert.ok(calc({ ...x, planned: r.units }).profit >= 0)
  assert.ok(calc({ ...x, planned: r.units - 1 }).profit < 0)
})
test('zero and negative contribution never produce a misleading sales target', () => {
  assert.equal(calc({ ...base, price: 400 }).units, null)
  assert.equal(calc({ ...base, price: 300 }).profit, -36000)
  assert.equal(calc({ ...base, fixed: 0, price: 400 }).profit, 0)
  assert.equal(calc({ ...base, fixed: 0, price: 300, planned: 0 }).profit, 0)
})
test('zero fixed costs and no sales are valid; decimal money is supported', () => {
  assert.equal(calc({ ...base, fixed: 0 }).units, 0)
  assert.equal(calc({ ...base, planned: 0 }).profit, -30000)
  assert.equal(calc({ fixed: 10, price: 1.5, variable: .5, planned: 10 }).profit, 0)
})
test('rejects missing, negative, nonfinite, fractional units and overflow', () => {
  for (const key of Object.keys(base)) for (const value of [NaN, Infinity, -1, undefined]) assert.equal(calc({ ...base, [key]: value }), null)
  assert.equal(calc({ ...base, planned: .5 }), null)
  assert.equal(calc({ ...base, fixed: Number.MAX_VALUE, price: 1, variable: 0 }), null)
  assert.equal(calc({ ...base, price: Number.MAX_VALUE }), null)
})

test('decimal currency does not add a spurious whole sale', () => {
  assert.equal(calc({ fixed: .3, price: .3, variable: .2, planned: 3 }).units, 3)
  assert.equal(calc({ fixed: .00001, price: 1000, variable: 0, planned: 1 }).units, 1)
})
