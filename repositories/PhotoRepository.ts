import { getBusinessDetail, getSnapshot } from './snapshot'
import type { Photo } from '@/types'

/** Accès aux médias des fiches. */
export class PhotoRepository {
  /** Photos d'une fiche — voir `PostRepository` pour le coût réseau. */
  static async getByBusinessSlug(slug: string, limit?: number): Promise<Photo[]> {
    const detail = await getBusinessDetail(slug)
    if (!detail) return []
    return typeof limit === 'number' ? detail.photos.slice(0, limit) : detail.photos
  }

  /** Dernières photos, au plus une par établissement — bloc d'accueil. */
  static async getLatest(limit = 8): Promise<Photo[]> {
    const { latestPhotos } = await getSnapshot()
    return latestPhotos.slice(0, limit)
  }

  static async count(): Promise<number> {
    return (await getSnapshot()).stats.photoCount
  }
}
