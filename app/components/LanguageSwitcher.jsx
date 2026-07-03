'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSwitching, setIsSwitching] = useState(false)

  const isEn = pathname.startsWith('/en/') || pathname === '/en'

  useEffect(() => {
    setIsSwitching(false)

    document.documentElement.classList.remove('language-is-leaving')
    document.documentElement.classList.add('language-is-entering')

    const timeout = window.setTimeout(() => {
      document.documentElement.classList.remove('language-is-entering')
    }, 320)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [pathname])

  const toggleLanguage = () => {
    let newPath = ''
    if (isEn) {
      // Switch to Bengali (remove /en prefix)
      newPath = pathname.replace(/^\/en/, '')
      if (newPath === '') newPath = '/'
    } else {
      // Switch to English (prepend /en prefix)
      newPath = `/en${pathname === '/' ? '' : pathname}`
    }

    setIsSwitching(true)
    document.documentElement.classList.add('language-is-leaving')

    const navigate = () => {
      startTransition(() => {
        router.push(newPath)
      })
    }

    window.setTimeout(() => {
      if (document.startViewTransition) {
        document.startViewTransition(navigate)
        return
      }

      navigate()
    }, 130)
  }

  return (
    <button
      onClick={toggleLanguage}
      className={`language-switcher${isSwitching || isPending ? ' is-switching' : ''}`}
      title={isEn ? "বাংলায় দেখুন" : "Switch to English"}
      aria-label={isEn ? "বাংলায় দেখুন" : "Switch to English"}
      aria-busy={isSwitching || isPending}
      aria-pressed={isEn}
      data-language={isEn ? 'en' : 'bn'}
    >
      <span className="language-switcher__thumb" aria-hidden="true" />
      <span className="language-switcher__option">BN</span>
      <span className="language-switcher__option">EN</span>
    </button>
  )
}
