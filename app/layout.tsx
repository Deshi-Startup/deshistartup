import React from 'react'
import Script from 'next/script'
import LocalizedLayout from './components/LocalizedLayout'
import { DEFAULT_DESCRIPTIONS, SITE_NAME, SITE_NAME_BN, SITE_URL } from './seo.config.mjs'
import './globals.css'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const googleTagManagerId = 'GTM-TVCFJQJS'
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION
const bingSiteVerification = process.env.BING_SITE_VERIFICATION
const googleTagManagerScript = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManagerId}');`

export const metadata = {
  title: {
    default: 'দেশি স্টার্টআপ – বাংলাদেশে স্টার্টআপ গড়ার ফ্রি, ওপেন-সোর্স ম্যানুয়াল',
    template: '%s | দেশি স্টার্টআপ'
  },
  description: DEFAULT_DESCRIPTIONS.bn,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  creator: `${SITE_NAME} contributors`,
  publisher: SITE_NAME,
  category: 'education',
  icons: {
    icon: `${basePath}/favicon-32.png`,
    apple: `${basePath}/apple-touch-icon.png`
  },
  ...(googleSiteVerification || bingSiteVerification
    ? {
        verification: {
          ...(googleSiteVerification ? { google: googleSiteVerification } : {}),
          ...(bingSiteVerification ? { other: { 'msvalidate.01': bingSiteVerification } } : {})
        }
      }
    : {}),
  other: {
    'application-name': SITE_NAME,
    'apple-mobile-web-app-title': SITE_NAME_BN
  }
}

interface RootLayoutProps {
  children?: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const safeChildren = children || <></>

  return (
    <html lang="bn" dir="ltr" suppressHydrationWarning>
      <body>
        {/* Analytics waits for the window load event, not just for hydration. A
            founder on a mid-range Android on patchy bandwidth gets the article,
            its font and its own interactivity first; the container and whatever
            it pulls in behind it are a bigger main-thread bill than any
            first-party code on the page, and none of it is what they came for.
            The measurement still happens, at the back of the queue. */}
        <Script id="gtm-init" strategy="lazyOnload">
          {googleTagManagerScript}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
            title="Google Tag Manager"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <LocalizedLayout>{safeChildren}</LocalizedLayout>
      </body>
    </html>
  )
}
