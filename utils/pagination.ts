import type { Paginated } from '@/types'

/** Découpe un tableau complet en page, et produit l'enveloppe `Paginated`. */
export function paginate<T>(items: T[], page = 1, perPage = 12): Paginated<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages)
  const start = (safePage - 1) * perPage

  return {
    items: items.slice(start, start + perPage),
    page: safePage,
    perPage,
    total,
    totalPages,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  }
}

/**
 * Suite de numéros de page à afficher, avec ellipses.
 * `null` représente une coupure : `[1, null, 4, 5, 6, null, 12]`.
 */
export function buildPageRange(
  currentPage: number,
  totalPages: number,
  siblings = 1,
): (number | null)[] {
  const totalSlots = siblings * 2 + 5
  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const left = Math.max(currentPage - siblings, 1)
  const right = Math.min(currentPage + siblings, totalPages)
  const showLeftEllipsis = left > 2
  const showRightEllipsis = right < totalPages - 1

  const pages: (number | null)[] = [1]
  if (showLeftEllipsis) pages.push(null)
  for (let page = Math.max(left, 2); page <= Math.min(right, totalPages - 1); page += 1) {
    pages.push(page)
  }
  if (showRightEllipsis) pages.push(null)
  pages.push(totalPages)

  return pages
}
