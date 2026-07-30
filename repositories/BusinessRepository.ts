import { getBusinessDetail, getBusinessesById, getBusinessesBySlug, getSnapshot } from './snapshot'
import type { BusinessDetail } from './sources/types'
import type { Business, BusinessQuery, BusinessSort, Paginated, Slug } from '@/types'
import { paginate } from '@/utils/pagination'
import { normalizeSearchTerm } from '@/utils/slug'

/**
 * Accès aux fiches entreprises.
 *
 * Point d'entrée unique du domaine : pages et composants ne connaissent que
 * cette classe. L'origine des données est décidée par `repositories/sources`.
 */
export class BusinessRepository {
  static async getAll(): Promise<Business[]> {
    const { businesses } = await getSnapshot()
    return sortBusinesses(businesses, 'relevance')
  }

  static async getBySlug(slug: Slug): Promise<Business | null> {
    return (await getBusinessesBySlug()).get(slug) ?? null
  }

  static async getById(id: string): Promise<Business | null> {
    return (await getBusinessesById()).get(id) ?? null
  }

  static async getByIds(ids: string[]): Promise<Business[]> {
    const index = await getBusinessesById()
    return ids.map((id) => index.get(id)).filter((item): item is Business => Boolean(item))
  }

  /**
   * Fiche complète : coordonnées, description, photos, publications.
   * Un seul appel réseau, mémorisé — c'est ce que consomme la page fiche.
   */
  static async getDetail(slugOrId: string): Promise<BusinessDetail | null> {
    return getBusinessDetail(slugOrId)
  }

  /** Recherche filtrée, triée et paginée — moteur des pages de listing. */
  static async search(query: BusinessQuery = {}): Promise<Paginated<Business>> {
    const { businesses } = await getSnapshot()
    const filtered = applyFilters(businesses, query)
    const sorted = sortBusinesses(filtered, query.sort ?? 'relevance', query.q)
    return paginate(sorted, query.page ?? 1, query.perPage ?? 12)
  }

  /** Variante non paginée, pour les carrousels et blocs d'accueil. */
  static async find(query: BusinessQuery = {}): Promise<Business[]> {
    const { businesses } = await getSnapshot()
    const filtered = applyFilters(businesses, query)
    const sorted = sortBusinesses(filtered, query.sort ?? 'relevance', query.q)
    return typeof query.perPage === 'number' ? sorted.slice(0, query.perPage) : sorted
  }

  /**
   * Sélection mise en avant sur l'accueil.
   *
   * L'API n'expose aucune notion de « fiche à la une » : à défaut, on retient
   * les mieux classées au score de pertinence (note pondérée par le volume
   * d'avis), ce qui évite de propulser une fiche notée 5/5 sur un seul avis.
   */
  static async getFeatured(limit = 6): Promise<Business[]> {
    const explicit = await this.find({ featuredOnly: true, sort: 'relevance', perPage: limit })
    if (explicit.length >= limit) return explicit

    const fallback = await this.find({ sort: 'relevance', perPage: limit * 2 })
    const seen = new Set(explicit.map((business) => business.id))

    return [...explicit, ...fallback.filter((business) => !seen.has(business.id))].slice(0, limit)
  }

  static async getByCategory(categorySlug: Slug, limit?: number): Promise<Business[]> {
    return this.find({ categorySlug, sort: 'relevance', perPage: limit })
  }

  static async getByCity(citySlug: Slug, limit?: number): Promise<Business[]> {
    return this.find({ citySlug, sort: 'relevance', perPage: limit })
  }

  /**
   * Fiches similaires : même catégorie, même ville en priorité,
   * puis complétées par la même catégorie ailleurs.
   */
  static async getSimilar(business: Business, limit = 3): Promise<Business[]> {
    if (!business.categorySlug) return []

    const citySlug = business.citySlug ?? business.servedCitySlugs[0]

    const sameCity = citySlug
      ? await this.find({
          categorySlug: business.categorySlug,
          citySlug,
          excludeId: business.id,
          sort: 'relevance',
        })
      : []

    if (sameCity.length >= limit) return sameCity.slice(0, limit)

    const sameCategory = await this.find({
      categorySlug: business.categorySlug,
      excludeId: business.id,
      sort: 'relevance',
    })

    const seen = new Set(sameCity.map((item) => item.id))
    return [...sameCity, ...sameCategory.filter((item) => !seen.has(item.id))].slice(0, limit)
  }

  /** Nombre de fiches par slug de catégorie. */
  static async countByCategory(): Promise<Record<string, number>> {
    const { businesses } = await getSnapshot()

    return businesses.reduce<Record<string, number>>((counts, business) => {
      if (!business.categorySlug) return counts
      counts[business.categorySlug] = (counts[business.categorySlug] ?? 0) + 1
      return counts
    }, {})
  }

