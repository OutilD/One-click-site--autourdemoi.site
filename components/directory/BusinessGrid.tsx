import { BusinessCard } from '@/components/business/BusinessCard'
import { routes } from '@/lib/routes'
import type { Business } from '@/types'
import { cn } from '@/utils/cn'

export interface OpeningStatusMap {
  [businessId: string]: { label: string; isOpen: boolean }
}

interface BusinessGridProps {
  businesses: Business[]
  /** Libellés de catégorie indexés par slug, résolus par la page appelante. */
  categoryLabels: Record<string, string>
  /** Statuts d'ouverture pré-calculés, indexés par identifiant d'entreprise. */
  openingStatuses?: OpeningStatusMap
  columns?: 2 | 3 | 4
  className?: string
}

const COLUMN_CLASSES = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const

/** Grille responsive de cartes entreprise. */
export function BusinessGrid({
  businesses,
  categoryLabels,
  openingStatuses,
  columns = 3,
  className,
}: BusinessGridProps) {
  return (
    <ul className={cn('grid grid-cols-1 gap-5', COLUMN_CLASSES[columns], className)}>
      {businesses.map((business, index) => {
        const status = openingStatuses?.[business.id]
        // Une fiche peut n'avoir aucune catégorie : le badge est alors masqué.
        const categoryLabel = business.categorySlug ? categoryLabels[business.categorySlug] : undefined

        return (
          <li key={business.id} className="flex">
            <BusinessCard
              business={business}
              categoryLabel={categoryLabel}
              href={routes.business(business.slug)}
              openingLabel={status?.label}
              isOpen={status?.isOpen}
              priority={index === 0}
              className="w-full"
            />
          </li>
        )
      })}
    </ul>
  )
}
