import type { Locale } from './types'
import IdeaShell from './IdeaShell'
import IdeaDraft from './IdeaDraft'

export default function ContributeIdea({ locale }: { locale: Locale }) {
  return <IdeaShell locale={locale}><IdeaDraft locale={locale} /></IdeaShell>
}
