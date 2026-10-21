import test from 'node:test'
import assert from 'node:assert/strict'
import { discountComparison, aiTaskCost, experimentDecision, b2bPipeline } from './founder-tools.mjs'
const promotion = { customers:100, price:1000, cost:700, acquisition:100, discount:200, repeatDiscount:0, repeatOrders:1.5, promoRate:40, controlRate:30 }
test('promotion example separates acquisition, first order and repeated orders', () => {
 const r=discountComparison(promotion)
 assert.ok(Math.abs(r.promo-180)<1e-9); assert.equal(r.control,335); assert.ok(Math.abs(r.promoTotal-18000)<1e-8)
 assert.ok(Math.abs(r.requiredRate-74.4444444444)<1e-6)
 assert.equal(discountComparison({...promotion,discount:0,promoRate:30}).promo,r.control)
})
test('more repeats can deepen a loss and no profitable repeat hurdle is invented', () => {
 const x={...promotion,repeatDiscount:400}
 assert.ok(discountComparison({...x,promoRate:80}).promo<discountComparison(x).promo)
 assert.equal(discountComparison(x).requiredRate,null)
 assert.equal(discountComparison({...promotion,repeatOrders:0}).requiredRate,null)
 assert.ok(discountComparison({...promotion,discount:900}).requiredRate>100)
})
test('promotion input validation rejects impossible amounts, missing values and overflow', () => {
 for(const x of [{customers:0},{customers:1.5},{discount:1001},{promoRate:101},{price:NaN},{cost:-1},{customers:Infinity},{repeatOrders:1e308}]) assert.equal(discountComparison({...promotion,...x}),null)
})
const ai={tasks:100,successful:90,reviewed:30,minutes:2,hourly:300,inference:100,overhead:50}
test('AI cost includes failures, retries and human work in numerator',()=>{
 const r=aiTaskCost(ai);assert.equal(r.humanCost,300);assert.equal(r.total,450);assert.equal(r.perSuccess,5)
 assert.equal(aiTaskCost({...ai,successful:0}).perSuccess,null)
 assert.equal(aiTaskCost({...ai,reviewed:101}),null)
 assert.equal(aiTaskCost({...ai,successful:101}),null)
 assert.equal(aiTaskCost({...ai,minutes:NaN}),null)
})
const trial={planned:24,reached:24,successes:4,stop:1,proceed:6,complete:true,guardrail:true}
test('experiment gates require complete observations and do not override breached guardrails',()=>{
 assert.equal(experimentDecision(trial),'change')
 assert.equal(experimentDecision({...trial,successes:1}),'stop')
 assert.equal(experimentDecision({...trial,successes:6}),'proceed')
 assert.equal(experimentDecision({...trial,successes:6,complete:false}),'inconclusive')
 assert.equal(experimentDecision({...trial,reached:20}),'inconclusive')
 assert.equal(experimentDecision({...trial,guardrail:false}),'pause')
 assert.equal(experimentDecision({...trial,stop:6}),null)
 assert.equal(experimentDecision({...trial,successes:25}),null)
})
test('B2B forecast is undefined with no paid evidence and validates nested cohorts',()=>{
 assert.deepEqual(b2bPipeline([50,30,20,12,10,8],10),{conversion:16,contactsForTarget:63})
 assert.equal(b2bPipeline([50,30,20,12,10,0],10).contactsForTarget,null)
 assert.equal(b2bPipeline([0,0,0,0,0,0],10).conversion,null)
 assert.equal(b2bPipeline([50,30,20,12,10,11],10),null)
 assert.equal(b2bPipeline([50,30,20,12,10,8],0),null)
})
