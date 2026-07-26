'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { decodeIdToken, storeAuth, UserInfo } from '../lib/client-auth'

const GIS_SRC = 'https://accounts.google.com/gsi/client'
const GIS_SCRIPT_SELECTOR = 'script[data-deshi-gis]'
/** Long enough for a bad 3G connection, short enough that nobody waits at a
 *  spinner wondering whether it is them. */
const GIS_TIMEOUT_MS = 12000
const FOCUSABLE_SELECTOR =
  'a[href], button:not(:disabled), iframe, input:not(:disabled), [tabindex]:not([tabindex="-1"])'

interface GoogleCredentialResponse {
  credential?: string
}

interface DeshiGoogleAuthState {
  clientId: string
  handleCredential: (response: GoogleCredentialResponse) => void
}

declare global {
  interface Window {
    __deshiGoogleAuth?: DeshiGoogleAuthState
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string
            callback: (response: GoogleCredentialResponse) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              locale: string
              shape: 'rectangular'
              size: 'large'
              text: 'continue_with'
              theme: 'outline'
              width: number
            }
          ) => void
        }
      }
    }
  }
}

interface AuthModalProps {
  open: boolean
  onClose?: () => void
  onAuthenticated?: (user: UserInfo, token: string) => void
  isEn?: boolean
  fallbackHref?: string
}

/**
 * Google sign-in modal. Uses Google Identity Services ("Sign in with
 * Google") so the whole login happens client-side — the browser gets a
 * signed ID token directly from Google, which the backend later verifies.
 * No server session, no popup round-trip, no GitHub account needed.
 */
