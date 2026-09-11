import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateCodRisk } from './cod-risk.mjs'
const defaults = { price: 1200, cogs: 800, delivery: 60, packaging: 20, returnFreight: 0, codPct: 1 }

test('COD example reconciles the receipt and both outcomes at break-even', () => {
  const result = calculateCodRisk(defaults)
  assert.equal(result.codFee, 12)
  assert.equal(result.costs + result.kept, defaults.price)
  assert.equal(result.kept, 308)
  assert.equal(result.lost, 80)
  const rate = result.breakEven / 100
  assert.ok(Math.abs((1 - rate) * result.kept - rate * result.lost) < 1e-10)
})
test('additional return freight lowers break-even without changing delivered proceeds', () => {
  const before = calculateCodRisk(defaults)
  const after = calculateCodRisk({ ...defaults, returnFreight: 100 })
  assert.equal(after.kept, before.kept)
  assert.equal(after.lost, 180)
  assert.ok(after.breakEven < before.breakEven)
})
test('loss-making delivery, zero margin, free returns and an empty model are distinct', () => {
  assert.equal(calculateCodRisk({ ...defaults, cogs: 1500 }).breakEven, null)
  assert.equal(calculateCodRisk({ ...defaults, codPct: 0, cogs: 1120 }).breakEven, 0)
  assert.equal(calculateCodRisk({ ...defaults, delivery: 0, packaging: 0 }).breakEven, 100)
  assert.equal(calculateCodRisk({ price: 0, cogs: 0, delivery: 0, packaging: 0, returnFreight: 0, codPct: 0 }).breakEven, null)
})
test('invalid inputs never produce a financial result', () => {
  for (const value of [NaN, Infinity, -1]) assert.equal(calculateCodRisk({ ...defaults, price: value }), null)
  assert.equal(calculateCodRisk({ ...defaults, codPct: 101 }), null)
  assert.equal(calculateCodRisk({ ...defaults, cogs: Number.MAX_VALUE, delivery: Number.MAX_VALUE }), null)
})
