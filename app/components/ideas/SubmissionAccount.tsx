import type { AuthState } from '../../lib/client-auth'
import type { Locale } from './types'

export default function SubmissionAccount({ auth, locale, onSwitch, disabled = false }: {
  auth: AuthState | null; locale: Locale; onSwitch: () => void; disabled?: boolean
}) {
  if (!auth) return null
  return <div className="submission-account">
    <span>{auth.user.email}</span>
    <button type="button" className="ideas-text-button" disabled={disabled} onClick={onSwitch}>{locale === 'en' ? 'Change account' : 'অ্যাকাউন্ট বদলান'}</button>
  </div>
}
