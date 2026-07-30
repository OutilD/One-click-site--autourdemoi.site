import { Icon } from '@/components/ui/Icon'
import { icons } from '@/lib/icons'
import { cn } from '@/utils/cn'

interface BusinessMapProps {
  latitude: number
  longitude: number
  label: string
  address?: string
  /**
   * Carte prête à embarquer fournie par la source. Quand elle existe, elle
   * est préférée : elle pointe sur le `place_id` exact de l'établissement,
   * donc affiche son nom et sa fiche, là où des coordonnées seules ne
   * produisent qu'une épingle anonyme.
   */
  embedUrl?: string
  /** Lien externe vers la fiche cartographique. */
  linkUrl?: string
  /**
   * Demi-largeur de la zone affichée par le repli OpenStreetMap, en degrés.
   * 0,004 ≈ 450 m de part et d'autre : l'échelle d'un quartier.
   */
  span?: number
  className?: string
}

/**
 * Carte d'un établissement.
 *
 * Rendue dans un cadre embarqué, sans aucun JavaScript ajouté au bundle — le
 * site conserve ses ~105 kB partagés. La carte reste déplaçable et zoomable.
 *
 * Deux sources possibles :
 * 1. `embedUrl` fournie par l'API (carte Google centrée sur la fiche) ;
 * 2. à défaut, le cadre embarqué d'OpenStreetMap à partir des coordonnées —
 *    ni clé d'API, ni dépendance.
 *
 * Alternative écartée : Leaflet ou MapLibre offriraient un marqueur
 * personnalisé et un style maîtrisé, au prix d'environ 45 kB de JavaScript
 * client sur une page dont la carte n'est pas le contenu principal.
 */
export function BusinessMap({
  latitude,
  longitude,
  label,
  address,
  embedUrl,
  linkUrl,
  span = 0.004,
  className,
}: BusinessMapProps) {
  const bbox = [longitude - span, latitude - span / 2, longitude + span, latitude + span / 2]
    .map((value) => value.toFixed(6))
    .join(',')

  const osmEmbedUrl =
    `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}` +
    `&layer=mapnik&marker=${latitude},${longitude}`

  const osmLinkUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`

  const source = embedUrl ?? osmEmbedUrl
  const externalUrl = linkUrl ?? osmLinkUrl
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`

  return (
    <div className={cn('overflow-hidden rounded-card border border-ink-200 bg-white', className)}>
      <iframe
        src={source}
        title={`Carte de localisation — ${label}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="block h-72 w-full border-0 sm:h-96"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 px-4 py-3">
        <p className="text-sm text-ink-700">
          <Icon icon={icons.address} className="mr-1.5 text-ink-400" />
          {address ?? label}
        </p>

        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-brand-700 hover:underline"
          >
            Itinéraire <Icon icon={icons.arrowRight} className="ml-1" />
          </a>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-ink-500 hover:text-ink-800 hover:underline"
          >
            Agrandir la carte
          </a>
        </div>
      </div>
    </div>
  )
}
