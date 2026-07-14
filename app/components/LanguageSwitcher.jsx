'use client'

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

  const targetPath = isEn ? pathname.replace(/^\/en/, '') || '/' : `/en${pathname === '/' ? '' : pathname}`
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const href = targetPath === '/' ? basePath || '/' : `${basePath}${targetPath}`

  const onClick = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    const navigate = () => router.push(targetPath)
    if (document.startViewTransition) document.startViewTransition(navigate)
    else navigate()
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
