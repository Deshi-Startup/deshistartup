'use client'

import { useEffect, useRef, useState } from 'react'
import { Crepe } from '@milkdown/crepe'
import '@milkdown/crepe/theme/classic.css'
import { REPO_URL } from '../nav.config'

/**
 * Inline WYSIWYG editor for a single content page. Loads the page's MDX
 * (minus frontmatter) into a Milkdown/Crepe editor that reuses the site's
 * typography, lets the contributor edit, then submits a pull request via
 * /api/contribute. The contributor never sees GitHub.
 *
 * Locked MDX components (<StubNotice/>, <SectionIndex/>, …) are fenced as
 * ```mdx code blocks so they survive the markdown round-trip unchanged.
 */

// Self-closing JSX component tags (capitalized) become fenced code blocks.
function encodeMdx(body) {
  return body.replace(/<([A-Z][\w]*)\b[^>]*?\/>/g, (match) => '```mdx\n' + match + '\n```')
}

function decodeMdx(md) {
  return md.replace(/```mdx\n([\s\S]*?)\n```/g, (_m, inner) => inner.trim())
}

function repoFileFor(pathname) {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const rest = pathname === '/en' ? '' : pathname.slice(3)
    return `app/(contents)/en${rest}/page.mdx`
  }
  return `app/(contents)/(bn)${pathname === '/' ? '' : pathname}/page.mdx`
}

const t = (isEn, bn, en) => (isEn ? en : bn)

