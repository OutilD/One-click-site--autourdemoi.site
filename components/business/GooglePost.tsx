import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import type { Post, PostType } from '@/types'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format'

interface GooglePostProps {
  post: Post
  /** Affiché hors page entreprise (accueil, flux de publications). */
  businessName?: string
  businessHref?: string
  className?: string
}

const TYPE_META: Record<PostType, { label: string; tone: 'brand' | 'success' | 'warning' }> = {
  update: { label: 'Actualité', tone: 'brand' },
  offer: { label: 'Offre', tone: 'warning' },
  event: { label: 'Événement', tone: 'success' },
}

/** Publication d'établissement (Google Post) : actualité, offre ou événement. */
export function GooglePost({ post, businessName, businessHref, className }: GooglePostProps) {
  const meta = TYPE_META[post.type]

  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-card border border-ink-200 bg-white transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="relative aspect-16/9 bg-ink-100">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge tone={meta.tone}>{meta.label}</Badge>
          {post.offer && <Badge tone="danger">{post.offer.label}</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <time dateTime={post.publishedAt} className="text-xs font-medium uppercase tracking-wide text-ink-400">
          {formatDate(post.publishedAt)}
        </time>
        <h3 className="mt-1.5 font-semibold leading-snug text-ink-900">{post.title}</h3>

        {businessName && businessHref && (
          <p className="mt-1 text-sm text-ink-500">
            Publié par{' '}
            <Link href={businessHref} className="font-medium text-brand-700 hover:underline">
              {businessName}
            </Link>
          </p>
        )}

        <p className="mt-2 line-clamp-2-safe text-sm leading-relaxed text-ink-600">{post.excerpt}</p>

        {post.event && (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            📅 Du {formatDate(post.event.startDate)} au {formatDate(post.event.endDate)}
          </p>
        )}

        {post.offer && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            🎟️ Code <span className="font-mono font-bold">{post.offer.couponCode}</span> — valable jusqu’au{' '}
            {formatDate(post.offer.validUntil)}
          </p>
        )}

        {post.ctaLabel && post.ctaUrl && (
          <a
            href={post.ctaUrl}
            rel="noopener noreferrer nofollow"
            target="_blank"
            className="mt-4 inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
          >
            {post.ctaLabel} <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </article>
  )
}
