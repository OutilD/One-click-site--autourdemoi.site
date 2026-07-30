import { getBusinessDetail, getBusinessesBySlug, getSnapshot } from './snapshot'
import { getDirectorySource } from './sources'
import type { RatingBreakdown, Review } from '@/types'

/**
 * Accès aux avis clients.
 *
 * ⚠️ En mode API, LocalShark **n'expose pas** les avis : ils sont rendus par
 * un widget iframe dont l'URL est portée par `business.reviewsWidgetUrl`.
 * Les méthodes ci-dessous renvoient donc des listes vides dans ce mode ; seuls
 * les agrégats (`rating`, `reviewCount`) restent disponibles sur la fiche.
 *
 * Utiliser `hasApiReviews()` pour savoir s'il faut afficher la liste native
 * ou le widget.
 */
export class ReviewRepository {
  /** `true` si la source fournit le texte des avis (mode statique uniquement). */
  static hasApiReviews(): boolean {
    return getDirectorySource().mode === 'static'
  }

  static async getByBusinessSlug(slug: string, limit?: number): Promise<Review[]> {
    const detail = await getBusinessDetail(slug)
    if (!detail) return []
    return typeof limit === 'number' ? detail.reviews.slice(0, limit) : detail.reviews
  }

  /** Derniers avis toutes fiches confondues. Vide en mode API. */
  static async getLatest(limit = 6): Promise<Review[]> {
    const { latestReviews } = await getSnapshot()
    return latestReviews.slice(0, limit)
  }

  /** Somme des avis agrégés déclarés sur les fiches. */
  static async count(): Promise<number> {
    return (await getSnapshot()).stats.reviewCount
  }

  /**
   * Distribution des notes d'une fiche.
   *
   * Ni l'API ni le widget n'exposent la répartition par étoile : elle est
   * **reconstituée** à partir de la moyenne et du total. C'est une
   * approximation — d'où `isEstimated`, qui permet à l'interface de le dire.
   */
  static async getBreakdown(slug: string): Promise<(RatingBreakdown & { isEstimated: boolean }) | null> {
    const business = (await getBusinessesBySlug()).get(slug)
    if (!business || business.rating === null || business.reviewCount === 0) return null

    const { rating, reviewCount } = business

    // Poids décroissant à mesure que l'on s'éloigne de la note moyenne.
    const weights = ([1, 2, 3, 4, 5] as const).map((star) => ({
      star,
      weight: 1 / (1 + (rating - star) ** 2 * 3),
    }))
    const totalWeight = weights.reduce((sum, entry) => sum + entry.weight, 0)

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>
    let assigned = 0

    for (const [index, entry] of weights.entries()) {
      const isLast = index === weights.length - 1
      // La dernière tranche absorbe l'arrondi pour que le total soit exact.
      const value = isLast ? reviewCount - assigned : Math.round((entry.weight / totalWeight) * reviewCount)
      distribution[entry.star] = Math.max(0, value)
      assigned += distribution[entry.star]
    }

    return { average: rating, total: reviewCount, distribution, isEstimated: true }
  }
}
