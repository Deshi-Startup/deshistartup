export default function NotFound() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

  return (
    <div style={{ maxWidth: '36rem', margin: '0 auto', padding: '56px 20px', textAlign: 'center' }}>
      <p className="wiki-kicker">৪০৪</p>
      <h1 style={{ fontFamily: 'var(--serif)' }}>পাতাটি পাওয়া যায়নি</h1>
      <p style={{ color: 'var(--muted)' }}>
        লিংকটি হয়তো বদলে গেছে, অথবা পাতাটি এখনো লেখা হয়নি। ওপরের সার্চ বক্সে খুঁজে দেখুন –
        অথবা নিচের কোনো পথ ধরুন।
      </p>
      <div className="contrib-row" style={{ justifyContent: 'center', marginTop: 24 }}>
        <a href={basePath || '/'}>প্রধান পাতা</a>
        <a href={`${basePath}/start-here`}>শুরু করুন</a>
        <a href={`${basePath}/contribute`}>অবদান রাখুন</a>
      </div>
    </div>
  )
}
