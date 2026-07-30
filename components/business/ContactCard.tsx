import type { Business } from '@/types'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { icons } from '@/lib/icons'
import { cn } from '@/utils/cn'
import { formatPhone, formatWebsiteLabel, toTelHref } from '@/utils/format'

interface ContactCardProps {
  business: Business
  className?: string
}

const SOCIAL_NETWORKS = {
  facebook: { label: 'Facebook', icon: icons.facebook },
  instagram: { label: 'Instagram', icon: icons.instagram },
  linkedin: { label: 'LinkedIn', icon: icons.linkedin },
  youtube: { label: 'YouTube', icon: icons.youtube },
  tiktok: { label: 'TikTok', icon: icons.tiktok },
} as const

/**
 * Coordonnées et boutons d'action d'un établissement.
 * Les liens sortants sont en `nofollow` (bonne pratique annuaire).
 */
export function ContactCard({ business, className }: ContactCardProps) {
  const socialEntries = Object.entries(business.social).filter(([, url]) => Boolean(url)) as [string, string][]

  const addressParts = [business.address, [business.postalCode, business.cityName].filter(Boolean).join(' ')]
    .map((part) => part?.trim())
    .filter(Boolean) as string[]

  const mapsQuery = encodeURIComponent([business.name, ...addressParts].join(', '))
  const hasAnyContact = Boolean(business.phone || business.email || business.website || addressParts.length)

  if (!hasAnyContact && socialEntries.length === 0) return null

  return (
    <section
      className={cn('rounded-card border border-ink-200 bg-white p-5', className)}
      aria-labelledby="contact-heading"
    >
      <h2 id="contact-heading" className="text-lg font-semibold text-ink-900">
        Coordonnées
      </h2>

      <dl className="mt-4 space-y-3 text-sm">
        {addressParts.length > 0 && (
          <div className="flex gap-3">
            <dt className="w-6 shrink-0 text-center text-ink-400" aria-label="Adresse">
              <Icon icon={icons.address} />
            </dt>
            <dd className="text-ink-700">
              {addressParts.map((part) => (
                <span key={part} className="block">
                  {part}
                </span>
              ))}
            </dd>
          </div>
        )}

        {business.phone && (
          <div className="flex gap-3">
            <dt className="w-6 shrink-0 text-center text-ink-400" aria-label="Téléphone">
              <Icon icon={icons.phone} />
            </dt>
            <dd>
              <a href={toTelHref(business.phone)} className="font-medium text-brand-700 hover:underline">
                {formatPhone(business.phone)}
              </a>
            </dd>
          </div>
        )}

        {business.email && (
          <div className="flex gap-3">
            <dt className="w-6 shrink-0 text-center text-ink-400" aria-label="E-mail">
              <Icon icon={icons.email} />
            </dt>
            <dd>
              <a
                href={`mailto:${business.email}`}
                className="break-all font-medium text-brand-700 hover:underline"
              >
                {business.email}
              </a>
            </dd>
          </div>
        )}

        {business.website && (
          <div className="flex gap-3">
            <dt className="w-6 shrink-0 text-center text-ink-400" aria-label="Site web">
              <Icon icon={icons.website} />
            </dt>
            <dd>
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="break-all font-medium text-brand-700 hover:underline"
              >
                {formatWebsiteLabel(business.website)}
              </a>
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-5 grid gap-2">
        {business.phone && (
          <Button href={toTelHref(business.phone)} fullWidth>
            <Icon icon={icons.phone} /> Appeler
          </Button>
        )}
        {business.website && (
          <Button
            href={business.website}
            variant="outline"
            fullWidth
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            <Icon icon={icons.website} /> Visiter le site
          </Button>
        )}
        {addressParts.length > 0 && (
          <Button
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            variant="outline"
            fullWidth
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            <Icon icon={icons.directions} /> Itinéraire
          </Button>
        )}
      </div>

      {socialEntries.length > 0 && (
        <div className="mt-5 border-t border-ink-100 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-500">Réseaux sociaux</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {socialEntries.map(([key, url]) => {
              const network = SOCIAL_NETWORKS[key as keyof typeof SOCIAL_NETWORKS]
              if (!network) return null

              return (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 text-ink-700 hover:bg-ink-200"
                  >
                    <Icon icon={network.icon} label={network.label} />
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
