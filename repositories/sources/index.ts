import { getDataSourceMode } from '@/lib/localshark/config'
import { localSharkSource } from './localSharkSource'
import { staticSource } from './staticSource'
import type { DirectorySource } from './types'

/**
 * Sélectionne la source selon la configuration d'environnement.
 * Voir `lib/localshark/config.ts` pour les variables attendues.
 */
export function getDirectorySource(): DirectorySource {
  return getDataSourceMode() === 'localshark' ? localSharkSource : staticSource
}

export { localSharkSource, staticSource }
export type { BusinessDetail, DirectorySnapshot, DirectorySource, DirectoryStats } from './types'
