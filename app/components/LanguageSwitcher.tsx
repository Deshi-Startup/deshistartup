'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { cleanRoute } from '../lib/clean-route'

/**
 * Real, crawlable link between the Bengali and English mirrors. Keep this as a
 * document navigation: route-specific bylines and page-credit records are
 * written into the exported HTML by the postbuild pass, outside Next's client
 * navigation payload.
 */
export default function LanguageSwitcher() {
  // Clean spelling, or /en.html reads as the Bengali side and this links to
  // /en/en.html. See app/lib/clean-route.ts.
  const pathname = cleanRoute(usePathname())
  const isEn = pathname.startsWith('/en/') || pathname === '/en'
  // One 404 document serves every unmatched URL, so the router reports the
  // synthetic `/_not-found` route rather than the address the reader typed.
  // Mirroring it would send them to a second 404, so send them to the other
  // edition's home instead.
  const isNotFound = pathname === '/_not-found' || pathname === '/en/_not-found'

  const targetPath = isNotFound
    ? isEn
      ? '/'
      : '/en'
    : isEn
      ? pathname.replace(/^\/en/, '') || '/'
      : `/en${pathname === '/' ? '' : pathname}`
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const href = targetPath === '/' ? basePath || '/' : `${basePath}${targetPath}`

  return (
    <a
      href={href}
      className="language-switcher"
      title={isEn ? 'বাংলায় দেখুন' : 'Switch to English'}
      aria-label={isEn ? 'বাংলায় দেখুন' : 'Switch to English'}
      hrefLang={isEn ? 'bn' : 'en'}
      rel="alternate"
      data-language={isEn ? 'en' : 'bn'}
    >
      <span className="language-switcher__thumb" aria-hidden="true" />
      <span className="language-switcher__option">BN</span>
      <span className="language-switcher__option">EN</span>
    </a>
  )
}
