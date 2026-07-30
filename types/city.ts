import type { Slug } from './common'

/**
 * Ville couverte par l'annuaire. Sert de pivot pour les pages locales
 * (`/casteljaloux`) et les combinaisons catégorie × ville.
 *
 * L'API annuaire ne fournit qu'un nom et, parfois, un code postal : le reste
 * est soit dérivé (département, région — voir `lib/geo/departments.ts`), soit
 * absent. Tous ces champs sont donc optionnels.
 */
export interface City {
  id: string
  slug: Slug
  name: string
  /** Dérivé du code postal. Absent pour une ville seulement desservie. */
  department?: string
  departmentCode?: string
  region?: string
  postalCode?: string
  population?: number
  latitude?: number
  longitude?: number
  description?: string
  coverImage?: string
  /** Quartiers mis en avant. Non fourni par l'API. */
  districts?: string[]
}

export interface CityWithCount extends City {
  businessCount: number
}
