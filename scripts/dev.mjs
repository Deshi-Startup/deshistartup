#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const nextArgs = ['exec', '--', 'next', 'dev', ...process.argv.slice(2)]
const workerArgs = [
  'exec',
  '--',
  'wrangler',
  'dev',
  '--port',
  '8787',
  '--assets',
  'public'
]

if (fs.existsSync(path.join(root, '.env.local'))) {
  workerArgs.push('--env-file', '.env.local')
}

const children = [
  spawn('npm', workerArgs, { cwd: root, stdio: 'inherit' }),
  spawn('npm', nextArgs, { cwd: root, stdio: 'inherit' })
]

let stopping = false
function stop(signal = 'SIGTERM') {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (!child.killed) child.kill(signal)
  }
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => stop(signal))
}

for (const child of children) {
  child.once('error', (error) => {
    console.error(`dev: could not start ${child.spawnargs.join(' ')}:`, error)
    process.exitCode = 1
    stop()
  })
  child.once('exit', (code, signal) => {
    if (stopping) return
    if (code && code !== 0) process.exitCode = code
    if (signal) process.exitCode = 1
    stop()
  })
}
