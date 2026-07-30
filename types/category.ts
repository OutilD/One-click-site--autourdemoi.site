import type { FaqItem, Slug } from './common'

/**
 * Catégorie d'activité, correspondant à la catégorie principale d'une fiche
 * Google Business.
 *
 * L'API annuaire ne renvoie que `id`, `slug` et `displayName` : le pluriel,
 * le pictogramme, la couleur et les textes éditoriaux sont produits par
 * `lib/localshark/category-presentation.ts`.
 */
export interface Category {
  id: string
  slug: Slug
  /** Libellé au singulier : « Plombier ». */
  name: string
  /** Libellé au pluriel, utilisé dans les titres : « Plombiers ». */
  pluralName: string
  /** Emoji utilisé comme pictogramme (aucune dépendance d'icônes externe). */
  icon: string
  /** Résumé court affiché sur les cartes de catégorie. */
  tagline: string
  description: string
  /** Termes de recherche associés, utilisés par la recherche plein texte. */
  keywords: string[]
  /** Questions fréquentes génériques, réutilisées sur les pages catégorie. */
  faq: FaqItem[]
  /** Couleur d'accent (valeur CSS). */
  accentColor: string
}

/** Catégorie enrichie du nombre d'entreprises rattachées. */
export interface CategoryWithCount extends Category {
  businessCount: number
}
