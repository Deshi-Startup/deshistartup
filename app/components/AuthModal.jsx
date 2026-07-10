'use client'

import { useEffect, useRef, useState } from 'react'
import { decodeIdToken, storeAuth } from '../lib/client-auth'

const GIS_SRC = 'https://accounts.google.com/gsi/client'

/**
 * Google sign-in modal. Uses Google Identity Services ("Sign in with
 * Google") so the whole login happens client-side — the browser gets a
 * signed ID token directly from Google, which the backend later verifies.
 * No server session, no popup round-trip, no GitHub account needed.
 */
export default function AuthModal({ open, onClose, onAuthenticated, isEn }) {
  const containerRef = useRef(null)
  const [error, setError] = useState(null)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  const t = (bn, en) => (isEn ? en : bn)

  useEffect(() => {
    if (!open) {
      setError(null)
      return
    }
    if (!clientId) {
      setError('no_client_id')
      return
    }

    const init = () => {
      if (!window.google?.accounts?.id) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential
      })
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 300,
          locale: isEn ? 'en' : 'bn'
        })
      }
    }

    if (window.google?.accounts?.id) {
      init()
    } else {
      let script = document.querySelector(`script[src="${GIS_SRC}"]`)
      if (!script) {
        script = document.createElement('script')
        script.src = GIS_SRC
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
      script.addEventListener('load', init)
      return () => script.removeEventListener('load', init)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, clientId, isEn])

  function handleCredential(response) {
    const token = response?.credential
    if (!token) {
      setError('no_credential')
      return
    }
    const claims = decodeIdToken(token)
    const user = {
      name: claims?.name || claims?.email || t('অবদানকারী', 'Contributor'),
      email: claims?.email || '',
      picture: claims?.picture || ''
    }
    storeAuth(token, user)
    onAuthenticated?.(user, token)
    onClose?.()
  }

  if (!open) return null

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t('সাইন ইন', 'Sign in')}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="modal-card">
        <button className="modal-close" type="button" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <h2>{t('অবদান রাখতে সাইন ইন করুন', 'Sign in to contribute')}</h2>
        <p className="modal-lede">
          {t(
            'এই পাতায় ছোট সংশোধন বা নতুন লেখা যোগ করতে Google দিয়ে সাইন ইন করুন। GitHub অ্যাকাউন্ট লাগবে না।',
            'Sign in with Google to edit this page. No GitHub account needed.'
          )}
        </p>

        {error === 'no_client_id' ? (
          <p className="modal-error">
            {t(
              'Google সাইন-ইন সেট আপ করা নেই। NEXT_PUBLIC_GOOGLE_CLIENT_ID কনফিগ করুন।',
              'Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.'
            )}
          </p>
        ) : (
          <div className="google-btn-wrap" ref={containerRef} />
        )}

        <p className="modal-note">
          {t(
            'সাইন ইন করলে আপনি একটি পুল রিকোয়েস্টের মাধ্যমে অবদান রাখবেন, যা রিভিউ হওয়ার পর সাইটে যুক্ত হবে।',
            'Signing in lets you submit a pull request with your edit. A reviewer approves it before it goes live.'
          )}
        </p>
      </div>
    </div>
  )
}
