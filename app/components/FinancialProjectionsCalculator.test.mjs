import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const componentPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'FinancialProjectionsCalculator.tsx'
)
const source = fs.readFileSync(componentPath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: componentPath
}).outputText
const calculatorModule = { exports: {} }
new Function('exports', 'require', 'module', '__filename', '__dirname', compiled)(
  calculatorModule.exports,
  require,
  calculatorModule,
  componentPath,
  path.dirname(componentPath)
)

const { projectionVerdict, simulateProjection } = calculatorModule.exports
const defaults = {
  customers: 40,
  added: 8,
  churn: 3,
  price: 2000,
  variable: 180,
  fixed: 413417,
  cash: 4200000
}

test('simulates all 120 months and finds break-even even after cash runs out', () => {
  const result = simulateProjection({
    customers: 0,
    added: 1,
    churn: 0,
    price: 100,
    variable: 0,
    fixed: 500,
    cash: 100
  })

  assert.equal(result.cashOutMonth, 1)
  assert.equal(result.breakEvenMonth, 5)
  assert.equal(result.closingCustomers, 120)
})

test('clamps churn, keeps customers nonnegative, and funds an exact-zero month', () => {
  const result = simulateProjection({
    customers: 10,
    added: 0,
    churn: 250,
    price: 100,
    variable: 0,
    fixed: 100,
    cash: 1000
  })

  assert.equal(result.closingCustomers, 0)
  assert.equal(result.breakEvenMonth, null)
  assert.equal(result.cashOutMonth, 11)
})

test('default example reports that break-even comes after cash-out', () => {
  const result = simulateProjection(defaults)

  assert.ok(result.cashOutMonth !== null)
  assert.ok(result.breakEvenMonth !== null)
  assert.ok(result.breakEvenMonth > result.cashOutMonth)
})

test('reports when high churn reverses an early break-even before cash-out', () => {
  const inputs = {
    customers: 500,
    added: 0,
    churn: 10,
    price: 2000,
    variable: 180,
    fixed: 413417,
    cash: 100000
  }
  const result = simulateProjection(inputs)
  const verdict = projectionVerdict({
    isEn: true,
    contribution: result.contribution,
    fixed: inputs.fixed,
    cash: inputs.cash,
    cashOutMonth: result.cashOutMonth,
    breakEvenMonth: result.breakEvenMonth,
    breakEvenLostMonth: result.breakEvenLostMonth,
    format: String
  })

  assert.equal(result.breakEvenMonth, 1)
  assert.equal(result.cashOutMonth, 17)
  assert.match(verdict, /break-even in month 1/)
  assert.match(verdict, /Cash runs out in month 17/)
  assert.match(verdict, /churn pulls contribution back below fixed cost/)
  assert.doesNotMatch(verdict, /too late/)
})

test('no-cash verdict distinguishes immediate and too-late break-even', () => {
  const immediate = projectionVerdict({
    isEn: true,
    contribution: 0,
    fixed: 0,
    cash: 0,
    cashOutMonth: null,
    breakEvenMonth: 1,
    breakEvenLostMonth: null,
    format: String
  })
  const tooLate = projectionVerdict({
    isEn: true,
    contribution: 100,
    fixed: 500,
    cash: 0,
    cashOutMonth: 1,
    breakEvenMonth: 5,
    breakEvenLostMonth: null,
    format: String
  })

  assert.match(immediate, /covers fixed cost from month 1/)
  assert.match(tooLate, /cannot fund the losses before then/)
  assert.match(tooLate, /month 5/)
})

test('no-cash verdict reports when churn reverses an immediate break-even', () => {
  const inputs = {
    customers: 500,
    added: 0,
    churn: 10,
    price: 2000,
    variable: 180,
    fixed: 413417,
    cash: 0
  }
  const result = simulateProjection(inputs)
  const verdict = projectionVerdict({
    isEn: true,
    contribution: result.contribution,
    fixed: inputs.fixed,
    cash: inputs.cash,
    cashOutMonth: result.cashOutMonth,
    breakEvenMonth: result.breakEvenMonth,
    breakEvenLostMonth: result.breakEvenLostMonth,
    format: String
  })

  assert.equal(result.breakEvenMonth, 1)
  assert.equal(result.cashOutMonth, 17)
  assert.match(verdict, /cover fixed cost in month 1/)
  assert.match(verdict, /churn pulls contribution back below fixed cost in month 8/)
  assert.match(verdict, /Cash runs out in month 17/)
  assert.doesNotMatch(verdict, /losses before/)
})

test('zero contribution does not claim that growth can cover fixed cost', () => {
  const verdict = projectionVerdict({
    isEn: true,
    contribution: 0,
    fixed: 500,
    cash: 1000,
    cashOutMonth: 2,
    breakEvenMonth: null,
    breakEvenLostMonth: null,
    format: String
  })

  assert.match(verdict, /no customer count reaches break-even/)
})

test('reports when a large cash reserve survives after early break-even is lost', () => {
  const inputs = {
    customers: 500,
    added: 0,
    churn: 10,
    price: 2000,
    variable: 180,
    fixed: 413417,
    cash: 100000000
  }
  const result = simulateProjection(inputs)
  const verdict = projectionVerdict({
    isEn: true,
    contribution: result.contribution,
    fixed: inputs.fixed,
    cash: inputs.cash,
    cashOutMonth: result.cashOutMonth,
    breakEvenMonth: result.breakEvenMonth,
    breakEvenLostMonth: result.breakEvenLostMonth,
    format: String
  })

  assert.equal(result.breakEvenMonth, 1)
  assert.equal(result.breakEvenLostMonth, 8)
  assert.equal(result.cashOutMonth, null)
  assert.match(verdict, /lose it in month 8/)
  assert.match(verdict, /break-even is not sustained/)
  assert.doesNotMatch(verdict, /whether that month arrives/)
})
