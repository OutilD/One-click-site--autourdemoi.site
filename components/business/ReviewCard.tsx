import { SafeImage } from '@/components/ui/SafeImage'
import Link from 'next/link'
import { Rating } from '@/components/ui/Rating'
import type { Review } from '@/types'
import { cn } from '@/utils/cn'
import { formatDate, formatNumber, pluralize } from '@/utils/format'

interface ReviewCardProps {
  review: Review
  /** Affiché uniquement hors page entreprise (accueil, flux d'avis). */
  businessName?: string
  businessHref?: string
  /** Date relative pré-calculée par la page, pour éviter tout écart d'hydratation. */
  relativeDate?: string
  className?: string
}

const SOURCE_LABELS: Record<Review['source'], string> = {
  google: 'Avis Google',
  facebook: 'Avis Facebook',
  site: 'Avis client',
}

/** Avis client, avec réponse éventuelle du professionnel. */
export function ReviewCard({ review, businessName, businessHref, relativeDate, className }: ReviewCardProps) {
  return (
    <article className={cn('rounded-card border border-ink-200 bg-ink-50 p-5', className)}>
      <header className="flex items-start gap-3">
        {review.authorAvatar ? (
          <SafeImage
            src={review.authorAvatar}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full bg-ink-150 object-cover"
          />
        ) : (
          // L'API Google ne fournit pas d'avatar : monogramme de repli.
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700"
          >
            {review.authorName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink-900">{review.authorName}</p>
          <p className="text-xs text-ink-500">
            {review.authorReviewCount !== undefined && (
              <>
                {formatNumber(review.authorReviewCount)} {pluralize(review.authorReviewCount, 'avis', 'avis')}{' '}
                publiés ·{' '}
              </>
            )}
            {SOURCE_LABELS[review.source]}
          </p>
        </div>
        <Rating value={review.rating} size="sm" starsOnly />
      </header>

      {businessName && businessHref && (
        <p className="mt-3 text-sm text-ink-500">
          À propos de{' '}
          <Link href={businessHref} className="font-medium text-brand-700 hover:underline">
            {businessName}
          </Link>
        </p>
      )}

      {review.title && <h3 className="mt-3 font-semibold text-ink-900">{review.title}</h3>}
      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-600">{review.content}</p>

      <footer className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
        <time dateTime={review.publishedAt}>{relativeDate ?? formatDate(review.publishedAt)}</time>
        {review.helpfulCount !== undefined && review.helpfulCount > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span>
              {formatNumber(review.helpfulCount)} {pluralize(review.helpfulCount, 'personne')}{' '}
              {review.helpfulCount > 1 ? 'ont trouvé' : 'a trouvé'} cet avis utile
            </span>
          </>
        )}
      </footer>

      {review.reply && (
        <div className="mt-4 rounded-xl border-l-4 border-brand-500 bg-ink-150 p-4">
          <p className="eyebrow font-sans">Réponse du professionnel</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{review.reply.content}</p>
        </div>
      )}
    </article>
  )
}
