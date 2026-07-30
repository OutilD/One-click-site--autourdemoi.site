import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DirectoryPage, type LinkSection } from '@/components/directory/DirectoryPage'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd } from '@/lib/jsonld'
import { routes } from '@/lib/routes'
import { buildMetadata, categoryCityDescription, categoryCityTitle } from '@/lib/seo'
import { buildQueryString, firstValue, parsePage, parseSort } from '@/lib/search-params'
import { SORT_OPTIONS, buildCategoryLabels, buildOpeningStatuses } from '@/lib/view-helpers'
import { BusinessRepository, CategoryRepository, CityRepository } from '@/repositories'
import { siteConfig } from '@/lib/site'
import type { Category, City } from '@/types'
import { formatNumber } from '@/utils/format'

const PER_PAGE = siteConfig.defaultPerPage

interface PageProps {
  params: Promise<{ slug: string; sub: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

interface Resolved {
  category: Category
  city: City
  /** Ordre des segments dans l'URL, conservé pour l'URL canonique. */
  order: 'category-first' | 'city-first'
}

/**
 * Résout `/restaurants/paris` comme `/paris/restaurants`.
 *
 * Les deux ordres sont acceptés : les internautes et les liens externes
 * utilisent l'un ou l'autre. L'URL `catégorie/ville` porte la balise
 * canonique des deux variantes, et c'est la seule que déclarent le maillage
 * interne et le sitemap.
 */
async function resolvePair(slug: string, sub: string): Promise<Resolved | null> {
  const [categoryFirst, cityForCategoryFirst] = await Promise.all([
    CategoryRepository.getBySlug(slug),
    CityRepository.getBySlug(sub),
  ])
  if (categoryFirst && cityForCategoryFirst) {
    return { category: categoryFirst, city: cityForCategoryFirst, order: 'category-first' }
  }

  const [cityFirst, categoryForCityFirst] = await Promise.all([
    CityRepository.getBySlug(slug),
    CategoryRepository.getBySlug(sub),
  ])
  if (cityFirst && categoryForCityFirst) {
    return { category: categoryForCityFirst, city: cityFirst, order: 'city-first' }
  }

  return null
}

/** Ne génère que les couples réellement peuplés, dans les deux ordres. */
export async function generateStaticParams() {
  const pairs = await BusinessRepository.getCategoryCityPairs()

  return pairs.flatMap((pair) => [
    { slug: pair.categorySlug, sub: pair.citySlug },
    { slug: pair.citySlug, sub: pair.categorySlug },
  ])
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug, sub } = await params
  const resolved = await resolvePair(slug, sub)

  if (!resolved) {
    return buildMetadata({
      title: 'Page introuvable',
      description: 'Cette page n’existe pas.',
      path: `/${slug}/${sub}`,
      noIndex: true,
    })
  }

  const { category, city } = resolved
  const page = parsePage(firstValue((await searchParams).page))
  const businesses = await BusinessRepository.find({ categorySlug: category.slug, citySlug: city.slug })

  // Les deux ordres servent le même contenu : l'URL `catégorie/ville` est
  // déclarée canonique pour les deux, afin d'éviter toute duplication.
  // C'est aussi le seul ordre soumis dans le sitemap.
  const canonicalPath = routes.categoryInCity(category.slug, city.slug)

  return buildMetadata({
    title: `${categoryCityTitle(category, city)}${page > 1 ? ` — page ${page}` : ''}`,
    description: categoryCityDescription(category, city, businesses.length),
    path: page > 1 ? `${canonicalPath}?page=${page}` : canonicalPath,
    keywords: [...category.keywords.map((keyword) => `${keyword} ${city.name}`), city.name],
  })
}

export default async function CategoryCityPage({ params, searchParams }: PageProps) {
  const { slug, sub } = await params
  const resolved = await resolvePair(slug, sub)

  if (!resolved) notFound()

  const { category, city } = resolved
  const now = new Date()
  const rawSearchParams = await searchParams
  const page = parsePage(firstValue(rawSearchParams.page))
  const sortParam = firstValue(rawSearchParams.tri) || 'pertinence'

  const [allCategories, allCities, result] = await Promise.all([
    CategoryRepository.getAllWithCounts(),
    CityRepository.getAllWithCounts(),
    BusinessRepository.search({
      categorySlug: category.slug,
      citySlug: city.slug,
      sort: parseSort(sortParam),
      page,
      perPage: PER_PAGE,
    }),
  ])

  const categoryLabels = buildCategoryLabels(allCategories)
  const openingStatuses = buildOpeningStatuses(result.items, now)
  const basePath = `/${slug}/${sub}`

  const buildPageHref = (targetPage: number) => {
    const qs = buildQueryString({
      tri: sortParam === 'pertinence' ? undefined : sortParam,
      page: targetPage > 1 ? targetPage : undefined,
    })
    return qs ? `${basePath}?${qs}` : basePath
  }

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: category.pluralName, href: routes.category(category.slug) },
    { label: city.name, href: routes.city(city.slug) },
    { label: `${category.pluralName} à ${city.name}` },
  ]

  const faqItems = [
    {
      question: `Combien de ${category.pluralName.toLowerCase()} sont référencés à ${city.name} ?`,
      answer: `L’annuaire recense ${formatNumber(result.total)} ${category.pluralName.toLowerCase()} à ${city.name} (${city.departmentCode}), avec leurs coordonnées, horaires et avis clients.`,
    },
    {
      question: `Comment sont classés les ${category.pluralName.toLowerCase()} à ${city.name} ?`,
      answer:
        'Le classement par défaut combine la note moyenne et le nombre d’avis reçus, afin de limiter l’effet des établissements ayant très peu d’avis. Vous pouvez à tout moment trier par ordre alphabétique, par note ou par nombre d’avis.',
    },
    ...category.faq.slice(0, 2),
  ]

  const linkSections: LinkSection[] = [
    {
      title: `${category.pluralName} dans d’autres villes`,
      links: allCities
        .filter((item) => item.slug !== city.slug)
        .map((item) => ({
          href: routes.categoryInCity(category.slug, item.slug),
          label: `${category.pluralName} à ${item.name}`,
        })),
    },
    {
      title: `Autres métiers à ${city.name}`,
      links: allCategories
        .filter((item) => item.slug !== category.slug)
        .map((item) => ({
          href: routes.categoryInCity(item.slug, city.slug),
          label: `${item.pluralName} à ${city.name}`,
        })),
    },
    {
      title: 'Pages associées',
      links: [
        { href: routes.category(category.slug), label: `Tous les ${category.pluralName.toLowerCase()}` },
        { href: routes.city(city.slug), label: `Tous les professionnels à ${city.name}` },
        { href: routes.businesses(), label: 'Toutes les entreprises' },
      ],
    },
  ]

  return (
    <>
      <DirectoryPage
        breadcrumbItems={breadcrumbItems}
        icon={category.icon}
        heading={`${category.pluralName} à ${city.name}`}
        lead={`${formatNumber(result.total)} ${category.pluralName.toLowerCase()} référencés à ${city.name} (${city.departmentCode}), classés par note et nombre d’avis. ${category.tagline}.`}
        editorial={
          <>
            <h2 className="text-xl font-bold text-ink-900">
              Trouver un {category.name.toLowerCase()} à {city.name}
            </h2>
            <p>
              {city.name}
              {city.population !== undefined && <>, {formatNumber(city.population)} habitants</>}
              {city.region && <> en région {city.region}</>}, compte un tissu dense de professionnels. Cette
              page regroupe les {category.pluralName.toLowerCase()} référencés sur la commune, avec pour
              chacun ses coordonnées, ses horaires d’ouverture, ses prestations et les avis publiés par ses
              clients.
            </p>
            <p>
              {city.districts?.length ? (
                <>Les quartiers les mieux couverts sont {city.districts.slice(0, 4).join(', ')}. </>
              ) : null}
              Consultez également les {category.pluralName.toLowerCase()} dans les villes voisines, ou les
              autres métiers disponibles à {city.name}.
            </p>
          </>
        }
        businesses={result.items}
        categoryLabels={categoryLabels}
        openingStatuses={openingStatuses}
        total={result.total}
        currentPage={result.page}
        totalPages={result.totalPages}
        buildPageHref={buildPageHref}
        sortAction={basePath}
        sortValue={sortParam}
        sortOptions={SORT_OPTIONS}
        linkSections={linkSections}
        faqItems={faqItems}
        emptyAction={{ label: `Voir tous les ${category.pluralName.toLowerCase()}`, href: routes.category(category.slug) }}
      />

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbItems),
          itemListJsonLd(result.items, `${category.pluralName} à ${city.name}`),
          faqJsonLd(faqItems),
        ]}
      />
    </>
  )
}
