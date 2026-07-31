import { SafeImage } from '@/components/ui/SafeImage'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import type { Post, PostType } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { icons } from '@/lib/icons'
import { outboundRel } from '@/lib/outbound'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format'
import { PostDialog } from './PostDialog'

interface GooglePostProps {
  post: Post
  /** Affiché hors page entreprise (accueil, flux de publications). */
  businessName?: string
  businessHref?: string
  /**
   * Site déclaré de l'établissement. Sert à décider si le bouton d'action
   * mène chez lui — auquel cas le lien est suivi — ou vers un tiers.
   */
  businessWebsite?: string
  className?: string
}

const TYPE_META: Record<PostType, { label: string; tone: 'brand' | 'success' | 'warning' }> = {
  update: { label: 'Actualité', tone: 'brand' },
  offer: { label: 'Offre', tone: 'warning' },
  event: { label: 'Événement', tone: 'success' },
}

/** Encadré d'événement — mêmes informations sur la carte et dans le dialogue. */
function EventNote({ event }: { event: NonNullable<Post['event']> }) {
  return (
    <p className="rounded-lg bg-positive-bg px-3 py-2 text-xs font-medium text-positive">
      <Icon icon={icons.calendar} className="mr-1.5" />
      Du {formatDate(event.startDate)} au {formatDate(event.endDate)}
    </p>
  )
}

/** Encadré d'offre — code promotionnel et date de validité. */
function OfferNote({ offer }: { offer: NonNullable<Post['offer']> }) {
  return (
    <p className="rounded-lg bg-caution-bg px-3 py-2 text-xs font-medium text-caution">
      <Icon icon={icons.coupon} className="mr-1.5" />
      Code <span className="font-mono font-bold">{offer.couponCode}</span> — valable jusqu’au{' '}
      {formatDate(offer.validUntil)}
    </p>
  )
}

/**
 * Publication d'établissement (Google Post) : actualité, offre ou événement.
 *
 * La carte n'affiche qu'un chapô de 180 signes, là où les publications font
 * 615 signes en médiane — la totalité du texte n'était donc jamais lisible.
 * Un clic sur la carte ouvre le détail complet dans une surcouche modale.
 */
export function GooglePost({
  post,
  businessName,
  businessHref,
  businessWebsite,
  className,
}: GooglePostProps) {
  const meta = TYPE_META[post.type]
  const ctaRel = post.ctaUrl ? outboundRel(post.ctaUrl, businessWebsite) : undefined

  const attribution = businessName && businessHref && (
    <>
      Publié par{' '}
      <Link href={businessHref} className="font-medium text-brand-700 hover:underline">
        {businessName}
      </Link>
    </>
  )

  return (
    <article
      className={cn(
        // `relative` ancre le bouton étiré du dialogue ; `group` propage le
        // survol de la carte à son appel à lire.
        'group relative flex flex-col overflow-hidden rounded-card border border-ink-200 bg-ink-50 transition-colors duration-200 hover:border-ink-900',
        className,
      )}
    >
      <div className="relative aspect-16/9 bg-ink-150">
        <SafeImage
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
        <time
          dateTime={post.publishedAt}
          className="text-xs font-medium uppercase tracking-wide text-ink-400"
        >
          {formatDate(post.publishedAt)}
        </time>
        <h3 className="mt-1.5 font-semibold leading-snug text-ink-900">{post.title}</h3>

        {/* Au-dessus du bouton étiré, pour rester cliquable de son propre chef. */}
        {attribution && <p className="relative z-10 mt-1 w-fit text-sm text-ink-500">{attribution}</p>}

        <p className="mt-2 line-clamp-2-safe text-sm leading-relaxed text-ink-600">{post.excerpt}</p>

        {post.event && (
          <div className="mt-3">
            <EventNote event={post.event} />
          </div>
        )}
        {post.offer && (
          <div className="mt-3">
            <OfferNote offer={post.offer} />
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-4">
          {/* Appel à lire : signale que la carte est cliquable, sans être un
              élément interactif de plus — c'est le bouton étiré qui agit. */}
          <span
            aria-hidden="true"
            className="inline-flex items-center gap-1.5 border-b-2 border-brand-400 pb-0.5 text-sm font-semibold text-ink-900"
          >
            Lire la publication
            <Icon
              icon={icons.arrowRight}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>

          {/* Conservé sur la carte, au-dessus du bouton étiré : c'est un lien
              sortant, pas la même action que l'ouverture du détail. */}
          {post.ctaLabel && post.ctaUrl && (
            <a
              href={post.ctaUrl}
              rel={ctaRel}
              target="_blank"
              className="relative z-10 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
            >
              {post.ctaLabel} <Icon icon={icons.arrowRight} />
            </a>
          )}
        </div>
      </div>

      <PostDialog title={post.title}>
        <div className="relative aspect-16/9 overflow-hidden rounded-t-card bg-ink-150">
          <SafeImage src={post.image} alt={post.title} fill sizes="(min-width: 768px) 672px, 100vw" className="object-cover" />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={meta.tone}>{meta.label}</Badge>
            {post.offer && <Badge tone="danger">{post.offer.label}</Badge>}
          </div>

          <time
            dateTime={post.publishedAt}
            className="mt-4 block text-xs font-medium uppercase tracking-wide text-ink-400"
          >
            {formatDate(post.publishedAt)}
          </time>

          <h2 className="mt-2 text-2xl font-bold text-ink-900">{post.title}</h2>

          {attribution && <p className="mt-2 text-sm text-ink-500">{attribution}</p>}

          {/* Le texte intégral, que la carte ne pouvait montrer. */}
          <div className="mt-5 space-y-3 leading-relaxed text-ink-600">
            {post.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {(post.event || post.offer) && (
            <div className="mt-6 space-y-2">
              {post.event && <EventNote event={post.event} />}
              {post.offer && <OfferNote offer={post.offer} />}
            </div>
          )}

          {post.ctaLabel && post.ctaUrl && (
            <a
              href={post.ctaUrl}
              rel={ctaRel}
              target="_blank"
              className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-brand-400 px-5 text-sm font-semibold text-ink-900 transition-colors duration-150 hover:bg-brand-300"
            >
              {post.ctaLabel} <Icon icon={icons.arrowRight} />
            </a>
          )}
        </div>
      </PostDialog>
    </article>
  )
}
