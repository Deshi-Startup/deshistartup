import LocalizedLayout from './components/LocalizedLayout'
import './globals.css'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

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
      <body>
        <LocalizedLayout>{safeChildren}</LocalizedLayout>
      </body>
    </html>
  )
}
