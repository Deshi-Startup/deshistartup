// The one-line credit that opens a guide.
//
// The record below the article says who did what, with dates and evidence. It
// answers a question the reader stopped asking three thousand words earlier.
// This line answers it in the meta row, where a reader is still deciding
// whether to trust the page, and then points down at the record for the proof.
// Both surfaces are generated from the same events, so they cannot disagree.
//
// Runs during the static build only. It ships no JavaScript to the reader.

import { ROLE_IDS, contributorProfilePath } from './contributor-leaderboard.mjs'

// A byline names the strongest thing a person did to the page, so an
// editor-only page never claims someone wrote it. ROLE_IDS is already ordered
// strongest-first, and is the single ordering both surfaces read.
export const BYLINE_VERBS = Object.freeze({
  author: { bn: 'লিখেছেন', en: 'Written by' },
  editor: { bn: 'সম্পাদনা করেছেন', en: 'Edited by' },
  translator: { bn: 'অনুবাদ করেছেন', en: 'Translated by' },
  researcher: { bn: 'গবেষণা করেছেন', en: 'Researched by' },
  'operational-insight': { bn: 'মাঠের অভিজ্ঞতা জানিয়েছেন', en: 'Field insight from' },
  reviewer: { bn: 'রিভিউ করেছেন', en: 'Reviewed by' },
  product: { bn: 'প্রোডাক্টে কাজ করেছেন', en: 'Product work by' }
})

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function bengaliDigits(value) {
  return String(value).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)])
}

/* A byline is one line of running text, so the browser chooses where it breaks.
   Left alone it chose the middle of a name — "Muhaiminul Islam / Khan" — and the
   middle of a two-word Bangla verb, on every phone width up to 414px. These are
   the units that must survive a wrap intact: a verb, a name, a count. Between
   them the line may break freely, which is what keeps a long byline readable
   rather than merely short. The limit guards the pathological case: a name too
   long to fit any phone line stays breakable rather than running off the page. */
const NO_BREAK_LIMIT = 34

function noBreak(html, text) {
  return [...String(text)].length <= NO_BREAK_LIMIT ? `<span class="byline-nb">${html}</span>` : html
}

function verbHtml(role, locale) {
  const verb = BYLINE_VERBS[role][locale]
  return noBreak(escapeHtml(verb), verb)
}

/* The separator carries its own leading space so no break can strand a "·" at
   the start of a line; the ordinary space after it is where the line may turn. */
const SEPARATOR = '<span class="byline-sep" aria-hidden="true">\u00a0·</span> '

/* One row per person, however many events named them, because the byline is
   about people and the record is about events. Within the strongest role, the
   earliest acceptance in that role leads: on a page several people have
   touched, the one who wrote it first is the one a reader is looking for. */
function bylinePeople(events, profileById) {
  const byProfile = new Map()
  let ledgerOrder = 0
  for (const event of events) {
    for (const credit of event.credits) {
      const creditOrder = ledgerOrder++
      const profile = credit.profileId ? profileById.get(credit.profileId) : null
      if (!profile) continue
      const person = byProfile.get(profile.id) || {
        profile,
        firstAcceptanceByRole: new Map(),
        adaptation: false
      }
      for (const role of credit.roles) {
        const firstAcceptance = person.firstAcceptanceByRole.get(role)
        if (!firstAcceptance || event.acceptedAt < firstAcceptance.acceptedAt) {
          person.firstAcceptanceByRole.set(role, {
            acceptedAt: event.acceptedAt,
            ledgerOrder: creditOrder
          })
        }
      }
      if (event.attribution === 'adaptation' && credit.roles.includes('author')) {
        person.adaptation = true
      }
      byProfile.set(profile.id, person)
    }
  }
  return [...byProfile.values()]
}

/**
 * @param {object} input
 * @param {Array} input.events        accepted events targeting this page
 * @param {'bn'|'en'} input.locale
 * @param {Map} input.profileById     public profiles, keyed by ledger id
 * @param {(route: string) => string} input.href  applies the build's base path
 * @returns {string} HTML for the meta row's byline slot
 */
