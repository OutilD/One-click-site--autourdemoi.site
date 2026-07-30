import { getBusinessDetail, getSnapshot } from './snapshot'
import type { Post } from '@/types'

/** Accès aux publications (Google Posts). */
export class PostRepository {
  /**
   * Publications d'une fiche.
   *
   * Passe par le détail de la fiche : en mode API, c'est l'appel
   * `GET /api/directory/{slug}`, mémorisé — la page fiche ne paie donc
   * qu'une seule requête au total.
   */
  static async getByBusinessSlug(slug: string, limit?: number): Promise<Post[]> {
    const detail = await getBusinessDetail(slug)
    if (!detail) return []
    return typeof limit === 'number' ? detail.posts.slice(0, limit) : detail.posts
  }

  /** Dernières publications toutes fiches confondues — bloc d'accueil. */
  static async getLatest(limit = 6): Promise<Post[]> {
    const { latestPosts } = await getSnapshot()
    return latestPosts.slice(0, limit)
  }

  static async count(): Promise<number> {
    return (await getSnapshot()).stats.postCount
  }
}
