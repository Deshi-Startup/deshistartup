import test from 'node:test'
import assert from 'node:assert/strict'
import { getDemandPlanFields, formatDemandPlan } from './demand-plan.mjs'

test('blank and unfinished exports retain every prompt and mark missing answers', () => {
  const fields = getDemandPlanFields('en')
  const plan = formatDemandPlan({ customer: '  Managers in Sylhet  ', assumption: '   ' }, 'en')
  assert.match(plan, /Managers in Sylhet/)
  assert.equal((plan.match(/\[Not filled in\]/g) || []).length, fields.length - 1)
  for (const { label } of fields) assert.ok(plan.includes(label))
  assert.match(plan, /not proof that demand exists/)
  assert.match(plan, /What contradicts it/)
})

test('download round trip preserves Unicode, newlines and punctuation as plain text', () => {
  const answer = 'সিলেট\nBDT 0 & 3 hours <script>alert("test")</script> # ? %'
  const plan = formatDemandPlan({ test: answer }, 'en')
  assert.ok(decodeURIComponent(encodeURIComponent(plan)).includes(answer))
})

test('completed plans do not receive a success or validation verdict', () => {
  const fields = getDemandPlanFields('en')
  const values = Object.fromEntries(fields.map(({ id }) => [id, `Answer: ${id}`]))
  const plan = formatDemandPlan(values, 'en')
  assert.ok(!plan.includes('[Not filled in]'))
  for (const value of Object.values(values)) assert.ok(plan.includes(value))
  assert.match(plan, /AFTER THE TEST/)
  assert.match(plan, /not proof that demand exists/)
})

test('bangla format', () => {
  const plan = formatDemandPlan({}, 'bn')
  assert.match(plan, /আমার ডিমান্ড টেস্ট প্ল্যান/)
  assert.match(plan, /\[পূরণ করা হয়নি\]/)
})
