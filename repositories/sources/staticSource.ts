import { businesses, businessesById, businessesBySlug } from '@/data/businesses'
import { categories } from '@/data/categories'
import { cities } from '@/data/cities'
import { photos, photosByBusinessId } from '@/data/photos'
import { posts, postsByBusinessId } from '@/data/posts'
import { reviews, reviewsByBusinessId } from '@/data/reviews'
import type { BusinessDetail, DirectorySnapshot, DirectorySource } from './types'
import type { Photo } from '@/types'

const byDateDesc = <T extends { publishedAt: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

/** Une photo par établissement, pour la diversité du bloc d'accueil. */
function diversePhotos(source: Photo[], limit: number): Photo[] {
  const seen = new Set<string>()
  const result: Photo[] = []

  for (const photo of byDateDesc(source)) {
    if (seen.has(photo.businessId)) continue
    seen.add(photo.businessId)
    result.push(photo)
    if (result.length === limit) break
  }

  return result
}

/**
 * Source de démonstration (`data/`).
 * Mode par défaut, et repli lorsque l'API n'est pas configurée.
 */
export const staticSource: DirectorySource = {
  mode: 'static',

  async getSnapshot(): Promise<DirectorySnapshot> {
    return {
      businesses,
      categories,
      cities,
      latestPosts: byDateDesc(posts).slice(0, 12),
      latestPhotos: diversePhotos(photos, 12),
      latestReviews: byDateDesc(reviews).slice(0, 12),
      stats: {
        businessCount: businesses.length,
        reviewCount: businesses.reduce((total, business) => total + business.reviewCount, 0),
        photoCount: photos.length,
        postCount: posts.length,
      },
    }
  },

  async getBusinessDetail(slugOrId: string): Promise<BusinessDetail | null> {
    const business = businessesBySlug.get(slugOrId) ?? businessesById.get(slugOrId) ?? null
    if (!business) return null

    return {
      business,
      posts: byDateDesc(postsByBusinessId.get(business.id) ?? []),
      photos: byDateDesc(photosByBusinessId.get(business.id) ?? []),
      reviews: byDateDesc(reviewsByBusinessId.get(business.id) ?? []),
    }
  },
}
