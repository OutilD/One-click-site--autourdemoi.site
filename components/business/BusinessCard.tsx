import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import type { Business } from '@/types'
import { cn } from '@/utils/cn'
import { formatPriceLevel } from '@/utils/format'

interface BusinessCardProps {
  business: Business
  /** Libellé de catégorie déjà résolu — la carte ne consulte aucune source de données. */
  categoryLabel?: string
  href: string
  /** Statut d'ouverture calculé par la page (rendu déterministe). */
  openingLabel?: string
  isOpen?: boolean
  /** `true` pour la première carte au-dessus de la ligne de flottaison (LCP). */
  priority?: boolean
  className?: string
}

/** Ligne de localisation : adresse et ville quand elles existent. */
function locationLabel(business: Business): string | null {
  const parts = [business.address, business.cityName].filter(Boolean)
  if (parts.length > 0) return parts.join(', ')

  // Artisan mobile : on annonce la zone d'intervention plutôt que rien.
  if (business.servedCitySlugs.length > 0) return 'Intervient dans votre secteur'
  return null
}

/** Carte entreprise réutilisée sur l'accueil, les listings et les pages locales. */
export function BusinessCard({
  business,
  categoryLabel,
  href,
  openingLabel,
  isOpen,
  priority = false,
  className,
}: BusinessCardProps) {
  const location = locationLabel(business)
  const altText = [business.name, categoryLabel, business.cityName].filter(Boolean).join(' — ')

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card border border-ink-200 bg-white transition-shadow hover:shadow-lg hover:shadow-ink-900/5',
        className,
      )}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-ink-100">
        {business.coverImage ? (
          <Image
            src={business.coverImage}
            alt={altText}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center bg-linear-to-br from-brand-50 to-ink-100 text-4xl"
          >
            🏢
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {categoryLabel && <Badge tone="brand">{categoryLabel}</Badge>}
          {business.isFeatured && <Badge tone="warning">★ À la une</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug text-ink-900">
            {/* Lien étendu : toute la carte est cliquable, un seul lien dans l'arbre. */}
            <Link href={href} className="after:absolute after:inset-0 after:content-['']">
              {business.name}
            </Link>
          </h3>
          {business.isVerified && (
            <span className="shrink-0 text-brand-600" title="Établissement vérifié">
              <span aria-hidden="true">✓</span>
              <span className="sr-only">Établissement vérifié</span>
            </span>
          )}
        </div>

        {location && <p className="mt-1 text-sm text-ink-500">{location}</p>}

        {business.shortDescription && (
          <p className="mt-2 line-clamp-2-safe text-sm leading-relaxed text-ink-600">
            {business.shortDescription}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-ink-100 pt-3">
          {business.rating !== null ? (
            <Rating value={business.rating} reviewCount={business.reviewCount} size="sm" />
          ) : (
            // Une fiche sans avis ne doit jamais afficher 0/5.
            <span className="text-xs font-medium text-ink-500">Aucun avis pour le moment</span>
          )}

          {business.priceLevel !== undefined && (
            <>
              <span aria-hidden="true" className="text-ink-300">
                ·
              </span>
              <span className="text-sm font-medium text-ink-600">
                {formatPriceLevel(business.priceLevel)}
              </span>
            </>
          )}

          {openingLabel && (
            <span
              className={cn('ml-auto text-xs font-semibold', isOpen ? 'text-emerald-600' : 'text-ink-500')}
            >
              {openingLabel}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
