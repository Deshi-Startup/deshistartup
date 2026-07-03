export default function NotFound() {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>পৃষ্ঠা পাওয়া যায়নি</h1>
      <p style={{ marginBottom: '1.5rem' }}>আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই।</p>
      <a 
        href="/" 
        style={{ 
          color: '#0070f3', 
          textDecoration: 'underline',
          fontSize: '1.1rem'
        }}
      >
        হোম পেজে ফিরে যান
      </a>
    </div>
  )
}
