import Link from 'next/link'
import { buildPageRange } from '@/utils/pagination'
import { Icon } from './Icon'
import { icons } from '@/lib/icons'
import { cn } from '@/utils/cn'

interface PaginationProps {
  currentPage: number
  totalPages: number
  /** Construit l'URL d'une page donnée — la pagination reste agnostique des routes. */
  buildHref: (page: number) => string
  className?: string
}

const ITEM = 'inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium'

/** Pagination accessible, rendue en liens `<a>` (crawlable, sans JavaScript). */
export function Pagination({ currentPage, totalPages, buildHref, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageRange(currentPage, totalPages)

  return (
    <nav aria-label="Pagination" className={cn('flex justify-center', className)}>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          {currentPage > 1 ? (
            <Link
              href={buildHref(currentPage - 1)}
              rel="prev"
              className={cn(ITEM, 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50')}
            >
              <Icon icon={icons.chevronLeft} />
              <span className="ml-1 hidden sm:inline">Précédent</span>
              <span className="sr-only">Page précédente</span>
            </Link>
          ) : (
            <span className={cn(ITEM, 'border border-ink-100 text-ink-300')} aria-disabled="true">
              <Icon icon={icons.chevronLeft} />
              <span className="ml-1 hidden sm:inline">Précédent</span>
            </span>
          )}
        </li>

        {pages.map((page, index) =>
          page === null ? (
            <li key={`gap-${index}`} className={cn(ITEM, 'text-ink-400')} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={page}>
              <Link
                href={buildHref(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                aria-label={`Page ${page}`}
                className={cn(
                  ITEM,
                  page === currentPage
                    ? 'bg-brand-600 text-white'
                    : 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
                )}
              >
                {page}
              </Link>
            </li>
          ),
        )}

        <li>
          {currentPage < totalPages ? (
            <Link
              href={buildHref(currentPage + 1)}
              rel="next"
              className={cn(ITEM, 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50')}
            >
              <span className="mr-1 hidden sm:inline">Suivant</span>
              <Icon icon={icons.chevronRight} />
              <span className="sr-only">Page suivante</span>
            </Link>
          ) : (
            <span className={cn(ITEM, 'border border-ink-100 text-ink-300')} aria-disabled="true">
              <span className="mr-1 hidden sm:inline">Suivant</span>
              <Icon icon={icons.chevronRight} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}
