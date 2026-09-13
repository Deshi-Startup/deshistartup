import React from 'react'
import { DEFAULT_DESCRIPTIONS } from '../../seo.config.mjs'

export const metadata = {
  title: {
    default: 'Deshi Startup – The free, open-source manual for building startups in Bangladesh'
  },
  description: DEFAULT_DESCRIPTIONS.en
}

interface EnglishContentLayoutProps {
  children?: React.ReactNode
}

export default function EnglishContentLayout({ children }: EnglishContentLayoutProps) {
  return <>{children}</>
}
