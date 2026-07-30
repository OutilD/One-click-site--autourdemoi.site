import type { MetadataRoute } from 'next'
import { absoluteUrl, routes } from '@/lib/routes'
import { siteConfig } from '@/lib/site'
import { BusinessRepository, CategoryRepository, CityRepository } from '@/repositories'

/**
 * Sitemap XML complet, généré à partir des repositories.
 * En phase 2, il se peuplera automatiquement depuis l'API sans modification.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [businesses, categories, cities, pairs] = await Promise.all([
    BusinessRepository.getAll(),
    CategoryRepository.getAll(),
    CityRepository.getAll(),
    BusinessRepository.getCategoryCityPairs(),
  ])

  const lastModified = new Date()
  const url = (path: string) => absoluteUrl(path, siteConfig.url)

  const staticEntries: MetadataRoute.Sitemap = [
    { url: url(routes.home()), lastModified, changeFrequency: 'daily', priority: siteConfig.sitemap.homePriority },
    {
      url: url(routes.businesses()),
      lastModified,
      changeFrequency: 'daily',
      priority: siteConfig.sitemap.listingPriority,
    },
    { url: url(routes.categories()), lastModified, changeFrequency: 'weekly', priority: 0.6 },
    { url: url(routes.cities()), lastModified, changeFrequency: 'weekly', priority: 0.6 },
  ]

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: url(routes.category(category.slug)),
    lastModified,
    changeFrequency: 'weekly',
    priority: siteConfig.sitemap.listingPriority,
  }))

  const cityEntries: MetadataRoute.Sitemap = cities.map((city) => ({
    url: url(routes.city(city.slug)),
    lastModified,
    changeFrequency: 'weekly',
    priority: siteConfig.sitemap.listingPriority,
  }))

  // Un seul ordre est déclaré (catégorie/ville) : la variante ville/catégorie
  // reste accessible mais n'est pas soumise, pour éviter la duplication.
  const pairEntries: MetadataRoute.Sitemap = pairs.map((pair) => ({
    url: url(routes.categoryInCity(pair.categorySlug, pair.citySlug)),
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const businessEntries: MetadataRoute.Sitemap = businesses.map((business) => ({
    url: url(routes.business(business.slug)),
    lastModified: new Date(business.updatedAt),
    changeFrequency: 'weekly',
    priority: siteConfig.sitemap.businessPriority,
  }))

  return [...staticEntries, ...categoryEntries, ...cityEntries, ...pairEntries, ...businessEntries]
}
