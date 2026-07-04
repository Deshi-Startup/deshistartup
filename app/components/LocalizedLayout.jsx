'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import LanguageSwitcher from './LanguageSwitcher'
import SearchBox from './SearchBox'

function SiteLogo({ isEn }) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

  return (
    <span className="site-logo" aria-label={isEn ? 'Deshi Startup home' : 'দেশি স্টার্টআপ হোম'}>
      <img className="site-logo__mark" src={`${basePath}/deshi-mark.svg`} alt="" />
      <span className="site-logo__text">
        <strong>{isEn ? 'Deshi Startup' : 'দেশি স্টার্টআপ'}</strong>
        <small>{isEn ? 'Open founder playbook' : 'মুক্ত প্রতিষ্ঠাতা গাইড'}</small>
      </span>
    </span>
  )
}

export default function LocalizedLayout({ children, pageMap }) {
  const pathname = usePathname()
  const isEn = pathname.startsWith('/en/') || pathname === '/en'

  const bnSidebar = [
    { name: '--intro', type: 'separator', title: 'ভূমিকা' },
    ['start-here', 'শুরু করুন'],
    ['startup-vs-sme', 'স্টার্টআপ বনাম SME'],
    ['ecosystem-overview', 'ইকোসিস্টেম ওভারভিউ'],
    ['founder-life', 'Founder Life'],
    { name: '--idea', type: 'separator', title: 'আইডিয়া ও মার্কেট' },
    ['idea-validation', 'আইডিয়া যাচাই'],
    ['customers', 'গ্রাহক খোঁজা'],
    { name: '--legal', type: 'separator', title: 'আইন ও নিবন্ধন' },
    ['legal-roadmap', 'আইনগত রোডম্যাপ'],
    ['company-types', 'কোম্পানির ধরন'],
    ['rjsc-name-clearance', 'RJSC / নাম ক্লিয়ারেন্স'],
    ['registration', 'ব্যবসা নিবন্ধন'],
    ['trade-license', 'ট্রেড লাইসেন্স'],
    ['e-tin-vat-bin', 'e-TIN ও VAT/BIN'],
    ['payments', 'পেমেন্ট সিস্টেম'],
    { name: '--phases', type: 'separator', title: 'রোডম্যাপ ফেজ' },
    ['phase-one', 'Phase 1 রোডম্যাপ'],
    ['phase-two', 'Phase 2 রোডম্যাপ'],
    ['phase-three', 'Phase 3 রোডম্যাপ'],
    ['phase-four', 'Phase 4 রোডম্যাপ']
  ]

  const enSidebar = [
    { name: '--intro', type: 'separator', title: 'Introduction' },
    ['start-here', 'Start Here'],
    ['startup-vs-sme', 'Startup vs SME'],
    ['ecosystem-overview', 'Ecosystem Overview'],
    ['founder-life', 'Founder Life'],
    { name: '--idea', type: 'separator', title: 'Idea & Market' },
    ['idea-validation', 'Idea Validation'],
    ['customers', 'Finding Customers'],
    { name: '--legal', type: 'separator', title: 'Legal & Registration' },
    ['legal-roadmap', 'Legal Roadmap'],
    ['rjsc-name-clearance', 'RJSC / Name Clearance'],
    ['registration', 'Business Registration'],
    ['trade-license', 'Trade License'],
    ['payments', 'Payment Systems'],
    { name: '--phases', type: 'separator', title: 'Roadmap Phases' },
    ['phase-one', 'Phase 1 Roadmap'],
    ['phase-two', 'Phase 2 Roadmap'],
    ['phase-three', 'Phase 3 Roadmap'],
    ['phase-four', 'Phase 4 Roadmap']
  ]

  useEffect(() => {
    document.documentElement.lang = isEn ? 'en' : 'bn'
  }, [isEn])

  // Localize Navbar
  const navbar = (
    <Navbar logo={<SiteLogo isEn={isEn} />}>
      <>
        <SearchBox isEn={isEn} />
        <LanguageSwitcher />
        <a
          className="github-star-link"
          href="https://github.com/Deshi-Startup/deshistartup"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="github-star-badge"
            src="https://img.shields.io/github/stars/Deshi-Startup/deshistartup?style=for-the-badge&logo=github&color=yellow"
            alt="Star on GitHub"
          />
        </a>
      </>
    </Navbar>
  )

  // Localize Footer
  const footer = (
    <Footer>
      {isEn
        ? 'Deshi Startup — an open, Bangladesh-specific founder operating manual.'
        : 'দেশি স্টার্টআপ — বাংলাদেশের প্রতিষ্ঠাতাদের জন্য উন্মুক্ত, বাস্তবভিত্তিক অপারেটিং ম্যানুয়াল।'}
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

    const withRoutes = (nodes, baseRoute = '') => {
      return nodes.map((node) => {
        if ('data' in node) return node
        if (node.type === 'separator') return node

        const route = node.route || `${baseRoute}/${node.name}`.replace(/\/+/g, '/')
        const nextNode = { ...node, route }

        if (node.children) {
          nextNode.children = withRoutes(node.children, route)
        }

        if (node.items) {
          nextNode.items = Object.fromEntries(
            Object.entries(node.items).map(([key, item]) => {
              if (item?.type === 'separator') return [key, item]

              return [
                key,
                {
                  ...item,
                  route: item?.route || `${route}/${key}`.replace(/\/+/g, '/')
                }
              ]
            })
          )
        }

        return nextNode
      })
    }

    const withoutIndex = (nodes) => {
      return nodes.filter((node) => !['index', 'page'].includes(node.name))
    }

    const orderPageMap = (nodes, sidebar) => {
      const nodeByName = new Map(withoutIndex(nodes).map((node) => [node.name, node]))
      const used = new Set()
      const ordered = []
      const data = {}

      for (const item of sidebar) {
        if (!Array.isArray(item)) {
          data[item.name] = {
            type: item.type,
            title: item.title
          }
          ordered.push({ name: item.name })
          continue
        }

        const [name, title] = item
        const node = nodeByName.get(name)
        if (!node) continue

        used.add(name)
        data[name] = { title }
        ordered.push({ ...node, title })
      }

      for (const node of withoutIndex(nodes)) {
        if (!used.has(node.name)) ordered.push(node)
      }

      return [{ data }, ...ordered]
    }

    if (isEn) {
      const enNode = findNode(visiblePageMap, 'en')
      return enNode ? withRoutes(orderPageMap(enNode.children || [], enSidebar), '/en') : []
    }

    return withRoutes(
      orderPageMap(
        visiblePageMap.filter((node) => node.name !== 'en'),
        bnSidebar
      )
    )
  }

  const localizedPageMap = getLocalizedPageMap(pageMap)

  return (
    <Layout
      navbar={navbar}
      footer={footer}
      pageMap={localizedPageMap}
      docsRepositoryBase="https://github.com/Deshi-Startup/deshistartup/tree/main"
      editLink={isEn ? 'Edit this page' : 'এই পাতাটি উন্নত করুন'}
      feedback={{ content: isEn ? 'Question? Give feedback' : 'প্রশ্ন বা মতামত দিন' }}
    >
      {children}
    </Layout>
  )
}
