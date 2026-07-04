import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import LocalizedLayout from './components/LocalizedLayout'
import 'nextra-theme-docs/style.css'
import './globals.css'

export const metadata = {
  title: {
    default: 'দেশি স্টার্টআপ গাইড',
    template: '%s | দেশি স্টার্টআপ'
  },
  description: 'বাংলাদেশে স্টার্টআপ শুরু, গড়ে তোলা এবং স্কেল করার সম্পূর্ণ গাইড।',
  metadataBase: new URL('https://deshistartup.com'),
  icons: {
    icon: '/deshi-mark.svg'
  }
}

export default async function RootLayout({ children }) {
  const safeChildren = children || <></>
  
  return (
    <html lang="bn" dir="ltr" suppressHydrationWarning>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <LocalizedLayout pageMap={await getPageMap()}>
          {safeChildren}
        </LocalizedLayout>
      </body>
    </html>
  )
}
