/**
 * Configuration globale du site. Point unique de vérité pour le SEO,
 * les métadonnées et les URLs canoniques.
 */
export const siteConfig = {
  name: 'Autour de Moi',
  shortName: 'AutourDeMoi',
  domain: 'autourdemoi.site',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://autourdemoi.site',
  locale: 'fr_FR',
  lang: 'fr',
  tagline: 'L’annuaire des professionnels près de chez vous',
  description:
    'Trouvez les meilleurs professionnels près de chez vous : restaurants, plombiers, coiffeurs, garages et bien plus. Avis vérifiés, horaires, coordonnées et actualités des commerces locaux.',
  email: 'contact@autourdemoi.site',
  phone: '+33 1 84 80 00 00',
  twitterHandle: '@autourdemoi',
  organization: {
    legalName: 'Autour de Moi SAS',
    address: {
      street: '12 rue de la République',
      postalCode: '75011',
      city: 'Paris',
      country: 'FR',
    },
  },
  /** Nombre d'éléments par page sur les listings. */
  defaultPerPage: 12,
  /** Priorité et fréquence par défaut du sitemap. */
  sitemap: {
    homePriority: 1,
    listingPriority: 0.8,
    businessPriority: 0.7,
  },
} as const

export type SiteConfig = typeof siteConfig
