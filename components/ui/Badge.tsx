import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger'

/**
 * Le ton `brand` est le seul à prendre le jaune plein avec du texte noir :
 * c'est l'étiquette de catégorie, le repère principal d'une fiche. Les autres
 * restent en fond pâle + texte profond pour ne pas lui disputer l'attention.
 *
 * Toutes sont opaques : posées sur une photo de couverture, une étiquette
 * translucide laisserait remonter le visuel et deviendrait illisible.
 */
const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-300',
  brand: 'bg-brand-400 text-ink-900 ring-ink-900/15',
  success: 'bg-positive-bg text-positive ring-positive/25',
  warning: 'bg-caution-bg text-caution ring-caution/30',
  danger: 'bg-critical-bg text-critical ring-critical/25',
}

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}

/** Étiquette courte : catégorie, statut d'ouverture, type de publication. */
export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
