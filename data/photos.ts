import { businesses } from './businesses'
import { buildPhotos } from './factories'
import type { Photo } from '@/types'

/** Médias de démonstration, dérivés de la galerie de chaque fiche. */
export const photos: Photo[] = businesses.flatMap(buildPhotos)

export const photosByBusinessId: ReadonlyMap<string, Photo[]> = photos.reduce((map, photo) => {
  const existing = map.get(photo.businessId)
  if (existing) existing.push(photo)
  else map.set(photo.businessId, [photo])
  return map
}, new Map<string, Photo[]>())
