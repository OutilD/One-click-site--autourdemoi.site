import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SearchBar } from '@/components/search/SearchBar'
import { CategoryCard } from '@/components/directory/CategoryCard'
import { CityCard } from '@/components/directory/CityCard'
import { BusinessGrid } from '@/components/directory/BusinessGrid'
import { ReviewCard } from '@/components/business/ReviewCard'
import { GooglePost } from '@/components/business/GooglePost'
import { PhotoGrid } from '@/components/business/PhotoGrid'
import { FAQ } from '@/components/ui/FAQ'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqJsonLd, itemListJsonLd } from '@/lib/jsonld'
import { routes } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo'
import { siteConfig } from '@/lib/site'
import { buildCategoryLabels, buildOpeningStatuses, toSelectOptions } from '@/lib/view-helpers'
import {
  BusinessRepository,
  CategoryRepository,
  CityRepository,
  PhotoRepository,
  PostRepository,
  ReviewRepository,
} from '@/repositories'
import { formatNumber, formatRelativeDate } from '@/utils/format'

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: '/',
})

const HOME_FAQ = [
  {
    question: 'Comment fonctionne l’annuaire Autour de Moi ?',
    answer:
      'Chaque établissement dispose d’une fiche regroupant ses coordonnées, ses horaires, ses prestations, ses photos, ses publications et les avis de ses clients. Vous pouvez rechercher par métier, par ville, ou combiner les deux.',
  },
  {
    question: 'Les avis publiés sont-ils vérifiés ?',
    answer:
      'Les avis proviennent des fiches établissement publiques et sont affichés tels quels, avec la réponse du professionnel lorsqu’elle existe. La note affichée sur chaque fiche correspond à la moyenne de l’ensemble des avis reçus.',
  },
  {
    question: 'Comment référencer mon entreprise ?',
    answer:
      'L’annuaire s’appuie sur les fiches établissement existantes. Si votre entreprise dispose d’une fiche à jour, elle est susceptible d’être référencée automatiquement dans les catégories et villes couvertes.',
  },
  {
    question: 'Le service est-il gratuit pour les internautes ?',
    answer:
      'Oui. La consultation des fiches, des avis, des horaires et des coordonnées est entièrement gratuite et ne nécessite aucune inscription.',
  },
]

