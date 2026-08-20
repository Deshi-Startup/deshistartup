import assert from 'node:assert/strict'
import test from 'node:test'

import { isWrittenGuide } from './content-guide.mjs'

const page = (slug, source, stub = false) => ({ slug, source, stub })

test('classifies authored guide pages separately from project and utility surfaces', () => {
  assert.equal(isWrittenGuide(page('guides', '# All topics')), false)
  assert.equal(isWrittenGuide(page('about', '# About')), false)
  assert.equal(isWrittenGuide(page('legal-roadmap', '# Legal roadmap\n\n> **In short:** Start here.')), true)
  assert.equal(isWrittenGuide(page('funding/cap-table', '# Cap table\n\n> **In short:** Keep ownership clear.')), true)
})

test('classifies component-backed indexes and lookup pages as non-guides', () => {
  assert.equal(isWrittenGuide(page('b2b', '# B2B\n\n<SectionIndex section="b2b" locale="en" />')), false)
  assert.equal(isWrittenGuide(page('start-here/glossary', '# Glossary\n\n<Glossary locale="en" />')), false)
})

test('keeps a substantive nested guide that appends its section index', () => {
  const source = [
    '# A 30-Day Roadmap',
    '',
    '> **In short:** Complete one learning cycle.',
    '',
    '## Week 1',
    '',
    'Talk to customers and record what they already do.',
    '',
    '<SectionIndex section="start-here" locale="en" />'
  ].join('\n')

  assert.equal(isWrittenGuide(page('start-here/30-day-roadmap', source)), true)
})

test('classifies mirrored nested guides consistently when only one appends a section index', () => {
  const bnSource = '# ৩০ দিনের রোডম্যাপ\n\n## প্রথম সপ্তাহ\n\nকাস্টমারের সঙ্গে কথা বলুন।\n\n<SectionIndex section="start-here" locale="bn" />'
  const enSource = '# A 30-Day Roadmap\n\n## Week 1\n\nTalk to customers.'

  assert.equal(isWrittenGuide(page('start-here/30-day-roadmap', bnSource)), true)
  assert.equal(isWrittenGuide(page('start-here/30-day-roadmap', enSource)), true)
})

test('never classifies an unfinished stub as a written guide', () => {
  assert.equal(isWrittenGuide(page('funding/example', '# Example\n\n<StubNotice />', true)), false)
})
