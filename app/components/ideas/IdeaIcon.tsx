export type IdeaIconName = 'arrow' | 'back' | 'search' | 'bookmark' | 'plus' | 'check' | 'download' | 'external'
  | 'share'

export default function IdeaIcon({ name, filled = false }: { name: IdeaIconName; filled?: boolean }) {
  const paths = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    external: <path d="M14 4h6v6M20 4 10 14M10 5H4v15h15v-6" />,
    back: <path d="M19 12H5m6-6-6 6 6 6" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
    bookmark: <path d="M6 4h12v17l-6-4-6 4V4Z" fill={filled ? 'currentColor' : 'none'} />,
    plus: <path d="M12 5v14M5 12h14" />,
    check: <path d="m5 12 4 4L19 6" />,
    download: <path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" />,
    share: <path d="M12 3v13m-5-8 5-5 5 5M5 14v6h14v-6" />
  }
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
