'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import LanguageSwitcher from './LanguageSwitcher'
import SearchBox from './SearchBox'
import { bnNav, enNav, REPO_URL } from '../nav.config'
import sectionsLite from '../generated/sections-lite.json'

function localHref(href) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  if (!href.startsWith('/')) return href
  if (!basePath) return href
  return href === '/' ? basePath || '/' : `${basePath}${href}`
}

function sourceFileFor(pathname) {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const rest = pathname === '/en' ? '' : pathname.slice(3)
    return `app/(contents)/en${rest}/page.mdx`
  }
  return `app/(contents)/(bn)${pathname === '/' ? '' : pathname}/page.mdx`
}

const bengaliDigits = (value) => String(value).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d])

function formatDate(iso, isEn) {
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

function Sidebar({ isEn, pathname, headings, onNavigate }) {
  const nav = isEn ? enNav : bnNav

  return (
    <aside className="sidebar" id="sidebar" aria-label={isEn ? 'Primary navigation' : 'প্রধান মেনু'}>
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
            : 'সম্পূর্ণ ফ্রি ও ওপেন সোর্স। প্রতিটি গাইড যে কেউ আরও ভালো করতে পারেন, আপনিও।'}
        </p>
      </nav>
    </aside>
  )
}

function Breadcrumbs({ isEn, pathname, pageTitle }) {
  const segments = pathname.split('/').filter(Boolean)
  const rest = isEn ? segments.slice(1) : segments
  if (rest.length === 0) return null

  const sectionTitles = (isEn ? sectionsLite.en : sectionsLite.bn) || {}
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
        <li aria-current="page">{pageTitle || '…'}</li>
      </ol>
    </nav>
  )
}

const enTabs = { article: 'Article', talk: 'Talk', read: 'Read', edit: 'Edit', history: 'View history' }
const bnTabs = {
  article:
    'গাইড',
  talk:
    'আলোচনা',
  read:
    'পড়ুন',
  edit:
    'সম্পাদনা',
  history:
    'ইতিহাস'
}

export default function LocalizedLayout({ children }) {
  const pathname = usePathname()
  const isEn = pathname.startsWith('/en/') || pathname === '/en'
  const isLanding = pathname === '/' || pathname === '/en'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [headings, setHeadings] = useState([])
  const [pageTitle, setPageTitle] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [lastVerified, setLastVerified] = useState(null)
  const [readMinutes, setReadMinutes] = useState(null)

  useEffect(() => {
    document.documentElement.lang = isEn ? 'en' : 'bn'
  }, [isEn])

  useEffect(() => {
    setIsSidebarOpen(false)

    const article = document.querySelector('.article')
    if (!article) return

    const h1 = article.querySelector('h1')
    // Short form for chrome (breadcrumb leaf, issue titles): cut at the em dash.
    setPageTitle(h1 ? h1.textContent.split('–')[0].trim() : '')

    const slugify = (value) =>
      value.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')

    const seen = new Set()
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

    const words = (article.textContent || '').trim().split(/\s+/).length
    setReadMinutes(words > 100 ? Math.max(1, Math.round(words / 200)) : null)
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
  const issueUrl = `${REPO_URL}/issues/new?title=${encodeURIComponent(
    (isEn ? 'Problem: ' : 'ভুল/পরামর্শ: ') + (pageTitle || pathname)
  )}&body=${encodeURIComponent((isEn ? 'Page: ' : 'পাতা: ') + pageUrl + '\n\n')}`

  return (
    <>
      <a className="skip-link" href="#main">{isEn ? 'Skip to content' : 'মূল লেখায় যান'}</a>

      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href={localHref(isEn ? '/en' : '/')} aria-label={isEn ? 'Deshi Startup home' : 'দেশি স্টার্টআপ হোম'}>
            <img src={localHref('/deshi-mark.svg')} alt="" width="54" height="54" />
            <span>
              <strong>{isEn ? 'Deshi Startup' : 'দেশি স্টার্টআপ'}</strong>
              <small>{isEn ? 'From the open founder manual' : 'বাংলাদেশি উদ্যোক্তার গাইড'}</small>
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
              aria-label={isEn ? 'Toggle navigation' : 'মেনু খুলুন/বন্ধ করুন'}
              aria-expanded={isSidebarOpen}
              aria-controls="sidebar"
              onClick={() => setIsSidebarOpen((value) => !value)}
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
          onClick={() => setIsSidebarOpen(false)}
        />
        <div className={isSidebarOpen ? 'sidebar-wrap is-open' : 'sidebar-wrap'}>
          <Sidebar
            isEn={isEn}
            pathname={pathname}
            headings={isLanding ? [] : headings}
            onNavigate={() => setIsSidebarOpen(false)}
          />
        </div>

        <main className="content-canvas" id="main">
          <div className="article-tabs" id="read">
            <div className="tab-group" role="tablist" aria-label={isEn ? 'Page type' : 'পাতার ধরন'}>
              <button className="tab active" type="button">{tabs.article}</button>
              <button className="tab" type="button" title={isEn ? 'Coming soon' : 'শিগগিরই আসছে'}>
                {tabs.talk}
              </button>
            </div>
            <div className="article-actions">
              <a href="#read">{tabs.read}</a>
              <a href={`${REPO_URL}/edit/main/${file}`} target="_blank" rel="noopener noreferrer">
                {tabs.edit}
              </a>
              <a href={`${REPO_URL}/commits/main/${file}`} target="_blank" rel="noopener noreferrer">
                {tabs.history}
              </a>
            </div>
          </div>

          {!isLanding && (
            <div className="article-lede">
              <Breadcrumbs isEn={isEn} pathname={pathname} pageTitle={pageTitle} />
              {(dateLabel || verifiedLabel || readMinutes) && (
                <div className="article-meta">
                  {dateLabel && (
                    <span className="meta-date">
                      {isEn ? 'Last updated: ' : 'সর্বশেষ হালনাগাদ: '}
                      {dateLabel}
                    </span>
                  )}
                  {verifiedLabel && (
                    <span className="meta-date">
                      {isEn ? 'Last verified: ' : 'সর্বশেষ যাচাই: '}
                      {verifiedLabel}
                    </span>
                  )}
                  {readMinutes && (
                    <span>
                      {isEn ? `~${readMinutes} min read` : `পড়তে ~${bengaliDigits(readMinutes)} মিনিট`}
                    </span>
                  )}
                  <a href={issueUrl} target="_blank" rel="noopener noreferrer">
                    {isEn ? 'Report a mistake' : 'ভুল জানান'}
                  </a>
                </div>
              )}
              {headings.length > 2 && (
                <details className="page-toc" style={{ marginTop: 12 }}>
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

          <article className="article" data-pagefind-body>
            {children}
          </article>

          {!isLanding && (
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
            : 'দেশি স্টার্টআপ – বাংলাদেশি ফাউন্ডারদের জন্য খোলা, বাস্তব গাইড। সবাই মিলে লেখা, সবার জন্য ফ্রি।'}
        </div>
        <div className="footer-links">
          <a href={localHref(isEn ? '/en/start-here' : '/start-here')}>{isEn ? 'Start here' : 'শুরু করুন'}</a>
          <a href={localHref(isEn ? '/en/contribute' : '/contribute')}>{isEn ? 'How to contribute' : 'কীভাবে অবদান রাখবেন'}</a>
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
    </>
  )
}
