import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { icons } from '@/lib/icons'
import { Container } from '@/components/ui/Container'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { FAQ } from '@/components/ui/FAQ'
import { BusinessHeader } from '@/components/business/BusinessHeader'
import { BusinessSidebar } from '@/components/business/BusinessSidebar'
import { Gallery } from '@/components/business/Gallery'
import { BusinessMap } from '@/components/business/BusinessMap'
import { ReviewCard } from '@/components/business/ReviewCard'
import { ReviewSummary } from '@/components/business/ReviewSummary'
import { ReviewsWidget } from '@/components/business/ReviewsWidget'
import { GooglePost } from '@/components/business/GooglePost'
import { ServiceList } from '@/components/business/ServiceList'
import { BusinessGrid } from '@/components/directory/BusinessGrid'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd, faqJsonLd, localBusinessJsonLd } from '@/lib/jsonld'
import { routes } from '@/lib/routes'
import { buildMetadata, businessDescription, businessTitle } from '@/lib/seo'
import { siteConfig } from '@/lib/site'
import { buildCategoryLabels, buildOpeningStatuses, currentDayKey, hasOpeningHours } from '@/lib/view-helpers'
import { BusinessRepository, CategoryRepository, ReviewRepository } from '@/repositories'
import { refreshDirectoryIfBehind } from '@/repositories/sync'
import { formatRelativeDate, pluralize } from '@/utils/format'
import { getOpeningStatus } from '@/utils/opening-hours'

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Génère toutes les fiches au build (SSG complet). */
export async function generateStaticParams() {
  const slugs = await BusinessRepository.getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const business = await BusinessRepository.getBySlug(slug)

  if (!business) {
    return buildMetadata({
      title: 'Établissement introuvable',
      description: 'Cette fiche n’existe pas ou n’est plus référencée.',
      path: routes.business(slug),
      noIndex: true,
    })
  }

  const category = business.categorySlug ? await CategoryRepository.getBySlug(business.categorySlug) : null

  return buildMetadata({
    title: businessTitle(business, category?.name, business.cityName),
    description: businessDescription(business, category?.name, business.cityName),
    path: routes.business(business.slug),
    ...(business.coverImage ? { image: business.coverImage } : {}),
    keywords: [business.name, category?.name, business.cityName].filter((value): value is string =>
      Boolean(value),
    ),
  })
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params
  const detail = await BusinessRepository.getDetail(slug)

  if (!detail) notFound()

  const { business, reviews } = detail

  /*
    Cette page peut avoir été rendue à la demande pour une fiche créée après le
    dernier passage de l'API. Si c'est le cas, on programme le rafraîchissement
    de l'annuaire global une fois la réponse envoyée : sans quoi la fiche
    resterait absente des listings et du sitemap jusqu'à la revalidation
    horaire. Sans effet quand l'instantané est déjà à jour.
  */
  refreshDirectoryIfBehind(business.slug)

  // Les plus récents d'abord : les sources les trient déjà par date.
  const photos = detail.photos.slice(0, siteConfig.businessPage.maxPhotos)
  const posts = detail.posts.slice(0, siteConfig.businessPage.maxPosts)
  const now = new Date()

  const [category, similar, categories, breakdown] = await Promise.all([
    business.categorySlug ? CategoryRepository.getBySlug(business.categorySlug) : null,
    BusinessRepository.getSimilar(business, 3),
    CategoryRepository.getAll(),
    // Distribution reconstituée : n'a de sens qu'avec les avis natifs, le
    // widget affichant déjà sa propre synthèse.
    reviews.length > 0 ? ReviewRepository.getBreakdown(business.slug) : null,
  ])

  const status = hasOpeningHours(business) ? getOpeningStatus(business.openingHours, now) : null
  const categoryLabels = buildCategoryLabels(categories)
  const similarStatuses = buildOpeningStatuses(similar, now)

  // Toutes les catégories secondaires sont affichées, mais seules celles qui
  // existent dans le référentiel sont cliquables : l'API ne liste dans
  // `categories[]` que les catégories principales, un lien vers les autres
  // mènerait à une 404.
  const secondaryCategories = business.secondaryCategories.map((item) => ({
    ...item,
    href: categories.some((category) => category.slug === item.slug) ? routes.category(item.slug) : null,
  }))

  /*
    La FAQ réunit deux sources — les questions propres à l'établissement et
    celles de sa catégorie — qui se recoupent. La même question s'affichait
    alors deux fois, et se retrouvait déclarée en double dans le balisage
    `FAQPage`. On dédoublonne sur le libellé normalisé, en gardant la réponse
    de l'établissement : plus précise que la réponse générique du métier.
  */
  const faqItems = [...business.faq, ...(category?.faq ?? [])].filter(
    (item, index, all) =>
      all.findIndex((other) => other.question.trim().toLocaleLowerCase('fr') === item.question.trim().toLocaleLowerCase('fr')) === index,
  )

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    ...(category ? [{ label: category.name, href: routes.category(category.slug) }] : []),
    { label: business.name },
  ]

  return (
    <>
      <Container size="wide" className="py-6">
        <Breadcrumb items={breadcrumbItems} />
      </Container>

      <Container size="wide" className="pb-16">
        <BusinessHeader
          business={business}
          categoryLabel={category?.name}
          categoryHref={category ? routes.category(category.slug) : undefined}
          cityLabel={business.cityName}
          openingLabel={status?.label ?? null}
          isOpen={status?.isOpen ?? false}
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* ─────────────────────── Colonne principale ─────────────────────── */}
          <div className="min-w-0 space-y-12">
            {(business.description || business.services.length > 0) && (
              <section aria-labelledby="presentation-heading">
                <h2 id="presentation-heading" className="text-3xl font-medium text-ink-900">
                  À propos de {business.name}
                </h2>

                {business.description && (
                  <div className="mt-4 space-y-3 leading-relaxed text-ink-700">
                    {business.description.split(/\n{2,}/).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                )}

                {secondaryCategories.length > 0 && (
                  <>
                    <h3 className="mt-10 text-xl font-medium text-ink-900">Également référencé en</h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {secondaryCategories.map((item) => (
                        <li key={item.slug}>
                          {item.href ? (
                            <Link href={item.href}>
                              <Badge tone="brand">{item.name}</Badge>
                            </Link>
                          ) : (
                            <Badge>{item.name}</Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {business.services.length > 0 && (
                  <>
                    <h3 className="mt-10 text-xl font-medium text-ink-900">Prestations</h3>
                    <ServiceList services={business.services} className="mt-3" />
                  </>
                )}
              </section>
            )}

            {photos.length > 0 && (
              // L'en-tête est confié à `Gallery` : si aucune photo ne charge,
              // la section disparaît en entier plutôt que de laisser un titre
              // « Photos » au-dessus du vide.
              <Gallery
                images={photos.map((photo) => ({ url: photo.url, alt: photo.alt }))}
                heading={
                  <SectionHeading
                    title="Photos"
                    description={
                      detail.photos.length > photos.length
                        ? `Les ${photos.length} photos les plus récentes, sur ${detail.photos.length} publiées.`
                        : `${photos.length} ${pluralize(photos.length, 'photo')} ${pluralize(photos.length, 'publiée', 'publiées')} par l’établissement.`
                    }
                  />
                }
              />
            )}

            {business.latitude !== undefined && business.longitude !== undefined && (
              <section aria-labelledby="map-heading">
                <h2 id="map-heading" className="text-3xl font-medium text-ink-900">
                  Localisation
                </h2>
                <BusinessMap
                  latitude={business.latitude}
                  longitude={business.longitude}
                  label={business.name}
                  address={
                    [business.address, business.postalCode, business.cityName].filter(Boolean).join(', ') ||
                    undefined
                  }
                  embedUrl={business.mapEmbedUrl}
                  linkUrl={business.mapLinkUrl}
                  className="mt-6"
                />
              </section>
            )}

            {business.reviewCount > 0 && (
              <section aria-labelledby="reviews-heading">
                {/* Sans sous-titre : la note et le nombre d'avis figurent déjà
                    dans l'en-tête de la fiche et dans le bloc de synthèse. */}
                <SectionHeading title="Avis clients" />

                {breakdown && <ReviewSummary breakdown={breakdown} isEstimated className="mt-6" />}

                {reviews.length > 0 ? (
                  <ul className="mt-6 space-y-4">
                    {reviews.map((review) => (
                      <li key={review.id}>
                        <ReviewCard
                          review={review}
                          relativeDate={formatRelativeDate(review.publishedAt, now)}
                        />
                      </li>
                    ))}
                  </ul>
                ) : business.reviewsWidgetUrl ? (
                  // L'API n'expose pas le texte des avis : ils sont rendus par
                  // le widget LocalShark, embarqué en iframe.
                  <ReviewsWidget
                    src={business.reviewsWidgetUrl}
                    title={`Avis Google de ${business.name}`}
                    className="mt-6"
                  />
                ) : null}
              </section>
            )}

            {posts.length > 0 && (
              <section aria-labelledby="posts-heading">
                <SectionHeading
                  title="Publications"
                  description={
                    detail.posts.length > posts.length
                      ? `Les ${posts.length} publications les plus récentes, sur ${detail.posts.length}.`
                      : 'Actualités, offres et événements de l’établissement.'
                  }
                />
                <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                  {posts.map((post) => (
                    <li key={post.id} className="flex">
                      <GooglePost post={post} businessWebsite={business.website} className="w-full" />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {faqItems.length > 0 && (
              <FAQ items={faqItems} title={`Questions fréquentes sur ${business.name}`} />
            )}
          </div>

          {/* ──────────────────────── Colonne latérale ──────────────────────── */}
          <BusinessSidebar
            business={business}
            openingLabel={status?.label ?? null}
            isOpen={status?.isOpen ?? false}
            todayKey={currentDayKey(now)}
            className="lg:sticky lg:top-24 lg:h-fit"
          />
        </div>

        {similar.length > 0 && category && (
          <section className="mt-16 border-t border-ink-200 pt-12" aria-labelledby="similar-heading">
            <SectionHeading
              title={`Autres ${category.pluralName.toLowerCase()}`}
              description="Des établissements comparables à proximité."
              action={{ label: 'Voir tout', href: routes.category(category.slug) }}
            />
            <BusinessGrid
              businesses={similar}
              categoryLabels={categoryLabels}
              openingStatuses={similarStatuses}
              columns={3}
              className="mt-8"
            />
          </section>
        )}
      </Container>

      <JsonLd
        data={[
          localBusinessJsonLd(business, category, reviews),
          breadcrumbJsonLd(breadcrumbItems),
          ...(faqItems.length > 0 ? [faqJsonLd(faqItems)] : []),
        ]}
      />
    </>
  )
}
