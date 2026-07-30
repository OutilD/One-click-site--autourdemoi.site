import { getSnapshot } from './snapshot'
import { BusinessRepository } from './BusinessRepository'
import type { Category, CategoryWithCount, Slug } from '@/types'

/** Accès au référentiel des catégories. */
export class CategoryRepository {
  static async getAll(): Promise<Category[]> {
    return (await getSnapshot()).categories
  }

  static async getBySlug(slug: Slug): Promise<Category | null> {
    return (await this.getAll()).find((category) => category.slug === slug) ?? null
  }

  static async exists(slug: Slug): Promise<boolean> {
    return (await this.getBySlug(slug)) !== null
  }

  /**
   * Catégories enrichies du nombre de fiches, triées par volume décroissant.
   * Les catégories sans aucune fiche sont écartées : elles produiraient des
   * pages vides, mauvais signal pour le référencement.
   */
  static async getAllWithCounts(): Promise<CategoryWithCount[]> {
    const [categories, counts] = await Promise.all([
      this.getAll(),
      BusinessRepository.countByCategory(),
    ])

    return categories
      .map((category) => ({ ...category, businessCount: counts[category.slug] ?? 0 }))
      .filter((category) => category.businessCount > 0)
      .sort((a, b) => b.businessCount - a.businessCount || a.name.localeCompare(b.name, 'fr'))
  }

  static async getPopular(limit = 6): Promise<CategoryWithCount[]> {
    return (await this.getAllWithCounts()).slice(0, limit)
  }

  static async getAllSlugs(): Promise<Slug[]> {
    return (await this.getAllWithCounts()).map((category) => category.slug)
  }
}
