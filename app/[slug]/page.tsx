import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DirectoryPage, type LinkSection } from '@/components/directory/DirectoryPage'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd } from '@/lib/jsonld'
import { routes } from '@/lib/routes'
import {
  buildMetadata,
  categoryDescription,
  categoryTitle,
  cityDescription,
  cityTitle,
} from '@/lib/seo'
import { buildQueryString, firstValue, parsePage, parseSort } from '@/lib/search-params'
import { SORT_OPTIONS, buildCategoryLabels, buildOpeningStatuses, cityLabel } from '@/lib/view-helpers'
import { BusinessRepository, CategoryRepository, CityRepository } from '@/repositories'
import { siteConfig } from '@/lib/site'
import type { Category, City } from '@/types'
import { formatNumber } from '@/utils/format'

const PER_PAGE = siteConfig.defaultPerPage

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Résolution d'un slug racine.
 *
 * Une même position d'URL sert les catégories (`/restaurants`) et les villes
 * (`/paris`). En cas de collision, la catégorie l'emporte — les slugs des deux
 * référentiels doivent donc rester disjoints.
 */
async function resolveSlug(slug: string): Promise<
  { kind: 'category'; category: Category } | { kind: 'city'; city: City } | null
> {
  const category = await CategoryRepository.getBySlug(slug)
  if (category) return { kind: 'category', category }

  const city = await CityRepository.getBySlug(slug)
  if (city) return { kind: 'city', city }

  return null
}

export async function generateStaticParams() {
  const [categorySlugs, citySlugs] = await Promise.all([
    CategoryRepository.getAllSlugs(),
    CityRepository.getAllSlugs(),
  ])

  return [...categorySlugs, ...citySlugs].map((slug) => ({ slug }))
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const resolved = await resolveSlug(slug)

  if (!resolved) {
    return buildMetadata({
      title: 'Page introuvable',
      description: 'Cette page n’existe pas.',
      path: `/${slug}`,
      noIndex: true,
    })
  }

  const page = parsePage(firstValue((await searchParams).page))
  const pageSuffix = page > 1 ? ` — page ${page}` : ''
  const path = page > 1 ? `/${slug}?page=${page}` : `/${slug}`

  if (resolved.kind === 'category') {
    const businesses = await BusinessRepository.getByCategory(resolved.category.slug)
    return buildMetadata({
      title: `${categoryTitle(resolved.category)}${pageSuffix}`,
      description: categoryDescription(resolved.category, businesses.length),
      path,
      keywords: resolved.category.keywords,
    })
  }

  const businesses = await BusinessRepository.getByCity(resolved.city.slug)
  return buildMetadata({
    title: `${cityTitle(resolved.city)}${pageSuffix}`,
    description: cityDescription(resolved.city, businesses.length),
    path,
    image: resolved.city.coverImage,
  })
}

