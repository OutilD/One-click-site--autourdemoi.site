import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { SearchBar } from '@/components/search/SearchBar'
import { BusinessGrid } from '@/components/directory/BusinessGrid'
import { FilterSidebar } from '@/components/directory/FilterSidebar'
import { SortSelect } from '@/components/directory/SortSelect'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd, itemListJsonLd } from '@/lib/jsonld'
import { routes } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo'
import { siteConfig } from '@/lib/site'
import {
  buildQueryString,
  firstValue,
  hasActiveFilters,
  toBusinessQuery,
  type DirectorySearchParams,
} from '@/lib/search-params'
import {
  RATING_OPTIONS,
  SORT_OPTIONS,
  buildCategoryLabels,
  buildOpeningStatuses,
  toSelectOptions,
} from '@/lib/view-helpers'
import { BusinessRepository, CategoryRepository, CityRepository } from '@/repositories'
import { formatNumber, pluralize } from '@/utils/format'

const PER_PAGE = siteConfig.defaultPerPage

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Normalise les paramètres bruts de l'URL. */
function readParams(raw: Record<string, string | string[] | undefined>): DirectorySearchParams {
  return {
    q: firstValue(raw.q),
    categorie: firstValue(raw.categorie),
    ville: firstValue(raw.ville),
    note: firstValue(raw.note),
    tri: firstValue(raw.tri),
    page: firstValue(raw.page),
  }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = readParams(await searchParams)
  const isFiltered = hasActiveFilters(params)
  const pageNumber = Number.parseInt(params.page ?? '1', 10) || 1

  const total = await BusinessRepository.count()
  const suffix = pageNumber > 1 ? ` — page ${pageNumber}` : ''

  return buildMetadata({
    title: `Toutes les entreprises${suffix}`,
    description: `Parcourez les ${formatNumber(total)} établissements référencés dans l’annuaire ${siteConfig.name} : avis clients, horaires, coordonnées et photos.`,
    path: routes.businesses(pageNumber > 1 ? { page: pageNumber } : undefined),
    // Les combinaisons de filtres sont désindexées : les pages catégorie et
    // ville portent le référencement de ces segments.
    noIndex: isFiltered,
  })
}

export default async function BusinessesPage({ searchParams }: PageProps) {
  const now = new Date()
  const params = readParams(await searchParams)

  const [categories, cities] = await Promise.all([
    CategoryRepository.getAllWithCounts(),
    CityRepository.getAllWithCounts(),
  ])

  const result = await BusinessRepository.search(toBusinessQuery(params, {}, PER_PAGE))
  const categoryLabels = buildCategoryLabels(categories)
  const openingStatuses = buildOpeningStatuses(result.items, now)

  const activeCategory = categories.find((category) => category.slug === params.categorie)
  const activeCity = cities.find((city) => city.slug === params.ville)

  const baseFilters = {
    q: params.q ?? '',
    categorie: params.categorie ?? '',
    ville: params.ville ?? '',
    note: params.note ?? '',
    tri: params.tri ?? 'pertinence',
  }

  const buildPageHref = (page: number) => {
    const qs = buildQueryString({ ...baseFilters, tri: params.tri ?? '', page: page > 1 ? page : undefined })
    return qs ? `/entreprises?${qs}` : '/entreprises'
  }

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Toutes les entreprises', href: routes.businesses() },
  ]

  return (
    <Container size="wide" className="py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">
          {activeCategory ? activeCategory.pluralName : 'Toutes les entreprises'}
          {activeCity && <span className="text-ink-500"> à {activeCity.name}</span>}
        </h1>
        <p className="mt-2 text-ink-600">
          {formatNumber(result.total)} {pluralize(result.total, 'établissement')}{' '}
          {params.q ? (
            <>
              pour la recherche « <span className="font-medium text-ink-800">{params.q}</span> »
            </>
          ) : (
            'référencés dans l’annuaire'
          )}
          .
        </p>
      </div>

      <div className="mt-6">
        <SearchBar
          cityOptions={toSelectOptions(cities, (city) => city.name)}
          defaultQuery={params.q}
          defaultCity={params.ville}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <FilterSidebar
          action="/entreprises"
          values={baseFilters}
          categoryOptions={toSelectOptions(categories, (category) => category.pluralName)}
          cityOptions={toSelectOptions(cities, (city) => city.name)}
          ratingOptions={RATING_OPTIONS}
          resetHref={routes.businesses()}
          className="h-fit lg:sticky lg:top-24"
        />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 pb-4">
            <p className="text-sm text-ink-600">
              Page {result.page} sur {result.totalPages}
            </p>
            <SortSelect
              action="/entreprises"
              value={params.tri || 'pertinence'}
              options={SORT_OPTIONS}
              hiddenFields={{
                q: baseFilters.q,
                categorie: baseFilters.categorie,
                ville: baseFilters.ville,
                note: baseFilters.note,
              }}
            />
          </div>

          {result.items.length > 0 ? (
            <>
              <BusinessGrid
                businesses={result.items}
                categoryLabels={categoryLabels}
                openingStatuses={openingStatuses}
                columns={3}
                className="mt-6"
              />
              <Pagination
                currentPage={result.page}
                totalPages={result.totalPages}
                buildHref={buildPageHref}
                className="mt-10"
              />
            </>
          ) : (
            <EmptyState
              title="Aucun établissement ne correspond à votre recherche"
              description="Essayez d’élargir vos critères : supprimez un filtre, changez de ville ou reformulez votre recherche."
              action={{ label: 'Réinitialiser les filtres', href: routes.businesses() }}
            />
          )}
        </div>
      </div>

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbItems),
          itemListJsonLd(result.items, 'Entreprises référencées'),
        ]}
      />
    </Container>
  )
}
