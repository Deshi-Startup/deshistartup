/**
 * What readers searched for, and whether the wiki had an answer.
 *
 * GA4's built-in site-search measurement reads the search term out of a URL
 * query parameter (`?q=`, `?s=`, `?search=`, …). Our search never touches the
 * URL: Pagefind runs in the browser and the results live in a popover, so the
 * built-in measurement is on and silently records nothing — sixty days of
 * traffic produced zero `view_search_results`. The term has to be pushed to
 * the data layer by hand, under the name GA4 reserves for it, so that
 * `search_term` lands in the built-in Search term dimension rather than a
 * custom one.
 *
 * The queries that return nothing are the point. Each one is a reader telling
 * us which guide to write next, in their own words, which is a better signal
 * than our own guesses at the backlog.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

/* A search box is shaped like a form, so a share of readers will type an email
   address or a phone number into it. Sending that to GA4 would put personal
   data in an analytics property that has no business holding it, and Google's
   terms treat it as grounds for deleting the property. Anything that looks
   like a contact detail is dropped rather than cleaned: a term we cannot
   measure costs us one row, a term we should never have stored costs more.

   The digit run has to count Bangla digits too — a reader typing their phone
   number here is far more likely to write ০১৭… than 017…. A phone-shaped run
   may contain any punctuation, symbol or whitespace a keyboard offers, so
   slashes and Unicode dashes are caught alongside spaces and hyphens. The
   threshold sits at seven so real queries keep their numbers: `কোম্পানি আইন
   ১৯৯৪`, `ভ্যাট ১৫%`, and `form IX` all survive. */
function looksLikeContactDetail(term: string) {
  if (term.includes('@')) return true
  return /[0-9০-৯](?:[^\p{L}\p{N}]*[0-9০-৯]){6,}/u.test(term)
}

/**
 * The comparable spelling of a query, or `null` if it should never be sent.
 *
 * Case and spacing are flattened so `Trade License` and `trade  license` meet
 * in one row instead of splitting the count three ways.
 */
export function normalizeSearchTerm(term: string): string | null {
  const clean = term.trim().replace(/\s+/g, ' ').toLowerCase()
  if (!clean) return null
  if (looksLikeContactDetail(clean)) return null
  return clean.slice(0, 100)
}

/* The GTM snippet loads on `lazyOnload`, so a reader who searches within the
   first moments of a page can beat it. Creating the queue here means those
   events wait in the array and GTM replays them on arrival, instead of being
   dropped by an optional-chained push against an undefined global. */
function push(payload: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
}

/**
 * A query the reader settled on. Fires once per settled query, not per
 * keystroke — see the caller for the timing.
 */
export function trackSearch(term: string, resultsCount: number, isEn: boolean) {
  const searchTerm = normalizeSearchTerm(term)
  if (!searchTerm) return
  push({
    event: 'site_search',
    search_term: searchTerm,
    results_count: resultsCount,
    search_language: isEn ? 'en' : 'bn'
  })
}

export interface SearchReportState {
  term: string | null
}

/**
 * Report a settled query at most once. The search box calls this from both its
 * quiet-period timer and its result-selection path: a fast reader who chooses
 * a result before the timer fires is still counted, without a later duplicate.
 */
export function trackSearchOnce(
  state: SearchReportState,
  term: string,
  resultsCount: number,
  isEn: boolean
) {
  const searchTerm = normalizeSearchTerm(term)
  if (!searchTerm || state.term === searchTerm) return false
  trackSearch(searchTerm, resultsCount, isEn)
  state.term = searchTerm
  return true
}

/**
 * A result the reader actually opened. Without this, a search that returned
 * eight useless matches is indistinguishable from one that answered the
 * question on the first row.
 */
export function trackSearchResultSelect(
  term: string,
  { url, index, isStub }: { url: string; index: number; isStub: boolean },
  isEn: boolean
) {
  const searchTerm = normalizeSearchTerm(term)
  if (!searchTerm) return
  push({
    event: 'site_search_select',
    search_term: searchTerm,
    search_result_url: url,
    search_result_position: index + 1,
    search_result_is_stub: isStub,
    search_language: isEn ? 'en' : 'bn'
  })
}
