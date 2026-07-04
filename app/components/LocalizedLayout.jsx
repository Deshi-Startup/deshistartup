'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Layout } from 'nextra-theme-docs'
import LanguageSwitcher from './LanguageSwitcher'
import SearchBox from './SearchBox'

const bnNav = [
  ['/', 'প্রধান পাতা'],
  ['/start-here', 'শুরু করুন'],
  ['/startup-vs-sme', 'স্টার্টআপ বনাম SME'],
  ['/idea-validation', 'আইডিয়া যাচাই'],
  ['/customers', 'গ্রাহক খোঁজা'],
  ['/legal-roadmap', 'আইনগত রোডম্যাপ'],
  ['/company-types', 'কোম্পানির ধরন'],
  ['/rjsc-name-clearance', 'RJSC / নাম ক্লিয়ারেন্স'],
  ['/registration', 'ব্যবসা নিবন্ধন'],
  ['/trade-license', 'ট্রেড লাইসেন্স'],
  ['/e-tin-vat-bin', 'e-TIN ও VAT/BIN'],
  ['/payments', 'পেমেন্ট সিস্টেম'],
  ['/founder-life', 'Founder Life'],
  ['/phase-one', 'Phase 1 রোডম্যাপ'],
  ['/phase-two', 'Phase 2 রোডম্যাপ'],
  ['/phase-three', 'Phase 3 রোডম্যাপ'],
  ['/phase-four', 'Phase 4 রোডম্যাপ']
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

function SiteLogo({ isEn }) {
  return (
    <a className="brand" href={localHref(isEn ? '/en' : '/')} aria-label={isEn ? 'Deshi Startup home' : 'দেশি স্টার্টআপ হোম'}>
      <img src={localHref('/deshi-mark.svg')} alt="" />
      <span>
        <strong>{isEn ? 'Deshi Startup' : 'দেশি স্টার্টআপ'}</strong>
        <small>{isEn ? 'From the open founder manual' : 'মুক্ত প্রতিষ্ঠাতা গাইড'}</small>
      </span>
    </a>
  )
}

function Sidebar({ isEn, headings }) {
  const nav = isEn ? enNav : bnNav

  return (
    <aside className="sidebar" id="sidebar" aria-label={isEn ? 'Primary navigation' : 'প্রধান নেভিগেশন'}>
      <nav>
        <p>{isEn ? 'Navigation' : 'পরিভ্রমণ'}</p>
        {nav.map(([href, label]) => (
          <a href={localHref(href)} key={href}>{label}</a>
        ))}

        <p>{isEn ? 'On This Page' : 'এই নিবন্ধে'}</p>
        {headings.length > 0 ? (
          headings.map((heading) => (
            <a href={`#${heading.id}`} key={heading.id}>{heading.text}</a>
          ))
        ) : (
          <a href="#main">{isEn ? 'Top' : 'পাতার শুরু'}</a>
        )}

        <p>{isEn ? 'Tools' : 'সরঞ্জাম'}</p>
        <a href="https://github.com/Deshi-Startup/deshistartup" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href="https://github.com/Deshi-Startup/deshistartup/issues" target="_blank" rel="noopener noreferrer">
          {isEn ? 'Report an issue' : 'সমস্যা জানান'}
        </a>
        <a href="https://github.com/Deshi-Startup/deshistartup/tree/main" target="_blank" rel="noopener noreferrer">
          {isEn ? 'Improve this guide' : 'গাইড উন্নত করুন'}
        </a>
      </nav>
    </aside>
  )
}

export default function LocalizedLayout({ children, pageMap }) {
  const pathname = usePathname()
  const isEn = pathname.startsWith('/en/') || pathname === '/en'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [headings, setHeadings] = useState([])

  useEffect(() => {
    document.documentElement.lang = isEn ? 'en' : 'bn'
  }, [isEn])

  useEffect(() => {
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
  }, [pathname, isEn])

  const tabs = useMemo(
    () =>
      isEn
        ? { article: 'Article', talk: 'Talk', read: 'Read', edit: 'Edit', history: 'View history' }
        : { article: 'নিবন্ধ', talk: 'আলাপ', read: 'পড়ুন', edit: 'সম্পাদনা', history: 'ইতিহাস দেখুন' },
    [isEn]
  )

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
            <a href="https://github.com/Deshi-Startup/deshistartup" target="_blank" rel="noopener noreferrer">
              {tabs.edit}
            </a>
            <a href="https://github.com/Deshi-Startup/deshistartup/commits/main" target="_blank" rel="noopener noreferrer">
              {tabs.history}
            </a>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <div className="page-shell">
        <div className={isSidebarOpen ? 'sidebar-backdrop is-open' : 'sidebar-backdrop'} onClick={() => setIsSidebarOpen(false)} />
        <div className={isSidebarOpen ? 'sidebar-wrap is-open' : 'sidebar-wrap'}>
          <Sidebar isEn={isEn} headings={headings} />
        </div>

        <main className="content-canvas" id="main">
          <div className="article-tabs" id="read">
            <div className="tab-group" role="tablist" aria-label={isEn ? 'Article type' : 'নিবন্ধ ধরন'}>
              <button className="tab active" type="button">{tabs.article}</button>
              <button className="tab" type="button">{tabs.talk}</button>
            </div>
            <div className="article-actions">
              <a href="#read">{tabs.read}</a>
              <a href="https://github.com/Deshi-Startup/deshistartup" target="_blank" rel="noopener noreferrer">{tabs.edit}</a>
              <a href="https://github.com/Deshi-Startup/deshistartup/commits/main" target="_blank" rel="noopener noreferrer">{tabs.history}</a>
            </div>
          </div>

          <article className="article" data-pagefind-body>
            {children}
          </article>
        </main>
      </div>

      <footer className="site-footer">
        {isEn
          ? 'Deshi Startup — an open, Bangladesh-specific founder operating manual.'
          : 'দেশি স্টার্টআপ — বাংলাদেশের প্রতিষ্ঠাতাদের জন্য উন্মুক্ত, বাস্তবভিত্তিক অপারেটিং ম্যানুয়াল।'}
      </footer>
    </>
  )

  return (
    <Layout
      pageMap={pageMap || []}
      navbar={<></>}
      footer={<></>}
      sidebar={{}}
      toc={{}}
      search={null}
      editLink={null}
      feedback={{ content: null }}
      navigation={false}
      lastUpdated={<></>}
      docsRepositoryBase="https://github.com/Deshi-Startup/deshistartup/tree/main"
    >
      {shell}
    </Layout>
  )
}
