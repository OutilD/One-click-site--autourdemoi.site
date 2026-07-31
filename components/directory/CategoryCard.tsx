import Link from 'next/link'
import { Icon } from '@/components/ui/Icon'
import { categoryIcon } from '@/lib/icons'
import { cn } from '@/utils/cn'
import { formatNumber, pluralize } from '@/utils/format'

interface CategoryCardProps {
  name: string
  /** Clé d'icône de catégorie — voir `categoryIcons`. */
  icon: string
  href: string
  businessCount: number
  tagline?: string
  accentColor?: string
  className?: string
}

/**
 * Vignette de catégorie — accueil et page « Toutes les catégories ».
 *
 * `accentColor` est volontairement ignoré. Les couleurs portées par les
 * données ont été choisies pour un fond clair : posées sur du fusain, les
 * vingt-trois teintes vives de la grille virent au nuancier et cassent la
 * ligne laiton du site. La différenciation passe par l'icône, pas par la
 * couleur — la prop reste dans la signature pour ne pas casser les appelants.
 */
export function CategoryCard({ name, icon, href, businessCount, tagline, className }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-card border border-ink-200 bg-ink-50 p-5 transition-colors duration-200 hover:border-ink-900 hover:bg-ink-150',
        className,
      )}
    >
      {/* Pastille jaune pleine à icône noire : c'est le repère de métier. Un
          fond pâle à icône ambrée s'effaçait dans la grille. */}
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-brand-400 text-ink-900"
      >
        <Icon icon={categoryIcon(icon)} className="h-4.5 w-4.5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink-900">{name}</span>
        <span className="mt-0.5 block text-sm tabular-nums text-ink-500">
          {formatNumber(businessCount)} {pluralize(businessCount, 'établissement')}
        </span>
        {tagline && <span className="mt-1 block truncate text-xs text-ink-400">{tagline}</span>}
      </span>
    </Link>
  )
}
