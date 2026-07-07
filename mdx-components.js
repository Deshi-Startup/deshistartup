import StubNotice from './app/components/StubNotice'
import SectionIndex from './app/components/SectionIndex'
import DirectoryList from './app/components/DirectoryList'

export function useMDXComponents(components) {
  return {
    StubNotice,
    SectionIndex,
    DirectoryList,
    ...components
  }
}
