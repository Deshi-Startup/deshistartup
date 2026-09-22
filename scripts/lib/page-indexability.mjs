export const isEcosystemForm = page => /^startup-ideas\/(add-company|review|add|submissions)$/.test(page.slug)
export const isNoindexPage = page => page.stub || isEcosystemForm(page)
