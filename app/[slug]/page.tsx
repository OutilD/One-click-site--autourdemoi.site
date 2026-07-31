import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DirectoryPage, type LinkSection } from '@/components/directory/DirectoryPage'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd } from '@/lib/jsonld'
import { routes } from '@/lib/routes'
import { buildMetadata, categoryDescription, categoryTitle } from '@/lib/seo'
import { buildQueryString, firstValue, parsePage, parseSort } from '@/lib/search-params'
import { siteConfig } from '@/lib/site'
import { SORT_OPTIONS, buildCategoryLabels, buildOpeningStatuses } from '@/lib/view-helpers'
import { BusinessRepository, CategoryRepository } from '@/repositories'
import { formatNumber } from '@/utils/format'

const PER_PAGE = siteConfig.defaultPerPage

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Une page par catégorie référencée : `/plombiers`, `/barbier`… */
export async function generateStaticParams() {
  const slugs = await CategoryRepository.getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await CategoryRepository.getBySlug(slug)

  if (!category) {
    return buildMetadata({
      title: 'Page introuvable',
      description: 'Cette page n’existe pas.',
      path: `/${slug}`,
      noIndex: true,
    })
  }

  const page = parsePage(firstValue((await searchParams).page))
  const businesses = await BusinessRepository.getByCategory(category.slug)

  return buildMetadata({
    title: `${categoryTitle(category)}${page > 1 ? ` — page ${page}` : ''}`,
    description: categoryDescription(category, businesses.length),
    path: page > 1 ? `/${slug}?page=${page}` : `/${slug}`,
    keywords: category.keywords,
  })
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const category = await CategoryRepository.getBySlug(slug)

  if (!category) notFound()

  const now = new Date()
  const rawSearchParams = await searchParams
  const page = parsePage(firstValue(rawSearchParams.page))
  const sortParam = firstValue(rawSearchParams.tri) || 'pertinence'

  const [allCategories, result] = await Promise.all([
    CategoryRepository.getAllWithCounts(),
    BusinessRepository.search({
      categorySlug: category.slug,
      sort: parseSort(sortParam),
      page,
      perPage: PER_PAGE,
    }),
  ])

  const categoryLabels = buildCategoryLabels(allCategories)
  const openingStatuses = buildOpeningStatuses(result.items, now)

  const buildPageHref = (targetPage: number) => {
    const qs = buildQueryString({
      tri: sortParam === 'pertinence' ? undefined : sortParam,
      page: targetPage > 1 ? targetPage : undefined,
    })
    return qs ? `/${slug}?${qs}` : `/${slug}`
  }

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Catégories', href: routes.categories() },
    { label: category.pluralName, href: routes.category(category.slug) },
  ]

  const linkSections: LinkSection[] = [
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
        { href: routes.categories(), label: 'Toutes les catégories' },
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
            <h2 className="text-2xl font-medium text-ink-900">
              Comment choisir parmi {formatNumber(result.total)} {category.pluralName.toLowerCase()} ?
            </h2>
            <p>
              Chaque fiche de cette catégorie regroupe les informations essentielles : coordonnées, horaires
              d’ouverture, prestations proposées, photos et avis clients. La note affichée correspond à la
              moyenne de l’ensemble des avis reçus par l’établissement.
            </p>
            <p>
              Pour affiner votre recherche, utilisez le tri par note et par nombre d’avis. Un établissement
              disposant d’un grand nombre d’avis offre généralement une meilleure visibilité sur la régularité
              de ses prestations.
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
