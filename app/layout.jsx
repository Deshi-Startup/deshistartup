import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './globals.css'

export const metadata = {
  title: {
    default: 'দেশি স্টার্টআপ গাইড',
    template: '%s | দেশি স্টার্টআপ'
  },
  description: 'বাংলাদেশে স্টার্টআপ শুরু, গড়ে তোলা এবং স্কেল করার সম্পূর্ণ গাইড।',
  metadataBase: new URL('https://deshistartup.com')
}

const navbar = (
  <Navbar logo={<b>দেশি স্টার্টআপ</b>}>
    <a href="https://github.com/Deshi-Startup/deshistartup" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
      <img src="https://img.shields.io/github/stars/Deshi-Startup/deshistartup?style=for-the-badge&logo=github&color=yellow" alt="Star on GitHub" style={{ height: '24px' }} />
    </a>
  </Navbar>
)
const footer = <Footer>দেশি স্টার্টআপ গাইড — বাংলাদেশের ফাউন্ডারদের জন্য উন্মুক্ত জ্ঞানভাণ্ডার</Footer>

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
        <Layout
          navbar={navbar}
          footer={footer}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/Deshi-Startup/deshistartup/tree/main"
        >
          {safeChildren}
        </Layout>
      </body>
    </html>
  )
}
