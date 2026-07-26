'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Crepe } from '@milkdown/crepe'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/classic.css'
import { remarkPluginsCtx, remarkStringifyOptionsCtx } from '@milkdown/kit/core'
import { REPO_URL } from '../nav.config'
import { UserInfo } from '../lib/client-auth'

/**
 * DIRECTION CONTRACT
 *
 * THESIS: the page does not open an editor, the page becomes editable. Refuses
 *   the CMS default (a lightbox editor floating over a dimmed copy of the page)
 *   in favour of the wiki move: same canvas, same column, same type, now typed in.
 * OWN-WORLD: the incumbent shell, unchanged. Warm paper, bordered white canvas,
 *   hairline rules, serif Bangla headings, green as structure and blue as links.
 *   Edit mode adds exactly two objects and no new colour, both on the cool-paper
 *   panel neutral: a bar ruled at the bottom that pins under the header, and a
 *   publish panel ruled at the top that closes the canvas.
 * STORY: a founder spots a wrong fee, presses সম্পাদনা, and the paragraph they
 *   were reading is suddenly under their cursor in the same place on the page.
 *   They fix it, say what they changed, and submit. A reviewer takes it from there.
 * FIRST VIEWPORT: tab strip, then the edit bar (what you are editing on the left,
 *   state and বাতিল / জমা দিন on the right), then the article text at the exact
 *   x-position and size it had a second ago.
 * FORM: extension of an established surface. No new visual world, no DESIGN.md change.
 *
 * Mechanically: loads the page's MDX (minus frontmatter) into a Milkdown/Crepe
 * editor and submits a pull request via /api/contribute. The contributor never
 * sees GitHub. Locked MDX components (<StubNotice/>, <SectionIndex/>, …) are
 * fenced as ```mdx code blocks so they survive the markdown round-trip unchanged.
 */

// Self-closing JSX component tags (capitalized) become fenced code blocks.
function encodeMdx(body: string): string {
  return body.replace(/<([A-Z][\w]*)\b[^>]*?\/>/g, (match) => '```mdx\n' + match + '\n```')
}

function decodeMdx(md: string): string {
  return md.replace(/```mdx\n([\s\S]*?)\n```/g, (_m, inner) => inner.trim())
}

// Custom remark plugin to force list and list-items to be tight (spread: false)
// so that empty lines are not added between list items during serialization.
function remarkTightLists() {
  return (tree: any) => {
    const visit = (node: any) => {
      if (node.type === 'list' || node.type === 'listItem') {
        node.spread = false
      }
      if (node.children) {
        node.children.forEach(visit)
      }
    }
    visit(tree)
  }
}

function repoFileFor(pathname: string): string {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const rest = pathname === '/en' ? '' : pathname.slice(3)
    return `app/(contents)/en${rest}/page.mdx`
  }
  return `app/(contents)/(bn)${pathname === '/' ? '' : pathname}/page.mdx`
}

const t = (isEn: boolean, bn: string, en: string) => (isEn ? en : bn)

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="edit-pencil">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

export interface SubmitResult {
  prUrl: string
  updated?: boolean
}

interface ContributionEditorProps {
  pathname: string
  isEn?: boolean
  /** The rendered page's own h1, so the bar can name the page before the fetch lands. */
  fallbackTitle?: string
  session: UserInfo | null
  authToken: string | null
  /** Bumped by the shell when something outside the editor asks to leave (back button). */
  exitSignal: number
  onExit: () => void
  onSubmitted: (result: SubmitResult) => void
  onSessionExpired: () => void
  onReadyChange: (ready: boolean) => void
  onDirtyChange: (dirty: boolean) => void
}

interface PageData {
  content: string
  frontmatterRaw: string
  frontmatter: {
    title?: string
    description?: string
    verified?: string
  }
  title: string
  locale: string
  stub: boolean
  existingPR?: {
    url: string
  }
}

