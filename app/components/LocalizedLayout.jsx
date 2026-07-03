'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import LanguageSwitcher from './LanguageSwitcher'

export default function LocalizedLayout({ children, pageMap }) {
  const pathname = usePathname()
  const isEn = pathname.startsWith('/en/') || pathname === '/en'

  useEffect(() => {
    document.documentElement.lang = isEn ? 'en' : 'bn'
  }, [isEn])

  // Localize Navbar
  const navbar = (
    <Navbar logo={isEn ? <b>Deshi Startup</b> : <b>দেশি স্টার্টআপ</b>}>
      <>
        <LanguageSwitcher />
        <a
          href="https://github.com/Deshi-Startup/deshistartup"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <img
            src="https://img.shields.io/github/stars/Deshi-Startup/deshistartup?style=for-the-badge&logo=github&color=yellow"
            alt="Star on GitHub"
            style={{ height: '24px' }}
          />
        </a>
      </>
    </Navbar>
  )

  // Localize Footer
  const footer = (
    <Footer>
      {isEn
        ? 'Deshi Startup Guide — Open knowledge base for Bangladeshi founders'
        : 'দেশি স্টার্টআপ গাইড — বাংলাদেশের ফাউন্ডারদের জন্য উন্মুক্ত জ্ঞানভাণ্ডার'}
    </Footer>
  )

  // Localize pageMap
  const getLocalizedPageMap = (fullPageMap) => {
    if (!fullPageMap) return []

    const unwrapRouteGroups = (nodes) => {
      return nodes.flatMap((node) => {
        if (node.name?.startsWith('(') && node.name?.endsWith(')')) {
          return unwrapRouteGroups(node.children || [])
        }

        if (node.children) {
          return { ...node, children: unwrapRouteGroups(node.children) }
        }

        return node
      })
    }

    const findNode = (nodes, name) => {
      for (const node of nodes) {
        if (node.name === name) return node
        const found = findNode(node.children || [], name)
        if (found) return found
      }
      return null
    }

    const visiblePageMap = unwrapRouteGroups(fullPageMap)

    if (isEn) {
      const enNode = findNode(visiblePageMap, 'en')
      return enNode ? enNode.children : []
    }

    return visiblePageMap.filter((node) => node.name !== 'en')
  }

  const localizedPageMap = getLocalizedPageMap(pageMap)

  return (
    <Layout
      navbar={navbar}
      footer={footer}
      pageMap={localizedPageMap}
      docsRepositoryBase="https://github.com/Deshi-Startup/deshistartup/tree/main"
    >
      {children}
    </Layout>
  )
}
