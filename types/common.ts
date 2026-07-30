/**
 * Types transverses partagés par l'ensemble du domaine.
 */

/** Identifiant d'URL, en kebab-case et sans accent. */
export type Slug = string

/** Date au format ISO 8601 (`2026-04-12T09:30:00.000Z`). */
export type IsoDate = string

export interface GeoPoint {
  latitude: number
  longitude: number
}

/** Enveloppe de pagination retournée par les repositories. */
export interface Paginated<T> {
  items: T[]
  page: number
  perPage: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface PaginationParams {
  page?: number
  perPage?: number
}

/** Option générique pour les `<select>` et groupes de filtres. */
export interface SelectOption<T extends string = string> {
  value: T
  label: string
  count?: number
}

export interface FaqItem {
  question: string
  answer: string
}

export interface BreadcrumbItem {
  label: string
  href?: string
}
