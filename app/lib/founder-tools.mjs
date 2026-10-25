/** Pure teaching models. BDT inputs; percentages are 0–100. No benchmark defaults here. */
const finite = (...xs) => xs.every(x => typeof x === 'number' && Number.isFinite(x))
const positiveCount = n => Number.isSafeInteger(n) && n > 0
const count = n => Number.isSafeInteger(n) && n >= 0
const rate = n => n >= 0 && n <= 100

export function discountComparison(x) {
  const { customers, price, cost, acquisition, discount, repeatDiscount, repeatOrders, promoRate, controlRate } = x
  if (!finite(customers, price, cost, acquisition, discount, repeatDiscount, repeatOrders, promoRate, controlRate) || !positiveCount(customers) ||
      [price, cost, acquisition, discount, repeatDiscount, repeatOrders].some(n => n < 0) ||
      discount > price || repeatDiscount > price || !rate(promoRate) || !rate(controlRate)) return null
  // A returning purchaser has completed at least one additional order.
  // Zero additional orders is meaningful only when neither cohort has returners.
  if (repeatOrders < 1 && !(repeatOrders === 0 && promoRate === 0 && controlRate === 0)) return null
  const repeatMargin = price - repeatDiscount - cost
  const firstPromo = price - discount - cost - acquisition
  const firstControl = price - cost - acquisition
  const promo = firstPromo + promoRate / 100 * repeatOrders * repeatMargin
  const control = firstControl + controlRate / 100 * repeatOrders * repeatMargin
  // Validate the full-return contribution before division: overflow must not
  // turn an impossible scenario into an apparently attainable 0% hurdle.
  const fullRepeatContribution = repeatOrders * repeatMargin
  if (!Number.isFinite(fullRepeatContribution)) return null
  const requiredRate = fullRepeatContribution > 0
    ? Math.max(0, (control - firstPromo) / fullRepeatContribution * 100) : null
  const values = [firstPromo, firstControl, repeatMargin, promo, control, promo * customers, control * customers]
  if (!values.every(Number.isFinite) || (requiredRate !== null && !Number.isFinite(requiredRate))) return null
  return { firstPromo, firstControl, repeatMargin, promo, control,
    promoTotal: promo * customers, controlTotal: control * customers, requiredRate }
}

export function aiTaskCost(x) {
  const { tasks, successful, reviewed, minutes, hourly, inference, overhead } = x
  if (!finite(tasks, successful, reviewed, minutes, hourly, inference, overhead) || !positiveCount(tasks) || !count(successful) || !count(reviewed) ||
      successful > tasks || reviewed > tasks || [minutes, hourly, inference, overhead].some(n => n < 0)) return null
  const humanCost = reviewed * minutes / 60 * hourly
  const total = inference + humanCost + overhead
  if (!finite(humanCost, total)) return null
  return { humanCost, total, successRate: successful / tasks * 100,
    perSuccess: successful ? total / successful : null }
}

export function experimentDecision({ planned, reached, successes, stop, proceed, complete, guardrail }) {
  if (typeof complete !== 'boolean' || typeof guardrail !== 'boolean') return null
  if (!positiveCount(planned) || ![reached, successes, stop, proceed].every(count) ||
      reached > planned || successes > reached || stop >= proceed || proceed > planned) return null
  if (!guardrail) return 'pause'
  if (!complete || reached < planned) return 'inconclusive'
  if (successes <= stop) return 'stop'
  if (successes >= proceed) return 'proceed'
  return 'change'
}

export function b2bPipeline(stages, target) {
  if (stages.length !== 6 || !stages.every(count) || !positiveCount(target) ||
      stages.some((n, i) => i > 0 && n > stages[i - 1])) return null
  const [contacted] = stages
  const paid = stages[5]
  const contactsForTarget = paid ? Math.ceil(target * contacted / paid) : null
  if (contactsForTarget !== null && !Number.isSafeInteger(contactsForTarget)) return null
  return { conversion: contacted ? paid / contacted * 100 : null, contactsForTarget }
}
