import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import {
  decodeLockedMdx,
  encodeLockedMdx,
  lockedMdxBlocks,
  normalizeContributionMarkdown,
  normalizeTables,
  sameLockedMdx
} from './contribution-markdown.ts'
import {
  decodeEditableVideos,
  editableVideoError,
  encodeEditableVideos,
  parseContributionVideoUrl,
  videoFence
} from './contribution-video.ts'

function pageFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? pageFiles(path) : entry.name === 'page.mdx' ? [path] : []
  })
}

test('protected MDX components survive the editor round trip exactly', () => {
  const source = [
    '# Title',
    '',
    '<StubNotice path="ideas/finding-ideas" locale="en" />',
    '',
    'Body copy.',
    '',
    '<SectionIndex',
    '  section="ideas"',
    '  locale="en"',
    '/>',
    ''
  ].join('\n')

  assert.equal(decodeLockedMdx(encodeLockedMdx(source)), source)
})

test('an author-written mdx code example remains a code example', () => {
  const source = ['```mdx', '<Example value="kept as code" />', '```'].join('\n')
  assert.equal(decodeLockedMdx(encodeLockedMdx(source)), source)
  assert.deepEqual(lockedMdxBlocks(source), [])
})

test('tilde fences and indented component blocks are preserved', () => {
  const source = [
    '~~~mdx',
    '<Example value="kept as code" />',
    '~~~',
    '',
    '  <StubNotice path="ideas/test" locale="en" />',
    ''
  ].join('\n')

  assert.equal(decodeLockedMdx(encodeLockedMdx(source)), source)
  assert.deepEqual(lockedMdxBlocks(source), [
    '<StubNotice path="ideas/test" locale="en" />'
  ])
})

test('a multi-line chart component survives the editor as one protected block', () => {
  const chart = [
    '<DataBars',
    '  unit="%"',
    '  max={100}',
    '  data={[',
    '    { label: "১২০০ টাকার পণ্য", value: 79, display: "৭৯%" },',
    '    { label: "৬০০ টাকার পণ্য", value: 30, display: "৩০%" },',
    '  ]}',
    '/>'
  ].join('\n')
  const source = ['Some prose.', '', chart, '', 'More prose.', ''].join('\n')

  assert.equal(decodeLockedMdx(encodeLockedMdx(source)), source)
  assert.deepEqual(lockedMdxBlocks(source), [chart])
})

test('protected-component validation catches changes, additions and deletion', () => {
  const original = lockedMdxBlocks('<StubNotice path="ideas/test" locale="en" />')

  assert.equal(sameLockedMdx(original, [...original]), true)
  assert.equal(
    sameLockedMdx(original, lockedMdxBlocks('<StubNotice path="ideas/changed" locale="en" />')),
    false
  )
  assert.equal(sameLockedMdx(original, []), false)
  assert.equal(
    sameLockedMdx(original, [...original, '<SectionIndex section="ideas" locale="en" />']),
    false
  )
})

test('video components are editable rather than protected site components', () => {
  const source = [
    '<YouTube id="dQw4w9WgXcQ" title="A useful founder interview" />',
    '<FacebookVideo url="https://www.facebook.com/example/videos/123456789/" title="A public talk" />'
  ].join('\n')
  assert.equal(encodeLockedMdx(source), source)
  assert.deepEqual(lockedMdxBlocks(source), [])
})

test('GFM citations remain editable Markdown instead of protected MDX', () => {
  const source = [
    'A claim.[^official-source]',
    '',
    '[^official-source]: [Official source](https://example.com)'
  ].join('\n')

  assert.equal(encodeLockedMdx(source), source)
  assert.deepEqual(lockedMdxBlocks(source), [])
})

test('YouTube links normalize across common copied URL formats', () => {
  assert.deepEqual(
    parseContributionVideoUrl('https://youtu.be/dQw4w9WgXcQ?t=1m30s', 'en'),
    {
      provider: 'youtube',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90',
      videoId: 'dQw4w9WgXcQ',
      title: 'YouTube video',
      start: 90,
      locale: 'en',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      loading: true
    }
  )
  assert.equal(
    parseContributionVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')?.videoId,
    'dQw4w9WgXcQ'
  )
})

