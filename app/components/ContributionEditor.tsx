'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Crepe } from '@milkdown/crepe'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/classic.css'
import { remarkPluginsCtx, remarkStringifyOptionsCtx } from '@milkdown/kit/core'
import { insert, replaceAll } from '@milkdown/kit/utils'
import { REPO_URL } from '../nav.config'
import { UserInfo } from '../lib/client-auth'
import {
  decodeLockedMdx,
  encodeLockedMdx,
  lockedMdxBlocks,
  normalizeContributionMarkdown,
  sameLockedMdx
} from '../lib/contribution-markdown'
import {
  decodeEditableVideos,
  editableVideoError,
  encodeEditableVideos
} from '../lib/contribution-video'
import {
  contributionVideoPlugins,
  installContributionVideoPaste
} from '../lib/contribution-video-editor'
import {
  ContributionDraft,
  clearDraft,
  loadDraft,
  pruneDrafts,
  saveDraft
} from '../lib/contribution-draft'
import {
  ContributionMediaInput,
  MAX_CONTRIBUTION_IMAGE_BYTES,
  MAX_IMAGES_PER_CONTRIBUTION,
  extractPendingMediaIds,
  rejectPendingMediaInMarkdown
} from '../lib/contribution-media'
import { diffLines, DiffLine } from '../lib/diff'
import DiffModal from './DiffModal'

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
 * fenced as internal code blocks so they survive the markdown round-trip unchanged.
 */

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

/**
 * Everything the editor hands back goes through here, so the baseline, the
 * draft and the submitted body are all measured in the same shape.
 */
function readMarkdown(crepe: Crepe | null | undefined): string {
  const markdown = crepe?.getMarkdown()
  return typeof markdown === 'string' ? normalizeContributionMarkdown(markdown) : ''
}

function repoFileFor(pathname: string): string {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const rest = pathname === '/en' ? '' : pathname.slice(3)
    return `app/(contents)/en${rest}/page.mdx`
  }
  return `app/(contents)/(bn)${pathname === '/' ? '' : pathname}/page.mdx`
}

const t = (isEn: boolean, bn: string, en: string) => (isEn ? en : bn)

