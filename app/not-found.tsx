'use client'

import React, { useEffect, useState } from 'react'

/**
 * One 404 document serves both trees, so the language cannot be decided at
 * build time. Render the Bengali source of truth first (it is the majority
 * case and the correct default), then correct to English after mount if the
 * reader actually landed under /en/. Reading the path in an effect rather
 * than during render keeps the server and first client pass identical, so
 * there is no hydration mismatch.
 */
export default function NotFound() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const [isEn, setIsEn] = useState(false)

  useEffect(() => {
    const path = window.location.pathname.slice(basePath.length) || '/'
    setIsEn(path === '/en' || path.startsWith('/en/'))
  }, [basePath])

  const home = isEn ? `${basePath}/en` : basePath || '/'
  const prefix = `${basePath}${isEn ? '/en' : ''}`

  return (
    <div style={{ maxWidth: '36rem', margin: '0 auto', padding: '56px 20px', textAlign: 'center' }}>
      <p className="wiki-kicker">{isEn ? '404' : '৪০৪'}</p>
      <h1 style={{ fontFamily: 'var(--display)' }}>
        {isEn ? 'This page could not be found' : 'পেজটি পাওয়া যায়নি'}
      </h1>
      <p style={{ color: 'var(--muted)' }}>
        {isEn
          ? 'The link may have changed, or the page has not been written yet. Try the search above. If nothing turns up, one of these will get you moving.'
          : 'লিংকটা হয়তো বদলে গেছে, অথবা পেজটা এখনো লেখা হয়নি। ওপরের সার্চে খুঁজে দেখুন। না পেলে নিচের কোনো পথ ধরুন।'}
      </p>
      <div className="contrib-row" style={{ justifyContent: 'center', marginTop: 24 }}>
        <a href={home}>{isEn ? 'Home' : 'হোম'}</a>
        <a href={`${prefix}/start-here`}>{isEn ? 'Start here' : 'শুরু করুন'}</a>
        <a href={`${prefix}/contribute`}>{isEn ? 'Contribute' : 'অবদান রাখুন'}</a>
      </div>
    </div>
  )
}
