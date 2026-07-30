import type { MetadataRoute } from 'next'
import { absoluteUrl, routes } from '@/lib/routes'
import { siteConfig } from '@/lib/site'
import { BusinessRepository, CategoryRepository } from '@/repositories'

/**
 * Sitemap XML complet, généré à partir des repositories.
 * En phase 2, il se peuplera automatiquement depuis l'API sans modification.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [businesses, categories] = await Promise.all([
    BusinessRepository.getAll(),
    CategoryRepository.getAllWithCounts(),
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
  ]

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: url(routes.category(category.slug)),
    lastModified,
    changeFrequency: 'weekly',
    priority: siteConfig.sitemap.listingPriority,
  }))

  const businessEntries: MetadataRoute.Sitemap = businesses.map((business) => ({
    url: url(routes.business(business.slug)),
    lastModified: new Date(business.updatedAt),
    changeFrequency: 'weekly',
    priority: siteConfig.sitemap.businessPriority,
  }))

  return [...staticEntries, ...categoryEntries, ...businessEntries]
}
