// The record of accepted work that closes a guide.
//
// The byline at the top names the strongest thing one person did. This is the
// full account: every accepted contribution to the page, who was credited for
// it, and the public evidence. Both surfaces are generated from the same
// events during the static build, so they cannot disagree, and neither ships
// any JavaScript to the reader.
//
// The unit here is the contribution, not the credit. Two people credited on one
// accepted change did one piece of work between them: printing the summary, the
// date and the evidence link once under both names says that, where a row each
// said it twice in identical words and read like a bug.

import { ROLE_ACTIVITY_LABELS, contributorProfilePath } from './contributor-leaderboard.mjs'

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatAcceptedDate(value, locale) {
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.valueOf())) return value
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-BD' : 'bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date)
}

// "Editing and review" and "সম্পাদনা ও রিভিউ" are the labels with a conjunction
// between them. Drop the conjunction as a word, never as a letter sequence, so
// a real summary about a standard keeps its "and".
function normalizeScope(value) {
  return String(value)
    .toLowerCase()
    .replace(/\band\b/g, ' ')
    .replace(/(^|\s)ও(?=\s|$)/g, ' ')
    .replace(/[\s·,&+/-]/g, '')
}

/**
 * True when an event's summary says only what the role labels beside it
 * already say — a summary of "Editing" under a credit already labelled
 * "Editing". Printing both puts the same word on the row twice, two lines
 * apart. The renderer drops the line; the SEO audit reads the same predicate,
 * so a dropped scope is an expected absence rather than missing content.
 *
 * @param {object} event   an accepted contribution event
 * @param {'bn'|'en'} locale
 * @returns {boolean}
 */
export function scopeRepeatsRoles(event, locale) {
  const summary = normalizeScope(event.summary?.[locale] || '')
  if (!summary) return true
  const labels = [
    ...new Set(
      event.credits.flatMap((credit) =>
        credit.roles.map((role) => normalizeScope(ROLE_ACTIVITY_LABELS[role]?.[locale] || role))
      )
    )
  ]
  // One label, or every label of the event run together in either the order
  // they were credited or alphabetical order: "Editing and review" under
  // credits labelled Editing and Review carries nothing the labels do not.
  return (
    labels.includes(summary) ||
    labels.join('') === summary ||
    labels.slice().sort().join('') === summary
  )
}

function creditIdentityHtml(credit, { locale, profileById, href, anonymousLabel }) {
  const profile = credit.profileId ? profileById.get(credit.profileId) : null
  if (!profile) return `<span class="page-credit__anon">${escapeHtml(anonymousLabel)}</span>`
  const route = escapeHtml(href(contributorProfilePath(profile.slug, locale)))
  return `<strong class="page-credit__person"><a href="${route}">${escapeHtml(profile.displayName)}</a></strong>`
}

/**
 * @param {object} input
 * @param {Array} input.events              accepted events targeting this page
 * @param {'bn'|'en'} input.locale
 * @param {Map} input.profileById           public profiles, keyed by ledger id
 * @param {Map} input.organizationById      public organizations, keyed by id
 * @param {(route: string) => string} input.href  applies the build's base path
 * @returns {string} HTML for the credits section, or '' when nothing is recorded
 */
export function pageCreditsHtml({ events, locale, profileById, organizationById, href }) {
  if (events.length === 0) return ''
  const isEn = locale === 'en'
  // Plain words a first-time founder reads without slowing down. "Evidence",
  // "accepted work" and "affiliation at the time" are the words a process uses
  // about itself; these are the words a reader would use about the page.
  const heading = isEn ? 'Who worked on this page' : 'এই পেজে কারা কাজ করেছেন'
  const anonymousLabel = isEn ? 'Chose not to be named' : 'নাম প্রকাশ করেননি'
  const evidence = isEn ? 'See the source' : 'সোর্স দেখে নিন'
  const added = isEn ? 'Added' : 'যোগ হয়েছে'
  const affiliation = isEn ? 'Worked at' : 'তখন কাজ করতেন'
  const reviewScope = isEn ? 'Checked' : 'যা দেখেছেন'

  const rows = events.map((event) => {
    const people = event.credits.map((credit, creditIndex) => {
      const organization = credit.organizationId
        ? organizationById.get(credit.organizationId) || null
        : null
      const identity = creditIdentityHtml(credit, { locale, profileById, href, anonymousLabel })
      // The person leads and the roles qualify. Roles led once, which left every
      // name starting at whatever x the role word happened to end at — a ragged
      // column that moved by 68px between rows in the English edition.
      const roles = credit.roles
        .map((role) => ROLE_ACTIVITY_LABELS[role]?.[locale] || role)
        .map((role) => `<span>${escapeHtml(role)}</span>`)
        .join('')
      const organizationHtml = organization
        ? `<p class="page-credit__affiliation"><strong>${affiliation}:</strong> ${
            organization.url
              ? `<a href="${escapeHtml(organization.url)}" rel="noopener noreferrer">${escapeHtml(organization.name)}</a>`
              : escapeHtml(organization.name)
          }</p>`
        : ''
      const reviewHtml = credit.review
        ? `<p class="page-credit__review"><strong>${reviewScope}:</strong> ${escapeHtml(credit.review.scope[locale])} · <time datetime="${credit.review.reviewedAt}">${escapeHtml(formatAcceptedDate(credit.review.reviewedAt, locale))}</time></p>`
        : ''
      return `<li class="page-credit__credit" data-credit-index="${creditIndex}"><p class="page-credit__line">${identity}<span class="page-credit__roles">${roles}</span></p>${organizationHtml}${reviewHtml}</li>`
    })
    const scopeHtml = scopeRepeatsRoles(event, locale)
      ? ''
      : `<p class="page-credit__scope">${escapeHtml(event.summary[locale])}</p>`
    return `<li class="page-credit" data-contribution-event="${escapeHtml(event.id)}"><ul class="page-credit__people">${people.join('')}</ul>${scopeHtml}<p class="page-credit__meta"><span>${added} <time datetime="${event.acceptedAt}">${escapeHtml(formatAcceptedDate(event.acceptedAt, locale))}</time></span><span class="page-credit__sep" aria-hidden="true">·</span><a href="${escapeHtml(event.evidenceUrl)}" rel="noopener noreferrer">${evidence}</a></p></li>`
  })

  // The heading says what the list is. A sentence beside it saying the same
  // thing in longer words was the only reason this block needed two columns.
  return `<div class="page-contribution-credits__header"><h2 id="credits-heading">${heading}</h2></div><ol class="page-credit-list">${rows.join('')}</ol>`
}
