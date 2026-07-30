import type { FaqItem, IsoDate, Slug } from './common'

export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

/** Créneau d'ouverture au format 24 h (`{ open: '09:00', close: '12:30' }`). */
export interface TimeRange {
  open: string
  close: string
}

/**
 * Horaires hebdomadaires. Un tableau vide signifie « fermé ».
 * Plusieurs créneaux par jour sont supportés (coupure méridienne).
 */
export type OpeningHours = Record<DayKey, TimeRange[]>

/** Fermeture ou horaire exceptionnel à une date donnée. */
export interface SpecialHours {
  date: IsoDate
  closed: boolean
  open?: string
  close?: string
}

export interface SocialLinks {
  facebook?: string
  instagram?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
}

/** Niveau de prix Google (1 = €, 4 = €€€€). */
export type PriceLevel = 1 | 2 | 3 | 4

/**
 * Fiche entreprise — représentation d'une fiche Google Business.
 *
 * Les champs optionnels ne sont pas garantis par l'API annuaire LocalShark :
 * les composants doivent tous les traiter comme facultatifs. Voir
 * `docs/api-localshark.md` pour la liste des champs non alimentés.
 */
export interface Business {
  id: string
  slug: Slug
  /** Identifiant de la fiche Google Business côté LocalShark. */
  googleCardId?: string
  name: string
  legalName?: string
  /** Accroche d'une ligne, utilisée sur les cartes et en meta description. */
  shortDescription?: string
  description?: string

  /** `null` si la fiche n'a pas de catégorie : elle reste listée mais hors page catégorie. */
  categorySlug: Slug | null
  /**
   * Catégories secondaires, libellé compris.
   *
   * Le libellé est conservé car ces catégories n'apparaissent pas forcément
   * dans le référentiel global : l'API ne liste dans `categories[]` que les
   * catégories **principales**. Sans lui, on ne pourrait pas les afficher.
   */
  secondaryCategories: { slug: Slug; name: string }[]

  address?: string
  postalCode?: string
  /** `null` pour un artisan mobile : le rattachement se fait via `servedCitySlugs`. */
  citySlug: Slug | null
  cityName?: string
  /** Villes desservies — seul rattachement d'un établissement sans adresse. */
  servedCitySlugs: Slug[]
  country: string

  phone?: string
  additionalPhones: string[]
  email?: string
  website?: string
  social: SocialLinks

  /** `null` si aucun avis — à ne jamais afficher comme un 0. */
  rating: number | null
  reviewCount: number
  /** URL du widget d'avis LocalShark, embarqué en iframe sur la fiche. */
  reviewsWidgetUrl?: string

  latitude?: number
  longitude?: number
  /** Carte prête à embarquer, fournie par la source. */
  mapEmbedUrl?: string
  /** Lien externe vers la fiche cartographique. */
  mapLinkUrl?: string

  logo?: string
  coverImage?: string
  gallery: string[]

  openingHours: OpeningHours
  specialHours: SpecialHours[]
  priceLevel?: PriceLevel
  /** Prestations proposées, affichées en liste sur la fiche. */
  services: string[]
  /** Attributs Google (« Accès handicapé », « Terrasse »…). */
  attributes: string[]
  /** Moyens de paiement acceptés. */
  paymentMethods: string[]
  faq: FaqItem[]

  isFeatured: boolean
  isVerified: boolean
  /** Année de création de l'établissement. */
  foundedYear?: number
  createdAt?: IsoDate
  updatedAt: IsoDate
}

export type BusinessSort = 'relevance' | 'alphabetical' | 'rating' | 'reviews' | 'recent'

/** Critères de recherche acceptés par `BusinessRepository`. */
export interface BusinessQuery {
  /** Recherche plein texte sur le nom, la description et les services. */
  q?: string
  categorySlug?: Slug
  /** Correspond à la ville principale **ou** à une ville desservie. */
  citySlug?: Slug
  /** Note minimale, de 0 à 5. Exclut les fiches sans avis. */
  minRating?: number
  priceLevel?: PriceLevel
  featuredOnly?: boolean
  verifiedOnly?: boolean
  sort?: BusinessSort
  page?: number
  perPage?: number
  /** Exclut une fiche du résultat (utilisé pour « entreprises similaires »). */
  excludeId?: string
}
