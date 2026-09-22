'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { clearAuth, getStoredAuth, type AuthState } from '../../lib/client-auth'
import type { Locale } from './types'
const AuthModal = dynamic(() => import('../AuthModal'), { ssr: false })
export function useEcosystemSession(locale: Locale, options: { purpose?: 'ecosystem' | 'voting' | 'review'; onAuthenticated?: (auth: AuthState) => void; onDismiss?: () => void } = {}) {
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    setAuth(getStoredAuth())
    const sync = (event: StorageEvent) => { if (event.key === 'deshi_auth' || event.key === null) setAuth(getStoredAuth()) }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  return {
    auth, signIn: () => setOpen(true),
    switchAccount: () => { clearAuth(); setAuth(null); setOpen(true) },
    expire: () => { clearAuth(); setAuth(null) },
    dialog: open ? <AuthModal open isEn={locale === 'en'} purpose={options.purpose || 'ecosystem'} onClose={() => { setOpen(false); options.onDismiss?.() }} onAuthenticated={(user, token) => { setAuth({ user, token }); options.onAuthenticated?.({ user, token }) }} /> : null
  }
}
export function ecosystemError(status: number, locale: Locale) {
  const messages: Record<number, [string, string]> = {
    400: ['Check the required fields and public links, then try again.', 'প্রয়োজনীয় ঘর ও প্রকাশ্য লিংকগুলো ঠিক করে আবার চেষ্টা করুন।'],
    401: ['Your sign-in expired. Sign in again to continue.', 'সাইন-ইনের মেয়াদ শেষ হয়েছে। আবার সাইন ইন করুন।'],
    403: ['This account does not have review access.', 'এই অ্যাকাউন্টে পর্যালোচনার অনুমতি নেই।'],
    409: ['This submission has changed. Refresh the list before trying again.', 'জমা দেওয়া তথ্য বদলেছে। আবার চেষ্টা করার আগে তালিকা রিফ্রেশ করুন।'],
    429: ['Too many requests. Wait a minute, then try again.', 'অল্প সময়ে বেশি অনুরোধ হয়েছে। এক মিনিট পর আবার চেষ্টা করুন।']
  }
  return (messages[status] || ['The service is unavailable. Please try again later.', 'সেবাটি এখন পাওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন।'])[locale === 'en' ? 0 : 1]
}
