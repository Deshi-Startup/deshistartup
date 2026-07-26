import React from 'react'
import { DEFAULT_DESCRIPTIONS } from '../../seo.config'

export const metadata = {
  title: {
    default: 'Deshi Startup – The Bangladeshi startup manual',
    template: '%s | Deshi Startup'
  },
  description: DEFAULT_DESCRIPTIONS.en
}

interface EnglishContentLayoutProps {
  children?: React.ReactNode
}

export default function EnglishContentLayout({ children }: EnglishContentLayoutProps) {
  return <>{children}</>
}
