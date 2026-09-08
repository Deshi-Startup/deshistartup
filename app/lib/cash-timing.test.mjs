import test from 'node:test'
import assert from 'node:assert/strict'
import { CASH_DEFAULTS, simulateCashTiming } from './cash-timing.mjs'

test('a profitable project can need cash before its customer pays', () => {
  const result = simulateCashTiming(CASH_DEFAULTS)
  assert.equal(result.profit, 10000)
  assert.equal(result.ending, 20000)
  assert.equal(result.firstShortfallDay, 3)
  assert.equal(result.shortfall, 25000)
  assert.equal(result.days[4].balance, -25000)
  assert.equal(result.days[7].balance, 20000)
})

test('earlier receipt and agreed later supplier payment solve timing without changing profit', () => {
  for (const changes of [{ receiptDay: 2 }, { supplierDay: 9 }]) {
    const result = simulateCashTiming({ ...CASH_DEFAULTS, ...changes })
    assert.equal(result.shortfall, 0)
    assert.equal(result.firstShortfallDay, null)
    assert.equal(result.profit, 10000)
    assert.equal(result.ending, 20000)
  }
})

test('same-day receipts are available before payments in this daily model', () => {
  const result = simulateCashTiming({ opening: 0, receiptDay: 5, supplierDay: 5 })
  assert.equal(result.shortfall, 0)
  assert.deepEqual(result.days[4], { day: 5, received: 45000, paid: 35000, balance: 10000 })
})

test('exact cash coverage is not a shortfall; changing opening cash is not profit', () => {
  const covered = simulateCashTiming({ ...CASH_DEFAULTS, opening: 35000 })
  const short = simulateCashTiming({ ...CASH_DEFAULTS, opening: 34999 })
  assert.equal(covered.lowest, 0)
  assert.equal(covered.shortfall, 0)
  assert.equal(short.shortfall, 1)
  assert.equal(short.firstShortfallDay, 5)
  assert.equal(covered.profit, short.profit)
})

test('all permitted dates conserve cash and show enough additional cash to cover the trough', () => {
  for (let receiptDay = 1; receiptDay <= 14; receiptDay++) {
    for (let supplierDay = 1; supplierDay <= 14; supplierDay++) {
      const inputs = { opening: 0, receiptDay, supplierDay }
      const result = simulateCashTiming(inputs)
      assert.equal(result.ending, 10000)
      const covered = simulateCashTiming({ ...inputs, opening: result.shortfall })
      assert.equal(covered.shortfall, 0)
    }
  }
})

test('invalid inputs do not silently become zero or produce plausible-looking results', () => {
  for (const opening of [NaN, Infinity, -1, 0.5, 1000001, '', null])
    assert.equal(simulateCashTiming({ ...CASH_DEFAULTS, opening }), null)
  for (const day of [0, 15, NaN, 2.5]) {
    assert.equal(simulateCashTiming({ ...CASH_DEFAULTS, receiptDay: day }), null)
    assert.equal(simulateCashTiming({ ...CASH_DEFAULTS, supplierDay: day }), null)
  }
})
