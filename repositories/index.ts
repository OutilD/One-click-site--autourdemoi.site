/**
 * Couche d'abstraction d'accès aux données.
 *
 * Seul point du projet qui connaît l'origine des données. Pages et composants
 * n'importent jamais `data/` ni `lib/localshark/`.
 *
 * Deux sources, choisies par variable d'environnement
 * (voir `lib/localshark/config.ts`) :
 *
 * - `static`     : données de démonstration de `data/` ;
 * - `localshark` : API `app.localshark.io`, deux endpoints.
 *
 * Coût réseau d'un build complet en mode API :
 *   1 × `GET /api/directory` + 1 × `GET /api/directory/{slug}` par fiche.
 */
export { BusinessRepository } from './BusinessRepository'
export { CategoryRepository } from './CategoryRepository'
export { PhotoRepository } from './PhotoRepository'
export { PostRepository } from './PostRepository'
export { ReviewRepository } from './ReviewRepository'

export { getDirectorySource } from './sources'
export type { BusinessDetail, DirectorySnapshot, DirectorySource } from './sources'
