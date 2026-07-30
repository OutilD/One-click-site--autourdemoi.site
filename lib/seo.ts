import type { Metadata } from 'next'
import { siteConfig } from './site'
import { absoluteUrl } from './routes'
import type { Business, Category } from '@/types'
import { formatRating, truncate } from '@/utils/format'

export interface MetadataInput {
  title: string
  description: string
  /** Chemin relatif, utilisé pour l'URL canonique. */
  path: string
  image?: string
  /** `article` pour les publications, `website` pour le reste. */
  type?: 'website' | 'article'
  publishedTime?: string
  /** Empêche l'indexation (pages de filtres, pagination profonde…). */
  noIndex?: boolean
  keywords?: string[]
}

/** Construit un objet `Metadata` Next.js complet (canonical + OpenGraph + Twitter). */
export function buildMetadata({
  title,
  description,
  path,
  image,
  type = 'website',
  publishedTime,
  noIndex = false,
  keywords,
}: MetadataInput): Metadata {
  const url = absoluteUrl(path, siteConfig.url)
  const ogImage = image ?? absoluteUrl('/opengraph-image', siteConfig.url)

  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: url },
    ...(noIndex
      ? { robots: { index: false, follow: true } }
      : { robots: { index: true, follow: true, 'max-image-preview': 'large' as const } }),
    openGraph: {
      type,
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      site: siteConfig.twitterHandle,
    },
  }
}

/*
 * Les titres ci-dessous n'incluent PAS le nom du site : le template défini
 * dans `app/layout.tsx` (`%s | Autour de Moi`) l'ajoute automatiquement à
 * toutes les pages des segments enfants.
 */

/** Balise `<title>` d'une fiche entreprise. */
export function businessTitle(business: Business, categoryName?: string, areaName?: string | null): string {
  const parts = [categoryName, areaName].filter(Boolean).join(' à ')
  return parts ? `${business.name} — ${parts}` : business.name
}

/** Meta description d'une fiche entreprise, sous la limite d'affichage SERP. */
export function businessDescription(
  business: Business,
  categoryName?: string,
  areaName?: string | null,
): string {
  const identity = [business.name, categoryName?.toLowerCase()].filter(Boolean).join(', ')
  const place = [business.address, [business.postalCode, business.cityName].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ')

  const ratingPart =
    business.rating !== null ? `Note ${formatRating(business.rating)}/5 sur ${business.reviewCount} avis. ` : ''

  const location = place || (areaName ? `Intervient à ${areaName}.` : '')

  return truncate(
    `${identity}${location ? ` — ${location}` : ''}. ${ratingPart}Horaires, téléphone, photos et avis clients.`,
    300,
  )
}

export function categoryTitle(category: Category): string {
  return `${category.pluralName} : les meilleurs professionnels près de chez vous`
}

export function categoryDescription(category: Category, count: number): string {
  return `${count} ${category.pluralName.toLowerCase()} référencés avec avis clients, horaires et coordonnées. ${category.tagline}.`
}

