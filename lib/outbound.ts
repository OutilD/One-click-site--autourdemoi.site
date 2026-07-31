/**
 * Politique de liens sortants de l'annuaire.
 *
 * Le site de l'établissement est le seul lien suivi : lui transmettre
 * l'autorité de l'annuaire est la contrepartie du référencement de sa fiche.
 *
 * Tout le reste reste en `nofollow` — cartes, réseaux sociaux, plateformes de
 * réservation. Ces destinations appartiennent à des tiers, n'ont pas besoin de
 * notre autorité, et la leur céder ne sert ni l'annuaire ni l'établissement.
 */
export const BUSINESS_SITE_REL = 'noopener noreferrer'
export const THIRD_PARTY_REL = 'noopener noreferrer nofollow'

/** Domaine comparable : casse et `www.` neutralisés. */
function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

/**
 * Décide du `rel` d'un lien d'action de publication.
 *
 * Ces boutons mènent le plus souvent vers une page interne du site de
 * l'établissement — et alors le lien est suivi. Mais pas toujours : certains
 * pointent vers une plateforme de réservation tierce, ou vers un numéro de
 * téléphone. On ne suit donc que ce qui partage le domaine du site déclaré.
 */
export function outboundRel(targetUrl: string, businessWebsite?: string): string {
  if (!businessWebsite) return THIRD_PARTY_REL

  const target = hostOf(targetUrl)
  const site = hostOf(businessWebsite)

  return target !== null && target === site ? BUSINESS_SITE_REL : THIRD_PARTY_REL
}
