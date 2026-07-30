import type { IsoDate } from './common'

export type ReviewSource = 'google' | 'facebook' | 'site'

/** Réponse du professionnel à un avis. */
export interface ReviewReply {
  content: string
  /** Absent de l'API LocalShark, qui ne renvoie que le texte de la réponse. */
  publishedAt?: IsoDate
}

/**
 * Avis client rattaché à une fiche entreprise.
 *
 * Les champs optionnels ne sont pas exposés par l'API Google Business via
 * LocalShark : ils ne sont renseignés qu'en mode données statiques. Les
 * composants doivent donc tous les traiter comme facultatifs.
 */
export interface Review {
  id: string
  businessId: string
  authorName: string
  authorAvatar?: string
  /** Nombre total d'avis publiés par l'auteur (crédibilité). */
  authorReviewCount?: number
  /** Note entière de 1 à 5. */
  rating: number
  title?: string
  /** Peut être vide : Google autorise une note sans commentaire. */
  content: string
  publishedAt: IsoDate
  source: ReviewSource
  helpfulCount?: number
  reply?: ReviewReply
}

export interface ReviewQuery {
  businessId?: string
  minRating?: number
  /** Ne retourne que les avis ayant reçu une réponse du professionnel. */
  withReplyOnly?: boolean
  sort?: 'recent' | 'rating' | 'helpful'
  page?: number
  perPage?: number
}

/** Agrégat utilisé par le composant de distribution des notes. */
export interface RatingBreakdown {
  average: number
  total: number
  /** Nombre d'avis par note, indexé de 1 à 5. */
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
}
