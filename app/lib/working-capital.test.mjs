import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateWorkingCapital as calculate } from './working-capital.mjs'

const example = { creditSales: 600000, cogs: 360000, creditPurchases: 360000, inventoryDays: 30, collectionDays: 20, paymentDays: 15 }

test('worked example uses sales for invoices and cost for stock and purchases', () => {
  assert.deepEqual(calculate(example), { inventory: 360000, receivables: 400000, payables: 180000, tiedUp: 580000, cycle: 35 })
  assert.notEqual(calculate(example).tiedUp, example.creditSales / 30 * 35)
})
test('one ten-day change releases different amounts on sales and cost bases', () => {
  const original = calculate(example).tiedUp
  assert.equal(original - calculate({ ...example, collectionDays: 10 }).tiedUp, 200000)
  assert.equal(original - calculate({ ...example, inventoryDays: 20 }).tiedUp, 120000)
  assert.equal(original - calculate({ ...example, paymentDays: 25 }).tiedUp, 120000)
})
test('supplier balance uses credit purchases independently of COGS', () => {
  const result = calculate({ ...example, creditPurchases: 120000 })
  assert.equal(result.payables, 60000)
  assert.equal(result.inventory, 360000)
  assert.equal(result.tiedUp, 700000)
})
test('negative days result and negative balance are preserved independently', () => {
  const result = calculate({ ...example, inventoryDays: 5, collectionDays: 10, paymentDays: 20 })
  assert.equal(result.cycle, -5)
  assert.equal(result.tiedUp, 20000) // A negative CCC need not mean negative cash tied up.
  assert.equal(calculate({ ...example, inventoryDays: 5, collectionDays: 0, paymentDays: 20 }).tiedUp, -180000)
})
test('zero credit sales, cost and purchases work with zero corresponding days', () => {
  assert.equal(calculate({ ...example, creditSales: 0, collectionDays: 0 }).receivables, 0)
  assert.equal(calculate({ ...example, cogs: 0, inventoryDays: 0 }).inventory, 0)
  assert.equal(calculate({ ...example, creditPurchases: 0, paymentDays: 0 }).payables, 0)
  assert.deepEqual(calculate(Object.fromEntries(Object.keys(example).map(key => [key, 0]))), { inventory: 0, receivables: 0, payables: 0, tiedUp: 0, cycle: 0 })
  for (const key of ['creditSales', 'cogs', 'creditPurchases']) assert.equal(calculate({ ...example, [key]: 0 }), null)
})
test('rejects missing, negative, nonfinite and overflow inputs without clamping', () => {
  for (const key of Object.keys(example)) {
    for (const value of [NaN, Infinity, -Infinity, -1, undefined, null, '30']) {
      assert.equal(calculate({ ...example, [key]: value }), null, `${key}: ${value}`)
    }
  }
  assert.equal(calculate({ ...example, cogs: Number.MAX_VALUE, inventoryDays: 1000 }), null)
})
test('fractional amounts and days retain precision until presentation', () => {
  const result = calculate({ ...example, creditSales: 1000.5, collectionDays: 1.5 })
  assert.ok(Math.abs(result.receivables - 50.025) < 1e-10)
  assert.equal(result.cycle, 16.5)
})
