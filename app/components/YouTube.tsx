import React from 'react'
import { SITE_URL } from '../seo.config.mjs'
import {
  formatMediaDate,
  mediaDefaultWidth,
  mediaEntry,
  mediaId,
  mediaSrcSet,
  mediaUrl
} from '../lib/media'

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

export interface YouTubeProps {
  /** The 11-character YouTube video id, not the full URL. */
  id: string
  /** Spoken-language title. Read out as the play button's label. */
  title: string
  /** One line under the player. */
  caption?: string
  /** Start offset in seconds. */
  start?: number
  /** ISO upload date. Only when known: it is the field that unlocks VideoObject. */
  date?: string
  locale?: 'bn' | 'en'
}

/**
 * A YouTube embed that costs ~25 KB instead of ~2 MB.
 *
 * A real iframe pulls in well over a megabyte of player code and a dozen
 * requests *on page load*, whether or not anyone watches — which is exactly
 * the "heavy embed" the performance budget rules out, and which on a mid-range
 * Android phone on patchy bandwidth is the difference between a page that
 * opens and one that does not.
 *
 * So the page ships a poster we host ourselves, a play button, and a link.
 * Nothing reaches Google until the reader clicks. With JavaScript off, the
 * whole thing is still a working link to the video.
 */
export default function YouTube({ id, title, caption, start, date, locale = 'bn' }: YouTubeProps) {
  if (!VIDEO_ID.test(id || '')) {
    // Loud at build time rather than a silently broken player in production.
    throw new Error(
      `<YouTube id="${id}"> is not a valid YouTube video id (11 chars of A-Z a-z 0-9 _ -).`
    )
  }

  const isEn = locale === 'en'
  const poster = ['.jpg', '.webp', '.png']
    .map((ext) => `/media/youtube/${id}${ext}`)
    .find((path) => mediaEntry(path))
  const posterEntry = poster ? mediaEntry(poster) : undefined
  const posterSrcSet = poster ? mediaSrcSet(poster) : undefined
  const watchUrl = `https://www.youtube.com/watch?v=${id}${start ? `&t=${start}` : ''}`
  const playLabel = `${isEn ? 'Play video' : 'ভিডিও চালান'}: ${title}`
  const captionId = `yt-${mediaId(id, caption)}`

  const structuredData = date
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: title,
        description: caption || title,
        uploadDate: date,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
        contentUrl: watchUrl,
        ...(poster ? { thumbnailUrl: `${SITE_URL}${poster}` } : {})
      }
    : null

  return (
    <span className="yt" role="figure" aria-labelledby={caption ? captionId : undefined}>
      <a
        className="yt__frame"
        href={watchUrl}
        data-yt={id}
        data-yt-title={title}
        data-yt-start={start ? String(start) : undefined}
        aria-label={playLabel}
        rel="noopener"
      >
        {poster ? (
          <img
            className="yt__poster"
            src={mediaUrl(poster, posterSrcSet ? mediaDefaultWidth(poster) : undefined)}
            srcSet={posterSrcSet}
            sizes="(max-width: 860px) 100vw, 800px"
            width={posterEntry?.w}
            height={posterEntry?.h}
            // The link's aria-label is what assistive tech reads here, so this
            // is not heard twice. It earns its place when the poster fails to
            // load: the reader gets the video's name instead of a blank box.
            alt={title}
            loading="lazy"
            decoding="async"
          />
        ) : null}
        <span className="yt__play" aria-hidden="true">
          <svg viewBox="0 0 68 48" width="68" height="48" focusable="false">
            <path
              className="yt__play-bg"
              d="M66.5 7.7c-.8-2.9-2.5-5.4-5.4-6.2C55.8.1 34 0 34 0S12.2.1 6.9 1.5C4 2.3 2.3 4.8 1.5 7.7 0 13.1 0 24 0 24s0 10.9 1.5 16.3c.8 2.9 2.5 5.4 5.4 6.2C12.2 47.9 34 48 34 48s21.8-.1 27.1-1.5c2.9-.8 4.6-3.3 5.4-6.2C68 34.9 68 24 68 24s0-10.9-1.5-16.3z"
            />
            <path d="M45 24 27 14v20" fill="#fff" />
          </svg>
        </span>
        <span className="yt__title">{title}</span>
      </a>
      <span className="yt__caption" id={captionId}>
        {caption}
        <span className="yt__meta">
          <span className="yt__source">
            {isEn ? 'Plays on YouTube' : 'ইউটিউবে চলবে'}
            {date ? ` · ${formatMediaDate(date, locale)}` : ''}
          </span>
        </span>
      </span>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <script dangerouslySetInnerHTML={{ __html: FACADE_SCRIPT }} />
    </span>
  )
}

/**
 * Swaps the facade for the real player on click, and warms the connection to
 * YouTube one moment earlier, on hover or first touch, so the click itself
 * does not also pay for DNS and TLS. Self-guarded, so several videos on one
 * page still install a single listener.
 */
const FACADE_SCRIPT = `(function(){if(window.__deshiYt)return;window.__deshiYt=1;
var warmed=0;
function warm(){if(warmed)return;warmed=1;['https://www.youtube-nocookie.com','https://i.ytimg.com','https://www.google.com'].forEach(function(h){var l=document.createElement('link');l.rel='preconnect';l.href=h;l.crossOrigin='';document.head.appendChild(l)})}
function hit(e){var t=e.target;return t&&t.closest?t.closest('[data-yt]'):null}
document.addEventListener('pointerover',function(e){if(hit(e))warm()},{passive:true});
document.addEventListener('touchstart',function(e){if(hit(e))warm()},{passive:true});
document.addEventListener('click',function(e){
var a=hit(e);
if(!a||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
e.preventDefault();
var f=document.createElement('iframe');
f.className='yt__iframe';
f.src='https://www.youtube-nocookie.com/embed/'+a.getAttribute('data-yt')+'?autoplay=1&rel=0&modestbranding=1&playsinline=1'+(a.getAttribute('data-yt-start')?'&start='+a.getAttribute('data-yt-start'):'');
f.title=a.getAttribute('data-yt-title')||'YouTube';
f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
f.setAttribute('allowfullscreen','');
f.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
a.replaceWith(f);
try{f.focus()}catch(_){}
})})();`
