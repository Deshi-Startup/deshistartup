/** Single-product monthly model. Money inputs are BDT; units are whole sales. */
export function calculateBreakEven({ fixed, price, variable, planned }) {
  if ([fixed, price, variable, planned].some(n => !Number.isFinite(n) || n < 0) || !Number.isSafeInteger(planned)) return null
  const contribution = price - variable
  const profit = (contribution * planned - fixed) || 0
  if (!Number.isFinite(profit)) return null
  if (contribution <= 0) return { contribution, profit, units: null, sales: null }
  const rawUnits = fixed / contribution
  const nearest = Math.round(rawUnits)
  // Remove floating-point dust near an integer, without rounding tiny needs to zero.
  const units = nearest > 0 && Math.abs(rawUnits - nearest) <= Number.EPSILON * Math.max(1, rawUnits) * 2
    ? nearest : Math.ceil(rawUnits)
  const sales = units * price
  if (!Number.isSafeInteger(units) || !Number.isFinite(sales)) return null
  return { contribution, profit, units, sales }
}
