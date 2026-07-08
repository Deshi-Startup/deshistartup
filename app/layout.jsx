import LocalizedLayout from './components/LocalizedLayout'
import './globals.css'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export const metadata = {
  title: {
    default: 'দেশি স্টার্টআপ – বাংলাদেশে ব্যবসা গড়ার খোলা সহায়িকা',
    template: '%s | দেশি স্টার্টআপ'
  },
  description:
    'বাংলাদেশে স্টার্টআপ ও ছোট ব্যবসা শুরু, চালু ও বড় করার ফ্রি, ওপেন সোর্স বাংলা গাইড: আইডিয়া যাচাই, নিবন্ধন, কর/ভ্যাট, পেমেন্ট, গ্রাহক, দল ও ফান্ডিং।',
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
