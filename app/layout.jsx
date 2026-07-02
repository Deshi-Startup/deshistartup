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
  description: 'বাংলাদেশে স্টার্টআপ শুরু, গড়ে তোলা এবং স্কেল করার সম্পূর্ণ গাইড। SSC/HSC যেকোনো স্তরের শিক্ষার্থী এই গাইড অনুসরণ করে নিজের স্টার্টআপ তৈরি করতে পারবে।',
  metadataBase: new URL('https://deshistartup.com'),
  openGraph: {
    title: 'দেশি স্টার্টআপ গাইড',
    description: 'বাংলাদেশে স্টার্টআপ শুরু, গড়ে তোলা এবং স্কেল করার সম্পূর্ণ গাইড।',
    siteName: 'দেশি স্টার্টআপ গাইড',
    locale: 'bn_BD',
    type: 'website'
  }
}

const navbar = (
  <Navbar
    logo={
      <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>
        🇧🇩 দেশি স্টার্টআপ
      </span>
    }
    projectLink="https://github.com/deshistartup/deshistartup"
  />
)

const footer = (
  <Footer>
    <p>দেশি স্টার্টআপ গাইড — বাংলাদেশের ফাউন্ডারদের জন্য উন্মুক্ত জ্ঞানভাণ্ডার</p>
  </Footer>
)

export default async function RootLayout({ children }) {
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
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/deshistartup/deshistartup/tree/main"
          footer={footer}
          sidebar={{
            defaultMenuCollapseLevel: 1,
            toggleButton: true
          }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
