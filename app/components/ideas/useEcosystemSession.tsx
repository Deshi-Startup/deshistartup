'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { clearAuth, getStoredAuth, type AuthState } from '../../lib/client-auth'
import type { Locale } from './types'
const AuthModal = dynamic(() => import('../AuthModal'), { ssr: false })
export function useEcosystemSession(locale: Locale) {
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [open, setOpen] = useState(false)
  useEffect(() => { setAuth(getStoredAuth()) }, [])
  return {
    auth, signIn: () => setOpen(true),
    expire: () => { clearAuth(); setAuth(null) },
    dialog: open ? <AuthModal open isEn={locale === 'en'} purpose="ecosystem" onClose={() => setOpen(false)} onAuthenticated={(user, token) => setAuth({ user, token })} /> : null
  }
}
export function ecosystemError(status: number, locale: Locale) {
  const messages: Record<number, [string, string]> = {
    400: ['Check the required fields and public links, then try again.', 'প্রয়োজনীয় ঘর ও প্রকাশ্য লিংকগুলো ঠিক করে আবার চেষ্টা করুন।'],
    401: ['Your sign-in expired. Sign in again; your draft is still here.', 'সাইন-ইনের মেয়াদ শেষ হয়েছে। আবার সাইন ইন করুন, খসড়া এখানেই আছে।'],
    403: ['This account does not have review access.', 'এই অ্যাকাউন্টে পর্যালোচনার অনুমতি নেই।'],
    409: ['This information has changed or the company is already listed for this problem. Reload the page and check before trying again.', 'তথ্য বদলেছে বা এই যোগসূত্র আগে থেকেই আছে। তালিকা রিফ্রেশ করে কোম্পানির তথ্য দেখুন।'],
    429: ['Too many requests. Wait a minute, then try again.', 'অল্প সময়ে বেশি অনুরোধ হয়েছে। এক মিনিট পর আবার চেষ্টা করুন।']
  }
  return (messages[status] || ['The service is unavailable. Your draft is still here; try again later.', 'সেবাটি এখন পাওয়া যাচ্ছে না। খসড়া এখানেই আছে, পরে আবার চেষ্টা করুন।'])[locale === 'en' ? 0 : 1]
}
