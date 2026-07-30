import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Les URLs de filtres et de tri sont exclues : elles dupliquent le
        // contenu des pages catégorie et ville, qui portent le référencement.
        disallow: ['/entreprises?', '/*?tri=', '/*?note=', '/*?categorie=', '/*?ville='],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
