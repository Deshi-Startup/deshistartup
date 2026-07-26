'use client'

import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import LanguageSwitcher from './LanguageSwitcher'
import SearchBox from './SearchBox'
import AuthModal from './AuthModal'
import type { SubmitResult } from './ContributionEditor'
import { clearAuth, getStoredAuth, UserInfo } from '../lib/client-auth'
import { bnNav, enNav, REPO_URL } from '../nav.config'
import sectionsLite from '../generated/sections-lite.json'

// Heavy (Milkdown) — only loads when a contributor opens the editor.
const ContributionEditor = dynamic(() => import('./ContributionEditor'), { ssr: false })

interface SectionsLite {
  en?: Record<string, string>
  bn?: Record<string, string>
}

const typedSectionsLite = sectionsLite as unknown as SectionsLite

function localHref(href: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  if (!href.startsWith('/')) return href
  if (!basePath) return href
  return href === '/' ? basePath || '/' : `${basePath}${href}`
}

function sourceFileFor(pathname: string) {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const rest = pathname === '/en' ? '' : pathname.slice(3)
    return `app/(contents)/en${rest}/page.mdx`
  }
  return `app/(contents)/(bn)${pathname === '/' ? '' : pathname}/page.mdx`
}

function formatDate(iso: string | null, isEn: boolean) {
  if (!iso) return null
  try {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString(isEn ? 'en-GB' : 'bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    })
  } catch {
    return iso
  }
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

/* Carried by the সম্পাদনা action so it still reads as "edit" on a phone, where
   the row collapses to that one control and the neighbouring words are gone. */
function ActionPencil() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="act-pencil">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

interface HeadingItem {
  id: string
  text: string
}

interface SidebarProps {
  isEn: boolean
  pathname: string
  headings: HeadingItem[]
  onNavigate: () => void
  onClose: () => void
  closeButtonRef: React.RefObject<HTMLButtonElement | null>
  isOpen: boolean
}

function Sidebar({ isEn, pathname, headings, onNavigate, onClose, closeButtonRef, isOpen }: SidebarProps) {
  const nav = isEn ? enNav : bnNav

  return (
    <aside
      className="sidebar"
      id="sidebar"
      role={isOpen ? 'dialog' : undefined}
      aria-modal={isOpen ? 'true' : undefined}
      aria-label={isEn ? 'Primary navigation' : 'প্রধান মেনু'}
    >
      <button
        className="sidebar-close"
        type="button"
        ref={closeButtonRef}
        onClick={onClose}
        aria-label={isEn ? 'Close navigation' : 'মেনু বন্ধ করুন'}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
      <nav>
        {nav.map((group) => (
          <div className="sidebar-group" key={group.label}>
            <p>{group.label}</p>
            {group.items.map(([href, label]) => {
              const external = !href.startsWith('/')
              const isActive = !external && pathname === href
              return (
                <a
                  href={localHref(href)}
                  key={href}
                  className={isActive ? 'is-active' : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  onClick={onNavigate}
                >
                  {label}
                </a>
              )
            })}
          </div>
        ))}

        {headings.length > 0 && (
          <div className="sidebar-group">
            <p>{isEn ? 'On This Page' : 'এই পাতায়'}</p>
            {headings.map((heading) => (
              <a href={`#${heading.id}`} key={heading.id} onClick={onNavigate}>
                {heading.text}
              </a>
            ))}
          </div>
        )}

        <p className="sidebar-note">
          {isEn
            ? 'Free & open source. Every guide can be improved by anyone – including you.'
            : 'সম্পূর্ণ ফ্রি ও ওপেন সোর্স। প্রতিটি গাইড যে কেউ সংশোধন করতে পারেন, আপনিও।'}
        </p>
      </nav>
    </aside>
  )
}

interface BreadcrumbsProps {
  isEn: boolean
  pathname: string
  pageTitle: string
}

function Breadcrumbs({ isEn, pathname, pageTitle }: BreadcrumbsProps) {
  const segments = pathname.split('/').filter(Boolean)
  const rest = isEn ? segments.slice(1) : segments
  if (rest.length === 0) return null

  const sectionTitles = (isEn ? typedSectionsLite.en : typedSectionsLite.bn) || {}
  const crumbs = [{ href: isEn ? '/en' : '/', label: isEn ? 'Home' : 'প্রধান পাতা' }]

  if (rest.length > 1) {
    const sectionSlug = rest[0]
    crumbs.push({
      href: `${isEn ? '/en' : ''}/${sectionSlug}`,
      label: sectionTitles[sectionSlug] || sectionSlug
    })
  }

  return (
    <nav className="breadcrumbs" aria-label={isEn ? 'Breadcrumb' : 'অবস্থান'}>
      <ol>
        {crumbs.map((crumb) => (
          <li key={crumb.href}>
            <a href={localHref(crumb.href)}>{crumb.label}</a>
          </li>
        ))}
        <li aria-current="page" suppressHydrationWarning>{pageTitle || '…'}</li>
      </ol>
    </nav>
  )
}

const enTabs = { article: 'Article', talk: 'Talk', read: 'Read', edit: 'Edit', history: 'View history' }
const bnTabs = {
  article: 'গাইড',
  talk: 'আলোচনা',
  read: 'পড়ুন',
  edit: 'সম্পাদনা',
  history: 'ইতিহাস'
}

interface LocalizedLayoutProps {
  children?: React.ReactNode
}

export default function LocalizedLayout({ children }: LocalizedLayoutProps) {
  const pathname = usePathname()
  const isEn = pathname.startsWith('/en/') || pathname === '/en'
  const isLanding = pathname === '/' || pathname === '/en'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [headings, setHeadings] = useState<HeadingItem[]>([])
  const [pageTitle, setPageTitle] = useState('')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [lastVerified, setLastVerified] = useState<string | null>(null)
  const [session, setSession] = useState<UserInfo | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editorReady, setEditorReady] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [exitSignal, setExitSignal] = useState(0)
  const [flash, setFlash] = useState<SubmitResult | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const navToggleRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const sidebarCloseRef = useRef<HTMLButtonElement>(null)
  const articleRef = useRef<HTMLElement>(null)
  const scrollBeforeEdit = useRef(0)

  // Restore a still-valid Google ID token from localStorage on mount, and honour
  // a shared ?action=edit link the way a wiki does: land straight in the editor.
  useEffect(() => {
    const stored = getStoredAuth()
    if (stored) {
      setSession(stored.user)
      setAuthToken(stored.token)
    }
    const wantsEdit = new URLSearchParams(window.location.search).get('action') === 'edit'
    if (!wantsEdit || pathname === '/' || pathname === '/en') return
    if (stored) setIsEditing(true)
    else setAuthOpen(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const enterEdit = useCallback(() => {
    scrollBeforeEdit.current = window.scrollY
    setFlash(null)
    setIsEditing(true)
    const url = new URL(window.location.href)
    if (url.searchParams.get('action') !== 'edit') {
      url.searchParams.set('action', 'edit')
      window.history.pushState({ editing: true }, '', url)
    }
  }, [])

  const exitEdit = useCallback((result?: SubmitResult) => {
    setIsEditing(false)
    setEditorReady(false)
    setIsDirty(false)
    if (result) setFlash(result)
    const url = new URL(window.location.href)
    if (url.searchParams.has('action')) {
      url.searchParams.delete('action')
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    }
    const target = result ? 0 : scrollBeforeEdit.current
    window.requestAnimationFrame(() => window.scrollTo(0, target))
  }, [])

  const handleExit = useCallback(() => exitEdit(), [exitEdit])
  const handleSubmitted = useCallback((result: SubmitResult) => exitEdit(result), [exitEdit])

  // The server rejected the stored token. Forget it here so the next press of
  // সম্পাদনা offers a fresh sign-in rather than the same failure again.
  const handleSessionExpired = useCallback(() => {
    clearAuth()
    setSession(null)
    setAuthToken(null)
  }, [])

  function handleContribute() {
    if (session && authToken) enterEdit()
    else setAuthOpen(true)
  }

  function handleAuthenticated(user: UserInfo, token: string) {
    setSession(user)
    setAuthToken(token)
    if (!isEditing) enterEdit()
  }

  function handleRead() {
    if (isDirty) {
      setExitSignal((signal) => signal + 1)
      return
    }
    exitEdit()
  }

  // Nobody loses an edit to a stray reload, tab close or Android back gesture.
  useEffect(() => {
    if (!isEditing || !isDirty) return undefined
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isEditing, isDirty])

  // Back button: leaves edit mode when nothing is at stake, otherwise re-asserts
  // the edit URL and lets the bar ask before anything is thrown away.
  useEffect(() => {
    if (!isEditing) return undefined
    const onPopState = () => {
      if (isDirty) {
        const url = new URL(window.location.href)
        url.searchParams.set('action', 'edit')
        window.history.pushState({ editing: true }, '', url)
        setExitSignal((n) => n + 1)
        return
      }
      setIsEditing(false)
      setEditorReady(false)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [isEditing, isDirty])

  // The edit bar pins directly under the header, whose height changes with the
  // breakpoint (it stacks to two rows on phones). Measure it rather than guess.
  useEffect(() => {
    if (!isEditing) return undefined
    const header = document.querySelector('.site-header')
    if (!header) return undefined
    const apply = () =>
      document.documentElement.style.setProperty(
        '--header-h',
        `${Math.round(header.getBoundingClientRect().height)}px`
      )
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(header)
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--header-h')
    }
  }, [isEditing])

  // While the source is being fetched the rendered article stays on screen so the
  // reader keeps their place, but it is no longer a thing you can click or tab into.
  useEffect(() => {
    const article = articleRef.current
    if (!article) return
    // @ts-ignore — `inert` lands as a DOM property before React 19 types it as a prop.
    article.inert = isEditing
  }, [isEditing, editorReady])

  const closeSidebar = (restoreFocus = false) => {
    setIsSidebarOpen(false)
    if (restoreFocus) window.requestAnimationFrame(() => navToggleRef.current?.focus())
  }

  useEffect(() => {
    if (!isSidebarOpen) return undefined

    const mobileQuery = window.matchMedia('(max-width: 860px)')
    if (!mobileQuery.matches) return undefined

    const backgroundElements = [
      document.querySelector('.skip-link'),
      document.querySelector('.site-header'),
      document.querySelector('.content-canvas'),
      document.querySelector('.site-footer')
    ].filter((el): el is HTMLElement => !!el)
    
    sidebarCloseRef.current?.focus()
    document.body.classList.add('nav-open')
    backgroundElements.forEach((element) => {
      // @ts-ignore
      element.inert = true
      element.setAttribute('aria-hidden', 'true')
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsSidebarOpen(false)
        window.requestAnimationFrame(() => navToggleRef.current?.focus())
        return
      }

      if (event.key !== 'Tab') return

      const focusable = [
        ...(sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') || [])
      ].filter((element) => element.offsetParent !== null)

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setIsSidebarOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    mobileQuery.addEventListener('change', handleViewportChange)

    return () => {
      document.body.classList.remove('nav-open')
      backgroundElements.forEach((element) => {
        // @ts-ignore
        element.inert = false
        element.removeAttribute('aria-hidden')
      })
      window.removeEventListener('keydown', handleKeyDown)
      mobileQuery.removeEventListener('change', handleViewportChange)
    }
  }, [isSidebarOpen])

  useEffect(() => {
    document.documentElement.lang = isEn ? 'en' : 'bn'
    if (pathname === '/en') {
      document.title = 'Deshi Startup – The Bangla-first guide to building a startup in Bangladesh'
    }
  }, [isEn, pathname])

  useEffect(() => {
    setIsSidebarOpen(false)

    const article = document.querySelector('.article')
    if (!article) return

    const h1 = article.querySelector('h1')
    // Short form for chrome (breadcrumb leaf, issue titles): cut at the em dash.
    setPageTitle(h1 ? h1.textContent?.split('–')[0].trim() || '' : '')

    const slugify = (value: string) =>
      value.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')

    const seen = new Set<string>()
    const nextHeadings = [...article.querySelectorAll('h2')].slice(0, 16).map((heading, index) => {
      if (!heading.id) {
        let id = slugify(heading.textContent || '') || `section-${index + 1}`
        while (seen.has(id)) id = `${id}-${index}`
        heading.id = id
      }
      seen.add(heading.id)
      return { id: heading.id, text: heading.textContent?.trim() || '' }
    })
    setHeadings(nextHeadings)
  }, [pathname])

  // Last-updated date, fetched lazily from the build manifest.
  useEffect(() => {
    setLastUpdated(null)
    if (isLanding) return
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    let active = true
    fetch(`${basePath}/page-dates.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((dates) => {
        if (active && dates && dates[pathname]) setLastUpdated(dates[pathname])
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [pathname, isLanding])

  // Stronger editorial verification date, separate from last git update.
  useEffect(() => {
    setLastVerified(null)
    if (isLanding) return
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    let active = true
    fetch(`${basePath}/page-verified.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((dates) => {
        if (active && dates && dates[pathname]) setLastVerified(dates[pathname])
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [pathname, isLanding])

  const tabs = isEn ? enTabs : bnTabs

  const file = sourceFileFor(pathname)
  const dateLabel = formatDate(lastUpdated, isEn)
  const verifiedLabel = formatDate(lastVerified, isEn)
  const pageUrl = `https://deshistartup.com${pathname}`
  // Targets the report-mistake issue form; `page` prefills the form field with that id.
  const issueUrl = `${REPO_URL}/issues/new?template=report-mistake.yml&title=${encodeURIComponent(
    (isEn ? 'Mistake: ' : 'ভুল: ') + (pageTitle || pathname)
  )}&page=${encodeURIComponent(pageUrl)}`

  return (
    <>
      <a className="skip-link" href="#main">{isEn ? 'Skip to content' : 'মূল লেখায় যান'}</a>

      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href={localHref(isEn ? '/en' : '/')} aria-label={isEn ? 'Deshi Startup home' : 'দেশি স্টার্টআপ হোম'}>
            <img src={localHref('/deshi-mark.svg')} alt="" width="54" height="54" />
            <span>
              <strong>{isEn ? 'Deshi Startup' : 'দেশি স্টার্টআপ'}</strong>
              <small>{isEn ? 'The Bangladeshi startup manual' : 'বাংলাদেশে স্টার্টআপ গড়ার গাইড'}</small>
            </span>
          </a>

          <div className="header-search">
            <SearchBox isEn={isEn} />
          </div>

          <nav className="top-actions" aria-label={isEn ? 'Site actions' : 'সাইটের কাজ'}>
            <a className="gh-link" href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <GitHubIcon />
              <span>GitHub</span>
            </a>
            <LanguageSwitcher />
            <button
              className="nav-toggle"
              type="button"
              ref={navToggleRef}
              aria-label={
                isSidebarOpen
                  ? isEn
                    ? 'Close navigation'
                    : 'মেনু বন্ধ করুন'
                  : isEn
                    ? 'Open navigation'
                    : 'মেনু খুলুন'
              }
              aria-expanded={isSidebarOpen}
              aria-controls="sidebar"
              onClick={() => (isSidebarOpen ? closeSidebar() : setIsSidebarOpen(true))}
            >
              <span />
              <span />
              <span />
            </button>
          </nav>
        </div>
      </header>

      <div className="page-shell">
        <div
          className={isSidebarOpen ? 'sidebar-backdrop is-open' : 'sidebar-backdrop'}
          aria-hidden="true"
          onClick={() => closeSidebar(true)}
        />
        <div
          ref={sidebarRef}
          className={isSidebarOpen ? 'sidebar-wrap is-open' : 'sidebar-wrap'}
        >
          <Sidebar
            isEn={isEn}
            pathname={pathname}
            headings={isLanding ? [] : headings}
            onNavigate={() => closeSidebar()}
            onClose={() => closeSidebar(true)}
            closeButtonRef={sidebarCloseRef}
            isOpen={isSidebarOpen}
          />
        </div>

        <main className="content-canvas" id="main">
          <nav className="article-tabs" aria-label={isEn ? 'About this page' : 'এই পাতা নিয়ে'}>
            <div className="tab-group">
              <span className="tab active" aria-current="page">{tabs.article}</span>
              <a
                className="tab"
                href={`${REPO_URL}/discussions`}
                target="_blank"
                rel="noopener noreferrer"
                title={isEn ? 'Discuss on GitHub' : 'গিটহাবে আলোচনা করুন'}
              >
                {tabs.talk}
              </a>
            </div>
            <div className="article-actions">
              {isEditing ? (
                <button type="button" className="act-read tab-action-btn" onClick={handleRead}>
                  {tabs.read}
                </button>
              ) : (
                <span className="act-read is-current" aria-current="page">
                  {tabs.read}
                </span>
              )}

              {isLanding ? (
                <a className="act-edit" href={`${REPO_URL}/edit/main/${file}`} target="_blank" rel="noopener noreferrer">
                  <ActionPencil />
                  {tabs.edit}
                </a>
              ) : isEditing ? (
                <span className="act-edit is-current" aria-current="page">
                  <ActionPencil />
                  {tabs.edit}
                </span>
              ) : (
                <button type="button" className="act-edit tab-action-btn" onClick={handleContribute}>
                  <ActionPencil />
                  {tabs.edit}
                </button>
              )}

              <a className="act-history" href={`${REPO_URL}/commits/main/${file}`} target="_blank" rel="noopener noreferrer">
                {tabs.history}
              </a>
            </div>
          </nav>

          {flash && !isEditing && (
            <div className="edit-flash" role="status">
              <p>
                <strong>
                  {flash.updated
                    ? isEn
                      ? 'Your draft has been updated.'
                      : 'আপনার ড্রাফট হালনাগাদ হয়েছে।'
                    : isEn
                      ? 'Your contribution has been submitted.'
                      : 'আপনার অবদান জমা পড়েছে।'}
                </strong>{' '}
                {isEn
                  ? 'A reviewer will take a look, and once it is approved the change appears on this page.'
                  : 'একজন রিভিউয়ার এটা দেখবেন। অনুমোদন হয়ে গেলে পরিবর্তনটা এই পাতায় যুক্ত হবে।'}
              </p>
              <div className="edit-flash__actions">
                <a className="edit-btn" href={flash.prUrl} target="_blank" rel="noopener noreferrer">
                  {isEn ? 'View the pull request' : 'পুল রিকোয়েস্টটি দেখুন'}
                </a>
                <button
                  type="button"
                  className="edit-flash__close"
                  onClick={() => setFlash(null)}
                  aria-label={isEn ? 'Dismiss' : 'বার্তাটি সরান'}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {isEditing && (
            <ContributionEditor
              pathname={pathname}
              isEn={isEn}
              fallbackTitle={pageTitle}
              session={session}
              authToken={authToken}
              exitSignal={exitSignal}
              onExit={handleExit}
              onSubmitted={handleSubmitted}
              onSessionExpired={handleSessionExpired}
              onReauthenticate={() => setAuthOpen(true)}
              onReadyChange={setEditorReady}
              onDirtyChange={setIsDirty}
            />
          )}

          {!isLanding && !isEditing && (
            <div className="article-lede">
              <Breadcrumbs isEn={isEn} pathname={pathname} pageTitle={pageTitle} />
              <div className="article-meta">
                {/* One date, not two. "Last updated" is the last commit, so a typo fix bumps it;
                    `verified:` means someone re-checked the claims against the official source.
                    Where a page carries the stronger signal, that is the one worth showing. */}
                {verifiedLabel ? (
                  <span className="meta-date">
                    {isEn ? 'Last verified: ' : 'সর্বশেষ যাচাই: '}
                    {verifiedLabel}
                  </span>
                ) : (
                  dateLabel && (
                    <span className="meta-date">
                      {isEn ? 'Last updated: ' : 'সর্বশেষ হালনাগাদ: '}
                      {dateLabel}
                    </span>
                  )
                )}
                <a href={issueUrl} target="_blank" rel="noopener noreferrer">
                  {isEn ? 'Report a mistake' : 'ভুল জানান'}
                </a>
              </div>
              {headings.length > 2 && (
                <details className="page-toc">
                  <summary>{isEn ? 'On this page' : 'এই পাতায়'}</summary>
                  <ul>
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <a href={`#${heading.id}`}>{heading.text}</a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          <article
            className={isEditing && !editorReady ? 'article is-yielding' : 'article'}
            data-pagefind-body
            ref={articleRef}
            hidden={editorReady}
          >
            {children}
          </article>

          {!isLanding && !isEditing && (
            <footer className="article-footer">
              <h2>{isEn ? 'Help improve this page' : 'এই পাতা আরও ভালো করুন'}</h2>
              <div className="contrib-row">
                <a href={`${REPO_URL}/edit/main/${file}`} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                  {isEn ? 'Edit on GitHub' : 'GitHub-এ সম্পাদনা করুন'}
                </a>
                <a href={issueUrl} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
                  {isEn ? 'Report a mistake' : 'ভুল পেলে জানান'}
                </a>
                <a href={localHref(isEn ? '/en/contribute' : '/contribute')}>
                  {isEn ? 'How to contribute' : 'কীভাবে অবদান রাখবেন'}
                </a>
              </div>
            </footer>
          )}
        </main>
      </div>

      <footer className="site-footer">
        <div>
          {isEn
            ? 'Deshi Startup – an open, Bangladesh-specific founder operating manual, written together, free for everyone.'
            : 'দেশি স্টার্টআপ – বাংলাদেশি ফাউন্ডারদের জন্য উন্মুক্ত, বাস্তব গাইড। সবাই মিলে লেখা, সবার জন্য ফ্রি।'}
        </div>
        <div className="footer-links">
          <a href={localHref(isEn ? '/en/start-here' : '/start-here')}>{isEn ? 'Start here' : 'শুরু করুন'}</a>
          <a href={localHref(isEn ? '/en/about' : '/about')}>{isEn ? 'About & editorial policy' : 'পরিচিতি ও সম্পাদকীয় নীতি'}</a>
          <a href={localHref(isEn ? '/en/contribute' : '/contribute')}>{isEn ? 'How to contribute' : 'কীভাবে অবদান রাখবেন'}</a>
          <a href={localHref(isEn ? '/en/sitemap' : '/sitemap')}>{isEn ? 'Sitemap' : 'সাইটম্যাপ'}</a>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer">
            {isEn ? 'Report a mistake' : 'ভুল জানান'}
          </a>
        </div>
        <p className="footer-legal">
          {isEn
            ? 'This site is general guidance, not legal or tax advice. Fees, forms and rules change – always confirm with official government sources (RJSC, NBR, Bangladesh Bank) before acting.'
            : 'এই সাইট সাধারণ গাইড দেয়। আইনি বা কর পরামর্শ নয়। ফি, ফর্ম ও নিয়ম বদলায়। কাজের আগে সরকারি উৎস (RJSC, NBR, বাংলাদেশ ব্যাংক) থেকে যাচাই করে নিন।'}
        </p>
      </footer>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={handleAuthenticated}
        isEn={isEn}
        fallbackHref={`${REPO_URL}/edit/main/${file}`}
      />
    </>
  )
}
