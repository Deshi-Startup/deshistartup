import React from 'react'
import { formatMediaDate, mediaId } from '../lib/media'
import { isValidFacebookVideoUrl } from '../lib/contribution-video'

export interface FacebookVideoProps {
  /** A public Facebook video, reel, watch, share-video, or fb.watch URL. */
  url: string
  /** A short spoken-language title for accessibility and the facade. */
  title: string
  caption?: string
  /** ISO upload date, only when the contributor knows it. */
  date?: string
  locale?: 'bn' | 'en'
}

/**
 * A click-to-load facade around Meta's official public-video plugin.
 *
 * Facebook receives no request while the reader is merely reading the page.
 * Private, deleted, or audience-restricted videos may not play in the plugin,
 * so the original link remains available under the player.
 */
export default function FacebookVideo({
  url,
  title,
  caption,
  date,
  locale = 'bn'
}: FacebookVideoProps) {
  if (!isValidFacebookVideoUrl(url)) {
    throw new Error(`<FacebookVideo url="${url}"> is not a supported Facebook video URL.`)
  }
  if (!title?.trim()) {
    throw new Error(`<FacebookVideo url="${url}"> needs a title.`)
  }

  const isEn = locale === 'en'
  const captionId = `fb-video-${mediaId(url, caption)}`
  const playLabel = `${isEn ? 'Play Facebook video' : 'Facebook ভিডিও চালান'}: ${title}`

  return (
    <span
      className="fb-video"
      role="figure"
      aria-labelledby={caption ? captionId : undefined}
    >
      <a
        className="fb-video__frame"
        href={url}
        data-fb-video={url}
        data-fb-title={title}
        aria-label={playLabel}
        rel="noopener noreferrer"
      >
        <span className="fb-video__brand" aria-hidden="true">
          f
        </span>
        <span className="fb-video__play" aria-hidden="true">
          <svg viewBox="0 0 48 48" width="48" height="48" focusable="false">
            <circle cx="24" cy="24" r="22" />
            <path d="M20 15.5 34 24 20 32.5Z" />
          </svg>
        </span>
        <span className="fb-video__title">{title}</span>
      </a>
      <span className="fb-video__caption" id={captionId}>
        {caption}
        <span className="fb-video__meta">
          <a href={url} rel="noopener noreferrer">
            {isEn ? 'Open on Facebook' : 'Facebook-এ খুলুন'}
          </a>
          {date ? ` · ${formatMediaDate(date, locale)}` : ''}
        </span>
      </span>
      <script dangerouslySetInnerHTML={{ __html: FACEBOOK_FACADE_SCRIPT }} />
    </span>
  )
}

const FACEBOOK_FACADE_SCRIPT = `(function(){if(window.__deshiFbVideo)return;window.__deshiFbVideo=1;
var warmed=0;
function warm(){if(warmed)return;warmed=1;['https://www.facebook.com','https://static.xx.fbcdn.net'].forEach(function(h){var l=document.createElement('link');l.rel='preconnect';l.href=h;l.crossOrigin='';document.head.appendChild(l)})}
function hit(e){var t=e.target;return t&&t.closest?t.closest('[data-fb-video]'):null}
document.addEventListener('pointerover',function(e){if(hit(e))warm()},{passive:true});
document.addEventListener('touchstart',function(e){if(hit(e))warm()},{passive:true});
document.addEventListener('click',function(e){
var a=hit(e);
if(!a||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
e.preventDefault();
var f=document.createElement('iframe');
f.className='fb-video__iframe';
f.src='https://www.facebook.com/plugins/video.php?href='+encodeURIComponent(a.getAttribute('data-fb-video'))+'&show_text=false&width=800&autoplay=true';
f.title=a.getAttribute('data-fb-title')||'Facebook video';
f.allow='autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share';
f.setAttribute('allowfullscreen','');
f.setAttribute('scrolling','no');
f.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
a.replaceWith(f);
try{f.focus()}catch(_){}
})})();`
