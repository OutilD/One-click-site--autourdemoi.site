type ClassValue = string | number | null | undefined | false | ClassValue[]

/**
 * Concatène des classes conditionnelles.
 * Volontairement minimal : aucune dépendance externe (clsx/tailwind-merge).
 */
export function cn(...values: ClassValue[]): string {
  const out: string[] = []

  for (const value of values) {
    if (!value) continue
    if (Array.isArray(value)) {
      const nested = cn(...value)
      if (nested) out.push(nested)
    } else {
      out.push(String(value))
    }
  }

  return out.join(' ')
}
