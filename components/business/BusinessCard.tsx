import { SafeImage } from '@/components/ui/SafeImage'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import type { Business } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { icons } from '@/lib/icons'
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

/** Ligne de localisation : adresse et commune quand elles existent. */
function locationLabel(business: Business): string | null {
  const parts = [business.address, business.cityName].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
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

  // Dernier étage du repli : l'initiale, qui ne peut jamais échouer.
  const monogram = (
    <span
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center bg-brand-100 text-5xl font-bold text-brand-700"
    >
      {business.name.charAt(0).toUpperCase()}
    </span>
  )

  // Étage intermédiaire : la photo de profil, cadrée en `contain` — un logo
  // recadré en `cover` serait rogné sur ses bords.
  const logoOrMonogram = business.logo ? (
    <SafeImage
      src={business.logo}
      alt={altText}
      fill
      sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
      className="bg-ink-50 object-contain p-10"
      fallback={monogram}
    />
  ) : (
    monogram
  )

  return (
    <article
      className={cn(
        'group relative flex cursor-pointer flex-col overflow-hidden rounded-card border border-ink-200 bg-ink-50 transition-colors duration-200 hover:border-ink-900',
        className,
      )}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-ink-150">
        {/*
          Repli en cascade : couverture, puis photo de profil, puis initiale.

          Chaque étage sert aussi bien l'absence d'URL que l'URL morte —
          `SafeImage` bascule sur son `fallback` quand le chargement échoue.
          Aucune carte ne peut donc rester vide.
        */}
        {business.coverImage ? (
          <SafeImage
            src={business.coverImage}
            alt={altText}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            fallback={logoOrMonogram}
          />
        ) : (
          logoOrMonogram
        )}

        {/* Les étiquettes sont opaques : posées sur une couverture Google dont
            on ne maîtrise ni la luminosité ni le sujet, c'est la seule façon de
            garantir qu'elles restent lisibles sans voiler la photo. */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {categoryLabel && <Badge tone="brand">{categoryLabel}</Badge>}
          {business.isFeatured && (
            <Badge tone="warning">
              <Icon icon={icons.featured} /> À la une
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/*
          Le bloc de contenu absorbe la hauteur restante (`flex-1`), ce qui
          pousse le pied de carte en bas. Dans une rangée, les notes s'alignent
 donc quelle que soit la longueur des descriptions.
        */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-medium leading-snug text-ink-900 transition-colors duration-200 group-hover:text-brand-800">
              {/* Lien étendu : toute la carte est cliquable, un seul lien dans l'arbre. */}
              <Link href={href} className="after:absolute after:inset-0 after:content-['']">
                {business.name}
              </Link>
            </h3>
            {business.isVerified && (
              <Icon
                icon={icons.check}
                label="Établissement vérifié"
                className="mt-1.5 shrink-0 text-brand-700"
              />
            )}
          </div>

          {location && <p className="mt-1.5 text-sm text-ink-500">{location}</p>}

          {business.shortDescription && (
            <p className="mt-3 line-clamp-2-safe text-sm leading-relaxed text-ink-600">
              {business.shortDescription}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-ink-200 pt-4">
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
            <span className={cn('ml-auto text-xs font-semibold', isOpen ? 'text-positive' : 'text-ink-500')}>
              {openingLabel}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
