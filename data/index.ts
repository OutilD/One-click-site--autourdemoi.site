/**
 * Point d'entrée des données statiques (Phase 1).
 *
 * ⚠️ Ce module ne doit être importé QUE par `repositories/`.
 * Les pages et composants passent exclusivement par la couche Repository,
 * afin que le basculement vers l'API LocalShark (phase 2) reste transparent.
 */
export { businesses, businessesById, businessesBySlug } from './businesses'
export { categories, categoriesBySlug } from './categories'
export { photos, photosByBusinessId } from './photos'
export { posts, postsByBusinessId } from './posts'
export { reviews, reviewsByBusinessId } from './reviews'
export { DATASET_REFERENCE_DATE } from './factories'
