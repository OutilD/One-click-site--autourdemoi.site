import type { IsoDate } from './common'

export type PhotoCategory = 'exterieur' | 'interieur' | 'produit' | 'equipe' | 'realisation'

/** Média rattaché à une fiche entreprise. */
export interface Photo {
  id: string
  businessId: string
  url: string
  /** Texte alternatif — obligatoire pour l'accessibilité et le SEO images. */
  alt: string
  /** Dimensions intrinsèques, non fournies par LocalShark. */
  width?: number
  height?: number
  category: PhotoCategory
  publishedAt: IsoDate
}

export interface PhotoQuery {
  businessId?: string
  category?: PhotoCategory
  page?: number
  perPage?: number
}
