import { siteConfig } from './site'
import { absoluteUrl, routes } from './routes'
import type { Business, BreadcrumbItem, Category, FaqItem, Post, Review } from '@/types'
import { DAY_ORDER, SCHEMA_DAYS } from '@/utils/opening-hours'

/** Objet JSON-LD générique (sérialisé dans un `<script type="application/ld+json">`). */
export type JsonLd = Record<string, unknown>

/**
 * Correspondance catégorie → type Schema.org.
 *
 * Les slugs proviennent de l'API annuaire (dérivés des catégories Google) :
 * la recherche se fait par mot-clé, pour couvrir les libellés non anticipés.
 */
const SCHEMA_TYPE_RULES: { keywords: string[]; type: string }[] = [
  { keywords: ['restaurant', 'pizzeria', 'brasserie'], type: 'Restaurant' },
  { keywords: ['boulanger'], type: 'Bakery' },
  { keywords: ['plombier', 'plomberie'], type: 'Plumber' },
  { keywords: ['electricien', 'electricite'], type: 'Electrician' },
  { keywords: ['couvreur', 'toiture'], type: 'RoofingContractor' },
  { keywords: ['peintre', 'peinture'], type: 'HousePainter' },
  { keywords: ['serrurier', 'serrurerie'], type: 'Locksmith' },
  { keywords: ['macon', 'maconnerie', 'construction', 'renovation'], type: 'GeneralContractor' },
  { keywords: ['coiffeur', 'coiffure', 'barbier'], type: 'HairSalon' },
  { keywords: ['esthetique', 'institut', 'ongle', 'spa'], type: 'BeautySalon' },
  { keywords: ['garage', 'automobile', 'carrosserie', 'pneu'], type: 'AutoRepair' },
  { keywords: ['taxi', 'vtc', 'chauffeur'], type: 'TaxiService' },
  { keywords: ['immobilier'], type: 'RealEstateAgent' },
  { keywords: ['assurance', 'courtier'], type: 'InsuranceAgency' },
  { keywords: ['sport', 'fitness'], type: 'ExerciseGym' },
  { keywords: ['jardin', 'paysagiste', 'elagage'], type: 'LandscapingBusiness' },
  { keywords: ['nettoyage', 'proprete'], type: 'HousePainter' },
  { keywords: ['chauffage', 'climatisation'], type: 'HVACBusiness' },
  { keywords: ['medical', 'osteopathe', 'sante'], type: 'MedicalBusiness' },
]

function schemaTypeFor(categorySlug: string | null): string {
  if (!categorySlug) return 'LocalBusiness'
  const rule = SCHEMA_TYPE_RULES.find((candidate) =>
    candidate.keywords.some((keyword) => categorySlug.includes(keyword)),
  )
  return rule?.type ?? 'LocalBusiness'
}

export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.organization.legalName,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.email,
  }
}

/** `WebSite` + `SearchAction` : active la sitelinks searchbox. */
export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.lang,
    publisher: { '@id': `${siteConfig.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/entreprises?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href, siteConfig.url) } : {}),
    })),
  }
}

export function faqJsonLd(items: FaqItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

/** `ItemList` d'entreprises — pages de listing, catégorie et ville. */
export function itemListJsonLd(businesses: Business[], listName: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: businesses.length,
    itemListElement: businesses.map((business, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(routes.business(business.slug), siteConfig.url),
      name: business.name,
    })),
  }
}

/**
 * `LocalBusiness` d'une fiche.
 *
 * Seuls les champs réellement disponibles sont émis : un balisage incomplet
 * mais exact vaut mieux qu'un balisage rempli de valeurs inventées, que Google
 * sanctionne.
 *
 * `review` n'est présent qu'en mode données statiques : l'API LocalShark
 * n'expose pas le texte des avis, rendus par un widget iframe. `aggregateRating`
 * reste en revanche toujours émis, car note et volume sont connus.
 */
export function localBusinessJsonLd(
  business: Business,
  category: Category | null,
  reviews: Review[] = [],
): JsonLd {
  const url = absoluteUrl(routes.business(business.slug), siteConfig.url)
  const images = [business.coverImage, ...business.gallery.slice(0, 3)].filter(Boolean)
  // `sameAs` regroupe le site officiel et les profils sociaux.
  const sameAs = [business.website, ...Object.values(business.social)].filter(Boolean)

  const hasAddress = Boolean(business.address || business.postalCode || business.cityName)

  return {
    '@context': 'https://schema.org',
    '@type': schemaTypeFor(business.categorySlug),
    '@id': `${url}#business`,
    name: business.name,
    url,
    ...(business.legalName ? { legalName: business.legalName } : {}),
    ...(business.description ? { description: business.description } : {}),
    ...(business.phone ? { telephone: business.phone } : {}),
    ...(business.email ? { email: business.email } : {}),
    ...(images.length > 0 ? { image: images } : {}),
    ...(business.logo ? { logo: business.logo } : {}),
    ...(business.priceLevel !== undefined ? { priceRange: '€'.repeat(business.priceLevel) } : {}),
    ...(business.foundedYear !== undefined ? { foundingDate: String(business.foundedYear) } : {}),
    ...(category ? { additionalType: category.name } : {}),

    ...(hasAddress
      ? {
          address: {
            '@type': 'PostalAddress',
            ...(business.address ? { streetAddress: business.address } : {}),
            ...(business.postalCode ? { postalCode: business.postalCode } : {}),
            ...(business.cityName ? { addressLocality: business.cityName } : {}),
            addressCountry: 'FR',
          },
        }
      : {}),

    ...(business.latitude !== undefined && business.longitude !== undefined
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: business.latitude,
            longitude: business.longitude,
          },
        }
      : {}),

    ...(sameAs.length > 0 ? { sameAs } : {}),

    openingHoursSpecification: DAY_ORDER.flatMap((day) =>
      business.openingHours[day].map((range) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${SCHEMA_DAYS[day]}`,
        opens: range.open,
        closes: range.close,
      })),
    ),

    ...(business.rating !== null && business.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: business.rating,
            reviewCount: business.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),

    ...(reviews.length > 0
      ? {
          review: reviews.slice(0, 5).map((review) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: review.authorName },
            datePublished: review.publishedAt,
            ...(review.title ? { name: review.title } : {}),
            reviewBody: review.content,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: review.rating,
              bestRating: 5,
              worstRating: 1,
            },
          })),
        }
      : {}),
  }
}

/** `Article` pour une publication d'établissement. */
export function postJsonLd(post: Post, business: Business): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    ...(post.image ? { image: [post.image] } : {}),
    datePublished: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: business.name,
      url: absoluteUrl(routes.business(business.slug), siteConfig.url),
    },
    publisher: { '@id': `${siteConfig.url}/#organization` },
  }
}
