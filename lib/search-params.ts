import type { BusinessQuery, BusinessSort } from '@/types'

/** Paramètres d'URL acceptés par les pages de listing (en français, SEO-friendly). */
export interface DirectorySearchParams {
  q?: string
  categorie?: string
  note?: string
  tri?: string
  page?: string
}

/** Valeurs de tri exposées en URL → valeurs internes. */
const SORT_MAP: Record<string, BusinessSort> = {
  pertinence: 'relevance',
  alphabetique: 'alphabetical',
  note: 'rating',
  avis: 'reviews',
  recent: 'recent',
}

/** Normalise une valeur de `searchParams`, qui peut être un tableau. */
export function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export function parseSort(value: string | undefined): BusinessSort {
  return SORT_MAP[value ?? ''] ?? 'relevance'
}

export function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? '1', 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

export function parseRating(value: string | undefined): number | undefined {
  const rating = Number.parseFloat(value ?? '')
  return Number.isFinite(rating) && rating > 0 && rating <= 5 ? rating : undefined
}

/**
 * Convertit les paramètres d'URL en `BusinessQuery`.
 * Les contraintes fixes (`categorySlug` d'une page catégorie, par exemple)
 * sont passées via `overrides` et priment sur l'URL.
 */
export function toBusinessQuery(
  params: DirectorySearchParams,
  overrides: Partial<BusinessQuery> = {},
  perPage = 12,
): BusinessQuery {
  return {
    q: params.q || undefined,
    categorySlug: params.categorie || undefined,
    minRating: parseRating(params.note),
    sort: parseSort(params.tri),
    page: parsePage(params.page),
    perPage,
    ...overrides,
  }
}

/** Reconstruit une querystring en ne conservant que les valeurs renseignées. */
export function buildQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '' || value === 0) continue
    search.set(key, String(value))
  }

  return search.toString()
}

/** Vrai si au moins un filtre est actif — sert à décider de la désindexation. */
export function hasActiveFilters(params: DirectorySearchParams): boolean {
  return Boolean(params.q || params.categorie || params.note)
}
