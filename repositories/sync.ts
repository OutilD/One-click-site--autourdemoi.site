import { after } from 'next/server'
import { revalidateTag } from 'next/cache'
import { DIRECTORY_TAG } from '@/lib/localshark/client'
import { getDataSourceMode } from '@/lib/localshark/config'
import { getBusinessesBySlug } from './snapshot'

/**
 * Rafraîchit l'annuaire quand une fiche s'avère plus récente que l'instantané.
 *
 * Une entreprise créée après le dernier passage de l'API est servie
 * immédiatement — Next rend sa page à la demande via l'endpoint « détail ».
 * Mais l'instantané global, lui, reste périmé jusqu'à sa revalidation horaire :
 * la fiche n'apparaît alors ni dans les listings, ni dans les catégories, ni
 * dans le sitemap.
 *
 * Cette visite est justement le signal qu'il manque quelque chose. On purge
 * donc l'étiquette de l'annuaire pour que la prochaine lecture reparte de
 * l'API, au lieu d'attendre l'heure.
 *
 * Le travail est confié à `after()` : il s'exécute une fois la réponse envoyée,
 * le visiteur n'attend rien. C'est aussi la seule façon d'appeler
 * `revalidateTag` depuis une page — l'invoquer pendant le rendu n'est pas
 * permis.
 */
export function refreshDirectoryIfBehind(slug: string): void {
  // En mode statique, il n'y a ni API ni cache à purger.
  if (getDataSourceMode() !== 'localshark') return

  after(async () => {
    try {
      const bySlug = await getBusinessesBySlug()

      // L'instantané connaît la fiche : il est à jour, rien à faire.
      if (bySlug.has(slug)) return

      revalidateTag(DIRECTORY_TAG)
      console.info(
        `[localshark] fiche « ${slug} » absente de l'instantané : annuaire marqué pour rafraîchissement.`,
      )
    } catch (error) {
      /*
        Ce rafraîchissement est opportuniste : son échec ne doit jamais
        remonter au visiteur, qui a déjà reçu sa page.

        Un cas est attendu : pendant la génération statique, `after()` s'exécute
        aussi, et `revalidateTag` y lève « Dynamic server usage ». La condition
        ci-dessus l'empêche en pratique — au build, toute fiche prérendue vient
        de l'instantané, donc s'y trouve — mais le filet reste nécessaire.
      */
      console.error('[localshark] rafraîchissement opportuniste impossible :', error)
    }
  })
}
