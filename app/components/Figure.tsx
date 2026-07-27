import React from 'react'
import {
  DEFAULT_SIZES,
  formatMediaDate,
  mediaEntry,
  mediaId,
  mediaSrcSet,
  mediaUrl
} from '../lib/media'

/**
 * A bundler's static image import, in case Nextra's `staticImage` is ever
 * switched back on. Normalized rather than crashed on.
 */
interface StaticImage {
  src: string
  width?: number
  height?: number
}

function normalize(src: string | StaticImage): {
  path: string
  w?: number
  h?: number
} {
  if (typeof src === 'string') return { path: src }
  return { path: src?.src || '', w: src?.width, h: src?.height }
}

export interface FigureProps {
  /** Root-relative media path, e.g. "/media/registration/rjsc-search.png". */
  src: string | StaticImage
  /** What the image shows, for a reader who cannot see it. Never decorative-by-accident. */
  alt: string
  /** One line under the image. Teaches; does not repeat the alt text. */
  caption?: string
  /** Where the pictured screen or document comes from, e.g. "RJSC পোর্টাল". */
  source?: string
  /** ISO date the screenshot was last checked against the live interface. */
  checked?: string
  /** Attribution for third-party material. */
  credit?: string
  sizes?: string
  locale?: 'bn' | 'en'
  /** Load immediately instead of lazily. Only for an image above the fold. */
  priority?: boolean
}

/**
 * The one image renderer on the site. Plain `<img>` with a srcset the edge
 * fills — no client JS, no image service, no next/image (which is switched off
 * for this deploy target anyway).
 *
 * Markup note: this is a `<span>` and not a `<figure>`, because a markdown
 * image arrives wrapped in a paragraph and `<figure>` inside `<p>` is invalid
 * HTML that browsers silently restructure. The alternative was a remark plugin
 * to unwrap those paragraphs, which cannot be serialized and would break
 * `next dev --turbopack`. `role="figure"` plus a labelled caption gives the
 * same thing to assistive technology.
 */
export default function Figure({
  src,
  alt,
  caption,
  source,
  checked,
  credit,
  sizes = DEFAULT_SIZES,
  locale = 'bn',
  priority = false
}: FigureProps) {
  const { path, w, h } = normalize(src)
  if (!path) return null

  const entry = mediaEntry(path) ?? (w && h ? { w, h } : undefined)
  const srcSet = mediaSrcSet(path)
  const isEn = locale === 'en'

  const meta: string[] = []
  if (source) meta.push(`${isEn ? 'Source' : 'সূত্র'}: ${source}`)
  if (credit) meta.push(`${isEn ? 'Credit' : 'কৃতজ্ঞতা'}: ${credit}`)
  if (checked) meta.push(`${isEn ? 'Checked' : 'যাচাই'}: ${formatMediaDate(checked, locale)}`)

  const image = (
    <img
      className="figure__img"
      src={mediaUrl(path, srcSet ? 800 : undefined)}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      // Intrinsic size keeps the article from reflowing as images land. It is
      // missing only when the manifest is stale; the linter says so.
      width={entry?.w}
      height={entry?.h}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
    />
  )

  if (!caption && !meta.length) return image

  const captionId = `fig-${mediaId(path, caption)}`

  return (
    <span className="figure" role="figure" aria-labelledby={caption ? captionId : undefined}>
      {image}
      <span className="figure__caption" id={captionId}>
        {caption}
        {meta.length > 0 && <span className="figure__meta">{meta.join(' · ')}</span>}
      </span>
    </span>
  )
}

/**
 * Adapter for plain markdown images, so `![alt](/media/x.png "caption")` gets
 * the same treatment as an explicit <Figure>. Registered as `img` in
 * mdx-components.tsx.
 */
export function MarkdownImage({
  src,
  alt,
  title
}: {
  src?: string | StaticImage
  alt?: string
  title?: string
}) {
  if (!src) return null
  return <Figure src={src} alt={alt || ''} caption={title} />
}
