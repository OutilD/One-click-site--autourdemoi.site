import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SearchBar } from '@/components/search/SearchBar'
import { CategoryCard } from '@/components/directory/CategoryCard'
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
import { buildCategoryLabels, buildOpeningStatuses } from '@/lib/view-helpers'
import {
  BusinessRepository,
  CategoryRepository,
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

  const [categories, featured, topRated, latestReviews, latestPosts, latestPhotos, totalBusinesses] =
    await Promise.all([
      CategoryRepository.getAllWithCounts(),
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
      <section>
        {/*
          Bandeau jaune : titre et recherche.

          Un aplat franc, coupé net par un filet noir — la couverture de
          l'annuaire. La barre de recherche est posée dessus en blanc : sur
          jaune, un champ blanc se lit immédiatement comme la zone à remplir,
          ce qu'aucun contour ne dirait aussi vite.
        */}
        <div className="border-b-2 border-ink-900 bg-brand-400">
          <Container size="wide" className="py-14 sm:py-20">
            {/* À partir de `lg`, l'index des catégories occupe la moitié droite
                du bandeau : sur grand écran, l'aplat seul laissait un vide que
                rien ne justifiait sur un annuaire. */}
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
              <div>
                <div className="max-w-2xl">
                  {/* Sur l'aplat jaune, le sur-titre passe en noir : le gris de
                      l'`eyebrow` par défaut y tomberait à 1.6:1. */}
                  <p className="eyebrow rise text-ink-900">L’annuaire des commerces et services</p>

                  <h1
                    className="rise mt-4 text-[2.5rem] font-bold leading-[1.05] text-ink-900 sm:text-[3.25rem]"
                    style={{ animationDelay: '60ms' }}
                  >
                    Le bon professionnel,
                    <br />
                    près de chez vous
                  </h1>

                  <p
                    className="rise mt-5 max-w-xl text-lg leading-relaxed text-ink-800"
                    style={{ animationDelay: '120ms' }}
                  >
                    Restaurants, artisans, commerces et services : comparez les avis, les horaires et les
                    coordonnées de milliers d’établissements locaux.
                  </p>
                </div>

                <div className="rise mt-8" style={{ animationDelay: '180ms' }}>
                  <SearchBar size="lg" />

                  <p className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium text-ink-900">
                    <span className="mr-1">Recherches fréquentes</span>
                    {categories.slice(0, 4).map((category) => (
                      <Link
                        key={category.slug}
                        href={routes.category(category.slug)}
                        className="rounded border border-ink-900 px-2.5 py-1 transition-colors duration-150 hover:bg-ink-900 hover:text-brand-400"
                      >
                        {category.pluralName.toLowerCase()}
                      </Link>
                    ))}
                  </p>
                </div>
              </div>

              {/* Index des métiers — le sommaire de l'annuaire, en noir sur
                  jaune. Masqué sous `lg`, où la grille de la section 01 rend
                  le même service sans dupliquer les liens. */}
              <nav aria-label="Index des catégories" className="hidden lg:block">
                <p className="eyebrow text-ink-900">Les métiers les plus consultés</p>
                <ul className="mt-4 border-t-2 border-ink-900">
                  {categories.slice(0, 8).map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={routes.category(category.slug)}
                        className="flex items-baseline justify-between gap-4 border-b border-ink-900/25 py-2.5 text-sm font-medium text-ink-900 transition-colors duration-150 hover:bg-ink-900 hover:text-brand-400"
                      >
                        <span className="truncate">{category.pluralName}</span>
                        <span className="shrink-0 tabular-nums">{formatNumber(category.businessCount)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </Container>
        </div>

        {/* Bande de chiffres : l'ours de l'annuaire, pleine largeur sous le
            bandeau. Séparateurs verticaux plutôt que cartes — on annonce un
            volume, on n'ouvre pas trois blocs de plus. */}
        <div className="border-b border-ink-200 bg-ink-50">
          <Container size="wide">
            <dl className="grid grid-cols-2 divide-ink-200 sm:grid-cols-3 sm:divide-x">
              {[
                { value: formatNumber(totalBusinesses), label: 'Établissements référencés' },
                { value: formatNumber(categories.length), label: 'Catégories d’activité' },
                { value: formatNumber(totalReviews), label: 'Avis publiés' },
              ].map((stat, index) => (
                <div key={stat.label} className={index === 0 ? 'py-5 sm:pr-8' : 'py-5 sm:px-8'}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="flex flex-wrap items-baseline gap-x-2.5">
                    <span className="text-2xl font-bold tabular-nums text-ink-900">{stat.value}</span>
                    <span className="text-sm text-ink-500">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </div>
      </section>

      {/* ───────────────────────── Catégories populaires ──────────────────── */}
      <Container size="wide" as="section" className="py-20">
        <SectionHeading
          eyebrow="01 — Parcourir"
          title="Catégories populaires"
          description="Parcourez l’annuaire par métier et trouvez rapidement le professionnel qu’il vous faut."
          action={{ label: 'Toutes les catégories', href: routes.categories() }}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <Container size="wide" as="section" className="pb-20">
        <hr className="rule-heavy mb-20" />
        <SectionHeading
          eyebrow="02 — Sélection"
          title="Entreprises mises en avant"
          description="Une sélection d’établissements plébiscités par leurs clients."
          action={{ label: 'Voir toutes les entreprises', href: routes.businesses() }}
        />
        <BusinessGrid
          businesses={highlighted}
          categoryLabels={categoryLabels}
          openingStatuses={openingStatuses}
          columns={3}
          className="mt-10"
        />
        <JsonLd data={itemListJsonLd(highlighted, 'Entreprises mises en avant')} />
      </Container>

      {/* ───────────────────────────── Derniers avis ──────────────────────── */}
      {/* Masqué en mode API : LocalShark n'expose pas le texte des avis,
          ils ne sont lisibles que dans le widget de chaque fiche. */}
      {latestReviews.length > 0 && (
        <section className="relative overflow-hidden border-y border-ink-200 bg-ink-100 py-20">
          <Container size="wide" className="relative">
            <SectionHeading
              eyebrow="03 — Avis"
              title="Derniers avis publiés"
              description="Ce que les clients disent des établissements référencés."
            />
            <ul className="mt-10 grid gap-5 lg:grid-cols-3">
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
        <Container size="wide" as="section" className="py-20">
          <SectionHeading
            eyebrow="04 — Actualités"
            title="Dernières publications"
            description="Actualités, offres et événements publiés par les établissements."
          />
          <ul className="mt-10 grid gap-5 lg:grid-cols-3">
            {latestPosts.map((post) => {
              const business = businessById.get(post.businessId)

              return (
                <li key={post.id} className="flex">
                  <GooglePost
                    post={post}
                    businessName={business?.name}
                    businessHref={business ? routes.business(business.slug) : undefined}
                    businessWebsite={business?.website}
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
        // L'en-tête et le filet sont confiés à `PhotoGrid` : si aucune photo ne
        // charge, la section disparaît en entier plutôt que de laisser un titre
        // au-dessus du vide.
        <PhotoGrid
          photos={latestPhotos}
          columns={4}
          className="pb-20"
          heading={
            <>
              <hr className="rule-heavy mb-20" />
              <SectionHeading
                eyebrow="05 — En images"
                title="Dernières photos"
                description="Un aperçu des établissements référencés dans l’annuaire."
              />
            </>
          }
        />
      )}

      {/* ──────────────────────────────── FAQ ─────────────────────────────── */}
      <Container size="wide" as="section" className="pb-24">
        <FAQ items={HOME_FAQ} className="max-w-3xl" />
        <JsonLd data={faqJsonLd(HOME_FAQ)} />
      </Container>
    </>
  )
}
