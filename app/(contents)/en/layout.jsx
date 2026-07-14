import { DEFAULT_DESCRIPTIONS } from '../../seo.config.mjs'

export const metadata = {
  title: {
    default: 'Deshi Startup – The Bangladeshi startup manual',
    template: '%s | Deshi Startup'
  },
  description: DEFAULT_DESCRIPTIONS.en
}

export default function EnglishContentLayout({ children }) {
  return children
}
