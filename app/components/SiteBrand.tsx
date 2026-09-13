/** The same wordmark and global .brand styles serve the manual and Maps. */
export default function SiteBrand({ isEn }: { isEn: boolean }) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return (
    <a className="brand" href={isEn ? `${basePath}/en` : basePath || '/'} aria-label={isEn ? 'Deshi Startup home' : 'দেশি স্টার্টআপ হোম'}>
      <img src={`${basePath}/deshi-mark.webp`} alt="" width="50" height="50" />
      <span>
        <strong>{isEn ? 'Deshi Startup' : 'দেশি স্টার্টআপ'}</strong>
        <small>{isEn ? 'Startup manual for Bangladesh' : 'বাংলাদেশে স্টার্টআপ গড়ার ম্যানুয়াল'}</small>
      </span>
    </a>
  )
}