test('Facebook recognition is limited to video-shaped Facebook URLs', () => {
  assert.equal(
    parseContributionVideoUrl('https://www.facebook.com/example/videos/123456789/')?.provider,
    'facebook'
  )
  assert.equal(
    parseContributionVideoUrl('https://www.facebook.com/watch/?v=123456789')?.provider,
    'facebook'
  )
  assert.equal(
    parseContributionVideoUrl('https://www.facebook.com/groups/example/posts/123456789'),
    null
  )
  assert.equal(parseContributionVideoUrl('https://example.com/videos/123456789'), null)
})

test('video editor fences become canonical MDX components on submission', () => {
  const source = [
    '# Title',
    '',
    '<YouTube id="dQw4w9WgXcQ" title="Founder &amp; operator talk" start={45} locale="en" />',
    '',
    '<FacebookVideo url="https://www.facebook.com/example/videos/123456789/" title="Launch lesson" caption="Why timing mattered" />',
    ''
  ].join('\n')
  const encoded = encodeEditableVideos(source)
  assert.match(encoded, /```deshi-video/)
  assert.doesNotMatch(encoded, /<YouTube/)
  const decoded = decodeEditableVideos(encoded)
  assert.match(
    decoded,
    /<YouTube id="dQw4w9WgXcQ" title="Founder &amp; operator talk" locale="en" start=\{45\} \/>/
  )
  assert.match(
    decoded,
    /<FacebookVideo url="https:\/\/www\.facebook\.com\/example\/videos\/123456789\/" title="Launch lesson" caption="Why timing mattered" \/>/
  )
  assert.equal(editableVideoError(encoded), null)
})

test('video validation catches a cleared title before contribution', () => {
  const markdown = videoFence({
    provider: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoId: 'dQw4w9WgXcQ',
    title: '',
    locale: 'en'
  })
  assert.equal(editableVideoError(markdown), 'video_title_required')
})

test('every current content page survives the protected-component round trip', () => {
  for (const file of pageFiles('app/(contents)')) {
    const source = readFileSync(file, 'utf8')
    assert.equal(
      decodeLockedMdx(encodeLockedMdx(source)),
      source,
      `${file} changed during the editor round trip`
    )
  }
})

test('a table already in the repo shape is left byte-identical', () => {
  const table = [
    '| প্রশ্ন | ০ | ১ |',
    '|---|---|---|',
    '| সাম্প্রতিক ঘটনা শুনেছি? | না | একটা |',
    ''
  ].join('\n')
  assert.equal(normalizeTables(table), table)
})

test('the serializer’s padded table collapses back to the repo shape', () => {
  const padded = [
    '| প্রশ্ন                  | ০      | ১    |',
    '| ----------------------- | ------ | ---- |',
    '| সাম্প্রতিক ঘটনা শুনেছি? | না     | একটা |',
    ''
  ].join('\n')
  assert.equal(
    normalizeTables(padded),
    ['| প্রশ্ন | ০ | ১ |', '|---|---|---|', '| সাম্প্রতিক ঘটনা শুনেছি? | না | একটা |', ''].join(
      '\n'
    )
  )
})

test('column alignment survives the collapse', () => {
  const aligned = ['| a | b | c |', '| :--- | ---: | :---: |', '| 1 | 2 | 3 |', ''].join('\n')
  assert.equal(
    normalizeTables(aligned),
    ['| a | b | c |', '|:---|---:|:---:|', '| 1 | 2 | 3 |', ''].join('\n')
  )
})

test('an empty cell keeps its single space of padding on each side', () => {
  const table = ['| a |  | c |', '|---|---|---|', '| 1 |  | 3 |', ''].join('\n')
  assert.equal(normalizeTables(table), table)
})

test('an escaped pipe stays inside its cell', () => {
  const table = ['| a \\| b | c |', '|---|---|', '| d | e |', ''].join('\n')
  assert.equal(normalizeTables(table), table)
})

test('an even backslash before a pipe remains a cell boundary', () => {
  const table = ['| a \\\\| b | c |', '|---|---|---|', '| d | e | f |', ''].join('\n')
  assert.equal(
    normalizeContributionMarkdown(table),
    ['| a \\\\ | b | c |', '|---|---|---|', '| d | e | f |', ''].join('\n')
  )
})

test('a pipe table inside a code fence is left alone', () => {
  const fenced = [
    '```',
    '| a      | b |',
    '| ------ | - |',
    '```',
    ''
  ].join('\n')
  assert.equal(normalizeTables(fenced), fenced)
})

