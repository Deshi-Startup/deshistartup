// Executes the real useIdeaVotes source with a minimal deterministic hook runtime.
// No React renderer is installed in this repository. This is a state/effect/fetch
// ordering regression harness, not a DOM or Google-auth integration test.
import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'
import test from 'node:test'
import ts from 'typescript'
const source = fs.readFileSync(new URL('./useIdeaVotes.tsx', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText

function harness(initialAuth = null) {
  const state = [], dependencies = [], cleanups = [], requests = []
  let cursor = 0, effects = [], auth = initialAuth, options, output, dirty = false
  const react = {
    useState(initial) {
      const slot = cursor++
      if (!(slot in state)) state[slot] = typeof initial === 'function' ? initial() : initial
      return [state[slot], value => {
        const next = typeof value === 'function' ? value(state[slot]) : value
        if (!Object.is(state[slot], next)) { state[slot] = next; dirty = true }
      }]
    },
    useRef(initial) {
      const slot = cursor++
      if (!(slot in state)) state[slot] = { current: initial }
      return state[slot]
    },
    useEffect(effect, next) {
      const slot = cursor++
      if (!dependencies[slot] || next.some((value, index) => !Object.is(value, dependencies[slot][index]))) {
        dependencies[slot] = next
        effects.push(() => { cleanups[slot]?.(); cleanups[slot] = effect() })
      }
    }
  }
  const module = { exports: {} }
  vm.runInNewContext(compiled, {
    module, exports: module.exports, AbortController, AbortSignal, Set, Map,
    require(name) {
      if (name === 'react') return react
      if (name === './useEcosystemSession') return {
        useEcosystemSession(locale, nextOptions) {
          options = nextOptions
          return { auth, signIn() {}, expire() { auth = null; dirty = true }, dialog: null }
        }
      }
      throw new Error(`Unexpected production import: ${name}`)
    },
    fetch(url, init = {}) {
      return new Promise((resolve, reject) => requests.push({ url, init, resolve, reject, settled: false }))
    }
  }, { filename: 'useIdeaVotes.transpiled.cjs' })
  function render() {
    cursor = 0; dirty = false
    output = module.exports.useIdeaVotes('en')
    const pending = effects; effects = []
    pending.forEach(effect => effect())
  }
  async function flush() {
    for (let turn = 0; turn < 20; turn++) {
      await Promise.resolve()
      if (dirty) render()
    }
  }
  function pending(path, method = 'GET') {
    const found = requests.find(request => !request.settled && request.url === path && (request.init.method || 'GET') === method)
    assert.ok(found, `Expected pending ${method} ${path}`)
    return found
  }
  async function respond(request, data, status = 200) {
    assert.equal(request.settled, false, 'Response already settled')
    request.settled = true
    request.resolve({ ok: status >= 200 && status < 300, status, json: async () => data })
    await flush()
  }
  render()
  return {
    get value() { return output }, requests, pending, respond, flush,
    async toggle(id) { void output.toggle(id); await flush() },
    async authenticate() {
      auth = { token: 'token', user: { email: 'test@example.invalid' } }
      options.onAuthenticated(auth)
      render(); await flush()
    },
    close() { cleanups.forEach(cleanup => cleanup?.()) }
  }
}

const publicPath = '/api/ecosystem/votes'
const privatePath = '/api/ecosystem/votes/mine'
const counts = { old: 1, other: 1, new: 0 }
function assertVotes(h, expected) {
  assert.deepEqual(Array.from(h.value.voted).sort(), [...expected].sort())
}

async function loginRace(privateFirst, includesNew) {
  const h = harness()
  try {
    await h.respond(h.pending(publicPath), { counts })
    await h.toggle('new')
    await h.authenticate()
    const post = h.pending(publicPath, 'POST')
    const mine = h.pending(privatePath)
    const privateData = { voted: includesNew ? ['old', 'new'] : ['old'], counts: { ...counts, new: includesNew ? 1 : 0 } }
    if (privateFirst) await h.respond(mine, privateData)
    await h.respond(post, { id: 'new', voted: true, count: 1 })
    if (!privateFirst) await h.respond(mine, privateData)
    assertVotes(h, ['old', 'new'])
    assert.equal(h.value.counts.new, 1, 'Late private counts must not undo successful vote')
    await h.toggle('old')
    const removal = h.pending(publicPath, 'POST')
    assert.deepEqual(JSON.parse(removal.init.body), { id: 'old', voted: false })
    await h.respond(removal, { id: 'old', voted: false, count: 0 })
    assertVotes(h, ['new'])
  } finally { h.close() }
}

async function lateInitialReadAfterTwoMutations() {
  const h = harness({ token: 'token', user: {} })
  try {
    const lateInitialMine = h.pending(privatePath)
    await h.respond(h.pending(publicPath), { counts })
    await h.toggle('old')
    const retryMine = h.requests.find(r => r !== lateInitialMine && r.url === privatePath && !r.settled)
    assert.ok(retryMine, 'Click before private hydration must request account state')
    await h.respond(retryMine, { voted: ['old', 'other'], counts })
    const removal = h.pending(publicPath, 'POST')
    assert.deepEqual(JSON.parse(removal.init.body), { id: 'old', voted: false })
    await h.respond(removal, { id: 'old', voted: false, count: 0 })
    await h.toggle('new')
    await h.respond(h.pending(publicPath, 'POST'), { id: 'new', voted: true, count: 1 })
    await h.respond(lateInitialMine, { voted: ['old', 'other'], counts })
    assertVotes(h, ['other', 'new'])
    assert.equal(h.value.counts.old, 0)
    assert.equal(h.value.counts.new, 1)
    assert.equal(h.value.counts.other, 1)
  } finally { h.close() }
}

for (const [name, run] of [
  ['Private read before POST retains existing votes', () => loginRace(true, false)],
  ['POST before stale private read merges existing votes', () => loginRace(false, false)],
  ['POST before fresh private read merges existing votes', () => loginRace(false, true)],
  ['Late initial read preserves removal and addition', lateInitialReadAfterTwoMutations]
]) {
  test(name, run)
}
