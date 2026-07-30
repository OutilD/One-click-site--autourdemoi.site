import { cn } from '@/utils/cn'

interface MapPlaceholderProps {
  latitude: number
  longitude: number
  label: string
  address: string
  className?: string
}

/**
 * Emplacement réservé pour la carte.
 *
 * Phase 1 : aucun appel réseau, donc aucune tuile chargée. Le bloc affiche
 * les coordonnées et un lien sortant. En phase 2, remplacer le contenu par
 * le composant de cartographie retenu — l'API du composant ne change pas.
 */
export function MapPlaceholder({ latitude, longitude, label, address, className }: MapPlaceholderProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-card border border-ink-200 bg-ink-100',
        className,
      )}
    >
      {/* Trame décorative évoquant un fond de carte, en CSS pur. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-ink-200) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink-200) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative flex min-h-56 flex-col items-center justify-center gap-2 p-6 text-center">
        <span aria-hidden="true" className="text-3xl">
          📍
        </span>
        <p className="font-semibold text-ink-900">{label}</p>
        <p className="text-sm text-ink-600">{address}</p>
        <p className="text-xs tabular-nums text-ink-400">
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-2 text-sm font-semibold text-brand-700 hover:underline"
        >
          Ouvrir dans Google Maps <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  )
}
