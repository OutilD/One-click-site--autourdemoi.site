import { assertDirectoryHealth, localSharkClient } from '@/lib/localshark/client'
import { getLocalSharkConfig } from '@/lib/localshark/config'
import { buildCategory } from '@/lib/localshark/category-presentation'
import {
  collectCities,
  toBusiness,
  toBusinessDetail,
  toFeedPhoto,
  toFeedPost,
  toPhoto,
  toPost,
} from '@/lib/localshark/mappers'
import type { BusinessDetail, DirectorySnapshot, DirectorySource } from './types'
import type { Category } from '@/types'

/**
 * Source API `app.localshark.io`.
 *
 * Deux appels seulement :
 *   - `getSnapshot()`     → `GET /api/directory`            (1 par build)
 *   - `getBusinessDetail()` → `GET /api/directory/{slug}`   (1 par fiche)
 *
 * ⚠️ Les avis ne transitent pas par l'API : ils sont rendus par le widget
 * iframe dont l'URL est portée par `business.reviewsWidgetUrl`.
 */
/** Options passées aux mappers : origine et paramètres du widget d'avis. */
function mapperOptions() {
  const config = getLocalSharkConfig()
  if (!config) return {}
  return { widgetBaseUrl: config.widgetBaseUrl, widgetParams: config.widgetParams }
}

export const localSharkSource: DirectorySource = {
  mode: 'localshark',

  async getSnapshot(): Promise<DirectorySnapshot> {
    const directory = await localSharkClient.getDirectory()

    if (!directory) {
      // Erreur réseau hors mode strict : annuaire vide plutôt que build cassé.
      // Le message doit être sans ambiguïté — un site généré vide n'a
      // autrement aucun signe distinctif d'un site simplement sans données.
      console.error(
        '[localshark] API INJOIGNABLE : le site va être généré SANS AUCUNE FICHE. ' +
          'Vérifier que LOCALSHARK_API_URL pointe vers une instance démarrée, ' +
          'ou passer LOCALSHARK_STRICT=1 pour faire échouer le build dans ce cas.',
      )

      return {
        businesses: [],
        categories: [],
        cities: [],
        latestPosts: [],
        latestPhotos: [],
        latestReviews: [],
        stats: { businessCount: 0, reviewCount: 0, photoCount: 0, postCount: 0 },
      }
    }

    // Détecte le cas « API joignable mais colonnes non peuplées ».
    assertDirectoryHealth(directory)

    const businesses = directory.businesses.map((dto) => toBusiness(dto, mapperOptions()))

    // Le référentiel de catégories de l'API ne porte ni pluriel ni pictogramme :
    // `buildCategory` complète l'habillage de façon déterministe.
    const declared = directory.categories.map((category) =>
      buildCategory({ id: category.id, slug: category.slug, displayName: category.displayName }),
    )

    return {
      businesses,
      categories: mergeMissingCategories(declared, directory.businesses),
      cities: collectCities(directory.businesses),
      latestPosts: directory.latestPosts.map(toFeedPost),
      latestPhotos: directory.latestPhotos.map(toFeedPhoto),
      // Aucun flux d'avis côté API : le bloc correspondant est masqué.
      latestReviews: [],
      stats: directory.stats,
    }
  },

  async getBusinessDetail(slugOrId: string): Promise<BusinessDetail | null> {
    const dto = await localSharkClient.getBusiness(slugOrId)
    if (!dto) return null

    const business = toBusinessDetail(dto, mapperOptions())

    return {
      business,
      posts: dto.posts.map((post) => toPost(post, business.id, business.phone)),
      photos: dto.photos.map((photo) => toPhoto(photo, business.id, business.name)),
      reviews: [],
    }
  },
}

/**
 * Filet de sécurité : si une fiche référence une catégorie absente de
 * `categories[]`, on la reconstruit plutôt que de perdre la page.
 */
function mergeMissingCategories(
  declared: Category[],
  businesses: { category: { id: string; slug: string; displayName: string } | null }[],
): Category[] {
  const bySlug = new Map(declared.map((category) => [category.slug, category]))

  for (const business of businesses) {
    const category = business.category
    if (!category || bySlug.has(category.slug)) continue
    bySlug.set(category.slug, buildCategory(category))
  }

  return [...bySlug.values()]
}
