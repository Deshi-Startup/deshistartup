export function eventsForLocale(events, locale) {
  return events.filter((event) => event.locales == null || event.locales.includes(locale))
}

function fillStaticSlot(html, content, slot) {
  return slot.test(html)
    ? html.replace(slot, (_match, opening, closing) => `${opening}${content}${closing}`)
    : html
}

export function fillPageByline(html, content) {
  return fillStaticSlot(
    html,
    content,
    /(<div\b(?=[^>]*\bdata-deshi-byline="true")[^>]*>)[\s\S]*?(<\/div>)/i
  )
}

export function fillPageCredits(html, content) {
  return fillStaticSlot(
    html,
    content,
    /(<section\b(?=[^>]*\bdata-deshi-credits="true")[^>]*>)[\s\S]*?(<\/section>)/i
  )
}
