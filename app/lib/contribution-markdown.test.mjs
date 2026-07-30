import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import {
  decodeLockedMdx,
  encodeLockedMdx,
  lockedMdxBlocks,
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