export function pageBylineHtml({ events, locale, profileById, href }) {
  const isEn = locale === 'en'
  const aboutHref = escapeHtml(href(isEn ? '/en/about' : '/about'))

  const people = bylinePeople(events, profileById)
  const anonymousCount = events.reduce(
    (total, event) => total + event.credits.filter((credit) => !credit.profileId).length,
    0
  )

  // Most guides are the core team's own work and name nobody in the ledger.
  // Saying so plainly, and pointing at the editorial policy, is a better answer
  // than a blank space a reader cannot tell apart from "not recorded".
  if (people.length === 0 && anonymousCount === 0) {
    return isEn
      ? `Written by <a href="${aboutHref}">the Deshi Startup team</a>`
      : `লিখেছেন <a href="${aboutHref}">দেশি স্টার্টআপ টিম</a>`
  }

  const leadRole = ROLE_IDS.find((role) =>
    people.some((person) => person.firstAcceptanceByRole.has(role))) || 'author'
  const verb = verbHtml(leadRole, locale)
  // An adaptation is a permanent fact about the guide, so its author leads even
  // if ordinary authorship was accepted earlier. Otherwise acceptance order in
  // this role leads; exact-date ties keep the ledger's authored credit order.
  const leads = people
    .filter((person) => person.firstAcceptanceByRole.has(leadRole))
    .sort((a, b) => {
      const aFirst = a.firstAcceptanceByRole.get(leadRole)
      const bFirst = b.firstAcceptanceByRole.get(leadRole)
      return Number(b.adaptation) - Number(a.adaptation) ||
        aFirst.acceptedAt.localeCompare(bFirst.acceptedAt) ||
        aFirst.ledgerOrder - bFirst.ledgerOrder
    })
  const ordered = [
    ...leads,
    ...people.filter((person) => !person.firstAcceptanceByRole.has(leadRole))
  ]
  const total = people.length + anonymousCount

  const nameAnchor = (person) =>
    `<a href="${escapeHtml(href(contributorProfilePath(person.profile.slug, locale)))}">${escapeHtml(person.profile.displayName)}</a>`
  const nameLink = (person) => noBreak(nameAnchor(person), person.profile.displayName)
  // In Bangla the possessive rides on the name, so the name and its ending are
  // one unit; only "লেখা অবলম্বনে" after them may fall to the next line.
  const adaptedFrom = (person) =>
    `${noBreak(`${nameAnchor(person)}-এর`, `${person.profile.displayName}-এর`)} লেখা অবলম্বনে`
  // The tail is a count, not a decoration: it is the one thing the line cannot
  // show, so it is also the thing worth spending a link on.
  const recordLink = (label) =>
    noBreak(
      `<a href="#credits">${escapeHtml(label)}<span aria-hidden="true"> ↓</span></a>`,
      label
    )
  const moreLabel = (count) => isEn
    ? `${count} ${count === 1 ? 'other' : 'others'}`
    : `আরও ${bengaliDigits(count)} জন`

  if (ordered.length === 0) {
    const label = isEn ? `${total} contributor${total === 1 ? '' : 's'}` : `${bengaliDigits(total)} জন`
    return `${verb} ${recordLink(label)}`
  }

  // An adaptation is a permanent fact about the guide, so the phrasing outlives
  // later contributors instead of being replaced by them.
  if (leadRole === 'author' && ordered[0].adaptation) {
    const adaptationAuthors = ordered.filter((person) => person.adaptation)
    if (total === 2 && people.length === 2 && adaptationAuthors.length === 2) {
      const first = nameLink(adaptationAuthors[0])
      const second = adaptationAuthors[1]
      return isEn
        ? `Adapted from ${first} and ${nameLink(second)}`
        : `${first} ও ${adaptedFrom(second)}`
    }
    const line = isEn
      ? `Adapted from ${nameLink(ordered[0])}`
      : `${adaptedFrom(ordered[0])}`
    if (total === 2 && people.length === 2) {
      const secondRole = ROLE_IDS.find((role) =>
        ordered[1].firstAcceptanceByRole.has(role)) || 'author'
      const secondVerb = verbHtml(secondRole, locale)
      return `${line}${SEPARATOR}${secondVerb} ${nameLink(ordered[1])}`
    }
    return total > 1 ? `${line}${SEPARATOR}${recordLink(moreLabel(total - 1))}` : line
  }

  if (total === 1) return `${verb} ${nameLink(ordered[0])}`
  // Two people stay named outright. Share one verb only when both did the same
  // strongest thing; mixed roles get their own clause so an editor is never
  // described as an author merely to keep the line short.
  if (total === 2 && leads.length === 2) {
    return `${verb} ${nameLink(ordered[0])} ${isEn ? 'and' : 'ও'} ${nameLink(ordered[1])}`
  }
  if (total === 2 && people.length === 2) {
    const secondRole = ROLE_IDS.find((role) =>
      ordered[1].firstAcceptanceByRole.has(role)) || 'author'
    const secondVerb = verbHtml(secondRole, locale)
    return `${verb} ${nameLink(ordered[0])}${SEPARATOR}${secondVerb} ${nameLink(ordered[1])}`
  }
  // Past two names the line would grow without limit, which is what breaks it
  // on a phone. The lead holds the line and the rest becomes the count.
  return `${verb} ${nameLink(ordered[0])}${SEPARATOR}${recordLink(moreLabel(total - 1))}`
}
