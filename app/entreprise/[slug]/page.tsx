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
import { BusinessGrid } from '@/components/directory/BusinessGrid'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd, faqJsonLd, localBusinessJsonLd } from '@/lib/jsonld'
import { routes } from '@/lib/routes'
import { buildMetadata, businessDescription, businessTitle } from '@/lib/seo'
import { buildCategoryLabels, buildOpeningStatuses, currentDayKey, hasOpeningHours } from '@/lib/view-helpers'
import { BusinessRepository, CategoryRepository, ReviewRepository } from '@/repositories'
import { formatRating, formatRelativeDate } from '@/utils/format'
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
    keywords: [business.name, category?.name, business.cityName].filter((value): value is string => Boolean(value)),
  })
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params
  const detail = await BusinessRepository.getDetail(slug)

  if (!detail) notFound()

  const { business, posts, photos, reviews } = detail
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
    href: categories.some((category) => category.slug === item.slug)
      ? routes.category(item.slug)
      : null,
  }))

  const faqItems = [...business.faq, ...(category?.faq ?? [])]

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
                <h2 id="presentation-heading" className="text-2xl font-bold tracking-tight text-ink-900">
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
                    <h3 className="mt-8 text-lg font-semibold text-ink-900">Également référencé en</h3>
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
                    <h3 className="mt-8 text-lg font-semibold text-ink-900">Prestations</h3>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {business.services.map((service) => (
                        <li
                          key={service}
                          className="flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-sm text-ink-700 ring-1 ring-ink-200"
                        >
                          <Icon icon={icons.check} className="mt-1 text-brand-600" />
                          {service}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            )}

            {photos.length > 0 && (
              <section aria-labelledby="gallery-heading">
                <SectionHeading
                  title="Photos"
                  description={`${photos.length} photos publiées par l’établissement.`}
                />
                <Gallery
                  images={photos.map((photo) => ({ url: photo.url, alt: photo.alt }))}
                  className="mt-6"
                />
              </section>
            )}

            {business.latitude !== undefined && business.longitude !== undefined && (
              <section aria-labelledby="map-heading">
                <h2 id="map-heading" className="text-2xl font-bold tracking-tight text-ink-900">
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
                <SectionHeading
                  title="Avis clients"
                  description={
                    business.rating !== null
                      ? `Note moyenne de ${formatRating(business.rating)}/5 sur ${business.reviewCount} avis.`
                      : undefined
                  }
                />

                {breakdown && <ReviewSummary breakdown={breakdown} isEstimated className="mt-6" />}

                {reviews.length > 0 ? (
                  <ul className="mt-6 space-y-4">
                    {reviews.map((review) => (
                      <li key={review.id}>
                        <ReviewCard review={review} relativeDate={formatRelativeDate(review.publishedAt, now)} />
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
                  description="Actualités, offres et événements de l’établissement."
                />
                <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                  {posts.map((post) => (
                    <li key={post.id} className="flex">
                      <GooglePost post={post} className="w-full" />
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
