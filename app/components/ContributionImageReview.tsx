'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthModal from './AuthModal'
import { AuthState, getStoredAuth } from '../lib/client-auth'

interface ReviewMedia {
  id: string
  alt: string
  source?: string
  credit?: string
  checked?: string
  originalName: string
  bytes: number
  w: number
  h: number
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  publicPath?: string
  reason?: string
  previewUrl: string
}

interface ReviewData {
  id: string
  ownerName: string
  pagePath: string
  pageTitle: string
  prUrl?: string
  status: string
  expiresAt: string
  moderation: {
    status: 'active' | 'muted' | 'banned'
    until?: string
    reason?: string
  }
  media: ReviewMedia[]
}

export default function ContributionImageReview() {
  const reviewId = useSearchParams().get('id') || ''
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [data, setData] = useState<ReviewData | null>(null)
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const previewsRef = useRef<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    const stored = getStoredAuth()
    setAuth(stored)
    setAuthOpen(!stored)
    if (!stored) setLoading(false)
  }, [])

  const load = useCallback(async () => {
    if (!auth) return
    if (!reviewId) {
      setLoading(false)
      setError('review_expired')
      return
    }
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${basePath}/api/contribution-review/${reviewId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'review_load_failed')
      setData(result)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'review_load_failed')
    } finally {
      setLoading(false)
    }
  }, [auth, reviewId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!auth || !data) return
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    let active = true
    Promise.all(
      data.media
        .filter((media) => media.status === 'pending' && !previews[media.id])
        .map(async (media) => {
          const response = await fetch(`${basePath}${media.previewUrl}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
          })
          if (!response.ok) return null
          return [media.id, URL.createObjectURL(await response.blob())] as const
        })
    ).then((loaded) => {
      if (!active) {
        loaded.forEach((item) => item?.[1] && URL.revokeObjectURL(item[1]))
        return
      }
      setPreviews((current) => {
        const next = {
          ...current,
          ...Object.fromEntries(loaded.filter(Boolean) as Array<readonly [string, string]>)
        }
        previewsRef.current = next
        return next
      })
    })
    return () => {
      active = false
    }
    // Fetch only when the review payload changes; preview state is intentionally
    // omitted so adding one URL does not restart the full batch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, data])

  useEffect(
    () => () => {
      Object.values(previewsRef.current).forEach((url) => URL.revokeObjectURL(url))
    },
    []
  )

  async function act(action: string, mediaId?: string, durationDays?: number) {
    if (!auth || acting) return
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const actionKey = `${action}:${mediaId || ''}`
    setActing(actionKey)
    setError(null)
    try {
      const response = await fetch(`${basePath}/api/contribution-review/${reviewId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          mediaId,
          durationDays,
          reason: reason.trim()
        })
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'review_decision_failed')
      setData(result)
      if (action === 'approve' || action === 'reject') setReason('')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'review_decision_failed')
    } finally {
      setActing(null)
    }
  }

  const pending = data?.media.filter((media) => media.status === 'pending').length || 0

  return (
    <main className="media-review">
      <header className="media-review__header">
        <p className="media-review__kicker">দেশি স্টার্টআপ · রক্ষণাবেক্ষণ</p>
        <h1>প্রস্তাবিত ছবি যাচাই</h1>
        <p>
          লেখার অনুমোদন আর ছবির অনুমোদন আলাদা। গোপন তথ্য, অধিকার, প্রাসঙ্গিকতা,
          বিকল্প বর্ণনা এবং সোর্স দেখে প্রতিটি ছবিতে আলাদা সিদ্ধান্ত নিন।
        </p>
      </header>

      {!auth && (
        <section className="media-review__state">
          <h2>রিভিউয়ার হিসেবে সাইন ইন করুন</h2>
          <p>শুধু অনুমোদিত Google অ্যাকাউন্ট এই ব্যক্তিগত ছবিগুলো দেখতে পারবে।</p>
          <button className="edit-btn is-primary" type="button" onClick={() => setAuthOpen(true)}>
            Google দিয়ে সাইন ইন করুন
          </button>
        </section>
      )}

      {loading && <p className="media-review__state">রিভিউ আনা হচ্ছে…</p>}

      {error && (
        <div className="media-review__error" role="alert">
          <strong>
            {error === 'reviewer_required'
              ? 'এই Google অ্যাকাউন্টটি রিভিউয়ার তালিকায় নেই।'
              : error === 'review_expired'
                ? 'এই রিভিউয়ের মেয়াদ শেষ হয়েছে।'
                : error === 'image_expired'
                  ? 'ছবিটির ৭ দিনের মেয়াদ শেষ হয়েছে। অনুমোদন করা যাবে না, তবে প্রত্যাখ্যান করে PR থেকে সরানো যাবে।'
                  : error === 'stale_review'
                    ? 'এর পর আরেকটি এডিট জমা হয়েছে। নতুন PR রিভিউ লিংকটি খুলুন।'
                    : 'সিদ্ধান্তটি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।'}
          </strong>
        </div>
      )}

      {data && (
        <>
          <section className="media-review__summary">
            <div>
              <span>পাতা</span>
              <strong>{data.pageTitle}</strong>
              <code>{data.pagePath}</code>
            </div>
            <div>
              <span>অবদানকারী</span>
              <strong>{data.ownerName}</strong>
            </div>
            <div>
              <span>বাকি সিদ্ধান্ত</span>
              <strong>{pending}টি</strong>
            </div>
            {data.prUrl && (
              <a href={data.prUrl} target="_blank" rel="noopener noreferrer">
                পুল রিকোয়েস্ট দেখুন
              </a>
            )}
          </section>

          <section className="media-review__checklist" aria-label="Reviewer checklist">
            <strong>অনুমোদনের আগে দেখুন</strong>
            <ul>
              <li>ছবিটি গাইডের কোনো ধাপ সত্যিই পরিষ্কার করছে</li>
              <li>ফোন, ইমেইল, NID, টোকেন বা অন্য ব্যক্তিগত তথ্য নেই</li>
              <li>ছবিটি ব্যবহারের অধিকার ও প্রয়োজনীয় ক্রেডিট পরিষ্কার</li>
              <li>বিকল্প বর্ণনা ছবিটি না দেখেও বোঝা যায়</li>
              <li>পুরোনো UI হলে যাচাইয়ের তারিখ দেওয়া আছে</li>
            </ul>
          </section>

          <section className="media-review__images">
            {data.media.map((media, index) => (
              <article className="media-review-item" key={media.id}>
                <div className="media-review-item__image">
                  {previews[media.id] ? (
                    <img src={previews[media.id]} alt={media.alt} />
                  ) : media.status === 'pending' ? (
                    <span>প্রিভিউ পাওয়া যায়নি</span>
                  ) : (
                    <span>
                      {media.status === 'approved'
                        ? 'অনুমোদিত'
                        : media.status === 'rejected'
                          ? 'প্রত্যাখ্যাত'
                          : 'মেয়াদ শেষ'}
                    </span>
                  )}
                </div>
                <div className="media-review-item__body">
                  <div className="media-review-item__title">
                    <h2>ছবি {index + 1}</h2>
                    <span className={`media-review-status is-${media.status}`}>
                      {media.status === 'pending'
                        ? 'সিদ্ধান্ত বাকি'
                        : media.status === 'approved'
                          ? 'অনুমোদিত'
                          : media.status === 'rejected'
                            ? 'প্রত্যাখ্যাত'
                            : 'মেয়াদ শেষ'}
                    </span>
                  </div>
                  <dl>
                    <div>
                      <dt>বিকল্প বর্ণনা</dt>
                      <dd>{media.alt}</dd>
                    </div>
                    {media.source && (
                      <div>
                        <dt>সোর্স</dt>
                        <dd>{media.source}</dd>
                      </div>
                    )}
                    {media.credit && (
                      <div>
                        <dt>ক্রেডিট</dt>
                        <dd>{media.credit}</dd>
                      </div>
                    )}
                    {media.checked && (
                      <div>
                        <dt>যাচাই</dt>
                        <dd>{media.checked}</dd>
                      </div>
                    )}
                    <div>
                      <dt>ফাইল</dt>
                      <dd>
                        {media.w} × {media.h} · {Math.ceil(media.bytes / 1024)} KB
                      </dd>
                    </div>
                  </dl>

                  {media.status === 'pending' && (
                    <div className="media-review-item__actions">
                      <button
                        type="button"
                        className="edit-btn is-primary"
                        disabled={Boolean(acting)}
                        onClick={() => act('approve', media.id)}
                      >
                        {acting === `approve:${media.id}` ? 'অনুমোদন হচ্ছে…' : 'অনুমোদন করুন'}
                      </button>
                      <button
                        type="button"
                        className="edit-btn"
                        disabled={Boolean(acting)}
                        onClick={() => act('reject', media.id)}
                      >
                        {acting === `reject:${media.id}` ? 'সরানো হচ্ছে…' : 'প্রত্যাখ্যান করুন'}
                      </button>
                    </div>
                  )}
                  {media.publicPath && <code>{media.publicPath}</code>}
                </div>
              </article>
            ))}
          </section>

          <section className="media-review__moderation">
            <div>
              <h2>অ্যাকাউন্ট নিয়ন্ত্রণ</h2>
              <p>
                বর্তমান অবস্থা: <strong>{data.moderation.status}</strong>
                {data.moderation.until ? ` · ${data.moderation.until.slice(0, 10)} পর্যন্ত` : ''}
              </p>
            </div>
            <label htmlFor="moderation-reason">
              কারণ / রিভিউ নোট
              <input
                id="moderation-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value.slice(0, 200))}
                maxLength={200}
                placeholder="যেমন: ব্যক্তিগত তথ্যসহ বারবার স্ক্রিনশট"
              />
            </label>
            <div className="media-review__moderation-actions">
              <button type="button" className="edit-btn" onClick={() => act('mute', undefined, 7)}>
                ৭ দিন মিউট
              </button>
              <button type="button" className="edit-btn" onClick={() => act('mute', undefined, 30)}>
                ৩০ দিন মিউট
              </button>
              <button type="button" className="edit-btn" onClick={() => act('ban')}>
                ব্যান করুন
              </button>
              {data.moderation.status !== 'active' && (
                <button type="button" className="edit-btn" onClick={() => act('unmute')}>
                  নিয়ন্ত্রণ তুলে নিন
                </button>
              )}
            </div>
          </section>
        </>
      )}

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(user, token) => setAuth({ user, token })}
        isEn={false}
      />
    </main>
  )
}
