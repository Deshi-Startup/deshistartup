'use client'

import React, { useEffect, useState } from 'react'
import { UserInfo } from '../lib/client-auth'
import { DiffLine, parseUnifiedDiff } from '../lib/diff'
import DiffModal from './DiffModal'

interface ContributorDashboardProps {
  session: UserInfo
  authToken: string | null
  onClose: () => void
  onSignOut: () => void
  isEn?: boolean
}

interface ContributionItem {
  prNumber: number
  prUrl: string
  branchName: string
  pageTitle: string
  pagePath: string
  createdAt: string
  updatedAt: string
}

export default function ContributorDashboard({
  session,
  authToken,
  onClose,
  onSignOut,
  isEn = false
}: ContributorDashboardProps) {
  const [contributions, setContributions] = useState<ContributionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Diff Modal states
  const [diffOpen, setDiffOpen] = useState(false)
  const [diffLines, setDiffLines] = useState<DiffLine[]>([])
  const [diffTitle, setDiffTitle] = useState('')
  const [diffLoadingPr, setDiffLoadingPr] = useState<number | null>(null)

  const t = (bn: string, en: string) => (isEn ? en : bn)

  useEffect(() => {
    if (!authToken) {
      setLoading(false)
      return
    }

    let active = true
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    setLoading(true)
    setError(null)

    fetch(`${basePath}/api/contributions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then(async (res) => {
        const j = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(j.error || 'fetch_failed')
        return j.contributions
      })
      .then((data) => {
        if (active) {
          setContributions(data || [])
        }
      })
      .catch((err) => {
        if (active) {
          console.error('[ContributorDashboard] Error fetching contributions:', err)
          setError(err.message === 'unauthorized' ? 'unauthorized' : 'fetch_failed')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [authToken])

  const handleFetchDiff = async (item: ContributionItem) => {
    if (!authToken || diffLoadingPr !== null) return
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    setDiffLoadingPr(item.prNumber)

    try {
      const res = await fetch(`${basePath}/api/contributions/diff?prNumber=${item.prNumber}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j.error || 'fetch_failed')
      
      const parsedLines = parseUnifiedDiff(j.diffText || '')
      setDiffLines(parsedLines)
      setDiffTitle(item.pageTitle)
      setDiffOpen(true)
    } catch (err) {
      console.error('[ContributorDashboard] Error fetching diff:', err)
      alert(t('ডিফ লোড করা যায়নি।', 'Could not load diff.'))
    } finally {
      setDiffLoadingPr(null)
    }
  }

  // Close dashboard on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        !target.closest('.dashboard-dropdown') &&
        !target.closest('.profile-btn') &&
        !target.closest('.modal-overlay')
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [onClose])

  return (
    <>
      <div className="dashboard-dropdown" role="menu">
        <div className="dashboard-user">
          <img src={session.picture} alt="" />
          <div className="dashboard-user__info">
            <span className="dashboard-user__name">{session.name}</span>
            <span className="dashboard-user__email">{session.email}</span>
          </div>
        </div>

        <div className="dashboard-section">
          <span className="dashboard-section-title">
            {t('আপনার অবদানসমূহ', 'Your Contributions')}
          </span>

          {loading ? (
            <p className="contrib-empty">{t('অবদান লোড হচ্ছে…', 'Loading contributions…')}</p>
          ) : error ? (
            <p className="contrib-empty" style={{ color: 'var(--error)' }}>
              {error === 'unauthorized'
                ? t('সেশন শেষ হয়েছে। আবার প্রবেশ করুন।', 'Session expired. Please sign in again.')
                : t('অবদান লোড করা যায়নি।', 'Could not load contributions.')}
            </p>
          ) : contributions.length === 0 ? (
            <p className="contrib-empty">
              {t('আপনার কোনো পেন্ডিং অবদান নেই।', 'You have no pending contributions.')}
            </p>
          ) : (
            <div className="contrib-list">
              {contributions.map((item) => (
                <div key={item.prNumber} className="contrib-item">
                  <div className="contrib-item__header">
                    <a
                      href={`${item.pagePath}?action=edit`}
                      className="contrib-item__title"
                      title={item.pageTitle}
                    >
                      {item.pageTitle}
                    </a>
                    <a
                      href={item.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contrib-item__pr-link"
                      title={t('পুল রিকোয়েস্টটি দেখুন', 'View pull request')}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                      </svg>
                    </a>
                  </div>
                  <div className="contrib-item__meta">
                    <span className="contrib-item__badge">
                      {t('রিভিউ চলছে', 'Under Review')}
                    </span>
                    <span>#{item.prNumber}</span>
                  </div>
                  <div className="contrib-item__actions">
                    <button
                      type="button"
                      className="contrib-item__btn"
                      disabled={diffLoadingPr !== null}
                      onClick={() => handleFetchDiff(item)}
                    >
                      {diffLoadingPr === item.prNumber
                        ? t('লোড হচ্ছে…', 'Loading…')
                        : t('পরিবর্তনগুলো দেখুন', 'Review Changes')}
                    </button>
                    <a
                      href={`${item.pagePath}?action=edit`}
                      className="contrib-item__btn"
                      style={{ textDecoration: 'none', display: 'inline-block' }}
                    >
                      {t('সম্পাদনা করুন', 'Resume Edit')}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="signout-btn" onClick={onSignOut}>
          {t('লগ আউট', 'Sign Out')}
        </button>
      </div>

      <DiffModal
        open={diffOpen}
        onClose={() => setDiffOpen(false)}
        diffLines={diffLines}
        title={diffTitle}
        isEn={isEn}
      />
    </>
  )
}