export default function AuthModal({
  open,
  onClose,
  onAuthenticated,
  isEn = false,
  fallbackHref
}: AuthModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const headingId = useId()
  const descriptionId = useId()

  const t = (bn: string, en: string) => (isEn ? en : bn)

  // A real modal owns focus while it is open, closes with Escape, and gives
  // focus back to the Edit button that opened it.
  useEffect(() => {
    if (!open) return undefined

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.classList.add('auth-open')

    const background = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && !element.hasAttribute('data-auth-portal')
    )
    const previousInert = background.map((element) => element.inert)
    background.forEach((element) => {
      element.inert = true
    })

    const focusFrame = window.requestAnimationFrame(() => dialogRef.current?.focus())
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true')
      if (focusable.length === 0) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (
        document.activeElement === dialogRef.current ||
        !dialogRef.current.contains(document.activeElement)
      ) {
        event.preventDefault()
        const target = event.shiftKey ? last : first
        target.focus()
        return
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      background.forEach((element, index) => {
        element.inert = previousInert[index]
      })
      document.body.classList.remove('auth-open')
      window.requestAnimationFrame(() => previousFocusRef.current?.focus())
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setError(null)
      setLoading(false)
      return
    }
    if (!clientId) {
      setError('no_client_id')
      setLoading(false)
      return
    }

    let active = true
    let watchdog = 0
    setError(null)
    setLoading(true)

    /* Google's script is on most content blockers' lists, and it is reachable
       unevenly from Bangladeshi networks. Both failures look the same from
       here: either `error` never fires and nothing ever loads, or the request
       "succeeds" and defines nothing. Without this the modal sits on
       "সাইন-ইন প্রস্তুত হচ্ছে…" forever, and the GitHub fallback — which only
       renders beside an error — never appears. Fail loudly instead. */
    const fail = () => {
      if (!active) return
      window.clearTimeout(watchdog)
      const blocked = document.querySelector(GIS_SCRIPT_SELECTOR) as HTMLScriptElement | null
      if (blocked) blocked.dataset.loadState = 'error'
      setLoading(false)
      setError('script_load_failed')
    }

    const init = () => {
      if (!active) return
      const googleId = window.google?.accounts?.id
      const container = containerRef.current
      // The script resolved but handed us nothing usable — a blocked or stubbed
      // response. There is nothing to wait for.
      if (!googleId || !container) return fail()
      window.clearTimeout(watchdog)

      if (!window.__deshiGoogleAuth || window.__deshiGoogleAuth.clientId !== clientId) {
        window.__deshiGoogleAuth = {
          clientId,
          handleCredential
        }
        googleId.initialize({
          client_id: clientId,
          callback: (response) => window.__deshiGoogleAuth?.handleCredential(response)
        })
      } else {
        // React Strict Mode re-runs effects in development. Keep Google's
        // one-time initialization and only refresh the active modal callback.
        window.__deshiGoogleAuth.handleCredential = handleCredential
      }
      container.innerHTML = ''
      const availableWidth = Math.floor(container.getBoundingClientRect().width)
      googleId.renderButton(container, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: Math.max(220, Math.min(320, availableWidth || 300)),
        locale: isEn ? 'en' : 'bn'
      })
      setLoading(false)
    }

    const handleLoad = () => init()
    const handleError = () => fail()

    if (window.google?.accounts?.id) {
      init()
      return () => {
        active = false
        window.clearTimeout(watchdog)
      }
    }

    let script = document.querySelector(GIS_SCRIPT_SELECTOR) as HTMLScriptElement | null
    if (script?.dataset.loadState === 'error') {
      script.remove()
      script = null
    }
    if (!script) {
      script = document.createElement('script')
      script.src = `${GIS_SRC}?hl=${isEn ? 'en' : 'bn'}`
      script.async = true
      script.defer = true
      script.dataset.deshiGis = 'true'
      script.dataset.loadState = 'loading'
      document.head.appendChild(script)
    }
    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)
    // Covers the case no event reports: a request that never resolves, and a
    // script tag already in the document whose `load` fired before we listened.
    watchdog = window.setTimeout(fail, GIS_TIMEOUT_MS)
    return () => {
      active = false
      window.clearTimeout(watchdog)
      script?.removeEventListener('load', handleLoad)
      script?.removeEventListener('error', handleError)
    }
    // `handleCredential` deliberately belongs to the active modal render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, clientId, isEn, retryKey])

  function handleCredential(response: GoogleCredentialResponse) {
    const token = response?.credential
    if (!token) {
      setError('no_credential')
      return
    }
    const claims = decodeIdToken(token)
    if (!claims?.email || !claims?.exp) {
      setError('invalid_credential')
      return
    }
    const user: UserInfo = {
      name: claims?.name || claims?.email || t('অবদানকারী', 'Contributor'),
      email: claims?.email || '',
      picture: claims?.picture || ''
    }
    storeAuth(token, user)
    onAuthenticated?.(user, token)
    onClose?.()
  }

  if (!open) return null

  const errorMessage =
    error === 'no_client_id'
      ? t(
          'এই সাইটে Google সাইন-ইন এখন পাওয়া যাচ্ছে না। আপাতত GitHub-এ সম্পাদনা করতে পারেন।',
          'Google sign-in is not available right now. You can edit on GitHub instead.'
        )
      : error === 'script_load_failed'
        ? t(
            'Google সাইন-ইন লোড হয়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।',
            'Google sign-in did not load. Check your connection and try again.'
          )
        : error
          ? t(
              'Google সাইন-ইন শেষ করা যায়নি। আবার চেষ্টা করুন।',
              'Google sign-in could not be completed. Please try again.'
            )
          : null

  return createPortal(
    <div
      className="modal-overlay"
      data-auth-portal
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="modal-card" ref={dialogRef} tabIndex={-1}>
        <button
          className="modal-close"
          type="button"
          aria-label={t('সাইন-ইন বন্ধ করুন', 'Close sign-in')}
          onClick={onClose}
        >
          ×
        </button>
        <h2 id={headingId}>{t('Google দিয়ে সাইন ইন করুন', 'Sign in with Google')}</h2>
        <p className="modal-lede" id={descriptionId}>
          {t(
            'এই পাতায় সম্পাদনা শুরু করতে সাইন ইন করুন। GitHub অ্যাকাউন্ট লাগবে না।',
            'Sign in to start editing this page. No GitHub account needed.'
          )}
        </p>

        {loading && (
          <p className="modal-status" role="status">
            {t('সাইন-ইন প্রস্তুত হচ্ছে…', 'Preparing sign-in…')}
          </p>
        )}
        {clientId && <div className="google-btn-wrap" ref={containerRef} aria-hidden={loading} />}

        {errorMessage && (
          <div className="modal-error" role="alert">
            <p>{errorMessage}</p>
            <div className="modal-error__actions">
              {error === 'script_load_failed' && (
                <button className="edit-btn" type="button" onClick={() => setRetryKey((key) => key + 1)}>
                  {t('আবার চেষ্টা করুন', 'Try again')}
                </button>
              )}
              {fallbackHref && (
                <a className="edit-btn" href={fallbackHref} target="_blank" rel="noopener noreferrer">
                  {t('GitHub-এ সম্পাদনা করুন', 'Edit on GitHub')}
                </a>
              )}
            </div>
          </div>
        )}

        <p className="modal-note">
          {t(
            'জমা দিলে রিভিউয়ের জন্য একটি পুল রিকোয়েস্ট তৈরি হবে। অনুমোদনের আগে সাইটে কিছু বদলাবে না।',
            'Submitting creates a pull request for review. Nothing changes on the site until it is approved.'
          )}
        </p>
      </div>
    </div>,
    document.body
  )
}
