import { DEFAULT_DESCRIPTIONS } from '../../seo.config.mjs'

export const metadata = {
  title: {
    default: 'Deshi Startup – The Bangla-first startup guide for Bangladesh',
    template: '%s | Deshi Startup'
  },
  description: DEFAULT_DESCRIPTIONS.en
}

export default function EnglishContentLayout({ children }) {
  return children
}
