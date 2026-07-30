import { cache } from 'react'
import { getDirectorySource } from './sources'
import type { BusinessDetail, DirectorySnapshot } from './sources/types'
import type { Business } from '@/types'

/**
 * Instantané de l'annuaire, mémorisé pour la durée d'un rendu.
 *
 * `cache()` de React garantit qu'un build ne déclenche **qu'un seul** appel à
 * `GET /api/directory`, quel que soit le nombre de pages et de repositories
 * qui le sollicitent.
 */
export const getSnapshot = cache(async (): Promise<DirectorySnapshot> => {
  return getDirectorySource().getSnapshot()
})

/** Détail d'une fiche, mémorisé par slug : un seul `GET /api/directory/{slug}`. */
export const getBusinessDetail = cache(async (slugOrId: string): Promise<BusinessDetail | null> => {
  return getDirectorySource().getBusinessDetail(slugOrId)
})

export const getBusinessesBySlug = cache(async (): Promise<ReadonlyMap<string, Business>> => {
  const { businesses } = await getSnapshot()
  return new Map(businesses.map((business) => [business.slug, business]))
})

export const getBusinessesById = cache(async (): Promise<ReadonlyMap<string, Business>> => {
  const { businesses } = await getSnapshot()
  return new Map(businesses.map((business) => [business.id, business]))
})
