import { getSnapshot } from './snapshot'
import { BusinessRepository } from './BusinessRepository'
import type { City, CityWithCount, Slug } from '@/types'

/** Accès au référentiel des villes, déduit des fiches. */
export class CityRepository {
  static async getAll(): Promise<City[]> {
    return (await getSnapshot()).cities
  }

  static async getBySlug(slug: Slug): Promise<City | null> {
    return (await this.getAll()).find((city) => city.slug === slug) ?? null
  }

  static async exists(slug: Slug): Promise<boolean> {
    return (await this.getBySlug(slug)) !== null
  }

  /**
   * Villes enrichies du nombre de fiches, triées par volume décroissant.
   * Les villes sans aucune fiche sont écartées (pages vides).
   */
  static async getAllWithCounts(): Promise<CityWithCount[]> {
    const [cities, counts] = await Promise.all([this.getAll(), BusinessRepository.countByCity()])

    return cities
      .map((city) => ({ ...city, businessCount: counts[city.slug] ?? 0 }))
      .filter((city) => city.businessCount > 0)
      .sort((a, b) => b.businessCount - a.businessCount || a.name.localeCompare(b.name, 'fr'))
  }

  static async getPopular(limit = 6): Promise<CityWithCount[]> {
    return (await this.getAllWithCounts()).slice(0, limit)
  }

  static async getAllSlugs(): Promise<Slug[]> {
    return (await this.getAllWithCounts()).map((city) => city.slug)
  }
}
