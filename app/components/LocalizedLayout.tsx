'use client'

import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import LanguageSwitcher from './LanguageSwitcher'
import SearchBox from './SearchBox'
import type { SubmitResult } from './ContributionEditor'
import { cleanRoute } from '../lib/clean-route'
import { clearAuth, getStoredAuth, UserInfo } from '../lib/client-auth'
import {
  bnNav,
  DISCORD_URL,
  enNav,
  FACEBOOK_GROUP_URL,
  FACEBOOK_URL,
  LINKEDIN_URL,
  REPO_URL,
  YOUTUBE_URL
} from '../nav.config'
import sectionsLite from '../generated/sections-lite.json'

// Heavy (Milkdown) – only loads when a contributor opens the editor.
const ContributionEditor = dynamic(() => import('./ContributionEditor'), { ssr: false })
// Google Identity Services and a focus-trapping dialog, for the small share of
// readers who sign in. Kept out of the chunk every reader downloads.
const AuthModal = dynamic(() => import('./AuthModal'), { ssr: false })

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

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {/* One path, evenodd: the "f" is a hole punched through the disc, not a
          white shape painted on top. A knocked-out counter stays correct on
          whatever surface the header happens to be, so the icon never has to
          know the background colour. */}
      <path
        fillRule="evenodd"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM13.5 21v-8h2.75l.41-3.13H13.5v-2c0-.91.25-1.53 1.58-1.53h1.69V3.54a22.6 22.6 0 0 0-2.46-.13c-2.43 0-4.1 1.49-4.1 4.2v2.26H7.46V13h2.75v8h3.29Z"
      />
    </svg>
  )
}

/* Carried by the এডিট action so it still reads as "edit" on a phone, where
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

/* Both "On this page" lists are built from the article's own h2s. The shell is
   one shared client component that cannot know the route while the static HTML
   is rendered, so the lists used to be filled in after hydration – and a
   collapsed accordion appearing above the article pushed the whole page down
   the moment the JavaScript landed. The postbuild pass now writes both lists
   into the HTML and marks the page with `deshi:toc`; when that marker is there
   the first client render reads the same h2s and reproduces the same markup, so
   there is nothing left to shift. `next dev` runs no postbuild pass, hence the
   unmarked path stays exactly as it was. */

const HEADING_LIMIT = 16

function slugifyHeading(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

/** `assignIds` is the unmarked path: give an id to any h2 that reached the
 *  browser without one, so its link still has somewhere to go. A production
 *  build runs rehype-slug and never needs it. */
function collectHeadings(assignIds: boolean): HeadingItem[] {
  const article = document.querySelector('.article')
  if (!article) return []

  const nodes = [...article.querySelectorAll('h2')].slice(0, HEADING_LIMIT)

  if (assignIds) {
    const seen = new Set<string>()
    nodes.forEach((heading, index) => {
      if (!heading.id) {
        let id = slugifyHeading(heading.textContent || '') || `section-${index + 1}`
        while (seen.has(id)) id = `${id}-${index}`
        heading.id = id
      }
      seen.add(heading.id)
    })
  }

  return nodes
    .map((heading) => ({ id: heading.id, text: heading.textContent?.trim() || '' }))
    .filter((heading) => heading.id && heading.text)
}

function hasServerRenderedToc() {
  return !!document.querySelector('meta[name="deshi:toc"]')
}

function initialHeadings(): HeadingItem[] {
  if (typeof document === 'undefined') return []
  return hasServerRenderedToc() ? collectHeadings(false) : []
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
          <div className="sidebar-group sidebar-group--toc">
            <p>{isEn ? 'On This Page' : 'এই পেজে'}</p>
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
            : 'সম্পূর্ণ ফ্রি ও ওপেন সোর্স। যে কেউ এডিট বা আপডেট করতে পারেন, আপনিও।'}
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
  const crumbs = [{ href: isEn ? '/en' : '/', label: isEn ? 'Home' : 'হোম' }]

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
  edit: 'এডিট',
  history: 'কী বদলেছে'
}

