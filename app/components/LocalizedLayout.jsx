'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import ContributionWidget from './ContributionWidget'
import LanguageSwitcher from './LanguageSwitcher'
import SearchBox from './SearchBox'

const REPO_URL = 'https://github.com/Deshi-Startup/deshistartup'
const RAW_REPO_URL = 'https://raw.githubusercontent.com/Deshi-Startup/deshistartup/main'

const bnNav = [
  ['/', 'প্রধান পাতা'],
  ['/start-here', 'শুরু করুন'],
  ['/startup-vs-sme', 'স্টার্টআপ বনাম এসএমই'],
  ['/idea-validation', 'আইডিয়া যাচাই'],
  ['/customers', 'গ্রাহক খোঁজা'],
  ['/legal-roadmap', 'আইনগত পথনির্দেশনা'],
  ['/company-types', 'কোম্পানির ধরন'],
  ['/rjsc-name-clearance', 'RJSC / নাম ছাড়পত্র'],
  ['/registration', 'ব্যবসা নিবন্ধন'],
  ['/trade-license', 'ট্রেড লাইসেন্স'],
  ['/e-tin-vat-bin', 'e-TIN ও ভ্যাট/বিআইএন'],
  ['/payments', 'পেমেন্ট ব্যবস্থা'],
  ['/founder-life', 'উদ্যোক্তার জীবন'],
  ['/phase-one', 'ধাপ ১ রোডম্যাপ'],
  ['/phase-two', 'ধাপ ২ রোডম্যাপ'],
  ['/phase-three', 'ধাপ ৩ রোডম্যাপ'],
  ['/phase-four', 'ধাপ ৪ রোডম্যাপ']
]

const enNav = [
  ['/en', 'Home'],
  ['/en/start-here', 'Start Here'],
  ['/en/startup-vs-sme', 'Startup vs SME'],
  ['/en/idea-validation', 'Idea Validation'],
  ['/en/customers', 'Finding Customers'],
  ['/en/legal-roadmap', 'Legal Roadmap'],
  ['/en/registration', 'Business Registration'],
  ['/en/trade-license', 'Trade License'],
  ['/en/payments', 'Payment Systems'],
  ['/en/founder-life', 'Founder Life'],
  ['/en/phase-one', 'Phase 1 Roadmap'],
  ['/en/phase-two', 'Phase 2 Roadmap'],
  ['/en/phase-three', 'Phase 3 Roadmap'],
  ['/en/phase-four', 'Phase 4 Roadmap']
]

function localHref(href) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  if (!href.startsWith('/')) return href
  if (!basePath) return href
  if (href === '/') return basePath || '/'
  return `${basePath}${href}`
}

function encodeGitHubPath(sourcePath) {
  return sourcePath.split('/').map((part) => encodeURIComponent(part)).join('/')
}

function getContentSourcePath(pathname) {
  const cleanPath = (pathname || '/').replace(/\/+$/, '') || '/'
  const isEn = cleanPath === '/en' || cleanPath.startsWith('/en/')
  const contentRoot = isEn ? 'app/(contents)/en' : 'app/(contents)/(bn)'
  const slug = isEn
    ? cleanPath.replace(/^\/en\/?/, '').replace(/^\/+|\/+$/g, '')
    : cleanPath.replace(/^\/+|\/+$/g, '')

  return slug ? `${contentRoot}/${slug}/page.mdx` : `${contentRoot}/page.mdx`
}

function SiteLogo({ isEn }) {
  return (
    <a className="brand" href={localHref(isEn ? '/en' : '/')} aria-label={isEn ? 'Deshi Startup home' : 'দেশি স্টার্টআপ হোম'}>
      <img src={localHref('/deshi-mark.svg')} alt="" />
      <span>
        <strong>{isEn ? 'Deshi Startup' : 'দেশি স্টার্টআপ'}</strong>
        <small>{isEn ? 'From the open founder manual' : 'বাংলাদেশি উদ্যোক্তার গাইড'}</small>
      </span>
    </a>
  )
}

function Sidebar({ isEn, headings, adminUrl, historyUrl, sourceFileUrl }) {
  const nav = isEn ? enNav : bnNav

  return (
    <aside className="sidebar" id="sidebar" aria-label={isEn ? 'Primary navigation' : 'প্রধান নেভিগেশন'}>
      <nav>
        <p>{isEn ? 'Navigation' : 'বিষয়সমূহ'}</p>
        {nav.map(([href, label]) => (
          <a href={localHref(href)} key={href}>{label}</a>
        ))}

        <p>{isEn ? 'On This Page' : 'এই পাতায়'}</p>
        {headings.length > 0 ? (
          headings.map((heading) => (
            <a href={`#${heading.id}`} key={heading.id}>{heading.text}</a>
          ))
        ) : (
          <a href="#main">{isEn ? 'Top' : 'পাতার শুরু'}</a>
        )}

        <p>{isEn ? 'Tools' : 'অবদান'}</p>
        <a href={localHref(isEn ? '/en/contribute' : '/contribute')}>
          {isEn ? 'How to contribute' : 'কীভাবে অবদান রাখবেন'}
        </a>
        <a href={localHref(isEn ? '/en/editorial-policy' : '/editorial-policy')}>
          {isEn ? 'Editorial policy' : 'সম্পাদকীয় নীতি'}
        </a>
        <a href={adminUrl}>
          {isEn ? 'Editor dashboard' : 'সম্পাদক ড্যাশবোর্ড'}
        </a>
        <a href={historyUrl} target="_blank" rel="noopener noreferrer">
          {isEn ? 'Page history' : 'পাতার ইতিহাস'}
        </a>
        <a href={sourceFileUrl} target="_blank" rel="noopener noreferrer">
          {isEn ? 'Page source' : 'পাতার সোর্স'}
        </a>
        <a href="https://github.com/Deshi-Startup/deshistartup" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href="https://github.com/Deshi-Startup/deshistartup/issues" target="_blank" rel="noopener noreferrer">
          {isEn ? 'Report an issue' : 'ভুল জানান'}
        </a>
      </nav>
    </aside>
  )
}

