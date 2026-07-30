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

/** Vignette de catégorie — accueil et page « Toutes les catégories ». */
export function CategoryCard({
  name,
  icon,
  href,
  businessCount,
  tagline,
  accentColor,
  className,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-4 rounded-card border border-ink-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: accentColor ? `${accentColor}1a` : undefined, color: accentColor }}
      >
        <Icon icon={categoryIcon(icon)} className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-ink-900 group-hover:text-brand-700">{name}</span>
        <span className="block text-sm text-ink-500">
          {formatNumber(businessCount)} {pluralize(businessCount, 'établissement')}
        </span>
        {tagline && <span className="mt-0.5 block truncate text-xs text-ink-400">{tagline}</span>}
      </span>
    </Link>
  )
}