interface LocalizedLayoutProps {
  children?: React.ReactNode
}

export default function LocalizedLayout({ children }: LocalizedLayoutProps) {
  const pathname = cleanRoute(usePathname())
  const isEn = pathname.startsWith('/en/') || pathname === '/en'
  const isLanding = pathname === '/' || pathname === '/en'
  const isPrivateReview =
    pathname === '/contribute/review' || pathname.startsWith('/contribute/review/')
  // The contributor list is generated from merged pull requests, so the article
  // lede has nothing true to say about it: "Home › Contributors" is a crumb to
  // nowhere, there is no edit date to report and a mistake belongs in a rename
  // request, not a content correction.
  const isCredits = pathname === '/contributors' || pathname === '/en/contributors'
  const isContact = pathname === '/contact' || pathname === '/en/contact'
  // One 404 document serves every unmatched URL, so the router reports the
  // synthetic `/_not-found` route. There is no source file behind it: an
  // "Edit on GitHub" link would open GitHub's new-file editor at a path that
  // does not exist, "View history" would 404, and a mistake report would name
  // a page nobody can read. Drop the page-contribution chrome; the 404 body
  // carries its own way out.
  const isNotFound = pathname === '/_not-found' || pathname === '/en/_not-found'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [headings, setHeadings] = useState<HeadingItem[]>(initialHeadings)
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
  // Latched separately from `authOpen` so the dialog stays mounted through its
  // close, instead of being torn out mid-transition the first time it is used.
  const [authMounted, setAuthMounted] = useState(false)
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
    if (!wantsEdit || pathname === '/' || pathname === '/en' || isPrivateReview || isNotFound) return
    if (stored) setIsEditing(true)
    else openAuth()
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
  // এডিট offers a fresh sign-in rather than the same failure again.
  const handleSessionExpired = useCallback(() => {
    clearAuth()
    setSession(null)
    setAuthToken(null)
  }, [])

  function openAuth() {
    setAuthMounted(true)
    setAuthOpen(true)
  }

  function handleContribute() {
    if (session && authToken) enterEdit()
    else openAuth()
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

  // Opening a URL that names a #fragment has to actually land on it. The router
  // settles the scroll position itself while hydrating, so a reader arriving at
  // a shared footnote, a heading from search, or a glossary term from an inline
  // definition popover was being dropped at the top of a long page instead. This
  // only fires when nothing has scrolled yet, so it never fights a restored
  // position, and it scrolls instantly rather than animating the length of the
  // document past the reader.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return undefined
    let frame = 0
    const settle = () => {
      if (window.scrollY > 0) return
      document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
    frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(settle)
    })
    return () => window.cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    // @ts-ignore – `inert` lands as a DOM property before React 19 types it as a prop.
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

    setHeadings(collectHeadings(!hasServerRenderedToc()))
  }, [pathname])

  // Both dates for this route, read from the meta tags the postbuild pass writes
  // into every prerendered page (same reason the breadcrumb leaf is injected
  // there: the shared client shell cannot know the route during the static
  // root-layout render). Navigation is full document loads, so the tags always
  // describe the page on screen.
  //
  // Fetching the site-wide maps instead cost every first-time reader ~40 KB to
  // render one date, which is the wrong trade on the phone-and-patchy-bandwidth
  // scene this site is built for. `next dev` runs no postbuild pass, so the
  // maps stay the fallback and dev keeps showing dates.
  useEffect(() => {
    setLastUpdated(null)
    setLastVerified(null)
    if (isLanding) return

    const readMeta = (name: string) =>
      document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content || null

    const updated = readMeta('deshi:updated')
    const verified = readMeta('deshi:verified')
    if (updated || verified) {
      setLastUpdated(updated)
      setLastVerified(verified)
      return
    }

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    let active = true
    Promise.all(
      ['page-dates.json', 'page-verified.json'].map((name) =>
        fetch(`${basePath}/${name}`)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      )
    ).then(([dates, verifiedDates]) => {
      if (!active) return
      if (dates?.[pathname]) setLastUpdated(dates[pathname])
      if (verifiedDates?.[pathname]) setLastVerified(verifiedDates[pathname])
    })
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
            {/* Both social links carry an aria-label: below 1180px the span is
                display:none, which drops it from the accessibility tree, and
                the icon is aria-hidden — without the label the link would have
                no accessible name at all in that range. */}
            <a
              className="social-link"
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={isEn ? 'Deshi Startup on GitHub' : 'GitHub-এ দেশি স্টার্টআপ'}
            >
              <GitHubIcon />
              <span>GitHub</span>
            </a>
            <a
              className="social-link"
              href={FACEBOOK_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={isEn ? 'Join the Deshi Startup Facebook community' : 'দেশি স্টার্টআপ ফেসবুক কমিউনিটিতে যোগ দিন'}
            >
              <FacebookIcon />
              <span>{isEn ? 'Community' : 'কমিউনিটি'}</span>
            </a>
            {!isPrivateReview && <LanguageSwitcher />}
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
            headings={isLanding || isPrivateReview ? [] : headings}
            onNavigate={() => closeSidebar()}
            onClose={() => closeSidebar(true)}
            closeButtonRef={sidebarCloseRef}
            isOpen={isSidebarOpen}
          />
        </div>

        <main className="content-canvas" id="main">
          {!isPrivateReview && !isNotFound && <nav className="article-tabs" aria-label={isEn ? 'About this page' : 'এই পেজ নিয়ে'}>
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
          </nav>}

          {flash && !isEditing && !isPrivateReview && (
            <div className="edit-flash" role="status">
              <p>
                <strong>
                  {flash.updated
                    ? isEn
                      ? 'Your draft has been updated.'
                      : 'আপনার ড্রাফট আপডেট হয়েছে।'
                    : isEn
                      ? 'Your contribution has been submitted.'
                      : 'আপনার এডিট জমা হয়েছে।'}
                </strong>{' '}
                {isEn
                  ? 'A reviewer will take a look, and once it is approved the change appears on this page.'
                  : 'রিভিউয়ার অ্যাপ্রুভ করলে চেঞ্জগুলো এই পেজে লাইভ হবে।'}
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

          {isEditing && !isPrivateReview && (
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
              onReauthenticate={openAuth}
              onReadyChange={setEditorReady}
              onDirtyChange={setIsDirty}
            />
          )}

          {!isLanding && !isEditing && !isPrivateReview && !isCredits && !isNotFound && (
            <div className="article-lede">
              <Breadcrumbs isEn={isEn} pathname={pathname} pageTitle={pageTitle} />
              {!isContact && (
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
                        {isEn ? 'Last updated: ' : 'সর্বশেষ আপডেট: '}
                        {dateLabel}
                      </span>
                    )
                  )}
                  <a href={issueUrl} target="_blank" rel="noopener noreferrer">
                    {isEn ? 'Report a mistake' : 'ফিডব্যাক দিন'}
                  </a>
                </div>
              )}
              {headings.length > 2 && (
                <details className="page-toc">
                  <summary>{isEn ? 'On this page' : 'এই পেজে'}</summary>
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
            className={`${isEditing && !editorReady ? 'article is-yielding' : 'article'}${isPrivateReview ? ' article--utility' : ''}`}
            data-pagefind-body={isPrivateReview ? undefined : ''}
            data-pagefind-ignore={isPrivateReview ? 'all' : undefined}
            ref={articleRef}
            hidden={editorReady}
          >
            {children}
          </article>

          {!isLanding && !isEditing && !isPrivateReview && !isNotFound && !isContact && (
            <footer className="article-footer">
              <h2>{isEn ? 'Help improve this page' : 'এই পেজ আরও ভালো করুন'}</h2>
              <div className="contrib-row">
                <a href={`${REPO_URL}/edit/main/${file}`} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                  {isEn ? 'Edit on GitHub' : 'GitHub-এ এডিট করুন'}
                </a>
                <a href={issueUrl} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
                  {isEn ? 'Report a mistake' : 'ফিডব্যাক দিন'}
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
        <nav className="footer-nav" aria-label={isEn ? 'Footer navigation' : 'আরও লিংক'}>
          <div className="footer-link-group">
            <p className="footer-link-label" id="footer-project-label">
              {isEn ? 'Project' : 'প্রজেক্ট'}
            </p>
            <ul className="footer-link-list" aria-labelledby="footer-project-label">
              <li>
                <a href={localHref(isEn ? '/en/start-here' : '/start-here')}>
                  {isEn ? 'Start here' : 'শুরু করুন'}
                </a>
              </li>
              <li>
                <a href={localHref(isEn ? '/en/about' : '/about')}>
                  {isEn ? 'About & editorial policy' : 'পরিচিতি ও সম্পাদকীয় নীতি'}
                </a>
              </li>
              <li>
                <a href={localHref(isEn ? '/en/contact' : '/contact')}>
                  {isEn ? 'Contact us' : 'যোগাযোগ করুন'}
                </a>
              </li>
              <li>
                <a href={localHref(isEn ? '/en/contribute' : '/contribute')}>
                  {isEn ? 'How to contribute' : 'কীভাবে অবদান রাখবেন'}
                </a>
              </li>
              <li>
                <a href={localHref(isEn ? '/en/sitemap' : '/sitemap')}>
                  {isEn ? 'Sitemap' : 'সাইটম্যাপ'}
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-link-group">
            <p className="footer-link-label" id="footer-community-label">
              {isEn ? 'Community' : 'কমিউনিটি'}
            </p>
            <ul className="footer-link-list" aria-labelledby="footer-community-label">
              <li>
                <a href={FACEBOOK_GROUP_URL} target="_blank" rel="noopener noreferrer">
                  {isEn ? 'Join the Facebook community' : 'ফেসবুক কমিউনিটিতে যোগ দিন'}
                </a>
              </li>
              <li>
                <a href={FACEBOOK_URL} target="_blank" rel="me noopener noreferrer">
                  {isEn ? 'Facebook page' : 'ফেসবুক পেজ'}
                </a>
              </li>
              <li>
                <a href={LINKEDIN_URL} target="_blank" rel="me noopener noreferrer">LinkedIn</a>
              </li>
              <li>
                <a href={YOUTUBE_URL} target="_blank" rel="me noopener noreferrer">YouTube</a>
              </li>
              <li>
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
              </li>
              <li>
                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                  {isEn ? 'Contributor Discord' : 'কন্ট্রিবিউটর ডিসকর্ড'}
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-link-group">
            <p className="footer-link-label" id="footer-help-label">
              {isEn ? 'Help & policies' : 'সহায়তা ও নীতি'}
            </p>
            <ul className="footer-link-list" aria-labelledby="footer-help-label">
              <li>
                <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer">
                  {isEn ? 'Report a mistake' : 'ফিডব্যাক দিন'}
                </a>
              </li>
              <li>
                <a href={localHref(isEn ? '/en/privacy' : '/privacy')}>
                  {isEn ? 'Privacy' : 'গোপনীয়তা'}
                </a>
              </li>
              <li>
                <a href={localHref(isEn ? '/en/terms' : '/terms')}>
                  {isEn ? 'Terms' : 'ব্যবহারের শর্ত'}
                </a>
              </li>
            </ul>
          </div>
        </nav>
        <p className="footer-legal">
          {isEn
            ? 'This site is general guidance, not legal or tax advice. Fees, forms and rules change – always confirm with official government sources (RJSC, NBR, Bangladesh Bank) before acting.'
            : 'এই সাইট সাধারণ গাইড দেয়। আইনি বা কর পরামর্শ নয়। ফি, ফর্ম ও নিয়ম বদলায়। কাজের আগে সরকারি সোর্স (RJSC, NBR, বাংলাদেশ ব্যাংক) থেকে যাচাই করে নিন।'}
        </p>
      </footer>

      {authMounted && (
        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          onAuthenticated={handleAuthenticated}
          isEn={isEn}
          fallbackHref={`${REPO_URL}/edit/main/${file}`}
        />
      )}
    </>
  )
}
