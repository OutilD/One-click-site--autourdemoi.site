import Link from 'next/link'
import type { BreadcrumbItem } from '@/types'
import { cn } from '@/utils/cn'

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Fil d'Ariane. Le balisage `BreadcrumbList` correspondant est injecté
 * séparément via `breadcrumbJsonLd()` dans la page.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d’Ariane" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-ink-400">
                  /
                </span>
              )}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-brand-700 hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast && 'font-medium text-ink-700')}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
