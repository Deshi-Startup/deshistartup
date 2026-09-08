// A deliberately bounded teaching scenario, not an accounting or borrowing tool.
export const CASH_SCENARIO = Object.freeze({ revenue: 45000, supplier: 30000, overhead: 5000, overheadDay: 5, days: 14 })
export const CASH_DEFAULTS = Object.freeze({ opening: 10000, receiptDay: 8, supplierDay: 3 })

export function simulateCashTiming({ opening, receiptDay, supplierDay }) {
  if (!Number.isInteger(opening) || opening < 0 || opening > 1000000 ||
      !Number.isInteger(receiptDay) || receiptDay < 1 || receiptDay > 14 ||
      !Number.isInteger(supplierDay) || supplierDay < 1 || supplierDay > 14) return null
  let balance = opening
  const days = Array.from({ length: CASH_SCENARIO.days }, (_, index) => {
    const day = index + 1
    const received = day === receiptDay ? CASH_SCENARIO.revenue : 0
    const paid = (day === supplierDay ? CASH_SCENARIO.supplier : 0) +
      (day === CASH_SCENARIO.overheadDay ? CASH_SCENARIO.overhead : 0)
    balance += received - paid
    return { day, received, paid, balance }
  })
  const lowest = Math.min(opening, ...days.map(day => day.balance))
  return {
    days,
    lowest,
    shortfall: Math.max(0, -lowest),
    firstShortfallDay: days.find(day => day.balance < 0)?.day ?? null,
    ending: balance,
    profit: CASH_SCENARIO.revenue - CASH_SCENARIO.supplier - CASH_SCENARIO.overhead
  }
}
