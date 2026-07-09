import LocalizedLayout from './components/LocalizedLayout'
import './globals.css'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const googleTagManagerId = 'GTM-TVCFJQJS'
const googleTagManagerScript = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManagerId}');`

export const metadata = {
  title: {
    default: 'দেশি স্টার্টআপ – বাংলাদেশে স্টার্টআপ বানানোর বাংলা গাইড',
    template: '%s | দেশি স্টার্টআপ'
  },
  description:
    'বাংলাদেশে স্টার্টআপ শুরু, চালু ও বড় করার ফ্রি, ওপেন সোর্স বাংলা গাইড: আইডিয়া যাচাই, রেজিস্ট্রেশন, কর/ভ্যাট, পেমেন্ট, গ্রাহক, টিম ও ফান্ডিং।',
  metadataBase: new URL('https://deshistartup.com'),
  icons: {
    icon: `${basePath}/deshi-mark.svg`
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
