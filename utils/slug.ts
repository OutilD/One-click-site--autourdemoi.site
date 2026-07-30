/** Plage Unicode des diacritiques combinants, produits par `normalize('NFD')`. */
const COMBINING_MARKS = /[̀-ͯ]/g

/** Normalise une chaîne en slug URL : minuscules, sans accent, tirets. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Normalise un terme de recherche pour une comparaison insensible aux accents. */
export function normalizeSearchTerm(input: string): string {
  return input.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().trim()
}
