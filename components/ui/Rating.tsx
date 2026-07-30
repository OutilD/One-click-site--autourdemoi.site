import { cn } from '@/utils/cn'
import { formatNumber, formatRating, pluralize } from '@/utils/format'

interface RatingProps {
  /** Note de 0 à 5, décimales autorisées. */
  value: number
  /** Nombre d'avis, affiché entre parenthèses si fourni. */
  reviewCount?: number
  size?: 'sm' | 'md' | 'lg'
  /** Masque la valeur numérique et n'affiche que les étoiles. */
  starsOnly?: boolean
  className?: string
}

const SIZES = {
  sm: { star: 'h-3.5 w-3.5', text: 'text-xs' },
  md: { star: 'h-4 w-4', text: 'text-sm' },
  lg: { star: 'h-5 w-5', text: 'text-base' },
} as const

const STAR_PATH =
  'M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.35 4.16a1 1 0 0 0 .95.69h4.37c.97 0 1.37 1.24.59 1.81l-3.54 2.57a1 1 0 0 0-.36 1.12l1.35 4.16c.3.92-.75 1.69-1.54 1.12l-3.53-2.57a1 1 0 0 0-1.18 0l-3.53 2.57c-.79.57-1.84-.2-1.54-1.12l1.35-4.16a1 1 0 0 0-.36-1.12L1.79 9.59c-.78-.57-.38-1.81.59-1.81h4.37a1 1 0 0 0 .95-.69Z'

function StarRow({ color, className }: { color: string; className: string }) {
  return (
    <span className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((index) => (
        <svg key={index} viewBox="0 0 20 20" className={className} aria-hidden="true" focusable="false">
          <path fill={color} d={STAR_PATH} />
        </svg>
      ))}
    </span>
  )
}

/**
 * Note en étoiles.
 *
 * Le remplissage partiel est obtenu par superposition de deux rangées et un
 * masque en largeur : aucun `id` SVG n'est généré, donc aucun risque de
 * collision d'identifiants quand plusieurs notes coexistent sur la page.
 */
export function Rating({ value, reviewCount, size = 'md', starsOnly = false, className }: RatingProps) {
  const styles = SIZES[size]
  const clamped = Math.max(0, Math.min(5, value))
  const label =
    reviewCount === undefined
      ? `Note de ${formatRating(clamped)} sur 5`
      : `Note de ${formatRating(clamped)} sur 5, ${formatNumber(reviewCount)} ${pluralize(reviewCount, 'avis', 'avis')}`

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} title={label}>
      <span className="relative inline-block shrink-0">
        <StarRow color="var(--color-ink-200)" className={styles.star} />
        <span
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${(clamped / 5) * 100}%` }}
          aria-hidden="true"
        >
          <StarRow color="var(--color-star)" className={styles.star} />
        </span>
      </span>
      <span className="sr-only">{label}</span>
      {!starsOnly && (
        <span className={cn('font-semibold text-ink-800', styles.text)} aria-hidden="true">
          {formatRating(clamped)}
          {reviewCount !== undefined && (
            <span className="ml-1 font-normal text-ink-500">({formatNumber(reviewCount)})</span>
          )}
        </span>
      )}
    </span>
  )
}