export default function LocalizedLayout({ children }) {
  const pathname = usePathname()
  const isEn = pathname.startsWith('/en/') || pathname === '/en'
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [headings, setHeadings] = useState([])
  const [pageUrl, setPageUrl] = useState(pathname)

  const sourcePath = useMemo(() => getContentSourcePath(pathname), [pathname])
  const encodedSourcePath = useMemo(() => encodeGitHubPath(sourcePath), [sourcePath])
  const sourceFileUrl = `${REPO_URL}/blob/main/${encodedSourcePath}`
  const rawSourceUrl = `${RAW_REPO_URL}/${encodedSourcePath}`
  const historyUrl = `${REPO_URL}/commits/main/${encodedSourcePath}`
  const adminUrl = localHref('/admin/')

  useEffect(() => {
    if (isAdmin) return
    document.documentElement.lang = isEn ? 'en' : 'bn'
  }, [isEn, isAdmin])

  useEffect(() => {
    setPageUrl(window.location.href)
  }, [pathname])

  useEffect(() => {
    if (isAdmin) {
      setHeadings([])
      return
    }

    setIsSidebarOpen(false)

    const slugify = (value) =>
      value
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '')

    const nextHeadings = [...document.querySelectorAll('.article h2')]
      .slice(0, 10)
      .map((heading, index) => {
        if (!heading.id) {
          heading.id = slugify(heading.textContent || '') || `section-${index + 1}`
        }

        return {
          id: heading.id,
          text: heading.textContent?.replace(/#$/, '').trim() || `${isEn ? 'Section' : 'অংশ'} ${index + 1}`
        }
      })

    setHeadings(nextHeadings)
  }, [pathname, isEn, isAdmin])

  const tabs = useMemo(
    () =>
      isEn
        ? { article: 'Article', talk: 'Talk', read: 'Read', edit: 'Edit', history: 'View history', contribute: 'Contribute' }
        : { article: 'গাইড', talk: 'আলোচনা', read: 'পড়ুন', edit: 'সংশোধন', history: 'ইতিহাস', contribute: 'অবদান' },
    [isEn]
  )

  function openPublicEditor() {
    document.getElementById('contribution-actions')?.scrollIntoView({ block: 'nearest' })
    window.dispatchEvent(new CustomEvent('deshi:open-contribution-editor'))
  }

  if (isAdmin) {
    return children
  }

  const shell = (
    <>
      <a className="skip-link" href="#main">{isEn ? 'Skip to content' : 'মূল লেখায় যান'}</a>

      <header className="site-header">
        <div className="header-inner">
          <SiteLogo isEn={isEn} />
          <SearchBox isEn={isEn} />

          <button
            className="nav-toggle"
            type="button"
            aria-label={isEn ? 'Open navigation' : 'নেভিগেশন খুলুন'}
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar"
            onClick={() => setIsSidebarOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className="top-actions" aria-label={isEn ? 'Page actions' : 'পৃষ্ঠা কাজ'}>
            <a href="#read">{tabs.read}</a>
            <a href={localHref(isEn ? '/en/contribute' : '/contribute')}>
              {tabs.contribute}
            </a>
            <button type="button" onClick={openPublicEditor}>
              {tabs.edit}
            </button>
            <a href={historyUrl} target="_blank" rel="noopener noreferrer">
              {tabs.history}
            </a>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <div className="page-shell">
        <div className={isSidebarOpen ? 'sidebar-backdrop is-open' : 'sidebar-backdrop'} onClick={() => setIsSidebarOpen(false)} />
        <div className={isSidebarOpen ? 'sidebar-wrap is-open' : 'sidebar-wrap'}>
          <Sidebar isEn={isEn} headings={headings} adminUrl={adminUrl} historyUrl={historyUrl} sourceFileUrl={sourceFileUrl} />
        </div>

        <main className="content-canvas" id="main">
          <div className="article-tabs" id="read">
            <div className="tab-group" role="tablist" aria-label={isEn ? 'Article type' : 'গাইড ধরন'}>
              <button className="tab active" type="button">{tabs.article}</button>
              <button className="tab" type="button">{tabs.talk}</button>
            </div>
            <ContributionWidget
              isEn={isEn}
              pageUrl={pageUrl}
              sourcePath={sourcePath}
              adminUrl={adminUrl}
              historyUrl={historyUrl}
              sourceFileUrl={sourceFileUrl}
              rawSourceUrl={rawSourceUrl}
            />
          </div>

          <article className="article" data-pagefind-body>
            {children}
          </article>
        </main>
      </div>

      <footer className="site-footer">
        {isEn
          ? 'Deshi Startup — an open, Bangladesh-specific founder operating manual.'
          : 'দেশি স্টার্টআপ — বাংলাদেশের উদ্যোক্তাদের জন্য উন্মুক্ত, বাস্তবভিত্তিক গাইড।'}
      </footer>
    </>
  )

  return shell
}
