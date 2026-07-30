import { Rating } from '@/components/ui/Rating'
import type { RatingBreakdown } from '@/types'
import { cn } from '@/utils/cn'
import { formatNumber, formatRating, pluralize } from '@/utils/format'

interface ReviewSummaryProps {
  breakdown: RatingBreakdown
  /**
   * `true` lorsque la répartition par étoile est reconstituée à partir de la
   * moyenne et du total, faute d'être fournie par la source.
   */
  isEstimated?: boolean
  className?: string
}

const STARS = [5, 4, 3, 2, 1] as const

/** Synthèse des avis : note moyenne et distribution par nombre d'étoiles. */
export function ReviewSummary({ breakdown, isEstimated = false, className }: ReviewSummaryProps) {
  const { average, total, distribution } = breakdown

  return (
    <div className={cn('rounded-card border border-ink-200 bg-white p-5', className)}>
      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center justify-center gap-1 sm:pr-6 sm:border-r sm:border-ink-100">
        <p className="text-4xl font-bold tabular-nums text-ink-900">{formatRating(average)}</p>
        <Rating value={average} size="md" starsOnly />
        <p className="text-sm text-ink-500">
          {formatNumber(total)} {pluralize(total, 'avis', 'avis')}
        </p>
      </div>

      <ul className="space-y-2">
        {STARS.map((star) => {
          const count = distribution[star]
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0

          return (
            <li key={star} className="flex items-center gap-3 text-sm">
              <span className="w-12 shrink-0 tabular-nums text-ink-600">{star} ★</span>
              <span
                className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100"
                role="img"
                aria-label={`${star} ${pluralize(star, 'étoile')} : ${percentage} % des avis`}
              >
                <span className="block h-full rounded-full bg-star" style={{ width: `${percentage}%` }} />
              </span>
              <span className="w-14 shrink-0 text-right tabular-nums text-ink-500">{formatNumber(count)}</span>
            </li>
          )
        })}
        </ul>
      </div>

      {isEstimated && (
        <p className="mt-4 border-t border-ink-100 pt-3 text-xs text-ink-400">
          Répartition estimée à partir de la note moyenne et du nombre total d’avis : la source ne
          fournit pas le détail par étoile.
        </p>
      )}
    </div>
  )
}