export default async function HomePage() {
  const now = new Date()

  const [categories, cities, featured, topRated, latestReviews, latestPosts, latestPhotos, totalBusinesses] =
    await Promise.all([
      CategoryRepository.getAllWithCounts(),
      CityRepository.getAllWithCounts(),
      BusinessRepository.getFeatured(6),
      BusinessRepository.find({ sort: 'rating', perPage: 6 }),
      ReviewRepository.getLatest(3),
      PostRepository.getLatest(3),
      PhotoRepository.getLatest(8),
      BusinessRepository.count(),
    ])

  const categoryLabels = buildCategoryLabels(categories)
  const highlighted = featured.length > 0 ? featured : topRated
  const openingStatuses = buildOpeningStatuses(highlighted, now)

  // Résolution des entreprises liées aux avis, publications et photos affichés.
  const relatedIds = [
    ...new Set([
      ...latestReviews.map((review) => review.businessId),
      ...latestPosts.map((post) => post.businessId),
    ]),
  ]
  const relatedBusinesses = await BusinessRepository.getByIds(relatedIds)
  const businessById = new Map(relatedBusinesses.map((business) => [business.id, business]))

  const totalReviews = await ReviewRepository.count()

  return (
    <>
      {/* ─────────────────────────────── Hero ─────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-ink-200 bg-linear-to-b from-brand-50 to-ink-50">
        <Container size="wide" className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
              {formatNumber(totalBusinesses)} établissements · {cities.length} villes ·{' '}
              {formatNumber(totalReviews)} avis
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
              Trouvez le bon professionnel <span className="text-brand-700">près de chez vous</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink-600">
              Restaurants, artisans, commerces et services : comparez les avis, les horaires et les
              coordonnées de milliers d’établissements locaux.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <SearchBar cityOptions={toSelectOptions(cities, (city) => city.name)} size="lg" />
            <p className="mt-3 text-center text-sm text-ink-500">
              Recherches fréquentes :{' '}
              {categories.slice(0, 4).map((category, index) => (
                <span key={category.slug}>
                  {index > 0 && ', '}
                  <Link href={routes.category(category.slug)} className="text-brand-700 hover:underline">
                    {category.pluralName.toLowerCase()}
                  </Link>
                </span>
              ))}
            </p>
          </div>
        </Container>
      </section>

      {/* ───────────────────────── Catégories populaires ──────────────────── */}
      <Container size="wide" as="section" className="py-14">
        <SectionHeading
          title="Catégories populaires"
          description="Parcourez l’annuaire par métier et trouvez rapidement le professionnel qu’il vous faut."
          action={{ label: 'Toutes les catégories', href: routes.categories() }}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.slug}
              name={category.pluralName}
              icon={category.icon}
              href={routes.category(category.slug)}
              businessCount={category.businessCount}
              tagline={category.tagline}
              accentColor={category.accentColor}
            />
          ))}
        </div>
      </Container>

      {/* ──────────────────────── Entreprises à la une ────────────────────── */}
      <Container size="wide" as="section" className="py-14">
        <SectionHeading
          title="Entreprises mises en avant"
          description="Une sélection d’établissements plébiscités par leurs clients."
          action={{ label: 'Voir toutes les entreprises', href: routes.businesses() }}
        />
        <BusinessGrid
          businesses={highlighted}
          categoryLabels={categoryLabels}
          openingStatuses={openingStatuses}
          columns={3}
          className="mt-8"
        />
        <JsonLd data={itemListJsonLd(highlighted, 'Entreprises mises en avant')} />
      </Container>

      {/* ─────────────────────────────── Villes ───────────────────────────── */}
      <Container size="wide" as="section" className="py-14">
        <SectionHeading
          title="Explorez par ville"
          description="L’annuaire couvre les principales agglomérations françaises."
          action={{ label: 'Toutes les villes', href: routes.cities() }}
        />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {cities.map((city) => (
            <CityCard
              key={city.slug}
              name={city.name}
              href={routes.city(city.slug)}
              image={city.coverImage}
              businessCount={city.businessCount}
              departmentCode={city.departmentCode}
            />
          ))}
        </div>
      </Container>

      {/* ───────────────────────────── Derniers avis ──────────────────────── */}
      {/* Masqué en mode API : LocalShark n'expose pas le texte des avis,
          ils ne sont lisibles que dans le widget de chaque fiche. */}
      {latestReviews.length > 0 && (
      <section className="border-y border-ink-200 bg-white py-14">
        <Container size="wide">
          <SectionHeading
            title="Derniers avis publiés"
            description="Ce que les clients disent des établissements référencés."
          />
          <ul className="mt-8 grid gap-5 lg:grid-cols-3">
            {latestReviews.map((review) => {
              const business = businessById.get(review.businessId)

              return (
                <li key={review.id} className="flex">
                  <ReviewCard
                    review={review}
                    businessName={business?.name}
                    businessHref={business ? routes.business(business.slug) : undefined}
                    relativeDate={formatRelativeDate(review.publishedAt, now)}
                    className="w-full"
                  />
                </li>
              )
            })}
          </ul>
        </Container>
      </section>
      )}

      {/* ─────────────────────── Dernières publications ───────────────────── */}
      {latestPosts.length > 0 && (
      <Container size="wide" as="section" className="py-14">
        <SectionHeading
          title="Dernières publications"
          description="Actualités, offres et événements publiés par les établissements."
        />
        <ul className="mt-8 grid gap-5 lg:grid-cols-3">
          {latestPosts.map((post) => {
            const business = businessById.get(post.businessId)

            return (
              <li key={post.id} className="flex">
                <GooglePost
                  post={post}
                  businessName={business?.name}
                  businessHref={business ? routes.business(business.slug) : undefined}
                  className="w-full"
                />
              </li>
            )
          })}
        </ul>
      </Container>
      )}

      {/* ────────────────────────── Dernières photos ──────────────────────── */}
      {latestPhotos.length > 0 && (
      <Container size="wide" as="section" className="py-14">
        <SectionHeading
          title="Dernières photos"
          description="Un aperçu des établissements référencés dans l’annuaire."
        />
        <PhotoGrid photos={latestPhotos} columns={4} className="mt-8" />
      </Container>
      )}

      {/* ──────────────────────────────── FAQ ─────────────────────────────── */}
      <Container as="section" className="py-14">
        <FAQ items={HOME_FAQ} />
        <JsonLd data={faqJsonLd(HOME_FAQ)} />
      </Container>
    </>
  )
}
