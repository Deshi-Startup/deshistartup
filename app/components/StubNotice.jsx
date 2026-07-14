import { REPO_URL } from '../nav.config'

/**
 * Honest Wikipedia-style stub banner. Rendered on pages that are planned
 * but not yet written. Server-safe, no client JS.
 */
export default function StubNotice({ path, locale = 'bn' }) {
  const isEn = locale === 'en'
  const file = isEn
    ? `app/(contents)/en/${path}/page.mdx`
    : `app/(contents)/(bn)/${path}/page.mdx`
  const editUrl = `${REPO_URL}/edit/main/${file}`
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const contributeHref = `${basePath}${isEn ? '/en/contribute' : '/contribute'}`

  return (
    <>
      {/* Lets search results rank finished guides first and badge stubs. */}
      <span data-pagefind-meta="stub" style={{ display: 'none' }}>1</span>
      <aside className="stub-notice" role="note" data-pagefind-ignore>
      <strong>{isEn ? 'This page has not been written yet' : 'এই পাতাটি এখনো লেখা হয়নি'}</strong>
      <p>
        {isEn
          ? 'The topic is on our list, but the full guide is still to be written. Below you will find sources you can read in the meantime. If you know this subject – even partially – you can write this page. Reviewers will help polish the language.'
          : 'বিষয়টা আমাদের তালিকায় আছে, কিন্তু পুরো গাইডটা এখনো লেখা বাকি। নিচে কয়েকটি সূত্র আছে। আপাতত সেগুলো দেখে নিতে পারেন। এই বিষয়ে কিছু জানলে, আংশিক হলেও, পাতাটা লিখতে পারেন। ভাষা বা বানান নিয়ে চিন্তা করবেন না। রিভিউয়াররা গুছিয়ে দেবেন।'}
      </p>
      <div className="contrib-row">
        <a href={editUrl} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
          {isEn ? 'Write this page' : 'পাতাটি লিখুন'}
        </a>
        <a href={contributeHref}>
          {isEn ? 'How contributing works' : 'কীভাবে অবদান রাখবেন'}
        </a>
      </div>
      </aside>
    </>
  )
}
