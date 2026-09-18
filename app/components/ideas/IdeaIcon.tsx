export type IdeaIconName = 'arrow' | 'back' | 'search' | 'bookmark' | 'plus' | 'check' | 'download' | 'external'
  | 'commerce' | 'circular' | 'agriculture' | 'manufacturing'

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
    commerce: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    circular: <><path d="M20 12a8 8 0 0 1-14.3 4.9M4 12A8 8 0 0 1 18.3 7.1" /><path d="M18 3v4.5h-4.5M6 21v-4.5h4.5" /></>,
    agriculture: <><path d="M12 21V11" /><path d="M12 11C12 6.5 9 4 4 4c0 5 3 8 8 7Z" /><path d="M12 14c0-4 2.6-6 7-6 0 4.5-2.6 7-7 6Z" /></>,
    manufacturing: <path d="M3 21V9l6 4V9l6 4V5h6v16H3Z" />
  }
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