export default function ContributionEditor({
  pathname,
  isEn = false,
  fallbackTitle = '',
  session,
  authToken,
  exitSignal,
  onExit,
  onSubmitted,
  onSessionExpired,
  onReadyChange,
  onDirtyChange
}: ContributionEditorProps) {
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [summary, setSummary] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [ready, setReady] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [confirmingExit, setConfirmingExit] = useState(false)
  // Frozen at mount. The shell drops the stored token the moment the server
  // rejects it, and re-reading that prop here would just fire the same doomed
  // request a second time.
  const [sessionToken] = useState(authToken)
  const containerRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLTextAreaElement>(null)
  const crepeRef = useRef<Crepe | null>(null)
  const markdownRef = useRef<string>('')
  const baselineRef = useRef<string | null>(null)
  const dirtyRef = useRef(false)

  /**
   * Locked MDX components ride through the round-trip as fenced ```mdx blocks,
   * and Crepe renders those through CodeMirror, which keeps the language in a
   * button's label and nowhere a selector can reach. So flag them here and let
   * the stylesheet dress the flag. `textContent` rather than `innerText`: the
   * canvas is still display:none on the first pass, and innerText is layout-bound.
   */
  const markLocked = useCallback(() => {
    const root = containerRef.current
    if (!root) return
    root.querySelectorAll('.milkdown-code-block').forEach((block) => {
      // A block starts life as a <pre> placeholder and upgrades to CodeMirror
      // when it scrolls into view; read whichever one is currently there.
      const source =
        block.querySelector('.cm-content') ||
        block.querySelector('.milkdown-code-block-placeholder code') ||
        block
      const text = (source.textContent || '').trim()
      block.toggleAttribute('data-locked', /^<[A-Z][\w]*\b[\s\S]*\/>$/.test(text))
    })
  }, [])

  // Load the page source. Until it lands the shell keeps the rendered article
  // on screen, so the reader never loses their place.
  useEffect(() => {
    let active = true
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    fetch(`${basePath}/api/content?path=${encodeURIComponent(pathname)}`, {
      headers: { Authorization: `Bearer ${sessionToken || ''}` }
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
        if (!active) return
        setError(err.message)
        // The server is the authority on whether a token is still good. If it
        // says no, drop it, so pressing সম্পাদনা again offers a fresh sign-in
        // instead of failing the same way a second time.
        if (err.message === 'unauthorized') onSessionExpired()
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

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
        },
        // Crepe's drag handle needs a 120px writing gutter, which would push every
        // line of the article sideways the moment you pressed edit – and on a phone
        // it would eat two thirds of the column. The slash menu and the selection
        // toolbar, which is what a contributor actually reaches for, stay.
        [Crepe.Feature.BlockEdit]: {
          blockHandle: { shouldShow: () => false }
        }
      }
    })

    // Customize Markdown serializer options to keep bullet list format consistent
    crepe.editor.config((ctx) => {
      ctx.update(remarkStringifyOptionsCtx, (prev) => ({
        ...prev,
        bullet: '-' as const
      }))
      ctx.update(remarkPluginsCtx, (prev) => [...prev, remarkTightLists as any])
    })

    let markFrame = 0
    const scheduleMark = () => {
      cancelAnimationFrame(markFrame)
      markFrame = requestAnimationFrame(markLocked)
    }

    crepe.on((api) => {
      api.markdownUpdated((_ctx, markdown) => {
        markdownRef.current = markdown
        scheduleMark()
        // Compare against what the editor itself serialized on load, not the raw
        // file: Crepe normalizes whitespace, and that alone is not an edit.
        if (baselineRef.current === null) return
        const next = markdown !== baselineRef.current
        if (next !== dirtyRef.current) {
          dirtyRef.current = next
          setDirty(next)
        }
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
        baselineRef.current = crepe.getMarkdown()
        markdownRef.current = baselineRef.current
        setReady(true)
        scheduleMark()
      })
      .catch((err) => {
        console.error('[ContributionEditor] Crepe init failed:', err)
        if (!destroyed) setError('editor_init_failed')
      })

    return () => {
      destroyed = true
      cancelAnimationFrame(markFrame)
      try {
        crepe.destroy()
      } catch {
        /* ignore */
      }
      crepeRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  // Once the canvas is actually laid out, re-flag: the first pass runs while it
  // is still hidden and a code block may not have rendered yet.
  useEffect(() => {
    if (ready) markLocked()
  }, [ready, markLocked])

  useEffect(() => onReadyChange(ready), [ready, onReadyChange])
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange])

  // The shell asks to leave (browser back). Never drop work silently.
  useEffect(() => {
    if (exitSignal > 0) setConfirmingExit(true)
  }, [exitSignal])

  // Ctrl/Cmd+S is muscle memory in any editor. Send it to the summary field.
  useEffect(() => {
    if (!ready) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key !== 's') return
      event.preventDefault()
      summaryRef.current?.scrollIntoView({ block: 'center' })
      summaryRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [ready])

  function requestExit() {
    if (dirty) setConfirmingExit(true)
    else onExit()
  }

  async function handleSubmit() {
    if (!data || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    let body
    try {
      const md = crepeRef.current ? crepeRef.current.getMarkdown() : markdownRef.current
      body = decodeMdx(md || '')
    } catch {
      body = decodeMdx(markdownRef.current || '')
    }
    const fullContent = data.frontmatterRaw + '\n' + body
    try {
      const res = await fetch(`${basePath}/api/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken || ''}`
        },
        body: JSON.stringify({ path: pathname, content: fullContent, summary })
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.detail || j.error || 'submit_failed')
      dirtyRef.current = false
      setDirty(false)
      onSubmitted(j)
    } catch (err: any) {
      setSubmitError(err.message)
      setSubmitting(false)
    }
  }

  const ghEditUrl = `${REPO_URL}/edit/main/${repoFileFor(pathname)}`
  const pageTitle = data?.frontmatter.title || data?.title || fallbackTitle

  let status = ''
  if (submitting) status = t(isEn, 'জমা দেওয়া হচ্ছে…', 'Submitting…')
  else if (loading) status = t(isEn, 'লেখা আনা হচ্ছে…', 'Loading the page…')
  else if (dirty) status = t(isEn, 'অসংরক্ষিত পরিবর্তন আছে', 'Unsaved changes')

  return (
    <div className="edit-mode">
      <div className="edit-bar">
        <p className="edit-bar__what">
          <PencilIcon />
          <span>{t(isEn, 'সম্পাদনা করছেন', 'Editing')}</span>
          {pageTitle && <strong title={pageTitle}>{pageTitle}</strong>}
        </p>

        <p className="edit-bar__status" role="status">
          {status}
        </p>

        <div className="edit-bar__actions">
          {confirmingExit ? (
            <>
              <span className="edit-bar__warn">
                {t(isEn, 'আপনার লেখা মুছে যাবে।', 'Your edit will be lost.')}
              </span>
              <button type="button" className="edit-btn" onClick={() => setConfirmingExit(false)}>
                {t(isEn, 'সম্পাদনায় ফিরুন', 'Keep editing')}
              </button>
              <button type="button" className="edit-btn" onClick={onExit}>
                {t(isEn, 'হ্যাঁ, বাদ দিন', 'Discard')}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="edit-btn" onClick={requestExit} disabled={submitting}>
                {error ? t(isEn, 'পড়ায় ফিরুন', 'Back to reading') : t(isEn, 'বাতিল', 'Cancel')}
              </button>
              {!error && (
                <button
                  type="button"
                  className="edit-btn is-primary"
                  onClick={handleSubmit}
                  disabled={!ready || !dirty || submitting}
                  title={
                    ready && !dirty
                      ? t(isEn, 'এখনো কিছু বদলাননি।', 'Nothing has changed yet.')
                      : undefined
                  }
                >
                  {t(isEn, 'জমা দিন', 'Submit')}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="edit-state">
          {error === 'unauthorized' ? (
            <>
              <strong>{t(isEn, 'সাইন-ইনের মেয়াদ শেষ', 'Your sign-in expired')}</strong>
              <p>
                {t(
                  isEn,
                  'আপনার সাইন-ইনের মেয়াদ শেষ হয়ে গেছে। পড়ায় ফিরে গিয়ে আবার “সম্পাদনা” চাপুন, তাহলে নতুন করে সাইন ইন করতে পারবেন।',
                  'Your sign-in has expired. Go back to reading and press “Edit” again to sign back in.'
                )}
              </p>
            </>
          ) : error === 'not_contributable' ? (
            <>
              <strong>{t(isEn, 'এই পাতা এখানে সম্পাদনা করা যাচ্ছে না', 'This page cannot be edited here')}</strong>
              <p>
                {t(
                  isEn,
                  'পাতাটা এখনো ইনলাইন এডিটরের তালিকায় আসেনি। GitHub-এ গিয়ে সরাসরি সম্পাদনা করতে পারেন, কাজটা একইভাবে রিভিউ হবে।',
                  'This page is not in the inline editor’s list yet. You can edit it directly on GitHub instead; it goes through the same review.'
                )}
              </p>
            </>
          ) : (
            <>
              <strong>{t(isEn, 'লেখা আনা যায়নি', 'The page could not be loaded')}</strong>
              <p>
                {t(
                  isEn,
                  'পাতার লেখা আনতে গিয়ে সমস্যা হয়েছে। ইন্টারনেট ঠিক থাকলে একটু পরে আবার চেষ্টা করুন, বা GitHub-এ সরাসরি সম্পাদনা করুন।',
                  'Something went wrong while fetching the page. Try again in a moment, or edit it directly on GitHub.'
                )}
              </p>
              <p className="edit-state__code">
                <code>{error}</code>
              </p>
            </>
          )}
          <div className="edit-state__actions">
            <a className="edit-btn" href={ghEditUrl} target="_blank" rel="noopener noreferrer">
              {t(isEn, 'GitHub-এ সম্পাদনা করুন', 'Edit on GitHub')}
            </a>
            <button type="button" className="edit-btn" onClick={onExit}>
              {t(isEn, 'পড়ায় ফিরুন', 'Back to reading')}
            </button>
          </div>
        </div>
      )}

      {data?.existingPR && !error && (
        <aside className="edit-draft-notice" role="note">
          <strong>{t(isEn, 'আপনি আপনার নিজের ড্রাফট সম্পাদনা করছেন', 'You are editing your own draft')}</strong>
          <p>
            {t(
              isEn,
              'এই পাতায় আপনার একটা পুল রিকোয়েস্ট এখনো রিভিউয়ের অপেক্ষায় আছে। নিচে সেটার সর্বশেষ লেখাই দেখছেন, আর জমা দিলে সেটাই হালনাগাদ হবে।',
              'You already have a pull request waiting for review on this page. What you see below is that draft, and submitting updates it.'
            )}{' '}
            <a href={data.existingPR.url} target="_blank" rel="noopener noreferrer">
              {t(isEn, 'পুল রিকোয়েস্টটি দেখুন', 'View the pull request')}
            </a>
          </p>
        </aside>
      )}

      {data && !error && (
        <>
          <div
            className={ready ? 'article edit-live' : 'article edit-live is-mounting'}
            ref={containerRef}
          />

          <div className="edit-publish">
            <label className="edit-publish__label" htmlFor="contrib-summary">
              {t(isEn, 'কী বদলালেন, এক লাইনে লিখুন', 'Say what you changed, in one line')}
            </label>
            <p className="edit-publish__hint">
              {t(
                isEn,
                'রিভিউয়ার এই লাইনটাই সবার আগে পড়েন। যেমন: “২০২৬ সালের নতুন ফি বসিয়েছি”।',
                'Reviewers read this line first. For example: “Updated the fee to the 2026 figure”.'
              )}
            </p>
            <textarea
              id="contrib-summary"
              className="edit-publish__summary"
              ref={summaryRef}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={t(isEn, 'যেমন: ভুল ফোন নম্বর ঠিক করেছি', 'e.g. Fixed the wrong phone number')}
              rows={2}
              maxLength={1000}
              disabled={submitting}
            />

            {submitError && (
              <p className="edit-publish__error" role="alert">
                {t(
                  isEn,
                  'জমা দেওয়া যায়নি। একটু পরে আবার চেষ্টা করুন। আপনার লেখা এই পাতাতেই আছে, হারায়নি।',
                  'The submission failed. Try again in a moment; your text is still here.'
                )}{' '}
                <code>{submitError}</code>
              </p>
            )}

            <div className="edit-publish__foot">
              <p className="edit-publish__by">
                {session?.name
                  ? t(
                      isEn,
                      `আপনি ${session.name} হিসেবে জমা দিচ্ছেন। জমা দিলে একটা পুল রিকোয়েস্ট তৈরি হবে, আর রিভিউ হওয়ার পর পরিবর্তনটা সাইটে আসবে।`,
                      `Submitting as ${session.name}. This opens a pull request, and your change goes live once a reviewer approves it.`
                    )
                  : t(
                      isEn,
                      'জমা দিলে একটা পুল রিকোয়েস্ট তৈরি হবে, আর রিভিউ হওয়ার পর পরিবর্তনটা সাইটে আসবে।',
                      'Submitting opens a pull request, and your change goes live once a reviewer approves it.'
                    )}
              </p>
              <div className="edit-publish__actions">
                <button type="button" className="edit-btn" onClick={requestExit} disabled={submitting}>
                  {t(isEn, 'বাতিল', 'Cancel')}
                </button>
                <button
                  type="button"
                  className="edit-btn is-primary"
                  onClick={handleSubmit}
                  disabled={!ready || !dirty || submitting}
                >
                  {submitting
                    ? t(isEn, 'জমা দেওয়া হচ্ছে…', 'Submitting…')
                    : t(isEn, 'জমা দিন', 'Submit')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
