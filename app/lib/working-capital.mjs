/** Steady-state balances for a normalized 30-day month, not a cash forecast. */
export function calculateWorkingCapital({ creditSales, cogs, creditPurchases, inventoryDays, collectionDays, paymentDays }) {
  const values = [creditSales, cogs, creditPurchases, inventoryDays, collectionDays, paymentDays]
  if (values.some(value => !Number.isFinite(value) || value < 0)) return null
  // A zero flow cannot support a nonzero turnover period. Old balances need
  // an actual cash forecast; they must not disappear behind a zero estimate.
  if ((creditSales === 0 && collectionDays !== 0) ||
      (cogs === 0 && inventoryDays !== 0) ||
      (creditPurchases === 0 && paymentDays !== 0)) return null
  const inventory = cogs / 30 * inventoryDays
  const receivables = creditSales / 30 * collectionDays
  const payables = creditPurchases / 30 * paymentDays
  const tiedUp = inventory + receivables - payables
  const cycle = inventoryDays + collectionDays - paymentDays
  if (![inventory, receivables, payables, tiedUp, cycle].every(Number.isFinite)) return null
  return { inventory, receivables, payables, tiedUp, cycle }
}
