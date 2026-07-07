import StubNotice from './app/components/StubNotice'
import SectionIndex from './app/components/SectionIndex'

export function useMDXComponents(components) {
  return {
    StubNotice,
    SectionIndex,
    ...components
  }
}