  /**
   * Nombre de fiches par slug de ville.
   * Une fiche compte pour sa ville d'adresse **et** pour chaque ville desservie.
   */
  static async countByCity(): Promise<Record<string, number>> {
    const { businesses } = await getSnapshot()

    return businesses.reduce<Record<string, number>>((counts, business) => {
      for (const slug of citySlugsOf(business)) {
        counts[slug] = (counts[slug] ?? 0) + 1
      }
      return counts
    }, {})
  }

  static async count(): Promise<number> {
    return (await getSnapshot()).businesses.length
  }

  /** Tous les slugs — utilisé par `generateStaticParams` et le sitemap. */
  static async getAllSlugs(): Promise<Slug[]> {
    const { businesses } = await getSnapshot()
    return businesses.map((business) => business.slug)
  }

  /**
   * Couples catégorie × ville réellement peuplés.
   * Évite de générer des pages combinées vides (mauvais signal SEO).
   */
  static async getCategoryCityPairs(): Promise<{ categorySlug: Slug; citySlug: Slug }[]> {
    const { businesses } = await getSnapshot()
    const pairs = new Map<string, { categorySlug: Slug; citySlug: Slug }>()

    for (const business of businesses) {
      if (!business.categorySlug) continue
      for (const citySlug of citySlugsOf(business)) {
        const key = `${business.categorySlug}/${citySlug}`
        if (!pairs.has(key)) pairs.set(key, { categorySlug: business.categorySlug, citySlug })
      }
    }

    return [...pairs.values()]
  }
}

// ───────────────────────────── Logique interne ─────────────────────────────

/** Villes auxquelles une fiche est rattachée : adresse + zones desservies. */
function citySlugsOf(business: Business): string[] {
  const slugs = new Set<string>()
  if (business.citySlug) slugs.add(business.citySlug)
  for (const slug of business.servedCitySlugs) slugs.add(slug)
  return [...slugs]
}

function applyFilters(source: Business[], query: BusinessQuery): Business[] {
  const term = query.q ? normalizeSearchTerm(query.q) : null

  return source.filter((business) => {
    if (query.categorySlug && business.categorySlug !== query.categorySlug) return false
    if (query.citySlug && !citySlugsOf(business).includes(query.citySlug)) return false
    // Une fiche sans avis n'a pas de note : elle est exclue d'un filtre par note.
    if (query.minRating !== undefined && (business.rating === null || business.rating < query.minRating)) {
      return false
    }
    if (query.priceLevel !== undefined && business.priceLevel !== query.priceLevel) return false
    if (query.featuredOnly && !business.isFeatured) return false
    if (query.verifiedOnly && !business.isVerified) return false
    if (query.excludeId && business.id === query.excludeId) return false
    if (term && !matchesSearchTerm(business, term)) return false
    return true
  })
}

function matchesSearchTerm(business: Business, term: string): boolean {
  const haystack = normalizeSearchTerm(
    [
      business.name,
      business.shortDescription ?? '',
      business.description ?? '',
      business.cityName ?? '',
      business.categorySlug ?? '',
      business.servedCitySlugs.join(' '),
      business.services.join(' '),
    ].join(' '),
  )

  // Tous les mots du terme doivent être présents (ET logique).
  return term.split(/\s+/).filter(Boolean).every((word) => haystack.includes(word))
}

/**
 * Score de pertinence : note pondérée par le volume d'avis (bayésien simplifié).
 * Une fiche sans avis obtient 0 et se classe donc en fin de liste.
 */
function relevanceScore(business: Business): number {
  if (business.rating === null) return 0
  const confidence = Math.min(business.reviewCount, 500) / 500
  return business.rating * (0.7 + 0.3 * confidence) + (business.isFeatured ? 0.25 : 0)
}

function sortBusinesses(source: Business[], sort: BusinessSort, term?: string): Business[] {
  const items = [...source]

  switch (sort) {
    case 'alphabetical':
      return items.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    case 'rating':
      // Les fiches sans avis passent après celles qui en ont.
      return items.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || b.reviewCount - a.reviewCount)
    case 'reviews':
      return items.sort((a, b) => b.reviewCount - a.reviewCount || (b.rating ?? -1) - (a.rating ?? -1))
    case 'recent':
      return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    case 'relevance':
    default: {
      if (term) {
        const normalized = normalizeSearchTerm(term)
        // Une correspondance sur le nom prime sur le score de pertinence.
        return items.sort((a, b) => {
          const aName = normalizeSearchTerm(a.name).includes(normalized) ? 1 : 0
          const bName = normalizeSearchTerm(b.name).includes(normalized) ? 1 : 0
          return bName - aName || relevanceScore(b) - relevanceScore(a)
        })
      }
      return items.sort((a, b) => relevanceScore(b) - relevanceScore(a))
    }
  }
}
