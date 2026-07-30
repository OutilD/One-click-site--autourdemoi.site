import { businesses } from './businesses'
import { buildReviews } from './factories'
import type { Review } from '@/types'

/**
 * Avis de démonstration, dérivés des fiches entreprises (données statiques).
 * `Business.reviewCount` reste l'agrégat de la fiche : la liste ci-dessous
 * est l'échantillon publié, comme le renverra l'API en phase 2.
 */
export const reviews: Review[] = businesses.flatMap(buildReviews)

/** Index avis par entreprise — évite un `filter()` sur l'ensemble du jeu. */
export const reviewsByBusinessId: ReadonlyMap<string, Review[]> = reviews.reduce((map, review) => {
  const existing = map.get(review.businessId)
  if (existing) existing.push(review)
  else map.set(review.businessId, [review])
  return map
}, new Map<string, Review[]>())
