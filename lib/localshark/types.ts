/**
 * DTO de l'API annuaire LocalShark (`app.localshark.io`).
 *
 * Reproduction fidèle du contrat fourni. Ces types ne doivent jamais fuiter
 * au-delà de `lib/localshark/` : les mappers les convertissent vers le modèle
 * de domaine (`types/`), qui reste stable quoi qu'il arrive côté fournisseur.
 *
 * Convention : un champ documenté comme « toujours nul » est typé `null` seul,
 * afin que TypeScript signale toute tentative de l'exploiter.
 */

export type LsDay =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export interface LsCategory {
  /** Identique à `slug` : dérivé du nom de la catégorie Google. */
  id: string
  slug: string
  displayName: string
  /** Présent uniquement dans `categories[]` de l'endpoint A. */
  businessCount?: number
}

export interface LsServedCity {
  name: string
  /** Toujours nul d'après le contrat. */
  postalCode: null
}

export interface LsLocation {
  /** Lignes d'adresse jointes. `null` pour un artisan mobile. */
  address: string | null
  postalCode: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  /** Zones desservies — seul rattachement ville d'un artisan mobile. */
  servedCities: LsServedCity[]
  /**
   * Carte Google prête à embarquer, pointant sur le `place_id` exact de la
   * fiche. Champ absent du contrat initial, apparu côté API.
   *
   * ⚠️ L'URL contient une clé Google Maps en clair. C'est le fonctionnement
   * normal de l'Embed API (la clé est publique), mais elle **doit** être
   * restreinte par référent HTTP côté console Google, sans quoi n'importe qui
   * peut consommer le quota.
   */
  mapEmbedUrl?: string | null
  /** Lien Google Maps vers la fiche, avec `place_id`. */
  mapLinkUrl?: string | null
}

/** Deux entrées pour un même `day` = coupure méridienne. Jour absent = fermé. */
export interface LsHourPeriod {
  day: LsDay
  openTime: string
  closeTime: string
}

export interface LsSpecialHour {
  date: string
  closed?: boolean
  openTime?: string
  closeTime?: string
}

export type LsMediaCategory =
  | 'EXTERIOR'
  | 'INTERIOR'
  | 'PRODUCT'
  | 'TEAMS'
  | 'AT_WORK'
  | 'COVER'
  | 'PROFILE'
  | 'LOGO'
  | 'ADDITIONAL'
  | (string & {})

export interface LsPhoto {
  id: string
  imageUrl: string
  description: string | null
  category: LsMediaCategory
  /** Toujours nul d'après le contrat. */
  mediaFormat: null
  thumbnailUrl: null
  width: null
  height: null
  publishedAt: string
}

/** Photo du flux transverse : porte l'identité de sa fiche. */
export interface LsFeedPhoto extends LsPhoto {
  googleCardId: string
  businessName: string
  businessSlug: string
}

export type LsPostType = 'STANDARD' | 'EVENT' | 'OFFER' | 'ALERT'

export interface LsCallToAction {
  type: 'CALL' | 'BOOK' | 'ORDER' | 'SHOP' | 'LEARN_MORE' | 'SIGN_UP' | (string & {})
  url: string
}

export interface LsPostOffer {
  couponCode: string | null
  redeemUrl: string | null
  validFrom: string | null
  validTo: string | null
  terms: string | null
}

export interface LsPostEvent {
  title: string | null
  startDate: string | null
  endDate: string | null
}

export interface LsPost {
  id: string
  type: LsPostType
  /** Nul sauf pour les événements, d'après le contrat. */
  title: string | null
  summary: string
  imageUrls: string[]
  callToAction: LsCallToAction | null
  offer: LsPostOffer | null
  event: LsPostEvent | null
  publishedAt: string
}

/** Publication du flux transverse : une seule image, et l'identité de la fiche. */
export interface LsFeedPost {
  id: string
  googleCardId: string
  businessName: string
  businessSlug: string
  type: LsPostType
  title: string | null
  summary: string
  imageUrl: string | null
  publishedAt: string
}

/** Fiche allégée — identique dans les endpoints A et B. */
export interface LsBusiness {
  googleCardId: string
  slug: string
  name: string
  shortDescription: string | null
  category: LsCategory | null
  location: LsLocation
  /** `null` si aucun avis — ne jamais afficher 0. */
  rating: number | null
  reviewCount: number
  /** URL du widget d'avis à embarquer en iframe. */
  reviewsWidgetUrl: string
  phone: string | null
  websiteUri: string | null
  logoUrl: string | null
  coverUrl: string | null
  regularHours: LsHourPeriod[]
  /**
   * Signal `hasVoiceOfMerchant` de Google. Observé à `null` en pratique :
   * traité comme « non vérifié » plutôt que comme un booléen garanti.
   */
  verified: boolean | null
  /** Toujours nul d'après le contrat. */
  priceLevel: null
  updatedAt: string
}

export interface LsService {
  name: string
  /** Toujours nul d'après le contrat. */
  description: null
  price: null
}

export interface LsSocialProfiles {
  facebook: string | null
  instagram: string | null
  youtube: string | null
  tiktok: string | null
}

/** Fiche complète — endpoint B. */
export interface LsBusinessDetail extends LsBusiness {
  description: string | null
  openingDate: string | null
  additionalCategories: LsCategory[]
  specialHours: LsSpecialHour[]
  /** Toujours nul d'après le contrat. */
  email: null
  additionalPhones: string[]
  socialProfiles: LsSocialProfiles
  services: LsService[]
  /** Toujours vide d'après le contrat. */
  attributes: never[]
  faq: { question: string; answer: string }[]
  photos: LsPhoto[]
  posts: LsPost[]
}

export interface LsDirectoryStats {
  businessCount: number
  reviewCount: number
  photoCount: number
  postCount: number
}

/** Réponse de l'endpoint A. */
export interface LsDirectory {
  generatedAt: string
  stats: LsDirectoryStats
  categories: LsCategory[]
  businesses: LsBusiness[]
  latestPosts: LsFeedPost[]
  latestPhotos: LsFeedPhoto[]
}
