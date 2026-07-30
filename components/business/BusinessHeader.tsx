import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import type { Business } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { icons } from '@/lib/icons'
import { formatPriceLevel } from '@/utils/format'

interface BusinessHeaderProps {
  business: Business
  categoryLabel?: string
  categoryHref?: string
  cityLabel?: string
  cityHref?: string
  /** Statut d'ouverture calculé par la page. `null` si aucun horaire connu. */
  openingLabel: string | null
  isOpen: boolean
}

/** En-tête de fiche : visuel de couverture, logo, identité et note. */
export function BusinessHeader({
  business,
  categoryLabel,
  categoryHref,
  cityLabel,
  cityHref,
  openingLabel,
  isOpen,
}: BusinessHeaderProps) {
  const altText = [business.name, categoryLabel, cityLabel].filter(Boolean).join(' — ')
  const addressLine = [business.address, business.postalCode].filter(Boolean).join(', ')

  return (
    <header>
      <div className="relative aspect-21/9 max-h-80 w-full overflow-hidden rounded-card bg-ink-200">
        {business.coverImage ? (
          <Image
            src={business.coverImage}
            alt={altText}
            fill
            sizes="(min-width: 1280px) 1152px, 100vw"
            priority
            className="object-cover"
          />
        ) : (
          <div aria-hidden="true" className="h-full w-full bg-linear-to-br from-brand-100 to-ink-200" />
        )}
      </div>

      <div className="relative -mt-12 px-4 sm:px-8">
        <div className="flex flex-col gap-4 rounded-card border border-ink-200 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:gap-6 sm:p-6">
          {business.logo ? (
            <Image
              src={business.logo}
              alt={`Logo de ${business.name}`}
              width={88}
              height={88}
              className="h-20 w-20 shrink-0 rounded-2xl border border-ink-200 bg-white object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-ink-200 bg-brand-50 text-3xl font-bold text-brand-700"
            >
              {business.name.charAt(0).toUpperCase()}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {categoryLabel &&
                (categoryHref ? (
                  <Link href={categoryHref}>
                    <Badge tone="brand">{categoryLabel}</Badge>
                  </Link>
                ) : (
                  <Badge tone="brand">{categoryLabel}</Badge>
                ))}
              {business.isVerified && (
                <Badge tone="success">
                  <Icon icon={icons.check} /> Vérifié
                </Badge>
              )}
              {openingLabel && <Badge tone={isOpen ? 'success' : 'neutral'}>{openingLabel}</Badge>}
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{business.name}</h1>

            {(addressLine || cityLabel) && (
              <p className="mt-1 text-ink-600">
                {addressLine && <>{addressLine} </>}
                {cityLabel &&
                  (cityHref ? (
                    <Link href={cityHref} className="font-medium text-brand-700 hover:underline">
                      {cityLabel}
                    </Link>
                  ) : (
                    cityLabel
                  ))}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              {business.rating !== null ? (
                <Rating value={business.rating} reviewCount={business.reviewCount} size="lg" />
              ) : (
                <span className="text-sm text-ink-500">Aucun avis pour le moment</span>
              )}

              {business.priceLevel !== undefined && (
                <>
                  <span aria-hidden="true" className="text-ink-300">
                    ·
                  </span>
                  <span className="text-sm font-medium text-ink-600">
                    Niveau de prix {formatPriceLevel(business.priceLevel)}
                  </span>
                </>
              )}

              {business.foundedYear !== undefined && (
                <>
                  <span aria-hidden="true" className="text-ink-300">
                    ·
                  </span>
                  <span className="text-sm text-ink-500">Depuis {business.foundedYear}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
