import type { Slug } from '@/types'

/**
 * Constructeurs d'URL centralisés. Toute évolution de structure d'URL
 * se fait ici, sans toucher aux composants.
 */
export const routes = {
  home: () => '/',
  businesses: (params?: Record<string, string | number | undefined>) => {
    if (!params) return '/entreprises'
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') search.set(key, String(value))
    }
    const qs = search.toString()
    return qs ? `/entreprises?${qs}` : '/entreprises'
  },
  business: (slug: Slug) => `/entreprise/${slug}`,
  categories: () => '/categories',
  category: (slug: Slug) => `/${slug}`,
  cities: () => '/villes',
  city: (slug: Slug) => `/${slug}`,
  /** Page combinée catégorie × ville : `/restaurants/paris`. */
  categoryInCity: (categorySlug: Slug, citySlug: Slug) => `/${categorySlug}/${citySlug}`,
  /** Page combinée ville × catégorie : `/paris/restaurants`. */
  cityCategory: (citySlug: Slug, categorySlug: Slug) => `/${citySlug}/${categorySlug}`,
  search: (q: string) => `/entreprises?q=${encodeURIComponent(q)}`,
} as const

/** Transforme un chemin relatif en URL absolue (canonical, OpenGraph, JSON-LD). */
export function absoluteUrl(path: string, baseUrl: string): string {
  if (path.startsWith('http')) return path
  return `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}