/** Date and time of a saved draft, in the reader's own numerals. */
function formatSavedAt(savedAt: number, isEn: boolean): string {
  try {
    return new Date(savedAt).toLocaleString(isEn ? 'en-GB' : 'bn-BD', {
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="edit-pencil">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="edit-image-icon">
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <circle cx="9" cy="10" r="2" />
      <path d="m4 18 5-5 3 3 2-2 6 5" />
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
  onReauthenticate: () => void
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
  pendingMedia?: PendingMedia[]
}

interface PendingMedia extends ContributionMediaInput {
  name?: string
  bytes?: number
  w?: number
  h?: number
  expiresAt?: string
  status?: 'quarantined' | 'pending_review' | 'expired'
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
  onReauthenticate,
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
  const [draft, setDraft] = useState<ContributionDraft | null>(null)
  const [draftApplied, setDraftApplied] = useState(false)
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const summaryRef = useRef<HTMLTextAreaElement>(null)
  const crepeRef = useRef<Crepe | null>(null)
  const markdownRef = useRef<string>('')
  const baselineRef = useRef<string | null>(null)
  const dirtyRef = useRef(false)
  const lockedBlocksRef = useRef<string[]>([])
  const seenExitSignalRef = useRef(exitSignal)
  const saveTimerRef = useRef(0)
  const pendingMediaRef = useRef<PendingMedia[]>([])
  const previewUrlsRef = useRef<Record<string, string>>({})
  const [diffOpen, setDiffOpen] = useState(false)
  const [calculatedDiff, setCalculatedDiff] = useState<DiffLine[]>([])


  const updatePendingMedia = useCallback(
    (updater: PendingMedia[] | ((current: PendingMedia[]) => PendingMedia[])) => {
      setPendingMedia((current) => {
        const next = typeof updater === 'function' ? updater(current) : updater
        pendingMediaRef.current = next
        return next
      })
    },
    []
  )

  const handleShowDiff = useCallback(() => {
    let editorMarkdown
    try {
      editorMarkdown = crepeRef.current
        ? readMarkdown(crepeRef.current)
        : markdownRef.current
    } catch {
      editorMarkdown = markdownRef.current
    }
    const body = decodeEditableVideos(decodeLockedMdx(editorMarkdown || ''))
    const baseline = data ? decodeEditableVideos(decodeLockedMdx(data.content)) : ''
    const diff = diffLines(baseline.split('\n'), body.split('\n'))
    setCalculatedDiff(diff)
    setDiffOpen(true)
  }, [data])

  const discardDraft = useCallback(() => {
    clearDraft(pathname)
    setDraft(null)
  }, [pathname])

  const rememberPreview = useCallback((id: string, url: string) => {
    const previous = previewUrlsRef.current[id]
    if (previous && previous !== url && previous.startsWith('blob:')) URL.revokeObjectURL(previous)
    const next = { ...previewUrlsRef.current, [id]: url }
    previewUrlsRef.current = next
    setPreviewUrls(next)
  }, [])

  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      setUploadError(null)
      if (!authToken) {
        setUploadError('unauthorized')
        onReauthenticate()
        throw new Error('unauthorized')
      }
      if (pendingMediaRef.current.length >= MAX_IMAGES_PER_CONTRIBUTION) {
        setUploadError('too_many_images')
        throw new Error('too_many_images')
      }
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        setUploadError('unsupported_type')
        throw new Error('unsupported_type')
      }
      if (file.size > MAX_CONTRIBUTION_IMAGE_BYTES) {
        setUploadError('file_too_large')
        throw new Error('file_too_large')
      }

      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      setUploadingImage(true)
      try {
        const response = await fetch(`${basePath}/api/contribution-media`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': file.type,
            'X-File-Name': encodeURIComponent(file.name),
            'X-Page-Path': pathname
          },
          body: file
        })
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(result.error || 'upload_failed')
        const item: PendingMedia = {
          id: result.id,
          alt: '',
          name: result.name,
          bytes: result.bytes,
          w: result.w,
          h: result.h,
          expiresAt: result.expiresAt,
          status: 'quarantined'
        }
        updatePendingMedia((current) => [...current, item])
        rememberPreview(result.id, URL.createObjectURL(file))
        return result.src
      } catch (error) {
        const code = error instanceof Error ? error.message : 'upload_failed'
        setUploadError(code)
        if (code === 'unauthorized') {
          onSessionExpired()
          onReauthenticate()
        }
        throw error
      } finally {
        setUploadingImage(false)
      }
    },
    [
      authToken,
      onReauthenticate,
      onSessionExpired,
      pathname,
      rememberPreview,
      updatePendingMedia
    ]
  )

  const proxyImageUrl = useCallback(
    async (url: string): Promise<string> => {
      const match = url.match(/^\/__pending-media\/([a-f0-9]{32})$/)
      if (!match) return url
      const id = match[1]
      const remembered = previewUrlsRef.current[id]
      if (remembered) return remembered
      if (!authToken) return url
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const response = await fetch(`${basePath}/api/contribution-media/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (!response.ok) throw new Error('media_expired')
      const objectUrl = URL.createObjectURL(await response.blob())
      rememberPreview(id, objectUrl)
      return objectUrl
    },
    [authToken, rememberPreview]
  )

  /**
   * Locked MDX components ride through the round-trip as internal fenced blocks,
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
      const isLocked = lockedBlocksRef.current.includes(text)
      block.toggleAttribute('data-locked', isLocked)
      if (isLocked) {
        block.setAttribute('contenteditable', 'false')
        block.setAttribute('tabindex', '0')
        block.setAttribute(
          'aria-label',
          isEn
            ? 'Protected site component. It cannot be edited here.'
            : 'সাইটের সুরক্ষিত অংশ। এখানে এটি সম্পাদনা করা যাবে না।'
        )
      } else {
        block.removeAttribute('contenteditable')
        block.removeAttribute('tabindex')
        block.removeAttribute('aria-label')
      }
    })
  }, [isEn])

  // Load the page source. Until it lands the shell keeps the rendered article
  // on screen, so the reader never loses their place.
  useEffect(() => {
    if (data || !authToken) return undefined
    let active = true
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    setLoading(true)
    setError(null)
    fetch(`${basePath}/api/content?path=${encodeURIComponent(pathname)}`, {
      headers: { Authorization: `Bearer ${authToken}` }
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
        if (err.message === 'unauthorized') {
          onSessionExpired()
          onReauthenticate()
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, authToken])

  // The branch is the authority for already-submitted images; a restored local
  // draft carries the metadata for images that were uploaded but never sent.
  useEffect(() => {
    if (!data) return
    const restored = draftApplied && draft?.media ? draft.media : data.pendingMedia || []
    updatePendingMedia(restored as PendingMedia[])
  }, [data, draft, draftApplied, updatePendingMedia])

  // A pending image is private, so a normal browser image request cannot load it:
  // fetch it with the Google token and hand the editor/browser a local blob URL.
  useEffect(() => {
    if (!authToken) return
    for (const media of pendingMedia) {
      if (media.status === 'expired' || previewUrlsRef.current[media.id]) continue
      proxyImageUrl(`/__pending-media/${media.id}`).catch(() => {
        updatePendingMedia((current) =>
          current.map((item) =>
            item.id === media.id ? { ...item, status: 'expired' } : item
          )
        )
      })
    }
  }, [authToken, pendingMedia, proxyImageUrl, updatePendingMedia])

  useEffect(
    () => () => {
      for (const url of Object.values(previewUrlsRef.current)) {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      }
    },
    []
  )

  // Initialize the Milkdown/Crepe editor once content is loaded.
  useEffect(() => {
    if (!data || !containerRef.current) return
    let destroyed = false
    let removeVideoPaste: (() => void) | undefined
    const editorRoot = containerRef.current
    // Restoring a draft rebuilds the editor around it. The locked-block list
    // still comes from the server copy, so a draft that lost a <StubNotice/>
    // is caught by the submit guard rather than quietly shipping without it.
    const initialValue =
      draftApplied && draft
        ? draft.body
        : encodeLockedMdx(encodeEditableVideos(data.content))
    lockedBlocksRef.current = lockedMdxBlocks(data.content)

    const crepe = new Crepe({
      root: editorRoot,
      defaultValue: initialValue,
      features: {
        [Crepe.Feature.AI]: false,
        [Crepe.Feature.Latex]: false,
        [Crepe.Feature.ImageBlock]: true
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
        },
        [Crepe.Feature.ImageBlock]: {
          blockUploadButton: t(isEn, 'ছবি বাছুন', 'Choose image'),
          inlineUploadButton: t(isEn, 'ছবি বাছুন', 'Choose image'),
          blockUploadPlaceholderText: t(
            isEn,
            'PNG, JPEG বা WebP ছবি দিন',
            'Choose a PNG, JPEG, or WebP image'
          ),
          blockCaptionPlaceholderText: t(
            isEn,
            'ছবির নিচে ছোট ক্যাপশন লিখুন',
            'Write a short caption under the image'
          ),
          blockConfirmButton: t(isEn, 'ছবি বসান', 'Insert image'),
          inlineConfirmButton: t(isEn, 'ছবি বসান', 'Insert image'),
          onUpload: uploadImage,
          proxyDomURL: proxyImageUrl,
          maxWidth: 1600,
          maxHeight: 6000
        }
      }
    })
    crepe.editor.use(contributionVideoPlugins)

    // Serialize in the shape the repo is already written in, so an untouched
    // page comes back byte-identical and a contributor's diff shows only what
    // they actually changed. Without `rule`, every `---` returns as `***`.
    crepe.editor.config((ctx) => {
      ctx.update(remarkStringifyOptionsCtx, (prev) => ({
        ...prev,
        bullet: '-' as const,
        rule: '-' as const
      }))
      ctx.update(remarkPluginsCtx, (prev) => [...prev, remarkTightLists as any])
    })

    let markFrame = 0
    const scheduleMark = () => {
      cancelAnimationFrame(markFrame)
      markFrame = requestAnimationFrame(markLocked)
    }

    crepe.on((api) => {
      api.markdownUpdated((_ctx, rawMarkdown) => {
        const markdown = normalizeContributionMarkdown(rawMarkdown)
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
        // Keep the crash copy in step with the editor, a beat behind the
        // keystrokes. Back at the server's text there is nothing worth
        // rescuing, so the draft goes rather than lingering as a false alarm.
        window.clearTimeout(saveTimerRef.current)
        saveTimerRef.current = window.setTimeout(() => {
          if (next) saveDraft(pathname, markdown, Date.now(), pendingMediaRef.current)
          else clearDraft(pathname)
        }, 700)
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
        // The baseline is the server's text as this editor serializes it, and
        // it survives a draft restore: otherwise the restored work would
        // measure as unchanged and the submit button would stay disabled.
        if (baselineRef.current === null) baselineRef.current = readMarkdown(crepe)
        markdownRef.current = readMarkdown(crepe)
        removeVideoPaste = installContributionVideoPaste(
          crepe,
          editorRoot,
          isEn ? 'en' : 'bn'
        )
        setReady(true)
        scheduleMark()
      })
      .catch((err) => {
        console.error('[ContributionEditor] Crepe init failed:', err)
        if (!destroyed) setError('editor_init_failed')
      })

    return () => {
      destroyed = true
      removeVideoPaste?.()
      cancelAnimationFrame(markFrame)
      window.clearTimeout(saveTimerRef.current)
      try {
        crepe.destroy()
      } catch {
        /* ignore */
      }
      crepeRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, draftApplied])

  // Once the canvas is actually laid out, re-flag: the first pass runs while it
  // is still hidden and a code block may not have rendered yet.
  useEffect(() => {
    if (ready) markLocked()
  }, [ready, markLocked])

  // Look for work this browser saved and never sent.
  useEffect(() => {
    if (!data) return
    pruneDrafts()
    setDraft(loadDraft(pathname))
  }, [data, pathname])

  // A draft identical to the page as it now stands is not a rescue, it is a
  // false alarm. Once the editor has serialized the server copy we can tell,
  // so drop it before the contributor is ever asked about it.
  useEffect(() => {
    if (!ready || !draft || draftApplied) return
    if (baselineRef.current !== null && draft.body === baselineRef.current) discardDraft()
  }, [ready, draft, draftApplied, discardDraft])

  useEffect(() => onReadyChange(ready), [ready, onReadyChange])
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange])

  // The shell asks to leave (browser back). Never drop work silently.
  // Edge-triggered, not level-triggered: the counter lives in the shell and
  // keeps climbing across edit sessions, so a fresh editor must react to the
  // signal *changing*, not to it merely being non-zero. Otherwise every edit
  // after the first cancelled one opens with the discard prompt already up.
  useEffect(() => {
    if (exitSignal === seenExitSignalRef.current) return
    seenExitSignalRef.current = exitSignal
    setConfirmingExit(true)
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

  async function handleImageChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !crepeRef.current) return
    try {
      const src = await uploadImage(file)
      crepeRef.current.editor.action(insert(`\n\n![1.00](${src} "")\n\n`))
    } catch {
      // uploadImage already names the problem beside the control.
    }
  }

  function changeMedia(id: string, patch: Partial<ContributionMediaInput>) {
    updatePendingMedia((current) => {
      const next = current.map((item) => (item.id === id ? { ...item, ...patch } : item))
      const markdown = readMarkdown(crepeRef.current) || markdownRef.current
      saveDraft(pathname, markdown, Date.now(), next)
      return next
    })
    if (!dirtyRef.current) {
      dirtyRef.current = true
      setDirty(true)
    }
  }

  async function removeMedia(id: string) {
    const currentMarkdown = readMarkdown(crepeRef.current) || markdownRef.current
    let nextMarkdown = currentMarkdown
    try {
      nextMarkdown = rejectPendingMediaInMarkdown(currentMarkdown, id)
      crepeRef.current?.editor.action(replaceAll(nextMarkdown))
    } catch {
      // The contributor may already have removed the block with Backspace.
    }
    const next = pendingMediaRef.current.filter((item) => item.id !== id)
    updatePendingMedia(next)
    saveDraft(pathname, nextMarkdown, Date.now(), next)

    const url = previewUrlsRef.current[id]
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
    const nextPreviews = { ...previewUrlsRef.current }
    delete nextPreviews[id]
    previewUrlsRef.current = nextPreviews
    setPreviewUrls(nextPreviews)

    if (!authToken) return
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    await fetch(`${basePath}/api/contribution-media`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ id })
    }).catch(() => {})
  }

  async function discardUnsubmittedMedia() {
    const unsubmitted = pendingMediaRef.current.filter(
      (item) => item.status === 'quarantined'
    )
    await Promise.allSettled(unsubmitted.map((item) => removeMedia(item.id)))
  }

  async function handleSubmit() {
    if (!data || submitting) return
    setSubmitError(null)
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    let editorMarkdown
    try {
      editorMarkdown = crepeRef.current
        ? readMarkdown(crepeRef.current)
        : markdownRef.current
    } catch {
      editorMarkdown = markdownRef.current
    }
    const videoError = editableVideoError(editorMarkdown || '')
    if (videoError) {
      setSubmitError(videoError)
      return
    }
    const body = decodeEditableVideos(decodeLockedMdx(editorMarkdown || ''))
    if (!sameLockedMdx(lockedBlocksRef.current, lockedMdxBlocks(body))) {
      setSubmitError('locked_content_changed')
      return
    }
    // Select-all then delete is one keystroke away, and the frontmatter alone
    // is long enough to clear the server's length check. Stop a blanked page
    // here, where the work is still recoverable, rather than turning it into a
    // pull request a reviewer has to close.
    if (!body.trim()) {
      setSubmitError('content_empty')
      return
    }
    const referencedMedia = extractPendingMediaIds(body)
    if (
      referencedMedia.length !== pendingMediaRef.current.length ||
      pendingMediaRef.current.some((item) => !referencedMedia.includes(item.id))
    ) {
      setSubmitError('image_not_placed')
      return
    }
    if (pendingMediaRef.current.some((item) => item.status === 'expired')) {
      setSubmitError('image_expired_or_forbidden')
      return
    }
    if (pendingMediaRef.current.some((item) => !item.alt.trim())) {
      setSubmitError('image_alt_required')
      return
    }
    if (!authToken) {
      setSubmitError('unauthorized')
      onReauthenticate()
      return
    }

    setSubmitting(true)
    const fullContent = data.frontmatterRaw + '\n' + body
    try {
      const res = await fetch(`${basePath}/api/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          path: pathname,
          content: fullContent,
          summary,
          media: pendingMediaRef.current.map(({ id, alt, source, credit, checked }) => ({
            id,
            alt,
            source,
            credit,
            checked
          }))
        })
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || 'submit_failed')
      dirtyRef.current = false
      setDirty(false)
      // It is on the branch now. Keeping a copy here would only resurface as a
      // stale "unsaved changes" prompt the next time they open the page.
      window.clearTimeout(saveTimerRef.current)
      clearDraft(pathname)
      onSubmitted(j)
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : 'submit_failed'
      const knownCode = [
        'content_empty',
        'content_too_large',
        'content_too_short',
        'contribution_rate_limited',
        'contributor_banned',
        'contributor_muted',
        'auth_unavailable',
        'duplicate_image_marker',
        'image_alt_required',
        'image_expired_or_forbidden',
        'image_metadata_required',
        'image_not_placed',
        'locked_content_changed',
        'not_contributable',
        'pr_creation_failed',
        'submit_failed',
        'too_many_images',
        'uncontrolled_image_source',
        'unauthorized',
        'video_link_invalid',
        'video_title_required'
      ].includes(code)
        ? code
        : 'network_error'
      setSubmitError(knownCode)
      if (knownCode === 'unauthorized') {
        onSessionExpired()
        onReauthenticate()
      }
      setSubmitting(false)
    }
  }

  const ghEditUrl = `${REPO_URL}/edit/main/${repoFileFor(pathname)}`
  const pageTitle = data?.frontmatter.title || data?.title || fallbackTitle

  let status = ''
  if (submitting) status = t(isEn, 'রিভিউতে পাঠানো হচ্ছে…', 'Sending for review…')
  else if (loading) status = t(isEn, 'লেখা আনা হচ্ছে…', 'Loading the page…')
  else if (dirty) status = t(isEn, 'পরিবর্তন এখনো জমা হয়নি', 'Changes not submitted')

  return (
    <div className="edit-mode" aria-busy={submitting || loading}>
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
                {t(
                  isEn,
                  'এই পাতায় করা পরিবর্তন মুছে যাবে।',
                  'Your changes to this page will be lost.'
                )}
              </span>
              <button type="button" className="edit-btn" onClick={() => setConfirmingExit(false)}>
                {t(isEn, 'সম্পাদনা চালিয়ে যান', 'Keep editing')}
              </button>
              <button
                type="button"
                className="edit-btn"
                onClick={() => {
                  // They said discard, so discard: leaving the crash copy
                  // behind would offer this same work back on the next visit.
                  window.clearTimeout(saveTimerRef.current)
                  discardDraft()
                  discardUnsubmittedMedia().finally(onExit)
                }}
              >
                {t(isEn, 'পরিবর্তন বাদ দিন', 'Discard changes')}
              </button>
            </>
          ) : (
            <>
              <input
                ref={imageInputRef}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChosen}
                tabIndex={-1}
                aria-hidden="true"
              />
              <button
                type="button"
                className="edit-btn"
                onClick={() => imageInputRef.current?.click()}
                disabled={
                  !ready ||
                  submitting ||
                  uploadingImage ||
                  pendingMedia.length >= MAX_IMAGES_PER_CONTRIBUTION
                }
              >
                <ImageIcon />
                {uploadingImage
                  ? t(isEn, 'ছবি তোলা হচ্ছে…', 'Adding image…')
                  : t(isEn, 'ছবি যোগ করুন', 'Add image')}
              </button>
              <button type="button" className="edit-btn" onClick={requestExit} disabled={submitting}>
                {error ? t(isEn, 'পড়ায় ফিরুন', 'Back to reading') : t(isEn, 'বাতিল', 'Cancel')}
              </button>
              {!error && dirty && (
                <button
                  type="button"
                  className="edit-btn edit-btn--secondary"
                  onClick={handleShowDiff}
                  disabled={!ready || submitting}
                >
                  {t(isEn, 'পরিবর্তনগুলো দেখুন', 'Review Changes')}
                </button>
              )}
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
                  {t(isEn, 'রিভিউতে পাঠান', 'Send for review')}
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
                  'আবার সাইন ইন করলে এখান থেকেই সম্পাদনা চালিয়ে যেতে পারবেন।',
                  'Sign in again to continue editing from here.'
                )}
              </p>
            </>
          ) : error === 'contributor_banned' || error === 'contributor_muted' ? (
            <>
              <strong>
                {t(isEn, 'এই অ্যাকাউন্ট থেকে সম্পাদনা থামানো আছে', 'Editing is paused for this account')}
              </strong>
              <p>
                {t(
                  isEn,
                  'বারবার স্প্যাম বা নিয়ম ভাঙার কারণে এই অ্যাকাউন্ট থেকে এখন অবদান পাঠানো যাচ্ছে না। ভুল হয়ে থাকলে রক্ষণাবেক্ষণকারীদের সঙ্গে যোগাযোগ করুন।',
                  'This account cannot submit contributions right now because of spam or repeated rule violations. Contact the maintainers if this is a mistake.'
                )}
              </p>
            </>
          ) : error === 'not_contributable' ? (
            <>
              <strong>{t(isEn, 'এই পাতা এখানে সম্পাদনা করা যাচ্ছে না', 'This page cannot be edited here')}</strong>
              <p>
                {t(
                  isEn,
                  'পাতাটি এখন ইনলাইন এডিটরে খোলা যাচ্ছে না। GitHub-এ সরাসরি সম্পাদনা করলে সেটিও একইভাবে রিভিউ হবে।',
                  'This page is not available in the inline editor. You can edit it on GitHub instead; it goes through the same review.'
                )}
              </p>
            </>
          ) : error === 'editor_init_failed' ? (
            <>
              <strong>{t(isEn, 'এডিটর চালু করা যায়নি', 'The editor could not start')}</strong>
              <p>
                {t(
                  isEn,
                  'পাতার লেখা ঠিক আছে, কিন্তু এই ব্রাউজারে এডিটর চালু হয়নি। পাতা রিলোড করে আবার চেষ্টা করুন, বা GitHub-এ সম্পাদনা করুন।',
                  'The page is fine, but the editor did not start in this browser. Reload and try again, or edit on GitHub.'
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
            </>
          )}
          <div className="edit-state__actions">
            {error === 'unauthorized' && (
              <button type="button" className="edit-btn is-primary" onClick={onReauthenticate}>
                {t(isEn, 'আবার সাইন ইন করুন', 'Sign in again')}
              </button>
            )}
            <a className="edit-btn" href={ghEditUrl} target="_blank" rel="noopener noreferrer">
              {t(isEn, 'GitHub-এ সম্পাদনা করুন', 'Edit on GitHub')}
            </a>
            <button type="button" className="edit-btn" onClick={onExit}>
              {t(isEn, 'পড়ায় ফিরুন', 'Back to reading')}
            </button>
          </div>
        </div>
      )}

      {draft && !draftApplied && !error && ready && (
        <aside className="edit-draft-notice" role="note">
          <strong>{t(isEn, 'জমা না দেওয়া লেখা পাওয়া গেছে', 'Unsent changes found')}</strong>
          <p>
            {t(
              isEn,
              `এই পাতায় আপনার কিছু পরিবর্তন এই ব্রাউজারে জমা আছে (${formatSavedAt(draft.savedAt, isEn)}), কিন্তু রিভিউতে পাঠানো হয়নি। নিচে এখন পাতাটির বর্তমান লেখা দেখছেন।`,
              `Some changes you made on this page are saved in this browser (${formatSavedAt(draft.savedAt, isEn)}) but were never sent for review. What you see below is the page as it stands now.`
            )}
          </p>
          <div className="edit-draft-notice__actions">
            <button type="button" className="edit-btn" onClick={() => setDraftApplied(true)}>
              {t(isEn, 'আমার লেখা ফিরিয়ে আনুন', 'Bring my changes back')}
            </button>
            <button type="button" className="edit-btn" onClick={discardDraft}>
              {t(isEn, 'বাদ দিন', 'Discard them')}
            </button>
          </div>
        </aside>
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

          {(pendingMedia.length > 0 || uploadError) && (
            <section className="edit-media" aria-labelledby="edit-media-heading">
              <div className="edit-media__heading">
                <div>
                  <h2 id="edit-media-heading">
                    {t(isEn, 'এই সম্পাদনার ছবি', 'Images in this edit')}
                  </h2>
                  <p>
                    {t(
                      isEn,
                      `ছবিগুলো এখন ব্যক্তিগতভাবে রাখা আছে। রিভিউয়ার প্রতিটি ছবি আলাদাভাবে অনুমোদন করবেন। সর্বোচ্চ ${MAX_IMAGES_PER_CONTRIBUTION}টি, আর ৭ দিনের মধ্যে সিদ্ধান্ত না হলে ছবি নিজে থেকে মুছে যাবে।`,
                      `These images are private for now. A reviewer must approve each one separately. You can add up to ${MAX_IMAGES_PER_CONTRIBUTION}; undecided images are deleted after 7 days.`
                    )}
                  </p>
                </div>
                <span>
                  {pendingMedia.length}/{MAX_IMAGES_PER_CONTRIBUTION}
                </span>
              </div>

              {uploadError && (
                <p className="edit-media__error" role="alert">
                  {uploadError === 'file_too_large'
                    ? t(
                        isEn,
                        'ছবিটি ৩০০ KB-এর বেশি। একটু ছোট করে বা WebP হিসেবে সেভ করে আবার দিন।',
                        'This image is over 300 KB. Make it smaller or save it as WebP, then try again.'
                      )
                    : uploadError === 'unsupported_type'
                      ? t(
                          isEn,
                          'শুধু PNG, JPEG বা WebP ছবি দেওয়া যাবে।',
                          'Use a PNG, JPEG, or WebP image.'
                        )
                      : uploadError === 'daily_image_limit' ||
                          uploadError === 'daily_byte_limit'
                        ? t(
                            isEn,
                            'আজকের ছবি দেওয়ার সীমা পূর্ণ হয়েছে। আগামীকাল আবার চেষ্টা করুন।',
                            'You have reached today’s image allowance. Try again tomorrow.'
                          )
                        : uploadError === 'upload_rate_limited'
                          ? t(
                              isEn,
                              'খুব দ্রুত অনেকবার চেষ্টা হয়েছে। এক মিনিট পরে আবার দিন।',
                              'There have been too many attempts. Try again in a minute.'
                            )
                          : uploadError === 'contributor_banned' ||
                              uploadError === 'contributor_muted'
                            ? t(
                                isEn,
                                'এই অ্যাকাউন্ট থেকে এখন ছবি দেওয়া যাচ্ছে না।',
                                'This account cannot upload images right now.'
                              )
                            : t(
                                isEn,
                                'ছবিটি যোগ করা যায়নি। ইন্টারনেট ঠিক থাকলে আবার চেষ্টা করুন।',
                                'The image could not be added. Check your connection and try again.'
                              )}
                </p>
              )}

              <div className="edit-media__list">
                {pendingMedia.map((media, index) => {
                  const placed = extractPendingMediaIds(
                    readMarkdown(crepeRef.current) || markdownRef.current
                  ).includes(media.id)
                  return (
                    <article className="edit-media-item" key={media.id}>
                      <div className="edit-media-item__preview">
                        {previewUrls[media.id] ? (
                          <img src={previewUrls[media.id]} alt="" />
                        ) : (
                          <span>{t(isEn, 'প্রিভিউ নেই', 'Preview unavailable')}</span>
                        )}
                      </div>
                      <div className="edit-media-item__fields">
                        <div className="edit-media-item__title">
                          <strong>
                            {t(isEn, `ছবি ${index + 1}`, `Image ${index + 1}`)}
                          </strong>
                          <span>
                            {media.w && media.h ? `${media.w} × ${media.h}` : ''}
                            {media.bytes ? ` · ${Math.ceil(media.bytes / 1024)} KB` : ''}
                          </span>
                        </div>

                        {media.status === 'expired' && (
                          <p className="edit-media-item__notice is-error">
                            {t(
                              isEn,
                              'এই ছবির ৭ দিনের মেয়াদ শেষ হয়েছে। এটি সরিয়ে আবার ছবি দিন।',
                              'This image has passed its 7-day limit. Remove it and upload it again.'
                            )}
                          </p>
                        )}
                        {!placed && (
                          <p className="edit-media-item__notice is-error">
                            {t(
                              isEn,
                              'ছবিটি লেখার মধ্যে নেই। এটি সরান, অথবা আবার লেখায় বসান।',
                              'This image is no longer in the article. Remove it or insert it again.'
                            )}
                          </p>
                        )}

                        <label htmlFor={`media-alt-${media.id}`}>
                          {t(
                            isEn,
                            'ছবিতে কী দেখা যাচ্ছে? (অবশ্যই লিখুন)',
                            'What does the image show? (required)'
                          )}
                        </label>
                        <textarea
                          id={`media-alt-${media.id}`}
                          value={media.alt}
                          onChange={(event) =>
                            changeMedia(media.id, { alt: event.target.value.slice(0, 280) })
                          }
                          placeholder={t(
                            isEn,
                            'যেমন: RJSC পোর্টালে কোম্পানির নাম খোঁজার ফর্ম',
                            'e.g. Company-name search form in the RJSC portal'
                          )}
                          rows={2}
                          maxLength={280}
                          required
                        />
                        <p className="edit-media-item__hint">
                          {t(
                            isEn,
                            'ক্যাপশনটি উপরের ছবির ঠিক নিচে লিখতে পারবেন।',
                            'Write the visible caption directly under the image above.'
                          )}
                        </p>

                        <div className="edit-media-item__optional">
                          <label htmlFor={`media-source-${media.id}`}>
                            {t(isEn, 'সূত্র (থাকলে)', 'Source (if any)')}
                            <input
                              id={`media-source-${media.id}`}
                              value={media.source || ''}
                              onChange={(event) =>
                                changeMedia(media.id, {
                                  source: event.target.value.slice(0, 300)
                                })
                              }
                              placeholder={t(isEn, 'যেমন: RJSC পোর্টাল', 'e.g. RJSC portal')}
                              maxLength={300}
                            />
                          </label>
                          <label htmlFor={`media-credit-${media.id}`}>
                            {t(isEn, 'কৃতজ্ঞতা / ক্রেডিট (থাকলে)', 'Credit (if any)')}
                            <input
                              id={`media-credit-${media.id}`}
                              value={media.credit || ''}
                              onChange={(event) =>
                                changeMedia(media.id, {
                                  credit: event.target.value.slice(0, 200)
                                })
                              }
                              maxLength={200}
                            />
                          </label>
                          <label htmlFor={`media-checked-${media.id}`}>
                            {t(isEn, 'স্ক্রিনটি কবে মিলিয়েছেন?', 'When was this screen checked?')}
                            <input
                              id={`media-checked-${media.id}`}
                              type="date"
                              value={media.checked || ''}
                              onChange={(event) =>
                                changeMedia(media.id, { checked: event.target.value })
                              }
                            />
                          </label>
                        </div>

                        <button
                          type="button"
                          className="edit-media-item__remove"
                          onClick={() => removeMedia(media.id)}
                        >
                          {t(isEn, 'ছবিটি সরান', 'Remove image')}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          <div className="edit-publish">
            <label className="edit-publish__label" htmlFor="contrib-summary">
              {t(isEn, 'কী বদলালেন? (ঐচ্ছিক)', 'What changed? (optional)')}
            </label>
            <p className="edit-publish__hint">
              {t(
                isEn,
                'এক লাইনে লিখলে রিভিউ দ্রুত হয়। যেমন: “২০২৬ সালের নতুন ফি বসিয়েছি”।',
                'A one-line note helps reviewers. For example: “Updated the fee to the 2026 figure”.'
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
              maxLength={280}
              disabled={submitting}
            />

            {submitError && (
              <div className="edit-publish__error" role="alert">
                <p>
                  {submitError === 'unauthorized'
                    ? t(
                        isEn,
                        'সাইন-ইনের মেয়াদ শেষ হয়েছে। আপনার পরিবর্তন এই পাতাতেই আছে। আবার সাইন ইন করে রিভিউতে পাঠান।',
                        'Your sign-in expired. Your changes are still here. Sign in again, then send them for review.'
                      )
                    : submitError === 'locked_content_changed'
                      ? t(
                          isEn,
                          'সাইটের নিজস্ব একটি অংশ বদলে গেছে। ওই অংশ আগের অবস্থায় ফিরিয়ে আবার চেষ্টা করুন। আপনার অন্য পরিবর্তন হারায়নি।',
                          'A protected site component was changed. Restore it, then try again. Your other changes are still here.'
                        )
                      : submitError === 'video_title_required'
                        ? t(
                            isEn,
                            'ভিডিওটির শিরোনাম লিখুন। ভিডিওটি কী নিয়ে, তা ছোট করে বললেই হবে।',
                            'Give the video a title so readers know what they are about to play.'
                          )
                        : submitError === 'video_link_invalid'
                          ? t(
                              isEn,
                              'একটি ভিডিওর লিংক ঠিক নেই। ভিডিওটি সরিয়ে আসল YouTube বা Facebook লিংকটি আবার পেস্ট করুন।',
                              'One video link is invalid. Remove it, then paste the original YouTube or Facebook link again.'
                            )
                      : submitError === 'content_too_large'
                        ? t(
                            isEn,
                            'পরিবর্তনটি একবারে পাঠানোর জন্য খুব বড়। ছোট ভাগে পাঠান, বা GitHub-এ সম্পাদনা করুন।',
                            'This change is too large to send at once. Submit a smaller edit, or edit on GitHub.'
                          )
                        : submitError === 'image_alt_required'
                          ? t(
                              isEn,
                              'প্রতিটি ছবিতে কী দেখা যাচ্ছে তা লিখুন। এই বর্ণনাই ছবিটি দেখতে না পাওয়া পাঠককে সাহায্য করবে।',
                              'Describe what each image shows. This is what helps readers who cannot see it.'
                            )
                          : submitError === 'image_not_placed'
                            ? t(
                                isEn,
                                'একটি ছবি লেখার মধ্যে আর নেই। ছবির তালিকা থেকে সেটি সরান, অথবা আবার লেখায় বসান।',
                                'One attached image is no longer in the article. Remove it from the image list or insert it again.'
                              )
                            : submitError === 'duplicate_image_marker'
                              ? t(
                                  isEn,
                                  'একই ছবি লেখায় দুবার বসানো আছে। বাড়তি কপিটি মুছে আবার পাঠান।',
                                  'The same image appears twice in the article. Delete the extra copy and send again.'
                                )
                            : submitError === 'image_expired_or_forbidden'
                              ? t(
                                  isEn,
                                  'একটি ছবির ৭ দিনের মেয়াদ শেষ হয়েছে। সেটি সরিয়ে আবার ছবি দিন।',
                                  'One image has passed its 7-day limit. Remove it and upload it again.'
                                )
                              : submitError === 'uncontrolled_image_source'
                                ? t(
                                    isEn,
                                    'ইন্টারনেটের লিংক থেকে সরাসরি ছবি বসানো যাবে না। “ছবি যোগ করুন” দিয়ে ফাইলটি দিন, যাতে ব্যক্তিগতভাবে যাচাই করা যায়।',
                                    'Images cannot be embedded directly from another website. Use “Add image” so the file can be reviewed privately.'
                                  )
                              : submitError === 'contributor_banned' ||
                                  submitError === 'contributor_muted'
                                ? t(
                                    isEn,
                                    'এই অ্যাকাউন্ট থেকে এখন অবদান পাঠানো যাচ্ছে না। ভুল হয়ে থাকলে রক্ষণাবেক্ষণকারীদের সঙ্গে যোগাযোগ করুন।',
                                    'This account cannot submit contributions right now. Contact the maintainers if this is a mistake.'
                                  )
                                : submitError === 'contribution_rate_limited'
                                  ? t(
                                      isEn,
                                      'খুব দ্রুত কয়েকবার জমা দেওয়ার চেষ্টা হয়েছে। এক মিনিট পরে আবার পাঠান।',
                                      'There have been several submission attempts. Try again in a minute.'
                                    )
                                  : submitError === 'content_empty' || submitError === 'content_too_short'
                          ? t(
                              isEn,
                              'পাতাটি এখন ফাঁকা, তাই কিছু পাঠানো হয়নি। লেখা ভুলে মুছে গিয়ে থাকলে Ctrl+Z (Mac-এ Cmd+Z) চেপে ফিরিয়ে আনুন, তারপর আবার পাঠান।',
                              'The page is empty, so nothing was sent. If the text was deleted by accident, press Ctrl+Z (Cmd+Z on a Mac) to bring it back, then send again.'
                            )
                          : t(
                              isEn,
                              'রিভিউতে পাঠানো যায়নি। একটু পরে আবার চেষ্টা করুন। আপনার পরিবর্তন এই পাতাতেই আছে।',
                              'The changes could not be sent for review. Try again in a moment; your work is still here.'
                            )}
                </p>
                {submitError === 'unauthorized' && (
                  <button type="button" className="edit-btn" onClick={onReauthenticate}>
                    {t(isEn, 'আবার সাইন ইন করুন', 'Sign in again')}
                  </button>
                )}
              </div>
            )}

            <div className="edit-publish__foot">
              <p className="edit-publish__by">
                {session?.name
                  ? t(
                      isEn,
                      `আপনি ${session.name} হিসেবে পাঠাচ্ছেন। একটি পুল রিকোয়েস্ট তৈরি হবে, আর রিভিউ হওয়ার পর পরিবর্তনটি সাইটে আসবে।`,
                      `Sending as ${session.name}. This opens a pull request, and your change goes live once a reviewer approves it.`
                    )
                  : t(
                      isEn,
                      'রিভিউতে পাঠালে একটি পুল রিকোয়েস্ট তৈরি হবে। অনুমোদনের পর পরিবর্তনটি সাইটে আসবে।',
                      'Sending for review opens a pull request. The change goes live after approval.'
                    )}
              </p>
              <div className="edit-publish__actions">
                <button type="button" className="edit-btn" onClick={requestExit} disabled={submitting}>
                  {t(isEn, 'বাতিল', 'Cancel')}
                </button>
                {dirty && (
                  <button
                    type="button"
                    className="edit-btn edit-btn--secondary"
                    onClick={handleShowDiff}
                    disabled={!ready || submitting}
                  >
                    {t(isEn, 'পরিবর্তনগুলো দেখুন', 'Review Changes')}
                  </button>
                )}
                <button
                  type="button"
                  className="edit-btn is-primary"
                  onClick={handleSubmit}
                  disabled={!ready || !dirty || submitting}
                >
                  {submitting
                    ? t(isEn, 'রিভিউতে পাঠানো হচ্ছে…', 'Sending for review…')
                    : t(isEn, 'রিভিউতে পাঠান', 'Send for review')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <DiffModal
        open={diffOpen}
        onClose={() => setDiffOpen(false)}
        diffLines={calculatedDiff}
        title={t(isEn, 'পরিবর্তনগুলো দেখুন', 'Review Changes')}
        isEn={isEn}
      />
    </div>
  )
}