export default function ContributionEditor({ open, onClose, pathname, isEn, session, authToken }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const containerRef = useRef(null)
  const crepeRef = useRef(null)

  // Load page content when the editor opens.
  useEffect(() => {
    if (!open) {
      setData(null)
      setResult(null)
      setError(null)
      setSummary('')
      return
    }
    let active = true
    setLoading(true)
    setError(null)
    setResult(null)
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    fetch(`${basePath}/api/content?path=${encodeURIComponent(pathname)}`, {
      headers: { Authorization: `Bearer ${authToken || ''}` }
    })
      .then(async (res) => {
        const j = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(j.error || 'fetch_failed')
        return j
      })
      .then((d) => {
        if (active) setData(d)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [open, pathname])

  // Initialize the Milkdown/Crepe editor once content is loaded.
  useEffect(() => {
    if (!data || !containerRef.current) return
    let destroyed = false
    const initialValue = encodeMdx(data.content)

    const crepe = new Crepe({
      root: containerRef.current,
      defaultValue: initialValue,
      features: {
        [Crepe.Feature.AI]: false,
        [Crepe.Feature.Latex]: false,
        [Crepe.Feature.ImageBlock]: false
      },
      featureConfigs: {
        [Crepe.Feature.Placeholder]: {
          text: t(isEn, 'এখানে লিখুন…', 'Write here…'),
          mode: 'doc'
        }
      }
    })

    crepe.on((api) => {
      api.markdownUpdated((_ctx, markdown) => {
        // Keep the latest markdown available for submit; cheap state update.
        crepeRef.__markdown = markdown
      })
    })

    crepe
      .create()
      .then(() => {
        if (destroyed) {
          crepe.destroy()
          return
        }
        crepeRef.current = crepe
        crepeRef.__markdown = initialValue
      })
      .catch((err) => {
        console.error('[ContributionEditor] Crepe init failed:', err)
        if (!destroyed) setError('editor_init_failed')
      })

    return () => {
      destroyed = true
      try {
        crepe.destroy()
      } catch {
        /* ignore */
      }
      crepeRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  async function handleSubmit() {
    if (!data) return
    setSubmitting(true)
    setError(null)
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    let body
    try {
      const md = crepeRef.current ? crepeRef.current.getMarkdown() : crepeRef.__markdown
      body = decodeMdx(md || '')
    } catch {
      body = decodeMdx(crepeRef.__markdown || '')
    }
    const fullContent = data.frontmatterRaw + '\n' + body
    try {
      const res = await fetch(`${basePath}/api/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken || ''}`
        },
        body: JSON.stringify({ path: pathname, content: fullContent, summary })
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || 'submit_failed')
      setResult(j)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const ghEditUrl = `${REPO_URL}/edit/main/${repoFileFor(pathname)}`

  return (
    <div
      className="modal-overlay editor-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t(isEn, 'পাতা সম্পাদনা', 'Edit page')}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose?.()
      }}
    >
      <div className="modal-card editor-card">
        <div className="editor-topbar">
          <strong>{t(isEn, 'ইনলাইন এডিটর', 'Inline editor')}</strong>
          {session?.name && <span className="editor-user">{session.name}</span>}
          <button
            className="modal-close"
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={submitting}
          >
            ×
          </button>
        </div>

        {loading && (
          <div className="editor-loading">
            <p>{t(isEn, 'পাতার লেখা লোড হচ্ছে…', 'Loading page content…')}</p>
          </div>
        )}

        {error && !loading && (
          <div className="editor-error-state">
            {error === 'unauthorized' ? (
              <p>
                {t(
                  isEn,
                  'আপনার সাইন-ইন মেয়াদ শেষ হয়ে গেছে। বন্ধ করে আবার “সম্পাদনা” চেপে নতুন করে সাইন ইন করুন।',
                  'Your sign-in has expired. Close this and click "Edit" again to sign back in.'
                )}
              </p>
            ) : error === 'not_contributable' || error === 'fetch_failed' ? (
              <>
                <p>
                  {t(
                    isEn,
                    'এই পাতাটি এখনই ইনলাইন এডিটরে সম্পাদনা করা যাচ্ছে না। GitHub-এ সরাসরি সম্পাদনা করুন।',
                    'This page cannot be edited in the inline editor yet. Edit directly on GitHub.'
                  )}
                </p>
                <a className="btn-secondary" href={ghEditUrl} target="_blank" rel="noopener noreferrer">
                  {t(isEn, 'GitHub-এ সম্পাদনা', 'Edit on GitHub')}
                </a>
              </>
            ) : (
              <p>
                {t(isEn, 'সমস্যা হয়েছে: ', 'Something went wrong: ')}
                <code>{error}</code>
              </p>
            )}
            <button className="btn-secondary" type="button" onClick={onClose}>
              {t(isEn, 'বন্ধ করুন', 'Close')}
            </button>
          </div>
        )}

        {result && (
          <div className="editor-success">
            <h2>✓ {t(isEn, 'অবদান জমা পড়েছে', 'Your contribution is submitted')}</h2>
            <p>
              {t(
                isEn,
                'আপনার পরিবর্তন একটি পুল রিকোয়েস্ট হিসেবে জমা পড়েছে। একজন রিভিউয়ার দেখে অনুমোদন করলে তা সাইটে যুক্ত হবে।',
                'Your edit was submitted as a pull request. Once a reviewer approves it, it goes live.'
              )}
            </p>
            <a className="btn-primary" href={result.prUrl} target="_blank" rel="noopener noreferrer">
              {t(isEn, 'পুল রিকোয়েস্ট দেখুন', 'View pull request')} →
            </a>
            <button className="btn-secondary" type="button" onClick={onClose}>
              {t(isEn, 'বন্ধ করুন', 'Close')}
            </button>
          </div>
        )}

        {!loading && !error && !result && data && (
          <>
            <div className="editor-frontmatter">
              <p className="fm-label">{t(isEn, 'শিরোনাম (সম্পাদনাযোগ্য নয়)', 'Title (not editable)')}</p>
              <p className="fm-title">{data.frontmatter.title || data.title}</p>
              {data.frontmatter.description && (
                <>
                  <p className="fm-label">{t(isEn, 'বিবরণ', 'Description')}</p>
                  <p className="fm-desc">{data.frontmatter.description}</p>
                </>
              )}
              {data.frontmatter.verified && (
                <p className="fm-verified">
                  {t(isEn, 'যাচাই: ', 'Verified: ')}
                  {data.frontmatter.verified}
                </p>
              )}
            </div>

            <div className="editor-surface article" ref={containerRef} />

            <div className="editor-footer">
              <label className="editor-summary-label" htmlFor="contrib-summary">
                {t(isEn, 'আপনার পরিবর্তনের সারসংক্ষেপ', 'Summary of your change')}
              </label>
              <textarea
                id="contrib-summary"
                className="editor-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder={t(
                  isEn,
                  'যেমন: “ফি আপডেট করেছি (২০২৬ সালের হিসাবে)”',
                  'e.g. "Updated fee (as of 2026)"'
                )}
                rows={2}
                maxLength={1000}
              />
              <div className="editor-actions">
                <button className="btn-secondary" type="button" onClick={onClose} disabled={submitting}>
                  {t(isEn, 'বাতিল', 'Cancel')}
                </button>
                <button className="btn-primary" type="button" onClick={handleSubmit} disabled={submitting}>
                  {submitting
                    ? t(isEn, 'জমা হচ্ছে…', 'Submitting…')
                    : t(isEn, 'অবদান জমা দিন', 'Submit contribution')}
                </button>
              </div>
              <p className="editor-note">
                {t(
                  isEn,
                  'জমা দিলে একটি পুল রিকোয়েস্ট তৈরি হবে। রিভিউ হওয়ার পর পরিবর্তন সাইটে আসবে।',
                  'Submitting opens a pull request. Your change goes live after review.'
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
