/** The guide's two-outcome model; returned goods remain saleable. */
export function calculateCodRisk({ price, cogs, delivery, packaging, returnFreight, codPct }) {
  const amounts = [price, cogs, delivery, packaging, returnFreight, codPct]
  if (amounts.some(value => !Number.isFinite(value) || value < 0) || codPct > 100) return null
  const codFee = price * codPct / 100
  const costs = cogs + delivery + packaging + codFee
  const kept = price - costs
  const lost = delivery + packaging + returnFreight
  if (![codFee, costs, kept, lost, kept + lost].every(Number.isFinite)) return null
  // No non-negative return rate can rescue a negative delivered contribution.
  // If neither outcome gains or loses money, there is no unique break-even rate.
  const breakEven = kept >= 0 && kept + lost > 0 ? kept / (kept + lost) * 100 : null
  return { codFee, costs, kept, lost, breakEven }
}
