'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const isEn = pathname.startsWith('/en/') || pathname === '/en'

  const toggleLanguage = () => {
    let newPath
    if (isEn) {
      newPath = pathname.replace(/^\/en/, '') || '/'
    } else {
      newPath = `/en${pathname === '/' ? '' : pathname}`
    }

    const navigate = () => router.push(newPath)
    if (document.startViewTransition) document.startViewTransition(navigate)
    else navigate()
  }

  return (
    <button
      onClick={toggleLanguage}
      className="language-switcher"
      title={isEn ? 'বাংলায় দেখুন' : 'Switch to English'}
      aria-label={isEn ? 'বাংলায় দেখুন' : 'Switch to English'}
      aria-pressed={isEn}
      data-language={isEn ? 'en' : 'bn'}
    >
      <span className="language-switcher__thumb" aria-hidden="true" />
      <span className="language-switcher__option">BN</span>
      <span className="language-switcher__option">EN</span>
    </button>
  )
}
