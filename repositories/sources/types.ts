import type { Business, Category, City, Photo, Post, Review } from '@/types'
import type { DataSourceMode } from '@/lib/localshark/config'

export interface DirectoryStats {
  businessCount: number
  reviewCount: number
  photoCount: number
  postCount: number
}

/**
 * Instantané global de l'annuaire — équivalent de l'endpoint A.
 * Suffit à rendre l'accueil, les listings, les pages catégorie et ville,
 * et le sitemap.
 */
export interface DirectorySnapshot {
  businesses: Business[]
  categories: Category[]
  cities: City[]
  latestPosts: Post[]
  latestPhotos: Photo[]
  latestReviews: Review[]
  stats: DirectoryStats
}

/**
 * Contenu complet d'une fiche — équivalent de l'endpoint B.
 *
 * `reviews` est **vide en mode API** : LocalShark ne les expose pas, ils sont
 * affichés via le widget iframe (`business.reviewsWidgetUrl`).
 */
export interface BusinessDetail {
  business: Business
  posts: Post[]
  photos: Photo[]
  reviews: Review[]
}

/**
 * Source de données de l'annuaire.
 *
 * Deux implémentations : `staticSource` (données de démonstration) et
 * `localSharkSource` (API `app.localshark.io`). Le basculement se fait par
 * variable d'environnement — voir `lib/localshark/config.ts`.
 */
export interface DirectorySource {
  readonly mode: DataSourceMode
  /** Appelé une fois par rendu, mémorisé en amont par `repositories/snapshot.ts`. */
  getSnapshot(): Promise<DirectorySnapshot>
  getBusinessDetail(slugOrId: string): Promise<BusinessDetail | null>
}
