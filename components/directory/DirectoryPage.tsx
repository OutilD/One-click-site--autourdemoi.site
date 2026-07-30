import Link from 'next/link'
import type { ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { FAQ } from '@/components/ui/FAQ'
import { SortSelect } from './SortSelect'
import { BusinessGrid, type OpeningStatusMap } from './BusinessGrid'
import type { Business, BreadcrumbItem, FaqItem, SelectOption } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { categoryIcon } from '@/lib/icons'
import { formatNumber, pluralize } from '@/utils/format'

export interface LinkSection {
  title: string
  links: { href: string; label: string }[]
}

interface DirectoryPageProps {
  breadcrumbItems: BreadcrumbItem[]
  /** Clé d'icône affichée à côté du titre. */
  icon?: string
  heading: string
  lead: string
  /** Paragraphe éditorial long, affiché sous la liste (contenu SEO). */
  editorial?: ReactNode

  businesses: Business[]
  categoryLabels: Record<string, string>
  openingStatuses?: OpeningStatusMap

  total: number
  currentPage: number
  totalPages: number
  buildPageHref: (page: number) => string

  sortAction: string
  sortValue: string
  sortOptions: SelectOption[]

  linkSections?: LinkSection[]
  faqItems?: FaqItem[]
  emptyAction?: { label: string; href: string }
}

/**
 * Gabarit partagé des pages d'annuaire thématiques (catégorie, ville,
 * catégorie × ville). Entièrement piloté par ses props : il n'accède
 * ni aux données ni aux repositories.
 */
export function DirectoryPage({
  breadcrumbItems,
  icon,
  heading,
  lead,
  editorial,
  businesses,
  categoryLabels,
  openingStatuses,
  total,
  currentPage,
  totalPages,
  buildPageHref,
  sortAction,
  sortValue,
  sortOptions,
  linkSections = [],
  faqItems = [],
  emptyAction,
}: DirectoryPageProps) {
  return (
    <Container size="wide" className="py-8">
      <Breadcrumb items={breadcrumbItems} />

      <header className="mt-6 max-w-3xl">
        <h1 className="flex items-start gap-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          {icon && <Icon icon={categoryIcon(icon)} className="mt-1 h-7 w-7 text-brand-600" />}
          {heading}
        </h1>
        <p className="mt-3 leading-relaxed text-ink-600">{lead}</p>
      </header>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 pb-4">
        <p className="text-sm font-medium text-ink-700">
          {formatNumber(total)} {pluralize(total, 'établissement')}
          {totalPages > 1 && (
            <span className="font-normal text-ink-500">
              {' '}
              · page {currentPage} sur {totalPages}
            </span>
          )}
        </p>
        <SortSelect action={sortAction} value={sortValue} options={sortOptions} hiddenFields={{}} />
      </div>

      {businesses.length > 0 ? (
        <>
          <BusinessGrid
            businesses={businesses}
            categoryLabels={categoryLabels}
            openingStatuses={openingStatuses}
            columns={3}
            className="mt-8"
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            buildHref={buildPageHref}
            className="mt-10"
          />
        </>
      ) : (
        <EmptyState
          title="Aucun établissement référencé pour le moment"
          description="Cette page sera enrichie au fur et à mesure du référencement de nouveaux établissements."
          action={emptyAction}
          className="mt-8"
        />
      )}

      {editorial && (
        <section className="mt-16 max-w-3xl border-t border-ink-200 pt-10">
          <div className="space-y-4 leading-relaxed text-ink-700">{editorial}</div>
        </section>
      )}

      {linkSections.length > 0 && (
        <section className="mt-16 border-t border-ink-200 pt-10" aria-labelledby="related-heading">
          <h2 id="related-heading" className="sr-only">
            Navigation associée
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {linkSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-ink-900">{section.title}</h3>
                <ul className="mt-3 space-y-1.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-600 hover:text-brand-700 hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {faqItems.length > 0 && (
        <div className="mt-16 max-w-3xl">
          <FAQ items={faqItems} />
        </div>
      )}
    </Container>
  )
}