export default async function SlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const resolved = await resolveSlug(slug)

  if (!resolved) notFound()

  const now = new Date()
  const rawSearchParams = await searchParams
  const page = parsePage(firstValue(rawSearchParams.page))
  const sortParam = firstValue(rawSearchParams.tri) || 'pertinence'

  const [allCategories, allCities] = await Promise.all([
    CategoryRepository.getAllWithCounts(),
    CityRepository.getAllWithCounts(),
  ])

  const categoryLabels = buildCategoryLabels(allCategories)

  const result = await BusinessRepository.search({
    ...(resolved.kind === 'category'
      ? { categorySlug: resolved.category.slug }
      : { citySlug: resolved.city.slug }),
    sort: parseSort(sortParam),
    page,
    perPage: PER_PAGE,
  })

  const openingStatuses = buildOpeningStatuses(result.items, now)

  const buildPageHref = (targetPage: number) => {
    const qs = buildQueryString({
      tri: sortParam === 'pertinence' ? undefined : sortParam,
      page: targetPage > 1 ? targetPage : undefined,
    })
    return qs ? `/${slug}?${qs}` : `/${slug}`
  }

  // ─────────────────────────── Page catégorie ───────────────────────────
  if (resolved.kind === 'category') {
    const { category } = resolved

    const breadcrumbItems = [
      { label: 'Accueil', href: '/' },
      { label: 'Catégories', href: routes.categories() },
      { label: category.pluralName, href: routes.category(category.slug) },
    ]

    const linkSections: LinkSection[] = [
      {
        title: `${category.pluralName} par ville`,
        links: allCities.map((city) => ({
          href: routes.categoryInCity(category.slug, city.slug),
          label: `${category.pluralName} à ${city.name}`,
        })),
      },
      {
        title: 'Autres catégories',
        links: allCategories
          .filter((item) => item.slug !== category.slug)
          .map((item) => ({ href: routes.category(item.slug), label: item.pluralName })),
      },
      {
        title: 'Explorer l’annuaire',
        links: [
          { href: routes.businesses(), label: 'Toutes les entreprises' },
          { href: routes.cities(), label: 'Toutes les villes' },
          { href: routes.businesses({ categorie: category.slug, tri: 'note' }), label: 'Les mieux notés' },
        ],
      },
    ]

    return (
      <>
        <DirectoryPage
          breadcrumbItems={breadcrumbItems}
          icon={category.icon}
          heading={`${category.pluralName} : trouvez le bon professionnel`}
          lead={category.description}
          editorial={
            <>
              <h2 className="text-xl font-bold text-ink-900">
                Comment choisir parmi {formatNumber(result.total)} {category.pluralName.toLowerCase()} ?
              </h2>
              <p>
                Chaque fiche de cette catégorie regroupe les informations essentielles : coordonnées, horaires
                d’ouverture, prestations proposées, photos et avis clients. La note affichée correspond à la
                moyenne de l’ensemble des avis reçus par l’établissement.
              </p>
              <p>
                Pour affiner votre recherche, sélectionnez votre ville dans la liste ci-dessous ou utilisez le
                tri par note et par nombre d’avis. Un établissement disposant d’un grand nombre d’avis offre
                généralement une meilleure visibilité sur la régularité de ses prestations.
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
          sortAction={`/${slug}`}
          sortValue={sortParam}
          sortOptions={SORT_OPTIONS}
          linkSections={linkSections}
          faqItems={category.faq}
          emptyAction={{ label: 'Voir toutes les entreprises', href: routes.businesses() }}
        />

        <JsonLd
          data={[
            breadcrumbJsonLd(breadcrumbItems),
            itemListJsonLd(result.items, category.pluralName),
            faqJsonLd(category.faq),
          ]}
        />
      </>
    )
  }

  // ───────────────────────────── Page ville ─────────────────────────────
  const { city } = resolved

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Villes', href: routes.cities() },
    { label: city.name, href: routes.city(city.slug) },
  ]

  const cityFaq = [
    {
      question: `Combien d’établissements sont référencés à ${city.name} ?`,
      answer: `L’annuaire recense actuellement ${formatNumber(result.total)} établissements à ${city.name}, répartis dans ${allCategories.length} catégories d’activité.`,
    },
    ...(city.districts?.length
      ? [
          {
            question: `Quels quartiers de ${city.name} sont couverts ?`,
            answer: `L’ensemble de la commune est couvert, notamment ${city.districts.slice(0, 4).join(', ')} et les quartiers limitrophes.`,
          },
        ]
      : []),
    {
      question: `Comment trouver un professionnel ouvert maintenant à ${city.name} ?`,
      answer:
        'Chaque fiche affiche un indicateur d’ouverture ainsi que les horaires détaillés jour par jour. Les horaires proviennent de la fiche établissement et sont mis à jour régulièrement.',
    },
  ]

  const linkSections: LinkSection[] = [
    {
      title: `Métiers à ${city.name}`,
      links: allCategories.map((category) => ({
        href: routes.cityCategory(city.slug, category.slug),
        label: `${category.pluralName} à ${city.name}`,
      })),
    },
    {
      title: 'Autres villes',
      links: allCities
        .filter((item) => item.slug !== city.slug)
        .map((item) => ({ href: routes.city(item.slug), label: item.name })),
    },
    {
      title: 'Explorer l’annuaire',
      links: [
        { href: routes.businesses(), label: 'Toutes les entreprises' },
        { href: routes.categories(), label: 'Toutes les catégories' },
        { href: routes.businesses({ ville: city.slug, tri: 'note' }), label: 'Les mieux notés' },
      ],
    },
  ]

  return (
    <>
      <DirectoryPage
        breadcrumbItems={breadcrumbItems}
        heading={`Professionnels et commerces à ${city.name}`}
        lead={
          city.description ??
          `${formatNumber(result.total)} établissements référencés à ${city.name}, avec leurs coordonnées, horaires d’ouverture et avis clients.`
        }
        editorial={
          <>
            <h2 className="text-xl font-bold text-ink-900">
              L’annuaire des professionnels de {cityLabel(city)}
            </h2>
            <p>
              {/* Les données géographiques dépendent du code postal : on ne
                  rédige que ce qui est réellement connu. */}
              {city.name}
              {city.population !== undefined && <> compte {formatNumber(city.population)} habitants et</>}
              {city.department ? (
                <>
                  {' '}
                  se situe dans le département {city.department}
                  {city.departmentCode ? ` (${city.departmentCode})` : ''}
                  {city.region ? `, en région ${city.region}` : ''}.
                </>
              ) : (
                <> est couverte par l’annuaire.</>
              )}{' '}
              {formatNumber(result.total)} établissements y sont référencés, couvrant{' '}
              {allCategories.length} catégories d’activité.
            </p>
            {city.districts?.length ? (
              <p>
                Les quartiers les plus représentés sont {city.districts.join(', ')}. Sélectionnez un métier
                ci-dessous pour accéder directement aux professionnels concernés.
              </p>
            ) : (
              <p>
                Sélectionnez un métier ci-dessous pour accéder directement aux professionnels concernés, ou
                consultez la liste complète des établissements de la commune.
              </p>
            )}
          </>
        }
        businesses={result.items}
        categoryLabels={categoryLabels}
        openingStatuses={openingStatuses}
        total={result.total}
        currentPage={result.page}
        totalPages={result.totalPages}
        buildPageHref={buildPageHref}
        sortAction={`/${slug}`}
        sortValue={sortParam}
        sortOptions={SORT_OPTIONS}
        linkSections={linkSections}
        faqItems={cityFaq}
        emptyAction={{ label: 'Voir toutes les entreprises', href: routes.businesses() }}
      />

      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbItems),
          itemListJsonLd(result.items, `Établissements à ${city.name}`),
          faqJsonLd(cityFaq),
        ]}
      />
    </>
  )
}
