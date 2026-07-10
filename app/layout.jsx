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
    default: 'দেশি স্টার্টআপ – বাংলাদেশে স্টার্টআপ গড়ার বাংলা গাইড',
    template: '%s | দেশি স্টার্টআপ'
  },
  description: DEFAULT_DESCRIPTIONS.bn,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  authors: [{ name: `${SITE_NAME} contributors`, url: SITE_URL }],
  creator: `${SITE_NAME} contributors`,
  publisher: SITE_NAME,
  category: 'education',
  icons: {
    icon: `${basePath}/deshi-mark.svg`
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

export default async function RootLayout({ children }) {
  const safeChildren = children || <></>

  return (
    <html lang="bn" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: googleTagManagerScript }} />
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
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
