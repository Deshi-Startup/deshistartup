function normalizedKey(value) {
  return [...String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()]
    .slice(0, 180)
    .join('')
    .toLocaleLowerCase('en-US')
}

function policySet(values) {
  return new Set((Array.isArray(values) ? values : []).map(normalizedKey).filter(Boolean))
}

/**
 * Mirror the contributor generator's public-profile decision without reading
 * files or resolving media. The reason is retained so lint can explain which
 * withdrawal control still owns a profile.
 */
export function contributorProfileWithdrawal(profile, policy = {}) {
  if (profile?.visibility !== 'public') return { kind: 'visibility' }

  const profileId = normalizedKey(profile?.id)
  if (policySet(policy.exclusions?.profileIds).has(profileId)) {
    return { kind: 'exclusion-profile' }
  }
  if (policySet(policy.optOuts?.profileIds).has(profileId)) {
    return { kind: 'opt-out-profile' }
  }

  const githubLogin = normalizedKey(profile?.githubLogin)
  if (githubLogin && policySet(policy.exclusions?.githubLogins).has(githubLogin)) {
    return { kind: 'exclusion-github', identity: profile.githubLogin }
  }
  if (githubLogin && policySet(policy.optOuts?.githubLogins).has(githubLogin)) {
    return { kind: 'opt-out-github', identity: profile.githubLogin }
  }

  const hiddenInline = policySet(policy.exclusions?.inlineNames)
  const optedOutInline = policySet(policy.optOuts?.inlineNames)
  for (const [inlineName, aliasedProfileId] of Object.entries(policy.identityAliases?.inlineNames || {})) {
    if (normalizedKey(aliasedProfileId) !== profileId) continue
    const inlineKey = normalizedKey(inlineName)
    if (hiddenInline.has(inlineKey)) {
      return { kind: 'exclusion-inline', identity: inlineName }
    }
    if (optedOutInline.has(inlineKey)) {
      return { kind: 'opt-out-inline', identity: inlineName }
    }
  }

  return null
}

/** Separate live media paths from withdrawn ones so lint and prune agree. */
export function classifyContributorMediaAvatars(ledger, policy = {}) {
  if (!Array.isArray(ledger?.profiles)) {
    throw new Error('contributor ledger must contain a profiles array')
  }

  const active = []
  const withdrawn = []
  for (const profile of ledger.profiles) {
    if (profile?.avatar?.kind !== 'media') continue
    const reference = {
      profileId: profile.id || '(unknown profile)',
      path: profile.avatar.path
    }
    const withdrawal = contributorProfileWithdrawal(profile, policy)
    if (withdrawal) withdrawn.push({ ...reference, withdrawal })
    else active.push(reference)
  }
  return { active, withdrawn }
}
