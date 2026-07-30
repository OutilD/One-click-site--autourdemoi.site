/**
 * Générateur pseudo-aléatoire déterministe.
 *
 * Les données de démonstration doivent être identiques côté serveur et côté
 * client (sinon erreur d'hydratation) et stables entre deux builds.
 * `Math.random()` est donc proscrit dans `/data`.
 */

/** Hash 32 bits (FNV-1a) d'une chaîne, utilisé comme graine. */
export function hashSeed(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** Générateur congruentiel linéaire : suite reproductible dans [0, 1[. */
export function createRandom(seed: string | number) {
  let state = (typeof seed === 'string' ? hashSeed(seed) : seed) || 1

  const next = (): number => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 0x100000000
  }

  return {
    next,
    /** Entier dans [min, max] inclus. */
    int(min: number, max: number): number {
      return min + Math.floor(next() * (max - min + 1))
    },
    /** Flottant arrondi à `decimals` décimales. */
    float(min: number, max: number, decimals = 1): number {
      const value = min + next() * (max - min)
      const factor = 10 ** decimals
      return Math.round(value * factor) / factor
    },
    /** Élément d'un tableau non vide. */
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) throw new Error('createRandom.pick: tableau vide')
      return items[Math.floor(next() * items.length)] as T
    },
    /** `count` éléments distincts, dans l'ordre du tableau source. */
    sample<T>(items: readonly T[], count: number): T[] {
      const indexes = items.map((_, index) => index)
      for (let i = indexes.length - 1; i > 0; i -= 1) {
        const j = Math.floor(next() * (i + 1))
        const a = indexes[i] as number
        const b = indexes[j] as number
        indexes[i] = b
        indexes[j] = a
      }
      return indexes
        .slice(0, Math.min(count, items.length))
        .sort((a, b) => a - b)
        .map((index) => items[index] as T)
    },
    /** `true` avec une probabilité `probability` (0 → 1). */
    bool(probability = 0.5): boolean {
      return next() < probability
    },
  }
}

export type SeededRandom = ReturnType<typeof createRandom>
