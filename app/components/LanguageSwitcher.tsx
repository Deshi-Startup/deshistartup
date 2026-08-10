'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Real, crawlable link between the Bengali and English mirrors. The click
 * handler only upgrades navigation with a view transition – without JS the
 * plain <a href> still works for users and crawlers.
 */
export default function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
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

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    const navigate = () => router.push(targetPath)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if ('startViewTransition' in document && !prefersReducedMotion) {
      (document as any).startViewTransition(navigate)
    } else {
      navigate()
    }
  }

  return (
    <a
      href={href}
      onClick={onClick}
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
