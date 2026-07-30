import type { IsoDate, Slug } from './common'

/** Types de publications Google Business. */
export type PostType = 'update' | 'offer' | 'event'

export interface PostOffer {
  /** Réduction affichée : « -20 % ». */
  label: string
  couponCode?: string
  validUntil: IsoDate
}

export interface PostEvent {
  startDate: IsoDate
  endDate: IsoDate
  location: string
}

/** Publication (Google Post) rattachée à une fiche entreprise. */
export interface Post {
  id: string
  businessId: string
  slug: Slug
  type: PostType
  title: string
  excerpt: string
  /** Contenu en paragraphes bruts (pas de HTML : rendu maîtrisé côté React). */
  content: string[]
  image: string
  publishedAt: IsoDate
  ctaLabel?: string
  ctaUrl?: string
  offer?: PostOffer
  event?: PostEvent
}

export interface PostQuery {
  businessId?: string
  type?: PostType
  page?: number
  perPage?: number
}
