const DEFAULT_EVENT_LOCALES = ['bn', 'en']

/**
 * Resolves a credited page to an edition the event actually changed. Profile
 * pages keep every event visible, but they must not link to an uncredited
 * locale mirror.
 */
export function contributorEventTarget(path, eventLocales, viewingLocale) {
  const locales = Array.isArray(eventLocales) && eventLocales.length > 0
    ? eventLocales
    : DEFAULT_EVENT_LOCALES
  const locale = locales.includes(viewingLocale) ? viewingLocale : locales[0]
  return {
    locale,
    path: `${locale === 'en' ? '/en' : ''}${path}`
  }
}
