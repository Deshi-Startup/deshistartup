import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { banglaSourceText, collectBanglaSources } from './bangla-sources.mjs'

test('extracts JSX, template and JSON copy while excluding comments and English alternatives', () => {
  const source = '// মন্তব্য — ignored\nconst label = en ? "English — allowed" : "বাংলা লেখা";\n' +
    'const jsx = <p title="বাংলা শিরোনাম">আরও তথ্য {`দেখুন ${count}টি পাতা`}</p>;'
  const text = banglaSourceText('example.tsx', source)
  assert.ok(!text.includes('—'))
  assert.equal(text.split('\n')[1].trim(), 'বাংলা লেখা')
  for (const label of ['বাংলা শিরোনাম', 'আরও তথ্য', 'দেখুন', 'টি পাতা']) assert.ok(text.includes(label))
  assert.ok(banglaSourceText('example.json', '{"en":"English — allowed","bn":"বাংলা"}').includes('বাংলা'))
})

test('discovers new components and data while excluding tests and generated copies', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'deshi-bangla-discovery-'))
  try {
    for (const file of ['app/components/New.tsx', 'data/directory/new.json', 'app/generated/copy.json', 'app/components/New.test.mjs']) {
      mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
      writeFileSync(path.join(root, file), '"বাংলা"')
    }
    assert.deepEqual(collectBanglaSources(root), ['app/components/New.tsx', 'data/directory/new.json'])
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('strict lint accepts UI numbering and missing-value legends but rejects Bangla prose errors', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'deshi-bangla-lint-'))
  const file = path.join(root, 'copy.tsx')
  const cli = new URL('./bangla-lint.mjs', import.meta.url)
  try {
    writeFileSync(file, `// মন্তব্য — ignored\nconst en = 'English — allowed';\nconst bn = "১. শুরু করুন";\nconst legend = "'—' মানে তথ্য নেই।";`)
    assert.match(execFileSync(process.execPath, [cli.pathname, file, '--strict'], { encoding: 'utf8' }), /0 hard/)
    writeFileSync(file, `const bn = "বাংলা — লেখা";`)
    const result = spawnSync(process.execPath, [cli.pathname, file, '--strict'], { encoding: 'utf8' })
    assert.equal(result.status, 1)
    assert.match(result.stdout, /L1:/)
    const mdx = path.join(root, 'page.mdx')
    writeFileSync(mdx, '১. শুরু করুন\n')
    assert.equal(spawnSync(process.execPath, [cli.pathname, mdx, '--strict']).status, 1)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