test('prose containing a pipe is not mistaken for a table', () => {
  const prose = ['Use `a | b` to pipe.', '', 'Not a table.', ''].join('\n')
  assert.equal(normalizeTables(prose), prose)
})

test('normalizing is idempotent', () => {
  const padded = ['| a   | b |', '| --- | - |', '| 1   | 2 |', ''].join('\n')
  const once = normalizeTables(padded)
  assert.equal(normalizeTables(once), once)
})

test('nested tables keep their blockquote and list containers', () => {
  const padded = [
    '> | header        | value |',
    '> | ------------- | ----- |',
    '> | row           | text  |',
    '',
    '* | header        | value |',
    '  | ------------- | ----- |',
    '  | row           | text  |',
    '',
    '- outer',
    '  - | header        | value |',
    '    | ------------- | ----- |',
    '    | row           | text  |',
    '',
    '> * | header        | value |',
    '>   | ------------- | ----- |',
    '>   | row           | text  |',
    ''
  ].join('\n')
  const expected = [
    '> | header | value |',
    '> |---|---|',
    '> | row | text |',
    '',
    '* | header | value |',
    '  |---|---|',
    '  | row | text |',
    '',
    '- outer',
    '  - | header | value |',
    '    |---|---|',
    '    | row | text |',
    '',
    '> * | header | value |',
    '>   |---|---|',
    '>   | row | text |',
    ''
  ].join('\n')
  assert.equal(normalizeContributionMarkdown(padded), expected)
})

test('tables with inline code are normalized without touching the code span', () => {
  const padded = ['| `a`    | b |', '| ------ | - |', '| x      | y |', ''].join('\n')
  assert.equal(
    normalizeContributionMarkdown(padded),
    ['| `a` | b |', '|---|---|', '| x | y |', ''].join('\n')
  )
})

test('only structural table rows are normalized', () => {
  const source = [
    '<YouTube title="a | b" />',
    '|---|---|',
    '| x | y |',
    '',
    '# a | b',
    '|---|---|',
    '| x | y |',
    ''
  ].join('\n')
  assert.equal(normalizeContributionMarkdown(source), source)
})

test('serializer-only text escapes are removed outside code', () => {
  const serialized = [
    '# C\\&F',
    '',
    'Use \\_\\_\\_ here.',
    '',
    'word\\_word',
    '`C\\&F` and `\\_\\_\\_`',
    '\\&copy;',
    '\\\\&F',
    ''
  ].join('\n')
  const expected = [
    '# C&F',
    '',
    'Use ___ here.',
    '',
    'word\\_word',
    '`C\\&F` and `\\_\\_\\_`',
    '\\&copy;',
    '\\\\&F',
    ''
  ].join('\n')
  assert.equal(normalizeContributionMarkdown(serialized), expected)
})

test('serializer normalization is idempotent', () => {
  const serialized = ['C\\&F', '', 'a \\_\\_\\_ b', ''].join('\n')
  const once = normalizeContributionMarkdown(serialized)
  assert.equal(normalizeContributionMarkdown(once), once)
})

test('every current content page is already in the normalized table shape', () => {
  const pages = pageFiles('app/(contents)')
  assert.ok(pages.length > 800, `expected the full corpus, saw ${pages.length}`)
  for (const file of pages) {
    const source = readFileSync(file, 'utf8')
    assert.equal(normalizeTables(source), source, `${file} would be rewritten on submission`)
  }
})
